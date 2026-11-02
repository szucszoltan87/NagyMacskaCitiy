import type { Cat, Looks, Sex } from '../sim/types';
import { catLook } from './catProps';
import { CatFigure } from './CatFigure';

/** A macska feje egy kis ikonhoz (lista, panel). */
export function CatFace({ cat, looks, sick = false, sleeping = false, sex = 'lany', className }: {
  cat?: Cat;
  looks?: Looks;
  sick?: boolean;
  sleeping?: boolean;
  sex?: Sex;
  className?: string;
}) {
  const props = cat ? { ...catLook(cat), age: 'felnott' as const } : { looks: looks!, age: 'felnott' as const, sick, sex };
  const asleep = cat ? cat.activity === 'alszik' : sleeping;
  return (
    <svg className={className} viewBox="-70 -192 140 124" aria-hidden="true">
      <CatFigure {...props} activity={asleep ? 'alszik' : 'all'} facing={1} />
    </svg>
  );
}
