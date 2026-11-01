import { create } from 'zustand';
import { tickWorld } from '../sim/world';
import { realSecondsToGameMinutes } from '../sim/time';
import type { ActionResult, BuildingId, World } from '../sim/types';

export type Screen = { kind: 'city' } | { kind: 'inside'; building: BuildingId } | { kind: 'creator' };

interface GameStore {
  world: World | null;
  screen: Screen;
  selectedCatId: string | null;
  heldCatId: string | null;
  focusCatId: string | null;
  toast: { text: string; id: number } | null;
  setWorld: (world: World) => void;
  setScreen: (screen: Screen) => void;
  select: (id: string | null) => void;
  hold: (id: string | null) => void;
  focus: (id: string | null) => void;
  showToast: (text: string) => void;
  /** Klónozza a világot, lefuttatja rajta az akciót, és ha van üzenet, kiírja. */
  act: (fn: (w: World) => ActionResult | void) => ActionResult | undefined;
  step: (realSeconds: number) => void;
}

let toastId = 0;

export const useGame = create<GameStore>((set, get) => ({
  world: null,
  screen: { kind: 'city' },
  selectedCatId: null,
  heldCatId: null,
  focusCatId: null,
  toast: null,
  setWorld: (world) => set({ world }),
  setScreen: (screen) => set({ screen }),
  select: (selectedCatId) => set({ selectedCatId }),
  hold: (heldCatId) => set({ heldCatId }),
  focus: (focusCatId) => set({ focusCatId }),
  showToast: (text) => set({ toast: { text, id: ++toastId } }),
  act: (fn) => {
    const current = get().world;
    if (!current) return undefined;
    const draft = structuredClone(current);
    const result = fn(draft) as ActionResult | undefined;
    set({ world: draft });
    if (result?.message) get().showToast(result.message);
    return result;
  },
  step: (realSeconds) => {
    const { world, heldCatId } = get();
    if (!world || world.paused) return;
    const draft = structuredClone(world);
    const events = tickWorld(draft, realSecondsToGameMinutes(realSeconds), Math.random, heldCatId);
    set({ world: draft });
    for (const e of events) get().showToast(e);
  },
}));
