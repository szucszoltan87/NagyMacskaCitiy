import { FOOD_IDS, FOODS, KIND_ICON, MEAL_IDS, MEALS } from '../data/foods';
import { buyFood, drinkWater, feedFromPantry, healCat, orderMeal } from '../sim/actions';
import { HEAL_COST } from '../sim/balance';
import type { FoodId, MealId } from '../sim/types';
import { useGame } from '../store/store';
import { ItemTray, type TrayItem } from './ItemTray';

export function HomeTray() {
  const world = useGame((s) => s.world)!;
  const act = useGame((s) => s.act);
  const foods: TrayItem[] = FOOD_IDS.filter((id) => (world.pantry[id] ?? 0) > 0).map((id) => ({
    key: id,
    emoji: FOODS[id].emoji,
    label: FOODS[id].name,
    sub: `${world.pantry[id]} db · ${KIND_ICON[FOODS[id].kind]}`,
  }));
  const items: TrayItem[] = [{ key: 'viz', emoji: '💧', label: 'Víz', sub: 'ingyen' }, ...foods];
  return (
    <ItemTray
      title={foods.length ? '🧊 Hűtő – húzd az ételt egy macskára!' : '🧊 Üres a hűtő – vegyél ételt a boltban! 🛒'}
      items={items}
      onUse={(key, catId) => act((w) => (key === 'viz' ? drinkWater(w, catId) : feedFromPantry(w, catId, key as FoodId)))}
    />
  );
}

export function RestaurantTray() {
  const act = useGame((s) => s.act);
  const items: TrayItem[] = MEAL_IDS.map((id) => ({
    key: id,
    emoji: MEALS[id].emoji,
    label: MEALS[id].name,
    sub: `${MEALS[id].price} 🐾 · ${KIND_ICON[MEALS[id].kind]}`,
  }));
  return (
    <ItemTray
      title="🍽️ Menü – húzd az ételt arra, aki enni szeretne!"
      items={items}
      onUse={(key, catId) => act((w) => orderMeal(w, catId, key as MealId))}
    />
  );
}

export function ShopTray() {
  const world = useGame((s) => s.world)!;
  const act = useGame((s) => s.act);
  return (
    <div className="tray">
      <div className="tray-title ribbon lilac">🛒 Bolt – koppints, amit megveszel! (A hűtőbe kerül.)</div>
      <div className="tray-items">
        {FOOD_IDS.map((id) => (
          <button key={id} className="card" onClick={() => act((w) => buyFood(w, id))}>
            <span className="card-emoji">{FOODS[id].emoji}</span>
            <span>{FOODS[id].name}</span>
            <small>{FOODS[id].price} 🐾 · {KIND_ICON[FOODS[id].kind]}</small>
            <small>Hűtőben: {world.pantry[id] ?? 0}</small>
          </button>
        ))}
      </div>
    </div>
  );
}

export function HospitalTray() {
  const world = useGame((s) => s.world)!;
  const act = useGame((s) => s.act);
  const doctor = world.cats.find((c) => c.job === 'orvos' && c.age === 'felnott');
  const sickHere = world.cats.filter((c) => c.place === 'korhaz' && c.sick);
  return (
    <div className="tray">
      <div className="tray-title ribbon lilac">
        🏥 Kórház – {doctor ? `az orvos: ${doctor.name} 🩺` : 'nincs orvos! Építs egyet a Macskaműhelyben.'}
      </div>
      <div className="tray-items">
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
      </div>
    </div>
  );
}
