import { mulberry32, pick, shuffle } from '../../core/rng';
import type { Rng } from '../../core/rng';
import type { Item } from '../../core/types';
import { FORCED_KEY_RATE, FORCED_SWITCH_RATE, LEVELS, SWITCH_RATE } from './config';
import type { BranchAttr, ShapesColorsLevel } from './config';

export type Shape = 'carre' | 'triangle' | 'rond' | 'etoile';
export type Color = 'bleu' | 'orange' | 'vert' | 'rouge';
export type Fill = 'vide' | 'rempli';
/** Les deux seules touches du test. */
export type AnswerKey = 'N' | 'X';

/** Ordre canonique : les deux premières valeurs sont celles de l'exemple officiel. */
export const SHAPES: Shape[] = ['carre', 'triangle', 'rond', 'etoile'];
export const COLORS: Color[] = ['bleu', 'orange', 'vert', 'rouge'];
export const FILLS: Fill[] = ['vide', 'rempli'];
export const KEYS: AnswerKey[] = ['N', 'X'];
const ATTRS: BranchAttr[] = ['color', 'shape'];

export const COLOR_HEX: Record<Color, string> = {
  bleu: '#3b82f6',
  orange: '#f97316',
  vert: '#22c55e',
  rouge: '#ef4444',
};

export const SHAPE_LABELS: Record<Shape, string> = {
  carre: 'carré',
  triangle: 'triangle',
  rond: 'rond',
  etoile: 'étoile',
};

export const COLOR_LABELS: Record<Color, string> = {
  bleu: 'bleu',
  orange: 'orange',
  vert: 'vert',
  rouge: 'rouge',
};

/** Formulations de la consigne : « … si la forme est CARRÉE / BLEUE ». */
const SHAPE_ADJ: Record<Shape, string> = {
  carre: 'CARRÉE',
  triangle: 'TRIANGULAIRE',
  rond: 'RONDE',
  etoile: 'ÉTOILÉE',
};

const COLOR_ADJ: Record<Color, string> = {
  bleu: 'BLEUE',
  orange: 'ORANGE',
  vert: 'VERTE',
  rouge: 'ROUGE',
};

export type AttrValue = Shape | Color;

/** Une valeur d'attribut et la touche qu'elle commande. */
export interface RuleEntry {
  value: AttrValue;
  key: AnswerKey;
}

/** Une branche de l'arbre : l'attribut qui départage, et son mapping valeur → touche. */
export interface Branch {
  attr: BranchAttr;
  entries: RuleEntry[];
}

/**
 * L'arbre de décision complet, valable pour TOUTE la série :
 * 1er critère = le remplissage ; puis, dans la branche atteinte, l'attribut
 * `attr` de cette branche donne la touche.
 */
export interface Rules {
  vide: Branch;
  rempli: Branch;
}

export interface ShapesColorsStimulus {
  shape: Shape;
  color: Color;
  fill: Fill;
  /** Touche attendue — toujours recalculée depuis l'arbre, jamais posée à la main. */
  key: AnswerKey;
  /** 'empty' | 'filled', 'key-N' | 'key-X', et 'branch-switch' si la branche change. */
  tags: string[];
}

export interface ShapesColorsQuestion {
  rules: Rules;
  /** Les deux règles, formulées comme au test, annoncées avant la série. */
  ruleLabels: [string, string];
  intervalMs: number;
  visibleMs: number;
  stimuli: ShapesColorsStimulus[];
}

export type ShapesColorsAnswer = AnswerKey;

export function attrValueOf(attr: BranchAttr, s: { shape: Shape; color: Color }): AttrValue {
  return attr === 'color' ? s.color : s.shape;
}

export function attrLabel(attr: BranchAttr, value: AttrValue): string {
  return attr === 'color' ? COLOR_ADJ[value as Color] : SHAPE_ADJ[value as Shape];
}

/**
 * L'ARBRE DE DÉCISION — source de vérité unique.
 * 1) le remplissage choisit la branche ; 2) l'attribut de la branche choisit la touche.
 * `null` = valeur non couverte par la règle : le générateur n'en produit jamais.
 */
export function expectedKey(
  rules: Rules,
  s: { shape: Shape; color: Color; fill: Fill },
): AnswerKey | null {
  const branch = rules[s.fill];
  const value = attrValueOf(branch.attr, s);
  return branch.entries.find((e) => e.value === value)?.key ?? null;
}

/** « Règle n°1 : si la forme est VIDE, appuyez : sur N si … — sur X si … » */
export function branchLabel(index: 1 | 2, fill: Fill, branch: Branch): string {
  const side = (key: AnswerKey) =>
    branch.entries
      .filter((e) => e.key === key)
      .map((e) => attrLabel(branch.attr, e.value))
      .join(' ou ');
  const state = fill === 'vide' ? 'VIDE' : 'REMPLIE';
  return `Règle n°${index} : si la forme est ${state}, appuyez : sur N si la forme est ${side('N')} — sur X si la forme est ${side('X')}.`;
}

export function ruleLabels(rules: Rules): [string, string] {
  return [branchLabel(1, 'vide', rules.vide), branchLabel(2, 'rempli', rules.rempli)];
}

/**
 * Une branche : `count` valeurs distinctes, alternées N/X pour que les deux
 * touches soient toujours représentées (2 → 1/1, 3 → 2/1, 4 → 2/2).
 * En mode canonique on garde l'ordre déclaré (bleu/orange, carré/triangle).
 */
