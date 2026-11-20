// Athlete setup wizard — Phase A + sport presets
import { getProfile } from './auth.js';
import { upsertAthleteProfile } from './supabase.js';
import {
  refreshDbAthleteProfile,
  getDbAthleteProfile,
  resolveAthleteUserId,
  chromeFlagsForSportMode,
} from './athlete-profile.js';
import {
  weekTemplateForSportMode,
  goalForSportMode,
  deriveSportMode,
  seedPlansFromProfile,
} from './plan-seed.js';
import { setButtonLoading } from './spinner.js';

const DAY_LABELS = [
  { weekday: 1, name: 'Mon' },
  { weekday: 2, name: 'Tue' },
  { weekday: 3, name: 'Wed' },
  { weekday: 4, name: 'Thu' },
  { weekday: 5, name: 'Fri' },
  { weekday: 6, name: 'Sat' },
  { weekday: 0, name: 'Sun' },
];

const DAY_TYPES = ['Gym', 'Run', 'Bodyweight', 'Active Recovery', 'Rest'];

const SPORT_LABELS = {
  gym: 'Gym-only',
  run: 'Run-only',
  hybrid: 'Hybrid',
};

const GOAL_LABELS = {
  general: 'General fitness',
  fat_loss: 'Fat loss',
  recomp: 'Recomp',
  strength: 'Strength',
  endurance: 'Endurance',
};

const WEEK_TYPE_SHORT = {
  'Active Recovery': 'Recovery',
  Bodyweight: 'BW',
};

const WEEK_DAY_ORDER = [
  { weekday: 1, name: 'Mon' },
  { weekday: 2, name: 'Tue' },
  { weekday: 3, name: 'Wed' },
  { weekday: 4, name: 'Thu' },
  { weekday: 5, name: 'Fri' },
  { weekday: 6, name: 'Sat' },
  { weekday: 0, name: 'Sun' },
];

const CREATE_LEAD = 'Pick how you train, set targets, then logging makes sense.';
const EDIT_LEAD = 'Updates apply when you save. Days that already have a plan stay as they are.';

let onCompleteCallback = null;
let editMode = false;
let screenMode = 'create';
let selectedSportMode = 'gym';

/** Read-only copy for the Targets summary, Plan link, and account rows. */
export function describeTargets(profile) {
  if (!profile) {
    return {
      training: '—',
      protein: '—',
      calories: '—',
      week: '—',
      link: 'Targets',
      hint: '',
    };
  }

  const mode = deriveSportMode(profile);
  const sport = SPORT_LABELS[mode] || 'Gym-only';
  const goal = GOAL_LABELS[profile.goal_primary] || 'General fitness';
  const protein = Number(profile.protein_target_g);
  const proteinText = Number.isFinite(protein) ? `${protein}g` : '—';
  const train = Number(profile.calorie_target_training);
  const rest = Number(profile.calorie_target_rest);
  const calories = `${Number.isFinite(train) ? train.toLocaleString() : '—'} training · ${Number.isFinite(rest) ? rest.toLocaleString() : '—'} rest`;
  const template = profile.week_template?.length
    ? profile.week_template
    : weekTemplateForSportMode(mode, profile.default_session_window || 'morning');
  const week = WEEK_DAY_ORDER.map(({ weekday, name }) => {
    const entry = template.find((e) => Number(e.weekday) === weekday);
    const type = entry?.day_type || 'Rest';
    return `${name} ${WEEK_TYPE_SHORT[type] || type}`;
  }).join(' · ');

  return {
    training: `${sport} · ${goal}`,
    protein: proteinText,
    calories,
    week,
    link: proteinText === '—' ? `Targets · ${sport}` : `Targets · ${proteinText} · ${sport}`,
    hint: proteinText === '—' ? sport : `${proteinText} · ${sport}`,
  };
}

function setupScreen() {
  return document.getElementById('setup-screen');
}

function showSetupScreen() {
  setupScreen()?.classList.add('show');
  document.querySelector('.app-container')?.classList.add('hidden');
  document.querySelector('.bottom-nav')?.classList.add('hidden');
}

function hideSetupScreen() {
  setupScreen()?.classList.remove('show');
}

function leaveSetupScreen() {
  hideSetupScreen();
  document.querySelector('.app-container')?.classList.remove('hidden');
  document.querySelector('.bottom-nav')?.classList.remove('hidden');
}

function renderSummary() {
  const described = describeTargets(getDbAthleteProfile());
  const training = document.getElementById('setup-sum-training');
  const protein = document.getElementById('setup-sum-protein');
  const calories = document.getElementById('setup-sum-calories');
  const week = document.getElementById('setup-sum-week');
  if (training) training.textContent = described.training;
  if (protein) protein.textContent = described.protein;
  if (calories) calories.textContent = described.calories;
  if (week) week.textContent = described.week;
}

