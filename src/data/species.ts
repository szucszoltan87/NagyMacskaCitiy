import type { DestinationId, Looks, SpeciesId } from '../sim/types';

export interface SpeciesDef {
  id: SpeciesId;
  name: string;
  habitat: string;
  /** Melyik úti célon él a természetben. */
  home: DestinationId | null;
  fact: string;
  facts: string[];
  looks: Omit<Looks, 'mane'>;
}

const def = (
  id: SpeciesId, name: string, habitat: string, home: DestinationId | null, facts: string[],
  fur: string, belly: string, pattern: Looks['pattern'], patternColor: string, eyes: string, ears: Looks['ears'],
): SpeciesDef => ({ id, name, habitat, home, fact: facts[0], facts, looks: { fur, belly, pattern, patternColor, eyes, ears } });

export const SPECIES: Record<SpeciesId, SpeciesDef> = {
  oroszlan: def('oroszlan', 'Oroszlán', 'Szavanna', 'szavanna', [
    'Az oroszlánok nagy családban, falkában élnek.',
    'Az oroszlán ordítása 8 kilométerre is elhallatszik.',
    'Csak a fiú oroszlánoknak nő sörényük.',
  ], '#E8B04B', '#F7DFA6', 'nincs', '#A8642A', '#C8862A', 'kerek'),
  tigris: def('tigris', 'Tigris', 'Őserdő', 'oserdo', [
    'Minden tigris csíkjai mások, mint az ujjlenyomat.',
    'A tigris a legnagyobb macskaféle.',
    'A tigris szeret fürdeni és jól úszik.',
  ], '#F08A24', '#FFF3E0', 'csikos', '#2B1B10', '#E2B33C', 'kerek'),
  jaguar: def('jaguar', 'Jaguár', 'Őserdő', 'oserdo', [
    'A jaguár nagyon szeret úszni.',
    'A jaguár rozettáinak közepén kis pöttyök vannak.',
    'A jaguárnak nagyon erős az állkapcsa.',
  ], '#E9A93A', '#FFF1D6', 'rozettas', '#3A2410', '#D4A017', 'kerek'),
  leopard: def('leopard', 'Leopárd', 'Szavanna', 'szavanna', [
    'A leopárd a vacsoráját felviszi a fára.',
    'A leopárd nagyon ügyesen mászik fára.',
    'A leopárd rozettáinak nincs pötty a közepén.',
  ], '#EDBB5A', '#FFF5DE', 'rozettas', '#3D2A12', '#B8D86B', 'kerek'),
  fekete_parduc: def('fekete_parduc', 'Fekete párduc', 'Őserdő', 'oserdo', [
    'A fekete párducnak is vannak foltjai, csak nehéz meglátni őket!',
    'A fekete párduc valójában fekete bundájú jaguár vagy leopárd.',
    'A sötét bunda segít elbújni az erdő árnyékában.',
  ], '#2E2A33', '#4A4452', 'rozettas', '#1E1B22', '#F2D23C', 'kerek'),
  hoparduc: def('hoparduc', 'Hópárduc', 'Hós-hegy', 'hoshegy', [
    'A hópárduc a hosszú, bolyhos farkát sálnak használja.',
    'A hópárduc sűrű bundája nagyon meleg.',
    'A hópárduc hatalmas mancsai hótalpként működnek.',
  ], '#D9D9D2', '#F7F7F2', 'rozettas', '#5E5E5E', '#8FB7C9', 'kerek'),
  gepard: def('gepard', 'Gepárd', 'Szavanna', 'szavanna', [
    'A gepárd a leggyorsabb szárazföldi állat.',
    'A gepárd nem üvölt, hanem csiripel, mint egy madár.',
    'A gepárd arcán fekete „könnycsík” van.',
  ], '#E8C064', '#FFF6DF', 'pottyos', '#2A1F14', '#C79A3A', 'kerek'),
  puma: def('puma', 'Puma', 'Amerikai hegyvidék', null, [
    'A puma nem tud üvölteni, de tud dorombolni!',
    'A puma nagyon messzire és magasra tud ugrani.',
    'A pumát hegyi oroszlánnak is hívják.',
  ], '#C9955E', '#F3E2CC', 'nincs', '#8A5A30', '#9BBF6A', 'hegyes'),
  kodfoltos_parduc: def('kodfoltos_parduc', 'Ködfoltos párduc', 'Őserdő', 'oserdo', [
    'A ködfoltos párducnak nagyon hosszú szemfogai vannak.',
    'A ködfoltos párduc fejjel lefelé is tud mászni a fán.',
    'A foltjai felhőkre hasonlítanak.',
  ], '#BFA27A', '#EDE0C8', 'felhos', '#4A3A28', '#C9A646', 'kerek'),
  hiuz: def('hiuz', 'Hiúz', 'Hós-hegy', 'hoshegy', [
    'A hiúz fülén pamacs van, és nagyon jól hall.',
    'A hiúz széles, szőrös talpa nem süllyed bele a hóba.',
    'A hiúznak rövid, csonka farka van.',
  ], '#C7A27C', '#F2E6D6', 'pottyos', '#6B5440', '#C9B458', 'pamacsos'),
  szerval: def('szerval', 'Szervál', 'Szavanna', 'szavanna', [
    'A szerválnak hatalmas füle van, azzal hallja meg az egereket a fűben.',
    'A szerválnak a testéhez képest nagyon hosszú a lába.',
    'A szervál magasra ugrik, hogy elkapja a madarakat.',
  ], '#E7B85C', '#FFF4DA', 'pottyos', '#2B2015', '#D9B23A', 'nagy'),
  karakal: def('karakal', 'Karakál', 'Szavanna', 'szavanna', [
    'A karakál olyan magasra ugrik, hogy a repülő madarat is elkapja.',
    'A karakál neve azt jelenti: fekete fül.',
    'A karakál sokáig kibírja víz nélkül.',
  ], '#C98B52', '#F4E1C8', 'nincs', '#5A3A20', '#C7A24A', 'pamacsos'),
  ocelot: def('ocelot', 'Ocelot', 'Őserdő', 'oserdo', [
    'Az ocelot éjjel vadászik, nappal a fán alszik.',
    'Az ocelot jól úszik és jól mászik.',
    'Az ocelot mintája olyan, mint egy lánc.',
  ], '#D9A85F', '#FFF2D9', 'rozettas', '#3B2814', '#B79A46', 'kerek'),
};

