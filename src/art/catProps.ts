import type { Cat } from '../sim/types';

/** A CatFigure rajzhoz szükséges adatok egy macskából. */
export function catLook(cat: Cat) {
  return {
    looks: cat.looks,
    age: cat.age,
    sick: cat.sick,
    sex: cat.sex,
    outfit: cat.outfit,
    hair: cat.hair,
    hairColor: cat.hairColor,
    nails: cat.nails,
    pregnant: !!cat.pregnancy,
  };
}
