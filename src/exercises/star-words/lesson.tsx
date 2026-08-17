import type { Lesson } from '../../core/types';
import { StarSvg } from './StarSvg';
import { SLOT_LABELS } from './geometry';

/**
 * Leçon « Mots en étoile » : une étoile décortiquée mot par mot, pour ancrer la
 * méthode — ne lire que la 3e et la 5e lettre, partir de la lettre la plus rare,
 * puis propager autour du cycle A-D-C-F-B-E-A.
 *
 * Configuration de référence (vraiment générée, seed 7, niveau 3) :
 *   A = ORIGINE  B = INTERNE  C = NOURRIR  D = FERMIER  E = PEINTRE  F = SERRURE
 * Cases communes : A/D = I · A/E = I · B/E = T · B/F = R · C/F = U · C/D = R
 */
const WORDS = [
  'TERRINE',
  'NOURRIR',
  'INTERNE',
  'PEINTRE',
  'FERMIER',
  'SERRURE',
  'SARDINE',
  'ORIGINE',
  'VOISINE',
];

type P = (string | null)[];
const EMPTY: P = [null, null, null, null, null, null];
const RARE: P = [null, null, 'NOURRIR', null, null, 'SERRURE'];
const PROPAGATE: P = [null, null, 'NOURRIR', 'FERMIER', null, 'SERRURE'];
const CONFLICT: P = ['TERRINE', null, 'NOURRIR', 'FERMIER', null, 'SERRURE'];
const FULL: P = ['ORIGINE', 'INTERNE', 'NOURRIR', 'FERMIER', 'PEINTRE', 'SERRURE'];

const SCENES: Record<string, { placement: P; highlight?: number[] }> = {
  empty: { placement: EMPTY },
  shared: { placement: EMPTY, highlight: [0, 1, 2, 3, 4, 5] },
  rare: { placement: RARE, highlight: [4] },
  propagate: { placement: PROPAGATE, highlight: [5] },
  conflict: { placement: CONFLICT },
  full: { placement: FULL },
};

/** Le couple (3e, 5e lettre) — les deux seules lettres qui comptent. */
function pair(word: string): string {
  return `${word[2]}, ${word[4]}`;
}

