// Food tab — tap grid, meal slots, protein calculation
import { FOOD_ITEMS, SLOT_LABELS, formatFoodLabel, sumItemsMacros } from './data.js';
import {
  resolveLogItems,
  itemFromNotesOnly,
  needsMacroResolve,
  formatMealMacroLabel,
  analyzeDayFoodLogs,
  escapeHtml,
  isCustomFoodItem,
  macrosFromResolvedLog,
} from './food-macros.js';
import { autoResolveFoodLogsForDate } from './food-resolve.js';
import { state, getToday, getCurrentMealSlots, showToast, showConfirm, isViewingFuture, formatDate } from './app.js';
import { upsertFoodLog, fetchFoodLogs, deleteFoodLog, fetchWeekFoodLogs } from './supabase.js';
import { loadMealsSummary } from './today.js';
import { setOverlayLoading, setButtonLoading } from './spinner.js';
import { trackSave } from './save-state.js';
import {
  loadUserFoodLibrary,
  libraryAsFoodItems,
  saveFoodToLibrary,
  runOffSearch,
  runOffBarcode,
  escapeHtml as escapeLibHtml,
} from './food-library.js';
import {
  scheduleAutosave,
  cancelAutosave,
  cancelAutosavesByPrefix,
  flushAutosave,
  flushAutosavesByPrefix,
  registerAutosaveFlush,
  hasPendingAutosave,
} from './auto-save.js';
import { setupSheetFocusTrap } from './modal-focus.js';

// ── Local State ──────────────────────────────────────────────
let activeSlot = '';
let slotItems = {}; // { slotName: [{id, name, qty, protein, calories}] }
let slotNotes = {}; // { slotName: string }
let filledSlots = new Set();
let savedSnapshots = {}; // { slotName: JSON string of last saved state }
let dirtySlotResolve = null;
let editingCustomId = null;
let foodAutosaveSuspended = false;
let pendingConfirmDraft = null; // OFF / manual draft awaiting confirm
let addSheetTab = 'recent'; // recent | yours | staples
let recentFoodsCache = [];

let foodLogsCache = { date: null, logs: null };
let yesterdayLogsCache = { forDate: null, logs: null };

const FOOD_HINT_DISMISSED_KEY = 'food_hint_dismissed';
const SAME_AS_DISMISSED_PREFIX = 'same_as_dismissed';

function dismissFoodGridHint() {
  try {
    localStorage.setItem(FOOD_HINT_DISMISSED_KEY, '1');
  } catch {
    /* private browsing */
  }
  document.getElementById('food-grid-hint')?.classList.add('hidden');
}

function syncFoodGridHintVisibility() {
  const hint = document.getElementById('food-grid-hint');
  if (!hint) return;
  let dismissed = false;
  try {
    dismissed = localStorage.getItem(FOOD_HINT_DISMISSED_KEY) === '1';
  } catch {
    dismissed = false;
  }
  hint.classList.toggle('hidden', dismissed);
  if (!dismissed) {
    const q = (document.getElementById('food-search')?.value || '').trim();
    if (!q) hint.textContent = 'Tap ADD, then use − / + on the item';
  }
}

export function invalidateFoodLogsCache() {
  foodLogsCache = { date: null, logs: null };
}

export async function fetchFoodLogsForDate(date, { force = false } = {}) {
  if (!force && foodLogsCache.date === date && foodLogsCache.logs !== null) {
    return foodLogsCache.logs;
  }
  const logs = await fetchFoodLogs(date);
  foodLogsCache = { date, logs: logs || [] };
  return foodLogsCache.logs;
}

function foodSlotKey(date, slot) {
  return `food:${date}:${slot}`;
}

function isCustomItem(item) {
  return isCustomFoodItem(item);
}

// ── Init ─────────────────────────────────────────────────────
export function initFood() {
  setupCustomModal();
  setupMealSummaryActions();
  setupDirtySlotGuard();
  setupNotesPersistence();
  setupFoodSearch();
  setupFoodLookup();
  setupSameAsYesterday();
  setupClearSlot();
  setupAddFoodSheet();
  document.getElementById('next-meal')?.addEventListener('click', () => goToNextMeal());
  loadUserFoodLibrary()
    .then(() => refreshRecentFoods().then(() => renderFoodGrid()))
    .catch(() => renderFoodGrid());
  registerAutosaveFlush({ food: flushFoodAutosaves });
}

function getSlotPayload(slot) {
  const notes = slot === activeSlot
    ? document.getElementById('food-notes').value
    : (slotNotes[slot] || '');
  return {
    items: slotItems[slot] || [],
    customText: notes,
  };
}

async function persistFoodSlot(slot, { silent = true } = {}) {
  if (!slot || isViewingFuture() || foodAutosaveSuspended) return true;

  const date = getToday();
  const key = foodSlotKey(date, slot);
  const label = SLOT_LABELS[slot] || slot;

  return trackSave(key, label, async () => {
    const { items, customText } = getSlotPayload(slot);
    const trimmedNotes = customText.trim();
    const hadSaved = !!savedSnapshots[slot];

    if (items.length === 0 && !trimmedNotes) {
      if (!hadSaved) return true;
      await deleteFoodLog(date, slot);
      invalidateFoodLogsCache();
      delete slotItems[slot];
      delete slotNotes[slot];
      delete savedSnapshots[slot];
      filledSlots.delete(slot);
      updateSlotPillStates();
      renderSlotState();
      updateTotalProtein();
      await loadMealsSummary();
      return true;
    }

    const { items: resolvedItems } = resolveLogItems(items);
    const totalProtein = resolvedItems.reduce((s, i) => s + i.protein * i.qty, 0);
    const totalCalories = resolvedItems.reduce((s, i) => s + i.calories * i.qty, 0);
    const ok = await upsertFoodLog(date, slot, resolvedItems, trimmedNotes || null, totalProtein, totalCalories);
    if (!ok) return false;

    if (resolvedItems.length > 0 || trimmedNotes) {
      dismissFoodGridHint();
    }

    invalidateFoodLogsCache();
    slotItems[slot] = resolvedItems;

    filledSlots.add(slot);
    savedSnapshots[slot] = JSON.stringify({ items: resolvedItems, notes: customText });
    updateSlotPillStates();
    await loadMealsSummary();
    return true;
  }, { toastOnSuccess: !silent });
}

