import { useGame } from '../store/store';

export function Toast() {
  const toast = useGame((s) => s.toasts[0]);
  const next = useGame((s) => s.nextToast);
  if (!toast) return null;
  return <div key={toast.id} className="toast" role="status" onAnimationEnd={next}>{toast.text}</div>;
}