function applyScreenMode(mode) {
  screenMode = mode;
  const isCreate = mode === 'create';
  const isView = mode === 'view';
  const isEditing = mode === 'editing';

  document.getElementById('setup-summary')?.classList.toggle('hidden', !isView);
  document.getElementById('setup-form')?.classList.toggle('hidden', isView);
  document.getElementById('setup-close')?.classList.toggle('hidden', isCreate);
  document.getElementById('setup-cancel')?.classList.toggle('hidden', !isEditing);
  document.getElementById('setup-use-defaults')?.classList.toggle('hidden', !isCreate);

  const title = document.getElementById('setup-title');
  if (title) title.textContent = isCreate ? 'Set up your plan' : 'Targets';

  const lead = document.getElementById('setup-lead');
  if (lead) {
    lead.classList.toggle('hidden', isView);
    lead.textContent = isCreate ? CREATE_LEAD : EDIT_LEAD;
  }

  const submit = document.getElementById('setup-submit');
  if (submit && !submit.classList.contains('is-loading')) {
    submit.textContent = isCreate ? 'Save & continue' : 'Save';
  }

  if (isView) renderSummary();
  setupScreen()?.scrollTo?.(0, 0);
}

function readTemplateFromForm() {
  return DAY_LABELS.map(({ weekday }) => {
    const typeEl = document.getElementById(`setup-day-type-${weekday}`);
    const winEl = document.getElementById(`setup-day-window-${weekday}`);
    const labelEl = document.getElementById(`setup-day-label-${weekday}`);
    const day_type = typeEl?.value || 'Rest';
    const isTraining = day_type === 'Gym' || day_type === 'Run' || day_type === 'Bodyweight';
    return {
      weekday,
      day_type,
      session_window: isTraining ? (winEl?.value || 'morning') : null,
      label: labelEl?.value?.trim() || null,
    };
  });
}

function applyTemplateToForm(template) {
  const list = Array.isArray(template) && template.length
    ? template
    : weekTemplateForSportMode(selectedSportMode, 'morning');
  for (const { weekday } of DAY_LABELS) {
    const entry = list.find((e) => Number(e.weekday) === weekday) || {
      day_type: 'Rest',
      session_window: null,
      label: null,
    };
    const typeEl = document.getElementById(`setup-day-type-${weekday}`);
    const winEl = document.getElementById(`setup-day-window-${weekday}`);
    const labelEl = document.getElementById(`setup-day-label-${weekday}`);
    if (typeEl) typeEl.value = entry.day_type || 'Rest';
    if (winEl) {
      winEl.value = entry.session_window || 'morning';
      winEl.disabled = entry.day_type === 'Rest' || entry.day_type === 'Active Recovery';
    }
    if (labelEl) labelEl.value = entry.label || '';
  }
}

function setSportModeUI(mode) {
  selectedSportMode = mode === 'run' || mode === 'hybrid' ? mode : 'gym';
  document.querySelectorAll('.setup-preset').forEach((btn) => {
    const active = btn.dataset.sportMode === selectedSportMode;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-pressed', String(active));
  });
}

function applySportPreset(mode, { overwriteGoal = true } = {}) {
  setSportModeUI(mode);
  const window = document.getElementById('setup-session-window')?.value || 'morning';
  applyTemplateToForm(weekTemplateForSportMode(selectedSportMode, window));
  const goalEl = document.getElementById('setup-goal');
  if (overwriteGoal && goalEl) {
    goalEl.value = goalForSportMode(selectedSportMode);
  }
}

function fillFormFromProfile(profile) {
  const authName = getProfile()?.display_name || '';
  document.getElementById('setup-display-name').value =
    profile?.display_name || authName || '';
  const mode = deriveSportMode(profile);
  setSportModeUI(mode);
  document.getElementById('setup-goal').value = profile?.goal_primary || goalForSportMode(mode);
  document.getElementById('setup-diet').value = profile?.diet_style || 'veg';
  document.getElementById('setup-weight').value = profile?.starting_weight_kg ?? '';
  document.getElementById('setup-protein').value = profile?.protein_target_g ?? 120;
  document.getElementById('setup-cal-training').value = profile?.calorie_target_training ?? 2000;
  document.getElementById('setup-cal-rest').value = profile?.calorie_target_rest ?? 1800;
  document.getElementById('setup-session-window').value =
    profile?.default_session_window || 'morning';
  document.getElementById('setup-injuries').value = profile?.injuries_notes || '';
  applyTemplateToForm(profile?.week_template?.length
    ? profile.week_template
    : weekTemplateForSportMode(mode, profile?.default_session_window || 'morning'));
}