function scheduleFoodSlotAutosave(slot) {
  if (!slot || isViewingFuture() || foodAutosaveSuspended) return;
  const key = foodSlotKey(getToday(), slot);
  scheduleAutosave(key, async () => {
    await persistFoodSlot(slot, { silent: true });
  });
}

export async function flushFoodAutosaves() {
  await flushAutosavesByPrefix(`food:${getToday()}:`);
  persistActiveSlotNotes();
  for (const slot of getCurrentMealSlots()) {
    if (isSlotDirty(slot)) {
      await persistFoodSlot(slot, { silent: true });
    }
  }
}

export async function flushFoodSlot(slot) {
  if (!slot) return true;
  const key = foodSlotKey(getToday(), slot);
  if (hasPendingAutosave(key)) {
    await flushAutosave(key);
    return true;
  }
  if (isSlotDirty(slot)) {
    return persistFoodSlot(slot, { silent: true });
  }
  return true;
}

function notifyFoodChanged(slot = activeSlot) {
  renderSlotState();
  updateTotalProtein();
  scheduleFoodSlotAutosave(slot);
}

export async function loadFoodData() {
  const future = isViewingFuture();
  const previewBanner = document.getElementById('food-preview-banner');
  const planPreview = document.getElementById('food-plan-preview');
  const loggingIds = [
    'meal-slots', 'meal-hint', 'same-as-yesterday',
    'food-notes-group', 'meal-summary', 'food-sticky-footer', 'food-diary-block',
  ];

  if (future) {
    setOverlayLoading('food-loading-overlay', false);
    previewBanner?.classList.remove('hidden');
    loggingIds.forEach((id) => document.getElementById(id)?.classList.add('hidden'));
    if (planPreview) {
      planPreview.textContent = state.currentPlan?.meals_plan || 'No meal plan for this date';
      planPreview.classList.remove('hidden');
    }
    return;
  }

  previewBanner?.classList.add('hidden');
  planPreview?.classList.add('hidden');
  loggingIds.forEach((id) => document.getElementById(id)?.classList.remove('hidden'));
  syncFoodGridHintVisibility();

  const searchEl = document.getElementById('food-search');
  if (searchEl) searchEl.value = '';

  filledSlots.clear();
  loadSlots();

  setOverlayLoading('food-loading-overlay', true);
  try {
    await loadExistingLogs();
  } finally {
    setOverlayLoading('food-loading-overlay', false);
  }
}

function setupFoodSearch() {
  const searchEl = document.getElementById('food-search');
  searchEl?.addEventListener('input', () => {
    applyFoodSearchFilter();
  });
}

function countVisibleFoodItems() {
  let n = 0;
  document.querySelectorAll('#food-grid .food-item').forEach((el) => {
    if (!el.classList.contains('hidden') && !el.classList.contains('custom')) n += 1;
  });
  return n;
}

function applyFoodSearchFilter() {
  const q = (document.getElementById('food-search')?.value || '').trim().toLowerCase();
  let visible = 0;

  document.querySelectorAll('#food-grid .food-item').forEach((el) => {
    if (el.classList.contains('custom')) {
      const show = !q || 'custom'.includes(q) || 'add'.includes(q) || 'create'.includes(q);
      el.classList.toggle('hidden', !show);
      if (show) visible += 1;
      return;
    }
    const name = el.querySelector('.food-item-name')?.textContent?.toLowerCase() || '';
    const show = !q || name.includes(q);
    el.classList.toggle('hidden', !show);
    if (show) visible += 1;
  });

  document.querySelectorAll('#food-grid .food-sheet-empty').forEach((el) => {
    el.classList.toggle('hidden', !!q);
  });

  const emptyActions = document.getElementById('food-empty-actions');
  const hint = document.getElementById('food-grid-hint');
  const noLocal = q.length > 0 && countVisibleFoodItems() === 0;

  if (emptyActions) {
    emptyActions.classList.toggle('hidden', !noLocal);
  }
  hideLookupPanel();

  if (!hint) return;
  if (noLocal) {
    hint.textContent = 'No match in staples or Your foods.';
  } else if (!q) {
    hint.textContent = 'Tap ADD, then use − / + on the item';
  } else {
    hint.textContent = `${visible} item${visible === 1 ? '' : 's'}`;
  }
}

function hideLookupPanel() {
  document.getElementById('food-lookup-panel')?.classList.add('hidden');
}

function setupFoodLookup() {
  document.getElementById('food-empty-create')?.addEventListener('click', () => {
    const q = (document.getElementById('food-search')?.value || '').trim();
    openCustomModal(null, {
      title: 'Create custom',
      hint: 'Approve macros before adding. Save to Your foods for next time.',
      draft: { name: q, source: 'manual' },
    });
  });

  document.getElementById('food-empty-lookup')?.addEventListener('click', async () => {
    const q = (document.getElementById('food-search')?.value || '').trim();
    if (q.length < 2) {
      showToast('Type a packaged product name first');
      return;
    }
    await offerOffSearch(q);
  });

  document.getElementById('food-lookup-dismiss')?.addEventListener('click', hideLookupPanel);
  document.getElementById('food-barcode-go')?.addEventListener('click', async () => {
    const code = document.getElementById('food-barcode')?.value?.trim();
    if (!code) {
      showToast('Enter a barcode');
      return;
    }
    const btn = document.getElementById('food-barcode-go');
    setButtonLoading(btn, true, 'Scan code');
    try {
      const draft = await runOffBarcode(code);
      if (!draft) {
        showToast('Not found — add manually');
        openCustomModal(null, {
          title: 'Add Custom Item',
          hint: `Barcode ${code} not in Open Food Facts`,
          draft: { name: '', barcode: code, source: 'manual' },
        });
        return;
      }
      openCustomModal(null, {
        title: 'Confirm food',
        hint: 'Approve macros (per 100g unless edited). Save to Your foods for next time.',
        draft,
      });
    } finally {
      setButtonLoading(btn, false, 'Scan code');
    }
  });

  document.getElementById('food-lookup-results')?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-off-index]');
    if (!btn) return;
    const idx = parseInt(btn.dataset.offIndex, 10);
    const draft = window.__offResults?.[idx];
    if (!draft) return;
    openCustomModal(null, {
      title: 'Confirm food',
      hint: 'Approve macros before adding. Saved foods appear under Your foods.',
      draft,
    });
  });
}

