// Main app — tab routing, date state, initialization
import { renderDayBadge } from './data.js';
import { initSupabase, fetchDailyPlan, setCurrentUserId, getCurrentUserId } from './supabase.js';
import { loadSession, initAuthListeners, signIn, signUp, signOut } from './auth.js';
import { initToday, loadTodayData } from './today.js';
import { initFood, loadFoodData, invalidateFoodLogsCache } from './food.js';
import { initWeek, loadWeekView, syncWeekViewMonday } from './week.js';
import { initDebrief, refreshDebrief, refreshDebriefIfActive } from './debrief.js';
import { initProgress, loadProgressView, loadBodyCompForDate } from './progress.js';
import { initDayProgress, updateDayProgress } from './day-progress.js';
import { initSupplements } from './supplements.js';
import { setupCoachLayout, resetCoachEditModeForDate } from './coach-layout.js';
import { setupObservationCoach } from './observation-coach.js';
import { setButtonLoading, setOverlayLoading, skeletonPlanHtml } from './spinner.js';
import { setupModalFocusTraps } from './modal-focus.js';
import { setupGapReturn, checkAndRenderGapReturn } from './gap-return.js';
import { flushAllAutosaves, setupAutosaveLifecycle } from './auto-save.js';
import { invalidateWeekStatsCache } from './week-stats.js';
import { initSaveState, clearSaveState } from './save-state.js';
import { mergePlanWithFallback } from './plan-merge.js';
import { ensureAthleteProfileReady, clearDbAthleteProfileCache, getDbAthleteProfile } from './athlete-profile.js';
import { initSetup, openSetup } from './setup.js';
import { initAccount, refreshAccountChrome, closeProfileSheet } from './account.js';
import { ensurePlansExtended } from './plan-seed.js';
import { slotsForPlan, renderSessionStatusChip } from './day-shift.js';
import {
  parseAppRouteHash,
  writeAppRoute,
  isValidAppTab,
} from './app-route.js';
// ── App State ────────────────────────────────────────────────
export const state = {
  currentDate: new Date(),
  currentPlan: null,
  planFetchError: false,
  foodLogs: {},      // { slotName: { items: [...], customText, totalProtein, totalCalories } }
  foodIssues: [],    // coach alerts for unresolved custom foods / notes-only meals
  vitals: null,
  runLog: null,
  workoutLog: null,
  bodyCompScans: [],
  bodyCompScanForDate: null,
  supplementLog: null,
  supplementHistory: [],
};

// ── Date Helpers ─────────────────────────────────────────────
const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** ISO key for storage/API — never show in UI. */
export function formatDate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatToday() {
  return formatDate(new Date());
}

/** User-facing date: D MMM YYYY (e.g. 20 Nov 2026). */
export function formatDayDisplay(d) {
  const day = d.getDate();
  const month = MONTH_ABBR[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

export function formatDayDisplayFromIso(iso) {
  const [year, month, day] = iso.split('-').map(Number);
  return formatDayDisplay(new Date(year, month - 1, day));
}

export function isMonday(d) {
  return d.getDay() === 1;
}

export function getToday() {
  return formatDate(state.currentDate);
}

function calendarDate(d) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function isViewingToday() {
  const now = calendarDate(new Date());
  const viewing = calendarDate(state.currentDate);
  return viewing.getTime() === now.getTime();
}

export function isViewingPast() {
  const now = calendarDate(new Date());
  const viewing = calendarDate(state.currentDate);
  return viewing.getTime() < now.getTime();
}

export function isViewingFuture() {
  const now = calendarDate(new Date());
  const viewing = calendarDate(state.currentDate);
  return viewing.getTime() > now.getTime();
}

function isViewingTomorrow() {
  const tomorrow = calendarDate(new Date());
  tomorrow.setDate(tomorrow.getDate() + 1);
  return calendarDate(state.currentDate).getTime() === tomorrow.getTime();
}

function getWeekSunday(d) {
  const copy = calendarDate(d);
  const dayOfWeek = copy.getDay();
  const diff = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
  copy.setDate(copy.getDate() + diff);
  return copy;
}

function canGoNextDay() {
  const next = calendarDate(state.currentDate);
  next.setDate(next.getDate() + 1);
  return next.getTime() <= getWeekSunday(state.currentDate).getTime();
}

// ── Toast ────────────────────────────────────────────────────
let toastHideTimer = null;

export function showToast(msg, { variant = 'default' } = {}) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast';
  if (variant === 'saved') el.classList.add('toast--saved');
  if (variant === 'error') el.classList.add('toast--error');
  el.classList.add('show');
  if (toastHideTimer) clearTimeout(toastHideTimer);
  toastHideTimer = setTimeout(() => el.classList.remove('show'), 2000);
}

export function showSavedToast() {
  showToast('Saved', { variant: 'saved' });
}

// ── Confirm Modal ────────────────────────────────────────────
let confirmResolve = null;

function closeConfirmModal(result) {
  document.getElementById('confirm-modal')?.classList.remove('show');
  confirmResolve?.(result);
  confirmResolve = null;
}

export function setupConfirmModal() {
  document.getElementById('confirm-modal-ok')?.addEventListener('click', () => {
    closeConfirmModal(true);
  });
  document.getElementById('confirm-modal-cancel')?.addEventListener('click', () => {
    closeConfirmModal(false);
  });
  document.getElementById('confirm-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'confirm-modal') closeConfirmModal(false);
  });
}

