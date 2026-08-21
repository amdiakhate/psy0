import { describe, expect, it } from 'vitest';
import { MAX_BLUE, MAX_TOTAL, SERIES_PER_PASSATION } from './config';
import {
  channelOf,
  generate,
  isDiverted,
  makeChannel,
  minimalClosures,
  occupancyAt,
  parClosures,
  violationAt,
  zoneEntryTick,
} from './generator';
import type { Closures, Plane, PlaneColor, Series } from './generator';

const COLS = 34;
const ZONE = { start: 15, end: 19, lineFrom: 0, lineTo: 5 };

/**
 * Une série fabriquée à la main : tous les avions atteignent la bande grise au
 * MÊME pas, ce qui rend les seuils vérifiables à l'unité près.
 *
 * Un violet part de la colonne 0 et avance d'une case par pas : il entre dans
 * la bande au pas `start`. Un bleu part de `cols-1` : il y entre au pas
 * `cols-1-end`. On décale donc les spawns pour aligner les arrivées.
 */
function seriesWith(colors: PlaneColor[], opts: { line?: (i: number) => number } = {}): Series {
  const arriveAt = 20;
  const planes: Plane[] = colors.map((color, i) => ({
    id: i,
    group: 0,
    line: opts.line ? opts.line(i) : i % 6,
    color,
    spawnTick: arriveAt - (color === 'purple' ? ZONE.start : COLS - 1 - ZONE.end),
    speed: 1,
  }));
  return {
    index: 0,
    zones: [ZONE, ZONE],
    planes,
    cols: COLS,
    tickMs: 800,
    durationTicks: 60,
    par: 0,
  };
}

const NONE: Closures = new Map();

describe('seuils d’accident', () => {
  it('aligne bien les arrivées (préalable des tests de seuil)', () => {
    const s = seriesWith(['purple', 'blue']);
    expect(zoneEntryTick(s.planes[0], ZONE, COLS)).toBe(20);
    expect(zoneEntryTick(s.planes[1], ZONE, COLS)).toBe(20);
  });

  it('4 avions dans la bande : pas d’accident', () => {
    const s = seriesWith(['purple', 'purple', 'purple', 'purple']);
    expect(occupancyAt(s, 0, 20, NONE)).toEqual({ total: 4, blue: 0 });
    expect(violationAt(s, 20, NONE)).toBeNull();
  });

  it('5 avions dans la bande : accident au total', () => {
    const s = seriesWith(['purple', 'purple', 'purple', 'purple', 'purple']);
    expect(occupancyAt(s, 0, 20, NONE).total).toBe(5);
    expect(violationAt(s, 20, NONE)).toEqual({ group: 0, reason: 'flow-total' });
  });

  it('2 bleus : pas d’accident', () => {
    const s = seriesWith(['blue', 'blue']);
    expect(occupancyAt(s, 0, 20, NONE)).toEqual({ total: 2, blue: 2 });
    expect(violationAt(s, 20, NONE)).toBeNull();
  });

  it('3 bleus : accident bleu, même si le total tient', () => {
    const s = seriesWith(['blue', 'blue', 'blue']);
    const occ = occupancyAt(s, 0, 20, NONE);
    expect(occ).toEqual({ total: 3, blue: 3 });
    expect(occ.total).toBeLessThanOrEqual(MAX_TOTAL);
    expect(violationAt(s, 20, NONE)).toEqual({ group: 0, reason: 'flow-blue' });
  });

  it('les seuils sont bien 4 et 2', () => {
    expect(MAX_TOTAL).toBe(4);
    expect(MAX_BLUE).toBe(2);
  });

  /** Une ligne hors de la bande ne compte jamais : fermer sa voie est du gaspillage. */
  it('ignore les avions des lignes que la bande ne couvre pas', () => {
    const s = seriesWith(['purple', 'purple', 'purple', 'purple', 'purple'], { line: (i) => i });
    s.zones = [{ ...ZONE, lineFrom: 0, lineTo: 3 }, ZONE];
    expect(occupancyAt(s, 0, 20, NONE).total).toBe(4);
    expect(violationAt(s, 20, NONE)).toBeNull();
  });
});

