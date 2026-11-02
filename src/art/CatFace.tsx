import type { Looks, Sex } from '../sim/types';
import { CatFigure } from './CatFigure';

/** A macska feje egy kis ikonhoz (lista, panel). */
export function CatFace({ looks, sick = false, sleeping = false, sex = 'lany', className }: {
  looks: Looks;
  sick?: boolean;
  sleeping?: boolean;
  sex?: Sex;
  className?: string;
}) {
  return (
    <svg className={className} viewBox="-66 -184 132 118" aria-hidden="true">
      <CatFigure looks={looks} age="felnott" activity={sleeping ? 'alszik' : 'all'} sick={sick} facing={1} sex={sex} />
    </svg>
  );
}
