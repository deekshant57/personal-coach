// Auto-resolve custom food macros on load — persists to Supabase when registry matches
import { upsertFoodLog } from './supabase.js';
import { sumItemsMacros } from './data.js';
import {
  parseFoodLogItems,
  resolveLogItems,
  enrichLogItems,
  needsMacroResolve,
} from './food-macros.js';

function buildResolvedRow(log) {
  const notes = (log.custom_text || '').trim();
  const rawItems = parseFoodLogItems(log.items);
  const { items: resolved, anyResolved, addedFromNotes } = enrichLogItems(rawItems, notes);
  const totals = sumItemsMacros(resolved);
  const storedP = log.total_protein || 0;
  const storedC = log.total_calories || 0;
  const itemsChanged = JSON.stringify(resolved) !== JSON.stringify(rawItems);
  const totalsChanged = Math.round(storedP) !== Math.round(totals.protein)
    || Math.round(storedC) !== Math.round(totals.calories);
  const needsPersist = anyResolved || addedFromNotes || itemsChanged || totalsChanged;

  return {
    log: {
      ...log,
      items: resolved,
      custom_text: notes || null,
      total_protein: totals.protein,
      total_calories: totals.calories,
    },
    needsPersist,
    resolvedCount: resolved.filter((i, idx) => {
      const orig = rawItems[idx];
      return orig && needsMacroResolve(orig) && !needsMacroResolve(i);
    }).length + (addedFromNotes ? 1 : 0),
  };
}

/**
 * Resolve registry macros for all logs on a date. Persists fixes silently.
 * @returns {{ logs: object[], patchedSlots: string[], resolvedCount: number }}
 */
export async function autoResolveFoodLogsForDate(date, logs) {
  if (!logs?.length) return { logs: logs || [], patchedSlots: [], resolvedCount: 0 };

  const out = [];
  const patchedSlots = [];
  let resolvedCount = 0;

  for (const log of logs) {
    const { log: resolved, needsPersist, resolvedCount: n } = buildResolvedRow(log);
    out.push(resolved);

    if (needsPersist) {
      const ok = await upsertFoodLog(
        date,
        log.meal_slot,
        resolved.items,
        resolved.custom_text,
        resolved.total_protein,
        resolved.total_calories,
      );
      if (ok) {
        patchedSlots.push(log.meal_slot);
        resolvedCount += n;
      }
    }
  }

  if (patchedSlots.length) {
    /* caller invalidates cache */
  }

  return { logs: out, patchedSlots, resolvedCount };
}