export function showConfirm(message, {
  title = 'Confirm',
  okLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
} = {}) {
  return new Promise((resolve) => {
    confirmResolve = resolve;
    const titleEl = document.getElementById('confirm-modal-title');
    const msgEl = document.getElementById('confirm-modal-message');
    const okBtn = document.getElementById('confirm-modal-ok');
    const cancelBtn = document.getElementById('confirm-modal-cancel');
    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = message;
    if (okBtn) {
      okBtn.textContent = okLabel;
      okBtn.className = danger ? 'btn btn-danger' : 'btn btn-primary';
    }
    if (cancelBtn) cancelBtn.textContent = cancelLabel;
    document.getElementById('confirm-modal')?.classList.add('show');
  });
}

// ── Tab Routing ──────────────────────────────────────────────
function getActiveTab() {
  return document.querySelector('.nav-tab.active')?.dataset.tab || 'coach';
}

function flushAutosavesInBackground() {
  flushAllAutosaves().catch((err) => console.error('autosave flush:', err));
}

/** Map vertical mouse wheel to horizontal scroll on chip/slot rows (desktop). */
function setupHorizontalWheelScroll() {
  const selector = '.day-progress-chips, .meal-slots';
  document.addEventListener('wheel', (e) => {
    const el = e.target.closest(selector);
    if (!el || el.scrollWidth <= el.clientWidth) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    e.preventDefault();
    el.scrollLeft += e.deltaY;
  }, { passive: false });
}

function updateTabChrome(activeTab) {
  const isProgress = activeTab === 'progress';
  const isToday = activeTab === 'coach';
  document.querySelector('.app-sticky-header')?.classList.toggle('header--progress', isProgress);
  // Next Step + day chips belong on Today only (Food/Plan keep macros + date).
  document.getElementById('day-progress')?.classList.toggle('hidden', !isToday);
  // Account icon / sheet are Progress-only.
  if (!isProgress) closeProfileSheet();
}

function setupTabs() {
  document.querySelectorAll('.nav-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      switchToTab(tab.dataset.tab);
    });
  });
}

function syncAppRoute() {
  writeAppRoute(getActiveTab(), state.currentDate, { todayIso: formatToday() });
}

function switchToTab(tabName, { skipRouteSync = false, skipFlush = false, skipTabLoad = false, foodAutoOpenSheet = false } = {}) {
  if (!isValidAppTab(tabName)) return;

  if (!skipFlush) flushAutosavesInBackground();

  document.querySelectorAll('.nav-tab').forEach((t) => {
    t.classList.toggle('active', t.dataset.tab === tabName);
  });
  document.querySelectorAll('.tab-content').forEach((c) => {
    c.classList.toggle('active', c.id === `tab-${tabName}`);
  });
  updateTabChrome(tabName);

  if (!skipTabLoad) {
    if (tabName === 'coach') loadTodayData();
    if (tabName === 'food') loadFoodData({ autoOpenSheet: foodAutoOpenSheet });
    if (tabName === 'week') loadWeekView();
    if (tabName === 'progress') loadProgressView();
  }

  if (!skipRouteSync) syncAppRoute();
}

export { switchToTab };

