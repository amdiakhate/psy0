import { describe, expect, it } from 'vitest';
import { EXERCISES } from './index';
import { newSeed } from '../core/rng';

/**
 * Le contrat des astuces, pour TOUS les exercices qui en proposent.
 *
 * L'invariant qui compte : une astuce désigne la méthode, elle ne donne JAMAIS
 * la réponse. Une astuce trop bavarde ne se voit pas à la relecture — elle se
 * voit ici, en confrontant son texte à la réponse attendue.
 */
const SEEDS = Array.from({ length: 120 }, (_, i) => i * 7919 + 5);

describe('astuces à la volée', () => {
  const withHint = EXERCISES.filter((e) => e.hint);

  it('sont proposées par une bonne part des exercices', () => {
    expect(withHint.length).toBeGreaterThanOrEqual(5);
  });

  it('ne sont jamais vides ni bavardes à moitié', () => {
    for (const module_ of withHint) {
      for (let level = 1; level <= module_.levels; level++) {
        for (const seed of SEEDS.slice(0, 25)) {
          const item = module_.generate(seed, level);
          const h = module_.hint!(item);
          if (h === null) continue;
          expect(h.where.length, module_.id).toBeGreaterThan(30);
          if (h.step !== undefined) expect(h.step.length, module_.id).toBeGreaterThan(30);
          expect(h.where, module_.id).not.toMatch(/undefined|NaN|Infinity/);
          expect(h.step ?? '', module_.id).not.toMatch(/undefined|NaN|Infinity/);
        }
      }
    }
  });

  it('NE CONTIENNENT JAMAIS la réponse attendue', () => {
    for (const module_ of withHint) {
      for (let level = 1; level <= module_.levels; level++) {
        for (const seed of SEEDS) {
          const item = module_.generate(seed, level);
          const h = module_.hint!(item);
          if (h === null) continue;
          const texte = `${h.where} ${h.step ?? ''}`;
          const attendu = module_.expectedToString(item).trim();
          if (attendu === '') continue;
          // Une réponse d'UN SEUL caractère est intestable ainsi : « E » se
          // retrouve dans n'importe quelle phrase française, et le tableau des
          // jalons alphabétiques contient légitimement « E=5 ». Ces cas tiennent
          // par construction — les fonctions d'astuce s'arrêtent au premier
          // geste et ne calculent jamais le terme manquant.
          if (attendu.length === 1 && !/\d/.test(attendu)) continue;

          // Un nombre isolé dans le texte ne doit pas coïncider avec la réponse :
          // c'est ainsi qu'une astuce « anodine » finit par répondre.
          if (/^-?\d+$/.test(attendu)) {
            const isoles = texte.match(/-?\d+/g) ?? [];
            expect(isoles, `${module_.id} / graine ${seed}`).not.toContain(attendu);
          } else {
            // Correspondance sur MOT ENTIER : « EU » se cache dans « DEUX », et
            // une recherche de sous-chaîne signalerait une fuite qui n'existe pas.
            const isole = new RegExp(`\\b${attendu.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
            expect(isole.test(texte), `${module_.id} / graine ${seed} : « ${attendu} »`).toBe(false);
          }
        }
      }
    }
  });

  it('sont pures : deux appels sur le même item donnent le même texte', () => {
    for (const module_ of withHint) {
      for (const seed of SEEDS.slice(0, 20)) {
        const item = module_.generate(seed, Math.min(3, module_.levels));
        expect(module_.hint!(item)).toEqual(module_.hint!(item));
      }
    }
  });

  it('n’existent pas sur les exercices en flux, où les lire coûte l’item suivant', () => {
    for (const module_ of EXERCISES.filter((e) => e.timed === 'continuous')) {
      expect(module_.hint, module_.id).toBeUndefined();
    }
  });
});

// Garde-fou du garde-fou : `newSeed` reste utilisé ailleurs, on s'assure juste
// que l'import ne casse pas la compilation du fichier de test.
void newSeed;

describe('limites officielles par question', () => {
  /**
   * Ce que ces contrôles protègent : s'entraîner sans la contrainte du test
   * donne un niveau qu'on ne retrouvera pas le jour J. Et à l'inverse, imposer
   * un chrono là où Pilotest n'en met pas inventerait une difficulté.
   */
  it('reprennent exactement les durées relevées chez Pilotest', () => {
    const officiel: Record<string, number> = {
      stacking: 10,
      'objects-3d': 10,
      'logic-series': 30,
      marbles: 40,
      'calc-grid': 45,
      'star-words': 50,
      cubes: 60,
      'sliding-shapes': 60,
    };
    for (const [id, sec] of Object.entries(officiel)) {
      const module_ = EXERCISES.find((e) => e.id === id);
      expect(module_, id).toBeDefined();
      expect(module_!.itemLimitSec, id).toBe(sec);
    }
  });

  it('n’en imposent AUCUNE là où le test se joue par séries', () => {
    // « Un mot sur deux », « Pair ou impair » et « Boîtes à mots » se jouent au
    // rythme du candidat, série par série. Un chrono par item y serait une
    // contrainte inventée.
    // L'anglais figure ici et non parmi les durées : son budget de 7 min 30
    // est GLOBAL pour 30 questions. Les 15 s souvent citées sont la moyenne,
    // et l'épreuve récompense précisément l'arbitrage entre questions.
    for (const id of ['word-skip', 'odd-even', 'word-boxes', 'english']) {
      expect(EXERCISES.find((e) => e.id === id)?.itemLimitSec, id).toBeUndefined();
    }
  });

  it('n’en imposent aucune sur les exercices en flux, qui portent leur propre horloge', () => {
    for (const module_ of EXERCISES.filter((e) => e.timed === 'continuous')) {
      expect(module_.itemLimitSec, module_.id).toBeUndefined();
    }
  });

  it('laissent toujours le temps d’une réponse : jamais sous la seconde', () => {
    for (const module_ of EXERCISES) {
      if (module_.itemLimitSec === undefined) continue;
      expect(module_.itemLimitSec, module_.id).toBeGreaterThanOrEqual(5);
    }
  });
});
