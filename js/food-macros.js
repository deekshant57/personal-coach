// Custom food macro lookup — mirrors resolve-custom-food-macros skill (client-side)
import { CUSTOM_FOODS_REGISTRY } from './custom-foods-registry.js';
import { FOOD_ITEMS, sumItemsMacros } from './data.js';

const REGISTRY_ALIASES = {
  '1 cup coffee': '1 cup coffee with milk',
  'coffee with milk': '1 cup coffee with milk',
  'paneer chili': '1 bowl paneer chilli',
  'paneer chilli': '1 bowl paneer chilli',
  'paneer chiili': '1 bowl paneer chilli',
  '1 bowl paneer chili': '1 bowl paneer chilli',
  '1 bowl paneer chiili': '1 bowl paneer chilli',
  '1 aloo tikki protein plus burger by mcd': '1 aloo tikki protein plus burger by mcd',
  'mcd aloo tikki protein plus burger': '1 aloo tikki protein plus burger by mcd',
};

export function normalizeFoodName(name) {
  return (name || '')
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/chiili/g, 'chilli')
    .replace(/\s+/g, ' ')
    .trim();
}

function lookupRegistryEntry(key) {
  const entry = CUSTOM_FOODS_REGISTRY[key];
  if (!entry) return null;
  const protein = Number(entry.protein) || 0;
  const calories = Number(entry.calories) || 0;
  if (protein <= 0 && calories <= 0) return null;
  return { protein, calories, source: entry.source || 'registry' };
}

function lookupGridItem(name) {
  const key = normalizeFoodName(name);
  const direct = FOOD_ITEMS.find((f) => normalizeFoodName(f.name) === key);
  if (direct) {
    return { protein: direct.protein, calories: direct.calories, source: 'grid' };
  }
  const contained = FOOD_ITEMS
    .filter((f) => key.includes(normalizeFoodName(f.name)))
    .sort((a, b) => normalizeFoodName(b.name).length - normalizeFoodName(a.name).length)[0];
  if (contained && normalizeFoodName(contained.name).length >= 3) {
    return { protein: contained.protein, calories: contained.calories, source: 'grid' };
  }
  return null;
}

function lookupRegistrySubstring(key) {
  let best = null;
  let bestLen = 0;
  for (const [registryKey, entry] of Object.entries(CUSTOM_FOODS_REGISTRY)) {
    const nk = normalizeFoodName(registryKey);
    if (nk.length < 4) continue;
    if (key === nk || key.includes(nk) || nk.includes(key)) {
      const protein = Number(entry.protein) || 0;
      const calories = Number(entry.calories) || 0;
      if (protein <= 0 && calories <= 0) continue;
      if (nk.length > bestLen) {
        bestLen = nk.length;
        best = { protein, calories, source: entry.source || 'registry-fuzzy' };
      }
    }
  }
  return best;
}

/** Single food name — no composite split */
export function lookupRegistrySingle(name) {
  const key = normalizeFoodName(name);
  if (!key || key === 'skipped') return null;

  const aliasKey = REGISTRY_ALIASES[key];
  if (aliasKey) {
    const aliased = lookupRegistryEntry(normalizeFoodName(aliasKey));
    if (aliased) return aliased;
  }

  const exact = lookupRegistryEntry(key);
  if (exact) return exact;

  const grid = lookupGridItem(key);
  if (grid) return grid;

  return lookupRegistrySubstring(key);
}

export function lookupRegistry(name) {
  const key = normalizeFoodName(name);
  if (!key || key === 'skipped') return null;

  const single = lookupRegistrySingle(name);
  if (single) return single;

  if (key.includes(' and ')) {
    const parts = key.split(' and ').map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      let protein = 0;
      let calories = 0;
      let matched = 0;
      for (const part of parts) {
        const macros = lookupRegistrySingle(part);
        if (macros) {
          protein += macros.protein;
          calories += macros.calories;
          matched += 1;
        }
      }
      if (matched === parts.length) {
        return { protein, calories, source: 'composite' };
      }
    }
  }

  return null;
}

export function isCustomFoodItem(item) {
  return String(item?.id || '').startsWith('custom_');
}

export function needsMacroResolve(item) {
  if (!isCustomFoodItem(item)) return false;
  const protein = item.protein || 0;
  const calories = item.calories || 0;
  return protein <= 0 || calories <= 0;
}

/** Per-meal or slot summary — show partial totals even when some items lack macros. */
export function formatMealMacroLabel(protein, calories, items = []) {
  const unresolved = items.filter(needsMacroResolve).length;
  const hasMacros = protein > 0 || calories > 0;

  if (!hasMacros && unresolved > 0) {
    return 'tap Food → Edit';
  }

  const base = `${Math.round(protein)}g P · ~${Math.round(calories).toLocaleString()} kcal`;
  if (unresolved > 0) {
    return `${base} (+${unresolved} need macros)`;
  }
  return base;
}

export function parseFoodLogItems(raw) {
  if (!raw) return [];
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }
  return Array.isArray(raw) ? raw : [];
}

