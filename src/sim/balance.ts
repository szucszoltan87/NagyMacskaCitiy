import type { Needs } from './types';

export const WORLD_VERSION = 1;

export const GAME_MINUTES_PER_DAY = 1440;
export const REAL_SECONDS_PER_DAY = 600; // 1 játéknap = 10 perc
export const GAME_MIN_PER_REAL_SEC = GAME_MINUTES_PER_DAY / REAL_SECONDS_PER_DAY; // 2.4

export const START_MINUTE = 8 * 60; // 1. nap 08:00
export const START_COINS = 40;
export const MAX_CATS = 30;

/** Ennyivel fogy percenként (100 = tele). */
export const DECAY_PER_MIN: Needs = {
  etel: 100 / 1440,
  ital: 100 / 1080,
  alvas: 100 / 1080,
  jokedv: 100 / 1440,
};
export const SLEEP_RESTORE_PER_MIN = 100 / 360;
export const SICK_AFTER_EMPTY_MIN = 720;

export const HEAL_COST = 3;
export const SALARY = 5;
export const SALARY_HOUR = 18;
export const PET_JOY = 4;
export const PLAY_JOY = 8;
export const WATER_DRINK = 50;

/** Egység / játékperc (felnőtt). */
export const WALK_SPEED = 25;
export const BUBBLE_MINUTES = 20;
