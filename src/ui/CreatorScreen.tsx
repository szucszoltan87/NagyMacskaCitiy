import { useState, type ReactNode } from 'react';
import { CatFace } from '../art/CatFace';
import { CatFigure } from '../art/CatFigure';
import { shade } from '../art/color';
import { Sparkle } from '../art/Scenery';
import { BUILDINGS } from '../data/buildings';
import { AGE_LABEL, JOB_IDS, JOB_LABEL } from '../data/jobs';
import { SPECIES, SPECIES_IDS } from '../data/species';
import { addCat, defaultLooks, hasMane, type CatDraft } from '../sim/cats';
import { randomName } from '../sim/names';
import type { AgeStage, HomeId, PatternKind, Sex, SpeciesId } from '../sim/types';
import { useGame } from '../store/store';

const FUN_FURS = ['#F2C14E', '#E07B39', '#C9955E', '#8D6E63', '#D9D9D2', '#FFFFFF', '#2E2A33', '#F8BBD0', '#CE93D8', '#90CAF9', '#A8E6CF', '#FFE58F'];
const EYES = ['#E2B33C', '#8FB7C9', '#9BBF6A', '#6D4C41', '#4FC3F7', '#BA68C8', '#FF8FB4', '#5CC3A0'];
const PATTERNS: Array<[PatternKind, string]> = [['nincs', 'Nincs'], ['csikos', 'Csíkos'], ['rozettas', 'Rozettás'], ['pottyos', 'Pöttyös'], ['felhos', 'Felhős']];
const AGES: AgeStage[] = ['baba', 'gyerek', 'felnott'];
const HOMES: HomeId[] = ['otthon1', 'otthon2'];

type Tab = 'faj' | 'ki' | 'bunda' | 'minta' | 'szem' | 'etrend' | 'szakma' | 'otthon';
const TABS: Array<[Tab, string, string]> = [
  ['faj', '🐾', 'Milyen nagymacska?'],
  ['ki', '🎀', 'Lány vagy fiú? Hány éves?'],
  ['bunda', '🎨', 'Bunda színe'],
  ['minta', '🐆', 'Minta'],
  ['szem', '👀', 'Szemszín'],
  ['etrend', '🥕', 'Mit eszik?'],
  ['szakma', '💼', 'Szakma (ha akarod)'],
  ['otthon', '🏠', 'Hol lakik?'],
];

const cls = (base: string, on: boolean) => (on ? `${base} on` : base);

function newDraft(species: SpeciesId, sex: Sex, age: AgeStage): CatDraft {
  return { name: randomName(sex), species, sex, age, diet: 'husevo', job: null, looks: defaultLooks(species, sex, age), homeId: 'otthon1' };
}

function Stage({ draft }: { draft: CatDraft }) {
  return (
    <svg viewBox="-160 -400 320 500" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <rect x={-700} y={-900} width={1400} height={960} fill="#EDE4FF" />
      {Array.from({ length: 60 }, (_, i) => (
        <circle key={i} cx={-600 + (i % 12) * 100 + (Math.floor(i / 12) % 2) * 50} cy={-560 + Math.floor(i / 12) * 90} r={6} fill="#DCCFFA" />
      ))}
      <path d="M -70 -150 L -70 -270 A 70 70 0 0 1 70 -270 L 70 -150 Z" fill="#CDEBFF" stroke="#fff" strokeWidth={10} />
      <line x1={0} y1={-338} x2={0} y2={-150} stroke="#fff" strokeWidth={6} />
      <circle cx={-26} cy={-262} r={14} fill="#fff" opacity={0.9} />
      <circle cx={-6} cy={-268} r={18} fill="#fff" opacity={0.9} />
      <path d="M -104 -352 Q -60 -260 -72 -136 L -104 -136 Z" fill="#FFC4D8" stroke="#F29BB8" strokeWidth={3} />
      <path d="M 104 -352 Q 60 -260 72 -136 L 104 -136 Z" fill="#FFC4D8" stroke="#F29BB8" strokeWidth={3} />
      <rect x={-700} y={-20} width={1400} height={500} fill="#F6D9C4" />
      <rect x={-700} y={-32} width={1400} height={14} fill="#fff" />
      <ellipse cx={0} cy={40} rx={150} ry={34} fill="#fff" />
      {Array.from({ length: 18 }, (_, i) => {
        const a = (i / 18) * Math.PI * 2;
        return <circle key={i} cx={Math.cos(a) * 150} cy={40 + Math.sin(a) * 34} r={10} fill="#fff" />;
      })}
      <Sparkle x={-120} y={-200} s={12} fill="#FFE58F" className="twinkle" />
      <Sparkle x={124} y={-90} s={9} fill="#FF9EBE" className="twinkle" delay={0.7} />
      <Sparkle x={-118} y={-60} s={7} fill="#C9B6F2" className="twinkle" delay={1.4} />
      <g transform="translate(0 46) scale(1.35)">
        <CatFigure looks={draft.looks} age={draft.age} activity="all" sick={false} facing={1} sex={draft.sex} />
      </g>
    </svg>
  );
}

