import { SPECIES } from '../data/species';
import { WORKSHOP } from '../data/buildings';
import { BUBBLE_MINUTES, MAX_CATS } from './balance';
import { fail, ok } from './result';
import type { ActionResult, AgeStage, Cat, Diet, HomeId, JobId, Looks, Place, Sex, SpeciesId, World } from './types';

export interface CatDraft {
  name: string;
  species: SpeciesId;
  sex: Sex;
  age: AgeStage;
  diet: Diet;
  job: JobId | null;
  looks: Looks;
  homeId: HomeId;
}

export function hasMane(species: SpeciesId, sex: Sex, age: AgeStage): boolean {
  return species === 'oroszlan' && sex === 'fiu' && age !== 'baba';
}

export function defaultLooks(species: SpeciesId, sex: Sex, age: AgeStage): Looks {
  return { ...SPECIES[species].looks, mane: hasMane(species, sex, age) };
}

export function buildCat(id: string, draft: CatDraft, place: Place, x: number): Cat {
  return {
    ...draft,
    id,
    name: draft.name.trim() || 'Cica',
    looks: { ...draft.looks },
    needs: { etel: 80, ital: 80, alvas: 80, jokedv: 80 },
    emptyMinutes: 0,
    sick: false,
    place,
    x,
    targetX: null,
    goal: null,
    activity: 'all',
    facing: 1,
    bubble: null,
    bubbleUntil: 0,
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
  const cat = buildCat(`c${world.nextId++}`, draft, 'utca', WORKSHOP.doorX);
  world.cats.push(cat);
  say(world, cat, 'Szia! 👋');
  return ok(`Megérkezett: ${cat.name}! 🎉`);
}
