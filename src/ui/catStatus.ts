import { isHome, placeName } from '../data/buildings';
import type { Cat } from '../sim/types';

export function statusText(cat: Cat): string {
  if (cat.sick) return 'Beteg – vidd a kórházba! 🏥';
  if (cat.activity === 'alszik') return 'Alszik 😴';
  if (cat.needs.ital < 30 || cat.needs.etel < 30) {
    return isHome(cat.place) ? 'Éhes/szomjas – húzz neki valamit a hűtőből!' : 'Éhes/szomjas – vidd haza vagy az étterembe!';
  }
  if (cat.activity === 'setal') return 'Sétál 🚶';
  return `Itt van: ${placeName(cat.place)}`;
}

export function warningIcons(cat: Cat): string {
  let s = '';
  if (cat.sick) s += '🤒';
  if (cat.needs.etel < 20) s += '🍽️';
  if (cat.needs.ital < 20) s += '💧';
  if (cat.needs.alvas < 20) s += '😴';
  if (cat.needs.jokedv < 20) s += '🥺';
  return s;
}