export const SPECIES_IDS = Object.keys(SPECIES) as SpeciesId[];

export interface HybridDef { key: string; name: string; father: SpeciesId; mother: SpeciesId; fact: string }

/** Valódi keverékek: az apa és az anya faja számít. */
export const HYBRIDS: HybridDef[] = [
  { key: 'ligris', name: 'Ligris', father: 'oroszlan', mother: 'tigris', fact: 'A ligris a világ legnagyobb macskája: nagyobb, mint a szülei!' },
  { key: 'tigroroszlan', name: 'Tigroroszlán', father: 'tigris', mother: 'oroszlan', fact: 'A tigroroszlán kisebb a szüleinél, és lehetnek csíkjai is.' },
  { key: 'jaglion', name: 'Jaglion', father: 'jaguar', mother: 'oroszlan', fact: 'A jaglion oroszlánszínű, de jaguárfoltjai vannak.' },
  { key: 'leopon', name: 'Leopon', father: 'leopard', mother: 'oroszlan', fact: 'A leopon feje oroszlánra, teste leopárdra hasonlít.' },
];

export function findHybrid(mother: SpeciesId, father: SpeciesId): HybridDef | null {
  return HYBRIDS.find((h) => h.mother === mother && h.father === father) ?? null;
}

/** Egy macska fajának neve (keveréknél a keverék neve). */
export function speciesName(species: SpeciesId, hybrid: SpeciesId | null): string {
  if (!hybrid || hybrid === species) return SPECIES[species].name;
  const h = findHybrid(species, hybrid);
  if (h) return h.name;
  return `${SPECIES[species].name}–${SPECIES[hybrid].name.toLowerCase()} keverék`;
}

/** Lexikon-kulcs: faj-azonosító vagy valódi keverék kulcsa. */
export function lexiconKey(species: SpeciesId, hybrid: SpeciesId | null): string | null {
  if (!hybrid || hybrid === species) return species;
  return findHybrid(species, hybrid)?.key ?? null;
}
