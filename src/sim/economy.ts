import { SALARY } from './balance';
import { fail, ok } from './result';
import { dayOf } from './time';
import type { ActionResult, JobId, World } from './types';

export function spend(world: World, price: number): ActionResult {
  if (world.coins < price) return fail(`Még ${price - world.coins} 🐾 kell!`);
  world.coins -= price;
  return ok();
}

export function earn(world: World, amount: number): void {
  world.coins += amount;
}

export function hasWorker(world: World, job: JobId): boolean {
  return world.cats.some((c) => c.job === job && c.age === 'felnott');
}

/** Este fizetést kap, aki ma dolgozott és nem beteg. */
export function paySalaries(world: World): number {
  const day = dayOf(world.minute);
  const workers = world.cats.filter((c) => c.job !== null && c.age === 'felnott' && !c.sick && c.workedDay === day).length;
  const amount = workers * SALARY;
  earn(world, amount);
  return amount;
}