async function offerOffSearch(query) {
  const panel = document.getElementById('food-lookup-panel');
  const results = document.getElementById('food-lookup-results');
  const title = document.getElementById('food-lookup-title');
  if (!panel || !results) return;

  panel.classList.remove('hidden');
  if (title) title.textContent = `Lookup: ${query}`;
  results.innerHTML = '<p class="text-muted">Searching Open Food Facts…</p>';

  const hits = await runOffSearch(query);
  window.__offResults = hits;
  if (!hits.length) {
    results.innerHTML = `
      <p class="text-muted">No results.</p>
      <button type="button" class="btn btn-secondary btn-sm" id="food-lookup-manual">Add manually</button>`;
    document.getElementById('food-lookup-manual')?.addEventListener('click', () => {
      openCustomModal(null, {
        title: 'Add Custom Item',
        draft: { name: query, source: 'manual' },
      });
    });
    return;
  }

  results.innerHTML = hits.map((h, i) => `
    <button type="button" class="food-lookup-item" data-off-index="${i}">
      <span class="food-lookup-name">${escapeLibHtml(h.name)}</span>
      <span class="food-lookup-macros">${h.protein}g P · ${h.calories} kcal / 100g</span>
      ${h.brand ? `<span class="text-muted">${escapeLibHtml(h.brand)}</span>` : ''}
    </button>`).join('');
}

function setupNotesPersistence() {
  document.getElementById('food-notes').addEventListener('input', () => {
    persistActiveSlotNotes();
    notifyFoodChanged();
  });
}

function persistActiveSlotNotes() {
  if (!activeSlot) return;
  slotNotes[activeSlot] = document.getElementById('food-notes').value;
}

function snapshotSlot(slot) {
  const notes = slot === activeSlot
    ? document.getElementById('food-notes').value
    : (slotNotes[slot] || '');
  return JSON.stringify({
    items: slotItems[slot] || [],
    notes,
  });
}

function isSlotDirty(slot) {
  if (!slot) return false;
  const current = snapshotSlot(slot);
  const saved = savedSnapshots[slot];
  if (!saved) {
    const items = slotItems[slot] || [];
    const notes = slot === activeSlot
      ? document.getElementById('food-notes').value
      : (slotNotes[slot] || '');
    return items.length > 0 || !!notes.trim();
  }
  return current !== saved;
}

function discardSlotChanges(slot) {
  const saved = savedSnapshots[slot];
  if (saved) {
    const { items, notes } = JSON.parse(saved);
    slotItems[slot] = JSON.parse(JSON.stringify(items));
    slotNotes[slot] = notes;
  } else {
    delete slotItems[slot];
    slotNotes[slot] = '';
  }
  if (slot === activeSlot) {
    document.getElementById('food-notes').value = slotNotes[slot] || '';
  }
  updateSlotPillStates();
  renderSlotState();
  updateTotalProtein();
}

function showDirtySlotPrompt(slotLabel) {
  return new Promise((resolve) => {
    dirtySlotResolve = resolve;
    document.getElementById('dirty-slot-message').textContent =
      `Could not save ${slotLabel}. Retry, discard, or keep editing.`;
    document.getElementById('dirty-slot-modal').classList.add('show');
  });
}

function closeDirtySlotModal(action) {
  document.getElementById('dirty-slot-modal').classList.remove('show');
  dirtySlotResolve?.(action);
  dirtySlotResolve = null;
}

function setupDirtySlotGuard() {
  document.getElementById('dirty-slot-retry')?.addEventListener('click', () => {
    closeDirtySlotModal('retry');
  });
  document.getElementById('dirty-slot-discard')?.addEventListener('click', () => {
    closeDirtySlotModal('discard');
  });
  document.getElementById('dirty-slot-cancel')?.addEventListener('click', () => {
    closeDirtySlotModal('cancel');
  });
  document.getElementById('dirty-slot-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'dirty-slot-modal') closeDirtySlotModal('cancel');
  });
}

function updateSlotPillStates() {
  document.querySelectorAll('.meal-slot-pill').forEach((p) => {
    const slot = p.dataset.slot;
    p.classList.toggle('active', slot === activeSlot);
    p.classList.toggle('filled', filledSlots.has(slot));
    p.classList.toggle('dirty', isSlotDirty(slot));
  });
}

