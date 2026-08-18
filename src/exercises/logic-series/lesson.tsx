import type { Lesson } from '../../core/types';
import type { FigDesc } from './generator';
import { cellDesc } from './generator';
import { FigSvg } from './LogicSeriesExercise';

/**
 * Leçon « Séries logiques » : la hiérarchie de tests, format par format, et la
 * décision stratégique imposée par le barème (−1/3 pour une mauvaise réponse).
 *
 * Les séries montrées sont de vrais items générés :
 *   numérique   — seed 1, niveau 3 : 50 56 47 53 44 → 50 (alternance +6 / −9)
 *   lettres     — seed 4, niveau 2 : F K P U → Z (+5 crans)
 *   entrelacée  — seed 8, niveau 4 : 21 18 29 23 → 37 (deux suites, +8 et +5)
 *   figurale    — seed 5, niveau 3 : rotation (0°/45°/90°) + nombre (1/2/3)
 */

function Row({
  terms,
  notes,
  highlight = [],
}: {
  terms: (string | number)[];
  notes?: (string | null)[];
  highlight?: number[];
}) {
  return (
    <div className="flex items-end gap-3">
      {terms.map((t, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <span
            className={`rounded-lg border px-3 py-2 font-mono text-2xl font-bold tabular-nums ${
              highlight.includes(i)
                ? 'border-sky-500 bg-sky-950/40 text-sky-200'
                : 'border-zinc-700 bg-zinc-900 text-zinc-100'
            }`}
          >
            {t}
          </span>
          {notes && <span className="font-mono text-xs text-amber-400">{notes[i] ?? ''}</span>}
        </div>
      ))}
      <span className="rounded-lg border border-sky-700 bg-zinc-900 px-3 py-2 font-mono text-2xl font-bold text-sky-400">
        ?
      </span>
    </div>
  );
}

const FIG_RULE = {
  attrs: ['rotation', 'count'] as ('rotation' | 'count')[],
  base: { shape: 'triangle', count: 2, rotation: 0, filled: false, size: 'l' } as FigDesc,
};

function FigRow({ withAnswer = false }: { withAnswer?: boolean }) {
  const cells = Array.from({ length: 4 }, (_, i) => cellDesc(FIG_RULE, i));
  return (
    <div className="flex items-center gap-2">
      {cells.map((c, i) => (
        <div
          key={i}
          className="flex h-20 w-20 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900"
        >
          <FigSvg desc={c} size={64} />
        </div>
      ))}
      <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-sky-700 bg-zinc-950">
        {withAnswer ? (
          <FigSvg desc={cellDesc(FIG_RULE, 4)} size={64} />
        ) : (
          <span className="text-3xl font-bold text-sky-400">?</span>
        )}
      </div>
    </div>
  );
}

function LogicScene({ scene }: { scene: string; stepIndex: number }) {
  switch (scene) {
    case 'penalty':
      return (
        <div className="w-full max-w-md space-y-3 text-center">
          <div className="rounded-lg border border-green-900/60 bg-green-950/20 px-4 py-3">
            <p className="text-2xl font-bold text-green-400">+1</p>
            <p className="text-sm text-zinc-400">bonne réponse</p>
          </div>
          <div className="rounded-lg border border-red-900/60 bg-red-950/20 px-4 py-3">
            <p className="text-2xl font-bold text-red-400">−1/3</p>
            <p className="text-sm text-zinc-400">mauvaise réponse</p>
          </div>
          <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3">
            <p className="text-2xl font-bold text-zinc-300">0</p>
            <p className="text-sm text-zinc-400">question laissée sans réponse</p>
          </div>
          <p className="font-mono text-sm text-amber-400">
            hasard : (1/4 × 1) − (3/4 × 1/3) = 0
          </p>
        </div>
      );
    case 'numeric-read':
      return <Row terms={[50, 56, 47, 53, 44]} />;
    case 'numeric-diffs':
      return <Row terms={[50, 56, 47, 53, 44]} notes={[null, '+6', '−9', '+6', '−9']} />;
    case 'letters-read':
      return <Row terms={['F', 'K', 'P', 'U']} />;
    case 'letters-rank':
      return <Row terms={['F', 'K', 'P', 'U']} notes={['6', '11', '16', '21']} />;
    case 'interleaved':
      return <Row terms={[21, 18, 29, 23]} highlight={[0, 2]} notes={['A', 'B', 'A', 'B']} />;
    case 'figural':
      return <FigRow />;
    case 'figural-answer':
      return <FigRow withAnswer />;
    default:
      return <Row terms={[50, 56, 47, 53, 44]} />;
  }
}

