import { mulberry32, randInt } from '../../core/rng';
import type { Item } from '../../core/types';
import {
  COLS,
  DENSITY_RAMP,
  FAST_SPEED,
  GROUPS,
  LEVELS,
  LINES_PER_GROUP,
  MAX_BLUE,
  MAX_TOTAL,
  NORMAL_SPEED,
  SERIES_PER_PASSATION,
} from './config';

/**
 * Airways — un problème d'optimisation de flux.
 *
 * Deux groupes de six voies. Les BLEUS vont vers la GAUCHE, les VIOLETS vers la
 * DROITE, à vitesse hétérogène. Chaque groupe a une bande grise centrale et
 * deux compteurs affichés à l'extérieur : le total d'avions dans la bande
 * (max 4) et les bleus dans la bande (max 2). Au moment où un compteur dépasse,
 * c'est l'accident.
 *
 * Le joueur ne clique JAMAIS sur un avion. Il ferme une VOIE — un triplet
 * (groupe, ligne, couleur) — au moyen des boutons de couleur en extrémité de
 * ligne, ou les six d'un coup avec le bouton global. Une fermeture est
 * définitive.
 *
 * Ce qu'une fermeture emporte : les avions de cette voie qui n'ont PAS encore
 * atteint la bande grise. Ceux qui y sont déjà la traversent — on ne fait pas
 * demi-tour à un avion engagé. C'est ce détail qui fait du test un exercice
 * d'anticipation et non de réflexe : quand le compteur affiche 4, il est trop
 * tard, il fallait fermer avant. (Choix documenté dans REGLES-OFFICIELLES.md.)
 */

export type PlaneColor = 'blue' | 'purple';

export interface Plane {
  id: number;
  group: number;
  /** Ligne 0-5 dans le groupe. */
  line: number;
  color: PlaneColor;
  spawnTick: number;
  /** Cases par pas : 1 (simple chevron) ou 2 (double chevron). */
  speed: number;
}

/** Bande grise d'un groupe : des colonnes, et les lignes qu'elle couvre. */
export interface GreyZone {
  /** [start, end] inclus. */
  start: number;
  end: number;
  /** [lineFrom, lineTo] inclus — la bande ne couvre pas forcément les six voies. */
  lineFrom: number;
  lineTo: number;
}

export interface Series {
  index: number;
  zones: GreyZone[];
  planes: Plane[];
  cols: number;
  tickMs: number;
  durationTicks: number;
  /**
   * Nombre de voies qu'il faut fermer pour éviter tout accident. Zéro serait
   * une série sans décision : le générateur n'en produit pas.
   */
  par: number;
}

export interface AirwaysQuestion {
  series: Series[];
  maxTotal: number;
  maxBlue: number;
}

/** Une voie : groupe, ligne, couleur. C'est l'unité que le joueur ferme. */
export type Channel = string;

export function channelOf(p: Pick<Plane, 'group' | 'line' | 'color'>): Channel {
  return `${p.group}:${p.line}:${p.color}`;
}

export function makeChannel(group: number, line: number, color: PlaneColor): Channel {
  return `${group}:${line}:${color}`;
}

/** Colonne d'un avion à l'instant t (hors plateau si < 0 ou ≥ cols). */
export function planeCol(plane: Plane, tick: number, cols: number): number {
  const advance = (tick - plane.spawnTick) * plane.speed;
  return plane.color === 'blue' ? cols - 1 - advance : advance;
}

export function isOnBoard(plane: Plane, tick: number, cols: number): boolean {
  if (tick < plane.spawnTick) return false;
  const col = planeCol(plane, tick, cols);
  return col >= 0 && col < cols;
}

function zoneOf(series: Pick<Series, 'zones'>, plane: Plane): GreyZone {
  return series.zones[plane.group];
}

/** La bande couvre-t-elle la ligne de cet avion ? Sinon il ne comptera jamais. */
export function isCounted(plane: Plane, zone: GreyZone): boolean {
  return plane.line >= zone.lineFrom && plane.line <= zone.lineTo;
}

/**
 * Premier pas où l'avion se trouve dans la bande grise. `Infinity` s'il n'y
 * entre jamais (ligne non couverte). C'est la date limite pour le dérouter.
 */
