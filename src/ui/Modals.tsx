import { useEffect, useRef, useState, type ReactNode } from 'react';
import { CatFace } from '../art/CatFace';
import { CatFigure } from '../art/CatFigure';
import { catLook } from '../art/catProps';
import { defaultLooks } from '../sim/cats';
import { BUILDINGS, HOME_IDS, placeName, STREET_IDS, STREETS } from '../data/buildings';
import { CLOTHES, PALETTE, SLOT_LABEL, SLOTS } from '../data/clothes';
import { edible, FOOD_IDS, FOODS, RECIPE_IDS, RECIPES } from '../data/foods';
import { JOB_IDS, JOB_LABEL } from '../data/jobs';
import { HYBRIDS, SPECIES, SPECIES_IDS } from '../data/species';
import { MODE_LABEL } from '../data/transport';
import { nextUnlock } from '../data/unlocks';
import { cook } from '../sim/actions';
import { MAX_CATS } from '../sim/balance';
import { isCityCat } from '../sim/cats';
import { takeOff, wear } from '../sim/clothes';
import { eventText } from '../sim/events';
import { guessBaby, nameBaby, pairUp, setHome, setJob } from '../sim/family';
import { answerLesson, makeQuestion, type Question } from '../sim/lessons';
import { answerGiraffes } from '../sim/local';
import { randomName } from '../sim/names';
import { streetOpen } from '../sim/progress';
import type { Cat, ClothingSlot, FoodId, StreetId } from '../sim/types';
import { createInitialWorld } from '../sim/world';
import { saveWorld } from '../store/save';
import { deserialize, serialize } from '../store/serialize';
import { useGame } from '../store/store';
import { warningIcons } from './catStatus';

