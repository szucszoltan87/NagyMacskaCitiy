import { HOME_BED_X, isHome } from '../data/buildings';
import { FOODS, MEALS } from '../data/foods';
import { HEAL_COST, PET_JOY, PLAY_JOY, WATER_DRINK } from './balance';
import { findCat, say } from './cats';
import { canEat, refusal } from './diet';
import { hasWorker, spend } from './economy';
import { heal } from './health';
import { addNeed } from './needs';
import { fail, ok } from './result';
import type { ActionResult, BuildingId, Cat, Edible, FoodId, MealId, Place, World } from './types';

function applyEdible(cat: Cat, e: Edible): void {
  addNeed(cat, 'etel', e.etel);
  addNeed(cat, 'ital', e.ital);
  addNeed(cat, 'jokedv', e.jokedv);
}

export function feedFromPantry(world: World, catId: string, foodId: FoodId): ActionResult {
  const cat = findCat(world, catId);
  if (!cat) return fail('');
  const food = FOODS[foodId];
  if ((world.pantry[foodId] ?? 0) <= 0) return fail(`Nincs több ${food.emoji} a hűtőben! Vegyél a boltban. 🛒`);
  if (cat.activity === 'alszik') return fail('Psszt, alszik! 😴');
  if (!canEat(cat.diet, food.kind)) {
    const msg = refusal(cat.diet);
    say(world, cat, msg);
    return fail(msg);
  }
  world.pantry[foodId] = (world.pantry[foodId] ?? 0) - 1;
  applyEdible(cat, food);
  say(world, cat, 'Nyamm! 😋');
  return ok();
}

export function drinkWater(world: World, catId: string): ActionResult {
  const cat = findCat(world, catId);
  if (!cat) return fail('');
  if (cat.activity === 'alszik') return fail('Psszt, alszik! 😴');
  addNeed(cat, 'ital', WATER_DRINK);
  say(world, cat, 'Glu-glu! 💧');
  return ok();
}

export function buyFood(world: World, foodId: FoodId): ActionResult {
  if (!hasWorker(world, 'elado')) return fail('Nincs eladó a boltban! Építs egyet a Macskaműhelyben. 🛒');
  const food = FOODS[foodId];
  const paid = spend(world, food.price);
  if (!paid.ok) return paid;
  world.pantry[foodId] = (world.pantry[foodId] ?? 0) + 1;
  return ok(`Megvetted: ${food.emoji} ${food.name}`);
}

export function orderMeal(world: World, catId: string, mealId: MealId): ActionResult {
  const cat = findCat(world, catId);
  if (!cat) return fail('');
  if (!hasWorker(world, 'szakacs')) return fail('Nincs szakács az étteremben! Építs egyet a Macskaműhelyben. 👩‍🍳');
  if (cat.activity === 'alszik') return fail('Psszt, alszik! 😴');
  const meal = MEALS[mealId];
  if (!canEat(cat.diet, meal.kind)) {
    const msg = refusal(cat.diet);
    say(world, cat, msg);
    return fail(msg);
  }
  const paid = spend(world, meal.price);
  if (!paid.ok) return paid;
  applyEdible(cat, meal);
  say(world, cat, 'Fincsi! 😋');
  return ok();
}

export function petCat(world: World, catId: string): ActionResult {
  const cat = findCat(world, catId);
  if (!cat || cat.activity === 'alszik') return ok();
  addNeed(cat, 'jokedv', PET_JOY);
  if (!cat.bubble) say(world, cat, '💕');
  return ok();
}

export function playBall(world: World, place: BuildingId): ActionResult {
  const players = world.cats.filter((c) => c.place === place && c.activity !== 'alszik');
  if (players.length === 0) return fail('Nincs itt senki, aki játszana! ⚽');
  for (const c of players) {
    addNeed(c, 'jokedv', PLAY_JOY);
    say(world, c, 'Hurrá! ⚽');
  }
  return ok();
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
  return ok(`${cat.name} meggyógyult! 🎉`);
}

export function moveCat(world: World, catId: string, place: Place, x: number): ActionResult {
  const cat = findCat(world, catId);
  if (!cat) return fail('');
  cat.place = place;
  cat.x = x;
  cat.targetX = null;
  cat.goal = null;
  cat.activity = 'all';
  return ok();
}

export function putToBed(world: World, catId: string): ActionResult {
  const cat = findCat(world, catId);
  if (!cat) return fail('');
  if (!isHome(cat.place)) return fail('Ágy csak otthon van! 🛏️');
  cat.x = HOME_BED_X;
  cat.targetX = null;
  cat.goal = null;
  cat.activity = 'alszik';
  return ok();
}

export function togglePause(world: World): ActionResult {
  world.paused = !world.paused;
  return ok(world.paused ? 'Szünet ⏸️' : 'Indulás! ▶️');
}
