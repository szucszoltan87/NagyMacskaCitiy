import { BUILDINGS, isHome, isSleepPlace } from '../data/buildings';
import { edible, findRecipe, FOODS, MEALS, MENUS, RECIPES } from '../data/foods';
import { SPOTS } from '../data/spots';
import { FOREVER, HEAL_COST, PET_JOY, PLAY_JOY, SPOT_MINUTES, WATER_DRINK } from './balance';
import { findCat, say } from './cats';
import { refusalFor } from './diet';
import { hasWorker, spend } from './economy';
import { tryRescue } from './events';
import { heal } from './health';
import { bedX, placeHas } from './homes';
import { addNeed } from './needs';
import { buildingOpen, notify } from './progress';
import { questEvent } from './quests';
import { fail, ok } from './result';
import { wishAte, wishPlayed } from './wishes';
import type { ActionResult, BuildingId, Cat, Edible, FoodId, MealId, Place, SpotId, StreetId, World } from './types';

function applyEdible(cat: Cat, e: Edible): void {
  addNeed(cat, 'etel', e.etel);
  addNeed(cat, 'ital', e.ital);
  addNeed(cat, 'jokedv', e.jokedv);
}

function refuse(world: World, cat: Cat, food: FoodId | null, e: Edible): ActionResult | null {
  const msg = refusalFor(cat, food, e.kind);
  if (!msg) return null;
  say(world, cat, msg);
  return fail(msg);
}

export function feedFromPantry(world: World, catId: string, foodId: FoodId): ActionResult {
  const cat = findCat(world, catId);
  if (!cat) return fail('');
  if (!placeHas(world, cat.place, 'huto')) return fail('Itt nincs hűtő! 🧊');
  const food = edible(foodId);
  if ((world.pantry[foodId] ?? 0) <= 0) return fail(`Nincs több ${food.emoji} a hűtőben! Vegyél a boltban. 🛒`);
  if (cat.activity === 'alszik') return fail('Psszt, alszik! 😴');
  const refused = refuse(world, cat, foodId, food);
  if (refused) return refused;
  world.pantry[foodId] = (world.pantry[foodId] ?? 0) - 1;
  applyEdible(cat, food);
  say(world, cat, 'Nyamm! 😋');
  wishAte(world, cat, foodId);
  questEvent(world, { kind: 'etet', diet: cat.diet });
  return ok('', 'nyam');
}

export function drinkWater(world: World, catId: string): ActionResult {
  const cat = findCat(world, catId);
  if (!cat) return fail('');
  if (!placeHas(world, cat.place, 'mosdo')) return fail('Itt nincs csap! 🚰');
  if (cat.activity === 'alszik') return fail('Psszt, alszik! 😴');
  addNeed(cat, 'ital', WATER_DRINK);
  say(world, cat, 'Glu-glu! 💧');
  return ok('', 'nyam');
}

export function buyFood(world: World, foodId: keyof typeof FOODS): ActionResult {
  if (!hasWorker(world, 'elado')) return fail('Nincs eladó a boltban! Építs egyet a Macskaműhelyben. 🛒');
  const food = FOODS[foodId];
  const paid = spend(world, food.price);
  if (!paid.ok) return paid;
  world.pantry[foodId] = (world.pantry[foodId] ?? 0) + 1;
  world.today.shopSpent += food.price;
  world.today.foodsBought.push(foodId);
  questEvent(world, { kind: 'vasarlas' });
  return ok(`Megvetted: ${food.emoji} ${food.name}`, 'erme');
}

export function orderMeal(world: World, catId: string, mealId: MealId): ActionResult {
  const cat = findCat(world, catId);
  if (!cat) return fail('');
  if (cat.place === 'utca' || !(MENUS[cat.place] ?? []).includes(mealId)) return fail('Itt ezt nem lehet rendelni. 🍽️');
  if (cat.place === 'etterem' && !hasWorker(world, 'szakacs')) return fail('Nincs szakács az étteremben! Építs egyet a Macskaműhelyben. 👩‍🍳');
  if (cat.activity === 'alszik') return fail('Psszt, alszik! 😴');
  const meal = MEALS[mealId];
  const refused = refuse(world, cat, null, meal);
  if (refused) return refused;
  const paid = spend(world, meal.price);
  if (!paid.ok) return paid;
  applyEdible(cat, meal);
  say(world, cat, 'Fincsi! 😋');
  questEvent(world, { kind: 'etet', diet: cat.diet });
  return ok('', 'nyam');
}

export function cook(world: World, a: FoodId, b: FoodId): ActionResult {
  if (!hasWorker(world, 'szakacs')) return fail('Nincs szakács! Építs egyet a Macskaműhelyben. 👩‍🍳');
  const need = a === b ? 2 : 1;
  if ((world.pantry[a] ?? 0) < need || (world.pantry[b] ?? 0) < need) return fail('Ehhez nincs elég hozzávaló a hűtőben. 🧊');
  const id = findRecipe(a, b);
  if (!id) return fail('Hmm, ebből nem lesz finom étel… Próbálj mást! 🤔');
  world.pantry[a] = (world.pantry[a] ?? 0) - 1;
  world.pantry[b] = (world.pantry[b] ?? 0) - 1;
  world.pantry[id] = (world.pantry[id] ?? 0) + 1;
  const dish = RECIPES[id].dish;
  if (!world.recipes.includes(id)) {
    world.recipes.push(id);
    notify(world, `📖 Új recept: ${dish.emoji} ${dish.name}!`);
  }
  questEvent(world, { kind: 'recept' });
  return ok(`Elkészült: ${dish.emoji} ${dish.name}! A hűtőbe került. 🧊`, 'csillag');
}