async function applyAppRouteFromHash() {
  if (!booted) return;
  const route = parseAppRouteHash();
  let dateChanged = false;

  if (route.date) {
    const nextIso = formatDate(route.date);
    const currentIso = formatDate(state.currentDate);
    if (nextIso !== currentIso) {
      state.currentDate = route.date;
      dateChanged = true;
    }
  }

  if (dateChanged) {
    await onDateChange();
  }

  if (route.tab !== getActiveTab()) {
    switchToTab(route.tab, { skipRouteSync: true });
  }

  syncAppRoute();
}

function setupAppRoute() {
  window.addEventListener('hashchange', () => {
    applyAppRouteFromHash().catch((err) => console.error('applyAppRouteFromHash:', err));
  });
}

// ── Date Navigation ──────────────────────────────────────────
function setupDateNav() {
  document.getElementById('date-prev').addEventListener('click', async () => {
    await flushAllAutosaves();
    const d = new Date(state.currentDate);
    d.setDate(d.getDate() - 1);
    state.currentDate = d;
    onDateChange();
  });
  document.getElementById('date-next').addEventListener('click', async () => {
    if (!canGoNextDay()) return;
    await flushAllAutosaves();
    const d = new Date(state.currentDate);
    d.setDate(d.getDate() + 1);
    state.currentDate = d;
    onDateChange();
  });
  document.getElementById('date-today-btn').addEventListener('click', async () => {
    await flushAllAutosaves();
    state.currentDate = new Date();
    onDateChange();
  });
}

async function onDateChange() {
  invalidateWeekStatsCache();
  invalidateFoodLogsCache();
  clearSaveState();
  resetCoachEditModeForDate();
  setContentLoading(true);
  try {
    updateDateDisplay();
    const activeTab = getActiveTab();
    await loadPlan();
    const loads = [loadTodayData()];
    if (activeTab === 'progress') {
      loads.push(loadBodyCompForDate(getToday()));
    }
    await Promise.all(loads);

    syncWeekViewMonday();
    if (activeTab === 'food') {
      await loadFoodData();
    } else if (activeTab === 'week') {
      await loadWeekView();
    }
    updatePreviewMode();
    refreshDebrief();
    await checkAndRenderGapReturn({ viewingToday: isViewingToday() });
  } finally {
    setContentLoading(false);
    updateDateDisplay();
    syncAppRoute();
  }
}

function setContentLoading(loading, { overlay = false } = {}) {
  document.querySelector('.app-container')?.classList.toggle('is-content-loading', loading);
  document.getElementById('plan-card')?.classList.toggle('is-loading', loading);
  document.getElementById('date-prev')?.classList.toggle('is-loading', loading);
  document.getElementById('date-next')?.classList.toggle('is-loading', loading);
  if (overlay) {
    setOverlayLoading('content-loading-overlay', loading);
  }

  if (loading) {
    const directive = document.getElementById('plan-directive');
    if (directive) directive.innerHTML = skeletonPlanHtml();
    const summary = document.getElementById('plan-training-summary');
    if (summary) summary.textContent = '';
  }
}

async function openDayFromWeek(dateStr) {
  await flushAllAutosaves();
  const [year, month, day] = dateStr.split('-').map(Number);
  state.currentDate = new Date(year, month - 1, day);
  await onDateChange();
  switchToTab('coach');
}

function updateDateDisplay() {
  const viewingToday = isViewingToday();
  const viewingFuture = isViewingFuture();
  const offTodayBar = document.getElementById('date-off-today-bar');
  const hintEl = document.getElementById('date-off-today-hint');
  const nextBtn = document.getElementById('date-next');

  const dateEl = document.getElementById('date-display');
  if (dateEl) {
    dateEl.textContent = formatDayDisplay(state.currentDate);
    dateEl.dataset.iso = formatDate(state.currentDate);
  }
  offTodayBar?.classList.toggle('hidden', viewingToday);
  nextBtn.disabled = !canGoNextDay();

  if (hintEl) {
    if (viewingFuture) {
      hintEl.textContent = 'Preview — log on the day';
    } else if (isViewingPast()) {
      hintEl.textContent = 'Viewing a past date';
    }
  }
}

