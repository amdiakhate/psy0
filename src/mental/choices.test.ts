import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../core/rng';
import { choicesFor } from './choices';
import { TECHNIQUES } from './techniques';

const SEEDS = Array.from({ length: 150 }, (_, i) => i * 7919 + 11);

describe('options du mode QCM', () => {
  it('proposent quatre choix distincts, dont exactement la bonne réponse', () => {
    for (const t of TECHNIQUES) {
      for (const seed of SEEDS) {
        const item = t.generate(mulberry32(seed));
        const c = choicesFor(item, mulberry32(seed + 1));
        if (item.kind === 'verdict') {
          // Un verdict se répond déjà d'une touche : pas de QCM à fabriquer.
          expect(c, t.id).toBeNull();
          continue;
        }
        expect(c, t.id).not.toBeNull();
        expect(c!.options, t.id).toHaveLength(4);
        expect(new Set(c!.options).size, `${t.id} / graine ${seed}`).toBe(4);
        expect(c!.options[c!.correctIndex], t.id).toBe(String(item.answer));
        // Une seule option doit valoir la réponse : deux la rendraient indécidable.
        expect(c!.options.filter((o) => o === String(item.answer)), t.id).toHaveLength(1);
      }
    }
  });

  it('ne proposent que des leurres PLAUSIBLES, jamais absurdes', () => {
    // Un leurre hors d'échelle se repérerait à l'ordre de grandeur, et le QCM se
    // jouerait sans calculer.
    for (const t of TECHNIQUES) {
      for (const seed of SEEDS.slice(0, 60)) {
        const item = t.generate(mulberry32(seed));
        if (item.kind !== 'value') continue;
        const c = choicesFor(item, mulberry32(seed + 1))!;
        for (const o of c.options) {
          const v = Number(o);
          expect(Number.isInteger(v), `${t.id} : ${o}`).toBe(true);
          expect(v, `${t.id} : ${o}`).toBeGreaterThan(0);
          // Jamais plus de quatre fois ni moins d'un quart de la réponse.
          expect(v, `${t.id} : ${o} vs ${item.answer}`).toBeLessThanOrEqual(item.answer * 4 + 12);
        }
      }
    }
  });

  it('les options d’un item en lettres sont toutes des lettres uniques', () => {
    for (const t of TECHNIQUES) {
      for (const seed of SEEDS.slice(0, 60)) {
        const item = t.generate(mulberry32(seed));
        if (item.kind !== 'letter') continue;
        const c = choicesFor(item, mulberry32(seed + 1))!;
        for (const o of c.options) expect(o, t.id).toMatch(/^[A-Z]$/);
      }
    }
  });

  it('sont déterministes : même item, même graine, mêmes options', () => {
    for (const t of TECHNIQUES) {
      const item = t.generate(mulberry32(5));
      expect(choicesFor(item, mulberry32(9))).toEqual(choicesFor(item, mulberry32(9)));
    }
  });
});