export function petCat(world: World, catId: string): ActionResult {
  const cat = findCat(world, catId);
  if (!cat || cat.activity === 'alszik') return ok();
  addNeed(cat, 'jokedv', PET_JOY);
  if (!cat.bubble) say(world, cat, '💕');
  return ok('', 'dorombol');
}

export function playBall(world: World, place: BuildingId): ActionResult {
  if (isHome(place) && !placeHas(world, place, 'jatekdoboz')) return fail('Nincs itt játékdoboz! ⚽');
  const players = world.cats.filter((c) => c.place === place && c.activity !== 'alszik');
  if (players.length === 0) return fail('Nincs itt senki, aki játszana! ⚽');
  for (const c of players) {
    addNeed(c, 'jokedv', PLAY_JOY);
    say(world, c, 'Hurrá! ⚽');
    wishPlayed(world, c);
  }
  return ok('', 'pop');
}

export function watchTv(world: World, place: BuildingId): ActionResult {
  const here = world.cats.filter((c) => c.place === place && c.activity !== 'alszik');
  if (here.length === 0) return fail('Nincs itt senki! 📺');
  for (const c of here) {
    addNeed(c, 'jokedv', 5);
    say(world, c, '📺 Ez jó film!');
  }
  return ok('', 'pop');
}

export function readBook(world: World, place: BuildingId): ActionResult {
  const here = world.cats.filter((c) => c.place === place && c.activity !== 'alszik');
  if (here.length === 0) return fail('Nincs itt senki! 📚');
  for (const c of here) {
    addNeed(c, 'jokedv', 4);
    say(world, c, '📚 Milyen izgalmas!');
  }
  return ok('', 'pop');
}

export function healCat(world: World, catId: string): ActionResult {
  const cat = findCat(world, catId);
  if (!cat) return fail('');
  if (!cat.sick) return fail(`${cat.name} nem beteg. 😊`);
  if (cat.place !== 'korhaz') return fail('Előbb vidd a kórházba! 🏥');
  if (!hasWorker(world, 'orvos')) return fail('Nincs orvos! Építs egy orvost a Macskaműhelyben. 🩺');
  const paid = spend(world, HEAL_COST);
  if (!paid.ok) return paid;
  heal(cat);
  say(world, cat, 'Meggyógyultam! 🎉');
  return ok(`${cat.name} meggyógyult! 🎉`, 'csillag');
}

export function moveCat(world: World, catId: string, place: Place, x: number, street?: StreetId): ActionResult {
  const cat = findCat(world, catId);
  if (!cat) return fail('');
  if (cat.stuck) return fail('Nem érem el, fent van a fán! Hívj tűzoltót! 🚒');
  if (place !== 'utca' && !buildingOpen(world, place)) return fail(`Még zárva: ${BUILDINGS[place].emoji} ${BUILDINGS[place].name} 🔒`);
  cat.place = place;
  cat.street = place === 'utca' ? street ?? cat.street : BUILDINGS[place].street;
  cat.x = x;
  cat.targetX = null;
  cat.goal = null;
  cat.dest = null;
  cat.spot = null;
  cat.activity = 'all';
  cat.stayUntil = world.minute + 60;
  if (place === 'utca') {
    const msg = tryRescue(world, cat);
    if (msg) return msg.startsWith('🚒') ? ok(msg, 'csillag') : fail(msg);
  }
  return ok();
}

export function putToBed(world: World, catId: string): ActionResult {
  const cat = findCat(world, catId);
  if (!cat) return fail('');
  if (!isSleepPlace(cat.place)) return fail('Ágy csak otthon van! 🛏️');
  const bx = bedX(world, cat);
  if (bx !== null) cat.x = bx;
  else say(world, cat, 'Nincs ágyam… 😢');
  cat.targetX = null;
  cat.goal = null;
  cat.spot = null;
  cat.activity = 'alszik';
  return ok();
}

export function useSpot(world: World, catId: string, spot: SpotId, x?: number): ActionResult {
  const cat = findCat(world, catId);
  if (!cat) return fail('');
  const def = SPOTS[spot];
  const where = def.building === 'otthon' ? isHome(cat.place) : cat.place === def.building;
  if (!where) return fail('');
  if (spot === 'kad' && !placeHas(world, cat.place, 'kad')) return fail('Nincs kád! 🛁');
  cat.spot = spot;
  cat.activity = def.activity;
  cat.x = x ?? def.x;
  cat.targetX = null;
  cat.spotUntil = spot === 'kapu_sz' || spot === 'kapu_os' ? FOREVER : world.minute + SPOT_MINUTES;
  if (spot === 'hinta' || spot === 'csuszda') {
    say(world, cat, spot === 'hinta' ? 'Hiii! 🎠' : 'Juhúú! 🛝');
    questEvent(world, { kind: 'hinta' });
    wishPlayed(world, cat);
  } else if (spot === 'viz') {
    const lover = cat.species === 'jaguar' || cat.species === 'tigris' || cat.species === 'ocelot';
    say(world, cat, lover ? 'Imádok úszni! 🏊' : 'Brr, de vizes! 💦');
    wishPlayed(world, cat);
  } else if (spot === 'kad') {
    say(world, cat, 'Habfürdő! 🫧');
  } else {
    say(world, cat, 'Várom a gépet! ✈️');
  }
  return ok('', 'pop');
}

export function togglePause(world: World): ActionResult {
  world.paused = !world.paused;
  return ok(world.paused ? 'Szünet ⏸️' : 'Indulás! ▶️');
}
