// Run log helpers — pace calc + completion validation (P9)

const KNEE_VALUES = new Set(['Pain-free', 'Minor pressure', 'Discomfort', 'Pain']);

let paceManuallyEdited = false;
let ignorePaceInput = false;

export function parseTimeToMinutes(timeStr) {
  if (!timeStr?.trim()) return null;
  const parts = timeStr.trim().split(':');
  if (parts.length !== 2) return null;
  const m = parseInt(parts[0], 10);
  const s = parseInt(parts[1], 10);
  if (Number.isNaN(m) || Number.isNaN(s) || s >= 60) return null;
  return m + s / 60;
}

export function formatPace(minutesPerKm) {
  if (!minutesPerKm || !Number.isFinite(minutesPerKm)) return '';
  const totalSec = Math.round(minutesPerKm * 60);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${String(sec).padStart(2, '0')}/km`;
}

export function calcAutoPace(km, timeStr) {
  const k = parseFloat(km);
  const mins = parseTimeToMinutes(timeStr);
  if (!(k > 0) || !mins) return null;
  return formatPace(mins / k);
}

export function resetPaceAutoState() {
  paceManuallyEdited = false;
}

export function setupPaceManualTracking() {
  const paceEl = document.getElementById('input-run-pace');
  if (!paceEl) return;
  paceEl.addEventListener('input', () => {
    if (ignorePaceInput) return;
    paceManuallyEdited = !!String(paceEl.value).trim();
  });
}

export function applyAutoPaceToForm() {
  if (paceManuallyEdited) return false;
  const paceEl = document.getElementById('input-run-pace');
  if (!paceEl) return false;
  const pace = calcAutoPace(
    document.getElementById('input-run-km')?.value,
    document.getElementById('input-run-time')?.value,
  );
  if (!pace) return false;
  ignorePaceInput = true;
  paceEl.value = pace;
  ignorePaceInput = false;
  return true;
}

export function setupRpeSlider(sliderId, displayId, onChange) {
  const slider = document.getElementById(sliderId);
  const display = document.getElementById(displayId);
  if (!slider || !display) return;
  slider.addEventListener('input', () => {
    slider.dataset.rpeExplicit = '1';
    slider.setAttribute('aria-valuetext', slider.value);
    display.textContent = slider.value;
    onChange?.();
  });
}

export function setRpeFromSaved(sliderId, displayId, rpe) {
  const slider = document.getElementById(sliderId);
  const display = document.getElementById(displayId);
  if (!slider || !display) return;
  if (rpe != null && rpe >= 1 && rpe <= 10) {
    slider.value = String(rpe);
    slider.dataset.rpeExplicit = '1';
    slider.setAttribute('aria-valuetext', String(rpe));
    display.textContent = String(rpe);
    return;
  }
  resetRpeSlider(sliderId, displayId);
}

export function resetRpeSlider(sliderId, displayId) {
  const slider = document.getElementById(sliderId);
  const display = document.getElementById(displayId);
  if (!slider || !display) return;
  slider.value = '5';
  delete slider.dataset.rpeExplicit;
  slider.setAttribute('aria-valuetext', 'not set');
  display.textContent = '—';
}

export function readRpeFromSlider(sliderId) {
  const slider = document.getElementById(sliderId);
  if (!slider || slider.dataset.rpeExplicit !== '1') return null;
  const n = parseInt(slider.value, 10);
  return n >= 1 && n <= 10 ? n : null;
}

export function validateRunLogForDone(runLog) {
  const errors = [];
  const warnings = [];

  if (!runLog?.done) {
    return { valid: false, errors: ['Mark run as done'], warnings: [] };
  }

  const km = Number(runLog.actual_km);
  if (!km || km <= 0) errors.push('Enter actual km before marking done');

  if (!runLog.knee_status || !KNEE_VALUES.has(runLog.knee_status)) {
    errors.push('Select knee status');
  }

  const cadence = Number(runLog.cadence);
  if (!cadence || cadence < 1 || cadence > 250) {
    errors.push('Enter cadence');
  } else if (cadence < 150) {
    warnings.push(`Cadence ${cadence} — target 150–155`);
  }

  const rpe = Number(runLog.rpe);
  if (!rpe || rpe < 1 || rpe > 10) errors.push('RPE not set');

  return { valid: errors.length === 0, errors, warnings };
}

export function isRunLogComplete(runLog) {
  if (!runLog?.done) return false;
  return validateRunLogForDone(runLog).valid;
}

export function updateCadenceHint(cadence) {
  const hint = document.getElementById('run-cadence-hint');
  if (!hint) return;
  const n = parseInt(cadence, 10);
  const show = n > 0 && n < 150;
  hint.classList.toggle('hidden', !show);
}
