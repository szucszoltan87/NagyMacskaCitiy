import { lexiconKey, SPECIES } from '../data/species';
import { WORKSHOP } from '../data/buildings';
import { BABY_UNTIL_DAYS, BUBBLE_MINUTES, CHILD_UNTIL_DAYS, DAY_MINUTES, MAX_CATS } from './balance';
import { unlockLexicon } from './progress';
import { fail, ok } from './result';
import type {
  ActionResult, AgeStage, Cat, Diet, JobId, Looks, Place, Sex, SleepId, SpeciesId, StreetId, World,
} from './types';

export interface CatDraft {
  name: string;
  species: SpeciesId;
  hybrid?: SpeciesId | null;
  sex: Sex;
  age: AgeStage;
  diet: Diet;
  job: JobId | null;
  looks: Looks;
  homeId: SleepId;
}

export function hasMane(species: SpeciesId, sex: Sex, age: AgeStage, hybrid: SpeciesId | null = null): boolean {
  return (species === 'oroszlan' || hybrid === 'oroszlan') && sex === 'fiu' && age !== 'baba';
}

export function defaultLooks(species: SpeciesId, sex: Sex, age: AgeStage): Looks {
  return { ...SPECIES[species].looks, mane: hasMane(species, sex, age) };
}

/** Születési perc úgy, hogy most éppen a megadott korcsoportba essen. */
export function bornMinuteFor(age: AgeStage, now: number): number {
  if (age === 'baba') return now;
  if (age === 'gyerek') return now - BABY_UNTIL_DAYS * DAY_MINUTES;
  return now - CHILD_UNTIL_DAYS * DAY_MINUTES;
}

export function ageAt(bornMinute: number, now: number): AgeStage {
  const days = (now - bornMinute) / DAY_MINUTES;
  if (days < BABY_UNTIL_DAYS) return 'baba';
  if (days < CHILD_UNTIL_DAYS) return 'gyerek';
  return 'felnott';
}

export function buildCat(id: string, draft: CatDraft, place: Place, x: number, now = 0, street: StreetId = 'belvaros'): Cat {
  return {
    ...draft,
    id,
    hybrid: draft.hybrid ?? null,
    name: draft.name.trim() || 'Cica',
    job: draft.age === 'felnott' ? draft.job : null,
    looks: { ...draft.looks },
    bornMinute: bornMinuteFor(draft.age, now),
    outfit: {},
    hair: 'nincs',
    hairColor: '#6D4C41',
    nails: null,
    needs: { etel: 80, ital: 80, alvas: 80, jokedv: 80 },
    emptyMinutes: 0,
    sick: false,
    street,
    place,
    x,
    targetX: null,
    goal: null,
    dest: null,
    activity: 'all',
    spot: null,
    spotUntil: 0,
    stayUntil: 0,
    facing: 1,
    bubble: null,
    bubbleUntil: 0,
    wish: null,
    nextWishAt: now + 120,
    workedDay: 0,
    partnerId: null,
    bond: 0,
    pregnancy: null,
    knowledge: 0,
    stuck: false,
  };
}

export function findCat(world: World, id: string): Cat | undefined {
  return world.cats.find((c) => c.id === id);
}

export function say(world: World, cat: Cat, text: string): void {
  cat.bubble = text;
  cat.bubbleUntil = world.minute + BUBBLE_MINUTES;
}

export function addCat(world: World, draft: CatDraft): ActionResult {
  if (world.cats.length >= MAX_CATS) {
    return fail(`Megtelt a város! Legfeljebb ${MAX_CATS} macska lakhat itt.`);
  }
  const cat = buildCat(`c${world.nextId++}`, draft, 'utca', WORKSHOP.doorX, world.minute, 'belvaros');
  world.cats.push(cat);
  say(world, cat, 'Szia! 👋');
  unlockLexicon(world, lexiconKey(cat.species, cat.hybrid));
  return ok(`Megérkezett: ${cat.name}! 🎉`);
}

/** A városban (nem a vadonban, rokonként) élő macska-e. */
export function isCityCat(cat: Cat): boolean {
  return cat.homeId === 'otthon1' || cat.homeId === 'otthon2' || cat.homeId === 'otthon3';
}
