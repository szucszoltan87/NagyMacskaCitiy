import { DECAY_PER_MIN, SLEEP_RESTORE_PER_MIN } from './balance';
import type { Cat, NeedKey } from './types';

export const NEED_KEYS: NeedKey[] = ['etel', 'ital', 'alvas', 'jokedv'];

export function clampNeed(v: number): number {
  return Math.max(0, Math.min(100, v));
}

export function addNeed(cat: Cat, key: NeedKey, amount: number): void {
  cat.needs[key] = clampNeed(cat.needs[key] + amount);
}

export function decayNeeds(cat: Cat, minutes: number): void {
  addNeed(cat, 'etel', -DECAY_PER_MIN.etel * minutes);
  addNeed(cat, 'ital', -DECAY_PER_MIN.ital * minutes);
  addNeed(cat, 'jokedv', -DECAY_PER_MIN.jokedv * minutes);
  addNeed(cat, 'alvas', cat.activity === 'alszik' ? SLEEP_RESTORE_PER_MIN * minutes : -DECAY_PER_MIN.alvas * minutes);
}

export function anyNeedEmpty(cat: Cat): boolean {
  return NEED_KEYS.some((k) => cat.needs[k] <= 0);
}
