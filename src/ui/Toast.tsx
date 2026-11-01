import { useGame } from '../store/store';

export function Toast() {
  const toast = useGame((s) => s.toast);
  if (!toast) return null;
  return <div key={toast.id} className="toast" role="status">{toast.text}</div>;
}
