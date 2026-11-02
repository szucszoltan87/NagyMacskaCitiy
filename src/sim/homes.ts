import { isHome, isLodge, LODGE_BED_X, ROOM_DOOR_X, ROOM_WIDTH } from '../data/buildings';
import { FURNITURE } from '../data/furniture';
import { PAINT_PRICE } from '../data/furniture';
import { hasWorker, spend } from './economy';
import { buildingOpen } from './progress';
import { fail, ok } from './result';
import type { ActionResult, Cat, FurnitureId, HomeDecor, HomeId, Place, Wallpaper, World } from './types';

/** Van-e ilyen bútor ezen a helyen. A szálláson van ágy és mosdó. */
export function placeHas(world: World, place: Place, kind: FurnitureId): boolean {
  if (isHome(place)) return world.homes[place].items.some((i) => i.kind === kind);
  if (isLodge(place)) return kind === 'agy' || kind === 'mosdo';
  return false;
}

/** Hol alszik a macska: a ház ágyai közül a lakók sorrendje szerint; ágy nélkül null. */
export function bedX(world: World, cat: Cat): number | null {
  if (isLodge(cat.place)) return LODGE_BED_X + [0, -60, 60][world.cats.indexOf(cat) % 3];
  if (!isHome(cat.place)) return null;
  const home = cat.place;
  const beds = world.homes[home].items.filter((i) => i.kind === 'agy').sort((a, b) => a.x - b.x);
  if (beds.length === 0) return null;
  const sleepers = world.cats.filter((c) => c.place === home);
  const i = Math.max(0, sleepers.indexOf(cat));
  const bed = beds[i % beds.length];
  const slot = Math.floor(i / beds.length) % 3;
  return bed.x + [0, -60, 60][slot];
}

export function clampFurnitureX(kind: FurnitureId, x: number): number {
  const half = FURNITURE[kind].width / 2;
  return Math.max(ROOM_DOOR_X + 70 + half, Math.min(ROOM_WIDTH - 10 - half, x));
}

export function buyFurniture(world: World, kind: FurnitureId): ActionResult {
  if (!buildingOpen(world, 'butorbolt')) return fail('A Bútorbolt még zárva van. 🔒');
  if (!hasWorker(world, 'elado')) return fail('Nincs eladó! Építs egyet a Macskaműhelyben. 🛒');
  const def = FURNITURE[kind];
  const paid = spend(world, def.price);
  if (!paid.ok) return paid;
  world.furnitureStock.push(kind);
  return ok(`Megvetted: ${def.emoji} ${def.name}! Egy házban a 🖌️ Berendezés gombbal teheted le.`, 'erme');
}

export function buyPaint(world: World, color: string): ActionResult {
  if (world.paints.includes(color)) return fail('Ez a festék már megvan. 🎨');
  if (!buildingOpen(world, 'butorbolt')) return fail('A Bútorbolt még zárva van. 🔒');
  if (!hasWorker(world, 'elado')) return fail('Nincs eladó! Építs egyet a Macskaműhelyben. 🛒');
  const paid = spend(world, PAINT_PRICE);
  if (!paid.ok) return paid;
  world.paints.push(color);
  return ok('Új festék! 🎨', 'erme');
}

export function placeFurniture(world: World, home: HomeId, kind: FurnitureId, x: number): ActionResult {
  const i = world.furnitureStock.indexOf(kind);
  if (i < 0) return fail('Ez a bútor nincs a raktárban.');
  world.furnitureStock.splice(i, 1);
  world.homes[home].items.push({ uid: `f${world.nextId++}`, kind, x: clampFurnitureX(kind, x) });
  return ok('', 'pop');
}

export function moveFurniture(world: World, home: HomeId, uid: string, x: number): ActionResult {
  const item = world.homes[home].items.find((i) => i.uid === uid);
  if (!item) return fail('');
  item.x = clampFurnitureX(item.kind, x);
  return ok();
}

export function storeFurniture(world: World, home: HomeId, uid: string): ActionResult {
  const items = world.homes[home].items;
  const i = items.findIndex((it) => it.uid === uid);
  if (i < 0) return fail('');
  world.furnitureStock.push(items[i].kind);
  items.splice(i, 1);
  return ok(`${FURNITURE[world.furnitureStock[world.furnitureStock.length - 1]].emoji} a raktárba került.`);
}

export function paintHome(world: World, home: HomeId, patch: Partial<Pick<HomeDecor, 'wall' | 'floor'>> & { wallpaper?: Wallpaper }): ActionResult {
  for (const color of [patch.wall, patch.floor]) {
    if (color && !world.paints.includes(color)) return fail('Ilyen festéked még nincs. Vegyél a Bútorboltban! 🎨');
  }
  Object.assign(world.homes[home], patch);
  return ok('', 'pop');
}
