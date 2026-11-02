import { useEffect } from 'react';
import { createInitialWorld } from './sim/world';
import { useAutosave, useGameLoop } from './store/hooks';
import { loadWorld } from './store/save';
import { useGame } from './store/store';
import { CatPanel } from './ui/CatPanel';
import { CityScreen } from './ui/CityScreen';
import { CreatorScreen } from './ui/CreatorScreen';
import { Hud } from './ui/Hud';
import { InsideScreen } from './ui/InsideScreen';
import { Modals, Naming, TripOverlay } from './ui/Modals';
import { Toast } from './ui/Toast';

export function App() {
  const world = useGame((s) => s.world);
  const screen = useGame((s) => s.screen);

  useEffect(() => {
    loadWorld()
      .then((w) => useGame.getState().setWorld(w ?? createInitialWorld()))
      .catch(() => useGame.getState().setWorld(createInitialWorld()));
  }, []);
  useGameLoop();
  useAutosave();

  if (!world) return <div className="loading">🐾 Betöltés…</div>;
  return (
    <div className="app" data-build={__BUILD__}>
      {screen.kind === 'city' && <CityScreen street={screen.street} />}
      {screen.kind === 'inside' && <InsideScreen key={screen.building} building={screen.building} />}
      {screen.kind === 'creator' && <CreatorScreen />}
      {screen.kind !== 'creator' && <Hud />}
      {screen.kind !== 'creator' && <CatPanel />}
      <Modals />
      <Naming />
      <TripOverlay />
      <Toast />
    </div>
  );
}