function updatePreviewMode() {
  const future = isViewingFuture();

  /* Cards that are always available outside future preview. */
  const alwaysRestore = ['vitals-card', 'meals-summary-card', 'notes-card'];
  alwaysRestore.forEach((id) => {
    document.getElementById(id)?.classList.toggle('hidden', future);
  });
  /* day-progress is Today-only chrome; do not unhide it on Food/Plan/Progress. */
  document.getElementById('day-progress')?.classList.toggle(
    'hidden',
    future || getActiveTab() !== 'coach',
  );

  /*
    Training + supplements: hide on future only.
    When leaving future, do NOT force-unhide — renderTrainingCard() /
    loadSupplements() already set the correct day/profile visibility in
    loadTodayData() before this runs. Blindly removing `hidden` was unhiding
    training on Rest/AR and supplements when the profile hides that card.
  */
  if (future) {
    document.getElementById('training-card')?.classList.add('hidden');
    document.getElementById('supplements-card')?.classList.add('hidden');
  }
}

// ── Load Plan for Current Date ───────────────────────────────
async function loadPlan() {
  const date = getToday();
  state.planFetchError = false;
  try {
    const plan = await fetchDailyPlan(date);
    if (plan) {
      state.currentPlan = mergePlanWithFallback(plan, date);
    } else {
      state.currentPlan = getFallbackPlan(date);
    }
  } catch (err) {
    console.error('loadPlan:', err);
    state.planFetchError = true;
    state.currentPlan = null;
  }

  updateDayTypeBadge();
}

export async function reloadPlan() {
  await loadPlan();
}

function updateDayTypeBadge() {
  const el = document.getElementById('date-day-type');
  if (state.planFetchError) {
    el.textContent = 'Plan unavailable';
    el.innerHTML = '';
    renderSessionStatusChip(null);
    return;
  }
  if (!state.currentPlan) {
    el.textContent = 'No plan for this date';
    el.innerHTML = '';
    renderSessionStatusChip(null);
    return;
  }
  el.innerHTML = renderDayBadge(state.currentPlan.day_type);
  renderSessionStatusChip(state.currentPlan);
}

// ── Fallback plan ────────────────────────────────────────────
// Live plans live in Supabase daily_plans only (no embedded week table).
export function getFallbackPlan(_date) {
  return null;
}

/** No-op when no embedded fallback exists; returns plan unchanged. */
export function patchPlanWarmup(plan, _date) {
  return plan || null;
}

// ── Get meal slots for current day ───────────────────────────
export function getCurrentMealSlots() {
  return slotsForPlan(state.currentPlan);
}

// ── Auth gate ────────────────────────────────────────────────
function showAuth(message = '') {
  const errorEl = document.getElementById('auth-error');
  if (errorEl) errorEl.textContent = message;
  document.getElementById('auth-screen').classList.add('show');
  document.querySelector('.app-container')?.classList.add('hidden');
  document.querySelector('.bottom-nav')?.classList.add('hidden');
  document.getElementById('setup-screen')?.classList.remove('show');
}

function hideAuth() {
  document.getElementById('auth-screen').classList.remove('show');
  document.querySelector('.app-container')?.classList.remove('hidden');
  document.querySelector('.bottom-nav')?.classList.remove('hidden');
}

/** Full-screen gate spinner — used while resolving session (not the sign-in button). */
function setAuthGateLoading(loading) {
  setOverlayLoading('auth-loading-overlay', loading);
}

function setupAuth() {
  const form = document.getElementById('auth-form');
  const errorEl = document.getElementById('auth-error');
  const submitBtn = document.getElementById('auth-submit');
  const toggleBtn = document.getElementById('auth-toggle');
  const titleEl = document.getElementById('auth-title');
  const nameGroup = document.getElementById('auth-name-group');
  let isSignUp = false;

  toggleBtn.addEventListener('click', () => {
    isSignUp = !isSignUp;
    titleEl.textContent = isSignUp ? 'Sign up' : 'Sign in';
    submitBtn.textContent = isSignUp ? 'Sign up' : 'Sign in';
    toggleBtn.textContent = isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up';
    nameGroup.classList.toggle('hidden', !isSignUp);
    errorEl.textContent = '';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.textContent = '';
    const idleLabel = isSignUp ? 'Sign up' : 'Sign in';
    setButtonLoading(submitBtn, true, idleLabel);
    try {
      let session = null;
      if (isSignUp) {
        const data = await signUp(
          document.getElementById('auth-email').value.trim(),
          document.getElementById('auth-password').value,
          document.getElementById('auth-name').value.trim()
        );
        session = data.session;
        if (!session) {
          errorEl.textContent = 'Check your email to confirm, then sign in.';
          return;
        }
      } else {
        const data = await signIn(
          document.getElementById('auth-email').value.trim(),
          document.getElementById('auth-password').value
        );
        session = data.session;
      }
      await enterApp(session);
    } catch (err) {
      errorEl.textContent = err.message || 'Failed';
    } finally {
      setButtonLoading(submitBtn, false, idleLabel);
    }
  });

  initAccount({ onSignOut: signOutAndReset });
}

