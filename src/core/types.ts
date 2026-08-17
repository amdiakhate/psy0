import type React from 'react';

export type ExerciseId =
  | 'word-skip'
  | 'odd-even'
  | 'n-back'
  | 'shapes-colors'
  | 'airways'
  | 'psychomotor'
  | 'stacking'
  | 'objects-3d'
  | 'marbles'
  | 'sliding-shapes'
  | 'cubes'
  | 'calc-grid'
  | 'logic-series'
  | 'word-boxes'
  | 'star-words'
  | 'english';

export type Family =
  | 'Attention'
  | 'Spatiale'
  | 'Numérique'
  | 'Verbale'
  | 'Psychomoteur'
  | 'Intellectuelle'
  | 'Anglais'
  | 'Mémorisation';

export const FAMILIES: Family[] = [
  'Attention',
  'Spatiale',
  'Numérique',
  'Verbale',
  'Psychomoteur',
  'Intellectuelle',
  'Anglais',
  'Mémorisation',
];

export type SessionMode =
  | 'free'
  | 'guided30'
  | 'guided60'
  | 'guided90'
  | 'guided120'
  | 'simulation'
  | 'sprint';

export interface Item<Q = unknown> {
  question: Q;
  seed: number;
  level: number;
  /** Sous-types pour la taxonomie d'erreurs : 'mirror-trap', 'sub-carry', 'lure', ... */
  tags: string[];
}

/**
 * Exemple illustré : un VRAI item (seed + niveau + sous-type forcé), rendu par
 * le composant de l'exercice sur la page d'astuces, avec le raisonnement pas à pas.
 */
export interface TipExample {
  title: string;
  seed: number;
  level: number;
  forceTag?: string;
  walkthrough: string[];
}

/**
 * Mode apprentissage : une leçon = une suite d'arrêts sur image commentés.
 * Chaque étape rend une scène figée (SVG/3D propre à l'exercice) et explique
 * ce qu'il faut voir, quoi faire, et pourquoi.
 */
export interface LessonStep {
  title: string;
  /** Ce qu'on regarde / ce qui se passe. */
  observe: string;
  /** L'action à faire (facultatif : certaines étapes sont purement explicatives). */
  action?: string;
  /** Le pourquoi — le raisonnement à automatiser. */
  why: string;
  /** Piège associé, affiché en rouge. */
  pitfall?: string;
  /** Identifiant de scène interprété par le composant de leçon de l'exercice. */
  scene: string;
}

export interface Lesson {
  title: string;
  intro: string;
  steps: LessonStep[];
  /** Rendu de la scène figée pour une étape donnée. */
  Scene: React.FC<{ scene: string; stepIndex: number }>;
}

export interface Tips {
  /** La méthode optimale, étape par étape. */
  method: string[];
  /** Les 3 pièges classiques. */
  traps: string[];
  /** Stratégie de gestion du temps. */
  timing: string[];
  /** Exemples illustrés (exercices per-item uniquement). */
  examples?: TipExample[];
}

/** Event émis par un exercice `continuous` (psychomoteur) pour chaque fenêtre/tâche. */
export interface ContinuousEvent {
  tags: string[];
  correct: boolean;
  rtMs: number;
  given: string;
  expected: string;
}

export interface ExerciseComponentProps<Q = unknown, A = unknown> {
  item: Item<Q>;
  onAnswer: (answer: A) => void;
  /** Exercices `continuous` uniquement. */
  durationSec?: number;
  onContinuousEvent?: (e: ContinuousEvent) => void;
  onFinished?: () => void;
}

export interface ExerciseModule<Q = unknown, A = unknown> {
  id: ExerciseId;
  name: string;
  description: string;
  families: Family[];
  levels: number;
  /** Durée moyenne estimée d'un item, pour composer les sessions. */
  defaultItemSeconds: number;
  timed: 'per-item' | 'continuous';
  /** Pur et déterministe : même (seed, level) → même item. forceTag oriente le sous-type. */
  generate(seed: number, level: number, forceTag?: string): Item<Q>;
  validate(item: Item<Q>, answer: A): boolean;
  answerToString(answer: A): string;
  expectedToString(item: Item<Q>): string;
  tips: Tips;
  Component: React.FC<ExerciseComponentProps<Q, A>>;
  /** Illustration dédiée pour la page d'astuces (exercices en flux, démos 3D…). */
  TipsIllustration?: React.FC;
  /** Mode apprentissage : leçon pas-à-pas avec arrêts sur image. */
  lesson?: Lesson;
}

/** Un event par item répondu — la source unique du moteur d'analyse. */
export interface ItemEvent {
  ts: number;
  sessionId: string;
  mode: SessionMode;
  exercise: ExerciseId;
  level: number;
  seed: number;
  tags: string[];
  rtMs: number;
  correct: boolean;
  given: string;
  expected: string;
  posInSession: number;
  minuteInSession: number;
}

/** Rôle d'un bloc dans une session du matin — sert au log de fin de séance. */
export type BlockRole = 'warmup' | 'priority' | 'rotation' | 'psychomotor';

export interface SessionBlock {
  exercise: ExerciseId;
  level: number | 'adaptive';
  durationSec?: number;
  itemCount?: number;
  /** Drill ciblé : ne générer que des items portant ce tag. */
  tagFilter?: string;
  label?: string;
  role?: BlockRole;
}

export interface SessionPlanMeta {
  /** Session du jour : matin (log obligatoire, avance les rotations) ou soir. */
  daily?: 'morning' | 'evening';
  /** Écran de log obligatoire en fin de session. */
  requiresLog?: boolean;
  /** Index du groupe de rotation utilisé (pour avancer le curseur à la complétion). */
  usedGroup?: number;
  /**
   * Index du bloc devant lequel proposer la coupure de mi-parcours (formats
   * longs). Le moteur affiche alors un écran « continuer / reprendre plus tard ».
   */
  halfwayIndex?: number;
  /** Ce plan est la seconde moitié d'une séance coupée, reprise depuis l'accueil. */
  resumed?: boolean;
}

export interface SessionPlan {
  mode: SessionMode;
  blocks: SessionBlock[];
  /** Briefing du coach : 3 lignes max (quoi, pourquoi, objectif chiffré). */
  briefing?: string[];
  meta?: SessionPlanMeta;
}

export interface BlockResult {
  exercise: ExerciseId;
  items: number;
  correct: number;
  avgRtMs: number;
  endLevel: number;
}

export interface SessionRecord {
  sessionId: string;
  mode: SessionMode;
  startedAt: number;
  endedAt: number;
  blocks: BlockResult[];
}
