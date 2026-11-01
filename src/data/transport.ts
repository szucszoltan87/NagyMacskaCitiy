import type { BuildingId, JobId, SpotId } from '../sim/types';

export type TransportMode = 'busz' | 'vonat' | 'repulo';

export interface Route {
  from: BuildingId;
  to: BuildingId;
  mode: TransportMode;
  /** Indulási idők a napon belül (perc). */
  departures: number[];
  price: number;
  job: JobId;
  /** Repülőnél: a kapu, ahol várni kell. */
  spot: SpotId | null;
}

const hours = (from: number, to: number, offset: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => (from + i) * 60 + offset);

export const ROUTES: Route[] = [
  { from: 'busz_bv', to: 'busz_pv', mode: 'busz', departures: hours(6, 21, 0), price: 1, job: 'buszsofor', spot: null },
  { from: 'busz_pv', to: 'busz_bv', mode: 'busz', departures: hours(6, 21, 30), price: 1, job: 'buszsofor', spot: null },
  { from: 'vasut_bv', to: 'vasut_hh', mode: 'vonat', departures: [600, 960], price: 3, job: 'mozdonyvezeto', spot: null },
  { from: 'vasut_hh', to: 'vasut_bv', mode: 'vonat', departures: [720, 1080], price: 3, job: 'mozdonyvezeto', spot: null },
  { from: 'repter_pv', to: 'repter_sz', mode: 'repulo', departures: [540, 780, 1020], price: 5, job: 'pilota', spot: 'kapu_sz' },
  { from: 'repter_pv', to: 'repter_os', mode: 'repulo', departures: [540, 780, 1020], price: 5, job: 'pilota', spot: 'kapu_os' },
  { from: 'repter_sz', to: 'repter_pv', mode: 'repulo', departures: [660, 900, 1140], price: 5, job: 'pilota', spot: null },
  { from: 'repter_os', to: 'repter_pv', mode: 'repulo', departures: [660, 900, 1140], price: 5, job: 'pilota', spot: null },
];

export const MODE_LABEL: Record<TransportMode, { name: string; emoji: string }> = {
  busz: { name: 'Busz', emoji: '🚌' },
  vonat: { name: 'Vonat', emoji: '🚂' },
  repulo: { name: 'Repülő', emoji: '✈️' },
};

export function routesFrom(building: BuildingId): Route[] {
  return ROUTES.filter((r) => r.from === building);
}

/** A következő indulás percben (abszolút), az adott pillanat után. */
export function nextDeparture(route: Route, minute: number): number {
  const day = Math.floor(minute / 1440);
  for (let d = 0; d < 2; d++) {
    for (const t of route.departures) {
      const abs = (day + d) * 1440 + t;
      if (abs > minute) return abs;
    }
  }
  return Infinity;
}