export function CreatorScreen() {
  const act = useGame((s) => s.act);
  const setScreen = useGame((s) => s.setScreen);
  const [d, setD] = useState<CatDraft>(() => newDraft('jaguar', 'lany', 'felnott'));
  const [tab, setTab] = useState<Tab>('faj');

  const update = (patch: Partial<CatDraft>) => setD((p) => ({ ...p, ...patch }));
  const setSpecies = (species: SpeciesId) => setD((p) => ({ ...p, species, looks: defaultLooks(species, p.sex, p.age) }));
  const setSexAge = (sex: Sex, age: AgeStage) =>
    setD((p) => ({ ...p, sex, age, job: age === 'felnott' ? p.job : null, looks: { ...p.looks, mane: hasMane(p.species, sex, age) } }));
  const setFur = (fur: string) => setD((p) => ({ ...p, looks: { ...p.looks, fur, belly: shade(fur, 0.6), patternColor: shade(fur, -0.6) } }));
  const speciesFur = SPECIES[d.species].looks.fur;

  const finish = () => {
    const r = act((w) => addCat(w, d));
    if (r?.ok) setScreen({ kind: 'city' });
  };

  const tabs = TABS.filter(([t]) => t !== 'szakma' || d.age === 'felnott');
  const current = tabs.find(([t]) => t === tab) ?? tabs[0];

  let options: ReactNode;
  switch (current[0]) {
    case 'faj':
      options = (
        <div className="opt-grid">
          {SPECIES_IDS.map((id) => (
            <button key={id} className={cls('card', d.species === id)} onClick={() => setSpecies(id)}>
              <CatFace looks={defaultLooks(id, 'lany', 'felnott')} />
              {SPECIES[id].name}
            </button>
          ))}
        </div>
      );
      break;
    case 'ki':
      options = (
        <>
          <div className="opt-grid">
            <button className={cls('card', d.sex === 'lany')} onClick={() => setSexAge('lany', d.age)}><span className="card-emoji">👧</span>Lány</button>
            <button className={cls('card', d.sex === 'fiu')} onClick={() => setSexAge('fiu', d.age)}><span className="card-emoji">👦</span>Fiú</button>
          </div>
          <div className="opt-grid">
            {AGES.map((a) => (
              <button key={a} className={cls('card', d.age === a)} onClick={() => setSexAge(d.sex, a)}>
                <span className="card-emoji">{AGE_LABEL[a].split(' ')[0]}</span>{AGE_LABEL[a].split(' ').slice(1).join(' ')}
              </button>
            ))}
          </div>
        </>
      );
      break;
    case 'bunda':
      options = (
        <div className="swatches">
          {[speciesFur, ...FUN_FURS.filter((f) => f !== speciesFur)].map((f, i) => (
            <button
              key={f}
              aria-label={i === 0 ? 'Eredeti szín' : `Szín ${f}`}
              className={cls('swatch', d.looks.fur === f)}
              style={{ background: f }}
              onClick={() => (i === 0 ? setSpecies(d.species) : setFur(f))}
            />
          ))}
        </div>
      );
      break;
    case 'minta':
      options = (
        <div className="opt-grid">
          {PATTERNS.map(([p, label]) => (
            <button key={p} className={cls('card', d.looks.pattern === p)} onClick={() => update({ looks: { ...d.looks, pattern: p } })}>
              <CatFace looks={{ ...d.looks, pattern: p }} />
              {label}
            </button>
          ))}
        </div>
      );
      break;
    case 'szem':
      options = (
        <div className="swatches">
          {EYES.map((e) => (
            <button key={e} aria-label={`Szem ${e}`} className={cls('swatch', d.looks.eyes === e)} style={{ background: e }} onClick={() => update({ looks: { ...d.looks, eyes: e } })} />
          ))}
        </div>
      );
      break;
    case 'etrend':
      options = (
        <div className="opt-grid">
          <button className={cls('card', d.diet === 'vega')} onClick={() => update({ diet: 'vega' })}><span className="card-emoji">🥕</span>Vega</button>
          <button className={cls('card', d.diet === 'husevo')} onClick={() => update({ diet: 'husevo' })}><span className="card-emoji">🍖</span>Húsevő</button>
        </div>
      );
      break;
    case 'szakma':
      options = (
        <div className="opt-grid">
          <button className={cls('card', d.job === null)} onClick={() => update({ job: null })}><span className="card-emoji">🌈</span>Nincs</button>
          {JOB_IDS.map((j) => (
            <button key={j} className={cls('card', d.job === j)} onClick={() => update({ job: j })}>
              <span className="card-emoji">{JOB_LABEL[j].split(' ')[0]}</span>{JOB_LABEL[j].split(' ').slice(1).join(' ')}
            </button>
          ))}
        </div>
      );
      break;
    case 'otthon':
      options = (
        <div className="opt-grid">
          {HOMES.map((h) => (
            <button key={h} className={cls('card', d.homeId === h)} onClick={() => update({ homeId: h })}>
              <span className="card-emoji">{BUILDINGS[h].emoji}</span>{BUILDINGS[h].name}
            </button>
          ))}
        </div>
      );
      break;
  }

  return (
    <div className="creator">
      <div className="creator-stage">
        <Stage draft={d} />
        <div className="fact-bubble">💡 {SPECIES[d.species].fact}<br />🌍 Otthona: {SPECIES[d.species].habitat}</div>
        <div className="stage-actions">
          <button className="round-btn big ok" aria-label="Kész" onClick={finish}>✔</button>
          <button className="round-btn grey" aria-label="Mégse" onClick={() => setScreen({ kind: 'city' })}>✕</button>
        </div>
        <div className="name-plate">
          <input placeholder="Név" value={d.name} maxLength={16} onChange={(e) => update({ name: e.target.value })} />
          <button aria-label="Véletlen név" onClick={() => update({ name: randomName(d.sex) })}>🎲</button>
        </div>
      </div>
      <div className="creator-panel">
        <div className="tab-rail">
          {tabs.map(([t, icon, title]) => (
            <button key={t} className={cls('tab', current[0] === t)} aria-label={title} onClick={() => setTab(t)}>{icon}</button>
          ))}
        </div>
        <div className="opt-area">
          <div><span className="ribbon">🛠️ Macskaműhely</span></div>
          <h3>{current[2]}</h3>
          {options}
        </div>
      </div>
    </div>
  );
}
