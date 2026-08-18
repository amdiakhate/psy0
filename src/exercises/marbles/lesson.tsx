import type { Lesson } from '../../core/types';
import { TubesSvg } from './TubesSvg';
import { MoveAnimation } from './MoveAnimation';
import type { Move } from './MoveAnimation';
import type { State } from './model';

/**
 * Leçon « Billes » : un cas concret décortiqué déplacement par déplacement,
 * pour ancrer le comptage plancher + billes bloquantes.
 *
 * Billes numérotées : 0 = bleu, 1 = jaune, 2 = violet — le NUMÉRO identifie la bille.
 * Départ  : [0, 1, 2] | [] | []      (tout empilé à gauche)
 * Arrivée : [0] | [1] | [2]
 * Solution optimale : bille 2 → droite, bille 1 → milieu = 2 déplacements.
 */
const START: State = [[0, 1, 2], [], []];
const GOAL: State = [[0], [1], [2]];

const SCENES: Record<string, State> = {
  start: START,
  goal: GOAL,
  step1: [[0, 1], [], [2]],
  step2: [[0], [1], [2]],
};

/** La solution optimale, jouée coup par coup. Les états sont déduits, pas écrits. */
const SOLUTION: Move[] = [
  { from: 0, to: 2, note: 'Coup 1 — la bille 2 est SUR LE DESSUS : elle part la première, vers le tube de droite.' },
  { from: 0, to: 1, note: 'Coup 2 — la bille 1 est maintenant accessible : elle va au milieu. Terminé en 2 coups.' },
];

function MarblesScene({ scene }: { scene: string; stepIndex: number }) {
  if (scene === 'play') return <MoveAnimation start={START} moves={SOLUTION} />;
  if (scene === 'both') {
    return (
      <div className="flex flex-col items-center gap-2">
        <TubesSvg state={START} label="Départ" size={0.85} />
        <span className="text-xl text-zinc-600">↓</span>
        <TubesSvg state={GOAL} label="Arrivée" size={0.85} />
      </div>
    );
  }
  const state = SCENES[scene] ?? START;
  const label =
    scene === 'start' ? 'Départ' : scene === 'goal' ? 'Arrivée' : scene === 'step1' ? 'Après 1 déplacement' : 'Après 2 déplacements';
  return <TubesSvg state={state} label={label} />;
}

export const lesson: Lesson = {
  title: 'Compter le minimum de déplacements',
  intro:
    'On ne « résout » pas le puzzle : on COMPTE. Cas d’école décortiqué — tube gauche plein (billes 0, 1, 2 du fond vers le haut), et il faut une bille par tube à l’arrivée.',
  Scene: MarblesScene,
  steps: [
    {
      scene: 'play',
      title: 'Un déplacement, c’est quoi exactement',
      observe:
        "La solution se joue sous tes yeux : une bille se prend SUR LE DESSUS d'un tube, survole, et se pose SUR LE DESSUS d'un autre. Jamais au milieu d'une pile, jamais deux à la fois.",
      why: "Toute la difficulté de l'exercice tient dans cette seule règle. Une bille bien placée mais COIFFÉE par une autre n'est pas accessible : il faudra d'abord dégager celle du dessus. C'est de là que viennent les coups « perdus » que le comptage doit prévoir.",
      action:
        'Mets pause en plein vol et demande-toi : quelles billes étaient accessibles à cet instant ? Ce sont uniquement les sommets de pile.',
    },
    {
      scene: 'both',
      title: 'Lire les deux dispositions',
      observe:
        'Départ : les 3 billes empilées dans le tube de gauche — 0 au fond, 1 au milieu, 2 sur le dessus. Arrivée : 0 à gauche, 1 au milieu, 2 à droite.',
      why: 'Toujours lire DU FOND VERS LE HAUT : c’est l’ordre dans lequel les billes ont été posées, et donc l’inverse de l’ordre dans lequel on peut les reprendre.',
      action: 'Repère d’abord la position finale de chaque bille NUMÉROTÉE avant de bouger quoi que ce soit.',
    },
    {
      scene: 'start',
      title: 'Étape 1 — la bille déjà bien placée',
      observe:
        'La bille 0 est au fond du tube de gauche… et elle doit rester dans le tube de gauche. Elle est déjà à sa place.',
      why: 'Une bille au fond, déjà à sa place finale, ne bougera JAMAIS. On peut l’oublier complètement — elle ne coûte rien.',
      pitfall:
        'Ne compte pas cette bille dans ton total. L’erreur classique est de vouloir « tout démonter » alors que le fond est souvent déjà correct.',
    },
    {
      scene: 'start',
      title: 'Étape 2 — compter les billes mal placées (le plancher)',
      observe:
        'La bille 1 est dans le tube de gauche mais doit aller au milieu → mal placée. La bille 2 est à gauche mais doit aller à droite → mal placée. Total : 2 billes mal placées.',
      why: 'Chaque bille mal placée coûte AU MINIMUM un déplacement. Ce compte est ton plancher : la réponse ne peut pas être inférieure à 2.',
      action: 'Compte les billes mal placées avant toute simulation. C’est ta réponse provisoire.',
    },
    {
      scene: 'start',
      title: 'Étape 3 — chercher les billes bloquantes',
      observe:
        'Y a-t-il une bille BIEN placée posée SUR une bille mal placée ? Ici non : la bille 0, bien placée, est en dessous et non au-dessus.',
      why: 'Une bille bien placée mais posée par-dessus une bille à extraire devrait être enlevée puis remise : elle coûterait 2 déplacements au lieu de 0. C’est ce qui fait dépasser le plancher.',
      pitfall:
        'C’est LE point que tout le monde rate. Si la bille 0 avait été sur le dessus, la réponse aurait été 4 et non 2.',
    },
    {
      scene: 'step1',
      title: 'Étape 4 — premier déplacement : la bille 2',
      observe:
        'La bille 2 est sur le dessus, donc immédiatement disponible. On la pose sur le tube de droite, qui est vide.',
      why: 'On commence toujours par la bille du DESSUS : c’est la seule qu’on ait le droit de prendre. Et on l’envoie directement à sa destination finale — pas de détour.',
      action: 'Premier déplacement : bille 2 → tube de droite. Total : 1.',
    },
    {
      scene: 'step2',
      title: 'Étape 5 — deuxième déplacement : la bille 1',
      observe:
        'La bille 1 est maintenant sur le dessus du tube de gauche. On la pose au milieu (capacité 2, il reste de la place).',
      why: 'On vérifie la capacité AVANT de poser : le tube du milieu n’accepte que 2 billes. Ici il est vide, donc aucun problème.',
      action: 'Deuxième déplacement : bille 1 → tube du milieu. Total : 2. La disposition d’arrivée est atteinte.',
    },
    {
      scene: 'goal',
      title: 'La réponse : 2',
      observe:
        'Plancher (2 billes mal placées) + aucune bille bloquante = 2 déplacements. La simulation confirme le comptage.',
      why: 'La méthode complète tient en trois gestes : compter les mal placées, ajouter 2 par bille bloquante, puis vérifier d’une simulation rapide. Tu n’as jamais besoin d’explorer plusieurs plans.',
      action: 'Clique 2 et passe à la question suivante — sans chercher de plan plus court : il n’y en a pas.',
    },
  ],
};
