import type { CSSProperties } from 'react';
import { CatFace } from '../art/CatFace';
import { isHome } from '../data/buildings';
import { AGE_LABEL, JOB_LABEL } from '../data/jobs';
import { SPECIES } from '../data/species';
import { putToBed } from '../sim/actions';
import { NEED_KEYS } from '../sim/needs';
import type { NeedKey } from '../sim/types';
import { useGame } from '../store/store';
import { statusText } from './catStatus';

const NEED_ICON: Record<NeedKey, string> = { etel: '🍗', ital: '💧', alvas: '😴', jokedv: '😊' };
const NEED_NAME: Record<NeedKey, string> = { etel: 'Étel', ital: 'Ital', alvas: 'Alvás', jokedv: 'Jókedv' };

function Meter({ k, value }: { k: NeedKey; value: number }) {
  const color = value > 50 ? 'var(--good)' : value > 20 ? 'var(--mid)' : 'var(--bad)';
  const style = { '--v': Math.round(value), '--c': color } as CSSProperties;
  return (
    <div className="meter" style={style} role="meter" aria-label={NEED_NAME[k]} aria-valuenow={Math.round(value)}>
      <span>{NEED_ICON[k]}</span>
    </div>
  );
}

export function CatPanel() {
  const world = useGame((s) => s.world)!;
  const id = useGame((s) => s.selectedCatId);
  const select = useGame((s) => s.select);
  const act = useGame((s) => s.act);
  const cat = world.cats.find((c) => c.id === id);
  if (!cat) return null;
  return (
    <div className="cat-card-panel" key={cat.id}>
      <div className="avatar"><CatFace looks={cat.looks} sick={cat.sick} sleeping={cat.activity === 'alszik'} sex={cat.sex} /></div>
      <div className="cat-info">
        <div className="name">{cat.name}</div>
        <div className="badges">
          <span className="badge">{SPECIES[cat.species].name}</span>
          <span className="badge">{AGE_LABEL[cat.age]}</span>
          <span className="badge">{cat.diet === 'vega' ? '🥕 Vega' : '🍖 Húsevő'}</span>
          {cat.job && <span className="badge">{JOB_LABEL[cat.job]}</span>}
        </div>
        <div className="status">{statusText(cat)}</div>
      </div>
      <div className="meters">
        {NEED_KEYS.map((k) => <Meter key={k} k={k} value={cat.needs[k]} />)}
      </div>
      {isHome(cat.place) && cat.activity !== 'alszik' && (
        <button className="chip-btn" onClick={() => act((w) => putToBed(w, cat.id))}>🛏️ Lefekszik</button>
      )}
      <button className="x-btn" aria-label="Bezár" onClick={() => select(null)}>✕</button>
    </div>
  );
}
