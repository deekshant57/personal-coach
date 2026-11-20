// Account sheet (any tab) and the Progress account card.
// Email, targets, and logout stay off the Food / Today / Plan logging chrome.
import { getProfile, getSession } from './auth.js';
import { getDbAthleteProfile } from './athlete-profile.js';
import { describeTargets, openSetup } from './setup.js';
import { setupSheetFocusTrap } from './modal-focus.js';

function initials(name, email) {
  const source = (name || '').trim();
  if (source) {
    return source
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }
  const letter = (email || '').trim()[0];
  return letter ? letter.toUpperCase() : '?';
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value || '';
}

export function refreshAccountChrome() {
  const session = getSession();
  const authProfile = getProfile();
  const athlete = getDbAthleteProfile();
  const email = session?.user?.email || '';
  const name = athlete?.display_name
    || authProfile?.display_name
    || (email ? email.split('@')[0] : 'Athlete');
  const described = describeTargets(athlete);
  const letters = initials(name, email);

  const btn = document.getElementById('profile-open');
  if (btn) {
    btn.textContent = letters;
    btn.setAttribute('aria-label', `Account, ${name}`);
  }

  setText('profile-sheet-name', name);
  setText('profile-sheet-email', email);
  setText('profile-targets-hint', described.hint);
  setText('progress-account-name', name);
  setText('progress-account-email', email);
  setText('progress-targets-hint', described.hint);
  setText('plan-targets-link', described.link);
}

export function closeProfileSheet() {
  const sheet = document.getElementById('profile-sheet');
  if (!sheet) return;
  sheet.classList.remove('open');
  sheet.setAttribute('aria-hidden', 'true');
}

function openProfileSheet() {
  refreshAccountChrome();
  const sheet = document.getElementById('profile-sheet');
  if (!sheet) return;
  sheet.classList.add('open');
  sheet.setAttribute('aria-hidden', 'false');
  document.getElementById('profile-sheet-close')?.focus();
}

function openTargets() {
  closeProfileSheet();
  openSetup({ edit: true });
}

export function initAccount({ onSignOut } = {}) {
  document.getElementById('profile-open')?.addEventListener('click', openProfileSheet);
  document.getElementById('profile-sheet-close')?.addEventListener('click', closeProfileSheet);
  document.getElementById('profile-sheet-backdrop')?.addEventListener('click', closeProfileSheet);
  document.getElementById('profile-targets-btn')?.addEventListener('click', openTargets);
  document.getElementById('progress-targets-btn')?.addEventListener('click', openTargets);
  document.getElementById('plan-targets-link')?.addEventListener('click', openTargets);

  const signOut = () => {
    closeProfileSheet();
    onSignOut?.();
  };
  document.getElementById('sign-out-btn')?.addEventListener('click', signOut);
  document.getElementById('progress-sign-out-btn')?.addEventListener('click', signOut);

  document.addEventListener('coach-account-refresh', refreshAccountChrome);
  setupSheetFocusTrap(document.getElementById('profile-sheet'), {
    onEscape: closeProfileSheet,
  });
  refreshAccountChrome();
}