export const lesson: Lesson = {
  reality: {
    atFirst:
      "Les premières séries, tu chercheras la règle « en regardant » la suite, et tu ne trouveras rien sur la moitié d’entre elles. Le passage aux écarts n’est pas naturel : c’est un geste à installer de force, et il change tout dès qu’il l’est.",
    budget:
      "30 s par série suppose la hiérarchie de tests appliquée dans l’ordre, sans hésiter sur l’ordre. Au début, chaque test te coûtera 8 à 10 s au lieu de 3 : tu n’en feras que deux. C’est suffisant pour la majorité des séries — les tests 3 et 4 servent le tiers restant.",
    fallback: [
      "Écarts illisibles : teste une position sur deux (deux suites entrelacées). C’est 3 secondes et ça débloque la moitié des séries qui résistent.",
      "Toujours rien : élimine ce que tu peux justifier — une option qui recopie le dernier terme, une qui applique le mauvais signe. Dès qu’UNE option tombe pour une vraie raison, répondre devient rentable.",
      "Rien d’éliminable : abstiens-toi. C’est une décision, pas un renoncement.",
    ],
    recover:
      "Chaque série est indépendante. Le danger est cumulatif et de fin d’épreuve : c’est répondre au hasard aux cinq dernières parce que le temps presse. Ces cinq-là coûtent plus qu’elles ne rapportent.",
    bail:
      "Le barème rend l’abstention rationnelle : −1/3 par erreur, 0 pour un blanc. Répondre au hasard entre quatre options a une espérance NULLE et ajoute du bruit. Règle unique : je réponds si j’ai éliminé au moins une option par raisonnement — sinon je passe, sans culpabilité.",
  },
  title: 'La hiérarchie de tests (et quand ne pas répondre)',
  intro:
    'Quinze séries, 30 s chacune, quatre options à chaque fois. Une bonne réponse vaut +1, une mauvaise −1/3 : la première compétence de cette épreuve n’est pas de trouver la règle, c’est de savoir quand renoncer. On voit d’abord le barème, puis la méthode format par format.',
  Scene: LogicScene,
  steps: [
    {
      scene: 'penalty',
      title: 'Le barème commande la stratégie',
      observe:
        'Bonne réponse +1, mauvaise −1/3, abstention 0. Répondre au hasard entre 4 options a une espérance exactement nulle : en moyenne, une bonne (+1) pour trois mauvaises (−1).',
      why:
        'Le hasard ne rapporte rien mais ajoute du bruit : il peut faire chuter ton score autant que le faire monter. En revanche, dès que tu élimines UNE option pour une vraie raison, l’espérance devient positive — c’est là que répondre devient rentable.',
      action: 'Règle de décision : je réponds si j’ai éliminé au moins une option par raisonnement. Sinon, je passe.',
      pitfall:
        'L’erreur qui coûte le plus cher n’est pas de rater une série difficile : c’est de répondre au hasard aux cinq dernières parce que le temps presse.',
    },
    {
      scene: 'numeric-read',
      title: 'Nombres — ne « regarde » pas la suite, écris les écarts',
      observe:
        'Cinq nombres : 50, 56, 47, 53, 44. Aucune progression évidente : ça monte, ça descend, ça remonte.',
      why:
        'Une suite qui zigzague ne s’analyse jamais globalement. Le premier geste, systématique, est de calculer les écarts entre termes consécutifs — c’est le test n°1 de la hiérarchie, et la matière première des trois suivants.',
      action: 'Premier réflexe, toujours le même : passer aux différences.',
    },
    {
      scene: 'numeric-diffs',
      title: 'Le motif apparaît dans les écarts',
      observe: 'Les écarts : +6, −9, +6, −9. Une alternance parfaite de deux pas.',
      why:
        'Quatre écarts sur une série de 5 items, c’est assez pour trancher : le motif se répète deux fois entières. Sur une série de 4 items tu n’aurais que trois écarts — le doute serait légitime, et il faudrait vérifier deux fois.',
      action: 'Le prochain pas est un +6 : 44 + 6 = 50. Calcule ta réponse AVANT de lire les options.',
      pitfall:
        'Les distracteurs sont fabriqués à partir de tes erreurs probables : 44 (recopier le dernier terme) et 35 (appliquer −9 au lieu de +6). Si ton résultat tombe pile sur l’un d’eux, recompte.',
    },
    {
      scene: 'letters-rank',
      title: 'Lettres — des nombres déguisés',
      observe:
        'F, K, P, U. Converti en rangs alphabétiques : 6, 11, 16, 21. Les écarts sont constants : +5.',
      why:
        'Il n’y a rien de « verbal » dans une série de lettres : on convertit en rangs et on applique exactement la même hiérarchie de tests que pour les nombres. Les jalons A=1, E=5, J=10, O=15, T=20, Z=26 permettent de convertir en moins de deux secondes.',
      action: '21 + 5 = 26 → Z. (L’exemple officiel Pilotest est identique, avec un pas de 7 : N → U.)',
      pitfall:
        'L’alphabet boucle : 27 n’existe pas, c’est A. Une série qui « dépasse » Z n’est pas cassée, elle repart au début.',
    },
    {
      scene: 'interleaved',
      title: 'Quand les écarts ne disent rien : une position sur deux',
      observe:
        '21, 18, 29, 23 — les écarts (−3, +11, −6) n’ont aucun motif. En lisant une position sur deux : 21, 29 (suite A, +8) et 18, 23 (suite B, +5).',
      why:
        'Deux suites entrelacées produisent des écarts globaux incohérents : c’est leur signature. Ce test coûte 3 secondes et débloque la moitié des séries qui « résistent » — en nombres comme en lettres.',
      action:
        'La case manquante est en 5e position, donc dans la suite A : 21, 29, puis 37. Réponse : 37.',
      pitfall:
        'Sur une série de 4 items, chaque sous-suite n’a que deux termes : un seul écart. Sois prudent — c’est le cas où une deuxième lecture est indispensable.',
    },
    {
      scene: 'figural',
      title: 'Figures — un attribut à la fois',
      observe:
        'Quatre figures. Ce qui NE change pas : la forme (triangle), la taille (grande), le remplissage (vide). Ce qui change : le nombre (1, 2, 3, 1…) et la rotation (0°, 45°, 90°, 0°…).',
      why:
        'Une figure porte cinq attributs indépendants — forme, nombre, taille, rotation, remplissage. Les traiter ensemble est impossible ; les traiter un par un est trivial. Chaque attribut a son propre cycle, souvent 3 pour le nombre, la taille et la rotation, 2 pour le remplissage.',
      action:
        'Passe les cinq attributs en revue dans le même ordre à chaque fois. Prédis la figure manquante attribut par attribut, sans regarder les options.',
      pitfall:
        'La rotation d’une forme symétrique est invisible : c’est pour ça que les triangles sont utilisés. Ne conclus jamais « rien ne tourne » sans avoir regardé un sommet précis.',
    },
    {
      scene: 'figural-answer',
      title: 'Comparer sa prédiction, pas chercher la ressemblance',
      observe:
        'Prédiction : 2 triangles, inclinés à 45°, vides, grands. Une seule option coche les quatre attributs — les autres n’en changent qu’un.',
      why:
        'Les distracteurs sont construits en mutant UN attribut de la bonne réponse. « Celle qui ressemble le plus » est donc exactement le piège : trois options ressemblent beaucoup. Seule la comparaison attribut par attribut tranche.',
      action:
        'Coche, valide, passe. Et si aucune option ne correspond à ta prédiction : ta règle est fausse — ne prends pas la plus proche, reprends ou passe.',
    },
  ],
};
