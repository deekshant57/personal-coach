// Shared loading animation helpers (aligned 2-frame walk cycle)

export const RUNNER_FRAME_COUNT = 2;
const FRAME_MS = 180;
const FRAME_PATHS = Array.from(
  { length: RUNNER_FRAME_COUNT },
  (_, i) => `icons/runner-frames/${String(i).padStart(2, '0')}.png`,
);

let frameIndex = 0;
let lastTick = 0;
let rafId = null;
let preloadPromise = null;

function preloadFrames() {
  if (!preloadPromise) {
    preloadPromise = Promise.all(
      FRAME_PATHS.map(
        (src) =>
          new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(src);
            img.onerror = () => reject(new Error(`Failed to load ${src}`));
            img.src = src;
          }),
      ),
    );
  }
  return preloadPromise;
}

function paintFrames() {
  const src = FRAME_PATHS[frameIndex];
  document.querySelectorAll('.coach-loader__frame').forEach((el) => {
    if (el.getAttribute('src') !== src) el.setAttribute('src', src);
  });
}

function tick(ts) {
  if (!lastTick) lastTick = ts;
  if (ts - lastTick >= FRAME_MS) {
    frameIndex = (frameIndex + 1) % RUNNER_FRAME_COUNT;
    paintFrames();
    lastTick = ts;
  }
  if (document.querySelector('.coach-loader__frame')) {
    rafId = requestAnimationFrame(tick);
  } else {
    rafId = null;
    lastTick = 0;
  }
}

function ensureAnimation() {
  preloadFrames()
    .then(() => {
      paintFrames();
      if (!rafId) rafId = requestAnimationFrame(tick);
    })
    .catch(() => {});
}

const RUNNER_MARKUP = `<img class="coach-loader__frame" src="${FRAME_PATHS[0]}" alt="" decoding="async">`;

export function spinnerHtml(size = '') {
  ensureAnimation();
  const sizeClass = size ? ` coach-loader--${size}` : '';
  return `<span class="coach-loader${sizeClass}" role="status" aria-label="Loading">${RUNNER_MARKUP}</span>`;
}

export function loadingCenterHtml(message = 'Loading…') {
  return `<div class="loading-center" role="status">${spinnerHtml('lg')}<span class="loading-message">${message}</span></div>`;
}

export function loadingInlineHtml(message = 'Loading…') {
  return `<span class="loading-inline">${spinnerHtml('sm')}<span>${message}</span></span>`;
}

const buttonLabels = new WeakMap();

export function setButtonLoading(btn, loading, label = null) {
  if (!btn) return;

  if (loading) {
    if (!buttonLabels.has(btn)) {
      buttonLabels.set(btn, label ?? btn.textContent.trim());
    }
    btn.disabled = true;
    btn.classList.add('is-loading');
    const idleLabel = buttonLabels.get(btn);
    btn.innerHTML = `<span class="btn-loading-inner">${spinnerHtml('sm')}<span class="btn-loading-text">${idleLabel}</span></span>`;
    return;
  }

  btn.classList.remove('is-loading');
  btn.disabled = false;
  const idleLabel = label ?? buttonLabels.get(btn) ?? '';
  btn.textContent = idleLabel;
  buttonLabels.delete(btn);
}

export function setOverlayLoading(overlayId, loading) {
  const el = document.getElementById(overlayId);
  if (!el) return;
  el.classList.toggle('is-active', loading);
  el.setAttribute('aria-hidden', loading ? 'false' : 'true');
}

// Start preloading as soon as the module loads.
preloadFrames().then(() => {
  if (document.querySelector('.coach-loader__frame')) ensureAnimation();
});