function collectProfilePayload({ markComplete }) {
  const defaultWindow = document.getElementById('setup-session-window').value || 'morning';
  let week_template = readTemplateFromForm();
  week_template = week_template.map((e) => {
    const isTraining = e.day_type === 'Gym' || e.day_type === 'Run' || e.day_type === 'Bodyweight';
    return {
      ...e,
      session_window: isTraining ? (e.session_window || defaultWindow) : null,
    };
  });

  const protein = parseInt(document.getElementById('setup-protein').value, 10);
  const calTrain = parseInt(document.getElementById('setup-cal-training').value, 10);
  const calRest = parseInt(document.getElementById('setup-cal-rest').value, 10);
  const weightRaw = document.getElementById('setup-weight').value;
  const chrome = chromeFlagsForSportMode(selectedSportMode);

  return {
    display_name: document.getElementById('setup-display-name').value.trim() || 'Athlete',
    goal_primary: document.getElementById('setup-goal').value || goalForSportMode(selectedSportMode),
    sport_mode: selectedSportMode,
    diet_style: document.getElementById('setup-diet').value || 'veg',
    starting_weight_kg: weightRaw ? parseFloat(weightRaw) : null,
    protein_target_g: Number.isFinite(protein) ? protein : 120,
    calorie_target_training: Number.isFinite(calTrain) ? calTrain : 2000,
    calorie_target_rest: Number.isFinite(calRest) ? calRest : 1800,
    default_session_window: defaultWindow,
    injuries_notes: document.getElementById('setup-injuries').value.trim() || null,
    week_template,
    ui_flags: {
      showRunningTrends: chrome.showRunningTrends,
      showLifts: chrome.showLifts,
      showKneeTracking: chrome.showKneeTracking,
      showRaceCountdown: chrome.showRaceCountdown,
    },
    setup_completed_at: markComplete ? new Date().toISOString() : null,
  };
}

function validateForm() {
  const name = document.getElementById('setup-display-name').value.trim();
  const protein = parseInt(document.getElementById('setup-protein').value, 10);
  const calTrain = parseInt(document.getElementById('setup-cal-training').value, 10);
  const calRest = parseInt(document.getElementById('setup-cal-rest').value, 10);
  if (!selectedSportMode) return 'Pick Gym-only, Run-only, or Hybrid';
  if (!name) return 'Enter your name';
  if (!Number.isFinite(protein) || protein < 40) return 'Protein target looks too low';
  if (!Number.isFinite(calTrain) || calTrain < 800) return 'Training calories look too low';
  if (!Number.isFinite(calRest) || calRest < 800) return 'Rest calories look too low';
  return null;
}

function renderWeekTemplateRows() {
  const container = document.getElementById('setup-week-template');
  if (!container || container.dataset.ready === '1') return;
  container.innerHTML = DAY_LABELS.map(({ weekday, name }) => `
    <div class="setup-day-row" data-weekday="${weekday}">
      <span class="setup-day-name">${name}</span>
      <select class="form-input setup-day-type" id="setup-day-type-${weekday}" aria-label="${name} day type">
        ${DAY_TYPES.map((t) => `<option value="${t}">${t}</option>`).join('')}
      </select>
      <select class="form-input setup-day-window" id="setup-day-window-${weekday}" aria-label="${name} session time">
        <option value="morning">Morning</option>
        <option value="evening">Evening</option>
      </select>
      <input type="text" class="form-input setup-day-label" id="setup-day-label-${weekday}"
        placeholder="Label" maxlength="40" aria-label="${name} label">
    </div>
  `).join('');
  container.dataset.ready = '1';

  for (const { weekday } of DAY_LABELS) {
    document.getElementById(`setup-day-type-${weekday}`)?.addEventListener('change', (e) => {
      const win = document.getElementById(`setup-day-window-${weekday}`);
      const rest = e.target.value === 'Rest' || e.target.value === 'Active Recovery';
      if (win) win.disabled = rest;
    });
  }
}

