const CACHE_NAME = 'coach-v31';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/auth.js',
  './js/athlete-profile.js',
  './js/setup.js',
  './js/plan-seed.js',
  './js/day-shift.js',
  './js/exercise-library.js',
  './js/lift-progress.js',
  './js/food-library.js',
  './js/food-lookup-off.js',
  './js/data.js',
  './js/plan-templates.js',
  './js/plan-merge.js',
  './js/supabase.js',
  './js/today.js',
  './js/block-context.js',
  './js/coach-layout.js',
  './js/workout-log.js',
  './js/run-log.js',
  './js/food.js',
  './js/food-macros.js',
  './js/food-resolve.js',
  './js/custom-foods-registry.js',
  './js/week.js',
  './js/week-stats.js',
  './js/progress.js',
  './js/debrief.js',
  './js/day-progress.js',
  './js/supplements.js',
  './js/supplements-data.js',
  './js/supplement-adherence.js',
  './js/save-state.js',
  './js/auto-save.js',
  './js/vitals-ui.js',
  './js/spinner.js',
  './js/modal-focus.js',
  './js/gap-return.js',
  './js/gap-return-logic.js',
  './js/observation-coach.js',
  './js/observation-engine.js',
  './js/plan-summary.js',
  './js/meaningful-events.js',
  './js/meaningful-event-labels.js',
  './js/trends-data.js',
  './js/sparkline.js',
  './js/weight-trend.js',
  './js/coach-debrief.js',
  './manifest.json',
  './icons/runner.png',
  './icons/runner-sprite.png',
  './icons/runner-frames/00.png',
  './icons/runner-frames/01.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

function isShellRequest(url) {
  const path = url.pathname;
  return (
    path.endsWith('/') ||
    path.endsWith('/index.html') ||
    path.endsWith('.js') ||
    path.endsWith('.css') ||
    path.endsWith('/sw.js')
  );
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (!url.protocol.startsWith('http')) return;

  if (url.hostname.includes('supabase')) {
    event.respondWith(fetch(event.request));
    return;
  }

  if (url.hostname.includes('cdn.jsdelivr.net')) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // HTML / JS / CSS — network first so UI updates show after deploy/refresh
  if (event.request.mode === 'navigate' || isShellRequest(url)) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(event.request).then((c) => c || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return res;
      });
    })
  );
});
