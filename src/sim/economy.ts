import { SALARY } from './balance';
import { fail, ok } from './result';
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

export function paySalaries(world: World): number {
  const workers = world.cats.filter((c) => c.job !== null && c.age === 'felnott' && !c.sick).length;
  const amount = workers * SALARY;
  earn(world, amount);
  return amount;
}
