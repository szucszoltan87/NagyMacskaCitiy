import { BUILDINGS, isDestination, isSleepPlace, STREETS } from '../data/buildings';
import { CLOTHES, SALON_PRICE } from '../data/clothes';
import { SPECIES } from '../data/species';
import { findCat, say } from './cats';
import { hasWorker, spend } from './economy';
import { buildingOpen } from './progress';
import { fail, ok } from './result';
import type { ActionResult, BuildingId, Cat, Climate, ClothingId, ClothingSlot, HairId, Place, World } from './types';

const CLIMATE_SPECIES: Record<Climate, string> = { hideg: 'hoshegy', meleg: 'szavanna', esos: 'oserdo' };

/** Öltözni otthon, szálláson és ruhát áruló boltban lehet. */
export function canDress(place: Place): boolean {
  if (place === 'utca') return false;
  return isSleepPlace(place) || BUILDINGS[place].kind === 'ruhabolt' || BUILDINGS[place].kind === 'helyibolt';
}

export function buyClothing(world: World, id: ClothingId, shop: BuildingId): ActionResult {
  const def = CLOTHES[id];
  if (!def.shops.includes(shop)) return fail('Ezt itt nem árulják.');
  if (!buildingOpen(world, shop)) return fail('Ez a bolt még zárva van. 🔒');
  if (BUILDINGS[shop].job && !hasWorker(world, BUILDINGS[shop].job!)) return fail('Nincs eladó! Építs egyet a Macskaműhelyben. 🛒');
  if (world.ownedClothes.includes(id)) return fail('Ez már megvan a szekrényben! 👗');
  const paid = spend(world, def.price);
  if (!paid.ok) return paid;
  world.ownedClothes.push(id);
  return ok(`Megvetted: ${def.emoji} ${def.name}! A szekrénybe került.`, 'erme');
}

export function wear(world: World, catId: string, id: ClothingId, color: string): ActionResult {
  const cat = findCat(world, catId);
  if (!cat) return fail('');
  if (!world.ownedClothes.includes(id)) return fail('Ez még nincs meg. Vedd meg a ruhaboltban! 👗');
  if (!canDress(cat.place)) return fail('Öltözni otthon vagy a ruhaboltban lehet. 🏠');
  const slot = CLOTHES[id].slot;
  if (slot === 'egyberuha') {
    delete cat.outfit.felso;
    delete cat.outfit.also;
  } else if (slot === 'felso' || slot === 'also') {
    delete cat.outfit.egyberuha;
  }
  cat.outfit[slot] = { id, color };
  return ok('', 'pop');
}

export function takeOff(world: World, catId: string, slot: ClothingSlot): ActionResult {
  const cat = findCat(world, catId);
  if (!cat) return fail('');
  if (!canDress(cat.place)) return fail('Öltözni otthon vagy a ruhaboltban lehet. 🏠');
  delete cat.outfit[slot];
  return ok();
}

/** Bírja-e az éghajlatot: van rajta védő ruha, vagy ott él a természetben. */
export function protectedFrom(cat: Cat, climate: Climate): boolean {
  if (SPECIES[cat.species].home === CLIMATE_SPECIES[climate]) return true;
  return Object.values(cat.outfit).some((w) => w && CLOTHES[w.id].protects === climate);
}

export function climateOf(cat: Cat): Climate | null {
  return isDestination(cat.street) ? STREETS[cat.street].climate : null;
}

function salonCheck(world: World, cat: Cat | undefined): ActionResult | null {
  if (!cat) return fail('');
  if (cat.place !== 'fodrasz') return fail('Előbb vidd be a fodrászhoz! 💇');
  if (!hasWorker(world, 'fodrasz')) return fail('Nincs fodrász! Építs egyet a Macskaműhelyben. 💇');
  return null;
}

export function setHair(world: World, catId: string, hair: HairId, color: string): ActionResult {
  const cat = findCat(world, catId);
  const bad = salonCheck(world, cat);
  if (bad) return bad;
  const paid = spend(world, hair === 'nincs' ? 0 : SALON_PRICE);
  if (!paid.ok) return paid;
  cat!.hair = hair;
  cat!.hairColor = color;
  say(world, cat!, hair === 'nincs' ? 'Rövid és kényelmes! ✂️' : 'De szép lettem! ✨');
  return ok('', 'pop');
}

export function setNails(world: World, catId: string, color: string | null): ActionResult {
  const cat = findCat(world, catId);
  const bad = salonCheck(world, cat);
  if (bad) return bad;
  const paid = spend(world, color ? SALON_PRICE : 0);
  if (!paid.ok) return paid;
  cat!.nails = color;
  if (color) say(world, cat!, 'Csillog a karmom! 💅');
  return ok('', 'pop');
}
