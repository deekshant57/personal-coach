// Food tab — tap grid, meal slots, protein calculation
import { FOOD_ITEMS, SLOT_LABELS } from './data.js';
import { state, getToday, getCurrentMealSlots, showToast } from './app.js';
import { upsertFoodLog, fetchFoodLogs, getLocalFoodLogs, isConfigured } from './supabase.js';
import { loadMealsSummary } from './today.js';

// ── Local State ──────────────────────────────────────────────
let activeSlot = '';
let slotItems = {}; // { slotName: [{id, name, qty, protein, calories}] }
let slotNotes = {}; // { slotName: string }
let filledSlots = new Set();

// ── Init ─────────────────────────────────────────────────────
export function initFood() {
  renderFoodGrid();
  setupCustomModal();
  document.getElementById('save-meal').addEventListener('click', saveMeal);
}

export function loadFoodData() {
  loadSlots();
  loadExistingLogs();
}

// ── Meal Slot Pills ──────────────────────────────────────────
function loadSlots() {
  const container = document.getElementById('meal-slots');
  const slots = getCurrentMealSlots();
  container.innerHTML = '';

  slots.forEach((slot, i) => {
    const pill = document.createElement('button');
    pill.className = `meal-slot-pill${i === 0 ? ' active' : ''}${filledSlots.has(slot) ? ' filled' : ''}`;
    pill.textContent = SLOT_LABELS[slot] || slot;
    pill.dataset.slot = slot;
    pill.addEventListener('click', () => selectSlot(slot));
    container.appendChild(pill);
  });

  activeSlot = slots[0];
  renderSlotState();
}

function selectSlot(slot) {
  activeSlot = slot;
  document.querySelectorAll('.meal-slot-pill').forEach(p => {
    p.classList.toggle('active', p.dataset.slot === slot);
  });
  renderSlotState();
}

function renderSlotState() {
  // Show planned meal as hint
  const plan = state.currentPlan;
  const hint = document.getElementById('meal-hint');
  if (plan?.meals_plan) {
    const lines = plan.meals_plan.split('\n');
    const slotLabel = SLOT_LABELS[activeSlot]?.toLowerCase() || activeSlot;
    const match = lines.find(l => l.toLowerCase().includes(slotLabel));
    hint.textContent = match ? `Planned: ${match.split('—')[1]?.trim() || match}` : '';
  } else {
    hint.textContent = '';
  }

  // Update grid counts
  const items = slotItems[activeSlot] || [];
  document.querySelectorAll('.food-item').forEach(el => {
    const id = el.dataset.id;
    const item = items.find(i => i.id === id);
    const count = item?.qty || 0;
    const countEl = el.querySelector('.food-item-count');
    if (countEl) {
      countEl.textContent = count;
      countEl.classList.toggle('hidden', count === 0);
    }
    el.classList.toggle('has-count', count > 0);
  });

  // Update meal summary
  renderMealSummary();

  // Notes
  document.getElementById('food-notes').value = slotNotes[activeSlot] || '';
}

// ── Food Grid ────────────────────────────────────────────────
function renderFoodGrid() {
  const grid = document.getElementById('food-grid');
  grid.innerHTML = '';

  FOOD_ITEMS.forEach(item => {
    const el = document.createElement('button');
    el.className = 'food-item';
    el.dataset.id = item.id;
    el.innerHTML = `
      <span class="food-item-count hidden">0</span>
      <span class="food-item-emoji">${item.emoji}</span>
      <span class="food-item-name">${item.name}</span>
      <span class="food-item-protein">${item.protein}g P</span>
    `;
    el.addEventListener('click', () => addItem(item));
    // Long press for decrement
    let pressTimer;
    el.addEventListener('touchstart', (e) => {
      pressTimer = setTimeout(() => {
        e.preventDefault();
        removeItem(item);
      }, 500);
    });
    el.addEventListener('touchend', () => clearTimeout(pressTimer));
    el.addEventListener('touchmove', () => clearTimeout(pressTimer));
    grid.appendChild(el);
  });

  // Custom item button
  const customEl = document.createElement('button');
  customEl.className = 'food-item custom';
  customEl.innerHTML = `
    <span class="food-item-emoji">+</span>
    <span class="food-item-name">Custom</span>
    <span class="food-item-protein">Add item</span>
  `;
  customEl.addEventListener('click', () => {
    document.getElementById('custom-food-modal').classList.add('show');
  });
  grid.appendChild(customEl);
}

function addItem(foodItem) {
  if (!slotItems[activeSlot]) slotItems[activeSlot] = [];
  const existing = slotItems[activeSlot].find(i => i.id === foodItem.id);
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
  renderSlotState();
  updateTotalProtein();
}

function removeItem(foodItem) {
  if (!slotItems[activeSlot]) return;
  const existing = slotItems[activeSlot].find(i => i.id === foodItem.id);
  if (existing) {
    existing.qty -= 1;
    if (existing.qty <= 0) {
      slotItems[activeSlot] = slotItems[activeSlot].filter(i => i.id !== foodItem.id);
    }
  }
  renderSlotState();
  updateTotalProtein();
  showToast('Item removed');
}

