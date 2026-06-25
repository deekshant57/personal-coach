// Food tab — tap grid, meal slots, protein calculation
import { FOOD_ITEMS, SLOT_LABELS, formatFoodLabel, formatUnitDisplay } from './data.js';
import { state, getToday, getCurrentMealSlots, showToast, isViewingFuture } from './app.js';
import { upsertFoodLog, fetchFoodLogs, deleteFoodLog } from './supabase.js';
import { loadMealsSummary } from './today.js';
import { setOverlayLoading } from './spinner.js';
import { trackSave } from './save-state.js';
import {
  scheduleAutosave,
  cancelAutosave,
  cancelAutosavesByPrefix,
  flushAutosave,
  flushAutosavesByPrefix,
  registerAutosaveFlush,
  hasPendingAutosave,
} from './auto-save.js';

// ── Local State ──────────────────────────────────────────────
let activeSlot = '';
let slotItems = {}; // { slotName: [{id, name, qty, protein, calories}] }
let slotNotes = {}; // { slotName: string }
let filledSlots = new Set();
let savedSnapshots = {}; // { slotName: JSON string of last saved state }
let dirtySlotResolve = null;
let editingCustomId = null;
let foodAutosaveSuspended = false;

function foodSlotKey(date, slot) {
  return `food:${date}:${slot}`;
}

function isCustomItem(item) {
  return String(item.id).startsWith('custom_');
}

// ── Init ─────────────────────────────────────────────────────
export function initFood() {
  renderFoodGrid();
  setupCustomModal();
  setupMealSummaryActions();
  setupDirtySlotGuard();
  setupNotesPersistence();
  setupFoodSearch();
  document.getElementById('next-meal')?.addEventListener('click', () => goToNextMeal());
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

    const totalProtein = items.reduce((s, i) => s + i.protein * i.qty, 0);
    const totalCalories = items.reduce((s, i) => s + i.calories * i.qty, 0);
    const ok = await upsertFoodLog(date, slot, items, trimmedNotes || null, totalProtein, totalCalories);
    if (!ok) return false;

    filledSlots.add(slot);
    savedSnapshots[slot] = JSON.stringify({ items, notes: customText });
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
    'meal-slots', 'meal-hint', 'food-search-wrap', 'food-grid-hint', 'food-grid',
    'food-notes-group', 'meal-summary', 'food-sticky-footer',
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
  searchEl?.addEventListener('input', applyFoodSearchFilter);
}

