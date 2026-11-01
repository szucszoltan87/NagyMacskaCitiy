import type { Cat, Diet, FoodId, FoodKind } from './types';

export function canEat(diet: Diet, kind: FoodKind): boolean {
  return kind === 'mindenki' || kind === diet;
}

export function refusal(diet: Diet): string {
  return diet === 'vega' ? 'Köszi, de én vega vagyok! 🥕' : 'Köszi, de én húsevő vagyok! 🍖';
}

const BABY_FOODS: FoodId[] = ['cumisuveg', 'tej'];

/** Ha a macska nem eheti meg, a visszautasítás szövege; különben null. Éttermi ételnél a food null. */
export function refusalFor(cat: Cat, food: FoodId | null, kind: FoodKind): string | null {
  if (cat.age === 'baba') return food && BABY_FOODS.includes(food) ? null : 'Baba vagyok, cumisüveget kérek! 🍼';
  if (!canEat(cat.diet, kind)) return refusal(cat.diet);
  return null;
}
