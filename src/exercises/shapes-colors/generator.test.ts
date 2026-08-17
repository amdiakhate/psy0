import { describe, expect, it } from 'vitest';
import {
  COLORS,
  FILLS,
  KEYS,
  SHAPES,
  attrValueOf,
  branchLabel,
  expectedKey,
  generate,
  ruleLabels,
} from './generator';
import type { AnswerKey, Branch, Rules } from './generator';
import { LEVELS } from './config';

const SEEDS = 150;
const LEVELS_RANGE = Array.from({ length: LEVELS.length }, (_, i) => i + 1);

/** Toutes les branches possibles : attribut × sous-ensemble de valeurs × affectation des touches. */
function allBranches(): Branch[] {
  const out: Branch[] = [];
  for (const attr of ['color', 'shape'] as const) {
    const pool = attr === 'color' ? COLORS : SHAPES;
    for (let count = 2; count <= pool.length; count++) {
      for (const startsWithN of [true, false]) {
        out.push({
          attr,
          entries: pool.slice(0, count).map((value, i) => ({
            value,
            key: ((i % 2 === 0) === startsWithN ? 'N' : 'X') as AnswerKey,
          })),
        });
      }
    }
  }
  return out;
}

describe('shapes-colors — arbre de décision (table de vérité exhaustive)', () => {
  it('expectedKey suit toujours : remplissage → branche → attribut de la branche', () => {
    const branches = allBranches();
    for (const vide of branches) {
      for (const rempli of branches) {
        const rules: Rules = { vide, rempli };
        for (const fill of FILLS) {
          for (const shape of SHAPES) {
            for (const color of COLORS) {
              const branch = rules[fill];
              const value = attrValueOf(branch.attr, { shape, color });
              const manual = branch.entries.find((e) => e.value === value)?.key ?? null;
              expect(expectedKey(rules, { shape, color, fill })).toBe(manual);
            }
          }
        }
      }
    }
  });

  it("l'attribut non pertinent d'une branche ne change jamais la touche", () => {
    for (const vide of allBranches()) {
      const rules: Rules = { vide, rempli: vide };
      for (const fill of FILLS) {
        if (vide.attr === 'color') {
          for (const color of COLORS) {
            const keys = SHAPES.map((shape) => expectedKey(rules, { shape, color, fill }));
            expect(new Set(keys).size).toBe(1);
          }
        } else {
          for (const shape of SHAPES) {
            const keys = COLORS.map((color) => expectedKey(rules, { shape, color, fill }));
            expect(new Set(keys).size).toBe(1);
          }
        }
      }
    }
  });

  it('chaque branche couvre toujours les deux touches', () => {
    for (const branch of allBranches()) {
      expect(new Set(branch.entries.map((e) => e.key))).toEqual(new Set(KEYS));
    }
  });
});

