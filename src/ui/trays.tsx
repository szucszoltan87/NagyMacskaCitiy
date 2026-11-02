import { useState, type ReactNode } from 'react';
import { BUILDINGS, STREETS } from '../data/buildings';
import { CLOTHES, CLOTHING_IDS, HAIR_IDS, HAIR_LABEL, PALETTE, SALON_PRICE } from '../data/clothes';
import { edible, FOOD_IDS, FOODS, KIND_ICON, MEALS, MENUS, RECIPE_IDS } from '../data/foods';
import { FURNITURE, FURNITURE_IDS, PAINT_PRICE, SHOP_PAINTS, WALLPAPERS } from '../data/furniture';
import { JOB_LABEL } from '../data/jobs';
import { MODE_LABEL, nextDeparture, routesFrom } from '../data/transport';
import { buyFood, drinkWater, feedFromPantry, healCat, orderMeal } from '../sim/actions';
import { HEAL_COST } from '../sim/balance';
import { buyClothing, setHair, setNails } from '../sim/clothes';
import { hasWorker } from '../sim/economy';
import { eventText } from '../sim/events';
import { buyFurniture, buyPaint, paintHome, placeFurniture, placeHas } from '../sim/homes';
import { formatClock } from '../sim/time';
import type { BuildingId, FoodId, HairId, HomeId, MealId } from '../sim/types';
import { useGame } from '../store/store';
import { ItemTray, type TrayItem } from './ItemTray';

function Tray({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <div className="tray">
      <div className="tray-title ribbon lilac">{title}</div>
      <div className="tray-items">{children}</div>
    </div>
  );
}

export function HomeTray({ home, onEdit }: { home: BuildingId; onEdit?: () => void }) {
  const world = useGame((s) => s.world)!;
  const act = useGame((s) => s.act);
  const fridge = placeHas(world, home, 'huto');
  const sink = placeHas(world, home, 'mosdo');
  const foods: TrayItem[] = fridge
    ? [...FOOD_IDS, ...RECIPE_IDS].filter((id) => (world.pantry[id] ?? 0) > 0).map((id) => {
      const e = edible(id);
      return { key: id, emoji: e.emoji, label: e.name, sub: `${world.pantry[id]} db · ${KIND_ICON[e.kind]}` };
    })
    : [];
  const items: TrayItem[] = [...(sink ? [{ key: 'viz', emoji: '💧', label: 'Víz', sub: 'ingyen' }] : []), ...foods];
  const title = !fridge
    ? '🧊 Nincs hűtő! Vegyél a Bútorboltban.'
    : foods.length ? '🧊 Hűtő – húzd az ételt egy macskára!' : '🧊 Üres a hűtő – vegyél ételt a boltban! 🛒';
  return (
    <ItemTray
      title={title}
      items={items}
      extra={onEdit && <button className="card" onClick={onEdit}><span className="card-emoji">🖌️</span>Berendezés</button>}
      onUse={(key, catId) => act((w) => (key === 'viz' ? drinkWater(w, catId) : feedFromPantry(w, catId, key as FoodId)))}
    />
  );
}

export function MealTray({ building }: { building: BuildingId }) {
  const act = useGame((s) => s.act);
  const openModal = useGame((s) => s.openModal);
  const items: TrayItem[] = (MENUS[building] ?? []).map((id) => ({
    key: id,
    emoji: MEALS[id].emoji,
    label: MEALS[id].name,
    sub: `${MEALS[id].price} 🐾 · ${KIND_ICON[MEALS[id].kind]}`,
  }));
  return (
    <ItemTray
      title={`${BUILDINGS[building].emoji} Menü – húzd az ételt arra, aki enni szeretne!`}
      items={items}
      extra={building === 'etterem' && <button className="card" onClick={() => openModal({ kind: 'recept' })}><span className="card-emoji">🧑‍🍳</span>Főzőcske</button>}
      onUse={(key, catId) => act((w) => orderMeal(w, catId, key as MealId))}
    />
  );
}

export function ShopTray() {
  const world = useGame((s) => s.world)!;
  const act = useGame((s) => s.act);
  return (
    <Tray title="🛒 Bolt – koppints, amit megveszel! (A hűtőbe kerül.)">
      {FOOD_IDS.map((id) => (
        <button key={id} className="card" onClick={() => act((w) => buyFood(w, id))}>
          <span className="card-emoji">{FOODS[id].emoji}</span>
          <span>{FOODS[id].name}</span>
          <small>{FOODS[id].price} 🐾 · {KIND_ICON[FOODS[id].kind]}</small>
          <small>Hűtőben: {world.pantry[id] ?? 0}</small>
        </button>
      ))}
    </Tray>
  );
}

