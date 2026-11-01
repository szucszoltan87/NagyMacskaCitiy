import type { ActionResult, SfxName } from './types';

export const ok = (message = '', sfx?: SfxName): ActionResult => (sfx ? { ok: true, message, sfx } : { ok: true, message });
export const fail = (message: string): ActionResult => ({ ok: false, message, sfx: 'baj' });
