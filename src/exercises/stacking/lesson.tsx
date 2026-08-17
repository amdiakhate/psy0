import type { Lesson } from '../../core/types';
import { PolycubeSvg, commonWorldSize } from './PolycubeSvg';
import { SHAPES } from './data';
import { ROTATIONS, mirror, normalize, rotate } from './model';
import type { Shape } from './model';

/**
 * Leçon « Empilements » : un cas construit à la main pour que chaque difficulté
 * soit isolée. Polycube de base = `bosse-5` (bras de 3 cubes, un cube posé sur
 * une extrémité, un cube en saillie sur le cube du milieu).
 *
 *   empilement 1 : la forme telle quelle ;
 *   empilement 2 : son MIROIR, dessiné dans la MÊME orientation → le faux jumeau,
 *                  et la réponse de l'item ;
 *   empilement 3 : la forme tournée d'un quart de tour (ROTATIONS[14]).
 *
 * La paire à trouver est donc 1 + 3, alors que l'œil apparie spontanément 1 + 2.
 */
const BASE = SHAPES.find((s) => s.name === 'bosse-5')!.cells;

const STACK_1: Shape = normalize(BASE);
const STACK_2: Shape = mirror(BASE);
const STACK_3: Shape = rotate(BASE, ROTATIONS[14]);

const STACKS: Shape[] = [STACK_1, STACK_2, STACK_3];
const ANSWER = 1; // index 0-2 → empilement 2
const WORLD = commonWorldSize(STACKS);

/** Signature de chiralité de chaque empilement (voir l'étape 3). */
const HANDS = ['gauche', 'droite', 'gauche'];

