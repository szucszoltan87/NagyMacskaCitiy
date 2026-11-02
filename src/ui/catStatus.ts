import { BUILDINGS, placeName, STREETS } from '../data/buildings';
import { CLOTHES } from '../data/clothes';
import { FOODS } from '../data/foods';
import { placeHas } from '../sim/homes';
import type { Cat, Wish, World } from '../sim/types';
import { wishText } from '../sim/wishes';

const SLOT_ICON = { fej: '🎩', felso: '👕', also: '👖', egyberuha: '👗', cipo: '👟', kieg: '👜' };

export function wishIcon(w: Wish): string {
  switch (w.kind) {
    case 'etel': return FOODS[w.food as keyof typeof FOODS]?.emoji ?? '🍽️';
    case 'ruha': return SLOT_ICON[w.slot];
    case 'hely': return BUILDINGS[w.building].emoji;
    case 'jatek': return '⚽';
    case 'rokon': return STREETS[w.street].emoji;
  }
}

export function wishLine(cat: Cat): string | null {
  return cat.wish ? `💭 ${wishText(cat.wish)}` : null;
}

export function statusText(world: World, cat: Cat): string {
  if (cat.stuck) return 'Fent ragadt a fán! Húzz mellé egy tűzoltót! 🚒';
  if (cat.sick) return 'Beteg – vidd a kórházba! 🏥';
  if (cat.activity === 'alszik') return 'Alszik 😴';
  if (cat.needs.ital < 30 || cat.needs.etel < 30) {
    if (cat.age === 'baba') return 'Éhes – adj neki cumisüveget vagy tejet! 🍼';
    return placeHas(world, cat.place, 'huto') ? 'Éhes/szomjas – húzz neki valamit a hűtőből!' : 'Éhes/szomjas – vidd haza vagy az étterembe!';
  }
  if (cat.activity === 'dolgozik') return 'Dolgozik 💼';
  if (cat.activity === 'tanul') return 'Iskolában tanul 📚';
  if (cat.activity === 'jatszik') return 'Játszik 🎈';
  if (cat.activity === 'uszik') return 'Úszik 🏊';
  if (cat.spot === 'kapu_sz' || cat.spot === 'kapu_os') return 'A kapunál várja a repülőt ✈️';
  if (cat.dest) return 'Buszra vár 🚌';
  if (cat.activity === 'setal') return `Sétál 🚶 (${STREETS[cat.street].name})`;
  return `Itt van: ${placeName(cat.place, cat.street)}`;
}

export function warningIcons(cat: Cat): string {
  let s = '';
  if (cat.stuck) s += '🌳';
  if (cat.sick) s += '🤒';
  if (cat.pregnancy) s += '🤰';
  if (cat.needs.etel < 20) s += '🍽️';
  if (cat.needs.ital < 20) s += '💧';
  if (cat.needs.alvas < 20) s += '😴';
  if (cat.needs.jokedv < 20) s += '🥺';
  if (cat.wish) s += '💭';
  return s;
}

export function outfitSummary(cat: Cat): string {
  return Object.values(cat.outfit).map((w) => (w ? CLOTHES[w.id].emoji : '')).join('');
}
