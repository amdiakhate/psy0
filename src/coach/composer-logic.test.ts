import { describe, expect, it } from 'vitest';
import type { ExerciseId, SessionBlock } from '../core/types';
import {
  HALFWAY_FROM_MIN,
  MAX_BLOCK_SEC,
  MIN_BLOCK_SEC,
  composeGuidedFrom,
  computeHalfwayIndex,
  guidedMode,
  interleave,
  psychoSecondsFor,
  splitDuration,
} from './composer-logic';
import type { GuidedDuration, RankedExercise } from './composer-logic';

/**
 * Les invariants sont RECALCULÉS depuis les blocs produits — on ne fait jamais
 * confiance à ce que le composer prétend avoir réparti.
 */

const DURATIONS: GuidedDuration[] = [30, 60, 90, 120];

/** Les 15 exercices hors Psychomoteur, dans l'ordre du registre. */
const ALL: ExerciseId[] = [
  'word-skip',
  'odd-even',
  'n-back',
  'shapes-colors',
  'airways',
  'stacking',
  'objects-3d',
  'marbles',
  'sliding-shapes',
  'cubes',
  'calc-grid',
  'logic-series',
  'word-boxes',
  'star-words',
  'english',
];

function ranked(count = ALL.length, withTags = false): RankedExercise[] {
  return ALL.slice(0, count).map((exercise, i) => ({
    exercise,
    name: `Exercice ${i + 1}`,
    items: 50,
    accuracy: 0.4 + i * 0.03,
    weakTag: withTags ? { tag: `piege-${i}`, errorRate: 0.42 } : null,
  }));
}

const seconds = (blocks: SessionBlock[]) => blocks.reduce((s, b) => s + (b.durationSec ?? 0), 0);

describe('splitDuration', () => {
  it('conserve exactement la durée totale et ne dépasse jamais le plafond', () => {
    for (let total = 1; total <= 4000; total += 7) {
      const parts = splitDuration(total);
      expect(parts.reduce((a, b) => a + b, 0)).toBe(total);
      for (const p of parts) expect(p).toBeLessThanOrEqual(MAX_BLOCK_SEC);
      // Parts aussi égales que possible : au plus 1 s d'écart entre deux parts.
      expect(Math.max(...parts) - Math.min(...parts)).toBeLessThanOrEqual(1);
    }
  });

  it('ne produit aucune part pour une durée nulle ou négative', () => {
    expect(splitDuration(0)).toEqual([]);
    expect(splitDuration(-10)).toEqual([]);
  });

  it('découpe une allocation de 18 min en trois blocs de 6 min', () => {
    expect(splitDuration(1080)).toEqual([360, 360, 360]);
  });
});

describe('psychoSecondsFor', () => {
  it('reste borné entre 10 et 12 minutes quelle que soit la séance', () => {
    for (const min of DURATIONS) {
      const sec = psychoSecondsFor(min * 60);
      expect(sec).toBeGreaterThanOrEqual(600);
      expect(sec).toBeLessThanOrEqual(720);
    }
  });
});

describe('guidedMode', () => {
  it('donne un mode distinct par durée — sinon l’event log confond 2 h et 1 h', () => {
    const modes = DURATIONS.map(guidedMode);
    expect(modes).toEqual(['guided30', 'guided60', 'guided90', 'guided120']);
    expect(new Set(modes).size).toBe(DURATIONS.length);
  });
});

describe('interleave', () => {
  it('ne laisse jamais deux blocs consécutifs du même exercice', () => {
    const blocks: ExerciseId[] = ['cubes', 'cubes', 'cubes', 'marbles', 'marbles', 'english'];
    const out = interleave(
      blocks.map((exercise) => ({ exercise, level: 'adaptive' as const, durationSec: 300 })),
    );
    expect(out).toHaveLength(blocks.length);
    for (let i = 1; i < out.length; i++) expect(out[i].exercise).not.toBe(out[i - 1].exercise);
  });

  it('laisse tel quel ce qui ne peut pas être séparé (un seul exercice)', () => {
    const blocks: ExerciseId[] = ['cubes', 'cubes'];
    const out = interleave(
      blocks.map((exercise) => ({ exercise, level: 'adaptive' as const, durationSec: 300 })),
    );
    expect(out.map((b) => b.exercise)).toEqual(['cubes', 'cubes']);
  });

  it('préserve le multiensemble des blocs', () => {
    const source: ExerciseId[] = ['cubes', 'marbles', 'cubes', 'english', 'cubes', 'marbles'];
    const blocks = source.map((exercise, i) => ({
      exercise,
      level: 'adaptive' as const,
      durationSec: 100 + i,
    }));
    const out = interleave(blocks);
    const key = (b: SessionBlock) => `${b.exercise}:${b.durationSec}`;
    expect(out.map(key).sort()).toEqual(blocks.map(key).sort());
  });
});

