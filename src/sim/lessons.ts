import { FOOD_IDS, FOODS } from '../data/foods';
import { SPECIES, SPECIES_IDS } from '../data/species';
import { addNeed } from './needs';
import { earn, hasWorker } from './economy';
import { questEvent } from './quests';
import { fail, ok } from './result';
import type { ActionResult, World } from './types';

type Rng = () => number;

export interface Question { text: string; options: string[]; answer: string }

const pick = <T>(list: T[], rng: Rng): T => list[Math.floor(rng() * list.length)];
function shuffle<T>(list: T[], rng: Rng): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const HABITATS = [...new Set(SPECIES_IDS.map((s) => SPECIES[s].habitat))];

export function makeQuestion(rng: Rng): Question {
  const kind = Math.floor(rng() * 4);
  if (kind === 0) {
    const s = SPECIES[pick(SPECIES_IDS, rng)];
    const wrong = shuffle(HABITATS.filter((h) => h !== s.habitat), rng).slice(0, 2);
    return { text: `Hol él a természetben ez a nagymacska: ${s.name}?`, answer: s.habitat, options: shuffle([s.habitat, ...wrong], rng) };
  }
  if (kind === 1) {
    const habitat = pick(HABITATS, rng);
    const right = SPECIES[pick(SPECIES_IDS.filter((s) => SPECIES[s].habitat === habitat), rng)].name;
    const wrong = shuffle(SPECIES_IDS.filter((s) => SPECIES[s].habitat !== habitat), rng).slice(0, 2).map((s) => SPECIES[s].name);
    return { text: `Melyik nagymacska él itt: ${habitat}?`, answer: right, options: shuffle([right, ...wrong], rng) };
  }
  if (kind === 2) {
    const diet = rng() < 0.5 ? 'vega' : 'husevo';
    const other = diet === 'vega' ? 'husevo' : 'vega';
    const right = FOODS[pick(FOOD_IDS.filter((f) => FOODS[f].kind === diet), rng)];
    const wrong = shuffle(FOOD_IDS.filter((f) => FOODS[f].kind === other), rng).slice(0, 2).map((f) => `${FOODS[f].emoji} ${FOODS[f].name}`);
    return {
      text: diet === 'vega' ? 'Mit adhatsz egy vega macskának?' : 'Mit adhatsz egy húsevő macskának, ami nem jó a vegának?',
      answer: `${right.emoji} ${right.name}`,
      options: shuffle([`${right.emoji} ${right.name}`, ...wrong], rng),
    };
  }
  const food = FOODS[pick(FOOD_IDS, rng)];
  const n = 2 + Math.floor(rng() * 4);
  const right = food.price * n;
  const wrong = shuffle([right + 1, right - 1, right + food.price, right + 2].filter((v) => v > 0 && v !== right), rng).slice(0, 2);
  return {
    text: `Egy ${food.emoji} ${food.name.toLowerCase()} ${food.price} 🐾. Mennyibe kerül ${n} darab?`,
    answer: `${right} 🐾`,
    options: shuffle([right, ...wrong], rng).map((v) => `${v} 🐾`),
  };
}

export function answerLesson(world: World, q: Question, choice: string): ActionResult {
  if (!hasWorker(world, 'tanar')) return fail('Nincs tanár! Építs egyet a Macskaműhelyben. 📚');
  const kids = world.cats.filter((c) => c.place === 'iskola' && c.age !== 'felnott');
  if (kids.length === 0) return fail('Nincs itt egy gyerek sem! Hozz ide egy kis macskát. 🎒');
  if (choice !== q.answer) return fail(`Majdnem! A jó válasz: ${q.answer}`);
  for (const k of kids) {
    addNeed(k, 'jokedv', 10);
    k.knowledge += 1;
  }
  earn(world, 1);
  questEvent(world, { kind: 'lecke' });
  return ok('Ügyes! Jó válasz! 📚 +1 🐾', 'csillag');
}
