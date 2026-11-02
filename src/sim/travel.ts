import { BUILDINGS, isDestination, STREETS } from '../data/buildings';
import { JOB_LABEL } from '../data/jobs';
import { MODE_LABEL, ROUTES, type Route } from '../data/transport';
import { say } from './cats';
import { hasWorker } from './economy';
import { buildingOpen, notify } from './progress';
import type { BuildingId, Cat, GameEvent, World } from './types';

/** Átléptük-e a napon belüli t percet prev és cur között. */
export function crossed(prev: number, cur: number, t: number): boolean {
  return Math.floor((cur - t) / 1440) > Math.floor((prev - t) / 1440);
}

export function riders(world: World, route: Route): Cat[] {
  return world.cats.filter((c) =>
    c.place === route.from
    && c.activity !== 'alszik'
    && c.activity !== 'dolgozik'
    && !c.stuck
    && (route.spot === null || c.spot === route.spot));
}

export function arrive(world: World, cat: Cat, to: BuildingId, index: number): void {
  const b = BUILDINGS[to];
  const free = cat.dest !== null;
  cat.street = b.street;
  cat.place = 'utca';
  cat.x = b.doorX + [0, -50, 50, -100, 100][index % 5];
  cat.targetX = null;
  cat.goal = null;
  cat.dest = null;
  cat.spot = null;
  cat.activity = 'all';
  if (!free) cat.stayUntil = world.minute + 30;
  say(world, cat, isDestination(b.street) ? `Megérkeztem: ${STREETS[b.street].name}! 🎉` : 'Megérkeztem! 🎉');
}

function depart(world: World, route: Route, events: GameEvent[]): void {
  const going = riders(world, route);
  if (going.length === 0) return;
  const m = MODE_LABEL[route.mode];
  if (!buildingOpen(world, route.from) || !hasWorker(world, route.job)) {
    notify(world, `${m.emoji} Nem indult el a ${m.name.toLowerCase()}: nincs ${JOB_LABEL[route.job].split(' ').slice(1).join(' ').toLowerCase()}! Építs egyet a Macskaműhelyben.`);
    return;
  }
  const names: string[] = [];
  going.forEach((cat) => {
    if (cat.dest === null) {
      if (world.coins < route.price) {
        say(world, cat, 'Nincs pénz jegyre… 😢');
        notify(world, `${cat.name} jegyére nem volt elég pénz (${route.price} 🐾).`);
        return;
      }
      world.coins -= route.price;
    }
    arrive(world, cat, route.to, names.length);
    names.push(cat.name);
  });
  if (names.length) events.push({ kind: 'utazas', from: route.from, to: BUILDINGS[route.to].street, mode: route.mode, names });
}

export function runTransport(world: World, prev: number, events: GameEvent[]): void {
  for (const route of ROUTES) {
    for (const t of route.departures) {
      if (crossed(prev, world.minute, t)) depart(world, route, events);
    }
  }
}

export function busRuns(world: World): boolean {
  return buildingOpen(world, 'busz_pv') && hasWorker(world, 'buszsofor');
}
