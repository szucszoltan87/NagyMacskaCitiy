import { useState } from 'react';
import { CatFace } from '../art/CatFace';
import { CatFigure } from '../art/CatFigure';
import { shade } from '../art/color';
import { BUILDINGS } from '../data/buildings';
import { AGE_LABEL, JOB_IDS, JOB_LABEL } from '../data/jobs';
import { SPECIES, SPECIES_IDS } from '../data/species';
import { addCat, defaultLooks, hasMane, type CatDraft } from '../sim/cats';
import { randomName } from '../sim/names';
import type { AgeStage, HomeId, PatternKind, Sex, SpeciesId } from '../sim/types';
import { useGame } from '../store/store';

const FUN_FURS = ['#F2C14E', '#E07B39', '#C9955E', '#8D6E63', '#D9D9D2', '#FFFFFF', '#2E2A33', '#F8BBD0', '#CE93D8', '#90CAF9'];
const EYES = ['#E2B33C', '#8FB7C9', '#9BBF6A', '#6D4C41', '#4FC3F7', '#BA68C8'];
const PATTERNS: Array<[PatternKind, string]> = [['nincs', 'Nincs'], ['csikos', 'Csíkos'], ['rozettas', 'Rozettás'], ['pottyos', 'Pöttyös'], ['felhos', 'Felhős']];
const AGES: AgeStage[] = ['baba', 'gyerek', 'felnott'];
const HOMES: HomeId[] = ['otthon1', 'otthon2'];

const cls = (base: string, on: boolean) => (on ? `${base} on` : base);

function newDraft(species: SpeciesId, sex: Sex, age: AgeStage): CatDraft {
  return { name: randomName(sex), species, sex, age, diet: 'husevo', job: null, looks: defaultLooks(species, sex, age), homeId: 'otthon1' };
}

export function CreatorScreen() {
  const act = useGame((s) => s.act);
  const setScreen = useGame((s) => s.setScreen);
  const [d, setD] = useState<CatDraft>(() => newDraft('jaguar', 'lany', 'felnott'));

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

  return (
    <div className="creator">
      <div className="creator-preview">
        <h1>🛠️ Macskaműhely</h1>
        <svg viewBox="-110 -200 220 210" aria-hidden="true">
          <CatFigure looks={d.looks} age={d.age} activity="all" sick={false} facing={1} />
        </svg>
        <div className="fact">💡 Tudtad? {SPECIES[d.species].fact}<br />🌍 Otthona: {SPECIES[d.species].habitat}</div>
      </div>

      <div className="creator-form">
        <section>
          <h3>Milyen nagymacska?</h3>
          <div className="choices">
            {SPECIES_IDS.map((id) => (
              <button key={id} className={cls('choice species-choice', d.species === id)} onClick={() => setSpecies(id)}>
                <CatFace looks={defaultLooks(id, 'lany', 'felnott')} />
                {SPECIES[id].name}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3>Lány vagy fiú?</h3>
          <div className="choices">
            <button className={cls('choice', d.sex === 'lany')} onClick={() => setSexAge('lany', d.age)}>👧 Lány</button>
            <button className={cls('choice', d.sex === 'fiu')} onClick={() => setSexAge('fiu', d.age)}>👦 Fiú</button>
          </div>
        </section>

        <section>
          <h3>Hány éves?</h3>
          <div className="choices">
            {AGES.map((a) => (
              <button key={a} className={cls('choice', d.age === a)} onClick={() => setSexAge(d.sex, a)}>{AGE_LABEL[a]}</button>
            ))}
          </div>
        </section>

        <section>
          <h3>Bunda színe</h3>
          <div className="choices">
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
        </section>

        <section>
          <h3>Minta</h3>
          <div className="choices">
            {PATTERNS.map(([p, label]) => (
              <button key={p} className={cls('choice', d.looks.pattern === p)} onClick={() => update({ looks: { ...d.looks, pattern: p } })}>{label}</button>
            ))}
          </div>
        </section>

        <section>
          <h3>Szemszín</h3>
          <div className="choices">
            {EYES.map((e) => (
              <button key={e} aria-label={`Szem ${e}`} className={cls('swatch', d.looks.eyes === e)} style={{ background: e }} onClick={() => update({ looks: { ...d.looks, eyes: e } })} />
            ))}
          </div>
        </section>

        <section>
          <h3>Mit eszik?</h3>
          <div className="choices">
            <button className={cls('choice', d.diet === 'vega')} onClick={() => update({ diet: 'vega' })}>🥕 Vega</button>
            <button className={cls('choice', d.diet === 'husevo')} onClick={() => update({ diet: 'husevo' })}>🍖 Húsevő</button>
          </div>
        </section>

        {d.age === 'felnott' && (
          <section>
            <h3>Szakma (ha akarod)</h3>
            <div className="choices">
              <button className={cls('choice', d.job === null)} onClick={() => update({ job: null })}>Nincs</button>
              {JOB_IDS.map((j) => (
                <button key={j} className={cls('choice', d.job === j)} onClick={() => update({ job: j })}>{JOB_LABEL[j]}</button>
              ))}
            </div>
          </section>
        )}

        <section>
          <h3>Hol lakik?</h3>
          <div className="choices">
            {HOMES.map((h) => (
              <button key={h} className={cls('choice', d.homeId === h)} onClick={() => update({ homeId: h })}>
                {BUILDINGS[h].emoji} {BUILDINGS[h].name}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3>Neve</h3>
          <div className="name-row">
            <input placeholder="Név" value={d.name} maxLength={16} onChange={(e) => update({ name: e.target.value })} />
            <button className="choice" aria-label="Véletlen név" onClick={() => update({ name: randomName(d.sex) })}>🎲</button>
          </div>
        </section>

        <div className="creator-actions">
          <button className="big-btn grey" onClick={() => setScreen({ kind: 'city' })}>❌ Mégse</button>
          <button className="big-btn" onClick={finish}>✅ Kész!</button>
        </div>
      </div>
    </div>
  );
}