function updateFoodFooter() {
  const items = slotItems[activeSlot] || [];
  const notes = (slotNotes[activeSlot] || '').trim();
  const totalP = items.reduce((s, i) => s + i.protein * i.qty, 0);
  const totalC = items.reduce((s, i) => s + i.calories * i.qty, 0);
  const totalEl = document.getElementById('food-slot-total');
  const labelEl = document.getElementById('food-slot-label');
  if (totalEl) totalEl.textContent = `${totalP}g P · ${totalC} kcal`;
  if (labelEl) labelEl.textContent = SLOT_LABELS[activeSlot] || activeSlot || 'Meal';
  const diaryTitle = document.getElementById('food-diary-title');
  if (diaryTitle) diaryTitle.textContent = SLOT_LABELS[activeSlot] || activeSlot || 'Meal';

  const nextBtn = document.getElementById('next-meal');
  const nextSlot = getFirstUnfilledSlot({ fallbackToFirst: false });
  if (nextBtn) {
    nextBtn.classList.toggle('hidden', !nextSlot || nextSlot === activeSlot);
  }

  const clearBtn = document.getElementById('clear-slot');
  if (clearBtn) {
    clearBtn.classList.toggle('hidden', items.length === 0 && !notes);
  }
}

// ── Meal Slot Pills ──────────────────────────────────────────
function getFirstUnfilledSlot({ fallbackToFirst = true } = {}) {
  const slots = getCurrentMealSlots();
  const unfilled = slots.find((s) => !filledSlots.has(s));
  if (unfilled) return unfilled;
  return fallbackToFirst ? slots[0] : null;
}

function loadSlots() {
  const container = document.getElementById('meal-slots');
  const slots = getCurrentMealSlots();
  container.innerHTML = '';

  slots.forEach((slot) => {
    const pill = document.createElement('button');
    pill.className = 'meal-slot-pill';
    pill.textContent = SLOT_LABELS[slot] || slot;
    pill.dataset.slot = slot;
    pill.addEventListener('click', () => selectSlot(slot));
    container.appendChild(pill);
  });

  if (!slots.includes(activeSlot)) {
    activeSlot = slots[0] || '';
  }
}

async function selectSlot(slot, { skipGuard = false } = {}) {
  if (slot === activeSlot) return;

  persistActiveSlotNotes();
  await flushFoodSlot(activeSlot);

  if (!skipGuard && isSlotDirty(activeSlot)) {
    const label = SLOT_LABELS[activeSlot] || activeSlot;
    const action = await showDirtySlotPrompt(label);
    if (action === 'cancel') return;
    if (action === 'discard') discardSlotChanges(activeSlot);
    if (action === 'retry') {
      const ok = await persistFoodSlot(activeSlot, { silent: false });
      if (!ok) {
        showToast('Save failed', { variant: 'error' });
        return;
      }
    }
  }

  activeSlot = slot;
  updateSlotPillStates();
  renderSlotState();
}

function renderFoodCoachBanner() {
  const banner = document.getElementById('food-coach-banner');
  if (!banner) return;

  const issues = state.foodIssues || [];
  const slotIssues = issues.filter((i) => i.slot === activeSlot);
  const showIssues = slotIssues.length ? slotIssues : issues;

  if (!showIssues.length) {
    banner.classList.add('hidden');
    banner.innerHTML = '';
    return;
  }

  const issue = showIssues[0];
  banner.classList.remove('hidden');
  banner.innerHTML = `<strong>${escapeHtml(issue.label)}</strong> — ${escapeHtml(issue.message.replace(`${issue.label}: `, ''))}`;
}

function renderSlotState() {
  const plan = state.currentPlan;
  const hint = document.getElementById('meal-hint');
  if (plan?.meals_plan) {
    const lines = plan.meals_plan.split('\n');
    const slotLabel = SLOT_LABELS[activeSlot]?.toLowerCase() || activeSlot;
    const match = lines.find((l) => l.toLowerCase().includes(slotLabel));
    hint.textContent = match ? `Planned: ${match.split('—')[1]?.trim() || match}` : '';
  } else {
    hint.textContent = '';
  }

  const items = slotItems[activeSlot] || [];
  document.querySelectorAll('.food-item[data-id]').forEach((el) => {
    const id = el.dataset.id;
    const item = items.find((i) => i.id === id);
    const count = item?.qty || 0;
    const qtyEl = el.querySelector('.stepper-qty');
    const addBtn = el.querySelector('.food-item-add');
    const stepper = el.querySelector('.food-item-stepper');
    if (qtyEl) qtyEl.textContent = count;
    if (addBtn) addBtn.classList.toggle('hidden', count > 0);
    if (stepper) stepper.classList.toggle('hidden', count === 0);
    el.classList.toggle('has-qty', count > 0);
  });

  renderMealSummary();
  document.getElementById('food-notes').value = slotNotes[activeSlot] || '';
  updateSlotPillStates();
  updateFoodFooter();
  renderFoodCoachBanner();
  applyFoodSearchFilter();
  renderSameAsYesterday();
}

// ── Same as yesterday ────────────────────────────────────────
function getYesterdayIso() {
  const d = new Date(state.currentDate);
  d.setDate(d.getDate() - 1);
  return formatDate(d);
}

function isSameAsDismissed(date, slot) {
  try {
    return localStorage.getItem(`${SAME_AS_DISMISSED_PREFIX}:${date}:${slot}`) === '1';
  } catch {
    return false;
  }
}

function dismissSameAsBanner(date, slot) {
  try {
    localStorage.setItem(`${SAME_AS_DISMISSED_PREFIX}:${date}:${slot}`, '1');
  } catch {
    /* private browsing */
  }
}

async function getYesterdayLogs() {
  const today = getToday();
  if (yesterdayLogsCache.forDate === today) {
    return yesterdayLogsCache.logs;
  }
  const logs = await fetchFoodLogsForDate(getYesterdayIso());
  yesterdayLogsCache = { forDate: today, logs: logs || [] };
  return yesterdayLogsCache.logs;
}

