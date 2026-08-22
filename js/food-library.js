// User food library + OFF discovery UI helpers (Phase C)
import {
  fetchUserCustomFoods,
  upsertUserCustomFood,
  deleteUserCustomFood,
} from './supabase.js';
import { searchOpenFoodFacts, lookupOpenFoodFactsBarcode } from './food-lookup-off.js';
import { showToast } from './app.js';

let libraryCache = [];

export function getUserFoodLibrary() {
  return libraryCache;
}

export async function loadUserFoodLibrary() {
  libraryCache = await fetchUserCustomFoods();
  return libraryCache;
}

export function libraryAsFoodItems() {
  return libraryCache.map((row) => ({
    id: `lib_${row.id}`,
    libId: row.id,
    name: row.name,
    protein: Number(row.protein) || 0,
    calories: Number(row.calories) || 0,
    fat: Number(row.fat) || 0,
    unit: row.unit || '1',
    source: row.source || 'manual',
    emoji: '★',
    fromLibrary: true,
  }));
}

export async function saveFoodToLibrary(draft) {
  const saved = await upsertUserCustomFood({
    id: draft.libId || draft.id || undefined,
    name: draft.name,
    protein: draft.protein,
    calories: draft.calories,
    fat: draft.fat ?? 0,
    carbs: draft.carbs ?? null,
    unit: draft.unit || '1',
    barcode: draft.barcode || null,
    source: draft.source || 'manual',
  });
  if (saved) {
    await loadUserFoodLibrary();
  }
  return saved;
}

export async function removeFoodFromLibrary(libId) {
  const ok = await deleteUserCustomFood(libId);
  if (ok) await loadUserFoodLibrary();
  return ok;
}

export async function runOffSearch(query) {
  try {
    return await searchOpenFoodFacts(query, { limit: 8 });
  } catch (err) {
    console.error('runOffSearch:', err);
    showToast('Lookup failed — try again or add manually', { variant: 'error' });
    return [];
  }
}

export async function runOffBarcode(code) {
  try {
    return await lookupOpenFoodFactsBarcode(code);
  } catch (err) {
    console.error('runOffBarcode:', err);
    showToast(err.message || 'Barcode lookup failed', { variant: 'error' });
    return null;
  }
}

export function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
