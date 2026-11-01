import { useState } from 'react';
import { BUILDINGS } from '../data/buildings';
import { togglePause } from '../sim/actions';
import { dayOf, formatClock, phaseOf, type DayPhase } from '../sim/time';
import { useGame } from '../store/store';
import { CatList } from './CatList';

const PHASE_ICON: Record<DayPhase, string> = { reggel: '🌅', nappal: '☀️', este: '🌇', ejjel: '🌙' };

export function Hud() {
  const world = useGame((s) => s.world)!;
  const screen = useGame((s) => s.screen);
  const setScreen = useGame((s) => s.setScreen);
  const act = useGame((s) => s.act);
  const [listOpen, setListOpen] = useState(false);
  const building = screen.kind === 'inside' ? BUILDINGS[screen.building] : null;
  return (
    <>
      <div className="hud">
        {building && <button className="chip btn" onClick={() => setScreen({ kind: 'city' })}>⬅ Utca</button>}
        {building && <div className="chip">{building.emoji} {building.name}</div>}
        <div className="spacer" />
        <div className="chip">{PHASE_ICON[phaseOf(world.minute)]} {formatClock(world.minute)} · {dayOf(world.minute)}. nap</div>
        <div className="chip">🐾 {world.coins}</div>
        <button className="chip btn" onClick={() => setListOpen(true)}>🐱 Macskáim</button>
        <button className="chip btn" onClick={() => setScreen({ kind: 'creator' })}>➕ Új macska</button>
        <button className="chip btn" aria-label={world.paused ? 'Folytatás' : 'Szünet'} onClick={() => act((w) => togglePause(w))}>
          {world.paused ? '▶️' : '⏸️'}
        </button>
      </div>
      {listOpen && <CatList onClose={() => setListOpen(false)} />}
    </>
  );
}