export function zoneEntryTick(plane: Plane, zone: GreyZone, cols: number): number {
  if (!isCounted(plane, zone)) return Number.POSITIVE_INFINITY;
  const distance = plane.color === 'blue' ? cols - 1 - zone.end : zone.start;
  return plane.spawnTick + Math.ceil(distance / plane.speed);
}

/** Dernier pas où l'avion est encore dans la bande. */
export function zoneExitTick(plane: Plane, zone: GreyZone, cols: number): number {
  if (!isCounted(plane, zone)) return Number.NEGATIVE_INFINITY;
  const distance = plane.color === 'blue' ? cols - 1 - zone.start : zone.end;
  return plane.spawnTick + Math.floor(distance / plane.speed);
}

/**
 * Fermetures actives : voie → pas auquel elle a été fermée. Un avion est
 * dérouté si sa voie a été fermée AVANT qu'il n'atteigne la bande.
 */
export type Closures = ReadonlyMap<Channel, number>;

export function isDiverted(plane: Plane, series: Series, closures: Closures): boolean {
  const closedAt = closures.get(channelOf(plane));
  if (closedAt === undefined) return false;
  return closedAt <= zoneEntryTick(plane, zoneOf(series, plane), series.cols);
}

export function inGreyZone(plane: Plane, tick: number, series: Series): boolean {
  if (tick < plane.spawnTick) return false;
  const zone = zoneOf(series, plane);
  if (!isCounted(plane, zone)) return false;
  const col = planeCol(plane, tick, series.cols);
  return col >= zone.start && col <= zone.end;
}

export interface Occupancy {
  total: number;
  blue: number;
}

export function occupancyAt(
  series: Series,
  group: number,
  tick: number,
  closures: Closures,
): Occupancy {
  let total = 0;
  let blue = 0;
  for (const p of series.planes) {
    if (p.group !== group) continue;
    if (isDiverted(p, series, closures)) continue;
    if (!inGreyZone(p, tick, series)) continue;
    total += 1;
    if (p.color === 'blue') blue += 1;
  }
  return { total, blue };
}

export type AccidentReason = 'flow-total' | 'flow-blue';

/**
 * Violation dans UN groupe. Les groupes se gèlent séparément — un accident
 * stoppe les avions du groupe fautif, pas ceux de l'autre — d'où le besoin de
 * les interroger un par un, chacun à son propre pas.
 */
export function groupViolationAt(
  series: Series,
  group: number,
  tick: number,
  closures: Closures,
  maxTotal = MAX_TOTAL,
  maxBlue = MAX_BLUE,
): AccidentReason | null {
  const { total, blue } = occupancyAt(series, group, tick, closures);
  if (blue > maxBlue) return 'flow-blue';
  if (total > maxTotal) return 'flow-total';
  return null;
}

export function violationAt(
  series: Series,
  tick: number,
  closures: Closures,
  maxTotal = MAX_TOTAL,
  maxBlue = MAX_BLUE,
): { group: number; reason: AccidentReason } | null {
  for (let g = 0; g < series.zones.length; g++) {
    const reason = groupViolationAt(series, g, tick, closures, maxTotal, maxBlue);
    if (reason) return { group: g, reason };
  }
  return null;
}

function firstViolation(series: Series, closures: Closures) {
  for (let t = 0; t <= series.durationTicks; t++) {
    const v = violationAt(series, t, closures);
    if (v) return { tick: t, ...v };
  }
  return null;
}

/**
 * Les voies à fermer pour tenir la série, fermées dès le départ.
 *
 * Une fermeture étant définitive, la fermer plus tard ne fait jamais économiser
 * un appui : ça laisse seulement passer quelques avions de plus. Le nombre
 * d'appuis d'une stratégie parfaite se calcule donc en supposant qu'on ferme
 * avant le premier pas.
 *
 * Glouton : à chaque violation, on ferme la voie qui pèse le plus lourd dans
 * les occupations à venir — la sienne d'abord, celles de tout le groupe
 * ensuite. Le résultat est SUFFISANT (un test vérifie qu'il ne reste aucun
 * accident) sans prétendre être l'optimum exact.
 */
