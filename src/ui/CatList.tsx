import { CatFace } from '../art/CatFace';
import { placeName } from '../data/buildings';
import { MAX_CATS } from '../sim/balance';
import type { Cat } from '../sim/types';
import { useGame } from '../store/store';
import { warningIcons } from './catStatus';

export function CatList({ onClose }: { onClose: () => void }) {
  const world = useGame((s) => s.world)!;
  const go = (cat: Cat) => {
    const g = useGame.getState();
    g.setScreen(cat.place === 'utca' ? { kind: 'city' } : { kind: 'inside', building: cat.place });
    g.select(cat.id);
    g.focus(cat.id);
    onClose();
  };
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>🐱 Macskáim ({world.cats.length}/{MAX_CATS})</h2>
        <div className="cat-grid">
          {world.cats.map((c) => (
            <button key={c.id} className="cat-card" onClick={() => go(c)}>
              <CatFace looks={c.looks} sick={c.sick} sleeping={c.activity === 'alszik'} />
              <span>{c.name}</span>
              <small>{placeName(c.place)} {warningIcons(c)}</small>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
