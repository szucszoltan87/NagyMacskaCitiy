import type { Looks, SpeciesId } from '../sim/types';

export interface SpeciesDef {
  id: SpeciesId;
  name: string;
  habitat: string;
  fact: string;
  looks: Omit<Looks, 'mane'>;
}

const def = (
  id: SpeciesId, name: string, habitat: string, fact: string,
  fur: string, belly: string, pattern: Looks['pattern'], patternColor: string, eyes: string, ears: Looks['ears'],
): SpeciesDef => ({ id, name, habitat, fact, looks: { fur, belly, pattern, patternColor, eyes, ears } });

export const SPECIES: Record<SpeciesId, SpeciesDef> = {
  oroszlan: def('oroszlan', 'Oroszlán', 'Szavanna', 'Az oroszlánok nagy családban, falkában élnek.', '#E8B04B', '#F7DFA6', 'nincs', '#A8642A', '#C8862A', 'kerek'),
  tigris: def('tigris', 'Tigris', 'Őserdő', 'Minden tigris csíkjai mások, mint az ujjlenyomat.', '#F08A24', '#FFF3E0', 'csikos', '#2B1B10', '#E2B33C', 'kerek'),
  jaguar: def('jaguar', 'Jaguár', 'Őserdő', 'A jaguár nagyon szeret úszni.', '#E9A93A', '#FFF1D6', 'rozettas', '#3A2410', '#D4A017', 'kerek'),
  leopard: def('leopard', 'Leopárd', 'Szavanna', 'A leopárd a vacsoráját felviszi a fára.', '#EDBB5A', '#FFF5DE', 'rozettas', '#3D2A12', '#B8D86B', 'kerek'),
  fekete_parduc: def('fekete_parduc', 'Fekete párduc', 'Őserdő', 'A fekete párducnak is vannak foltjai, csak nehéz meglátni őket!', '#2E2A33', '#4A4452', 'rozettas', '#1E1B22', '#F2D23C', 'kerek'),
  hoparduc: def('hoparduc', 'Hópárduc', 'Hós-hegy', 'A hópárduc a hosszú, bolyhos farkát sálnak használja.', '#D9D9D2', '#F7F7F2', 'rozettas', '#5E5E5E', '#8FB7C9', 'kerek'),
  gepard: def('gepard', 'Gepárd', 'Szavanna', 'A gepárd a leggyorsabb szárazföldi állat.', '#E8C064', '#FFF6DF', 'pottyos', '#2A1F14', '#C79A3A', 'kerek'),
  puma: def('puma', 'Puma', 'Amerikai hegyvidék', 'A puma nem tud üvölteni, de tud dorombolni!', '#C9955E', '#F3E2CC', 'nincs', '#8A5A30', '#9BBF6A', 'hegyes'),
  kodfoltos_parduc: def('kodfoltos_parduc', 'Ködfoltos párduc', 'Őserdő', 'A ködfoltos párducnak nagyon hosszú szemfogai vannak.', '#BFA27A', '#EDE0C8', 'felhos', '#4A3A28', '#C9A646', 'kerek'),
  hiuz: def('hiuz', 'Hiúz', 'Hós-hegy', 'A hiúz fülén pamacs van, és nagyon jól hall.', '#C7A27C', '#F2E6D6', 'pottyos', '#6B5440', '#C9B458', 'pamacsos'),
  szerval: def('szerval', 'Szervál', 'Szavanna', 'A szerválnak hatalmas füle van, azzal hallja meg az egereket a fűben.', '#E7B85C', '#FFF4DA', 'pottyos', '#2B2015', '#D9B23A', 'nagy'),
  karakal: def('karakal', 'Karakál', 'Szavanna', 'A karakál olyan magasra ugrik, hogy a repülő madarat is elkapja.', '#C98B52', '#F4E1C8', 'nincs', '#5A3A20', '#C7A24A', 'pamacsos'),
  ocelot: def('ocelot', 'Ocelot', 'Őserdő', 'Az ocelot éjjel vadászik, nappal a fán alszik.', '#D9A85F', '#FFF2D9', 'rozettas', '#3B2814', '#B79A46', 'kerek'),
};

export const SPECIES_IDS = Object.keys(SPECIES) as SpeciesId[];
