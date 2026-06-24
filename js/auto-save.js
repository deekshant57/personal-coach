// Debounced Supabase auto-save — cross-device, no localStorage

const DEBOUNCE_MS = 1500;

const jobs = new Map(); // key -> { timer, execute }

let flushFood = null;
let flushTraining = null;

export function registerAutosaveFlush({ food, training } = {}) {
  if (food) flushFood = food;
  if (training) flushTraining = training;
}

export function scheduleAutosave(key, execute, delay = DEBOUNCE_MS) {
  const prev = jobs.get(key);
  if (prev?.timer) clearTimeout(prev.timer);

  const job = {
    timer: setTimeout(async () => {
      jobs.delete(key);
      try {
        await execute();
      } catch (err) {
        console.error('autosave failed:', key, err);
      }
    }, delay),
    execute,
  };
  jobs.set(key, job);
}

export function cancelAutosave(key) {
  const job = jobs.get(key);
  if (!job) return;
  if (job.timer) clearTimeout(job.timer);
  jobs.delete(key);
}

export function cancelAutosavesByPrefix(prefix) {
  for (const [key, job] of jobs) {
    if (!key.startsWith(prefix)) continue;
    if (job.timer) clearTimeout(job.timer);
    jobs.delete(key);
  }
}

export async function flushAutosave(key) {
  const job = jobs.get(key);
  if (!job) return;
  if (job.timer) clearTimeout(job.timer);
  jobs.delete(key);
  try {
    await job.execute();
  } catch (err) {
    console.error('autosave flush failed:', key, err);
    throw err;
  }
}

export async function flushAutosavesByPrefix(prefix) {
  const keys = [...jobs.keys()].filter((k) => k.startsWith(prefix));
  for (const key of keys) {
    await flushAutosave(key);
  }
}

export async function flushAllAutosaves() {
  await Promise.all([
    flushFood?.(),
    flushTraining?.(),
  ]);
  const keys = [...jobs.keys()];
  for (const key of keys) {
    await flushAutosave(key);
  }
}

export function hasPendingAutosave(key) {
  return jobs.has(key);
}

export function setupAutosaveLifecycle() {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushAllAutosaves().catch(() => {});
    }
  });
  window.addEventListener('pagehide', () => {
    flushAllAutosaves().catch(() => {});
  });
}
