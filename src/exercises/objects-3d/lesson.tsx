import { DesertView } from './DesertView';
import { SceneMap } from './SceneMap';
import { generate } from './generator';
import { VIEWPOINT_COUNT, VIEW_RADIUS } from './config';
import { viewpointPosition } from './scene';
import type { Lesson } from '../../core/types';

/**
 * Leçon « Objets 3D » : un item réel décortiqué découpe par découpe.
 *
 * Item : seed 5, niveau 2, disposition étalée. Cinq objets, vue prise depuis le
 * point de vue 8 (index 7). Les ordres gauche→droite de chacun des 8 ronds sont
 * calculés par `scene.ts` ; les valeurs citées dans les étapes en sortent.
 *
 *   vue 8, de gauche à droite : tour › cactus › antenne › pyramide › cube
 *
 *   découpe 1 (cactus ↔ cube, la paire la plus écartée) : cactus à gauche du cube
 *                                                          → ronds 1, 2, 7, 8
 *   découpe 2 (tour ↔ antenne)  : tour à gauche de l'antenne → ronds 7, 8
 *   découpe 3 (antenne ↔ cube)  : antenne à gauche du cube   → rond 8
 */
const ITEM = generate(5, 2, 'spread-layout');
const OBJECTS = ITEM.question.objects;
const ANSWER = ITEM.question.viewpoint; // 7 → rond 8

/** Ronds survivants après chaque découpe (index 0-7). */
const CUT_1 = [0, 1, 6, 7];
const CUT_2 = [6, 7];

/* Mise à l'échelle identique à celle de `SceneMap` : l'overlay se superpose au pixel près. */
const SIZE = 320;
const CENTER = SIZE / 2;
const SCALE = (SIZE / 2 - 30) / VIEW_RADIUS;
const sx = (x: number) => CENTER + x * SCALE;
const sy = (z: number) => CENTER + z * SCALE;

const objAt = (kind: string) => OBJECTS.find((o) => o.kind === kind)!;

/** Le plan, surmonté d'un calque figé : l'axe de découpe et les ronds éliminés. */
function PlanMap({
  keep,
  axis,
  reveal = null,
}: {
  /** Ronds encore candidats ; les autres sont barrés. `null` = aucun barrage. */
  keep?: number[];
  /** Paire d'objets dont l'ordre gauche→droite sert de découpe. */
  axis?: [string, string];
  reveal?: number | null;
}) {
  const a = axis ? objAt(axis[0]) : null;
  const b = axis ? objAt(axis[1]) : null;
  return (
    <div className="relative" style={{ width: SIZE, height: SIZE }}>
      <SceneMap objects={OBJECTS} reveal={reveal} />
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="pointer-events-none absolute inset-0"
      >
        {a && b && (
          <line
            x1={sx(a.x)}
            y1={sy(a.z)}
            x2={sx(b.x)}
            y2={sy(b.z)}
            stroke="#f59e0b"
            strokeWidth={2.5}
            strokeDasharray="6 4"
          />
        )}
        {keep &&
          Array.from({ length: VIEWPOINT_COUNT }, (_, k) => {
            if (keep.includes(k)) return null;
            const p = viewpointPosition(k);
            const cx = sx(p.x);
            const cy = sy(p.z);
            return (
              <g key={k} stroke="#ef4444" strokeWidth={2.5} strokeLinecap="round">
                <line x1={cx - 8} y1={cy - 8} x2={cx + 8} y2={cy + 8} />
                <line x1={cx - 8} y1={cy + 8} x2={cx + 8} y2={cy - 8} />
              </g>
            );
          })}
      </svg>
    </div>
  );
}

function View({ width = 420 }: { width?: number }) {
  return (
    <div style={{ width, maxWidth: '100%' }}>
      <div className="aspect-[4/3] w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
        <DesertView objects={OBJECTS} viewpoint={ANSWER} />
      </div>
      <p className="mt-1 text-center text-xs text-zinc-500">la scène telle qu'elle est vue</p>
    </div>
  );
}

