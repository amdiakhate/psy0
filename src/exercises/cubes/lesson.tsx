import type { Lesson } from '../../core/types';
import { FoldPlayer } from './FoldingNet';
import { Glyph } from './CubeSvg';
import { NetSvg } from './CubeSvg';
import type { Cube } from './cube-model';
import { ALL_ROTATIONS, applyRotation, POS } from './cube-model';

/**
 * Leçon « Cubes » : la règle des faces opposées, appliquée à un patron à trous.
 * Symboles : 0 flèche, 1 L, 2 drapeau, 3 T, 4 P, 5 S.
 */
const REFERENCE: Cube = [
  { id: 'R', originalPosition: POS.R, sym: 0, rot: 0 },
  { id: 'L', originalPosition: POS.L, sym: 1, rot: 0 },
  { id: 'U', originalPosition: POS.U, sym: 2, rot: 0 },
  { id: 'D', originalPosition: POS.D, sym: 3, rot: 0 },
  { id: 'F', originalPosition: POS.F, sym: 4, rot: 0 },
  { id: 'B', originalPosition: POS.B, sym: 5, rot: 0 },
];

/** Le même cube, tourné : c'est le patron à compléter. */
const ORIENTED = applyRotation(REFERENCE, ALL_ROTATIONS[5]);

function withHoles(holes: number[]): (Cube[number] | null)[] {
  return ORIENTED.map((f, i) => (holes.includes(i) ? null : f));
}

const CELLS: Array<{ pos: number; col: number; row: number }> = [
  { pos: POS.U, col: 1, row: 0 },
  { pos: POS.L, col: 0, row: 1 },
  { pos: POS.F, col: 1, row: 1 },
  { pos: POS.R, col: 2, row: 1 },
  { pos: POS.B, col: 3, row: 1 },
  { pos: POS.D, col: 1, row: 2 },
];

const HOLES = [POS.F, POS.B];

