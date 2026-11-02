import type { BuildingId, SpotId } from '../sim/types';

export interface SpotDef { building: BuildingId | 'otthon'; x: number; label: string; activity: 'jatszik' | 'uszik' | 'all' }

export const SPOTS: Record<SpotId, SpotDef> = {
  hinta: { building: 'park', x: 330, label: '🎠 Hinta', activity: 'jatszik' },
  csuszda: { building: 'park', x: 690, label: '🛝 Csúszda', activity: 'jatszik' },
  viz: { building: 'strand', x: 760, label: '🌊 Víz', activity: 'uszik' },
  kad: { building: 'otthon', x: 0, label: '🛁 Kád', activity: 'jatszik' },
  kapu_sz: { building: 'repter_pv', x: 560, label: '🦒 Kapu: Szavanna', activity: 'all' },
  kapu_os: { building: 'repter_pv', x: 820, label: '🌴 Kapu: Őserdő', activity: 'all' },
};
