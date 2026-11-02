import { HOME_IDS, isHome } from '../data/buildings';
import { lexiconKey, SPECIES, SPECIES_IDS, speciesName } from '../data/species';
import { mix } from '../art/color';
import { BABY_JOY_MIN, BOND_PER_MIN, MAX_CATS, PREGNANCY_MINUTES } from './balance';
import { ageAt, buildCat, findCat, hasMane, say } from './cats';
import { addStars, notify, unlockLexicon } from './progress';
import { fail, ok } from './result';
import type { ActionResult, Cat, HomeId, JobId, Looks, World } from './types';

type Rng = () => number;

export function partnerOf(world: World, cat: Cat): Cat | undefined {
  return cat.partnerId ? findCat(world, cat.partnerId) : undefined;
}

export function pairUp(world: World, aId: string, bId: string): ActionResult {
  const a = findCat(world, aId);
  const b = findCat(world, bId);
  if (!a || !b || a === b) return fail('');
  if (a.age !== 'felnott' || b.age !== 'felnott') return fail('Párja csak felnőttnek lehet. 💞');
  if (a.partnerId || b.partnerId) return fail('Valamelyiküknek már van párja. 💞');
  a.partnerId = b.id;
  b.partnerId = a.id;
  a.bond = 0;
  b.bond = 0;
  if (isHome(a.homeId)) b.homeId = a.homeId;
  else if (isHome(b.homeId)) a.homeId = b.homeId;
  say(world, a, '💞');
  say(world, b, '💞');
  return ok(`${a.name} és ${b.name} összeköltöztek! Ha sokat vannak együtt, pár lesznek. 💞`, 'pop');
}

export function tickBonds(world: World, minutes: number): void {
  for (const a of world.cats) {
    const b = partnerOf(world, a);
    if (!b || a.id > b.id || a.bond >= 100) continue;
    const together = a.place === b.place && a.street === b.street && a.activity !== 'alszik' && b.activity !== 'alszik';
    if (!together) continue;
    a.bond = Math.min(100, a.bond + BOND_PER_MIN * minutes);
    b.bond = a.bond;
    if (a.bond >= 100) {
      say(world, a, '💞💞💞');
      say(world, b, '💞💞💞');
      notify(world, `💞 ${a.name} és ${b.name} pár lettek!`);
    }
  }
}

export function babyBlocker(world: World, cat: Cat): string | null {
  const p = partnerOf(world, cat);
  if (!p) return 'Előbb kell egy pár. 💞';
  if (cat.bond < 100) return 'Még több időt kell együtt tölteniük. 💞';
  if (cat.sex === p.sex) return 'Babához egy lány és egy fiú kell.';
  const mother = cat.sex === 'lany' ? cat : p;
  if (mother.pregnancy) return 'Már úton van a baba! 🤰';
  if (cat.needs.jokedv < BABY_JOY_MIN || p.needs.jokedv < BABY_JOY_MIN) return 'Előbb legyenek mindketten jókedvűek! 😊';
  const expected = world.cats.length + world.cats.filter((c) => c.pregnancy).length;
  if (expected >= MAX_CATS) return `Megtelt a város (${MAX_CATS} macska). Most nincs hely babának.`;
  return null;
}

function shuffle<T>(list: T[], rng: Rng): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function guessOptions(mother: Cat, father: Cat, rng: Rng): { options: string[]; answer: string } {
  const answer = speciesName(mother.species, father.species === mother.species ? null : father.species);
  if (father.species !== mother.species) {
    return { answer, options: shuffle([SPECIES[mother.species].name, SPECIES[father.species].name, answer], rng) };
  }
  const others = shuffle(SPECIES_IDS.filter((s) => s !== mother.species), rng).slice(0, 2).map((s) => SPECIES[s].name);
  return { answer, options: shuffle([answer, ...others], rng) };
}

export function wantBaby(world: World, catId: string, rng: Rng = Math.random): ActionResult {
  const cat = findCat(world, catId);
  if (!cat) return fail('');
  const blocker = babyBlocker(world, cat);
  if (blocker) return fail(blocker);
  const p = partnerOf(world, cat)!;
  const mother = cat.sex === 'lany' ? cat : p;
  const father = mother === cat ? p : cat;
  mother.pregnancy = { fatherId: father.id, due: world.minute + PREGNANCY_MINUTES, guess: null, ...guessOptions(mother, father, rng) };
  say(world, mother, 'Baba lesz! 🤰');
  return ok(`🤰 ${mother.name} babát vár! Egy nap múlva születik. Tippeld meg, milyen lesz!`, 'csillag');
}

