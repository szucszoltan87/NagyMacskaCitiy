import { registerSW } from 'virtual:pwa-register';
import { saveWorld } from './store/save';
import { useGame } from './store/store';

const HOUR = 60 * 60 * 1000;

/** Ha új verzió érkezik, mentés után újratölt; óránként és előtérbe kerüléskor keres frissítést. */
export function setupUpdates(): void {
  registerSW({
    immediate: true,
    onNeedReload: () => {
      const reload = () => window.location.reload();
      const world = useGame.getState().world;
      if (world) saveWorld(world).then(reload, reload);
      else reload();
    },
    onRegisteredSW: (_url, reg) => {
      if (!reg) return;
      const check = () => {
        if (navigator.onLine) void reg.update();
      };
      setInterval(check, HOUR);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') check();
      });
    },
  });
}
