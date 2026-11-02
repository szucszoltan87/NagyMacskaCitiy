import { BUILDINGS, STREETS } from '../data/buildings';
import { togglePause } from '../sim/actions';
import { dayOf, formatClock, phaseOf, type DayPhase } from '../sim/time';
import { useGame } from '../store/store';

const PHASE_ICON: Record<DayPhase, string> = { reggel: '🌅', nappal: '☀️', este: '🌇', ejjel: '🌙' };

export function IconBtn({ icon, label, onClick, badge }: { icon: string; label: string; onClick: () => void; badge?: string }) {
  return (
    <button className="icon-btn" aria-label={label} onClick={onClick}>
      <span className="ib-icon">{icon}{badge && <span className="ib-badge">{badge}</span>}</span>
      <span className="ib-label">{label}</span>
    </button>
  );
}

export function Hud() {
  const world = useGame((s) => s.world)!;
  const screen = useGame((s) => s.screen);
  const setScreen = useGame((s) => s.setScreen);
  const openModal = useGame((s) => s.openModal);
  const act = useGame((s) => s.act);
  const building = screen.kind === 'inside' ? BUILDINGS[screen.building] : null;
  const street = screen.kind === 'city' ? STREETS[screen.street] : null;
  const done = world.quests.filter((q) => q.done).length;
  return (
    <div className="hud">
      <div className="hud-left">
        {building && <button className="round-btn" aria-label="Utca" onClick={() => setScreen({ kind: 'city', street: building.street })}>⬅</button>}
        {building && <div className="ribbon">{building.emoji} {building.name}</div>}
        {street && <button className="ribbon lilac" onClick={() => openModal({ kind: 'map' })}>{street.emoji} {street.name} 🗺️</button>}
        {world.event && <button className="pill alert" onClick={() => openModal({ kind: 'event' })}>🚨 Segítség kell!</button>}
      </div>
      <div className="hud-right">
        <div className="pill">{PHASE_ICON[phaseOf(world.minute)]} {formatClock(world.minute)} · {dayOf(world.minute)}. nap</div>
        <div className="pill coin">🐾 {world.coins}</div>
        <div className="pill star">⭐ {world.stars}</div>
        <IconBtn icon="📋" label="Feladatok" badge={`${done}/${world.quests.length}`} onClick={() => openModal({ kind: 'quests' })} />
        <IconBtn icon="🗺️" label="Térkép" onClick={() => openModal({ kind: 'map' })} />
        <IconBtn icon="🐱" label="Macskáim" onClick={() => openModal({ kind: 'catlist' })} />
        <IconBtn icon="📖" label="Lexikon" onClick={() => openModal({ kind: 'lexicon' })} />
        <IconBtn icon={world.paused ? '▶️' : '⏸️'} label={world.paused ? 'Folytatás' : 'Szünet'} onClick={() => act((w) => togglePause(w))} />
        <IconBtn icon="⚙️" label="Szülőknek" onClick={() => openModal({ kind: 'szulo' })} />
      </div>
    </div>
  );
}