describe('composeGuidedFrom', () => {
  it('produit exactement la durée demandée, à la seconde près', () => {
    for (const durationMin of DURATIONS) {
      const plan = composeGuidedFrom({ durationMin, ranked: ranked(), hasPsycho: true });
      expect(seconds(plan.blocks)).toBe(durationMin * 60);
    }
  });

  it('ne dépasse jamais 8 min par bloc — Psychomoteur excepté', () => {
    for (const durationMin of DURATIONS) {
      for (const withTags of [false, true]) {
        const plan = composeGuidedFrom({ durationMin, ranked: ranked(ALL.length, withTags), hasPsycho: true });
        for (const b of plan.blocks) {
          if (b.exercise === 'psychomotor') continue;
          expect(b.durationSec ?? 0).toBeLessThanOrEqual(MAX_BLOCK_SEC);
          expect(b.durationSec ?? 0).toBeGreaterThanOrEqual(MIN_BLOCK_SEC);
        }
      }
    }
  });

  it('n’enchaîne jamais deux blocs du même exercice', () => {
    for (const durationMin of DURATIONS) {
      const plan = composeGuidedFrom({ durationMin, ranked: ranked(), hasPsycho: true });
      for (let i = 1; i < plan.blocks.length; i++) {
        expect(plan.blocks[i].exercise).not.toBe(plan.blocks[i - 1].exercise);
      }
    }
  });

  it('respecte la répartition 50/30/20 recalculée depuis les blocs', () => {
    for (const durationMin of DURATIONS) {
      const entries = ranked();
      const plan = composeGuidedFrom({ durationMin, ranked: entries, hasPsycho: true });
      const totalSec = durationMin * 60;
      const psychoSec = seconds(plan.blocks.filter((b) => b.exercise === 'psychomotor'));
      expect(psychoSec).toBe(psychoSecondsFor(totalSec));

      const weakIds = new Set(entries.slice(0, 3).map((e) => e.exercise));
      const weakSec = seconds(plan.blocks.filter((b) => weakIds.has(b.exercise)));
      // Les 3 plus faibles doivent capter la moitié du temps hors Psychomoteur.
      const budget = totalSec - psychoSec;
      expect(weakSec / budget).toBeGreaterThanOrEqual(0.49);
      expect(weakSec / budget).toBeLessThanOrEqual(0.51);
      // Les 3 sont TOUS travaillés, aucun n'est sacrifié par le découpage.
      for (const id of weakIds) {
        expect(plan.blocks.some((b) => b.exercise === id)).toBe(true);
      }
    }
  });

  it('inclut toujours le Psychomoteur, au moins 10 min, en un seul bloc', () => {
    for (const durationMin of DURATIONS) {
      const plan = composeGuidedFrom({ durationMin, ranked: ranked(), hasPsycho: true });
      const psycho = plan.blocks.filter((b) => b.exercise === 'psychomotor');
      expect(psycho).toHaveLength(1);
      expect(psycho[0].durationSec ?? 0).toBeGreaterThanOrEqual(600);
    }
  });

  it('répartit les faiblesses dans la séance au lieu de les grouper au début', () => {
    // Sur 2 h, les 3 exercices faibles occupent 9 blocs : groupés, ils feraient
    // 54 min d'affilée sur les mêmes trois exercices avant tout le reste.
    const entries = ranked();
    const plan = composeGuidedFrom({ durationMin: 120, ranked: entries, hasPsycho: true });
    const weakIds = new Set(entries.slice(0, 3).map((e) => e.exercise));
    const positions = plan.blocks
      .map((b, i) => (weakIds.has(b.exercise) ? i : -1))
      .filter((i) => i >= 0);
    // La dernière faiblesse tombe dans le dernier tiers, la première dans le premier.
    expect(positions[0]).toBeLessThan(plan.blocks.length / 3);
    expect(positions[positions.length - 1]).toBeGreaterThan((2 * plan.blocks.length) / 3);
    // Aucune série de plus de 3 blocs faibles consécutifs.
    let run = 0;
    let longest = 0;
    for (const b of plan.blocks) {
      run = weakIds.has(b.exercise) ? run + 1 : 0;
      longest = Math.max(longest, run);
    }
    expect(longest).toBeLessThanOrEqual(3);
  });

  it('place le Psychomoteur au cœur de la séance, pas à un bout', () => {
    for (const durationMin of DURATIONS) {
      const plan = composeGuidedFrom({ durationMin, ranked: ranked(), hasPsycho: true });
      const at = plan.blocks.findIndex((b) => b.exercise === 'psychomotor');
      expect(at).toBeGreaterThan(0);
      expect(at).toBeLessThan(plan.blocks.length - 1);
    }
  });

  it('couvre plus d’exercices quand la séance s’allonge, au lieu d’allonger les blocs', () => {
    const covered = DURATIONS.map(
      (durationMin) =>
        new Set(composeGuidedFrom({ durationMin, ranked: ranked(), hasPsycho: true }).blocks.map((b) => b.exercise))
          .size,
    );
    for (let i = 1; i < covered.length; i++) expect(covered[i]).toBeGreaterThanOrEqual(covered[i - 1]);
    expect(covered[covered.length - 1]).toBeGreaterThan(covered[0]);
  });

  it('drille le sous-type fautif puis remet l’exercice en conditions normales', () => {
    const entries = ranked(ALL.length, true);
    const plan = composeGuidedFrom({ durationMin: 60, ranked: entries, hasPsycho: true });
    for (const weak of entries.slice(0, 3)) {
      const own = plan.blocks.filter((b) => b.exercise === weak.exercise);
      expect(own.some((b) => b.tagFilter === weak.weakTag!.tag)).toBe(true);
      expect(own.some((b) => b.tagFilter === undefined)).toBe(true);
    }
  });

  it('ne drille pas quand aucun sous-type fautif n’est identifié', () => {
    const plan = composeGuidedFrom({ durationMin: 60, ranked: ranked(ALL.length, false), hasPsycho: true });
    expect(plan.blocks.every((b) => b.tagFilter === undefined)).toBe(true);
  });

  it('ne propose la coupure qu’à partir de 1 h 30, et sur un bloc réel', () => {
    for (const durationMin of DURATIONS) {
      const plan = composeGuidedFrom({ durationMin, ranked: ranked(), hasPsycho: true });
      const index = plan.meta?.halfwayIndex;
      if (durationMin < HALFWAY_FROM_MIN) {
        expect(index).toBeUndefined();
        continue;
      }
      expect(index).toBeDefined();
      expect(index!).toBeGreaterThan(0);
      expect(index!).toBeLessThan(plan.blocks.length);
      // La coupure tombe bien vers le milieu : entre 40 % et 65 % du temps.
      const before = seconds(plan.blocks.slice(0, index));
      expect(before / seconds(plan.blocks)).toBeGreaterThanOrEqual(0.4);
      expect(before / seconds(plan.blocks)).toBeLessThanOrEqual(0.65);
    }
  });

  it('tient sur un classement dégénéré (un seul exercice connu)', () => {
    for (const durationMin of DURATIONS) {
      const plan = composeGuidedFrom({ durationMin, ranked: ranked(1), hasPsycho: true });
      expect(seconds(plan.blocks)).toBe(durationMin * 60);
      expect(plan.blocks.length).toBeGreaterThan(0);
    }
  });

  it('reste cohérent sans aucun exercice hors Psychomoteur', () => {
    const plan = composeGuidedFrom({ durationMin: 30, ranked: [], hasPsycho: true });
    expect(plan.blocks).toHaveLength(1);
    expect(plan.blocks[0].exercise).toBe('psychomotor');
  });

  it('produit un briefing d’au plus 4 lignes', () => {
    for (const durationMin of DURATIONS) {
      const plan = composeGuidedFrom({ durationMin, ranked: ranked(ALL.length, true), hasPsycho: true });
      expect(plan.briefing!.length).toBeGreaterThan(0);
      expect(plan.briefing!.length).toBeLessThanOrEqual(4);
    }
  });
});

describe('computeHalfwayIndex', () => {
  it('coupe après le bloc qui franchit la moitié du temps', () => {
    const blocks: SessionBlock[] = [300, 300, 300, 300].map((durationSec) => ({
      exercise: 'cubes',
      level: 'adaptive',
      durationSec,
    }));
    expect(computeHalfwayIndex(blocks)).toBe(2);
  });

  it('ne propose rien quand la coupure tomberait à la toute fin', () => {
    const blocks: SessionBlock[] = [{ exercise: 'cubes', level: 'adaptive', durationSec: 600 }];
    expect(computeHalfwayIndex(blocks)).toBeUndefined();
  });
});
