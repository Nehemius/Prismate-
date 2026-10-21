export type Template3D = 'COVERFLOW' | 'RING' | 'HELIX' | 'SPHERE' | 'GRID' | 'STACK';

export type VSEPRClassGeometry =
  | 'AUTO'
  | 'TRIGONAL_PLANAR'
  | 'TETRAHEDRAL'
  | 'TRIGONAL_BIPYRAMIDAL'
  | 'OCTAHEDRAL'
  | 'PENTAGONAL_BIPYRAMIDAL';

export type CardType = 'CONCEPT' | 'FORMULA' | 'SIMULATION' | 'PROOF' | 'PROBLEM';

export type WidgetKind =
  | 'COULOMB_FORCE'
  | 'FIELD_SUPERPOSITION'
  | 'GAUSS_FLUX'
  | 'PENDULUM_PHASE'
  | 'WAVE_INTERFERENCE'
  | 'ORBITAL_RESONANCE'
  | 'ARRHENIUS_KINETICS'
  | 'CRYSTAL_LATTICE';

export type ConnectionIntensityLevel = 1 | 2 | 3;

export interface StackCard {
  id: string;
  classId: string;
  title: string;
  subtitle: string;
  cardType: CardType;
  formulaLatex?: string;
  summary: string;
  detailedNotes: string;
  keyTakeaways: string[];
  tags: string[];
  masteryLevel: 1 | 2 | 3;
  widgetKind?: WidgetKind;
  accentColor: string;
  pinned?: boolean;
}

export interface StackClass3D {
  id: string;
  name: string;
  subject: string;
  template: Template3D;
  accentColor: string;
  description: string;
  cards: StackCard[];
}

export interface CardConnection {
  id: string;
  fromCardId: string;
  toCardId: string;
  fromClassId: string;
  toClassId: string;
  label: string;
  /** Discrete intensity level: 1 (LVL 1), 2 (LVL 2), or 3 (LVL 3) */
  strength: ConnectionIntensityLevel;
}

export interface ComputedCardTransform {
  x: number;
  y: number;
  z: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  scale: number;
  opacity: number;
}
