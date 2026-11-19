/**
 * User-visible completion must match authoritative persist, not intent.
 * Pending Save & Close / Mark as Done must not show Done until persist succeeds.
 */
export function visibleCompletionState({ persistSucceeded, intendedDone }) {
  const done = persistSucceeded === true && intendedDone === true;
  return {
    visibleDone: done,
    authoritativeDone: done,
  };
}

/**
 * Save & Close sequencer: validation + persistence must finish before exit.
 * Never exit while completion is pending or failed.
 *
 * @param {{
 *   complete: () => Promise<{ ok: boolean } | { ok: boolean }>,
 *   exit: () => void,
 *   onFail?: (result: { ok: boolean, reason?: string }) => void,
 * }} opts
 * @returns {Promise<{ exited: boolean, result: { ok: boolean, reason?: string } }>}
 */
export async function completeThenExitSession({ complete, exit, onFail }) {
  let result;
  try {
    result = await complete();
  } catch {
    result = { ok: false, reason: 'error' };
  }

  if (!result?.ok) {
    onFail?.(result);
    return { exited: false, result: result || { ok: false } };
  }

  exit();
  return { exited: true, result };
}