async function renderSameAsYesterday() {
  const banner = document.getElementById('same-as-yesterday');
  if (!banner || isViewingFuture()) {
    banner?.classList.add('hidden');
    return;
  }

  const items = slotItems[activeSlot] || [];
  const notes = (slotNotes[activeSlot] || '').trim();
  if (items.length > 0 || notes) {
    banner.classList.add('hidden');
    return;
  }

  if (isSameAsDismissed(getToday(), activeSlot)) {
    banner.classList.add('hidden');
    return;
  }

  const logs = await getYesterdayLogs();
  const yesterdayLog = logs.find((l) => l.meal_slot === activeSlot);
  if (!yesterdayLog) {
    banner.classList.add('hidden');
    return;
  }

  const { items: yItems } = macrosFromResolvedLog(yesterdayLog);
  const yNotes = (yesterdayLog.custom_text || '').trim();
  if (yItems.length === 0 && !yNotes) {
    banner.classList.add('hidden');
    return;
  }

  const slotLabel = (SLOT_LABELS[activeSlot] || activeSlot).toLowerCase();
  document.getElementById('same-as-label').textContent = `Yesterday's ${slotLabel}:`;
  const names = yItems.map((i) => formatFoodLabel(i, i.qty || 1)).join(', ');
  document.getElementById('same-as-items').textContent = names || yNotes;

  banner.dataset.yesterdayItems = JSON.stringify(yItems);
  banner.dataset.yesterdayNotes = yNotes;
  banner.classList.remove('hidden');
}

function applySameAsYesterday() {
  const banner = document.getElementById('same-as-yesterday');
  if (!banner) return;

  const yItems = JSON.parse(banner.dataset.yesterdayItems || '[]');
  const yNotes = banner.dataset.yesterdayNotes || '';
  slotItems[activeSlot] = JSON.parse(JSON.stringify(yItems));
  slotNotes[activeSlot] = yNotes;
  document.getElementById('food-notes').value = yNotes;
  banner.classList.add('hidden');
  notifyFoodChanged();
  showToast('Copied from yesterday');
}

function setupSameAsYesterday() {
  document.getElementById('same-as-use')?.addEventListener('click', () => {
    applySameAsYesterday();
  });
  document.getElementById('same-as-dismiss')?.addEventListener('click', () => {
    dismissSameAsBanner(getToday(), activeSlot);
    document.getElementById('same-as-yesterday')?.classList.add('hidden');
  });
}

// ── Clear slot ───────────────────────────────────────────────
function setupClearSlot() {
  document.getElementById('clear-slot')?.addEventListener('click', () => {
    clearActiveSlot();
  });
}

async function clearActiveSlot() {
  const items = slotItems[activeSlot] || [];
  const notes = (slotNotes[activeSlot] || '').trim();
  if (items.length === 0 && !notes) return;

  const label = SLOT_LABELS[activeSlot] || activeSlot;
  const ok = await showConfirm(`Remove all items from ${label}?`, {
    title: 'Clear meal slot',
    okLabel: 'Clear',
    danger: true,
  });
  if (!ok) return;

  cancelAutosave(foodSlotKey(getToday(), activeSlot));
  slotItems[activeSlot] = [];
  slotNotes[activeSlot] = '';
  document.getElementById('food-notes').value = '';

  if (savedSnapshots[activeSlot]) {
    await deleteFoodLog(getToday(), activeSlot);
    invalidateFoodLogsCache();
    delete savedSnapshots[activeSlot];
    filledSlots.delete(activeSlot);
  }

  updateSlotPillStates();
  renderSlotState();
  updateTotalProtein();
  await loadMealsSummary();
  showToast(`${label} cleared`);
}

// ── Food Grid / Add sheet ────────────────────────────────────
function setupAddFoodSheet() {
  const open = () => openAddFoodSheet();
  const close = () => closeAddFoodSheet();
  document.getElementById('food-add-open')?.addEventListener('click', open);
  document.getElementById('food-add-sheet-close')?.addEventListener('click', close);
  document.getElementById('food-add-sheet-backdrop')?.addEventListener('click', close);

  document.querySelectorAll('.food-add-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      addSheetTab = tab.dataset.addTab || 'staples';
      document.querySelectorAll('.food-add-tab').forEach((t) => {
        const on = t.dataset.addTab === addSheetTab;
        t.classList.toggle('active', on);
        t.setAttribute('aria-selected', String(on));
      });
      renderFoodGrid();
    });
  });

  setupSheetFocusTrap(document.getElementById('food-add-sheet'), {
    onEscape: () => closeAddFoodSheet(),
  });
}

function openAddFoodSheet() {
  const sheet = document.getElementById('food-add-sheet');
  if (!sheet) return;
  sheet.classList.add('open');
  sheet.setAttribute('aria-hidden', 'false');
  document.body.classList.add('food-sheet-open');
  refreshRecentFoods().then(() => renderFoodGrid());
  requestAnimationFrame(() => {
    const search = document.getElementById('food-search');
    search?.focus();
  });
}

function closeAddFoodSheet() {
  const sheet = document.getElementById('food-add-sheet');
  if (!sheet) return;
  sheet.classList.remove('open');
  sheet.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('food-sheet-open');
  hideLookupPanel();
  document.getElementById('food-add-open')?.focus();
}

async function refreshRecentFoods() {
  try {
    const end = getToday();
    const startDate = new Date(`${end}T12:00:00`);
    startDate.setDate(startDate.getDate() - 14);
    const start = formatDate(startDate);
    const logs = await fetchWeekFoodLogs(start, end);
    const byId = new Map();
    for (const log of logs || []) {
      let items = log.items;
      if (typeof items === 'string') {
        try { items = JSON.parse(items); } catch { items = []; }
      }
      for (const item of items || []) {
        if (!item?.id || !item?.name) continue;
        if (!byId.has(item.id)) {
          byId.set(item.id, {
            id: item.id,
            name: item.name,
            protein: item.protein || 0,
            calories: item.calories || 0,
            fat: item.fat || 0,
            emoji: '↺',
            unit: '1',
          });
        }
      }
    }
    recentFoodsCache = [...byId.values()].slice(0, 40);
  } catch (err) {
    console.error('refreshRecentFoods:', err);
    recentFoodsCache = [];
  }
}

