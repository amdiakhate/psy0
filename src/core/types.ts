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

/**
 * Le volet « quand ça se passe mal » d'une leçon.
 *
 * Une leçon décrit la méthode quand tout va bien : on trouve, dans les temps,
 * sans se tromper. Ça n'arrive presque jamais — et c'est exactement là que les
 * points se perdent. Sans ce volet, un candidat qui dépasse le chrono ou qui
 * casse une série n'a AUCUNE consigne, et improvise au pire moment.
 *
 * Il est OBLIGATOIRE : le compilateur refuse une leçon qui n'en a pas, parce
 * qu'une leçon sans plan B est une leçon à moitié écrite.
 */
export interface LessonReality {
  /** Ce que ça donne vraiment les premières fois — pour qu'un mauvais score ne soit pas lu comme un verdict. */
  atFirst: string;
  /** Le budget honnête, et ce qu'il suppose DÉJÀ automatisé. */
  budget: string;
  /** La méthode dégradée : ce qu'on lâche en premier, dans l'ordre, quand le temps manque. */
  fallback: string[];
  /** Reprendre après une erreur, ou après avoir perdu le fil. */
  recover: string;
  /** Quand renoncer à la question — et pourquoi ça rapporte. */
  bail: string;
}

export interface Lesson {
  title: string;
  intro: string;
  steps: LessonStep[];
  /** Rendu de la scène figée pour une étape donnée. */
  Scene: React.FC<{ scene: string; stepIndex: number }>;
  /** Le plan B. Obligatoire — voir `LessonReality`. */
  reality: LessonReality;
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
  /**
   * Arrêt sur image : l'exercice est figé et doit MONTRER la solution sur
   * lui-même — la bonne case, le bon emplacement. Les composants qui ne savent
   * pas le faire ignorent simplement ce drapeau : le bandeau de correction
   * porte de toute façon la réponse attendue.
   */
  revealAnswer?: boolean;
  /** La réponse donnée, pour la matérialiser pendant l'arrêt sur image. */
  givenAnswer?: A;
  /** Exercices `continuous` uniquement. */
  durationSec?: number;
  onContinuousEvent?: (e: ContinuousEvent) => void;
  onFinished?: () => void;
}

/**
 * Correction visuelle d'un item raté : le schéma qui montre POURQUOI c'était
 * cette réponse-là. Reçoit l'item et ce qui a été répondu — l'erreur commise
 * fait partie de l'explication.
 */
export interface ExplainProps<Q = unknown, A = unknown> {
  item: Item<Q>;
  answer: A;
}

export interface AttemptResultContext<Q = unknown, A = unknown> {
  item: Item<Q>;
  answer: A | undefined;
  correct: boolean;
  rtMs: number;
  sessionId: string;
  mode: SessionMode;
}

/**
 * Astuce calculée sur l'item COURANT, révélée en cours de partie.
 *
 * Règle absolue : une astuce désigne la MÉTHODE, jamais la réponse. `where` dit
 * où regarder sans rien calculer ; `step` applique le premier geste de la
 * méthode à cet item précis et s'arrête là. Donner la réponse remplacerait
 * l'entraînement au lieu de le servir — et fausserait le niveau mesuré.
 */
export interface Hint {
  /** Où regarder. Coûte zéro calcul, ne révèle rien. */
  where: string;
  /** Le premier geste de la méthode, appliqué à cet item. S'arrête avant la réponse. */
  step?: string;
}

export interface ExerciseModule<Q = unknown, A = unknown> {
  id: ExerciseId;
  name: string;
  description: string;
  families: Family[];
  levels: number;
  /** Durée moyenne estimée d'un item, pour composer les sessions. */
  defaultItemSeconds: number;
  /**
   * Limite OFFICIELLE par question, en secondes. Passé ce délai la question est
   * perdue et l'exercice enchaîne, exactement comme au test.
   *
   * Absente là où Pilotest n'en impose pas : « Un mot sur deux », « Pair ou
   * impair » et « Boîtes à mots » se jouent par SÉRIES, au rythme du candidat —
   * y mettre un chrono par item inventerait une contrainte qui n'existe pas.
   * Absente aussi des exercices en flux, qui portent leur propre horloge.
   */
  itemLimitSec?: number;
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
  /**
   * Page Pilotest de CE test, vérifiée. Sert au créneau externe : quand le
   * générateur local n'est pas fiable, on envoie le candidat à la source.
   * Absente là où l'URL n'a pas pu être vérifiée — un lien mort vaut moins
   * qu'un renvoi vers la page de préparation.
   */
  pilotestUrl?: string;
  /** Mode apprentissage : leçon pas-à-pas avec arrêts sur image. */
  lesson?: Lesson;
  /**
   * Correction visuelle après une erreur. Facultative : tous les exercices
   * n'ont pas de quoi se DÉMONTRER en image — sur un QCM d'anglais, la réponse
   * attendue suffit.
   */
  Explain?: React.FC<ExplainProps<Q, A>>;
  /** La correction dédiée porte toute l'information : masque le résumé textuel donné/attendu. */
  visualCorrectionOnly?: boolean;
  /**
   * Astuce à la volée sur l'item courant. `null` quand cet item ne se prête à
   * aucun raccourci — mieux vaut ne rien dire qu'une banalité.
   *
   * Absente sur les exercices en flux (Psychomoteur, M2 Back, Formes et
   * couleurs) : à 0,5 s par stimulus, lire une astuce coûte l'item suivant.
   */
  hint?: (item: Item<Q>) => Hint | null;
  /** Persistance enrichie propre à un exercice, en plus de l'event log générique. */
  onAttemptResult?: (context: AttemptResultContext<Q, A>) => void;
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
  /**
   * Créneau à faire sur Pilotest, pas ici.
   *
   * Certains générateurs locaux ne sont pas calibrés sur l'original — Airways
   * en est le cas d'école. Les jouer ici produit un score qui ne veut rien dire
   * et, pire, qui alimente le classement des faiblesses. Le coach garde donc le
   * créneau dans la séance (le temps est réservé, la structure tient) mais
   * envoie le candidat le faire à la source, et récupère le résultat à la main.
   */
  external?: boolean;
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
  /**
   * Séance lancée VOLONTAIREMENT au-delà du repère quotidien de Psychomoteur.
   * Le cap borne ce que le coach programme ; il n'interdit pas d'en refaire.
   */
  ignoreDailyCap?: boolean;
  /**
   * Avertissement affiché au lancement quand la séance a été composée sur des
   * hypothèses plutôt que sur des consignes — typiquement P1/P2/P3 non saisies.
   * Une séance dégradée reste utile ; la faire passer pour une séance normale,
   * non : le candidat croirait travailler ses vraies priorités.
   */
  degraded?: string;
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
