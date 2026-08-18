import type { Lesson } from '../../core/types';
import { PolycubeSvg, commonWorldSize } from './PolycubeSvg';
import type { Rgb } from './PolycubeSvg';
import { SHAPES } from './data';
import { generate } from './generator';
import { IDENTITY, ROTATIONS, cellCenterOf, mirror, normalize, projectPoint, rotate, tiltMatrix } from './model';
import type { Mat3 } from './model';
import { linear } from '../../anim/timeline';
import { useTimeline } from '../../hooks/useTimeline';
import { findLessonTrihedron, handOf, tripleSign } from './signature';
import type { Shape } from './model';

/**
 * Leçon « Empilements » : la méthode du SENS DE CIRCULATION.
 *
 * L'ancienne version enseignait un repère d'écran — « oriente le bras vers toi,
 * regarde de quel côté part le décrochage » — qui supposait toutes les figures
 * dessinées dans la même projection. Depuis qu'elles sont basculées d'un angle
 * quelconque, comme chez Pilotest, ce repère est FAUX. Ce qui le remplace est
 * intrinsèque à la figure : trois flèches dans un ordre imposé, et le geste des
 * trois doigts. `signature.test.ts` prouve que ce verdict coïncide avec la
 * chiralité réelle sur les 48 présentations possibles.
 *
 * Tout est montré SUR les cubes : rôles colorés, flèches numérotées — la
 * formule verbale vient après l'image, jamais à sa place.
 */

const BASE = SHAPES.find((s) => s.name === 'bosse-5')!.cells;

const STACK_1: Shape = normalize(BASE);
const STACK_2: Shape = mirror(BASE);
const STACK_3: Shape = rotate(BASE, ROTATIONS[14]);

const STACKS: Shape[] = [STACK_1, STACK_2, STACK_3];
const ANSWER = 1; // index 0-2 → empilement 2
const WORLD = commonWorldSize(STACKS);

/** Main de chaque empilement, calculée — pas écrite à la main, pour ne jamais mentir. */
const HAND_LABEL = (cells: Shape) => (handOf(cells) === handOf(STACK_1) ? 'droite' : 'gauche');
const HANDS = STACKS.map(HAND_LABEL);

/* --------------------------------------------------- couleurs des trois rôles */

const ARM: { dark: Rgb; bright: Rgb } = { dark: [21, 48, 74], bright: [96, 178, 255] };
const OVERHANG: { dark: Rgb; bright: Rgb } = { dark: [80, 44, 8], bright: [255, 166, 62] };
const TOP: { dark: Rgb; bright: Rgb } = { dark: [16, 62, 32], bright: [95, 235, 134] };

const ARROW_COLORS = ['#60b2ff', '#ffa63e', '#5feb86'];

/* ----------------------------------------------------------------- overlays */

/** Palette par rôle, pour une figure de leçon donnée. */
function rolePalette(cells: Shape): ((i: number) => { dark: Rgb; bright: Rgb } | null) | undefined {
  const t = findLessonTrihedron(cells);
  if (!t) return undefined;
  return (i) => {
    if (t.armIndices.includes(i)) return ARM;
    if (i === t.overhangIndex) return OVERHANG;
    if (i === t.topIndex) return TOP;
    return null;
  };
}

/** Une flèche 2D avec pointe, tracée en unités cube (contour sombre + couleur). */
function Arrow({
  from,
  to,
  color,
  label,
  extend = 0,
}: {
  from: [number, number];
  to: [number, number];
  color: string;
  label?: string;
  /** Prolonge la flèche au-delà de sa cible, en unités cube — pour sortir de la figure. */
  extend?: number;
}) {
  const dx0 = to[0] - from[0];
  const dy0 = to[1] - from[1];
  const len0 = Math.hypot(dx0, dy0) || 1;
  const [ux, uy] = [dx0 / len0, dy0 / len0];
  const tip: [number, number] = [to[0] + ux * extend, to[1] + uy * extend];
  const [px, py] = [-uy, ux];
  const headLen = 0.26;
  const headWidth = 0.17;
  const bx = tip[0] - ux * headLen;
  const by = tip[1] - uy * headLen;
  const head = `${tip[0]},${tip[1]} ${bx + px * headWidth},${by + py * headWidth} ${bx - px * headWidth},${by - py * headWidth}`;
  return (
    <g>
      <line x1={from[0]} y1={from[1]} x2={bx} y2={by} stroke="rgb(20 16 18)" strokeWidth={0.16} strokeLinecap="round" />
      <line x1={from[0]} y1={from[1]} x2={bx} y2={by} stroke={color} strokeWidth={0.09} strokeLinecap="round" />
      <polygon points={head} fill={color} stroke="rgb(20 16 18)" strokeWidth={0.03} />
      {label && (
        <g>
          {/* La pastille vit AU-DELÀ de la pointe : jamais sur la figure, jamais sur une autre pastille. */}
          <circle cx={tip[0] + ux * 0.34} cy={tip[1] + uy * 0.34} r={0.21} fill="rgb(20 16 18)" stroke={color} strokeWidth={0.04} />
          <text
            x={tip[0] + ux * 0.34}
            y={tip[1] + uy * 0.34}
            fill="#fff"
            fontSize={0.28}
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="monospace"
          >
            {label}
          </text>
        </g>
      )}
    </g>
  );
}

