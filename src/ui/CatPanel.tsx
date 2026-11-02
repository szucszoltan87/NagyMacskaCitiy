import type { CSSProperties } from 'react';
import { CatFace } from '../art/CatFace';
import { isSleepPlace } from '../data/buildings';
import { AGE_LABEL, JOB_LABEL } from '../data/jobs';
import { speciesName } from '../data/species';
import { putToBed } from '../sim/actions';
import { canDress } from '../sim/clothes';
import { partnerOf, wantBaby } from '../sim/family';
import { NEED_KEYS } from '../sim/needs';
import type { NeedKey } from '../sim/types';
import { useGame } from '../store/store';
import { statusText, wishLine } from './catStatus';

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
  const openModal = useGame((s) => s.openModal);
  const cat = world.cats.find((c) => c.id === id);
  if (!cat) return null;
  const partner = partnerOf(world, cat);
  const adult = cat.age === 'felnott';
  const wish = wishLine(cat);
  return (
    <div className="cat-card-panel" key={cat.id}>
      <div className="avatar"><CatFace cat={cat} /></div>
      <div className="cat-info">
        <div className="name">{cat.name}</div>
        <div className="badges">
          <span className="badge">{speciesName(cat.species, cat.hybrid)}</span>
          <span className="badge">{AGE_LABEL[cat.age]}</span>
          <span className="badge">{cat.diet === 'vega' ? '🥕 Vega' : '🍖 Húsevő'}</span>
          {cat.job && <span className="badge">{JOB_LABEL[cat.job]}</span>}
          {partner && <span className="badge">{cat.bond >= 100 ? '💞' : `💗 ${Math.round(cat.bond)}%`} {partner.name}</span>}
          {cat.pregnancy && <span className="badge">🤰 Babát vár</span>}
          {cat.knowledge > 0 && <span className="badge">📚 {cat.knowledge}</span>}
        </div>
        <div className="status">{statusText(world, cat)}</div>
        {wish && <div className="wish-line">{wish}</div>}
        <div className="cat-actions">
          {canDress(cat.place) && <button className="chip-btn" onClick={() => openModal({ kind: 'wardrobe', catId: cat.id })}>👗 Öltöztetés</button>}
          {isSleepPlace(cat.place) && cat.activity !== 'alszik' && <button className="chip-btn" onClick={() => act((w) => putToBed(w, cat.id))}>🛏️ Lefekszik</button>}
          {adult && <button className="chip-btn" onClick={() => openModal({ kind: 'job', catId: cat.id })}>💼 Szakma</button>}
          {adult && !partner && <button className="chip-btn" onClick={() => openModal({ kind: 'partner', catId: cat.id })}>💞 Párt keresek</button>}
          {partner && cat.bond >= 100 && !cat.pregnancy && !partner.pregnancy && (
            <button className="chip-btn" onClick={() => act((w) => wantBaby(w, cat.id))}>👶 Babát szeretnénk</button>
          )}
          {cat.pregnancy && !cat.pregnancy.guess && <button className="chip-btn" onClick={() => openModal({ kind: 'tipp', catId: cat.id })}>❓ Milyen lesz?</button>}
          {(cat.homeId === 'otthon1' || cat.homeId === 'otthon2' || cat.homeId === 'otthon3') && (
            <button className="chip-btn" onClick={() => openModal({ kind: 'home', catId: cat.id })}>🏠 Lakhely</button>
          )}
        </div>
      </div>
      <div className="meters">
        {NEED_KEYS.map((k) => <Meter key={k} k={k} value={cat.needs[k]} />)}
      </div>
      <button className="x-btn" aria-label="Bezár" onClick={() => select(null)}>✕</button>
    </div>
  );
}
