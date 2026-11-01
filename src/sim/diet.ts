import type { Diet, FoodKind } from './types';

export function canEat(diet: Diet, kind: FoodKind): boolean {
  return kind === 'mindenki' || kind === diet;
}

export function refusal(diet: Diet): string {
  return diet === 'vega' ? 'Köszi, de én vega vagyok! 🥕' : 'Köszi, de én húsevő vagyok! 🍖';
}