function appendFoodTile(grid, item, { library = false } = {}) {
  const el = document.createElement('div');
  el.className = library ? 'food-item food-item--library' : 'food-item';
  el.dataset.id = item.id;
  el.innerHTML = `
    <span class="food-item-header">
      <span class="food-item-emoji">${item.emoji || (library ? '★' : '')}</span>
      <span class="food-item-name">${item.name}</span>
    </span>
    <span class="food-item-protein">${item.protein}g P · ${item.calories} kcal</span>
    <button type="button" class="food-item-add">ADD</button>
    <div class="food-item-stepper hidden">
      <button type="button" class="stepper-btn stepper-minus" aria-label="Remove one ${item.name}">−</button>
      <span class="stepper-qty">0</span>
      <button type="button" class="stepper-btn stepper-plus" aria-label="Add one ${item.name}">+</button>
    </div>
  `;
  el.querySelector('.food-item-add').addEventListener('click', (e) => {
    e.stopPropagation();
    addItem(item);
  });
  el.querySelector('.stepper-minus').addEventListener('click', (e) => {
    e.stopPropagation();
    removeItem(item);
  });
  el.querySelector('.stepper-plus').addEventListener('click', (e) => {
    e.stopPropagation();
    addItem(item);
  });
  grid.appendChild(el);
}

function renderFoodGrid() {
  const grid = document.getElementById('food-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const library = libraryAsFoodItems();
  const tab = addSheetTab;

  if (tab === 'recent') {
    if (!recentFoodsCache.length) {
      grid.innerHTML = '<p class="food-sheet-empty text-muted">No recent foods yet — add from Staples or Your foods.</p>';
    } else {
      recentFoodsCache.forEach((item) => appendFoodTile(grid, item));
    }
  } else if (tab === 'yours') {
    if (!library.length) {
      grid.innerHTML = '<p class="food-sheet-empty text-muted">Save custom or packaged foods to build Your foods.</p>';
    } else {
      library.forEach((item) => appendFoodTile(grid, item, { library: true }));
    }
  } else {
    FOOD_ITEMS.forEach((item) => appendFoodTile(grid, item));
  }

  const customEl = document.createElement('button');
  customEl.type = 'button';
  customEl.className = 'food-item custom';
  customEl.innerHTML = `
    <span class="food-item-header">
      <span class="food-item-emoji">+</span>
      <span class="food-item-name">Custom</span>
    </span>
    <span class="food-item-protein">Create &amp; approve</span>
  `;
  customEl.addEventListener('click', () => {
    openCustomModal(null, {
      title: 'Create custom',
      hint: 'Approve macros before adding. Save to Your foods for next time.',
    });
  });
  grid.appendChild(customEl);
  applyFoodSearchFilter();
  renderSlotStateQtyOnly();
}

function renderSlotStateQtyOnly() {
  const items = slotItems[activeSlot] || [];
  document.querySelectorAll('#food-grid .food-item[data-id]').forEach((el) => {
    const id = el.dataset.id;
    const item = items.find((i) => i.id === id);
    const count = item?.qty || 0;
    const qtyEl = el.querySelector('.stepper-qty');
    const addBtn = el.querySelector('.food-item-add');
    const stepper = el.querySelector('.food-item-stepper');
    if (qtyEl) qtyEl.textContent = count;
    if (addBtn) addBtn.classList.toggle('hidden', count > 0);
    if (stepper) stepper.classList.toggle('hidden', count === 0);
    el.classList.toggle('has-qty', count > 0);
  });
}

function addItem(foodItem) {
  if (!slotItems[activeSlot]) slotItems[activeSlot] = [];
  const existing = slotItems[activeSlot].find((i) => i.id === foodItem.id);
  if (existing) {
    existing.qty += 1;
  } else {
    slotItems[activeSlot].push({
      id: foodItem.id,
      name: foodItem.name,
      qty: 1,
      protein: foodItem.protein,
      calories: foodItem.calories,
      fat: foodItem.fat ?? 0,
    });
  }
  notifyFoodChanged();
}

function removeItem(foodItem) {
  if (!slotItems[activeSlot]) return;
  const existing = slotItems[activeSlot].find((i) => i.id === foodItem.id);
  if (existing) {
    existing.qty -= 1;
    if (existing.qty <= 0) {
      slotItems[activeSlot] = slotItems[activeSlot].filter((i) => i.id !== foodItem.id);
    }
  }
  notifyFoodChanged();
}

function changeSlotItemQty(itemId, delta) {
  const items = slotItems[activeSlot];
  if (!items) return;
  const item = items.find((i) => i.id === itemId);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    slotItems[activeSlot] = items.filter((i) => i.id !== itemId);
  }
  notifyFoodChanged();
}

function removeSlotItem(itemId) {
  if (!slotItems[activeSlot]) return;
  slotItems[activeSlot] = slotItems[activeSlot].filter((i) => i.id !== itemId);
  notifyFoodChanged();
}

function setupMealSummaryActions() {
  document.getElementById('meal-summary')?.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const itemId = btn.dataset.itemId;
    if (!itemId) return;

    if (btn.classList.contains('meal-qty-minus')) {
      changeSlotItemQty(itemId, -1);
      return;
    }
    if (btn.classList.contains('meal-qty-plus')) {
      changeSlotItemQty(itemId, 1);
      return;
    }
    if (btn.classList.contains('meal-edit-btn')) {
      const item = slotItems[activeSlot]?.find((i) => i.id === itemId);
      if (item) openCustomModal(item);
      return;
    }
    if (btn.classList.contains('meal-remove-btn')) {
      removeSlotItem(itemId);
    }
  });
}