function StarLesson({ scene }: { scene: string; stepIndex: number }) {
  const { placement, highlight } = SCENES[scene] ?? SCENES.empty;
  const placed = new Set(placement.filter((w): w is string => w !== null));

  return (
    <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-start">
      <StarSvg placement={placement} highlightIntersections={highlight} size={300} />
      <div className="grid w-full max-w-xs grid-cols-1 gap-1.5">
        {WORDS.map((w) => {
          const slot = placement.indexOf(w);
          return (
            <div
              key={w}
              className={`flex items-center justify-between rounded border px-2 py-1 font-mono text-sm ${
                placed.has(w)
                  ? 'border-sky-800 bg-sky-950/40 text-sky-200'
                  : 'border-zinc-800 bg-zinc-900 text-zinc-400'
              }`}
            >
              <span className="tracking-wider">{w}</span>
              <span className="text-xs text-zinc-500">
                ({pair(w)}){slot >= 0 && <span className="ml-2 text-sky-400">{SLOT_LABELS[slot]}</span>}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const lesson: Lesson = {
  title: 'Ne lire que deux lettres par mot',
  intro:
    'Neuf mots de 7 lettres, six emplacements dans l’étoile. On ne « cherche » pas quels mots vont ensemble : on lit deux lettres par mot et on laisse les contraintes désigner les gagnants. Cas réel décortiqué de bout en bout.',
  Scene: StarLesson,
  steps: [
    {
      scene: 'empty',
      title: 'Lire la structure avant les mots',
      observe:
        'Six segments de 7 cases, disposés en étoile de David. Chaque segment accueillera un mot. Les 9 mots proposés sont à droite — trois d’entre eux ne serviront jamais.',
      why: 'Comprendre la forme avant de lire les mots évite l’erreur classique : chercher un « thème » entre les mots. Il n’y en a aucun. Seule la géométrie compte.',
      action: 'Repère les 6 emplacements A à F : ce sont les 6 côtés des deux triangles.',
    },
    {
      scene: 'shared',
      title: 'Les 6 cases communes — les seules qui comptent',
      observe:
        'Les cases bleues sont les points où les deux triangles se croisent. Chacune appartient à DEUX mots à la fois, et ne peut porter qu’une seule lettre.',
      why: 'Sur un segment, ces croisements tombent toujours sur la 3e et la 5e case. Autrement dit : sur les 7 lettres d’un mot, seules la 3e et la 5e sont contraintes. Les cinq autres peuvent être n’importe quoi.',
      action:
        'Balaie les 9 mots UNE fois en notant leur couple (3e, 5e lettre) — c’est écrit à droite. Tu ne reliras plus jamais les mots.',
      pitfall:
        'Ne compte pas 2e et 4e : décalage d’une case et toute ta construction est fausse alors qu’elle te paraîtra cohérente.',
    },
    {
      scene: 'shared',
      title: 'Chercher la lettre la plus rare',
      observe:
        'Parcours les couples : (R,I) (U,R) (T,R) (I,T) (R,I) (R,U) (R,I) (I,I) (I,I). Le R et le I sont partout. Le U, lui, n’apparaît que deux fois : en 3e lettre de NOURRIR, et en 5e lettre de SERRURE.',
      why: 'Une lettre rare est une contrainte quasi unique : si une case commune vaut U, il n’existe qu’un seul mot pour chaque côté de cette case. Commencer par là, c’est démarrer sans jamais avoir à revenir en arrière.',
      action: 'Ne commence JAMAIS par un mot au hasard : commence par la lettre la plus rare des couples.',
    },
    {
      scene: 'rare',
      title: 'Poser les deux premiers mots',
      observe:
        'NOURRIR en C et SERRURE en F : leur case commune (entourée de cyan) porte le U, et une seule lettre y est écrite. Deux emplacements verrouillés.',
      why: 'Chaque mot posé impose immédiatement une lettre à son autre voisin. Une fois deux mots posés, la recherche change de nature : on ne cherche plus « un mot qui va », mais « un mot dont la 3e lettre est un R ». Un seul critère, donc une lecture rapide.',
      action:
        'Après chaque pose, regarde la case commune LIBRE du mot que tu viens de poser : c’est elle qui dicte le mot suivant.',
    },
    {
      scene: 'propagate',
      title: 'Propager autour du cycle',
      observe:
        'NOURRIR a un R en 5e lettre. Sa deuxième case commune (avec l’emplacement D) impose donc un R en 3e lettre du mot voisin : FERMIER convient.',
      why: 'Les emplacements forment un cycle A-D-C-F-B-E-A : chacun n’a que deux voisins. En tournant toujours dans le même sens, chaque nouveau mot n’a jamais plus d’une contrainte à respecter — sauf le dernier, qui doit refermer la boucle. C’est le contrôle final gratuit.',
      action: 'Tourne toujours dans le même sens. Ne saute pas d’un emplacement à l’autre au hasard.',
    },
    {
      scene: 'conflict',
      title: 'Le conflit : reconnaître l’erreur en une seconde',
      observe:
        'TERRINE posé en A. Sa case commune avec FERMIER devient rouge et affiche R/I : les deux mots exigent deux lettres différentes sur la MÊME case.',
      why: 'L’étoile fait la vérification à ta place. Tu n’as jamais besoin de recompter des lettres : une case rouge = mot à retirer. TERRINE a (R,I) là où il faudrait (I,·) — c’est un distracteur.',
      pitfall:
        'L’erreur n’est pas toujours le dernier mot posé, mais commence par lui : c’est celui dont tu as le moins de raisons d’être sûr.',
      action: 'Retire TERRINE et cherche un mot dont la 3e lettre est un I : ORIGINE (I,I) ou VOISINE (I,I).',
    },
    {
      scene: 'full',
      title: 'Refermer et valider — sans chercher « la » solution',
      observe:
        'Les 6 cases communes sont bleues et cohérentes : I, I, T, R, U, R. Il reste TERRINE, SARDINE et VOISINE — les trois distracteurs.',
      why:
        'La consigne officielle le dit : la correction proposée n’est qu’UNE solution parmi d’autres. Ici VOISINE (I,I) pourrait remplacer ORIGINE (I,I) et la configuration resterait juste. S’il n’y a pas d’erreur, le point est pour toi.',
      action:
        'Dès que les 6 cases communes sont cohérentes, valide (Entrée) et passe à la question suivante. 50 s par question : ne relis pas.',
    },
  ],
};