export function HospitalTray() {
  const world = useGame((s) => s.world)!;
  const act = useGame((s) => s.act);
  const doctor = world.cats.find((c) => c.job === 'orvos' && c.age === 'felnott');
  const sickHere = world.cats.filter((c) => c.place === 'korhaz' && c.sick);
  return (
    <Tray title={`🏥 Kórház – ${doctor ? `az orvos: ${doctor.name} 🩺` : 'nincs orvos! Építs egyet a Macskaműhelyben.'}`}>
      {sickHere.length === 0 ? (
        <div className="tray-empty">Itt most nincs beteg. 😊 A beteg macskát az utcán húzd rá a kórházra!</div>
      ) : (
        sickHere.map((c) => (
          <button key={c.id} className="card wide" onClick={() => act((w) => healCat(w, c.id))}>
            <span className="card-emoji">💊</span>
            <span>{c.name} gyógyítása</span>
            <small>{HEAL_COST} 🐾</small>
          </button>
        ))
      )}
    </Tray>
  );
}

export function ClothesShopTray({ building }: { building: BuildingId }) {
  const world = useGame((s) => s.world)!;
  const act = useGame((s) => s.act);
  const ids = CLOTHING_IDS.filter((id) => CLOTHES[id].shops.includes(building));
  return (
    <Tray title="👗 Koppints, amit megveszel! Öltöztetés: koppints egy macskára, majd 👗">
      {ids.map((id) => {
        const def = CLOTHES[id];
        const owned = world.ownedClothes.includes(id);
        return (
          <button key={id} className={owned ? 'card on' : 'card'} onClick={() => act((w) => buyClothing(w, id, building))}>
            <span className="card-emoji">{def.emoji}</span>
            <span>{def.name}</span>
            <small>{owned ? '✓ Megvan' : `${def.price} 🐾`}{def.protects ? ` · ${{ hideg: '❄️', meleg: '☀️', esos: '🌧️' }[def.protects]}` : ''}</small>
          </button>
        );
      })}
    </Tray>
  );
}

export function SalonTray() {
  const selected = useGame((s) => s.selectedCatId);
  const world = useGame((s) => s.world)!;
  const act = useGame((s) => s.act);
  const showToast = useGame((s) => s.showToast);
  const [color, setColor] = useState(PALETTE[1]);
  const cat = world.cats.find((c) => c.id === selected && c.place === 'fodrasz');
  const apply = (fn: (catId: string) => void) => (cat ? fn(cat.id) : showToast('Koppints egy macskára itt a fodrásznál! 💇'));
  return (
    <Tray title={`💇 Fodrász – ${cat ? cat.name : 'válassz egy macskát'} · ${SALON_PRICE} 🐾 · ${hasWorker(world, 'fodrasz') ? '✂️' : 'nincs fodrász!'}`}>
      <div className="swatches mini">
        {PALETTE.map((c) => <button key={c} aria-label={`Szín ${c}`} className={c === color ? 'swatch on' : 'swatch'} style={{ background: c }} onClick={() => setColor(c)} />)}
      </div>
      {HAIR_IDS.map((h: HairId) => (
        <button key={h} className={cat?.hair === h ? 'card on' : 'card'} onClick={() => apply((id) => act((w) => setHair(w, id, h, color)))}>
          <span className="card-emoji">{HAIR_LABEL[h].split(' ')[0]}</span>
          <span>{HAIR_LABEL[h].split(' ').slice(1).join(' ')}</span>
        </button>
      ))}
      <button className="card" onClick={() => apply((id) => act((w) => setNails(w, id, color)))}><span className="card-emoji">💅</span>Csillogó karom</button>
      <button className="card" onClick={() => apply((id) => act((w) => setNails(w, id, null)))}><span className="card-emoji">🧼</span>Karom tisztán</button>
    </Tray>
  );
}

export function FurnitureShopTray() {
  const world = useGame((s) => s.world)!;
  const act = useGame((s) => s.act);
  return (
    <Tray title="🛋️ Bútorbolt – a bútor a raktárba kerül; otthon 🖌️ Berendezés">
      {FURNITURE_IDS.map((id) => (
        <button key={id} className="card" onClick={() => act((w) => buyFurniture(w, id))}>
          <span className="card-emoji">{FURNITURE[id].emoji}</span>
          <span>{FURNITURE[id].name}</span>
          <small>{FURNITURE[id].price} 🐾</small>
        </button>
      ))}
      {SHOP_PAINTS.map((c) => {
        const owned = world.paints.includes(c);
        return (
          <button key={c} className={owned ? 'card on' : 'card'} onClick={() => act((w) => buyPaint(w, c))}>
            <span className="paint-dot" style={{ background: c }} />
            <span>Festék</span>
            <small>{owned ? '✓ Megvan' : `${PAINT_PRICE} 🐾`}</small>
          </button>
        );
      })}
    </Tray>
  );
}

