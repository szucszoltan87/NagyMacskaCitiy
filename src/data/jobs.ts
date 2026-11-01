import type { AgeStage, JobId } from '../sim/types';

export const JOB_LABEL: Record<JobId, string> = {
  orvos: '🩺 Orvos',
  szakacs: '👩‍🍳 Szakács',
  elado: '🛒 Eladó',
  tanar: '📚 Tanár',
  ovono: '🧸 Óvónő',
  tuzolto: '🚒 Tűzoltó',
  rendor: '🚓 Rendőr',
  fodrasz: '💇 Fodrász',
  buszsofor: '🚌 Buszsofőr',
  mozdonyvezeto: '🚂 Mozdonyvezető',
  pilota: '✈️ Pilóta',
};
export const JOB_IDS = Object.keys(JOB_LABEL) as JobId[];
export const AGE_LABEL: Record<AgeStage, string> = { baba: '🍼 Baba', gyerek: '🧒 Gyerek', felnott: '🧑 Felnőtt' };