function buildBranch(rng: Rng, attr: BranchAttr, count: number, canonical: boolean): Branch {
  const pool: AttrValue[] = attr === 'color' ? [...COLORS] : [...SHAPES];
  const values = (canonical ? pool : shuffle(rng, pool)).slice(0, count);
  const startsWithN = rng() < 0.5;
  const entries: RuleEntry[] = values.map((value, i) => ({
    value,
    key: (i % 2 === 0) === startsWithN ? 'N' : 'X',
  }));
  return { attr, entries };
}

function buildRules(rng: Rng, cfg: ShapesColorsLevel): Rules {
  let videAttr: BranchAttr;
  let rempliAttr: BranchAttr;
  if (cfg.mode === 'canonical') {
    videAttr = 'color';
    rempliAttr = 'shape';
  } else if (cfg.mode === 'different') {
    const flipped = rng() < 0.5;
    videAttr = flipped ? 'shape' : 'color';
    rempliAttr = flipped ? 'color' : 'shape';
  } else {
    videAttr = pick(rng, ATTRS);
    rempliAttr = pick(rng, ATTRS);
  }
  const canonical = cfg.mode === 'canonical';
  const vide = buildBranch(rng, videAttr, cfg.valuesPerBranch, canonical);
  let rempli = buildBranch(rng, rempliAttr, cfg.valuesPerBranch, canonical);
  // Deux branches strictement identiques rendraient le remplissage inutile :
  // on inverse alors les touches de la seconde pour garder un vrai arbre.
  if (sameBranch(vide, rempli)) {
    rempli = {
      attr: rempli.attr,
      entries: rempli.entries.map((e) => ({ value: e.value, key: e.key === 'N' ? 'X' : 'N' })),
    };
  }
  return { vide, rempli };
}

/** Deux branches équivalentes : même attribut et même mapping valeur → touche. */
function sameBranch(a: Branch, b: Branch): boolean {
  if (a.attr !== b.attr) return false;
  return a.entries.every((e) => b.entries.some((f) => f.value === e.value && f.key === e.key));
}

function other(fill: Fill): Fill {
  return fill === 'vide' ? 'rempli' : 'vide';
}

/**
 * Série continue de `count` stimuli.
 *
 * Modélisation de l'arbre : le remplissage est le PREMIER critère (il choisit
 * la branche), l'attribut porté par la branche est le SECOND (il choisit la
 * touche). Un stimulus est fabriqué à l'envers de la lecture : on tire la
 * branche, puis la touche visée, puis une valeur de la branche qui la commande ;
 * l'attribut restant est tiré librement — c'est le distracteur, il n'a aucune
 * influence sur la réponse. La touche stockée est ensuite RECALCULÉE par
 * `expectedKey`, donc l'item ne peut pas diverger de l'arbre.
 *
 * forceTag : 'branch-switch' densifie les alternances vide↔rempli (le piège
 * cognitif : re-parcourir l'arbre), 'empty'/'filled' verrouille la branche,
 * 'key-N'/'key-X' oriente la touche attendue.
 */
export function generate(
  seed: number,
  level: number,
  forceTag?: string,
): Item<ShapesColorsQuestion> {
  const rng = mulberry32(seed);
  const cfg = LEVELS[Math.min(Math.max(level, 1), LEVELS.length) - 1];
  const rules = buildRules(rng, cfg);

  const fixedFill: Fill | null =
    forceTag === 'empty' ? 'vide' : forceTag === 'filled' ? 'rempli' : null;
  const switchRate = forceTag === 'branch-switch' ? FORCED_SWITCH_RATE : SWITCH_RATE;
  const forcedKey: AnswerKey | null =
    forceTag === 'key-N' ? 'N' : forceTag === 'key-X' ? 'X' : null;

  const stimuli: ShapesColorsStimulus[] = [];
  let fill: Fill = 'vide';

  for (let i = 0; i < cfg.count; i++) {
    if (fixedFill) fill = fixedFill;
    else if (i === 0) fill = rng() < 0.5 ? 'vide' : 'rempli';
    else fill = rng() < switchRate ? other(fill) : fill;

    const branch = rules[fill];
    const wanted: AnswerKey = forcedKey
      ? rng() < FORCED_KEY_RATE
        ? forcedKey
        : forcedKey === 'N'
          ? 'X'
          : 'N'
      : rng() < 0.5
        ? 'N'
        : 'X';
    const candidates = branch.entries.filter((e) => e.key === wanted);
    const entry = pick(rng, candidates);

    const shape: Shape = branch.attr === 'shape' ? (entry.value as Shape) : pick(rng, SHAPES);
    const color: Color = branch.attr === 'color' ? (entry.value as Color) : pick(rng, COLORS);

    const key = expectedKey(rules, { shape, color, fill });
    if (key === null) throw new Error('Stimulus non couvert par la règle — générateur incohérent');

    const tags = [fill === 'vide' ? 'empty' : 'filled', `key-${key}`];
    const prev = stimuli[i - 1];
    if (prev && prev.fill !== fill) tags.push('branch-switch');

    stimuli.push({ shape, color, fill, key, tags });
  }

  return {
    question: {
      rules,
      ruleLabels: ruleLabels(rules),
      intervalMs: cfg.intervalMs,
      visibleMs: cfg.visibleMs,
      stimuli,
    },
    seed,
    level,
    tags: [`vide-${rules.vide.attr}`, `rempli-${rules.rempli.attr}`],
  };
}
