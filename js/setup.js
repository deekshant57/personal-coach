// Athlete setup wizard — Phase A
import { getProfile } from './auth.js';
import { upsertAthleteProfile } from './supabase.js';
import {
  refreshDbAthleteProfile,
  getDbAthleteProfile,
  resolveAthleteUserId,
} from './athlete-profile.js';
import { defaultWeekTemplate, seedPlansFromProfile } from './plan-seed.js';
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

let onCompleteCallback = null;
let editMode = false;

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
    : defaultWeekTemplate('morning');
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

function fillFormFromProfile(profile) {
  const authName = getProfile()?.display_name || '';
  document.getElementById('setup-display-name').value =
    profile?.display_name || authName || '';
  document.getElementById('setup-goal').value = profile?.goal_primary || 'general';
  document.getElementById('setup-diet').value = profile?.diet_style || 'veg';
  document.getElementById('setup-weight').value = profile?.starting_weight_kg ?? '';
  document.getElementById('setup-protein').value = profile?.protein_target_g ?? 120;
  document.getElementById('setup-cal-training').value = profile?.calorie_target_training ?? 2000;
  document.getElementById('setup-cal-rest').value = profile?.calorie_target_rest ?? 1800;
  document.getElementById('setup-session-window').value =
    profile?.default_session_window || 'morning';
  document.getElementById('setup-injuries').value = profile?.injuries_notes || '';
  applyTemplateToForm(profile?.week_template);
}

function collectProfilePayload({ markComplete }) {
  const defaultWindow = document.getElementById('setup-session-window').value || 'morning';
  let week_template = readTemplateFromForm();
  // Apply default window to training days that somehow lack one
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

  return {
    display_name: document.getElementById('setup-display-name').value.trim() || 'Athlete',
    goal_primary: document.getElementById('setup-goal').value || 'general',
    diet_style: document.getElementById('setup-diet').value || 'veg',
    starting_weight_kg: weightRaw ? parseFloat(weightRaw) : null,
    protein_target_g: Number.isFinite(protein) ? protein : 120,
    calorie_target_training: Number.isFinite(calTrain) ? calTrain : 2000,
    calorie_target_rest: Number.isFinite(calRest) ? calRest : 1800,
    default_session_window: defaultWindow,
    injuries_notes: document.getElementById('setup-injuries').value.trim() || null,
    week_template,
    setup_completed_at: markComplete ? new Date().toISOString() : null,
  };
}

function validateForm() {
  const name = document.getElementById('setup-display-name').value.trim();
  const protein = parseInt(document.getElementById('setup-protein').value, 10);
  const calTrain = parseInt(document.getElementById('setup-cal-training').value, 10);
  const calRest = parseInt(document.getElementById('setup-cal-rest').value, 10);
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
  const ok = await upsertAthleteProfile(payload);
  if (!ok) {
    if (errEl) {
      errEl.textContent = 'Could not save profile. Run athlete-profiles.sql in Supabase, then retry.';
    }
    return false;
  }

  await refreshDbAthleteProfile();
  const profile = getDbAthleteProfile();

  if (seed && profile) {
    await seedPlansFromProfile(profile, { days: 14 });
  }

  const display = document.getElementById('user-display');
  if (display && payload.display_name) display.textContent = payload.display_name;

  return true;
}

/**
 * @param {{ onComplete: Function }} opts
 */
export function initSetup({ onComplete } = {}) {
  onCompleteCallback = onComplete || null;
  renderWeekTemplateRows();

  document.getElementById('setup-submit')?.addEventListener('click', async () => {
    const btn = document.getElementById('setup-submit');
    setButtonLoading(btn, true, 'Save & continue');
    try {
      const ok = await saveSetup({ markComplete: true, seed: true });
      if (ok) {
        hideSetupScreen();
        onCompleteCallback?.({ editMode });
      }
    } finally {
      setButtonLoading(btn, false, 'Save & continue');
    }
  });

  document.getElementById('setup-skip')?.addEventListener('click', async () => {
    const btn = document.getElementById('setup-skip');
    setButtonLoading(btn, true, 'Skip for now');
    try {
      // Soft gate: apply defaults + mark complete so friends aren't blocked forever
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
      applyTemplateToForm(defaultWeekTemplate(
        document.getElementById('setup-session-window').value || 'morning'
      ));
      const ok = await saveSetup({ markComplete: true, seed: true });
      if (ok) {
        hideSetupScreen();
        onCompleteCallback?.({ editMode, skipped: true });
      }
    } finally {
      setButtonLoading(btn, false, 'Skip for now');
    }
  });

  document.getElementById('edit-setup-btn')?.addEventListener('click', () => {
    openSetup({ edit: true });
  });
}

export function openSetup({ edit = false } = {}) {
  editMode = edit;
  renderWeekTemplateRows();
  fillFormFromProfile(getDbAthleteProfile());
  const skip = document.getElementById('setup-skip');
  if (skip) skip.classList.toggle('hidden', edit);
  const title = document.getElementById('setup-title');
  if (title) title.textContent = edit ? 'Edit setup' : 'Set up your plan';
  showSetupScreen();
}

export function isSetupVisible() {
  return setupScreen()?.classList.contains('show');
}

export { resolveAthleteUserId };