function Row({
  accent = [],
  captions,
  px = 150,
}: {
  accent?: number[];
  captions?: string[];
  px?: number;
}) {
  return (
    <div className="flex flex-wrap items-start justify-center gap-5">
      {STACKS.map((shape, i) => (
        <div key={i} className="flex flex-col items-center gap-1.5">
          <div
            className={`rounded-xl border-2 bg-zinc-900/60 p-1.5 ${
              accent.includes(i) ? 'border-sky-500' : 'border-zinc-800'
            }`}
          >
            <PolycubeSvg shape={shape} world={WORLD} px={px} accent={accent.includes(i)} />
          </div>
          <span className="rounded border border-zinc-600 bg-zinc-800 px-2.5 py-0.5 font-mono text-sm text-sky-400">
            {i + 1}
          </span>
          {captions && (
            <span
              className={`max-w-[150px] text-center text-xs ${
                captions[i] === HANDS[ANSWER] ? 'text-red-400' : 'text-green-400'
              }`}
            >
              main {captions[i]}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function StackingScene({ scene }: { scene: string; stepIndex: number }) {
  if (scene === 'anatomy') {
    return (
      <div className="flex flex-col items-center gap-2">
        <p className="text-xs uppercase tracking-widest text-zinc-500">Empilement 1, en grand</p>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-2">
          <PolycubeSvg shape={STACK_1} world={WORLD} px={280} />
        </div>
        <p className="max-w-md text-center text-xs text-zinc-400">
          Un bras de 3 cubes · un cube posé sur une extrémité du bras · un cube en saillie sur le
          cube du milieu, tourné vers l'avant-gauche.
        </p>
      </div>
    );
  }
  if (scene === 'twins') return <Row accent={[0, 1]} />;
  if (scene === 'hands') return <Row captions={HANDS} />;
  if (scene === 'answer') return <Row accent={[ANSWER]} captions={HANDS} />;
  return <Row />;
}

export const lesson: Lesson = {
  title: 'Trouver le symétrique en cherchant la paire',
  intro:
    "Trois empilements de 5 cubes, 10 secondes. Deux sont le même objet à une rotation près, le troisième a EN PLUS subi une symétrie — c'est lui qu'il faut désigner. La leçon décortique un cas piégé : deux des figures se ressemblent énormément, et ce ne sont pas les bonnes.",
  Scene: StackingScene,
  steps: [
    {
      scene: 'all',
      title: 'Le dispositif',
      observe:
        "Trois empilements des mêmes 5 cubes, numérotés 1, 2, 3. Aucun n'est étiqueté, aucun n'est présenté « à l'endroit ».",
      why: "Tu ne cherches PAS le symétrique : tu cherches la PAIRE. Deux figures sont le même objet tourné ; dès que tu les as appariées, la troisième est la réponse, sans une seule rotation mentale de plus. Chercher directement « celui qui a subi la symétrie » revient à comparer trois figures deux à deux, soit trois fois plus de travail.",
      action:
        "Avant tout, compte les cubes des trois figures : 5 partout. S'ils diffèrent, tu as mal lu une figure — relis-la avant de raisonner.",
    },
    {
      scene: 'anatomy',
      title: 'Étape 1 — nommer les pièces de la figure',
      observe:
        "Un bras droit de 3 cubes. Un cube posé SUR une extrémité de ce bras. Un cube en saillie sur le cube du MILIEU, tourné vers l'avant.",
      why: "Trois éléments nommés, c'est tout ce que tu liras de la figure. Le reste des cubes ne porte aucune information. À 6 ou 7 cubes, cette lecture sélective est ce qui fait tenir dans les 10 secondes : lire l'empilement entier coûte 20 s et n'ajoute rien.",
      pitfall:
        "En isométrique, un cube « au-dessus » et un cube « derrière » se dessinent presque au même endroit. Tranche par la couleur des faces : dessus clair, avant-gauche moyen, avant-droit sombre. La face te donne l'axe.",
    },
    {
      scene: 'anatomy',
      title: 'Étape 2 — la signature de chiralité',
      observe:
        "La saillie (le cube qui sort du milieu du bras) sert de poignée. Tourne mentalement la figure pour que cette saillie pointe VERS TOI, le bras à l'horizontale.",
      why: "Dans cette position imposée, le cube du dessus tombe soit à GAUCHE, soit à DROITE. Cette main est invariante par rotation — tu peux tourner la figure comme tu veux, elle ne changera pas — et elle s'inverse exactement par symétrie. C'est le seul caractère qui distingue l'original du miroir.",
      action:
        "Trois gestes, 1 seconde par figure : saillie vers toi → bras horizontal → le cube du dessus est à gauche ou à droite. Ici, sur l'empilement 1 : à gauche.",
    },
    {
      scene: 'twins',
      title: 'Étape 3 — le faux jumeau',
      observe:
        "Les empilements 1 et 2 sont dessinés dans la même orientation : même bras, même saillie au milieu, même inclinaison. Seule l'extrémité qui porte le cube du dessus change de bout.",
      why: "Deux figures qui se ressemblent BEAUCOUP sont à contrôler en priorité, jamais à apparier d'office. Ici, la ressemblance ne vient pas d'une rotation nulle : elle vient du fait que le miroir a été dessiné dans la même orientation que l'original.",
      pitfall:
        "Le réflexe est d'apparier 1 et 2 « puisqu'ils sont pareils », donc de répondre 3. C'est faux, et c'est l'erreur la plus fréquente de l'exercice. L'étrangeté visuelle ne mesure que l'écart d'orientation, jamais la symétrie.",
    },
    {
      scene: 'hands',
      title: 'Étape 4 — comparer des mots, pas des images',
      observe:
        "Les trois signatures : empilement 1 → main gauche, empilement 2 → main droite, empilement 3 → main gauche. Deux mots identiques, un mot isolé.",
      why: "Convertir chaque figure en un mot AVANT toute comparaison évite de perdre le fil : si tu tournes la figure 1, puis la 2, puis la 3, tu as oublié l'orientation de la première quand tu arrives à la troisième. Trois mots tiennent en mémoire, trois images non.",
      action:
        "Formule les trois signatures d'affilée, sans revenir en arrière sur la figure précédente. 4 secondes au total.",
    },
    {
      scene: 'answer',
      title: 'La réponse : empilement 2',
      observe:
        "Les empilements 1 et 3 partagent la même main : ils sont le même objet, séparés d'un quart de tour. Le 2 est de main opposée : c'est lui qui a subi la symétrie.",
      why: "Contre-épreuve unique, 3 secondes : superpose mentalement les bras de 1 et 3 ; si les saillies et les cubes du dessus tombent alors du même côté, la paire est bonne, donc le troisième est bien le symétrique. Aucune autre vérification n'est nécessaire.",
      action:
        "Budget 10 s : 4 s pour les trois signatures, 3 s pour apparier, 3 s de contre-épreuve. Dès que deux figures partagent la même main, réponds — ne contrôle pas la troisième, elle ne t'apprendra rien.",
    },
  ],
};
