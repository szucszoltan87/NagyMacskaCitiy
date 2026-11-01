import { SICK_AFTER_EMPTY_MIN } from './balance';
import { say } from './cats';
import { anyNeedEmpty, NEED_KEYS } from './needs';
import type { Cat, World } from './types';

/** Frissíti az üres-csík számlálókat. Ha valaki most lett beteg, visszaadja. */
export function updateHealth(world: World, minutes: number): Cat | null {
  for (const cat of world.cats) {
    cat.emptyMinutes = anyNeedEmpty(cat) ? cat.emptyMinutes + minutes : 0;
  }
  if (world.cats.some((c) => c.sick)) return null;
  const patient = world.cats.find((c) => c.emptyMinutes >= SICK_AFTER_EMPTY_MIN);
  if (!patient) return null;
  patient.sick = true;
  say(world, patient, 'Rosszul vagyok… vigyél a kórházba! 🤒');
  return patient;
}

export function heal(cat: Cat): void {
  cat.sick = false;
  cat.emptyMinutes = 0;
  for (const k of NEED_KEYS) cat.needs[k] = Math.max(cat.needs[k], 30);
}