export function minimalClosures(series: Series): Channel[] {
  const closures = new Map<Channel, number>();
  let guard = 0;
  while (guard++ < LINES_PER_GROUP * GROUPS * 2 + 4) {
    const violation = firstViolation(series, closures);
    if (!violation) break;

    // Candidats : les avions présents dans la bande au moment de la casse, et
    // seulement ceux dont la couleur est en cause pour un dépassement bleu.
    const culprits = series.planes.filter(
      (p) =>
        p.group === violation.group &&
        !isDiverted(p, series, closures) &&
        inGreyZone(p, violation.tick, series) &&
        (violation.reason === 'flow-total' || p.color === 'blue'),
    );
    if (culprits.length === 0) break;

    // On ferme la voie du dernier arrivé : c'est celle qu'on pouvait encore
    // stopper, et la seule dont la fermeture change quelque chose au pas fautif.
    const zone = series.zones[violation.group];
    const latest = culprits.reduce((a, b) =>
      zoneEntryTick(b, zone, series.cols) > zoneEntryTick(a, zone, series.cols) ? b : a,
    );
    const channel = channelOf(latest);
    if (closures.has(channel)) break;
    closures.set(channel, 0);
  }
  return [...closures.keys()];
}

/** Ferme les voies calculées, à t = 0 — la carte de référence d'une série. */
export function parClosures(series: Series): Closures {
  return new Map(minimalClosures(series).map((c) => [c, 0]));
}

function buildSeries(rng: () => number, index: number, level: number): Series {
  const cfg = LEVELS[Math.min(level, LEVELS.length) - 1];
  // Densité croissante d'une série à l'autre : la dixième doit forcer la main.
  const spawnRate = cfg.spawnRate * (1 + DENSITY_RAMP * index);

  const zones: GreyZone[] = [];
  for (let g = 0; g < GROUPS; g++) {
    const width = randInt(rng, 4, 6);
    const start = randInt(rng, 11, COLS - width - 12);
    // La bande couvre 4 à 6 voies : celles qu'elle ne couvre pas ne comptent
    // jamais, et fermer une voie non couverte est de l'argent jeté.
    const span = randInt(rng, 4, LINES_PER_GROUP);
    const lineFrom = randInt(rng, 0, LINES_PER_GROUP - span);
    zones.push({ start, end: start + width, lineFrom, lineTo: lineFrom + span - 1 });
  }

  const planes: Plane[] = [];
  let id = 0;
  const lastSpawn = new Map<string, number>();
  for (let t = 0; t < cfg.durationTicks - 6; t++) {
    for (let g = 0; g < GROUPS; g++) {
      for (let line = 0; line < LINES_PER_GROUP; line++) {
        if (rng() >= spawnRate) continue;
        const color: PlaneColor = rng() < 0.5 ? 'blue' : 'purple';
        const key = `${g}:${line}:${color}`;
        // Deux avions de même couleur ne se collent pas sur une même voie.
        if (t - (lastSpawn.get(key) ?? -20) < 3) continue;
        lastSpawn.set(key, t);
        const speed = rng() < cfg.fastShare ? FAST_SPEED : NORMAL_SPEED;
        planes.push({ id: id++, group: g, line, color, spawnTick: t, speed });
      }
    }
  }

  const series: Series = {
    index,
    zones,
    planes,
    cols: COLS,
    tickMs: cfg.tickMs,
    durationTicks: cfg.durationTicks,
    par: 0,
  };
  series.par = minimalClosures(series).length;
  return series;
}

/**
 * Une série sans rien à fermer n'entraîne à rien : le joueur n'a qu'à regarder.
 * On retire donc, en dernier recours, quelques avions pour resserrer les
 * arrivées jusqu'à ce que l'inaction produise un dépassement certain.
 */
function forceDecision(rng: () => number, index: number, level: number): Series {
  for (let attempt = 0; attempt < 12; attempt++) {
    const series = buildSeries(rng, index, level);
    if (series.par > 0) return series;
  }
  // Filet : on densifie franchement plutôt que de rendre une série vide de sens.
  return buildSeries(rng, index, Math.min(LEVELS.length, level + 2));
}

export function generate(seed: number, level: number, forceTag?: string): Item<AirwaysQuestion> {
  const rng = mulberry32(seed);
  const effective = forceTag === 'flow-blue' ? Math.min(LEVELS.length, level + 1) : level;
  const series = Array.from({ length: SERIES_PER_PASSATION }, (_, i) =>
    forceDecision(rng, i, effective),
  );

  return {
    question: { series, maxTotal: MAX_TOTAL, maxBlue: MAX_BLUE },
    seed,
    level,
    tags: ['flow'],
  };
}
