// Global save status — saving indicator + persistent error banner with retry (P8)
import { showSavedToast } from './app.js';
import { SLOT_LABELS } from './data.js';

const pending = new Set();
const failures = new Map(); // key -> { label, retry }

let toastAfterBatch = false;

export function initSaveState() {
  document.getElementById('save-error-retry')?.addEventListener('click', () => {
    retryAllFailed();
  });
}

export function labelFromAutosaveKey(key) {
  if (key.startsWith('food:')) {
    const slot = key.split(':')[2];
    return SLOT_LABELS[slot] || slot || 'Meal';
  }
  if (key.startsWith('training:')) return 'Training';
  if (key === 'vitals') return 'Vitals';
  if (key === 'notes') return 'Notes';
  if (key === 'supplements') return 'Supplements';
  if (key.startsWith('scan:')) return 'Body scan';
  return 'Changes';
}

export function clearSaveState() {
  pending.clear();
  failures.clear();
  toastAfterBatch = false;
  render();
}

function render() {
  const indicator = document.getElementById('save-state-indicator');
  const banner = document.getElementById('save-error-banner');
  const message = document.getElementById('save-error-message');

  indicator?.classList.toggle('hidden', pending.size === 0);

  if (!banner || !message) return;

  if (failures.size === 0) {
    banner.classList.add('hidden');
    return;
  }

  const labels = [...new Set([...failures.values()].map((f) => f.label))];
  const labelText = labels.length === 1
    ? labels[0]
    : `${labels.slice(0, 2).join(', ')}${labels.length > 2 ? '…' : ''}`;

  message.textContent = `Could not save ${labelText.toLowerCase()}. Check connection and retry.`;
  banner.classList.remove('hidden');
}

function maybeShowSavedToast() {
  if (pending.size > 0 || failures.size > 0 || !toastAfterBatch) return;
  toastAfterBatch = false;
  showSavedToast();
}

/**
 * Wrap a save operation with global status UI.
 * @returns {boolean} true if save succeeded
 */
export async function trackSave(key, label, fn, { toastOnSuccess = true } = {}) {
  pending.add(key);
  failures.delete(key);
  if (toastOnSuccess) toastAfterBatch = true;
  render();

  try {
    const result = await fn();
    if (result === false) {
      failures.set(key, {
        label,
        retry: () => trackSave(key, label, fn, { toastOnSuccess }),
      });
      toastAfterBatch = false;
      return false;
    }
    return true;
  } catch (err) {
    console.error('save failed:', key, err);
    failures.set(key, {
      label,
      retry: () => trackSave(key, label, fn, { toastOnSuccess }),
    });
    toastAfterBatch = false;
    return false;
  } finally {
    pending.delete(key);
    render();
    maybeShowSavedToast();
  }
}

export async function retryAllFailed() {
  const jobs = [...failures.values()];
  if (!jobs.length) return;

  const retryBtn = document.getElementById('save-error-retry');
  retryBtn?.setAttribute('disabled', 'true');

  try {
    for (const { retry } of jobs) {
      await retry();
    }
  } finally {
    retryBtn?.removeAttribute('disabled');
  }
}

export function hasSaveFailures() {
  return failures.size > 0;
}