/**
 * Les trois flèches du trièdre, dessinées SUR la figure : ① le long du bras
 * vers le bout porteur, ② vers la saillie, ③ du support vers le cube du dessus.
 */
function TrihedronArrows({ cells, tilt = IDENTITY }: { cells: Shape; tilt?: Mat3 }) {
  const t = findLessonTrihedron(cells);
  if (!t) return null;
  const lift: [number, number, number] = [0, 0.62, 0]; // au-dessus des faces, pas dedans
  const raise = (c: readonly [number, number, number]): [number, number] =>
    projectPoint([c[0] + lift[0], c[1] + lift[1], c[2] + lift[2]], tilt);
  const origin = cellCenterOf(t.origin);
  const support = cellCenterOf(cells[t.supportIndex]);
  const overhang = cellCenterOf(cells[t.overhangIndex]);
  const top = cellCenterOf(cells[t.topIndex]);
  return (
    <g>
      <Arrow from={raise(origin)} to={raise(support)} color={ARROW_COLORS[0]} label="1" extend={0.55} />
      <Arrow from={raise(origin)} to={raise(overhang)} color={ARROW_COLORS[1]} label="2" extend={0.55} />
      <Arrow from={projectPoint(support, tilt)} to={projectPoint(top, tilt)} color={ARROW_COLORS[2]} label="3" extend={0.55} />
    </g>
  );
}

/**
 * LA démonstration que l'ancienne méthode ne pouvait pas faire : les deux
 * figures TOURNENT, en continu, flèches accrochées. La main droite reste main
 * droite sous tous les angles ; le miroir reste main gauche. Aucune rotation ne
 * les échange — c'est ça, la chiralité, et on la regarde tourner.
 */
function SpinningHands() {
  const { value, playing, toggle, scrub } = useTimeline([{ to: 1, ms: 9000, ease: linear }]);
  const tilt = tiltMatrix(value * 360, 14, 0);
  const pair: Array<{ cells: Shape; label: string; ok: boolean }> = [
    { cells: STACK_1, label: `main ${HANDS[0]}`, ok: true },
    { cells: STACK_2, label: `main ${HANDS[1]} — le miroir`, ok: false },
  ];
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex flex-wrap items-start justify-center gap-6">
        {pair.map(({ cells, label, ok }) => (
          <div key={label} className="flex flex-col items-center gap-1.5">
            <div className="rounded-lg border-2 border-zinc-700 p-1.5" style={{ background: '#e7e5e4' }}>
              <PolycubeSvg shape={cells} tilt={tilt} world={WORLD + 1.9} px={250} cellPalette={rolePalette(cells)}>
                <TrihedronArrows cells={cells} tilt={tilt} />
              </PolycubeSvg>
            </div>
            <span className={`text-xs font-semibold ${ok ? 'text-green-400' : 'text-red-400'}`}>{label}</span>
          </div>
        ))}
      </div>
      <div className="flex w-full max-w-sm items-center gap-3">
        <button
          onClick={toggle}
          className="rounded-lg border border-zinc-600 px-3 py-1 font-mono text-sm text-zinc-300 hover:border-sky-500"
          aria-label={playing ? 'Pause' : 'Lecture'}
        >
          {playing ? '⏸' : '▶'}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.002}
          value={value}
          onChange={(e) => scrub(Number(e.target.value))}
          className="flex-1 accent-sky-500"
          aria-label="Angle de rotation"
        />
        <span className="w-12 text-right font-mono text-xs text-zinc-500">{Math.round(value * 360)}°</span>
      </div>
    </div>
  );
}