describe('fermeture de voie', () => {
  it('emporte les avions qui n’ont pas encore atteint la bande', () => {
    const s = seriesWith(['purple', 'purple', 'purple', 'purple', 'purple']);
    const closed: Closures = new Map([[channelOf(s.planes[4]), 0]]);
    expect(isDiverted(s.planes[4], s, closed)).toBe(true);
    expect(occupancyAt(s, 0, 20, closed).total).toBe(4);
    expect(violationAt(s, 20, closed)).toBeNull();
  });

  /**
   * Le cœur de l'exercice : quand le compteur affiche déjà la limite, il est
   * trop tard. Fermer une voie ne fait pas faire demi-tour à un avion engagé —
   * c'est ce qui oblige à anticiper au lieu de réagir.
   */
  it('ne fait pas demi-tour à un avion déjà dans la bande', () => {
    const s = seriesWith(['purple', 'purple', 'purple', 'purple', 'purple']);
    const tooLate: Closures = new Map([[channelOf(s.planes[4]), 21]]);
    expect(isDiverted(s.planes[4], s, tooLate)).toBe(false);
    expect(violationAt(s, 20, tooLate)).toEqual({ group: 0, reason: 'flow-total' });
  });

  /** Définitive : elle vaut pour les avions à venir, pas seulement ceux du moment. */
  it('vaut aussi pour les avions qui n’ont pas encore décollé', () => {
    const s = seriesWith(['purple', 'purple']);
    const late: Plane = { id: 99, group: 0, line: 0, color: 'purple', spawnTick: 40, speed: 1 };
    s.planes.push(late);
    const closed: Closures = new Map([[makeChannel(0, 0, 'purple'), 5]]);
    expect(isDiverted(late, s, closed)).toBe(true);
  });

  it('ne touche ni à l’autre couleur, ni à l’autre ligne, ni à l’autre groupe', () => {
    const s = seriesWith(['purple', 'blue']);
    const closed: Closures = new Map([[makeChannel(0, 0, 'purple'), 0]]);
    expect(isDiverted(s.planes[0], s, closed)).toBe(true); // ligne 0, violet
    expect(isDiverted(s.planes[1], s, closed)).toBe(false); // ligne 1, bleu
    expect(isDiverted({ ...s.planes[0], group: 1 }, s, closed)).toBe(false);
    expect(isDiverted({ ...s.planes[0], line: 3 }, s, closed)).toBe(false);
    expect(isDiverted({ ...s.planes[0], color: 'blue' }, s, closed)).toBe(false);
  });
});

describe('vitesses hétérogènes', () => {
  it('un avion rapide atteint la bande deux fois plus tôt', () => {
    const slow: Plane = { id: 0, group: 0, line: 0, color: 'purple', spawnTick: 0, speed: 1 };
    const fast: Plane = { ...slow, id: 1, speed: 2 };
    expect(zoneEntryTick(slow, ZONE, COLS)).toBe(ZONE.start);
    expect(zoneEntryTick(fast, ZONE, COLS)).toBe(Math.ceil(ZONE.start / 2));
  });
});

describe('passation générée', () => {
  const item = generate(4242, 3);

  it('compte dix séries', () => {
    expect(item.question.series).toHaveLength(SERIES_PER_PASSATION);
    expect(SERIES_PER_PASSATION).toBe(10);
  });

  it('est déterministe à graine égale', () => {
    const a = JSON.stringify(generate(7, 2).question);
    const b = JSON.stringify(generate(7, 2).question);
    expect(a).toBe(b);
  });

  /** Une série sans rien à fermer ne se joue pas : elle se regarde. */
  it('force une décision dans chaque série', () => {
    for (const s of item.question.series) {
      expect(s.par, `série ${s.index}`).toBeGreaterThan(0);
    }
  });

  it('densifie au fil des séries', () => {
    const s = item.question.series;
    const early = s.slice(0, 3).reduce((n, x) => n + x.planes.length, 0);
    const late = s.slice(-3).reduce((n, x) => n + x.planes.length, 0);
    expect(late).toBeGreaterThan(early);
  });

  /**
   * Le `par` doit être une stratégie qui TIENT : sans cette vérification, on
   * noterait le candidat contre une référence injouable.
   */
  it('la référence de fermetures évite tout accident, sur chaque série', () => {
    for (const s of item.question.series) {
      const closures = parClosures(s);
      for (let t = 0; t <= s.durationTicks; t++) {
        expect(violationAt(s, t, closures), `série ${s.index}, pas ${t}`).toBeNull();
      }
    }
  });

  it('ne ferme jamais plus de voies qu’il n’en existe', () => {
    for (const s of item.question.series) {
      expect(minimalClosures(s).length).toBeLessThanOrEqual(6 * 2 * 2);
    }
  });

  it('produit des avions dans les deux groupes et des deux couleurs', () => {
    const all = item.question.series.flatMap((s) => s.planes);
    expect(new Set(all.map((p) => p.group)).size).toBe(2);
    expect(new Set(all.map((p) => p.color)).size).toBe(2);
    expect(all.some((p) => p.speed === 2)).toBe(true);
  });
});
