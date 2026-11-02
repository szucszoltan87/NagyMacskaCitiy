import { create } from 'zustand';
import type { TransportMode } from '../data/transport';
import { tickWorld } from '../sim/world';
import { realSecondsToGameMinutes } from '../sim/time';
import type { ActionResult, BuildingId, SfxName, StreetId, World } from '../sim/types';
import { playSfx } from '../ui/sfx';

export type Screen = { kind: 'city'; street: StreetId } | { kind: 'inside'; building: BuildingId } | { kind: 'creator' };
export interface Toast { text: string; id: number }
export interface Trip { mode: TransportMode; to: StreetId; names: string[]; id: number }

interface GameStore {
  world: World | null;
  screen: Screen;
  selectedCatId: string | null;
  heldCatId: string | null;
  focusCatId: string | null;
  toasts: Toast[];
  trip: Trip | null;
  setWorld: (world: World) => void;
  setScreen: (screen: Screen) => void;
  select: (id: string | null) => void;
  hold: (id: string | null) => void;
  focus: (id: string | null) => void;
  showToast: (text: string) => void;
  nextToast: () => void;
  endTrip: () => void;
  sfx: (name: SfxName) => void;
  /** Klónozza a világot, lefuttatja rajta az akciót, és ha van üzenet, kiírja. */
  act: (fn: (w: World) => ActionResult | void) => ActionResult | undefined;
  step: (realSeconds: number) => void;
}

let toastId = 0;

export const useGame = create<GameStore>((set, get) => ({
  world: null,
  screen: { kind: 'city', street: 'belvaros' },
  selectedCatId: null,
  heldCatId: null,
  focusCatId: null,
  toasts: [],
  trip: null,
  setWorld: (world) => set({ world }),
  setScreen: (screen) => set({ screen }),
  select: (selectedCatId) => set({ selectedCatId }),
  hold: (heldCatId) => set({ heldCatId }),
  focus: (focusCatId) => set({ focusCatId }),
  showToast: (text) => {
    const { toasts } = get();
    if (toasts.some((t) => t.text === text)) return;
    set({ toasts: [...toasts, { text, id: ++toastId }].slice(-6) });
  },
  nextToast: () => set({ toasts: get().toasts.slice(1) }),
  endTrip: () => set({ trip: null }),
  sfx: (name) => {
    if (get().world?.sound !== false) playSfx(name);
  },
  act: (fn) => {
    const current = get().world;
    if (!current) return undefined;
    const draft = structuredClone(current);
    const starsBefore = draft.stars;
    const result = fn(draft) as ActionResult | undefined;
    const inbox = draft.inbox.splice(0);
    set({ world: draft });
    if (result?.message) get().showToast(result.message);
    for (const m of inbox) get().showToast(m);
    if (draft.stars > starsBefore) get().sfx('csillag');
    else if (result?.sfx) get().sfx(result.sfx);
    return result;
  },
  step: (realSeconds) => {
    const { world, heldCatId, screen } = get();
    if (!world || world.paused) return;
    const draft = structuredClone(world);
    const starsBefore = draft.stars;
    const events = tickWorld(draft, realSecondsToGameMinutes(realSeconds), Math.random, heldCatId);
    const inbox = draft.inbox.splice(0);
    set({ world: draft });
    for (const m of inbox) get().showToast(m);
    if (draft.stars > starsBefore) get().sfx('csillag');
    for (const e of events) {
      if (e.kind === 'uzenet') {
        get().showToast(e.text);
        continue;
      }
      if (screen.kind === 'inside' && screen.building === e.from) {
        get().sfx(e.mode);
        set({ trip: { mode: e.mode, to: e.to, names: e.names, id: ++toastId } });
      }
    }
  },
}));