export function guessBaby(world: World, motherId: string, option: string): ActionResult {
  const mother = findCat(world, motherId);
  if (!mother?.pregnancy) return fail('');
  if (mother.pregnancy.guess) return fail('Már tippeltél! Várd meg a születést. 👶');
  mother.pregnancy.guess = option;
  return ok(`A tipped: ${option}. Meglátjuk! 🤞`);
}

export function babyLooks(m: Looks, f: Looks, rng: Rng): Looks {
  const t = 0.3 + rng() * 0.4;
  const pat = rng() < 0.5 ? m : f;
  return {
    fur: mix(m.fur, f.fur, t),
    belly: mix(m.belly, f.belly, t),
    pattern: pat.pattern,
    patternColor: pat.patternColor,
    eyes: rng() < 0.5 ? m.eyes : f.eyes,
    ears: rng() < 0.5 ? m.ears : f.ears,
    mane: false,
  };
}

export function births(world: World, rng: Rng): void {
  for (const mother of [...world.cats]) {
    const preg = mother.pregnancy;
    if (!preg || world.minute < preg.due) continue;
    mother.pregnancy = null;
    const father = findCat(world, preg.fatherId) ?? mother;
    const hybrid = father.species !== mother.species ? father.species : null;
    const sex = rng() < 0.5 ? 'lany' : 'fiu';
    const baby = buildCat(`c${world.nextId++}`, {
      name: 'Kicsi',
      species: mother.species,
      hybrid,
      sex,
      age: 'baba',
      diet: rng() < 0.5 ? mother.diet : father.diet,
      job: null,
      looks: babyLooks(mother.looks, father.looks, rng),
      homeId: mother.homeId,
    }, mother.place, mother.x + 70, world.minute, mother.street);
    baby.needs = { etel: 90, ital: 90, alvas: 90, jokedv: 100 };
    world.cats.push(baby);
    world.namingQueue.push(baby.id);
    say(world, mother, 'Itt a babám! 👶💖');
    say(world, baby, '🍼');
    notify(world, `👶 Megszületett ${mother.name} és ${father.name} babája: ${speciesName(baby.species, baby.hybrid)}!`);
    if (preg.guess) {
      if (preg.guess === preg.answer) {
        addStars(world, 1);
        notify(world, '🌟 Eltaláltad, milyen lesz a baba! +1 ⭐');
      } else {
        notify(world, `A baba ${preg.answer} lett – majdnem! 😊`);
      }
    }
    unlockLexicon(world, lexiconKey(baby.species, baby.hybrid));
  }
}

export function nameBaby(world: World, catId: string, name: string): ActionResult {
  const cat = findCat(world, catId);
  if (!cat) return fail('');
  cat.name = name.trim() || 'Kicsi';
  world.namingQueue = world.namingQueue.filter((id) => id !== catId);
  say(world, cat, 'Szia! 👋');
  return ok(`Isten hozott, ${cat.name}! 💖`, 'csillag');
}

export function growUp(world: World): void {
  for (const cat of world.cats) {
    const age = ageAt(cat.bornMinute, world.minute);
    if (age === cat.age) continue;
    cat.age = age;
    cat.looks.mane = hasMane(cat.species, cat.sex, age, cat.hybrid);
    if (age === 'gyerek') notify(world, `🎒 ${cat.name} már nagy gyerek! Iskolába járhat.`);
    if (age === 'felnott') notify(world, `🎉 ${cat.name} felnőtt! Most már lehet szakmája és párja.`);
    say(world, cat, 'Nagy lettem! 🎉');
  }
}

export function setJob(world: World, catId: string, job: JobId | null): ActionResult {
  const cat = findCat(world, catId);
  if (!cat) return fail('');
  if (cat.age !== 'felnott') return fail('Szakmája csak felnőttnek lehet. 💼');
  cat.job = job;
  return ok(job ? 'Új szakma! 💼' : 'Most nincs szakmája. 🌈', 'pop');
}

export function setHome(world: World, catId: string, home: HomeId): ActionResult {
  const cat = findCat(world, catId);
  if (!cat || !HOME_IDS.includes(home)) return fail('');
  cat.homeId = home;
  return ok('Új otthon! 🏠', 'pop');
}
