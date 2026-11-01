import type { Looks } from '../sim/types';
import { CatFigure } from './CatFigure';

export function CatFace({ looks, sick = false, sleeping = false, className }: { looks: Looks; sick?: boolean; sleeping?: boolean; className?: string }) {
  return (
    <svg className={className} viewBox="-52 -182 104 104" aria-hidden="true">
      <CatFigure looks={looks} age="felnott" activity={sleeping ? 'alszik' : 'all'} sick={sick} facing={1} />
    </svg>
  );
}
