import { describe, expect, it } from 'vitest';
import type { ExerciseId, SessionBlock } from '../core/types';
import { MAX_BLOCK_SEC } from './composer-logic';
import {
  LOG_RESERVE_SEC,
  MORNING_DURATIONS,
  MORNING_PSYCHO_SEC,
  WARMUP_SEC,
  composeMorningBlocks,
  prioritySecondsOf,
  respectsBlockCap,
  shareByWeights,
} from './morning-logic';
import type { MorningDuration, MorningPriority } from './morning-logic';

const G2: ExerciseId[] = ['cubes', 'stacking', 'objects-3d', 'sliding-shapes'];
const G3: ExerciseId[] = ['logic-series', 'marbles'];

const priority = (exercise: ExerciseId, tag?: string): MorningPriority => ({
  exercise,
  weakTag: tag ? { tag, errorRate: 0.44 } : null,
});

const seconds = (blocks: SessionBlock[]) => blocks.reduce((s, b) => s + (b.durationSec ?? 0), 0);

const build = (durationMin: MorningDuration, overrides: Partial<Parameters<typeof composeMorningBlocks>[0]> = {}) =>
  composeMorningBlocks({
    durationMin,
    warmup: 'calc-grid',
    priorities: durationMin === 60 ? [priority('word-skip')] : [priority('word-skip'), priority('odd-even')],
    rotationMembers: durationMin === 60 ? G2 : [...G2, ...G3],
    hasPsycho: true,
    ...overrides,
  });

describe('shareByWeights', () => {
  it('conserve le total et respecte les poids', () => {
    expect(shareByWeights(2400, [3, 2])).toEqual([1440, 960]);
    expect(shareByWeights(100, [1, 1, 1]).reduce((a, b) => a + b, 0)).toBe(100);
    expect(shareByWeights(0, [3, 2])).toEqual([0, 0]);
  });

  it('ne perd aucune seconde sur une division inexacte', () => {
    for (let total = 1; total <= 500; total++) {
      expect(shareByWeights(total, [3, 2]).reduce((a, b) => a + b, 0)).toBe(total);
    }
  });
});