function Shell({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="ribbon modal-title">{title}</div>
        <button className="x-btn modal-close" aria-label="Bezár" onClick={onClose}>✕</button>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

function useClose() {
  const openModal = useGame((s) => s.openModal);
  return () => openModal(null);
}

function goToCat(cat: Cat) {
  const g = useGame.getState();
  g.setScreen(cat.place === 'utca' ? { kind: 'city', street: cat.street } : { kind: 'inside', building: cat.place });
  g.select(cat.id);
  g.focus(cat.id);
  g.openModal(null);
}

function CatList() {
  const world = useGame((s) => s.world)!;
  const close = useClose();
  const groups: Array<[string, Cat[]]> = [
    ['A városban', world.cats.filter(isCityCat)],
    ['Rokonok a nagyvilágban', world.cats.filter((c) => !isCityCat(c))],
  ];
  return (
    <Shell title={`🐱 Macskáim (${world.cats.length}/${MAX_CATS})`} onClose={close}>
      {groups.map(([label, cats]) => (
        <div key={label}>
          <h3>{label}</h3>
          <div className="cat-grid">
            {cats.map((c) => (
              <button key={c.id} className="card" onClick={() => goToCat(c)}>
                <CatFace cat={c} />
                <span>{c.name}</span>
                <small>{placeName(c.place, c.street)} {warningIcons(c)}</small>
              </button>
            ))}
          </div>
        </div>
      ))}
    </Shell>
  );
}

function Quests() {
  const world = useGame((s) => s.world)!;
  const close = useClose();
  const next = nextUnlock(world.stars);
  return (
    <Shell title="📋 Mai feladatok" onClose={close}>
      <div className="quest-list">
        {world.quests.map((q, i) => (
          <div key={i} className={q.done ? 'quest done' : q.failed ? 'quest failed' : 'quest'}>
            <span className="quest-check">{q.done ? '✅' : q.failed ? '😅' : '⬜'}</span>
            <span className="quest-text">{q.text}</span>
            {q.goal > 1 && !q.done && q.kind !== 'pontos_koltes' && <span className="badge">{q.progress}/{q.goal}</span>}
            {q.kind === 'pontos_koltes' && !q.done && <span className="badge">eddig: {world.today.shopSpent} 🐾</span>}
          </div>
        ))}
      </div>
      <p className="hint-text">Minden kész feladat: +1 ⭐ és +3 🐾. Ha mindhárom kész: még +1 ⭐! Holnap újak jönnek.</p>
      <div className="unlock-card">
        <div className="pill star">⭐ {world.stars}</div>
        {next ? <span>Következő: <b>{next.text}</b> – {next.stars} ⭐-nál (még {next.stars - world.stars})</span> : <span>Minden hely nyitva! 🎉</span>}
      </div>
    </Shell>
  );
}

function MapModal() {
  const world = useGame((s) => s.world)!;
  const setScreen = useGame((s) => s.setScreen);
  const close = useClose();
  return (
    <Shell title="🗺️ Térkép" onClose={close}>
      <div className="map-grid">
        {STREET_IDS.map((id) => {
          const s = STREETS[id];
          const open = streetOpen(world, id);
          const n = world.cats.filter((c) => c.street === id && isCityCat(c)).length;
          return (
            <button
              key={id}
              className={open ? `card map-card ${s.scenery}` : 'card map-card locked'}
              onClick={() => {
                if (!open) return useGame.getState().showToast(`🔒 Még ${s.unlock - world.stars} ⭐ kell!`);
                setScreen({ kind: 'city', street: id as StreetId });
                close();
              }}
            >
              <span className="card-emoji">{open ? s.emoji : '🔒'}</span>
              <span>{s.name}</span>
              <small>{open ? `🐱 ${n} macska itt` : `${s.unlock} ⭐`}</small>
              {id === 'parkvaros' && <small>🚌 busszal</small>}
              {id === 'hoshegy' && <small>🚂 vonattal · ❄️ hideg</small>}
              {(id === 'szavanna' || id === 'oserdo') && <small>✈️ repülővel · {id === 'szavanna' ? '☀️ meleg' : '🌧️ esős'}</small>}
            </button>
          );
        })}
      </div>
    </Shell>
  );
}

function Lexicon() {
  const world = useGame((s) => s.world)!;
  const close = useClose();
  const total = SPECIES_IDS.length + HYBRIDS.length;
  return (
    <Shell title={`📖 Macskalexikon (${world.lexicon.length}/${total})`} onClose={close}>
      <p className="hint-text">Új kártyát kapsz, ha ilyen macskád lesz, vagy ha a vadonban rákoppintasz egyre!</p>
      <div className="lex-grid">
        {SPECIES_IDS.map((id) => {
          const s = SPECIES[id];
          const has = world.lexicon.includes(id);
          return (
            <div key={id} className={has ? 'card lex-card' : 'card lex-card locked'}>
              <CatFace looks={defaultLooks(id, 'lany', 'felnott')} className={has ? '' : 'silhouette'} />
              <b>{has ? s.name : '?'}</b>
              {has && <small>🌍 {s.habitat}</small>}
              {has && s.facts.map((f) => <small key={f}>💡 {f}</small>)}
            </div>
          );
        })}
        {HYBRIDS.map((h) => {
          const has = world.lexicon.includes(h.key);
          return (
            <div key={h.key} className={has ? 'card lex-card' : 'card lex-card locked'}>
              <span className="card-emoji">{has ? '🧬' : '❔'}</span>
              <b>{has ? h.name : 'Titkos keverék'}</b>
              <small>{has ? `💡 ${h.fact}` : `${SPECIES[h.father].name} apa + ${SPECIES[h.mother].name.toLowerCase()} anya = ?`}</small>
            </div>
          );
        })}
      </div>
    </Shell>
  );
}

function Parent() {
  const close = useClose();
  const world = useGame((s) => s.world)!;
  const act = useGame((s) => s.act);
  const [q] = useState(() => ({ a: 6 + Math.floor(Math.random() * 4), b: 6 + Math.floor(Math.random() * 4) }));
  const [answer, setAnswer] = useState('');
  const [reset, setReset] = useState(0);
  const file = useRef<HTMLInputElement>(null);
  const ok = Number(answer) === q.a * q.b;
  const exportSave = () => {
    const blob = new Blob([serialize(world)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nagymacskacitiy-mentes-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const importSave = async (f: File) => {
    const w = deserialize(await f.text());
    const g = useGame.getState();
    if (!w) return g.showToast('Ez nem NagyMacskaCitiy mentés. 🙈');
    g.setWorld(w);
    await saveWorld(w);
    g.setScreen({ kind: 'city', street: 'belvaros' });
    g.showToast('Mentés betöltve! ✅');
    close();
  };
  return (
    <Shell title="⚙️ Szülőknek" onClose={close}>
      {!ok ? (
        <div className="gate">
          <p>Mennyi {q.a} × {q.b}?</p>
          <input inputMode="numeric" value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="?" />
        </div>
      ) : (
        <div className="parent-grid">
          <button className="card wide" onClick={() => act((w) => { w.sound = !w.sound; })}>
            <span className="card-emoji">{world.sound ? '🔊' : '🔇'}</span>Hang: {world.sound ? 'be' : 'ki'}
          </button>
          <button className="card wide" onClick={exportSave}><span className="card-emoji">💾</span>Mentés letöltése</button>
          <button className="card wide" onClick={() => file.current?.click()}><span className="card-emoji">📂</span>Mentés betöltése</button>
          <input ref={file} type="file" accept="application/json,.json" hidden onChange={(e) => e.target.files?.[0] && void importSave(e.target.files[0])} />
          <button
            className="card wide danger"
            onClick={() => {
              if (reset < 1) return setReset(1);
              const g = useGame.getState();
              g.setWorld(createInitialWorld());
              g.setScreen({ kind: 'city', street: 'belvaros' });
              g.select(null);
              close();
            }}
          >
            <span className="card-emoji">🔄</span>{reset ? 'Biztos? Minden elvész! Koppints újra.' : 'Új játék'}
          </button>
          <p className="hint-text">A játék a tableten ment, nincs fiók, nincs reklám, nem küld adatot.</p>
        </div>
      )}
    </Shell>
  );
}

function EventModal() {
  const world = useGame((s) => s.world)!;
  const close = useClose();
  return <Shell title="🚨 Segítség kell!" onClose={close}><p className="big-text">{eventText(world) ?? 'Már minden rendben! 😊'}</p></Shell>;
}

function Giraffes() {
  const act = useGame((s) => s.act);
  const close = useClose();
  return (
    <Shell title="🦒 Hány zsiráf van a szavannán?" onClose={close}>
      <p className="hint-text">Számold meg a zsiráfokat az utcán, aztán koppints a jó számra!</p>
      <div className="number-grid">
        {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
          <button key={n} className="card" onClick={() => { const r = act((w) => answerGiraffes(w, n)); if (r?.ok) close(); }}>
            <span className="card-emoji">{n}</span>
          </button>
        ))}
      </div>
    </Shell>
  );
}

function Lesson() {
  const act = useGame((s) => s.act);
  const close = useClose();
  const [q, setQ] = useState<Question>(() => makeQuestion(Math.random));
  const [result, setResult] = useState<string | null>(null);
  return (
    <Shell title="📚 Macska-óra" onClose={close}>
      <p className="big-text">{q.text}</p>
      <div className="answer-grid">
        {q.options.map((o) => (
          <button key={o} className={result && o === q.answer ? 'card on' : 'card'} disabled={!!result} onClick={() => {
            const r = act((w) => answerLesson(w, q, o));
            setResult(r?.ok ? 'ok' : 'bad');
          }}>
            <span>{o}</span>
          </button>
        ))}
      </div>
      {result && <button className="big-btn" onClick={() => { setQ(makeQuestion(Math.random)); setResult(null); }}>Következő kérdés ▶</button>}
    </Shell>
  );
}

function Recipes() {
  const world = useGame((s) => s.world)!;
  const act = useGame((s) => s.act);
  const close = useClose();
  const [pick, setPick] = useState<FoodId[]>([]);
  const toggle = (id: FoodId) => setPick((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length < 2 ? [...p, id] : [p[1], id]));
  const have = FOOD_IDS.filter((id) => (world.pantry[id] ?? 0) > 0);
  return (
    <Shell title="🧑‍🍳 Főzőcske" onClose={close}>
      <p className="hint-text">Válassz két hozzávalót a hűtőből, és nézd meg, mi lesz belőle!</p>
      <div className="opt-grid">
        {have.length === 0 && <p>Üres a hűtő! Vegyél hozzávalókat a boltban. 🛒</p>}
        {have.map((id) => (
          <button key={id} className={pick.includes(id) ? 'card on' : 'card'} onClick={() => toggle(id)}>
            <span className="card-emoji">{FOODS[id].emoji}</span>{FOODS[id].name}<small>{world.pantry[id]} db</small>
          </button>
        ))}
      </div>
      <button className="big-btn" disabled={pick.length !== 2} onClick={() => { act((w) => cook(w, pick[0], pick[1])); setPick([]); }}>
        🍳 Főzés: {pick.map((p) => FOODS[p as keyof typeof FOODS].emoji).join(' + ') || '…'}
      </button>
      <h3>📖 Receptkönyv ({world.recipes.length}/{RECIPE_IDS.length})</h3>
      <div className="opt-grid">
        {RECIPE_IDS.map((id) => {
          const known = world.recipes.includes(id);
          const r = RECIPES[id];
          return (
            <div key={id} className={known ? 'card' : 'card locked'}>
              <span className="card-emoji">{known ? r.dish.emoji : '❔'}</span>
              <span>{known ? r.dish.name : '???'}</span>
              <small>{known ? `${edible(r.a).emoji} + ${edible(r.b).emoji}` : 'Fedezd fel!'}</small>
            </div>
          );
        })}
      </div>
    </Shell>
  );
}

function Wardrobe({ catId }: { catId: string }) {
  const world = useGame((s) => s.world)!;
  const act = useGame((s) => s.act);
  const close = useClose();
  const [slot, setSlot] = useState<ClothingSlot>('fej');
  const cat = world.cats.find((c) => c.id === catId);
  if (!cat) return null;
  const worn = cat.outfit[slot];
  const owned = world.ownedClothes.filter((id) => CLOTHES[id].slot === slot);
  return (
    <div className="modal-bg" onClick={close}>
      <div className="wardrobe" onClick={(e) => e.stopPropagation()}>
        <div className="wardrobe-stage">
          <svg viewBox="-150 -300 300 330" aria-hidden="true">
            <ellipse cx={0} cy={6} rx={120} ry={22} fill="#fff" />
            <g transform="scale(1.4)">
              <CatFigure {...catLook(cat)} activity="all" facing={1} />
            </g>
          </svg>
          <div className="ribbon">👗 {cat.name} öltözője</div>
          <button className="round-btn big ok stage-ok" aria-label="Kész" onClick={close}>✔</button>
        </div>
        <div className="creator-panel">
          <div className="tab-rail">
            {SLOTS.map((s) => (
              <button key={s} className={s === slot ? 'tab on' : 'tab'} aria-label={SLOT_LABEL[s]} onClick={() => setSlot(s)}>{SLOT_LABEL[s].split(' ')[0]}</button>
            ))}
          </div>
          <div className="opt-area">
            <h3>{SLOT_LABEL[slot]}</h3>
            <div className="opt-grid">
              <button className={!worn ? 'card on' : 'card'} onClick={() => act((w) => takeOff(w, cat.id, slot))}><span className="card-emoji">🚫</span>Semmi</button>
              {owned.map((id) => (
                <button key={id} className={worn?.id === id ? 'card on' : 'card'} onClick={() => act((w) => wear(w, cat.id, id, worn?.color ?? CLOTHES[id].color))}>
                  <span className="card-emoji">{CLOTHES[id].emoji}</span>{CLOTHES[id].name}
                </button>
              ))}
            </div>
            {owned.length === 0 && <p className="hint-text">Ilyen ruhád még nincs. Vegyél a 👗 Ruhaboltban!</p>}
            {worn && (
              <>
                <h3>Színe</h3>
                <div className="swatches">
                  {PALETTE.map((c) => <button key={c} aria-label={`Szín ${c}`} className={worn.color === c ? 'swatch on' : 'swatch'} style={{ background: c }} onClick={() => act((w) => wear(w, cat.id, worn.id, c))} />)}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function JobPicker({ catId }: { catId: string }) {
  const world = useGame((s) => s.world)!;
  const act = useGame((s) => s.act);
  const close = useClose();
  const cat = world.cats.find((c) => c.id === catId);
  if (!cat) return null;
  const pick = (job: Cat['job']) => { act((w) => setJob(w, catId, job)); close(); };
  return (
    <Shell title={`💼 ${cat.name} szakmája`} onClose={close}>
      <div className="opt-grid">
        <button className={cat.job === null ? 'card on' : 'card'} onClick={() => pick(null)}><span className="card-emoji">🌈</span>Nincs</button>
        {JOB_IDS.map((j) => {
          const has = world.cats.some((c) => c.job === j && c.age === 'felnott');
          return (
            <button key={j} className={cat.job === j ? 'card on' : 'card'} onClick={() => pick(j)}>
              <span className="card-emoji">{JOB_LABEL[j].split(' ')[0]}</span>{JOB_LABEL[j].split(' ').slice(1).join(' ')}
              <small>{has ? '✓ van már' : '⚠️ nincs még'}</small>
            </button>
          );
        })}
      </div>
    </Shell>
  );
}

function PartnerPicker({ catId }: { catId: string }) {
  const world = useGame((s) => s.world)!;
  const act = useGame((s) => s.act);
  const close = useClose();
  const cat = world.cats.find((c) => c.id === catId);
  if (!cat) return null;
  const options = world.cats.filter((c) => c.id !== catId && c.age === 'felnott' && !c.partnerId);
  return (
    <Shell title={`💞 Kivel legyen pár ${cat.name}?`} onClose={close}>
      <p className="hint-text">Összeköltöznek. Ha sokat vannak együtt (egy helyen, ébren), pár lesznek.</p>
      <div className="cat-grid">
        {options.length === 0 && <p>Nincs egyedülálló felnőtt macska. Építs egyet a Macskaműhelyben! 🛠️</p>}
        {options.map((c) => (
          <button key={c.id} className="card" onClick={() => { act((w) => pairUp(w, catId, c.id)); close(); }}>
            <CatFace cat={c} /><span>{c.name}</span><small>{c.sex === 'lany' ? '👧' : '👦'} {SPECIES[c.species].name}</small>
          </button>
        ))}
      </div>
    </Shell>
  );
}

function Guess({ catId }: { catId: string }) {
  const world = useGame((s) => s.world)!;
  const act = useGame((s) => s.act);
  const close = useClose();
  const cat = world.cats.find((c) => c.id === catId);
  if (!cat?.pregnancy) return null;
  const father = world.cats.find((c) => c.id === cat.pregnancy!.fatherId);
  return (
    <Shell title="❓ Milyen lesz a baba?" onClose={close}>
      <p className="big-text">{cat.name} ({SPECIES[cat.species].name}) + {father?.name} ({father ? SPECIES[father.species].name : '?'})</p>
      <p className="hint-text">Ha eltalálod, +1 ⭐ jár! Tipp: ha a szülők különböző fajúak, keverék baba lesz.</p>
      <div className="answer-grid">
        {cat.pregnancy.options.map((o) => (
          <button key={o} className="card" onClick={() => { act((w) => guessBaby(w, catId, o)); close(); }}><span>{o}</span></button>
        ))}
      </div>
    </Shell>
  );
}

function HomePicker({ catId }: { catId: string }) {
  const world = useGame((s) => s.world)!;
  const act = useGame((s) => s.act);
  const close = useClose();
  const cat = world.cats.find((c) => c.id === catId);
  if (!cat) return null;
  return (
    <Shell title={`🏠 Hol lakjon ${cat.name}?`} onClose={close}>
      <div className="opt-grid">
        {HOME_IDS.map((h) => {
          const open = world.stars >= BUILDINGS[h].unlock;
          return (
            <button key={h} className={cat.homeId === h ? 'card on' : 'card'} disabled={!open} onClick={() => { act((w) => setHome(w, catId, h)); close(); }}>
              <span className="card-emoji">{open ? BUILDINGS[h].emoji : '🔒'}</span>{BUILDINGS[h].name}
              <small>{STREETS[BUILDINGS[h].street].name}</small>
            </button>
          );
        })}
      </div>
    </Shell>
  );
}

export function Naming() {
  const world = useGame((s) => s.world)!;
  const act = useGame((s) => s.act);
  const id = world.namingQueue[0];
  const cat = world.cats.find((c) => c.id === id);
  const [name, setName] = useState('');
  useEffect(() => setName(cat ? randomName(cat.sex) : ''), [cat]);
  if (!cat) return null;
  return (
    <div className="modal-bg">
      <div className="modal naming">
        <div className="ribbon modal-title">👶 Megszületett!</div>
        <div className="naming-body">
          <svg viewBox="-110 -170 220 180"><CatFigure {...catLook(cat)} activity="all" facing={1} /></svg>
          <p className="big-text">Mi legyen a neve?</p>
          <div className="name-plate static">
            <input placeholder="Név" value={name} maxLength={16} onChange={(e) => setName(e.target.value)} />
            <button aria-label="Véletlen név" onClick={() => setName(randomName(cat.sex))}>🎲</button>
          </div>
          <button className="big-btn" onClick={() => act((w) => nameBaby(w, cat.id, name))}>✅ Kész!</button>
        </div>
      </div>
    </div>
  );
}

export function TripOverlay() {
  const trip = useGame((s) => s.trip);
  const endTrip = useGame((s) => s.endTrip);
  useEffect(() => {
    if (!trip) return;
    const t = setTimeout(() => {
      const g = useGame.getState();
      g.setScreen({ kind: 'city', street: trip.to });
      endTrip();
    }, 2600);
    return () => clearTimeout(t);
  }, [trip, endTrip]);
  if (!trip) return null;
  const m = MODE_LABEL[trip.mode];
  return (
    <div className={`trip-overlay ${STREETS[trip.to].scenery}`}>
      <div className="trip-vehicle">{m.emoji}</div>
      <div className="trip-text">{m.name}: irány {STREETS[trip.to].emoji} {STREETS[trip.to].name}!</div>
      <div className="trip-names">{trip.names.join(', ')} 🧳</div>
    </div>
  );
}

export function Modals() {
  const modal = useGame((s) => s.modal);
  if (!modal) return null;
  switch (modal.kind) {
    case 'catlist': return <CatList />;
    case 'quests': return <Quests />;
    case 'map': return <MapModal />;
    case 'lexicon': return <Lexicon />;
    case 'szulo': return <Parent />;
    case 'event': return <EventModal />;
    case 'zsiraf': return <Giraffes />;
    case 'lecke': return <Lesson />;
    case 'recept': return <Recipes />;
    case 'wardrobe': return <Wardrobe catId={modal.catId} />;
    case 'job': return <JobPicker catId={modal.catId} />;
    case 'partner': return <PartnerPicker catId={modal.catId} />;
    case 'tipp': return <Guess catId={modal.catId} />;
    case 'home': return <HomePicker catId={modal.catId} />;
  }
}
