import type { Edible, FoodId, FoodKind, MealId } from '../sim/types';

const e = (name: string, emoji: string, kind: FoodKind, price: number, etel: number, ital: number, jokedv: number): Edible =>
  ({ name, emoji, kind, price, etel, ital, jokedv });

export const FOODS: Record<FoodId, Edible> = {
  repa: e('Répa', '🥕', 'vega', 2, 30, 0, 2),
  alma: e('Alma', '🍎', 'vega', 2, 25, 5, 3),
  salata: e('Saláta', '🥬', 'vega', 2, 25, 5, 0),
  bab: e('Bab', '🫘', 'vega', 3, 40, 0, 0),
  hal: e('Hal', '🐟', 'husevo', 4, 45, 0, 3),
  csirke: e('Csirke', '🍗', 'husevo', 4, 45, 0, 3),
  tojas: e('Tojás', '🥚', 'husevo', 3, 35, 0, 0),
  kenyer: e('Kenyér', '🍞', 'mindenki', 2, 30, 0, 0),
  teszta: e('Tészta', '🍝', 'mindenki', 3, 40, 0, 2),
  tej: e('Tej', '🥛', 'mindenki', 2, 10, 35, 3),
  gyumolcsle: e('Gyümölcslé', '🧃', 'mindenki', 2, 0, 40, 4),
};
export const FOOD_IDS = Object.keys(FOODS) as FoodId[];

export const MEALS: Record<MealId, Edible> = {
  zoldsegleves: e('Zöldségleves', '🍲', 'vega', 5, 60, 15, 10),
  gyumolcstal: e('Gyümölcstál', '🍉', 'vega', 4, 40, 15, 12),
  pizza: e('Pizza', '🍕', 'mindenki', 5, 60, 0, 15),
  halastal: e('Halas tál', '🍣', 'husevo', 6, 70, 0, 12),
  hamburger: e('Hamburger', '🍔', 'husevo', 6, 70, 0, 12),
};
export const MEAL_IDS = Object.keys(MEALS) as MealId[];

export const KIND_ICON: Record<FoodKind, string> = { vega: '🥕', husevo: '🍖', mindenki: '😋' };
