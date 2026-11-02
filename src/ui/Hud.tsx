import { useState } from 'react';
import { BUILDINGS } from '../data/buildings';
import { togglePause } from '../sim/actions';
import { dayOf, formatClock, phaseOf, type DayPhase } from '../sim/time';
import { useGame } from '../store/store';
import { CatList } from './CatList';

const PHASE_ICON: Record<DayPhase, string> = { reggel: '🌅', nappal: '☀️', este: '🌇', ejjel: '🌙' };

export function IconBtn({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button className="icon-btn" aria-label={label} onClick={onClick}>
      <span className="ib-icon">{icon}</span>
      <span className="ib-label">{label}</span>
    </button>
  );
}

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
        <div className="hud-left">
          {building && <button className="round-btn" aria-label="Utca" onClick={() => setScreen({ kind: 'city' })}>⬅</button>}
          {building && <div className="ribbon">{building.emoji} {building.name}</div>}
        </div>
        <div className="hud-right">
          <div className="pill">{PHASE_ICON[phaseOf(world.minute)]} {formatClock(world.minute)} · {dayOf(world.minute)}. nap</div>
          <div className="pill coin">🐾 {world.coins}</div>
          <IconBtn icon="🐱" label="Macskáim" onClick={() => setListOpen(true)} />
          <IconBtn icon="➕" label="Új macska" onClick={() => setScreen({ kind: 'creator' })} />
          <IconBtn icon={world.paused ? '▶️' : '⏸️'} label={world.paused ? 'Folytatás' : 'Szünet'} onClick={() => act((w) => togglePause(w))} />
        </div>
      </div>
      {listOpen && <CatList onClose={() => setListOpen(false)} />}
    </>
  );
}
