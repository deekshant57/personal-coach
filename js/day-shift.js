// Day-shift — move / skip / complete session + meal slot remap (Phase A)
import { SLOT_LABELS } from './data.js';
import { state, getToday, showToast, showConfirm } from './app.js';
import {
  patchDailyPlan,
  fetchFoodLogs,
  upsertFoodLog,
  deleteFoodLog,
} from './supabase.js';
import { invalidateFoodLogsCache, loadFoodData } from './food.js';
import {
  isTrainingDayType,
  effectiveSlotScheme,
  effectiveSessionWindow as resolveSessionWindow,
  eveningTrainingSlots,
  slotsForPlan as resolveSlotsForPlan,
  postSlotForScheme,
} from './meal-slots.js';
import {
  isPostAbsorbedIntoDinner,
  shouldShowEveningPostSlot,
} from './planned-meals.js';

export {
  isTrainingDayType,
  effectiveSlotScheme,
  eveningTrainingSlots,
};

export function effectiveSessionWindow(plan = state.currentPlan) {
  return resolveSessionWindow(plan);
}

export function slotsForPlan(plan) {
  return resolveSlotsForPlan(plan);
}

/** True when planned vs actual session window differ (move / late log). */
export function sessionWindowDiffers(plan = state.currentPlan) {
  if (!plan || !isTrainingDayType(plan.day_type)) return false;
  const actual = plan.actual_session_window;
  const planned = plan.planned_session_window || 'morning';
  if (!actual || actual === 'skipped') return false;
  if (planned === 'flexible') return false;
  return actual !== planned;
}

/** Display label for a meal slot — qualifies pre/post when training is evening. */
export function formatSlotLabel(slot, plan = state.currentPlan) {
  const base = SLOT_LABELS[slot] || slot;
  if (!plan) return base;

  const isPre = slot === 'pre-workout' || slot === 'pre-run';
  const isPost = slot === 'post-workout' || slot === 'post-run';
  if (!isPre && !isPost) return base;

  const window = effectiveSessionWindow(plan);
  if (window === 'evening') {
    if (isPre) return base.startsWith('Pre-run') ? 'Pre-run · eve' : 'Pre · eve';
    return base.startsWith('Post-run') ? 'Post-run · eve' : 'Post · eve';
  }
  if (!sessionWindowDiffers(plan)) return base;

  const actual = plan.actual_session_window;
  const windowWord = actual === 'evening' ? 'eve' : actual === 'morning' ? 'am' : actual;
  return `${isPre ? (base.startsWith('Pre-run') ? 'Pre-run' : 'Pre') : (base.startsWith('Post-run') ? 'Post-run' : 'Post')} · ${windowWord}`;
}

/** Slot label map for food analysis / debrief (keys unchanged). */
export function slotLabelsForPlan(plan = state.currentPlan) {
  const labels = { ...SLOT_LABELS };
  for (const slot of slotsForPlan(plan)) {
    labels[slot] = formatSlotLabel(slot, plan);
  }
  return labels;
}

/** One-line Food tab hint when session was moved or planned evening. */
export function sessionTimingHint(plan = state.currentPlan) {
  if (!plan) return '';
  const window = effectiveSessionWindow(plan);
  if (window === 'evening') {
    const showPost = shouldShowEveningPostSlot(plan.meals_plan);
    if (sessionWindowDiffers(plan)) {
      return showPost
        ? 'Session moved to evening — Breakfast for morning; Pre/Post for the evening session.'
        : 'Session moved to evening — Breakfast for morning; Dinner is the post-session meal.';
    }
    return showPost
      ? 'Evening session — Breakfast for morning; Pre/Post around training.'
      : 'Evening session — Breakfast for morning; Dinner is the post-session meal.';
  }
  if (!sessionWindowDiffers(plan)) return '';
  const planned = plan.planned_session_window || 'morning';
  const actual = plan.actual_session_window;
  if (actual === 'morning' && planned === 'evening') {
    return 'Session moved to morning — Pre/Post for the morning session.';
  }
  return `Planned ${planned} · training ${actual} — pre/post slots still apply.`;
}

