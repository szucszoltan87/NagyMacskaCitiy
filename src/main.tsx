import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { setupUpdates } from './pwa';
import { useGame } from './store/store';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

setupUpdates();
if (import.meta.env.DEV) (window as unknown as { __game: typeof useGame }).__game = useGame;
