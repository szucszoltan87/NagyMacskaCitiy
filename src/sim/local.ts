import { STREETS } from '../data/buildings';
import { SPECIES } from '../data/species';
import { LOCAL_COINS } from './balance';
import { isCityCat } from './cats';
import { earn } from './economy';
import { addNeed } from './needs';
import { addStars, unlockLexicon } from './progress';
import { fail, ok } from './result';
import { dayOf } from './time';
import type { ActionResult, DestinationId, SpeciesId, World } from './types';

export const SNOWMAN_STEPS = 3;

export function giraffeCount(day: number): number {
  return 3 + ((day * 7) % 5);
}

export function ocelotX(day: number): number {
  return 500 + ((day * 523) % 1500);
}

function visitorHere(world: World, street: DestinationId): boolean {
  return world.cats.some((c) => isCityCat(c) && c.street === street);
}

export function localDoneToday(world: World, street: DestinationId): boolean {
  return world.localDone[street] === dayOf(world.minute);
}

function complete(world: World, street: DestinationId, text: string): ActionResult {
  world.localDone[street] = dayOf(world.minute);
  earn(world, LOCAL_COINS);
  addStars(world, 1);
  return ok(`${text} +1 ⭐ +${LOCAL_COINS} 🐾`, 'csillag');
}

function guard(world: World, street: DestinationId): ActionResult | null {
  if (!visitorHere(world, street)) return fail(`Előbb utazzon ide valaki a városból: ${STREETS[street].emoji} ${STREETS[street].name}! 🧳`);
  if (localDoneToday(world, street)) return fail('Ezt ma már megcsináltátok! Holnap újra lehet. 🌟');
  return null;
}

export function buildSnowman(world: World): ActionResult {
  const bad = guard(world, 'hoshegy');
  if (bad) return bad;
  world.snowman = Math.min(SNOWMAN_STEPS, world.snowman + 1);
  if (world.snowman < SNOWMAN_STEPS) return ok('Gurul a hógolyó! ❄️', 'pop');
  for (const c of world.cats.filter((x) => x.street === 'hoshegy')) addNeed(c, 'jokedv', 15);
  return complete(world, 'hoshegy', '⛄ Kész a hóember!');
}

export function answerGiraffes(world: World, n: number): ActionResult {
  const bad = guard(world, 'szavanna');
  if (bad) return bad;
  if (n !== giraffeCount(dayOf(world.minute))) return fail('Nem annyi! Számold meg újra! 🦒');
  return complete(world, 'szavanna', '🦒 Pontosan! Jól számoltál!');
}

export function findOcelot(world: World): ActionResult {
  const bad = guard(world, 'oserdo');
  if (bad) return bad;
  unlockLexicon(world, 'ocelot');
  return complete(world, 'oserdo', '🔍 Megtaláltad az elbújt ocelotot!');
}

export function meetWild(world: World, species: SpeciesId): ActionResult {
  unlockLexicon(world, species);
  const s = SPECIES[species];
  const fact = s.facts[dayOf(world.minute) % s.facts.length];
  return ok(`${s.name}: ${fact}`);
}

export const SANDCASTLE_STEPS = 4;

export function buildSandcastle(world: World): ActionResult {
  const here = world.cats.filter((c) => c.place === 'strand' && c.activity !== 'alszik');
  if (here.length === 0) return fail('Nincs itt senki, aki építene! 🏖️');
  if (world.sandcastle >= SANDCASTLE_STEPS) return ok('Már áll a homokvár! 🏰');
  world.sandcastle += 1;
  if (world.sandcastle < SANDCASTLE_STEPS) return ok('Lapát, vödör… 🪣', 'pop');
  for (const c of here) addNeed(c, 'jokedv', 15);
  return ok('Kész a homokvár! 🏰', 'csillag');
}