describe('shapes-colors generator', () => {
  it('est déterministe : même (seed, level, forceTag) → même item', () => {
    for (const level of LEVELS_RANGE) {
      for (let seed = 0; seed < SEEDS; seed++) {
        expect(generate(seed, level)).toEqual(generate(seed, level));
        expect(generate(seed, level, 'branch-switch')).toEqual(
          generate(seed, level, 'branch-switch'),
        );
      }
    }
  });

  it('respecte le rythme, la durée d’affichage et le nombre de stimuli du niveau', () => {
    for (const level of LEVELS_RANGE) {
      const cfg = LEVELS[level - 1];
      for (let seed = 0; seed < SEEDS; seed++) {
        const q = generate(seed, level).question;
        expect(q.intervalMs).toBe(cfg.intervalMs);
        expect(q.visibleMs).toBe(cfg.visibleMs);
        expect(q.stimuli).toHaveLength(cfg.count);
        expect(q.visibleMs).toBeLessThan(q.intervalMs);
      }
    }
  });

  it('la touche de chaque stimulus est exactement celle produite par l’arbre', () => {
    for (const level of LEVELS_RANGE) {
      for (let seed = 0; seed < SEEDS; seed++) {
        const { rules, stimuli } = generate(seed, level).question;
        for (const s of stimuli) {
          expect(s.key).toBe(expectedKey(rules, s));
          expect(s.key).not.toBeNull();
        }
      }
    }
  });

  it('les règles respectent le mode et le nombre de valeurs du niveau', () => {
    for (const level of LEVELS_RANGE) {
      const cfg = LEVELS[level - 1];
      for (let seed = 0; seed < SEEDS; seed++) {
        const { rules } = generate(seed, level).question;
        for (const branch of [rules.vide, rules.rempli]) {
          expect(branch.entries).toHaveLength(cfg.valuesPerBranch);
          expect(new Set(branch.entries.map((e) => e.value)).size).toBe(cfg.valuesPerBranch);
          expect(new Set(branch.entries.map((e) => e.key))).toEqual(new Set(KEYS));
        }
        if (cfg.mode === 'canonical') {
          expect(rules.vide.attr).toBe('color');
          expect(rules.rempli.attr).toBe('shape');
        }
        if (cfg.mode === 'different') {
          expect(rules.vide.attr).not.toBe(rules.rempli.attr);
        }
      }
    }
  });

  it('les niveaux « different » finissent par inverser l’affectation canonique', () => {
    const inverted = Array.from({ length: SEEDS }, (_, seed) => generate(seed, 3).question.rules).filter(
      (r) => r.vide.attr === 'shape',
    );
    expect(inverted.length).toBeGreaterThan(0);
    expect(inverted.length).toBeLessThan(SEEDS);
  });

  it('deux branches ne sont jamais strictement identiques (le remplissage sert toujours)', () => {
    for (const level of LEVELS_RANGE) {
      for (let seed = 0; seed < SEEDS; seed++) {
        const { rules } = generate(seed, level).question;
        if (rules.vide.attr !== rules.rempli.attr) continue;
        const same = rules.vide.entries.every((e) =>
          rules.rempli.entries.some((f) => f.value === e.value && f.key === e.key),
        );
        expect(same).toBe(false);
      }
    }
  });

  it('tags exacts : empty/filled, key-N/key-X, et branch-switch recalculé depuis la séquence', () => {
    for (const level of LEVELS_RANGE) {
      for (let seed = 0; seed < SEEDS; seed++) {
        const { stimuli } = generate(seed, level).question;
        stimuli.forEach((s, i) => {
          const expectedTags = [s.fill === 'vide' ? 'empty' : 'filled', `key-${s.key}`];
          if (i > 0 && stimuli[i - 1].fill !== s.fill) expectedTags.push('branch-switch');
          expect(s.tags).toEqual(expectedTags);
        });
      }
    }
  });

  it('les deux branches et les deux touches sont sollicitées sur une série', () => {
    for (const level of LEVELS_RANGE) {
      for (let seed = 0; seed < SEEDS; seed++) {
        const { stimuli } = generate(seed, level).question;
        expect(new Set(stimuli.map((s) => s.fill)).size).toBe(2);
        expect(new Set(stimuli.map((s) => s.key)).size).toBe(2);
      }
    }
  });

  it("forceTag='branch-switch' densifie nettement les changements de branche", () => {
    const rate = (forceTag?: string) => {
      let switches = 0;
      let total = 0;
      for (let seed = 0; seed < SEEDS; seed++) {
        const { stimuli } = generate(seed, 2, forceTag).question;
        switches += stimuli.filter((s) => s.tags.includes('branch-switch')).length;
        total += stimuli.length - 1;
      }
      return switches / total;
    };
    const base = rate();
    const forced = rate('branch-switch');
    expect(base).toBeGreaterThan(0.35);
    expect(base).toBeLessThan(0.65);
    expect(forced).toBeGreaterThan(0.75);
  });

  it("forceTag='empty' / 'filled' verrouille la branche (donc aucun branch-switch)", () => {
    for (let seed = 0; seed < SEEDS; seed++) {
      for (const [tag, fill] of [
        ['empty', 'vide'],
        ['filled', 'rempli'],
      ] as const) {
        const { stimuli } = generate(seed, 3, tag).question;
        expect(stimuli.every((s) => s.fill === fill)).toBe(true);
        expect(stimuli.every((s) => s.tags.includes(tag))).toBe(true);
        expect(stimuli.some((s) => s.tags.includes('branch-switch'))).toBe(false);
      }
    }
  });

  it("forceTag='key-N' / 'key-X' oriente la touche attendue sans la rendre unique", () => {
    for (const key of KEYS) {
      let hits = 0;
      let total = 0;
      for (let seed = 0; seed < SEEDS; seed++) {
        const { stimuli } = generate(seed, 2, `key-${key}`).question;
        hits += stimuli.filter((s) => s.key === key).length;
        total += stimuli.length;
      }
      expect(hits / total).toBeGreaterThan(0.75);
      expect(hits / total).toBeLessThan(1);
    }
  });

  it('les libellés affichés décrivent exactement les règles générées', () => {
    for (const level of LEVELS_RANGE) {
      for (let seed = 0; seed < SEEDS; seed++) {
        const { rules, ruleLabels: labels } = generate(seed, level).question;
        expect(labels).toEqual(ruleLabels(rules));
        expect(labels[0]).toContain('VIDE');
        expect(labels[1]).toContain('REMPLIE');
        for (const label of labels) {
          expect(label).toContain('sur N si');
          expect(label).toContain('sur X si');
        }
      }
    }
  });

  it('formule le libellé comme l’énoncé officiel', () => {
    expect(
      branchLabel(1, 'vide', {
        attr: 'color',
        entries: [
          { value: 'bleu', key: 'N' },
          { value: 'orange', key: 'X' },
        ],
      }),
    ).toBe(
      'Règle n°1 : si la forme est VIDE, appuyez : sur N si la forme est BLEUE — sur X si la forme est ORANGE.',
    );
    expect(
      branchLabel(2, 'rempli', {
        attr: 'shape',
        entries: [
          { value: 'carre', key: 'N' },
          { value: 'triangle', key: 'X' },
        ],
      }),
    ).toBe(
      'Règle n°2 : si la forme est REMPLIE, appuyez : sur N si la forme est CARRÉE — sur X si la forme est TRIANGULAIRE.',
    );
  });

  it('tags de série : l’attribut de chaque branche', () => {
    for (const level of LEVELS_RANGE) {
      for (let seed = 0; seed < SEEDS; seed++) {
        const item = generate(seed, level);
        expect(item.tags).toEqual([
          `vide-${item.question.rules.vide.attr}`,
          `rempli-${item.question.rules.rempli.attr}`,
        ]);
      }
    }
  });
});