export function EditTray({ home, onDone }: { home: HomeId; onDone: () => void }) {
  const world = useGame((s) => s.world)!;
  const act = useGame((s) => s.act);
  const decor = world.homes[home];
  const stock = [...new Set(world.furnitureStock)];
  return (
    <div className="tray edit-tray">
      <div className="tray-title ribbon">🖌️ Berendezés – koppints a bútorra, aztán húzd a helyére! (Ide visszahúzva raktárba kerül.)</div>
      <div className="tray-items">
        <button className="card on" onClick={onDone}><span className="card-emoji">✅</span>Kész</button>
        {stock.length === 0 && <div className="tray-empty">A raktár üres. 🛋️ Bútort a Bútorboltban vehetsz.</div>}
        {stock.map((id) => (
          <button key={id} className="card" onClick={() => act((w) => placeFurniture(w, home, id, 560))}>
            <span className="card-emoji">{FURNITURE[id].emoji}</span>
            <span>{FURNITURE[id].name}</span>
            <small>{world.furnitureStock.filter((x) => x === id).length} db</small>
          </button>
        ))}
        <div className="paint-group">
          <small>Fal</small>
          <div className="swatches mini">{world.paints.map((c) => <button key={c} aria-label={`Fal ${c}`} className={decor.wall === c ? 'swatch on' : 'swatch'} style={{ background: c }} onClick={() => act((w) => paintHome(w, home, { wall: c }))} />)}</div>
          <small>Padló</small>
          <div className="swatches mini">{world.paints.map((c) => <button key={c} aria-label={`Padló ${c}`} className={decor.floor === c ? 'swatch on' : 'swatch'} style={{ background: c }} onClick={() => act((w) => paintHome(w, home, { floor: c }))} />)}</div>
        </div>
        {WALLPAPERS.map(([wp, label]) => (
          <button key={wp} className={decor.wallpaper === wp ? 'card on' : 'card'} onClick={() => act((w) => paintHome(w, home, { wallpaper: wp }))}>
            <span className="card-emoji">{{ sima: '⬜', potty: '⚪', csik: '🟪', sziv: '💗' }[wp]}</span>{label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function InfoTray({ title, text, action }: { title: string; text: string; action?: { label: string; emoji: string; onClick: () => void } }) {
  return (
    <Tray title={title}>
      {action && <button className="card wide" onClick={action.onClick}><span className="card-emoji">{action.emoji}</span>{action.label}</button>}
      <div className="tray-empty">{text}</div>
    </Tray>
  );
}

export function WorkerInfo({ building }: { building: BuildingId }) {
  const world = useGame((s) => s.world)!;
  const job = BUILDINGS[building].job;
  if (!job) return null;
  const worker = world.cats.find((c) => c.job === job && c.age === 'felnott');
  return <>{worker ? `${JOB_LABEL[job]}: ${worker.name}` : `Nincs ${JOB_LABEL[job].split(' ').slice(1).join(' ').toLowerCase()}! Építs egyet a Macskaműhelyben.`}</>;
}

export function EventTray({ building }: { building: BuildingId }) {
  const world = useGame((s) => s.world)!;
  return <InfoTray title={`${BUILDINGS[building].emoji} ${BUILDINGS[building].name}`} text={eventText(world) ?? 'Most minden nyugodt. 😊 Ha baj van, itt megtudod!'} />;
}

export function TimetableTray({ building }: { building: BuildingId }) {
  const world = useGame((s) => s.world)!;
  const routes = routesFrom(building);
  return (
    <Tray title={`${BUILDINGS[building].emoji} Menetrend – az indulásig a váróban kell lenni!`}>
      {routes.map((r) => {
        const t = nextDeparture(r, world.minute);
        const left = Math.round(t - world.minute);
        const to = BUILDINGS[r.to].street;
        return (
          <div key={`${r.to}`} className="card wide">
            <span className="card-emoji">{MODE_LABEL[r.mode].emoji}</span>
            <span>{STREETS[to].emoji} {STREETS[to].name}</span>
            <small>Indul: {formatClock(t)} (még {Math.floor(left / 60)} ó {left % 60} p)</small>
            <small>Jegy: {r.price} 🐾 · {hasWorker(world, r.job) ? '✅' : `nincs ${JOB_LABEL[r.job].split(' ').slice(1).join(' ').toLowerCase()}!`}</small>
          </div>
        );
      })}
      <div className="tray-empty">
        {building === 'repter_pv' ? 'Húzd a macskát a megfelelő kapuhoz! 🧳 Gondold át, mit vegyen fel!' : 'Húzd ide a macskákat, és várják meg az indulást! 🧳'}
      </div>
    </Tray>
  );
}