// ── Meal Summary ─────────────────────────────────────────────
function renderMealSummary() {
  const container = document.getElementById('meal-summary');
  const items = slotItems[activeSlot] || [];

  if (items.length === 0) {
    const notes = (slotNotes[activeSlot] || '').trim();
    if (notes) {
      const fromRegistry = itemFromNotesOnly(notes);
      container.innerHTML = `<div class="meal-summary-item meal-summary-item--warn">
        <div class="meal-summary-item-main">
          <span class="name">Notes: ${escapeHtml(notes)}</span>
          <span class="meal-slot-notes">${fromRegistry ? 'Known food — save slot to apply macros' : 'Add a Custom item with this name for accurate totals'}</span>
        </div>
      </div>`;
      return;
    }
    container.innerHTML = '<span class="text-muted text-sm-muted">No items added yet</span>';
    return;
  }

  let html = '';
  let totalP = 0;
  let totalC = 0;
  items.forEach((item) => {
    const p = item.protein * item.qty;
    const c = item.calories * item.qty;
    totalP += p;
    totalC += c;
    const unresolved = needsMacroResolve(item);

    if (isCustomItem(item)) {
      html += `<div class="meal-summary-item meal-summary-item-custom${unresolved ? ' meal-summary-item--warn' : ''}" data-item-id="${item.id}">
        <div class="meal-summary-item-main">
          <span class="name">${formatFoodLabel(item, item.qty)}</span>
          <span class="protein">${unresolved ? formatMealMacroLabel(p, c, [item]) : `${p}g P · ${c} kcal`}</span>
        </div>
        <div class="meal-summary-item-controls">
          <div class="meal-summary-stepper">
            <button type="button" class="qty-btn meal-qty-minus" data-item-id="${item.id}" aria-label="Remove one ${item.name}">−</button>
            <span class="meal-qty">${item.qty}</span>
            <button type="button" class="qty-btn meal-qty-plus" data-item-id="${item.id}" aria-label="Add one ${item.name}">+</button>
          </div>
          <button type="button" class="meal-edit-btn" data-item-id="${item.id}">Edit</button>
          <button type="button" class="remove-btn meal-remove-btn" data-item-id="${item.id}" aria-label="Remove ${item.name}">&times;</button>
        </div>
      </div>`;
      return;
    }

    html += `<div class="meal-summary-item">
      <span class="name">${formatFoodLabel(item, item.qty)}</span>
      <span class="protein">${p}g P · ${c} kcal</span>
    </div>`;
  });

  html += `<div class="meal-summary-item meal-summary-total">
    <span class="name">Slot total</span>
    <span class="protein">${totalP}g P · ${totalC} kcal</span>
  </div>`;

  container.innerHTML = html;
}

// ── Next meal ────────────────────────────────────────────────
async function goToNextMeal() {
  persistActiveSlotNotes();
  await flushFoodSlot(activeSlot);

  const items = slotItems[activeSlot] || [];
  const notes = (slotNotes[activeSlot] || '').trim();
  if (items.length === 0 && !notes) {
    showToast('Add items first', { variant: 'error' });
    return;
  }

  const nextSlot = getFirstUnfilledSlot({ fallbackToFirst: false });
  if (nextSlot) {
    await selectSlot(nextSlot, { skipGuard: true });
  }
}

export async function deleteMealSlot(mealSlot) {
  cancelAutosave(foodSlotKey(getToday(), mealSlot));
  await deleteFoodLog(getToday(), mealSlot);
  invalidateFoodLogsCache();
  delete slotItems[mealSlot];
  delete slotNotes[mealSlot];
  delete savedSnapshots[mealSlot];
  filledSlots.delete(mealSlot);
  updateSlotPillStates();
  renderSlotState();
  updateTotalProtein();
}

// ── Protein Bar ──────────────────────────────────────────────
export function updateProteinBar(total, calories = null) {
  const target = state.currentPlan?.protein_target || 145;
  const calTarget = state.currentPlan?.calorie_target;
  const pct = Math.min(100, (total / target) * 100);
  const kcal = Math.round(calories || 0);

  document.getElementById('protein-current').textContent = `${Math.round(total)}g`;
  document.getElementById('protein-target').textContent = `/ ${target}g P`;
  document.getElementById('protein-fill').style.width = `${pct}%`;

  const calEl = document.getElementById('calorie-current');
  if (calEl) {
    if (calTarget) {
      calEl.textContent = `${kcal.toLocaleString()} / ${Number(calTarget).toLocaleString()} kcal`;
    } else {
      calEl.textContent = kcal > 0 ? `~${kcal.toLocaleString()} kcal` : '— kcal';
    }
  }

  // Quiet spine: amber only when far under — never red shame for over-target
  const isLow = pct < 60;
  document.getElementById('protein-label')?.classList.toggle('warning', isLow);
  document.getElementById('protein-fill')?.classList.toggle('warning', isLow);
}

function updateTotalProtein() {
  let totalP = 0;
  let totalC = 0;
  for (const [, items] of Object.entries(slotItems)) {
    if (!items) continue;
    const macros = sumItemsMacros(items);
    totalP += macros.protein;
    totalC += macros.calories;
  }
  for (const [slot, data] of Object.entries(state.foodLogs)) {
    if (!slotItems[slot]) {
      totalP += data.totalProtein || 0;
      totalC += data.totalCalories || 0;
    }
  }
  updateProteinBar(totalP, totalC);
}

// ── Load Existing Logs ───────────────────────────────────────
async function loadExistingLogs() {
  const date = getToday();
  cancelAutosavesByPrefix(`food:${date}:`);

  foodAutosaveSuspended = true;
  let logs = await fetchFoodLogsForDate(date, { force: true });
  const { logs: resolvedLogs, patchedSlots } = await autoResolveFoodLogsForDate(date, logs);
  if (patchedSlots.length) {
    invalidateFoodLogsCache();
    logs = resolvedLogs;
  }

  filledSlots.clear();
  slotItems = {};
  slotNotes = {};
  savedSnapshots = {};

  if (logs && logs.length > 0) {
    for (const log of logs) {
      const { items } = macrosFromResolvedLog(log);
      const notes = log.custom_text || '';
      slotItems[log.meal_slot] = items;
      slotNotes[log.meal_slot] = notes;
      savedSnapshots[log.meal_slot] = JSON.stringify({ items, notes });
      if (items.length > 0 || notes) {
        filledSlots.add(log.meal_slot);
      }
    }
  }

  state.foodIssues = analyzeDayFoodLogs(logs || [], SLOT_LABELS);

  activeSlot = getFirstUnfilledSlot();
  updateSlotPillStates();
  renderSlotState();
  updateTotalProtein();
  foodAutosaveSuspended = false;
}