// ── Meal Summary ─────────────────────────────────────────────
function renderMealSummary() {
  const container = document.getElementById('meal-summary');
  const items = slotItems[activeSlot] || [];

  if (items.length === 0) {
    container.innerHTML = '<span class="text-muted" style="font-size:13px;">Tap items above to add</span>';
    return;
  }

  let html = '';
  let totalP = 0;
  let totalC = 0;
  items.forEach(item => {
    const p = item.protein * item.qty;
    const c = item.calories * item.qty;
    totalP += p;
    totalC += c;
    html += `<div class="meal-summary-item">
      <span class="name">${item.qty}× ${item.name}</span>
      <span class="protein">${p}g</span>
    </div>`;
  });

  html += `<div class="meal-summary-item" style="border-top:1px solid var(--border);padding-top:8px;margin-top:4px;">
    <span class="name" style="font-weight:600;">Slot total</span>
    <span class="protein" style="font-weight:700;">${totalP}g P · ${totalC} kcal</span>
  </div>`;

  container.innerHTML = html;
}

// ── Save Meal ────────────────────────────────────────────────
async function saveMeal() {
  const items = slotItems[activeSlot] || [];
  const customText = document.getElementById('food-notes').value || '';

  if (items.length === 0 && !customText) {
    showToast('Add items first');
    return;
  }

  const totalProtein = items.reduce((s, i) => s + i.protein * i.qty, 0);
  const totalCalories = items.reduce((s, i) => s + i.calories * i.qty, 0);

  slotNotes[activeSlot] = customText;

  await upsertFoodLog(getToday(), activeSlot, items, customText, totalProtein, totalCalories);
  filledSlots.add(activeSlot);

  // Mark pill as filled
  document.querySelectorAll('.meal-slot-pill').forEach(p => {
    if (p.dataset.slot === activeSlot) p.classList.add('filled');
  });

  showToast(`${SLOT_LABELS[activeSlot]} saved — ${totalProtein}g protein`);

  // Auto-advance to next unfilled slot
  const slots = getCurrentMealSlots();
  const nextSlot = slots.find(s => !filledSlots.has(s) && s !== activeSlot);
  if (nextSlot) {
    selectSlot(nextSlot);
  }

  // Refresh meals summary on Today tab
  await loadMealsSummary();
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
  for (const [slot, items] of Object.entries(slotItems)) {
    if (!items) continue;
    total += items.reduce((s, i) => s + i.protein * i.qty, 0);
  }
  // Also add already-saved slots from state
  for (const [slot, data] of Object.entries(state.foodLogs)) {
    if (!slotItems[slot]) { // Don't double-count slots being edited
      total += data.totalProtein || 0;
    }
  }
  updateProteinBar(total);
}

// ── Load Existing Logs ───────────────────────────────────────
async function loadExistingLogs() {
  const date = getToday();
  let logs;
  if (isConfigured()) {
    logs = await fetchFoodLogs(date);
  } else {
    logs = getLocalFoodLogs(date);
  }

  filledSlots.clear();
  slotItems = {};
  slotNotes = {};

  if (logs && logs.length > 0) {
    for (const log of logs) {
      const items = typeof log.items === 'string' ? JSON.parse(log.items) : (log.items || []);
      slotItems[log.meal_slot] = items;
      slotNotes[log.meal_slot] = log.custom_text || '';
      if (items.length > 0 || log.custom_text) {
        filledSlots.add(log.meal_slot);
      }
    }
  }

  // Re-render slot pills with filled state
  document.querySelectorAll('.meal-slot-pill').forEach(p => {
    p.classList.toggle('filled', filledSlots.has(p.dataset.slot));
  });

  renderSlotState();
  updateTotalProtein();
}

// ── Custom Food Modal ────────────────────────────────────────
function setupCustomModal() {
  document.getElementById('custom-cancel').addEventListener('click', () => {
    document.getElementById('custom-food-modal').classList.remove('show');
  });

  document.getElementById('custom-add').addEventListener('click', () => {
    const name = document.getElementById('custom-name').value.trim();
    const protein = parseInt(document.getElementById('custom-protein').value) || 0;
    const calories = parseInt(document.getElementById('custom-calories').value) || 0;

    if (!name) {
      showToast('Enter a name');
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

    document.getElementById('custom-food-modal').classList.remove('show');
    document.getElementById('custom-name').value = '';
    document.getElementById('custom-protein').value = '';
    document.getElementById('custom-calories').value = '';

    renderSlotState();
    updateTotalProtein();
    showToast(`${name} added`);
  });

  // Close modal on overlay click
  document.getElementById('custom-food-modal').addEventListener('click', (e) => {
    if (e.target.id === 'custom-food-modal') {
      document.getElementById('custom-food-modal').classList.remove('show');
    }
  });
}