async function signOutAndReset() {
  await signOut();
  setCurrentUserId(null);
  clearDbAthleteProfileCache();
  document.getElementById('setup-screen')?.classList.remove('show');
  booted = false;
  showAuth();
}

let booted = false;
let setupInited = false;
let enterAppInFlight = null;

async function enterApp(session) {
  if (enterAppInFlight) return enterAppInFlight;

  enterAppInFlight = (async () => {
    const active = session || (await loadSession());
    if (!active?.user) {
      showAuth('Sign-in succeeded but session did not start. Try again.');
      return;
    }

    // Already in the app for this user (e.g. SIGNED_IN after form enterApp)
    if (booted && getCurrentUserId() === active.user.id) {
      hideAuth();
      refreshAccountChrome();
      return;
    }

    setCurrentUserId(active.user.id);

    const { needsSetup } = await ensureAthleteProfileReady();
    refreshAccountChrome();
    if (needsSetup) {
      document.getElementById('auth-screen').classList.remove('show');
      document.querySelector('.app-container')?.classList.add('hidden');
      document.querySelector('.bottom-nav')?.classList.add('hidden');
      openSetup({ edit: false });
      return;
    }

    hideAuth();
    setContentLoading(true, { overlay: true });
    try {
      await bootApp();
    } finally {
      setContentLoading(false, { overlay: true });
    }
  })().finally(() => {
    enterAppInFlight = null;
  });

  return enterAppInFlight;
}

async function bootApp() {
  if (booted) {
    await onDateChange();
    return;
  }
  booted = true;

  const route = parseAppRouteHash();
  if (route.date) {
    state.currentDate = route.date;
  }

  setupTabs();
  setupDateNav();
  setupAppRoute();
  setupConfirmModal();
  setupModalFocusTraps();
  setupGapReturn();
  initSaveState();
  setupAutosaveLifecycle();
  setupHorizontalWheelScroll();
  updateDateDisplay();
  await loadPlan();
  initToday();
  setupCoachLayout();
  setupObservationCoach();
  initFood();
  initWeek(openDayFromWeek);
  initProgress();
  initDebrief();
  initDayProgress();
  await loadTodayData();
  updatePreviewMode();
  await checkAndRenderGapReturn({ viewingToday: isViewingToday() });

  // Keep friends' seeded window filled without hand-holding
  const dbProfile = getDbAthleteProfile();
  if (dbProfile?.week_template?.length) {
    ensurePlansExtended(dbProfile, { days: 14, minRemaining: 3 }).catch(() => {});
  }

  if (route.tab !== 'coach') {
    switchToTab(route.tab, { skipRouteSync: true });
  }
  syncAppRoute();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register(`sw.js?v=39`).catch(() => {});
  }
}

function ensureSetupInited() {
  if (setupInited) return;
  setupInited = true;
  initSetup({
    onComplete: async () => {
      hideAuth();
      document.querySelector('.app-container')?.classList.remove('hidden');
      document.querySelector('.bottom-nav')?.classList.remove('hidden');
      setContentLoading(true, { overlay: true });
      try {
        await bootApp();
      } finally {
        setContentLoading(false, { overlay: true });
      }
    },
  });
}

// ── Init ─────────────────────────────────────────────────────
async function init() {
  // First paint: loading only (overlay is-active in HTML). Never flash login.
  setAuthGateLoading(true);

  try {
    await initSupabase();
  } catch (err) {
    console.error('initSupabase:', err);
    setAuthGateLoading(false);
    showAuth('Could not load app. Check your connection and refresh.');
    return;
  }

  setupAuth();
  ensureSetupInited();

  initAuthListeners(
    async (session) => {
      await enterApp(session);
    },
    () => {
      setCurrentUserId(null);
      clearDbAthleteProfileCache();
      booted = false;
      setAuthGateLoading(false);
      showAuth();
    }
  );

  try {
    const session = await loadSession();
    if (session?.user) {
      await enterApp(session);
    } else {
      showAuth();
    }
  } catch (err) {
    console.error('init session:', err);
    showAuth('Could not restore session. Please sign in.');
  } finally {
    setAuthGateLoading(false);
  }
}

document.addEventListener('DOMContentLoaded', init);