function Objects3dScene({ scene }: { scene: string; stepIndex: number }) {
  if (scene === 'view') {
    return (
      <div className="flex flex-col items-center gap-2">
        <View width={480} />
        <p className="text-center text-sm text-zinc-300">
          de gauche à droite :{' '}
          <span className="font-semibold text-sky-400">
            tour › cactus › antenne › pyramide › cube
          </span>
        </p>
      </div>
    );
  }
  if (scene === 'cut1') return <PlanMap axis={['cactus', 'cube']} keep={CUT_1} />;
  if (scene === 'cut2') return <PlanMap axis={['tour', 'antenne']} keep={CUT_2} />;
  if (scene === 'cut3') return <PlanMap axis={['antenne', 'cube']} keep={[ANSWER]} reveal={ANSWER} />;
  if (scene === 'opposite') return <PlanMap keep={[ANSWER, 3]} reveal={ANSWER} />;
  if (scene === 'answer') {
    return (
      <div className="flex flex-wrap items-start justify-center gap-5">
        <View width={380} />
        <PlanMap reveal={ANSWER} />
      </div>
    );
  }
  return (
    <div className="flex flex-wrap items-start justify-center gap-5">
      <View width={380} />
      <PlanMap />
    </div>
  );
}

export const lesson: Lesson = {
  reality: {
    atFirst:
      "Les premières questions, tu essaieras d’imaginer la scène depuis chaque rond — et tu n’en feras pas trois avant la fin des 10 s. C’est le piège de conception de l’épreuve : la simulation mentale est hors de portée de n’importe qui. Le raisonnement par découpes, lui, s’apprend, mais il demande de renoncer à « voir » la scène.",
    budget:
      "Le budget officiel de 10 s suppose les découpes déjà mécaniques. Honnêtement : au début, une seule découpe bien faite te prendra 8 s. Fais-en UNE et devine entre les quatre survivants plutôt que d’en bâcler trois — une chance sur quatre vaut mieux qu’un raisonnement faux.",
    fallback: [
      "Une seule découpe tenue : garde la paire d’objets la plus ÉCARTÉE sur le plan. C’est celle dont l’ordre gauche-droite est le plus franc à l’écran, donc celle où tu ne peux pas te tromper.",
      "Deux ronds survivent et rien ne les sépare : prends celui dont la profondeur colle — l’objet dont le PIED est le plus bas dans l’image doit être le plus proche de ton rond sur le plan.",
      "Toujours indécis : ne prends jamais un rond VOISIN de ton candidat, prends son OPPOSÉ. La moitié des erreurs de cet exercice sont le rond n+4, jamais n+1.",
    ],
    recover:
      "Si ta lecture gauche-droite te semble inversée, ne recommence pas le raisonnement : prends directement le rond diamétralement opposé. C’est presque toujours l’explication, et ça coûte 2 secondes au lieu de 10.",
    bail:
      "Pas de point négatif : une case doit être cochée à chaque fois. À 7 s, arrête de raisonner et réponds avec ce que la première découpe a laissé. Une question abandonnée proprement en protège deux autres.",
  },
  title: 'Éliminer les points de vue par découpes successives',
  intro:
    "Une scène du désert vue depuis l'un des 8 ronds disposés en cercle, chacun tourné vers le centre : retrouve lequel, en 10 secondes. Le raisonnement se fait sur le PLAN, jamais sur l'image 3D — celle-ci ne sert qu'à lire deux ou trois relations entre objets.",
  Scene: Objects3dScene,
  steps: [
    {
      scene: 'both',
      title: 'Le dispositif',
      observe:
        "À gauche, la vue prise depuis un rond inconnu. À droite, le plan du désert vu du dessus, avec les 8 ronds numérotés. Les cinq objets sont les mêmes des deux côtés — tour, cactus, antenne, pyramide, cube.",
      why: "La vue 3D ne contient que deux informations exploitables : qui est à gauche de qui, et qui est devant. Tout le reste (taille, ombre, détail des maillages) est du décor. Le plan, lui, te donne la géométrie exacte : c'est là que se fait le raisonnement.",
      pitfall:
        "Compter les 8 ronds un par un en imaginant la vue depuis chacun coûte 30 secondes garanties. Tu n'as le temps de simuler aucun point de vue : il faut ÉLIMINER, pas simuler.",
    },
    {
      scene: 'view',
      title: 'Étape 1 — lire l’ordre gauche→droite',
      observe:
        "Sur l'image, de la gauche vers la droite : tour, cactus, antenne, pyramide, cube. C'est tout ce qu'on relève pour l'instant.",
      why: "Cet ordre est une signature : il change à chaque rond, et il se lit en 3 secondes sans aucun effort spatial. Chaque paire d'objets qu'il contient est une contrainte qui va couper le cercle des ronds en deux.",
      action:
        "Lis l'ordre complet une seule fois et retiens-le comme une phrase. Ne reviens plus sur l'image avant le contrôle final.",
    },
    {
      scene: 'cut1',
      title: 'Étape 2 — la règle de l’axe',
      observe:
        "Sur le plan, les deux objets les plus éloignés l'un de l'autre sont le CACTUS (tout en bas) et le CUBE (en haut). Le trait orange qui les relie coupe le cercle en deux moitiés de 4 ronds.",
      why: "Les ronds d'un côté de cet axe voient le cactus à gauche du cube ; ceux de l'autre côté voient l'inverse. La vue montre le cactus à gauche du cube → les ronds 3, 4, 5 et 6 sont éliminés d'un coup. Quatre candidats restent : 1, 2, 7, 8.",
      action:
        "Choisis toujours la paire la PLUS ÉCARTÉE pour la première découpe : c'est celle dont l'ordre est le plus franc à l'écran, donc celle où tu ne peux pas te tromper.",
    },
    {
      scene: 'cut2',
      title: 'Étape 3 — la double découpe',
      observe:
        "Deuxième paire : la TOUR (à droite du plan) et l'ANTENNE (en bas à gauche). Sur la vue, la tour est à l'extrême gauche, l'antenne au milieu : la tour est donc à gauche de l'antenne.",
      why: "Les ronds 1 et 2 voient l'antenne à gauche de la tour : ils tombent. Il ne reste que 7 et 8. Deux découpes bien choisies ramènent mécaniquement 8 candidats à 1 ou 2, quel que soit le nombre d'objets.",
      pitfall:
        "« Gauche » sur le plan et « gauche » sur la vue ne sont pas la même chose. Place-toi mentalement SUR le rond, tourné vers le centre, avant de dire de quel côté est un objet.",
    },
    {
      scene: 'cut3',
      title: 'Étape 4 — la découpe qui tranche',
      observe:
        "Troisième paire, choisie pour séparer 7 et 8 : l'ANTENNE et le CUBE. Sur la vue, l'antenne est au milieu et le cube à l'extrême droite — antenne à gauche du cube.",
      why: "Depuis le rond 7, le cube apparaîtrait à gauche de l'antenne ; depuis le rond 8, à droite. L'image tranche : c'est le rond 8. Une paire bien choisie vaut mieux qu'une longue observation — cherche celle dont l'ordre diffère entre les deux derniers candidats.",
      action:
        "Quand deux ronds survivent, ne relis pas toute la vue : cherche l'UNIQUE paire d'objets dont l'ordre les sépare, et lis-la.",
    },
    {
      scene: 'answer',
      title: 'Étape 5 — le contrôle par la profondeur',
      observe:
        "Sur la vue, l'objet dont le PIED est le plus bas dans l'image est la tour. Sur le plan, la tour est bien l'objet le plus proche du rond 8 — de peu devant le cube.",
      why: "La profondeur est le contrôle de cohérence final : l'objet le plus proche à l'écran doit être, sur le plan, du même côté que le rond retenu. Il coûte 2 secondes et attrape les erreurs de latéralité, celles où l'on a lu la vue à l'envers.",
      pitfall:
        "Ne trie jamais la profondeur par la taille apparente : les objets n'ont pas la même hauteur réelle. Une antenne lointaine reste haute, un cube proche reste petit. C'est la position du PIED dans l'image qui donne la distance.",
    },
    {
      scene: 'opposite',
      title: 'Le piège : le rond diamétralement opposé',
      observe:
        "Le rond 4 est l'opposé du rond 8. Depuis lui, on voit la même scène à peu près en miroir gauche-droite : la tour passerait à droite, le cube à gauche.",
      why: "La moitié des erreurs de cet exercice sont le rond n+4. Ils se ressemblent parce qu'ils regardent le même axe, en sens inverse. La profondeur les sépare toujours de façon nette : l'objet le plus proche de l'un est le plus lointain de l'autre.",
      action:
        "Si ton rond te semble « presque bon mais inversé », prends son opposé — jamais son voisin. Et vise UNE découpe propre plutôt que trois approximatives : une découpe juste laisse quatre candidats, trois découpes fausses n'en laissent aucun de bon.",
    },
  ],
};
