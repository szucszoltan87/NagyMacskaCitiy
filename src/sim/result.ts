import type { ActionResult } from './types';

export const ok = (message = ''): ActionResult => ({ ok: true, message });
export const fail = (message: string): ActionResult => ({ ok: false, message });