/** Map training meal slots → rest-day slots (lossy for post-* → lunch merge). */
export function remapSlotName(slot, toRest, dayType) {
  if (toRest) {
    if (slot === 'pre-run' || slot === 'pre-workout') return 'breakfast';
    if (slot === 'post-run' || slot === 'post-workout') return 'lunch';
    return slot;
  }
  const pre = dayType === 'Run' ? 'pre-run' : 'pre-workout';
  const post = dayType === 'Run' ? 'post-run' : 'post-workout';
  if (slot === 'breakfast') return pre;
  if (slot === 'lunch') return 'lunch'; // post was merged; leave lunch
  return slot;
}

function parseItems(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function mergeFoodLogs(a, b) {
  const itemsA = parseItems(a.items);
  const itemsB = parseItems(b.items);
  const byKey = new Map();
  for (const item of [...itemsA, ...itemsB]) {
    const key = item.id || item.name;
    if (!key) continue;
    const prev = byKey.get(key);
    if (prev) {
      byKey.set(key, { ...prev, qty: (prev.qty || 1) + (item.qty || 1) });
    } else {
      byKey.set(key, { ...item });
    }
  }
  const items = [...byKey.values()];
  const totalProtein = items.reduce((s, i) => s + (i.protein || 0) * (i.qty || 1), 0)
    || (Number(a.total_protein) || 0) + (Number(b.total_protein) || 0);
  const totalCalories = items.reduce((s, i) => s + (i.calories || 0) * (i.qty || 1), 0)
    || (Number(a.total_calories) || 0) + (Number(b.total_calories) || 0);
  const notes = [a.custom_text, b.custom_text, 'merged on day-shift']
    .filter(Boolean)
    .join(' · ');
  return {
    items,
    custom_text: notes,
    total_protein: totalProtein,
    total_calories: totalCalories,
  };
}

/**
 * Remap food_logs for date from one slot scheme to another.
 * Returns { moved, merged }.
 */
export async function remapFoodSlotsForDate(date, fromScheme, toScheme, dayType) {
  if (fromScheme === toScheme) return { moved: 0, merged: 0 };
  const toRest = toScheme === 'Rest' || toScheme === 'Active Recovery';
  const fromRest = fromScheme === 'Rest' || fromScheme === 'Active Recovery';
  if (toRest === fromRest && fromScheme !== toScheme) {
    // e.g. Gym ↔ Run — remap pre/post names
  }

  const logs = await fetchFoodLogs(date);
  if (!logs.length) return { moved: 0, merged: 0 };

  const targetBuckets = new Map();
  const oldSlots = [];

  for (const log of logs) {
    const newSlot = remapSlotName(log.meal_slot, toRest && !fromRest, dayType);
    // Gym ↔ Run: rename pre/post
    let dest = newSlot;
    if (!toRest && !fromRest && fromScheme !== toScheme) {
      if (log.meal_slot === 'pre-run' || log.meal_slot === 'pre-workout') {
        dest = dayType === 'Run' ? 'pre-run' : 'pre-workout';
      } else if (log.meal_slot === 'post-run' || log.meal_slot === 'post-workout') {
        dest = dayType === 'Run' ? 'post-run' : 'post-workout';
      }
    }
    oldSlots.push(log.meal_slot);
    const existing = targetBuckets.get(dest);
    if (existing) {
      targetBuckets.set(dest, mergeFoodLogs(existing, log));
    } else {
      targetBuckets.set(dest, {
        items: parseItems(log.items),
        custom_text: log.custom_text,
        total_protein: log.total_protein,
        total_calories: log.total_calories,
      });
    }
  }

  // Write new slots first, then delete obsolete keys
  let moved = 0;
  let merged = 0;
  for (const [slot, payload] of targetBuckets) {
    const ok = await upsertFoodLog(
      date,
      slot,
      payload.items,
      payload.custom_text,
      payload.total_protein,
      payload.total_calories
    );
    if (ok) moved += 1;
  }

  for (const old of new Set(oldSlots)) {
    if (!targetBuckets.has(old)) {
      await deleteFoodLog(date, old);
      merged += 1;
    }
  }

  invalidateFoodLogsCache();
  return { moved, merged };
}

async function persistPlanPatch(date, fields) {
  const ok = await patchDailyPlan(date, fields);
  if (!ok) {
    showToast('Could not update session', { variant: 'error' });
    return false;
  }
  if (state.currentPlan && getToday() === date) {
    state.currentPlan = { ...state.currentPlan, ...fields };
  }
  return true;
}

/**
 * Merge food from one meal_slot into another, then delete the source.
 * Preserves macros (mergeFoodLogs). No-op if source empty.
 */
async function mergeSlotLogsInto(date, logs, fromSlot, toSlot) {
  if (fromSlot === toSlot) return false;
  const fromLog = (logs || []).find((l) => l.meal_slot === fromSlot);
  if (!fromLog) return false;
  const fromItems = parseItems(fromLog.items);
  const fromNotes = (fromLog.custom_text || '').trim();
  if (!fromItems.length && !fromNotes) return false;

  const toLog = (logs || []).find((l) => l.meal_slot === toSlot);
  const merged = toLog
    ? mergeFoodLogs(toLog, fromLog)
    : {
      items: fromItems,
      custom_text: fromNotes || null,
      total_protein: fromLog.total_protein,
      total_calories: fromLog.total_calories,
    };

  const ok = await upsertFoodLog(
    date,
    toSlot,
    merged.items,
    merged.custom_text,
    merged.total_protein,
    merged.total_calories,
  );
  if (!ok) return false;
  await deleteFoodLog(date, fromSlot);
  return true;
}

/**
 * Morning↔evening window moves: migrate logs so disappearing pills do not orphan food.
 * - Morning → evening + post absorbed: post → dinner
 * - Evening → morning: breakfast → post
 */
export async function migrateFoodLogsForSessionWindow(date, plan, fromWindow, toWindow) {
  if (!plan || fromWindow === toWindow) return { migrated: false };
  const scheme = effectiveSlotScheme(plan);
  const post = postSlotForScheme(scheme === 'Rest' ? plan.day_type : scheme);
  const logs = await fetchFoodLogs(date);
  if (!logs?.length) return { migrated: false };

  let migrated = false;

  if (fromWindow !== 'evening' && toWindow === 'evening') {
    if (isPostAbsorbedIntoDinner(plan.meals_plan)) {
      migrated = await mergeSlotLogsInto(date, logs, post, 'dinner') || migrated;
    }
  }

  if (fromWindow === 'evening' && toWindow === 'morning') {
    migrated = await mergeSlotLogsInto(date, logs, 'breakfast', post) || migrated;
  }

  if (migrated) invalidateFoodLogsCache();
  return { migrated };
}

export async function moveSession(date, toWindow) {
  const plan = state.currentPlan;
  if (!plan || !isTrainingDayType(plan.day_type)) return false;

  const fromWindow = effectiveSessionWindow(plan) || 'morning';

  const fields = {
    actual_session_window: toWindow,
    session_status: 'moved',
    // Keep training meal slots — only window changes
    slot_scheme: plan.slot_scheme || plan.day_type,
  };

  const ok = await persistPlanPatch(date, fields);
  if (ok) {
    if (fromWindow !== toWindow) {
      await migrateFoodLogsForSessionWindow(date, plan, fromWindow, toWindow);
      await loadFoodData();
    }
    showToast(`Session moved to ${toWindow}`);
  }
  return ok;
}

/**
 * @param {'rest'|'keep'} slotMode — rest remaps to breakfast/lunch; keep keeps training slots
 */
export async function skipSession(date, slotMode = 'rest') {
  const plan = state.currentPlan;
  if (!plan || !isTrainingDayType(plan.day_type)) return false;

  const fromScheme = effectiveSlotScheme(plan);
  const toScheme = slotMode === 'rest' ? 'Rest' : plan.day_type;

  if (slotMode === 'rest' && fromScheme !== 'Rest') {
    await remapFoodSlotsForDate(date, fromScheme, 'Rest', plan.day_type);
    await loadFoodData();
  }

  const fields = {
    actual_session_window: 'skipped',
    session_status: 'skipped',
    slot_scheme: toScheme,
  };

  const ok = await persistPlanPatch(date, fields);
  if (ok) {
    showToast(slotMode === 'rest'
      ? 'Session skipped · meals use rest slots'
      : 'Session skipped · training meal slots kept');
  }
  return ok;
}

export async function markSessionCompleted(date) {
  const plan = state.currentPlan;
  if (!plan || !isTrainingDayType(plan.day_type)) return true;

  const window = plan.actual_session_window
    || plan.planned_session_window
    || 'morning';

  if (plan.session_status === 'skipped') return true;

  return persistPlanPatch(date, {
    actual_session_window: window === 'skipped' ? (plan.planned_session_window || 'morning') : window,
    session_status: plan.session_status === 'moved' ? 'moved' : 'completed',
  });
}

export async function resetDaySchedule(date) {
  const plan = state.currentPlan;
  if (!plan) return false;

  const logs = await fetchFoodLogs(date);
  const hasFood = (logs || []).some((l) => {
    const items = parseItems(l.items);
    return items.length > 0 || !!l.custom_text;
  });

  if (hasFood) {
    const ok = await showConfirm(
      'Food logs stay in current meal slots. Only session timing status resets to planned.',
      {
        title: 'Reset day schedule?',
        okLabel: 'Reset status',
      }
    );
    if (!ok) return false;
  }

  const fields = {
    actual_session_window: null,
    session_status: 'planned',
    slot_scheme: null,
  };

  const saved = await persistPlanPatch(date, fields);
  if (saved) {
    showToast('Schedule reset to planned');
    await loadFoodData();
  }
  return saved;
}

export function sessionStatusLabel(plan) {
  if (!plan || !isTrainingDayType(plan.day_type)) return null;
  const status = plan.session_status || 'planned';
  const planned = plan.planned_session_window || 'morning';
  const actual = plan.actual_session_window;

  if (status === 'skipped') return 'Session skipped';
  if (status === 'moved' && actual) {
    return `Planned ${planned} · actual ${actual}`;
  }
  if (status === 'completed' && actual && actual !== planned) {
    return `Completed (${actual}; planned ${planned})`;
  }
  if (status === 'completed') return null;
  if (planned && planned !== 'flexible') {
    return `Planned ${planned}`;
  }
  return null;
}

export function renderSessionStatusChip(plan) {
  const el = document.getElementById('session-status-chip');
  if (!el) return;
  const label = sessionStatusLabel(plan);
  const noteworthy = plan
    && (plan.session_status === 'moved'
      || plan.session_status === 'skipped'
      || (plan.actual_session_window
        && plan.planned_session_window
        && plan.actual_session_window !== plan.planned_session_window));

  if (!label || !noteworthy) {
    el.textContent = '';
    el.classList.add('hidden');
    return;
  }
  el.textContent = label;
  el.classList.remove('hidden');
}

export function updateDayShiftControls(plan) {
  const wrap = document.getElementById('day-shift-controls');
  if (!wrap) return;

  const show = plan && isTrainingDayType(plan.day_type);

  if (!show) {
    wrap.classList.add('hidden');
    renderSessionStatusChip(null);
    return;
  }

  wrap.classList.remove('hidden');

  const planned = plan.planned_session_window || 'morning';
  const status = plan.session_status || 'planned';
  const actual = plan.actual_session_window;
  const moveEve = document.getElementById('day-shift-evening');
  const moveMorn = document.getElementById('day-shift-morning');
  const skipBtn = document.getElementById('day-shift-skip');
  const resetBtn = document.getElementById('day-shift-reset');
  const actions = wrap.querySelector('.day-shift-actions');
  const labelEl = wrap.querySelector('.day-shift-label');

  // Hide a move action once the session is already in that window —
  // planned and still on plan, or already moved/completed there.
  const alreadyEvening = actual === 'evening' || (planned === 'evening' && status === 'planned');
  const alreadyMorning = actual === 'morning' || (planned === 'morning' && status === 'planned');
  const logDone = !!(state.workoutLog?.done || state.runLog?.done);
  const sessionDone = status === 'completed' || logDone;

  if (moveEve) {
    moveEve.classList.toggle('hidden', alreadyEvening);
    moveEve.disabled = status === 'skipped';
  }
  if (moveMorn) {
    moveMorn.classList.toggle('hidden', alreadyMorning);
    moveMorn.disabled = status === 'skipped';
  }
  if (skipBtn) {
    skipBtn.disabled = status === 'skipped';
    skipBtn.classList.toggle('hidden', sessionDone);
  }
  if (resetBtn) {
    resetBtn.classList.toggle('hidden', status === 'planned' && !plan.actual_session_window);
  }

  // Completed sessions: collapse schedule controls so Next Step / facts lead.
  wrap.classList.toggle('day-shift-controls--compact', sessionDone);
  if (labelEl) {
    labelEl.textContent = sessionDone ? 'Adjust schedule' : 'Session timing';
    if (sessionDone) {
      labelEl.setAttribute('role', 'button');
      labelEl.tabIndex = 0;
      labelEl.setAttribute('aria-expanded', String(wrap.classList.contains('day-shift-controls--open')));
    } else {
      labelEl.removeAttribute('role');
      labelEl.removeAttribute('tabindex');
      labelEl.removeAttribute('aria-expanded');
      wrap.classList.remove('day-shift-controls--open');
    }
  }
  if (actions && sessionDone && !wrap.dataset.shiftToggleBound) {
    const toggle = () => {
      wrap.classList.toggle('day-shift-controls--open');
      labelEl?.setAttribute('aria-expanded', String(wrap.classList.contains('day-shift-controls--open')));
    };
    labelEl?.addEventListener('click', toggle);
    labelEl?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
    wrap.dataset.shiftToggleBound = '1';
  }

  renderSessionStatusChip(plan);
}

export function initDayShiftControls({ onChanged } = {}) {
  const evening = document.getElementById('day-shift-evening');
  const morning = document.getElementById('day-shift-morning');
  const skip = document.getElementById('day-shift-skip');
  const reset = document.getElementById('day-shift-reset');

  evening?.addEventListener('click', async () => {
    if (await moveSession(getToday(), 'evening')) {
      updateDayShiftControls(state.currentPlan);
      onChanged?.();
    }
  });

  morning?.addEventListener('click', async () => {
    if (await moveSession(getToday(), 'morning')) {
      updateDayShiftControls(state.currentPlan);
      onChanged?.();
    }
  });

  skip?.addEventListener('click', async () => {
    const useRest = await showConfirm(
      'Use rest-day meal slots (breakfast instead of pre-workout)? Cancel keeps training meal slots.',
      {
        title: 'Skip session',
        okLabel: 'Use rest slots',
        cancelLabel: 'Keep training slots',
      }
    );
    if (await skipSession(getToday(), useRest ? 'rest' : 'keep')) {
      updateDayShiftControls(state.currentPlan);
      onChanged?.();
    }
  });

  reset?.addEventListener('click', async () => {
    if (await resetDaySchedule(getToday())) {
      updateDayShiftControls(state.currentPlan);
      onChanged?.();
    }
  });
}