describe('composeMorningBlocks', () => {
  it('produit exactement la durée annoncée, log compris', () => {
    for (const durationMin of MORNING_DURATIONS) {
      expect(seconds(build(durationMin)) + LOG_RESERVE_SEC).toBe(durationMin * 60);
    }
  });

  it('ne dépasse jamais 8 min par bloc — plus aucune exception', () => {
    for (const durationMin of MORNING_DURATIONS) {
      for (const withTag of [false, true]) {
        const blocks = build(durationMin, {
          priorities:
            durationMin === 60
              ? [priority('word-skip', withTag ? 'alpha' : undefined)]
              : [priority('word-skip', withTag ? 'alpha' : undefined), priority('odd-even')],
        });
        expect(respectsBlockCap(blocks)).toBe(true);
        for (const b of blocks) {
          if (b.role === 'psychomotor') continue;
          expect(b.durationSec ?? 0).toBeLessThanOrEqual(MAX_BLOCK_SEC);
        }
      }
    }
  });

  it('donne 24 min à la priorité sur une séance de 60 min, en 3 passes de 8 min', () => {
    const blocks = build(60);
    expect(prioritySecondsOf(blocks)).toBe(24 * 60);
    const passes = blocks.filter((b) => b.role === 'priority');
    expect(passes).toHaveLength(3);
    for (const p of passes) expect(p.durationSec).toBe(480);
    // Une seule priorité sur 60 min.
    expect(new Set(passes.map((p) => p.exercise)).size).toBe(1);
  });

  it('conserve la proportion priorité / rotation sur 1 h 30', () => {
    const blocks = build(90);
    const core = 90 * 60 - LOG_RESERVE_SEC - WARMUP_SEC - MORNING_PSYCHO_SEC;
    // 8/15 du temps utile, comme sur 60 min : 40 min de priorité sur 75.
    expect(prioritySecondsOf(blocks)).toBe(Math.round((core * 8) / 15));
    expect(prioritySecondsOf(blocks)).toBe(40 * 60);
    // Deux exercices prioritaires, la priorité du jour gardant la part majoritaire.
    const byExercise = new Map<ExerciseId, number>();
    for (const b of blocks.filter((x) => x.role === 'priority')) {
      byExercise.set(b.exercise, (byExercise.get(b.exercise) ?? 0) + (b.durationSec ?? 0));
    }
    expect(byExercise.size).toBe(2);
    expect(byExercise.get('word-skip')!).toBeGreaterThan(byExercise.get('odd-even')!);
  });

  it('entrelace priorité et rotation au lieu de les enchaîner', () => {
    for (const durationMin of MORNING_DURATIONS) {
      const blocks = build(durationMin);
      const roles = blocks.filter((b) => b.role === 'priority' || b.role === 'rotation').map((b) => b.role);
      // Jamais trois blocs de priorité d'affilée : la rotation les sépare.
      let run = 0;
      let longest = 0;
      for (const r of roles) {
        run = r === 'priority' ? run + 1 : 0;
        longest = Math.max(longest, run);
      }
      expect(longest).toBeLessThanOrEqual(1);
    }
  });

  it('n’enchaîne jamais deux blocs du même exercice', () => {
    for (const durationMin of MORNING_DURATIONS) {
      const blocks = build(durationMin);
      for (let i = 1; i < blocks.length; i++) {
        expect(blocks[i].exercise).not.toBe(blocks[i - 1].exercise);
      }
    }
  });

  it('ouvre sur l’échauffement et ferme sur le Psychomoteur', () => {
    for (const durationMin of MORNING_DURATIONS) {
      const blocks = build(durationMin);
      expect(blocks[0].role).toBe('warmup');
      expect(blocks[0].durationSec).toBe(WARMUP_SEC);
      expect(blocks[blocks.length - 1].role).toBe('psychomotor');
      expect(blocks[blocks.length - 1].durationSec).toBe(MORNING_PSYCHO_SEC);
    }
  });

  it('sépare l’échauffement de la priorité quand c’est le même exercice', () => {
    // Grilles de calculs peut sortir comme priorité du jour : sans garde-fou,
    // la séance ouvrirait sur 13 min consécutives du même exercice.
    const blocks = composeMorningBlocks({
      durationMin: 60,
      warmup: 'calc-grid',
      priorities: [priority('calc-grid', 'sub-carry')],
      rotationMembers: G2,
      hasPsycho: true,
    });
    expect(blocks[0].exercise).toBe('calc-grid');
    expect(blocks[1].exercise).not.toBe('calc-grid');
    expect(seconds(blocks) + LOG_RESERVE_SEC).toBe(3600);
  });

  it('drille le sous-type fautif sur la première passe seulement', () => {
    const blocks = composeMorningBlocks({
      durationMin: 60,
      warmup: 'calc-grid',
      priorities: [priority('word-skip', 'alpha-order')],
      rotationMembers: G2,
      hasPsycho: true,
    });
    const passes = blocks.filter((b) => b.role === 'priority');
    expect(passes.filter((p) => p.tagFilter === 'alpha-order')).toHaveLength(1);
    expect(passes.filter((p) => p.tagFilter === undefined)).toHaveLength(passes.length - 1);
  });

  it('couvre tous les membres de la rotation', () => {
    const blocks = build(60);
    const covered = new Set(blocks.filter((b) => b.role === 'rotation').map((b) => b.exercise));
    expect([...covered].sort()).toEqual([...G2].sort());
  });

  it('tient sans Psychomoteur (cap quotidien déjà consommé)', () => {
    const blocks = build(60, { hasPsycho: false });
    expect(blocks.some((b) => b.role === 'psychomotor')).toBe(false);
    expect(seconds(blocks) + LOG_RESERVE_SEC).toBe(3600);
    expect(respectsBlockCap(blocks)).toBe(true);
  });

  it('découpe un groupe de rotation à deux membres sous le plafond', () => {
    // 21 min sur 2 membres = 10,5 min chacun : il faut découper, pas dépasser.
    const blocks = composeMorningBlocks({
      durationMin: 60,
      warmup: 'calc-grid',
      priorities: [priority('word-skip')],
      rotationMembers: ['word-boxes', 'star-words'],
      hasPsycho: true,
    });
    expect(respectsBlockCap(blocks)).toBe(true);
    expect(blocks.filter((b) => b.role === 'rotation')).toHaveLength(4);
  });
});
