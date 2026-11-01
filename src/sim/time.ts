import { GAME_MIN_PER_REAL_SEC, GAME_MINUTES_PER_DAY } from './balance';

export type DayPhase = 'reggel' | 'nappal' | 'este' | 'ejjel';

export function dayOf(minute: number): number {
  return Math.floor(minute / GAME_MINUTES_PER_DAY) + 1;
}

export function minuteOfDay(minute: number): number {
  return ((minute % GAME_MINUTES_PER_DAY) + GAME_MINUTES_PER_DAY) % GAME_MINUTES_PER_DAY;
}

export function hourOf(minute: number): number {
  return Math.floor(minuteOfDay(minute) / 60);
}

export function phaseOf(minute: number): DayPhase {
  const h = hourOf(minute);
  if (h < 6 || h >= 21) return 'ejjel';
  if (h < 10) return 'reggel';
  if (h < 18) return 'nappal';
  return 'este';
}

export function isNight(minute: number): boolean {
  return phaseOf(minute) === 'ejjel';
}

export function formatClock(minute: number): string {
  const m = Math.floor(minuteOfDay(minute));
  const hh = String(Math.floor(m / 60)).padStart(2, '0');
  const mm = String(m % 60).padStart(2, '0');
  return `${hh}:${mm}`;
}

export function realSecondsToGameMinutes(seconds: number): number {
  return seconds * GAME_MIN_PER_REAL_SEC;
}
