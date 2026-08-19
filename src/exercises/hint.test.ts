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
