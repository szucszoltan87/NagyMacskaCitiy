import { useEffect } from 'react';
import { saveWorld } from './save';
import { useGame } from './store';

const TICK_MS = 250;

/** 250 ms-onként lépteti a világot. Ha a lap háttérben volt, max 1 mp-et lép (az idő csak játék közben telik). */
export function useGameLoop(): void {
  useEffect(() => {
    let last = performance.now();
    const timer = setInterval(() => {
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 1);
      last = now;
      useGame.getState().step(dt);
    }, TICK_MS);
    return () => clearInterval(timer);
  }, []);
}

export function useAutosave(): void {
  useEffect(() => {
    const save = () => {
      const w = useGame.getState().world;
      if (w) void saveWorld(w);
    };
    const timer = setInterval(save, 3000);
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') save();
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', save);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', save);
    };
  }, []);
}
