import type { Lesson } from '../../core/types';
import { TubesSvg } from './TubesSvg';
import type { State } from './model';

/**
 * Leçon « Billes » : un cas concret décortiqué déplacement par déplacement,
 * pour ancrer le comptage plancher + billes bloquantes.
 *
 * Couleurs : 0 = rouge, 1 = bleu, 2 = vert.
 * Départ  : [rouge, bleu, vert] | [] | []      (tout empilé à gauche)
 * Arrivée : [rouge] | [bleu] | [vert]
 * Solution optimale : vert→droite, bleu→milieu = 2 déplacements.
 */
const START: State = [[0, 1, 2], [], []];
const GOAL: State = [[0], [1], [2]];

const SCENES: Record<string, State> = {
  start: START,
  goal: GOAL,
  step1: [[0, 1], [], [2]],
  step2: [[0], [1], [2]],
};

function MarblesScene({ scene }: { scene: string; stepIndex: number }) {
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
    'On ne « résout » pas le puzzle : on COMPTE. Cas d’école décortiqué — tube gauche plein (rouge, bleu, vert du fond vers le haut), et il faut une bille par tube à l’arrivée.',
  Scene: MarblesScene,
  steps: [
    {
      scene: 'both',
      title: 'Lire les deux dispositions',
      observe:
        'Départ : les 3 billes empilées dans le tube de gauche — rouge au fond, bleu au milieu, vert sur le dessus. Arrivée : rouge à gauche, bleu au milieu, vert à droite.',
      why: 'Toujours lire DU FOND VERS LE HAUT : c’est l’ordre dans lequel les billes ont été posées, et donc l’inverse de l’ordre dans lequel on peut les reprendre.',
      action: 'Repère d’abord la position finale de chaque couleur avant de bouger quoi que ce soit.',
    },
    {
      scene: 'start',
      title: 'Étape 1 — la bille déjà bien placée',
      observe:
        'La bille ROUGE est au fond du tube de gauche… et elle doit rester dans le tube de gauche. Elle est déjà à sa place.',
      why: 'Une bille au fond, déjà à sa place finale, ne bougera JAMAIS. On peut l’oublier complètement — elle ne coûte rien.',
      pitfall:
        'Ne compte pas cette bille dans ton total. L’erreur classique est de vouloir « tout démonter » alors que le fond est souvent déjà correct.',
    },
    {
      scene: 'start',
      title: 'Étape 2 — compter les billes mal placées (le plancher)',
      observe:
        'Le bleu est dans le tube de gauche mais doit aller au milieu → mal placé. Le vert est à gauche mais doit aller à droite → mal placé. Total : 2 billes mal placées.',
      why: 'Chaque bille mal placée coûte AU MINIMUM un déplacement. Ce compte est ton plancher : la réponse ne peut pas être inférieure à 2.',
      action: 'Compte les billes mal placées avant toute simulation. C’est ta réponse provisoire.',
    },
    {
      scene: 'start',
      title: 'Étape 3 — chercher les billes bloquantes',
      observe:
        'Y a-t-il une bille BIEN placée posée SUR une bille mal placée ? Ici non : le rouge bien placé est en dessous, pas au-dessus.',
      why: 'Une bille bien placée mais posée par-dessus une bille à extraire devrait être enlevée puis remise : elle coûterait 2 déplacements au lieu de 0. C’est ce qui fait dépasser le plancher.',
      pitfall:
        'C’est LE point que tout le monde rate. Si le rouge avait été sur le dessus, la réponse aurait été 4 et non 2.',
    },
    {
      scene: 'step1',
      title: 'Étape 4 — premier déplacement : le vert',
      observe:
        'Le vert est sur le dessus, donc immédiatement disponible. On le pose sur le tube de droite, qui est vide.',
      why: 'On commence toujours par la bille du DESSUS : c’est la seule qu’on ait le droit de prendre. Et on l’envoie directement à sa destination finale — pas de détour.',
      action: 'Premier déplacement : vert → tube de droite. Total : 1.',
    },
    {
      scene: 'step2',
      title: 'Étape 5 — deuxième déplacement : le bleu',
      observe:
        'Le bleu est maintenant sur le dessus du tube de gauche. On le pose au milieu (capacité 2, il reste de la place).',
      why: 'On vérifie la capacité AVANT de poser : le tube du milieu n’accepte que 2 billes. Ici il est vide, donc aucun problème.',
      action: 'Deuxième déplacement : bleu → tube du milieu. Total : 2. La disposition d’arrivée est atteinte.',
    },
    {
      scene: 'goal',
      title: 'La réponse : 2',
      observe:
        'Plancher (2 billes mal placées) + aucune bille bloquante = 2 déplacements. La simulation confirme le comptage.',
      why: 'La méthode complète tient en trois gestes : compter les mal placées, ajouter 2 par bille bloquante, puis vérifier d’une simulation rapide. Tu n’as jamais besoin d’explorer plusieurs plans.',
      action: 'Tape 2 et passe à la question suivante — sans chercher de plan plus court : il n’y en a pas.',
    },
  ],
};
