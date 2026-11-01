import type { BuildingId, Edible, FoodId, FoodKind, MealId, RecipeId } from '../sim/types';

const e = (name: string, emoji: string, kind: FoodKind, price: number, etel: number, ital: number, jokedv: number): Edible =>
  ({ name, emoji, kind, price, etel, ital, jokedv });

type BasicFoodId = Exclude<FoodId, RecipeId>;

/** A boltban kapható alapanyagok. */
export const FOODS: Record<BasicFoodId, Edible> = {
  repa: e('Répa', '🥕', 'vega', 2, 30, 0, 2),
  alma: e('Alma', '🍎', 'vega', 2, 25, 5, 3),
  salata: e('Saláta', '🥬', 'vega', 2, 25, 5, 0),
  bab: e('Bab', '🫘', 'vega', 3, 40, 0, 0),
  paradicsom: e('Paradicsom', '🍅', 'vega', 2, 20, 10, 2),
  hal: e('Hal', '🐟', 'husevo', 4, 45, 0, 3),
  csirke: e('Csirke', '🍗', 'husevo', 4, 45, 0, 3),
  tojas: e('Tojás', '🥚', 'husevo', 3, 35, 0, 0),
  kenyer: e('Kenyér', '🍞', 'mindenki', 2, 30, 0, 0),
  teszta: e('Tészta', '🍝', 'mindenki', 3, 40, 0, 2),
  sajt: e('Sajt', '🧀', 'mindenki', 3, 35, 0, 3),
  tej: e('Tej', '🥛', 'mindenki', 2, 10, 35, 3),
  gyumolcsle: e('Gyümölcslé', '🧃', 'mindenki', 2, 0, 40, 4),
  cumisuveg: e('Cumisüveg', '🍼', 'mindenki', 2, 40, 30, 5),
};
export const FOOD_IDS = Object.keys(FOODS) as BasicFoodId[];

/** Főzéssel készülő ételek (az étteremben, szakáccsal). */
export interface Recipe { a: BasicFoodId; b: BasicFoodId; dish: Edible }
const r = (a: BasicFoodId, b: BasicFoodId, dish: Edible): Recipe => ({ a, b, dish });

export const RECIPES: Record<RecipeId, Recipe> = {
  spagetti: r('teszta', 'paradicsom', e('Spagetti', '🍝', 'vega', 0, 70, 5, 15)),
  szendvics: r('kenyer', 'sajt', e('Sajtos szendvics', '🥪', 'mindenki', 0, 65, 0, 12)),
  rantotta: r('tojas', 'tej', e('Rántotta', '🍳', 'husevo', 0, 65, 5, 12)),
  halsalata: r('hal', 'salata', e('Halsaláta', '🥗', 'husevo', 0, 70, 10, 12)),
  tekercs: r('salata', 'kenyer', e('Zöldséges tekercs', '🌯', 'vega', 0, 65, 5, 12)),
  turmix: r('alma', 'tej', e('Almás turmix', '🥤', 'vega', 0, 30, 50, 15)),
  csirkesteszta: r('csirke', 'teszta', e('Csirkés tészta', '🍜', 'husevo', 0, 80, 0, 15)),
  babgulyas: r('bab', 'paradicsom', e('Babgulyás', '🥘', 'vega', 0, 80, 10, 12)),
  repatorta: r('repa', 'alma', e('Répatorta', '🍰', 'vega', 0, 55, 0, 20)),
  pizzaszelet: r('sajt', 'paradicsom', e('Pizzaszelet', '🍕', 'vega', 0, 70, 0, 18)),
};
export const RECIPE_IDS = Object.keys(RECIPES) as RecipeId[];

export function edible(id: FoodId): Edible {
  return id in FOODS ? FOODS[id as BasicFoodId] : RECIPES[id as RecipeId].dish;
}

export function findRecipe(a: FoodId, b: FoodId): RecipeId | null {
  return RECIPE_IDS.find((id) => {
    const rc = RECIPES[id];
    return (rc.a === a && rc.b === b) || (rc.a === b && rc.b === a);
  }) ?? null;
}

/** Az étel fajtája a hozzávalókból: ha van benne hús, húsos; ha van benne vega, vega; különben mindenkinek. */
export function mixKind(a: FoodKind, b: FoodKind): FoodKind {
  if (a === 'husevo' || b === 'husevo') return 'husevo';
  if (a === 'vega' || b === 'vega') return 'vega';
  return 'mindenki';
}

export const MEALS: Record<MealId, Edible> = {
  zoldsegleves: e('Zöldségleves', '🍲', 'vega', 5, 60, 15, 10),
  gyumolcstal: e('Gyümölcstál', '🍉', 'vega', 4, 40, 15, 12),
  pizza: e('Pizza', '🍕', 'mindenki', 5, 60, 0, 15),
  halastal: e('Halas tál', '🍣', 'husevo', 6, 70, 0, 12),
  hamburger: e('Hamburger', '🍔', 'husevo', 6, 70, 0, 12),
  fagyi: e('Fagyi', '🍦', 'mindenki', 2, 15, 5, 15),
  kakao: e('Forró kakaó', '☕', 'mindenki', 2, 20, 40, 15),
  mango: e('Mangó', '🥭', 'vega', 2, 35, 15, 8),
  grillcsirke: e('Grillcsirke', '🍗', 'husevo', 4, 60, 0, 10),
  banan: e('Banán', '🍌', 'vega', 2, 35, 5, 8),
  halnyars: e('Halnyárs', '🐟', 'husevo', 4, 60, 0, 10),
};

/** Melyik helyen mit lehet rendelni. */
export const MENUS: Partial<Record<BuildingId, MealId[]>> = {
  etterem: ['zoldsegleves', 'gyumolcstal', 'pizza', 'halastal', 'hamburger'],
  strand: ['fagyi'],
  kunyho: ['kakao', 'pizza'],
  szafaritabor: ['mango', 'grillcsirke'],
  fakunyho: ['banan', 'halnyars'],
};

export const KIND_ICON: Record<FoodKind, string> = { vega: '🥕', husevo: '🍖', mindenki: '😋' };
