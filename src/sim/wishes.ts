import { BUILDING_IDS, BUILDINGS, isHome, STREETS } from '../data/buildings';
import { FOOD_IDS, FOODS } from '../data/foods';
import { SPECIES } from '../data/species';
import { WISH_COINS, WISH_JOY } from './balance';
import { say } from './cats';
import { canEat } from './diet';
import { earn } from './economy';
import { addNeed } from './needs';
import { buildingOpen, streetOpen } from './progress';
import { questEvent } from './quests';
import type { Cat, ClothingSlot, FoodId, Wish, World } from './types';

type Rng = () => number;

const SLOT_WISH: Partial<Record<ClothingSlot, string>> = {
  fej: 'Szeretnék valamit a fejemre! 🎩',
  felso: 'Szeretnék egy új felsőt! 👕',
  cipo: 'Szeretnék cipőt! 👟',
  kieg: 'Szeretnék egy kiegészítőt! 👜',
};

export function wishText(w: Wish): string {
  switch (w.kind) {
    case 'etel': return `Megkívántam: ${FOODS[w.food as keyof typeof FOODS]?.emoji ?? ''} ${FOODS[w.food as keyof typeof FOODS]?.name ?? ''}!`;
    case 'ruha': return SLOT_WISH[w.slot] ?? 'Szeretnék új ruhát! 👗';
    case 'hely': return `Elmennék ide: ${BUILDINGS[w.building].emoji} ${BUILDINGS[w.building].name}!`;
    case 'jatek': return 'Játsszunk! ⚽';
    case 'rokon': return `Meglátogatnám a rokonaimat: ${STREETS[w.street].emoji} ${STREETS[w.street].name}!`;
  }
}

export function makeWish(world: World, cat: Cat, rng: Rng): Wish | null {
  const options: Wish[] = [];
  const foods = FOOD_IDS.filter((f) => f !== 'cumisuveg' && canEat(cat.diet, FOODS[f].kind));
  if (foods.length) options.push({ kind: 'etel', food: foods[Math.floor(rng() * foods.length)] });
  if (buildingOpen(world, 'ruhabolt')) {
    const slots: ClothingSlot[] = ['fej', 'felso', 'cipo', 'kieg'];
    const free = slots.filter((s) => !cat.outfit[s] && !(s === 'felso' && cat.outfit.egyberuha));
    if (free.length) options.push({ kind: 'ruha', slot: free[Math.floor(rng() * free.length)] });
  }
  const places = BUILDING_IDS.filter((id) => {
    const b = BUILDINGS[id];
    return b.street === cat.street && b.wander && !isHome(id) && id !== cat.place && buildingOpen(world, id);
  });
  if (places.length) options.push({ kind: 'hely', building: places[Math.floor(rng() * places.length)] });
  options.push({ kind: 'jatek' });
  const home = SPECIES[cat.species].home;
  if (home && streetOpen(world, home) && cat.street !== home) options.push({ kind: 'rokon', street: home });
  return options.length ? options[Math.floor(rng() * options.length)] : null;
}

export function fulfillWish(world: World, cat: Cat): void {
  if (!cat.wish) return;
  cat.wish = null;
  addNeed(cat, 'jokedv', WISH_JOY);
  earn(world, WISH_COINS);
  say(world, cat, 'Köszönöm! 💖');
  questEvent(world, { kind: 'kivansag' });
}

export function wishAte(world: World, cat: Cat, food: FoodId): void {
  if (cat.wish?.kind === 'etel' && cat.wish.food === food) fulfillWish(world, cat);
}

export function wishPlayed(world: World, cat: Cat): void {
  if (cat.wish?.kind === 'jatek') fulfillWish(world, cat);
}

export function checkWishState(world: World, cat: Cat): void {
  const w = cat.wish;
  if (!w) return;
  if (w.kind === 'ruha' && (cat.outfit[w.slot] || (w.slot === 'felso' && cat.outfit.egyberuha))) fulfillWish(world, cat);
  else if (w.kind === 'hely' && cat.place === w.building) fulfillWish(world, cat);
  else if (w.kind === 'rokon' && cat.street === w.street) fulfillWish(world, cat);
}