export function resolveItemMacros(item) {
  const macros = lookupRegistry(item.name);
  if (!macros) return { item, resolved: false };

  const key = normalizeFoodName(item.name);
  const exactRegistry = !!CUSTOM_FOODS_REGISTRY[key];
  const next = { ...item };
  let changed = false;

  if (needsMacroResolve(item)) {
    if ((next.protein || 0) <= 0 && macros.protein > 0) {
      next.protein = macros.protein;
      changed = true;
    }
    if ((next.calories || 0) <= 0 && macros.calories > 0) {
      next.calories = macros.calories;
      changed = true;
    }
  } else if (exactRegistry && isCustomFoodItem(item)) {
    if ((next.protein || 0) < macros.protein) {
      next.protein = macros.protein;
      changed = true;
    }
    if ((next.calories || 0) < macros.calories) {
      next.calories = macros.calories;
      changed = true;
    }
  }

  return { item: next, resolved: changed, source: macros.source };
}

export function resolveLogItems(items) {
  let anyResolved = false;
  const resolved = (items || []).map((item) => {
    const result = resolveItemMacros(item);
    if (result.resolved) anyResolved = true;
    return result.item;
  });
  return { items: resolved, anyResolved };
}

function notesAlreadyInItems(items, notes) {
  const normNotes = normalizeFoodName(notes);
  return (items || []).some((i) => {
    const normItem = normalizeFoodName(i.name);
    return normItem === normNotes || normItem.includes(normNotes) || normNotes.includes(normItem);
  });
}

/** Notes-only row where notes text matches registry → synthetic custom item */
export function itemFromNotesOnly(notes) {
  const trimmed = (notes || '').trim();
  if (!trimmed || normalizeFoodName(trimmed) === 'skipped') return null;
  const macros = lookupRegistry(trimmed);
  if (!macros) return null;
  return {
    id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: trimmed,
    protein: macros.protein,
    calories: macros.calories,
    qty: 1,
  };
}

/** When items exist but notes describe additional food, append registry match */
export function appendItemFromNotes(items, notes) {
  const trimmed = (notes || '').trim();
  if (!trimmed || notesAlreadyInItems(items, trimmed)) {
    return { items: items || [], added: false };
  }
  const fromNotes = itemFromNotesOnly(trimmed);
  if (!fromNotes) return { items: items || [], added: false };
  return { items: [...(items || []), fromNotes], added: true };
}

export function enrichLogItems(items, notes) {
  let next = [...(items || [])];
  let addedFromNotes = false;

  if (next.length === 0 && notes) {
    const fromNotes = itemFromNotesOnly(notes);
    if (fromNotes) {
      next = [fromNotes];
      addedFromNotes = true;
    }
  } else if (next.length > 0 && notes) {
    const appended = appendItemFromNotes(next, notes);
    next = appended.items;
    addedFromNotes = appended.added;
  }

  const { items: resolved, anyResolved } = resolveLogItems(next);
  return { items: resolved, anyResolved, addedFromNotes };
}

export function macrosFromResolvedLog(log) {
  const notes = (log.custom_text || '').trim();
  const rawItems = parseFoodLogItems(log.items);
  const { items: resolved } = enrichLogItems(rawItems, notes);
  const fromItems = sumItemsMacros(resolved);
  return {
    items: resolved,
    notes,
    protein: fromItems.protein,
    calories: fromItems.calories,
    fromItems,
  };
}

export function analyzeFoodLog(log) {
  const notes = (log.custom_text || '').trim();
  const { items: resolved } = enrichLogItems(parseFoodLogItems(log.items), notes);
  const notesOnly = parseFoodLogItems(log.items).length === 0 && !!notes;
  const notesMatch = notesOnly ? !!lookupRegistry(notes) : false;
  const unresolved = resolved.filter(needsMacroResolve);

  return {
    slot: log.meal_slot,
    items: resolved,
    notes,
    notesOnly,
    notesMatch,
    unresolved,
  };
}

export function analyzeDayFoodLogs(logs, slotLabels = {}) {
  const issues = [];
  for (const log of logs || []) {
    const analysis = analyzeFoodLog(log);
    const label = slotLabels[analysis.slot] || analysis.slot;

    if (analysis.notesOnly && !analysis.notesMatch) {
      issues.push({
        type: 'notes-only',
        slot: analysis.slot,
        label,
        message: `${label}: notes only — add a Custom item named "${analysis.notes.slice(0, 40)}${analysis.notes.length > 40 ? '…' : ''}"`,
      });
      continue;
    }

    for (const item of analysis.unresolved) {
      const hint = lookupRegistry(item.name)
        ? 'macros known — refresh to apply'
        : 'tap Edit to add protein and calories';
      issues.push({
        type: 'missing-macros',
        slot: analysis.slot,
        label,
        itemId: item.id,
        itemName: item.name,
        message: `${label}: "${item.name}" — ${hint}`,
      });
    }

    if (analysis.notes && analysis.items.length > 0 && !notesAlreadyInItems(analysis.items, analysis.notes)) {
      if (!lookupRegistry(analysis.notes)) {
        issues.push({
          type: 'notes-unresolved',
          slot: analysis.slot,
          label,
          message: `${label}: notes "${analysis.notes.slice(0, 35)}${analysis.notes.length > 35 ? '…' : ''}" not in food library — add as Custom item`,
        });
      }
    }
  }
  return issues;
}

export function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