/**
 * Le repère EXTRAIT de la figure : les trois flèches seules, ramenées à un même
 * point. Deux figures de même main donnent le même repère à rotation près ; le
 * miroir donne le repère inversé — c'est la comparaison que l'œil fait le mieux.
 */
function MiniFrame({ cells }: { cells: Shape }) {
  const t = findLessonTrihedron(cells);
  if (!t) return null;
  const o: [number, number, number] = [0, 0, 0];
  const at = (d: readonly [number, number, number], scale: number): [number, number, number] => [
    o[0] + d[0] * scale,
    o[1] + d[1] * scale,
    o[2] + d[2] * scale,
  ];
  const sign = tripleSign(t) === tripleSign({ origin: [0, 0, 0], u: [1, 0, 0], v: [0, 1, 0], w: [0, 0, 1] }) ? '+' : '−';
  return (
    <svg width={92} height={92} viewBox="-1.5 -1.6 3 3">
      <Arrow from={projectPoint(o)} to={projectPoint(at(t.u, 1.1))} color={ARROW_COLORS[0]} />
      <Arrow from={projectPoint(o)} to={projectPoint(at(t.v, 1.1))} color={ARROW_COLORS[1]} />
      <Arrow from={projectPoint(o)} to={projectPoint(at(t.w, 1.1))} color={ARROW_COLORS[2]} />
      <circle cx={projectPoint(o)[0]} cy={projectPoint(o)[1]} r={0.1} fill="rgb(20 16 18)" />
      <text x={-1.32} y={-1.25} fontSize={0.42} fill="currentColor" fontFamily="monospace">
        {sign}
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------- scènes */

function Row({
  accent = [],
  captions,
  arrows = false,
  frames = false,
  colors = false,
  px = 150,
}: {
  accent?: number[];
  captions?: string[];
  arrows?: boolean;
  frames?: boolean;
  colors?: boolean;
  px?: number;
}) {
  return (
    <div className="flex flex-wrap items-start justify-center gap-5">
      {STACKS.map((shape, i) => (
        <div key={i} className="flex flex-col items-center gap-1.5">
          <div
            className={`rounded-lg border-2 p-1.5 ${
              accent.includes(i) ? 'border-sky-500' : 'border-zinc-700'
            }`}
            style={{ background: '#e7e5e4' }}
          >
            {/* Les flèches débordent des figures : le cadre s'élargit pour ne pas rogner les pastilles. */}
            <PolycubeSvg
              shape={shape}
              world={arrows ? WORLD + 2.1 : WORLD}
              px={px}
              cellPalette={colors ? rolePalette(shape) : undefined}
            >
              {arrows && <TrihedronArrows cells={shape} />}
            </PolycubeSvg>
          </div>
          <span className="rounded border border-zinc-600 bg-zinc-800 px-2.5 py-0.5 font-mono text-sm text-sky-400">
            {i + 1}
          </span>
          {frames && (
            <span className="text-zinc-400">
              <MiniFrame cells={shape} />
            </span>
          )}
          {captions && (
            <span
              className={`max-w-[150px] text-center text-xs font-semibold ${
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

/**
 * Un item RÉEL, tiré du générateur — même taille et même basculement qu'à
 * l'épreuve. La méthode s'enseigne sur cinq cubes bien lisibles, mais elle ne
 * vaut que si l'élève la voit tenir sur ce qu'il rencontrera vraiment.
 */
const REAL = generate(5, 4).question;
const REAL_WORLD = commonWorldSize(REAL.stacks, REAL.tilts);

function RealItem() {
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs uppercase tracking-widest text-zinc-500">
        Un item réel — {REAL.size} cubes, chaque figure basculée
      </p>
      <div className="flex flex-wrap items-start justify-center gap-4">
        {REAL.stacks.map((shape, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <div
              className={`rounded-lg border-2 p-1.5 ${
                i === REAL.answerIndex ? 'border-red-500' : 'border-zinc-700'
              }`}
              style={{ background: '#e7e5e4' }}
            >
              <PolycubeSvg shape={shape} tilt={REAL.tilts[i]} world={REAL_WORLD} px={165} />
            </div>
            <span className="rounded border border-zinc-600 bg-zinc-800 px-2.5 py-0.5 font-mono text-sm text-sky-400">
              {i + 1}
            </span>
            <span className={`text-xs ${i === REAL.answerIndex ? 'text-red-400' : 'text-green-400'}`}>
              {i === REAL.answerIndex ? 'le symétrique' : 'la paire'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Anatomy({ arrows = false }: { arrows?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs uppercase tracking-widest text-zinc-500">Empilement 1, en grand</p>
      <div className="rounded-lg border-2 border-zinc-700 p-2" style={{ background: '#e7e5e4' }}>
        <PolycubeSvg
          shape={STACK_1}
          world={arrows ? WORLD + 2.1 : WORLD}
          px={280}
          cellPalette={rolePalette(STACK_1)}
        >
          {arrows && <TrihedronArrows cells={STACK_1} />}
        </PolycubeSvg>
      </div>
      <p className="max-w-md text-center text-xs text-zinc-400">
        <span className="font-semibold text-sky-400">le bras</span> (3 cubes alignés) ·{' '}
        <span className="font-semibold text-amber-400">la saillie</span> (sort du milieu du bras) ·{' '}
        <span className="font-semibold text-green-400">le dessus</span> (posé sur un bout du bras)
      </p>
    </div>
  );
}

function StackingScene({ scene }: { scene: string; stepIndex: number }) {
  if (scene === 'real') return <RealItem />;
  if (scene === 'anatomy') return <Anatomy />;
  if (scene === 'trihedron') return <Anatomy arrows />;
  if (scene === 'spin') return <SpinningHands />;
  if (scene === 'twins') return <Row accent={[0, 1]} colors />;
  if (scene === 'hands') return <Row arrows frames colors />;
  if (scene === 'answer') return <Row accent={[ANSWER]} captions={HANDS} arrows frames colors />;
  return <Row />;
}

export const lesson: Lesson = {
  title: 'La main d’une figure : trois flèches, un sens',
  intro:
    "Trois empilements, 10 secondes. Deux sont le même objet tourné, le troisième a EN PLUS subi une symétrie — c'est lui qu'il faut désigner. La méthode tient en un geste : trois flèches tracées sur la figure, dans un ordre imposé, et le sens dans lequel elles circulent. Ce sens ne change jamais quand on tourne la figure ; il s'inverse quand on la reflète. La leçon le montre sur un cas piégé, puis sur un item à la taille réelle de l'épreuve.",
  Scene: StackingScene,
  steps: [
    {
      scene: 'all',
      title: 'Le dispositif',
      observe:
        "Trois empilements des mêmes cubes, numérotés 1, 2, 3. Aucun n'est présenté « à l'endroit » : chaque figure est basculée d'un angle quelconque, comme au test.",
      why: "Tu ne cherches PAS le symétrique : tu cherches la PAIRE. Deux figures sont le même objet tourné ; dès que tu les as appariées, la troisième est la réponse. Chercher directement « celui qui a subi la symétrie » revient à comparer trois figures deux à deux — trois fois plus de travail.",
      action:
        "Avant tout, compte les cubes des trois figures. S'ils diffèrent, tu as mal lu une figure — relis-la avant de raisonner.",
      pitfall:
        "Comme les figures sont basculées, AUCUN repère d'écran (« en haut », « à droite », la clarté d'une face) n'est fiable. Tout ce qui suit se lit sur la figure elle-même.",
    },
    {
      scene: 'anatomy',
      title: 'Étape 1 — trois rôles, trois couleurs',
      observe:
        "En bleu, LE BRAS : la plus longue ligne droite de cubes. En orange, LA SAILLIE : le cube qui sort du milieu du bras. En vert, LE DESSUS : le cube posé sur un bout du bras.",
      why: "Trois éléments nommés, c'est tout ce que tu liras de la figure — le reste des cubes ne porte aucune information de chiralité. À dix cubes, cette lecture sélective est ce qui fait tenir dans les 10 secondes.",
      action:
        'Sur chaque figure du test, commence TOUJOURS par retrouver ces trois rôles : le plus long bras, ce qui sort de son milieu, ce qui est posé sur son bout.',
    },
    {
      scene: 'trihedron',
      title: 'Étape 2 — les trois flèches, dans l’ordre',
      observe:
        "Flèche ① : du milieu du bras vers le bout qui porte le dessus. Flèche ② : du milieu vers la saillie. Flèche ③ : du bout vers le cube du dessus. L'ordre 1 → 2 → 3 est imposé, toujours le même.",
      why: "Trois directions dans un ordre fixé définissent un SENS DE CIRCULATION — comme les trois premiers doigts d'une main. Tourner la figure tourne les trois flèches ensemble : leur sens ne change pas. La refléter inverse une flèche sur les trois : le sens bascule. C'est exactement — et uniquement — ce que la symétrie change.",
      action:
        'Le geste : pouce sur ①, index sur ②, majeur sur ③. Si ta main DROITE fait le geste sans se tordre, la figure est « main droite ». Sinon, « main gauche ».',
    },
    {
      scene: 'spin',
      title: 'La preuve en mouvement : tourne-les',
      observe:
        "Les deux figures tournent ensemble, flèches accrochées. À gauche l'originale, à droite son miroir. Sous TOUS les angles, la gauche garde sa main, la droite garde la sienne — à certains moments elles semblent identiques, et pourtant le verdict ne bascule jamais.",
      why: "C'est la propriété qui rend la méthode fiable là où l'œil ne l'est pas : la ressemblance entre deux vues varie avec l'angle, la MAIN ne varie jamais. Tu peux mettre pause à l'instant où les deux te semblent pareilles — et vérifier au geste des trois doigts qu'elles ne le sont pas.",
      action:
        'Mets pause deux ou trois fois, n’importe où, et refais le geste : pouce sur ①, index sur ②, majeur sur ③. Le verdict doit sortir en une seconde.',
    },
    {
      scene: 'twins',
      title: 'Étape 4 — le faux jumeau',
      observe:
        "Les empilements 1 et 2 sont dessinés presque dans la même orientation : même bras, même saillie, même inclinaison. Seul le bout qui porte le cube du dessus change.",
      why: "Deux figures qui se ressemblent BEAUCOUP sont à contrôler en priorité, jamais à apparier d'office. Ici la ressemblance ne vient pas d'une rotation nulle : elle vient de ce que le miroir a été dessiné dans la même orientation que l'original.",
      pitfall:
        "Le réflexe est d'apparier 1 et 2 « puisqu'ils sont pareils », donc de répondre 3. C'est faux, et c'est l'erreur la plus fréquente de l'exercice. La ressemblance visuelle ne mesure que l'écart d'orientation, jamais la symétrie.",
    },
    {
      scene: 'hands',
      title: 'Étape 5 — le repère extrait : compare des flèches, pas des images',
      observe:
        "Sous chaque figure, ses trois flèches ramenées à un même point : son repère. Les repères de 1 et 3 sont le même trio, tourné. Celui de 2 est le trio INVERSÉ — signe − au lieu de +.",
      why: "Comparer trois images demande de les tenir toutes en tête pendant qu'on les tourne — on perd le fil à la deuxième. Trois verdicts (main droite / main gauche) tiennent en mémoire sans effort, et se comparent d'un coup d'œil.",
      action:
        'Formule les trois verdicts d’affilée, sans revenir en arrière sur une figure déjà jugée. 4 secondes au total.',
    },
    {
      scene: 'answer',
      title: 'La réponse : empilement 2',
      observe:
        'Les empilements 1 et 3 partagent la même main : ils sont le même objet, séparés d’un quart de tour. Le 2 est de main opposée : c’est lui qui a subi la symétrie.',
      why: "Dès que deux figures partagent la même main, la réponse est acquise : ne contrôle pas la troisième, elle ne t'apprendra rien. Budget 10 s : 4 s pour les trois verdicts, 3 s pour apparier, 3 s de marge.",
      action:
        'Contre-épreuve, seulement si le temps le permet : refais le geste des trois doigts sur les deux figures déclarées identiques — même main attendue des deux côtés.',
    },
    {
      scene: 'real',
      title: 'Au format réel',
      observe:
        "Un item tel que le test le pose : une dizaine de cubes, chaque figure basculée d'un angle quelconque. Les trois rôles sont moins évidents — c'est voulu.",
      why: "La méthode ne change PAS : plus long bras, ce qui sort de son milieu, ce qui est posé au bout, trois flèches, un sens. Ce qui change est le temps de retrouver les rôles — c'est précisément ce que l'entraînement fait baisser.",
      action:
        "Si la figure a plusieurs bras de même longueur, prends n'importe lequel — mais LE MÊME choix sur les trois figures : la main se compare, elle ne se lit pas dans l'absolu.",
    },
  ],
};
