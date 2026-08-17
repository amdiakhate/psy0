import type { Lesson } from '../../core/types';

/**
 * Leçon « Psychomoteur » : les trois tâches présentées une par une,
 * puis assemblées, avec la boucle de balayage à automatiser.
 */
type Scene = 'circle-ok' | 'circle-ko' | 'circle-change' | 'shapes-match' | 'shapes-diff' | 'calc-wrong' | 'all';

function Shape({ name, size = 48, color = '#e4e4e7' }: { name: string; size?: number; color?: string }) {
  const paths: Record<string, string> = {
    rond: 'M50,12 A38,38 0 1,1 49.9,12 Z',
    etoile: 'M50,10 L61,40 L93,40 L67,59 L77,89 L50,71 L23,89 L33,59 L7,40 L39,40 Z',
    carre: 'M16,16 H84 V84 H16 Z',
  };
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <path d={paths[name]} fill={color} />
    </svg>
  );
}

function PsychoScene({ scene }: { scene: string; stepIndex: number }) {
  const s = scene as Scene;
  const showVert = s === 'circle-ok' || s === 'all' || s === 'shapes-match' || s === 'shapes-diff' || s === 'calc-wrong';
  const inCircle = s === 'shapes-match' || s === 'all' ? 'etoile' : s === 'shapes-diff' ? 'carre' : 'rond';
  const left = s === 'shapes-match' || s === 'all' ? 'etoile' : s === 'shapes-diff' ? 'etoile' : 'rond';
  const arrow = s === 'circle-change' ? '→' : '↑';

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-6">
        {/* Encart pointillé */}
        <div className="flex h-24 w-24 items-center justify-center rounded-xl border-2 border-dashed border-zinc-600 bg-zinc-900">
          <Shape name={left} color="#a1a1aa" />
        </div>
        {/* Le cercle */}
        <div className="relative flex h-32 w-32 items-center justify-center">
          <div
            className={`flex h-28 w-28 items-center justify-center rounded-full border-4 bg-zinc-900 ${
              showVert ? 'border-green-500' : 'border-red-500'
            }`}
          >
            <Shape name={inCircle} size={56} />
          </div>
          {showVert && <span className="absolute -right-5 text-3xl font-bold text-green-500">&gt;</span>}
          <span
            className={`absolute font-mono text-2xl text-sky-400 ${
              arrow === '↑' ? '-top-7' : '-right-8'
            }`}
          >
            {arrow}
          </span>
        </div>
      </div>
      {/* Le calcul entouré */}
      <div
        className={`rounded-full border-2 px-6 py-1.5 ${
          s === 'calc-wrong' ? 'border-red-500 bg-red-950/30' : 'border-amber-500 bg-amber-950/20'
        }`}
      >
        <span className="font-mono text-xl tabular-nums text-zinc-100">
          {s === 'calc-wrong' ? '47 + 28 = 78' : '47 + 28 = 75'}
        </span>
      </div>
      <div className="flex gap-4 text-xs text-zinc-500">
        <span>① flèche maintenue</span>
        <span>② Espace si formes identiques</span>
        <span>③ F si calcul faux</span>
      </div>
    </div>
  );
}

export const lesson: Lesson = {
  title: 'Mener trois tâches de front',
  intro:
    'C’est l’épreuve reine du PSY0, et la consigne officielle est explicite : les trois tâches sont de MÊME importance. On les voit une par une, puis on assemble — et on installe la boucle de balayage qui fait tout le score.',
  Scene: PsychoScene,
  steps: [
    {
      scene: 'circle-ok',
      title: 'Tâche ① — suivre le cercle',
      observe:
        'Le cercle se déplace dans une direction (ici vers le haut). Tu MAINTIENS la flèche correspondante. Quand c’est correct, un « > » vert apparaît sur le côté du cercle.',
      why: 'C’est la seule tâche CONTINUE des trois : elle est échantillonnée en permanence. Le « > » vert est ton unique retour fiable — il doit rester allumé même pendant que tu traites autre chose.',
      action: 'Pose la main gauche sur les flèches et n’en bouge plus de toute l’épreuve.',
    },
    {
      scene: 'circle-change',
      title: 'Le changement de direction',
      observe:
        'Le cercle part maintenant vers la droite. Tant que tu maintiens l’ancienne flèche, le « > » vert disparaît et le cercle est rouge : tu perds des points en continu.',
      why: 'Un changement non corrigé coûte plusieurs secondes de poursuite. C’est pour ça qu’il passe AVANT les deux autres tâches, toujours.',
      action: 'Relâche, appuie sur la nouvelle flèche, vérifie le vert — puis seulement reviens au reste.',
      pitfall: 'Corriger « dès que j’ai fini le calcul » : à ce moment-là, 3 secondes de poursuite sont déjà perdues.',
    },
    {
      scene: 'shapes-match',
      title: 'Tâche ② — les deux formes identiques',
      observe:
        'La forme de l’encart pointillé (à gauche) et celle DANS le cercle sont les mêmes : deux étoiles. C’est le signal — barre d’espace.',
      why: 'La comparaison se fait globalement, par superposition mentale : « même silhouette ou non ». Nommer les formes est plus lent et n’apporte rien.',
      action: 'Appuie sur Espace SANS relâcher la flèche de direction. Les deux mains sont indépendantes.',
    },
    {
      scene: 'shapes-diff',
      title: 'Quand les formes diffèrent',
      observe: 'Étoile à gauche, carré dans le cercle : rien à faire. L’absence de réponse EST la réponse.',
      why: 'Une fausse alarme compte comme une erreur. En cas de doute, ne rien faire est statistiquement meilleur que d’appuyer « au cas où ».',
      pitfall: 'Appuyer par réflexe quand les formes se ressemblent vaguement — le doute doit se résoudre en non-action.',
    },
    {
      scene: 'calc-wrong',
      title: 'Tâche ③ — le calcul entouré est faux',
      observe:
        '47 + 28 = 78. Contrôle par les unités : 7 + 8 = 15, le résultat doit finir par 5. Il finit par 8 → FAUX → touche F.',
      why: 'La vérification par les unités prend une demi-seconde. Recalculer entièrement en prendrait deux — pendant lesquelles le cercle change de direction sans toi.',
      action: 'Regarde le dernier chiffre, compare, appuie sur F si ça ne colle pas. Rien d’autre.',
      pitfall: 'Recalculer proprement chaque opération : c’est la première cause d’effondrement du score de poursuite.',
    },
    {
      scene: 'all',
      title: 'Tout ensemble : la boucle de balayage',
      observe:
        'Les trois tâches tournent en même temps pendant 5 minutes. Rien ne s’arrête pour t’attendre.',
      why:
        'Le score vient de la RÉGULARITÉ, pas des pics de performance. Une boucle d’environ une seconde — cercle (flèche + vert) → formes → calcul → cercle — couvre tout sans jamais laisser une tâche sans surveillance plus de deux secondes.',
      action:
        'Installe cette boucle dès les premières secondes, à un rythme tenable. Puis 12 minutes maximum par jour : l’apprentissage moteur se consolide pendant le sommeil, pas en s’acharnant.',
    },
  ],
};
