// Open Food Facts lookup (Phase C)
// ODbL — attribute in UI. Always confirm macros before save.

const OFF_UA = 'PersonalCoachApp/1.0 (local PWA; food logging)';
const OFF_SEARCH = 'https://world.openfoodfacts.org/cgi/search.pl';
const OFF_PRODUCT = 'https://world.openfoodfacts.org/api/v2/product';

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function pickNutrient(n, keys) {
  for (const k of keys) {
    const v = num(n?.[k]);
    if (v != null) return v;
  }
  return 0;
}

/** Normalize OFF product JSON → editable food draft (per 100g). */
export function normalizeOffProduct(product, { barcode = null } = {}) {
  if (!product) return null;
  const n = product.nutriments || {};
  const name = product.product_name
    || product.product_name_en
    || product.generic_name
    || product.brands
    || 'Unknown product';

  const calories = pickNutrient(n, [
    'energy-kcal_100g', 'energy-kcal', 'energy-kcal_serving',
  ]);
  // energy in kJ → rough kcal if needed
  let kcal = calories;
  if (!kcal) {
    const kj = pickNutrient(n, ['energy_100g', 'energy']);
    if (kj) kcal = Math.round(kj / 4.184);
  }

  const protein = pickNutrient(n, ['proteins_100g', 'proteins', 'proteins_serving']);
  const fat = pickNutrient(n, ['fat_100g', 'fat', 'fat_serving']);
  const carbs = pickNutrient(n, ['carbohydrates_100g', 'carbohydrates', 'carbohydrates_serving']);

  return {
    name: String(name).trim().slice(0, 120),
    protein: Math.round(protein * 10) / 10,
    calories: Math.round(kcal),
    fat: Math.round(fat * 10) / 10,
    carbs: Math.round(carbs * 10) / 10,
    unit: '100g',
    barcode: barcode || product.code || null,
    source: 'off',
    brand: product.brands || null,
  };
}

export async function searchOpenFoodFacts(query, { limit = 8 } = {}) {
  const q = (query || '').trim();
  if (q.length < 2) return [];

  const params = new URLSearchParams({
    search_terms: q,
    search_simple: '1',
    action: 'process',
    json: '1',
    page_size: String(limit),
  });

  const res = await fetch(`${OFF_SEARCH}?${params}`, {
    headers: { 'User-Agent': OFF_UA },
  });
  if (!res.ok) throw new Error(`OFF search failed (${res.status})`);
  const data = await res.json();
  const products = data.products || [];
  return products
    .map((p) => normalizeOffProduct(p))
    .filter((p) => p && (p.calories > 0 || p.protein > 0));
}

export async function lookupOpenFoodFactsBarcode(barcode) {
  const code = String(barcode || '').replace(/\D/g, '');
  if (code.length < 8) throw new Error('Enter a valid barcode');

  const res = await fetch(`${OFF_PRODUCT}/${code}.json`, {
    headers: { 'User-Agent': OFF_UA },
  });
  if (!res.ok) throw new Error(`OFF barcode failed (${res.status})`);
  const data = await res.json();
  if (data.status !== 1 || !data.product) return null;
  return normalizeOffProduct(data.product, { barcode: code });
}