function PartialNet({ highlight }: { highlight?: number[] }) {
  const S = 50;
  const target = withHoles(HOLES);
  return (
    <svg width={4 * S + 2} height={3 * S + 2} viewBox={`0 0 ${4 * S + 2} ${3 * S + 2}`}>
      {CELLS.map(({ pos, col, row }) => {
        const face = target[pos];
        const hot = highlight?.includes(pos);
        return (
          <g key={pos} transform={`translate(${col * S + 1} ${row * S + 1})`}>
            <rect
              width={S}
              height={S}
              fill={face === null ? '#0c0a09' : 'var(--ink-800)'}
              stroke={hot ? '#0ea5e9' : 'var(--ink-500)'}
              strokeWidth={hot ? 3 : 1}
              strokeDasharray={face === null ? '4 3' : undefined}
            />
            {face && (
              <g transform={`scale(${S / 100})`}>
                <Glyph sym={face.sym} rot={face.rot} />
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function CubesScene({ scene }: { scene: string; stepIndex: number }) {
  if (scene === 'fold' || scene === 'fold-pairs') {
    return (
      <div className="text-center">
        <p className="mb-2 text-xs uppercase tracking-widest text-zinc-500">
          {scene === 'fold' ? 'Le patron se plie — regarde-le en entier' : 'Les trois paires d’opposées, en couleurs'}
        </p>
        <FoldPlayer cube={REFERENCE} pairColors={scene === 'fold-pairs'} />
      </div>
    );
  }
  if (scene === 'reference') {
    return (
      <div className="text-center">
        <p className="mb-1 text-xs uppercase tracking-widest text-zinc-500">Patron de référence</p>
        <NetSvg cube={REFERENCE} size={50} />
      </div>
    );
  }
  if (scene === 'both') {
    return (
      <div className="flex flex-wrap items-start justify-center gap-6">
        <div className="text-center">
          <p className="mb-1 text-xs uppercase tracking-widest text-zinc-500">Référence</p>
          <NetSvg cube={REFERENCE} size={44} />
        </div>
        <div className="text-center">
          <p className="mb-1 text-xs uppercase tracking-widest text-zinc-500">À compléter</p>
          <PartialNet />
        </div>
      </div>
    );
  }
  const highlight =
    scene === 'pairs-ref' ? [POS.L, POS.R] : scene === 'hole' ? HOLES : scene === 'solve' ? [POS.F] : undefined;
  if (scene === 'pairs-ref') {
    return (
      <div className="text-center">
        <p className="mb-1 text-xs uppercase tracking-widest text-zinc-500">
          Référence — paire d'opposées mise en évidence
        </p>
        <NetSvg cube={REFERENCE} size={50} />
      </div>
    );
  }
  return (
    <div className="text-center">
      <p className="mb-1 text-xs uppercase tracking-widest text-zinc-500">Patron à compléter</p>
      <PartialNet highlight={highlight} />
    </div>
  );
}

export const lesson: Lesson = {
  reality: {
    atFirst:
      "Au début tu replieras le cube mentalement, et tu ne finiras pas dans les 60 s. C’est attendu. La règle des opposées ne remplace vraiment le pliage qu’après une dizaine de questions faites LENTEMENT, sans chrono — c’est le meilleur investissement possible sur cet exercice.",
    budget:
      "60 s suppose les trois paires d’opposées relevées en 15 s. Tant que tu cherches encore quelle case fait face à quelle case, compte-en 30 : tu traiteras un trou au lieu de deux, et ce sera le bon choix.",
    fallback: [
      "Le temps serre : traite UN seul trou à fond plutôt que deux à moitié. Une pièce juste rapporte, deux pièces au hasard non.",
      "Lâche le contrôle d’orientation contre l’arête commune et pose le bon symbole dans le sens qui te paraît naturel. Tu perdras sur les questions où l’orientation décide, mais tu auras une réponse — et sur une famille de formes, tu ne perdras rien du tout.",
      "Ne lâche JAMAIS le contrôle final des trois paires : 10 secondes pour attraper une pièce mal placée, c’est le meilleur rapport de tout l’exercice.",
    ],
    recover:
      "Si tu découvres qu’une pièce posée est fausse, ne reprends pas tout : seules cette pièce et son opposée sont en cause. Les autres paires restent valides — c’est justement pour ça qu’on raisonne par paires.",
    bail:
      "Si à 45 s la pièce ne s’est pas imposée, pose la plus plausible et valide. Un patron laissé incomplet ne rapporte rien, et le temps gagné profite à la question suivante.",
  },
  title: 'Compléter un patron sans le plier',
  intro:
    "D'abord, voir le pliage en vrai — une fois, en le pilotant soi-même. Ensuite, ne plus jamais plier : le patron à compléter est le même cube que la référence, déplié dans une autre orientation, et on ne recopie RIEN case par case. On raisonne sur les paires de faces opposées, qui elles ne changent jamais.",
  Scene: CubesScene,
  steps: [
    {
      scene: 'fold',
      title: 'Le pliage, vu une fois pour de vrai',
      observe:
        "Le patron se plie sous tes yeux : la croix se referme, les parois plongent, la 4e case de la barre vient fermer l'arrière. Mets pause où tu veux, et rejoue le pliage au curseur, dans les deux sens.",
      why: "Toute l'épreuve consiste à IMAGINER ce mouvement. Le voir en entier une fois — et surtout le piloter soi-même au curseur — installe le modèle mental sur lequel toutes les règles suivantes s'appuient. Après, on ne pliera plus jamais : on raisonnera.",
      action:
        'Arrête le pliage vers 50 % et repère où part chaque case. Refais-le deux ou trois fois, puis passe à la suite.',
    },
    {
      scene: 'fold-pairs',
      title: 'Ce que le pliage démontre : les opposées',
      observe:
        "Les paires sont coloriées : les deux bleues, les deux vertes, les deux jaunes. Dans le patron À PLAT, chaque paire est séparée par exactement une case. Plie : chaque paire finit FACE À FACE, sans jamais se toucher.",
      why: "C'est LA règle de l'exercice, et tu viens de la voir se démontrer : deux cases séparées d'une case dans une ligne ou une colonne du patron sont opposées sur le cube. Les opposées sont invariantes — quelle que soit la façon de déplier, elles restent dos à dos. Tout le reste de la méthode n'exploite que ça.",
      pitfall:
        "Deux cases VOISINES du patron ne sont jamais opposées : elles partagent une arête. Le piège classique est de confondre « à côté » et « en face ».",
    },
    {
      scene: 'both',
      title: 'Deux patrons du même cube',
      observe:
        'À gauche, le patron complet. À droite, le même cube déplié autrement, avec deux faces manquantes (cases pointillées). Les symboles ne sont PAS aux mêmes endroits d’un patron à l’autre.',
      why: 'C’est tout le piège : si tu recopies la case du milieu de gauche dans la case du milieu de droite, tu te trompes presque à coup sûr. Les deux patrons ne partagent que la structure du cube, pas la disposition.',
      pitfall: 'Recopier case par case est l’erreur qui coûte la question entière — et c’est le réflexe naturel.',
    },
    {
      scene: 'pairs-ref',
      title: 'Étape 1 — relever les paires d’opposées',
      observe:
        'Sur le patron en croix, deux faces séparées par exactement une case dans la même ligne sont opposées sur le cube. Dans la barre horizontale, la 1re et la 3e case sont opposées ; la 2e et la 4e aussi. Plus le haut et le bas de la croix.',
      why: 'Les paires d’opposées sont INVARIANTES : quelle que soit la façon de déplier le cube, ces faces resteront dos à dos. C’est la seule information transportable d’un patron à l’autre.',
      action: 'Note les 3 paires du patron de référence avant de regarder les trous. 15 secondes bien investies.',
    },
    {
      scene: 'hole',
      title: 'Étape 2 — lire les trous par leurs opposées',
      observe:
        'Les deux trous du patron de droite ont chacun une face opposée qui, elle, est visible. Repère-la : c’est le renseignement décisif.',
      why: 'Si un trou est opposé à une face visible X, la pièce qui va dedans est forcément celle qui était opposée à X dans le patron de référence. Une seule pièce peut convenir — sans aucun pliage mental.',
      action: 'Pour chaque trou : « quelle face lui est opposée ici ? » puis « qui était en face d’elle sur la référence ? »',
    },
    {
      scene: 'solve',
      title: 'Étape 3 — l’orientation, jamais l’identité seule',
      observe:
        'Tu sais QUEL symbole va dans le trou. Reste à savoir dans quel SENS — et comme les pièces arrivent toutes à l’endroit, ce sens, c’est toi qui dois le produire au clic.',
      why: 'Deux faces voisines sur le patron partagent une arête qui est la même arête sur le cube. Regarde quel côté du symbole touche cette arête sur la référence : ça doit rester vrai après placement.',
      pitfall:
        'Valider sur le symbole seul est le piège n°2. Contrôle toujours l’orientation contre une arête commune avec une face déjà en place.',
    },
    {
      scene: 'hole',
      title: 'Étape 4 — produire l’orientation',
      observe:
        'Les pièces du bas sont proposées À L’ENDROIT, toutes dans le même sens. Un clic les fait tourner d’un quart de tour — avant de les poser, ou une fois posées.',
      why: 'Tu ne reçois donc jamais la bonne orientation : tu la fabriques. Savoir QUEL symbole va dans le trou ne vaut rien tant que tu ne sais pas dans quel SENS — et c’est là que se joue la moitié des points de l’exercice.',
      action:
        'Décide le sens AVANT de cliquer, en lisant l’arête commune avec une face voisine déjà en place. Cliquer au hasard jusqu’à ce que « ça ressemble » coûte les quatre essais et ne prouve rien.',
      pitfall:
        'Il n’y a AUCUN retournement en miroir dans cet exercice : quatre orientations, pas huit. Si une pièce ne colle dans aucun des quatre sens, ce n’est pas elle qu’il fallait mettre là.',
    },
    {
      scene: 'hole',
      title: 'Étape 5 — les symboles sans orientation',
      observe:
        'Certaines questions emploient des formes — carré, octogone, cercle, trèfle, étoile — au lieu de lettres. Tournées d’un quart de tour, elles sont identiques à elles-mêmes.',
      why: 'Sur ces questions, l’orientation ne compte tout simplement pas : seule l’identité du symbole décide. Reconnaître la famille dès le premier coup d’œil te dit combien de travail la question demande vraiment — et t’évite de chercher une orientation qui n’existe pas.',
      pitfall:
        'La croix fait exception : son bras du bas est plus long, elle garde donc une orientation. Ne conclus pas « c’est une forme, donc je pose n’importe comment ».',
    },
    {
      scene: 'both',
      title: 'Étape 6 — le contrôle final',
      observe:
        'Patron complété. Avant de valider, reprends les 3 paires d’opposées de la référence et vérifie qu’elles sont identiques dans ton patron.',
      why: 'Ce contrôle attrape toutes les erreurs de placement en 10 secondes, sans refaire le raisonnement. Une paire qui diffère = une pièce mal placée.',
      action: 'Vérifie les 3 paires, puis valide. Budget total : 60 s, dont 15 de relevé, 30 de placement, 15 de contrôle.',
    },
  ],
};
