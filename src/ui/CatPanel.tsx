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

function NeedBar({ icon, value }: { icon: string; value: number }) {
  const color = value > 50 ? 'var(--good)' : value > 20 ? 'var(--mid)' : 'var(--bad)';
  return (
    <div className="bar">
      <span>{icon}</span>
      <div className="track"><div className="fill" style={{ width: `${value}%`, background: color }} /></div>
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
    <div className="cat-panel">
      <CatFace className="face" looks={cat.looks} sick={cat.sick} sleeping={cat.activity === 'alszik'} />
      <div>
        <h2>{cat.name}</h2>
        <div className="badges">
          <span className="badge">{SPECIES[cat.species].name}</span>
          <span className="badge">{AGE_LABEL[cat.age]}</span>
          <span className="badge">{cat.diet === 'vega' ? '🥕 Vega' : '🍖 Húsevő'}</span>
          {cat.job && <span className="badge">{JOB_LABEL[cat.job]}</span>}
          {cat.sick && <span className="badge">🤒 Beteg</span>}
        </div>
      </div>
      <div className="bars">
        {NEED_KEYS.map((k) => <NeedBar key={k} icon={NEED_ICON[k]} value={cat.needs[k]} />)}
      </div>
      <div className="status">{statusText(cat)}</div>
      {isHome(cat.place) && cat.activity !== 'alszik' && (
        <button className="panel-btn" onClick={() => act((w) => putToBed(w, cat.id))}>🛏️ Lefekszik</button>
      )}
      <button className="close" aria-label="Bezár" onClick={() => select(null)}>✕</button>
    </div>
  );
}