function applyFoodSearchFilter() {
  const q = (document.getElementById('food-search')?.value || '').trim().toLowerCase();
  let visible = 0;

  document.querySelectorAll('#food-grid .food-item').forEach((el) => {
    if (el.classList.contains('custom')) {
      const show = !q || 'custom'.includes(q);
      el.classList.toggle('hidden', !show);
      if (show) visible += 1;
      return;
    }
    const name = el.querySelector('.food-item-name')?.textContent?.toLowerCase() || '';
    const show = !q || name.includes(q);
    el.classList.toggle('hidden', !show);
    if (show) visible += 1;
  });

  const hint = document.getElementById('food-grid-hint');
  if (!hint) return;
  if (q && visible === 0) {
    hint.textContent = 'No items match your search';
  } else if (!q) {
    hint.textContent = 'Tap ADD, then use − / + on the item';
  } else {
    hint.textContent = `${visible} item${visible === 1 ? '' : 's'}`;
  }
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
  const totalP = items.reduce((s, i) => s + i.protein * i.qty, 0);
  const totalC = items.reduce((s, i) => s + i.calories * i.qty, 0);
  const totalEl = document.getElementById('food-slot-total');
  const labelEl = document.getElementById('food-slot-label');
  if (totalEl) totalEl.textContent = `${totalP}g P · ${totalC} kcal`;
  if (labelEl) labelEl.textContent = SLOT_LABELS[activeSlot] || activeSlot || 'Meal';

  const nextBtn = document.getElementById('next-meal');
  const nextSlot = getFirstUnfilledSlot({ fallbackToFirst: false });
  if (nextBtn) {
    nextBtn.classList.toggle('hidden', !nextSlot || nextSlot === activeSlot);
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
  applyFoodSearchFilter();
}

// ── Food Grid ────────────────────────────────────────────────
function renderFoodGrid() {
  const grid = document.getElementById('food-grid');
  grid.innerHTML = '';

  FOOD_ITEMS.forEach((item) => {
    const el = document.createElement('div');
    el.className = 'food-item';
    el.dataset.id = item.id;
    el.innerHTML = `
      <span class="food-item-emoji">${item.emoji}</span>
      <span class="food-item-name">${item.name}</span>
      <span class="food-item-protein">${item.protein}g P</span>
      <span class="food-item-unit">per ${formatUnitDisplay(item.unit)}</span>
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
  });

  const customEl = document.createElement('button');
  customEl.type = 'button';
  customEl.className = 'food-item custom';
  customEl.innerHTML = `
    <span class="food-item-emoji">+</span>
    <span class="food-item-name">Custom</span>
    <span class="food-item-protein">Add item</span>
  `;
  customEl.addEventListener('click', () => {
    openCustomModal();
  });
  grid.appendChild(customEl);
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

    if (isCustomItem(item)) {
      html += `<div class="meal-summary-item meal-summary-item-custom" data-item-id="${item.id}">
        <div class="meal-summary-item-main">
          <span class="name">${formatFoodLabel(item, item.qty)}</span>
          <span class="protein">${p}g P · ${c} kcal</span>
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
      <span class="protein">${p}g</span>
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
  delete slotItems[mealSlot];
  delete slotNotes[mealSlot];
  delete savedSnapshots[mealSlot];
  filledSlots.delete(mealSlot);
  updateSlotPillStates();
  renderSlotState();
  updateTotalProtein();
}

// ── Protein Bar ──────────────────────────────────────────────
export function updateProteinBar(total) {
  const target = state.currentPlan?.protein_target || 145;
  const pct = Math.min(100, (total / target) * 100);

  document.getElementById('protein-current').textContent = `${Math.round(total)}g`;
  document.getElementById('protein-target').textContent = `/ ${target}g protein`;
  document.getElementById('protein-fill').style.width = `${pct}%`;

  const isLow = pct < 60;
  document.getElementById('protein-label').classList.toggle('warning', isLow);
  document.getElementById('protein-fill').classList.toggle('warning', isLow);
}

function updateTotalProtein() {
  let total = 0;
  for (const [, items] of Object.entries(slotItems)) {
    if (!items) continue;
    total += items.reduce((s, i) => s + i.protein * i.qty, 0);
  }
  for (const [slot, data] of Object.entries(state.foodLogs)) {
    if (!slotItems[slot]) {
      total += data.totalProtein || 0;
    }
  }
  updateProteinBar(total);
}

// ── Load Existing Logs ───────────────────────────────────────
async function loadExistingLogs() {
  const date = getToday();
  cancelAutosavesByPrefix(`food:${date}:`);

  foodAutosaveSuspended = true;
  const logs = await fetchFoodLogs(date);

  filledSlots.clear();
  slotItems = {};
  slotNotes = {};
  savedSnapshots = {};

  if (logs && logs.length > 0) {
    for (const log of logs) {
      const items = typeof log.items === 'string' ? JSON.parse(log.items) : (log.items || []);
      const notes = log.custom_text || '';
      slotItems[log.meal_slot] = items;
      slotNotes[log.meal_slot] = notes;
      savedSnapshots[log.meal_slot] = JSON.stringify({ items, notes });
      if (items.length > 0 || notes) {
        filledSlots.add(log.meal_slot);
      }
    }
  }

  activeSlot = getFirstUnfilledSlot();
  updateSlotPillStates();
  renderSlotState();
  updateTotalProtein();
  foodAutosaveSuspended = false;
}

// ── Custom Food Modal ────────────────────────────────────────
function openCustomModal(item = null) {
  editingCustomId = item?.id || null;
  const titleEl = document.getElementById('custom-modal-title');
  const addBtn = document.getElementById('custom-add');

  if (item) {
    titleEl.textContent = 'Edit Custom Item';
    addBtn.textContent = 'Save';
    document.getElementById('custom-name').value = item.name;
    document.getElementById('custom-protein').value = item.protein;
    document.getElementById('custom-calories').value = item.calories;
  } else {
    titleEl.textContent = 'Add Custom Item';
    addBtn.textContent = 'Add';
    resetCustomModalFields();
  }

  document.getElementById('custom-food-modal').classList.add('show');
}

function resetCustomModalFields() {
  document.getElementById('custom-name').value = '';
  document.getElementById('custom-protein').value = '';
  document.getElementById('custom-calories').value = '';
  editingCustomId = null;
}

function closeCustomModal() {
  document.getElementById('custom-food-modal').classList.remove('show');
  document.getElementById('custom-modal-title').textContent = 'Add Custom Item';
  document.getElementById('custom-add').textContent = 'Add';
  resetCustomModalFields();
}

function setupCustomModal() {
  document.getElementById('custom-cancel').addEventListener('click', () => {
    closeCustomModal();
  });

  document.getElementById('custom-add').addEventListener('click', () => {
    const name = document.getElementById('custom-name').value.trim();
    const protein = parseInt(document.getElementById('custom-protein').value, 10) || 0;
    const calories = parseInt(document.getElementById('custom-calories').value, 10) || 0;

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
        notifyFoodChanged();
        showToast(`${name} updated`);
      }
      closeCustomModal();
      return;
    }

    const customItem = {
      id: `custom_${Date.now()}`,
      name,
      protein,
      calories,
    };

    if (!slotItems[activeSlot]) slotItems[activeSlot] = [];
    slotItems[activeSlot].push({ ...customItem, qty: 1 });

    closeCustomModal();
    notifyFoodChanged();
    showToast(`${name} added`);
  });

  document.getElementById('custom-food-modal').addEventListener('click', (e) => {
    if (e.target.id === 'custom-food-modal') {
      closeCustomModal();
    }
  });
}
