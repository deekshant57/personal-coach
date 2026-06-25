// Run log helpers — pace calc + completion validation (P9)

const KNEE_VALUES = new Set(['Pain-free', 'Minor pressure', 'Discomfort', 'Pain']);

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

export function calcAutoPace(km, timeStr, currentPace = '') {
  if (String(currentPace || '').trim()) return null;
  const k = parseFloat(km);
  const mins = parseTimeToMinutes(timeStr);
  if (!(k > 0) || !mins) return null;
  return formatPace(mins / k);
}

export function applyAutoPaceToForm() {
  const paceEl = document.getElementById('input-run-pace');
  if (!paceEl) return false;
  const pace = calcAutoPace(
    document.getElementById('input-run-km')?.value,
    document.getElementById('input-run-time')?.value,
    paceEl.value,
  );
  if (!pace) return false;
  paceEl.value = pace;
  return true;
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
  if (!cadence || cadence < 120 || cadence > 200) {
    errors.push('Enter cadence (120–200)');
  } else if (cadence < 150) {
    warnings.push(`Cadence ${cadence} — target 150–155`);
  }

  const rpe = Number(runLog.rpe);
  if (!rpe || rpe < 1 || rpe > 10) errors.push('Set RPE');

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
  const show = n >= 120 && n < 150;
  hint.classList.toggle('hidden', !show);
}