async function saveSetup({ markComplete, seed }) {
  const errEl = document.getElementById('setup-error');
  if (errEl) errEl.textContent = '';
  const error = validateForm();
  if (error) {
    if (errEl) errEl.textContent = error;
    return false;
  }

  const payload = collectProfilePayload({ markComplete });
  let ok = await upsertAthleteProfile(payload);
  if (!ok) {
    // sport_mode / ui_flags columns may be missing — retry without them
    const { sport_mode, ui_flags, ...fallback } = payload;
    ok = await upsertAthleteProfile(fallback);
    if (!ok) {
      if (errEl) {
        errEl.textContent = 'Could not save profile. Run athlete-profiles.sql (and athlete-profiles-sport-mode.sql) in Supabase, then retry.';
      }
      return false;
    }
  }

  await refreshDbAthleteProfile();
  const profile = getDbAthleteProfile();

  if (seed && profile) {
    await seedPlansFromProfile(profile, { days: 14 });
  }

  document.dispatchEvent(new CustomEvent('coach-account-refresh'));
  return true;
}

/**
 * @param {{ onComplete: Function }} opts
 */
export function initSetup({ onComplete } = {}) {
  onCompleteCallback = onComplete || null;
  renderWeekTemplateRows();

  document.querySelectorAll('.setup-preset').forEach((btn) => {
    btn.addEventListener('click', () => {
      applySportPreset(btn.dataset.sportMode || 'gym', { overwriteGoal: !editMode });
    });
  });

  document.getElementById('setup-session-window')?.addEventListener('change', () => {
    // Keep day windows aligned when default window changes and template still matches preset shape
    const window = document.getElementById('setup-session-window').value || 'morning';
    const template = readTemplateFromForm();
    const preset = weekTemplateForSportMode(selectedSportMode, window);
    const sameShape = template.every((e, i) => e.day_type === preset[i]?.day_type);
    if (sameShape) applyTemplateToForm(preset);
  });

  document.getElementById('setup-submit')?.addEventListener('click', async () => {
    const btn = document.getElementById('setup-submit');
    const idleLabel = screenMode === 'create' ? 'Save & continue' : 'Save';
    setButtonLoading(btn, true, idleLabel);
    try {
      const ok = await saveSetup({ markComplete: true, seed: true });
      if (!ok) return;
      if (screenMode === 'editing') {
        applyScreenMode('view');
        document.getElementById('setup-close')?.focus();
      } else {
        hideSetupScreen();
        onCompleteCallback?.({ editMode });
      }
    } finally {
      setButtonLoading(btn, false, idleLabel);
    }
  });

  // Soft gate: apply selected preset defaults (never force all-gym if run/hybrid chosen)
  document.getElementById('setup-use-defaults')?.addEventListener('click', async () => {
    const btn = document.getElementById('setup-use-defaults');
    setButtonLoading(btn, true, 'Use preset defaults');
    try {
      if (!document.getElementById('setup-display-name').value.trim()) {
        document.getElementById('setup-display-name').value =
          getProfile()?.display_name || 'Athlete';
      }
      if (!document.getElementById('setup-protein').value) {
        document.getElementById('setup-protein').value = '120';
      }
      if (!document.getElementById('setup-cal-training').value) {
        document.getElementById('setup-cal-training').value = '2000';
      }
      if (!document.getElementById('setup-cal-rest').value) {
        document.getElementById('setup-cal-rest').value = '1800';
      }
      applySportPreset(selectedSportMode || 'gym', { overwriteGoal: true });
      const ok = await saveSetup({ markComplete: true, seed: true });
      if (ok) {
        hideSetupScreen();
        onCompleteCallback?.({ editMode, skipped: true });
      }
    } finally {
      setButtonLoading(btn, false, 'Use preset defaults');
    }
  });

  document.getElementById('setup-edit')?.addEventListener('click', () => {
    applyScreenMode('editing');
  });

  document.getElementById('setup-cancel')?.addEventListener('click', () => {
    const profile = getDbAthleteProfile();
    if (profile) fillFormFromProfile(profile);
    applyScreenMode('view');
    document.getElementById('setup-close')?.focus();
  });

  document.getElementById('setup-close')?.addEventListener('click', () => {
    const profile = getDbAthleteProfile();
    if (profile) fillFormFromProfile(profile);
    leaveSetupScreen();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !isSetupVisible()) return;
    if (screenMode === 'editing') {
      document.getElementById('setup-cancel')?.click();
      return;
    }
    if (screenMode === 'view') document.getElementById('setup-close')?.click();
  });
}

export function openSetup({ edit = false } = {}) {
  editMode = edit;
  renderWeekTemplateRows();
  const profile = getDbAthleteProfile();
  if (profile) {
    fillFormFromProfile(profile);
  } else {
    fillFormFromProfile(null);
    applySportPreset('gym', { overwriteGoal: true });
  }
  applyScreenMode(edit ? 'view' : 'create');
  showSetupScreen();
  if (edit) document.getElementById('setup-close')?.focus();
}

export function isSetupVisible() {
  return setupScreen()?.classList.contains('show');
}

export { resolveAthleteUserId };