// ── Custom Food Modal ────────────────────────────────────────
function openCustomModal(item = null, { title = null, hint = null, draft = null } = {}) {
  editingCustomId = item?.id || null;
  pendingConfirmDraft = draft || null;
  const titleEl = document.getElementById('custom-modal-title');
  const addBtn = document.getElementById('custom-add');
  const hintEl = document.getElementById('custom-modal-hint');
  const saveLib = document.getElementById('custom-save-library');
  const saveWrap = document.getElementById('custom-save-library-wrap');

  if (hintEl) {
    if (hint) {
      hintEl.textContent = hint;
      hintEl.classList.remove('hidden');
    } else {
      hintEl.textContent = '';
      hintEl.classList.add('hidden');
    }
  }

  if (item) {
    titleEl.textContent = title || 'Edit Custom Item';
    addBtn.textContent = 'Save';
    document.getElementById('custom-name').value = item.name;
    document.getElementById('custom-protein').value = item.protein;
    document.getElementById('custom-calories').value = item.calories;
    document.getElementById('custom-fat').value = item.fat ?? '';
    document.getElementById('custom-unit').value = item.unit || '1';
    if (saveLib) saveLib.checked = false;
    if (saveWrap) saveWrap.classList.add('hidden');
  } else if (draft) {
    titleEl.textContent = title || 'Confirm food';
    addBtn.textContent = 'Add to meal';
    document.getElementById('custom-name').value = draft.name || '';
    document.getElementById('custom-protein').value = draft.protein ?? '';
    document.getElementById('custom-calories').value = draft.calories ?? '';
    document.getElementById('custom-fat').value = draft.fat ?? '';
    document.getElementById('custom-unit').value = draft.unit || '100g';
    if (saveLib) saveLib.checked = true;
    if (saveWrap) saveWrap.classList.remove('hidden');
  } else {
    titleEl.textContent = title || 'Add Custom Item';
    addBtn.textContent = 'Add';
    resetCustomModalFields();
    if (saveLib) saveLib.checked = true;
    if (saveWrap) saveWrap.classList.remove('hidden');
  }

  document.getElementById('custom-food-modal').classList.add('show');
}

function resetCustomModalFields() {
  document.getElementById('custom-name').value = '';
  document.getElementById('custom-protein').value = '';
  document.getElementById('custom-calories').value = '';
  document.getElementById('custom-fat').value = '';
  document.getElementById('custom-unit').value = '1';
  editingCustomId = null;
  pendingConfirmDraft = null;
}

function closeCustomModal() {
  document.getElementById('custom-food-modal').classList.remove('show');
  document.getElementById('custom-modal-title').textContent = 'Add Custom Item';
  document.getElementById('custom-add').textContent = 'Add';
  document.getElementById('custom-modal-hint')?.classList.add('hidden');
  resetCustomModalFields();
}

function setupCustomModal() {
  document.getElementById('custom-cancel').addEventListener('click', () => {
    closeCustomModal();
  });

  document.getElementById('custom-add').addEventListener('click', async () => {
    const name = document.getElementById('custom-name').value.trim();
    const protein = parseFloat(document.getElementById('custom-protein').value) || 0;
    const calories = parseInt(document.getElementById('custom-calories').value, 10) || 0;
    const fat = parseFloat(document.getElementById('custom-fat').value) || 0;
    const unit = document.getElementById('custom-unit').value.trim() || '1';
    const saveToLibrary = document.getElementById('custom-save-library')?.checked;

    if (!name) {
      showToast('Enter a name');
      return;
    }

    if (editingCustomId) {
      const item = slotItems[activeSlot]?.find((i) => i.id === editingCustomId);
      if (item) {
        item.name = name;
        item.protein = protein;
        item.calories = calories;
        item.fat = fat;
        notifyFoodChanged();
        showToast(`${name} updated`);
      }
      closeCustomModal();
      return;
    }

    let foodId = `custom_${Date.now()}`;
    if (saveToLibrary) {
      const saved = await saveFoodToLibrary({
        name,
        protein,
        calories,
        fat,
        unit,
        barcode: pendingConfirmDraft?.barcode || null,
        source: pendingConfirmDraft?.source || 'manual',
      });
      if (saved?.id) {
        foodId = `lib_${saved.id}`;
        renderFoodGrid();
      } else if (saveToLibrary) {
        showToast('Added to meal (library save needs migration)', { variant: 'error' });
      }
    }

    const customItem = {
      id: foodId,
      name,
      protein,
      calories,
      fat,
      unit,
    };

    if (!slotItems[activeSlot]) slotItems[activeSlot] = [];
    slotItems[activeSlot].push({ ...customItem, qty: 1 });

    closeCustomModal();
    hideLookupPanel();
    notifyFoodChanged();
    showToast(`${name} added`);
  });

  document.getElementById('custom-food-modal').addEventListener('click', (e) => {
    if (e.target.id === 'custom-food-modal') {
      closeCustomModal();
    }
  });
}

export async function focusFoodSlot(slot) {
  const tab = document.querySelector('.nav-tab[data-tab="food"]');
  if (!tab?.classList.contains('active')) {
    tab?.click();
  }
  await loadFoodData();
  if (slot && getCurrentMealSlots().includes(slot)) {
    await selectSlot(slot, { skipGuard: true });
  }
}
