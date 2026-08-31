import type { Cube } from './cube-model';
import { POS } from './cube-model';

/**
 * Symboles orientés et chiraux (flèche, L, drapeau, T, P, S) dessinés dans une
 * boîte 100×100, pointe en haut. La chiralité rend les pièges miroir visibles.
 */
/**
 * Les symboles de Pilotest, en deux familles.
 *
 * LETTRES — leurs quatre orientations se distinguent toutes, donc l'orientation
 * décide de la réponse. C'est la famille difficile.
 *
 * FORMES — carré, octogone, cercle, trèfle, étoile : toutes invariantes par
 * quart de tour, leur orientation ne compte donc pas. Seule la croix latine, au
 * bras inférieur plus long, en garde une. Ce contraste est voulu : il existe
 * des questions où la seule difficulté est de savoir QUEL symbole va où.
 *
 * L'ordre de cette liste est celui de `SYMBOL_QUARTER_SYMMETRY` dans
 * `cube-model.ts` — un test verrouille leur alignement.
 */
export type SymbolDef =
  | { kind: 'letter'; char: string }
  | { kind: 'shape'; path: string };

export const SYMBOLS: SymbolDef[] = [
  { kind: 'letter', char: 'L' },
  { kind: 'letter', char: 'F' },
  { kind: 'letter', char: 'G' },
  { kind: 'letter', char: 'J' },
  { kind: 'letter', char: 'Q' },
  { kind: 'letter', char: 'E' },
  { kind: 'shape', path: 'M28 28 H72 V72 H28 Z' },
  { kind: 'shape', path: 'M37 22 H63 L78 37 V63 L63 78 H37 L22 63 V37 Z' },
  { kind: 'shape', path: 'M23 50 a27 27 0 1 0 54 0 a27 27 0 1 0 -54 0 Z' },
  { kind: 'shape', path: 'M36 29 a14 14 0 1 0 28 0 a14 14 0 1 0 -28 0 Z M57 50 a14 14 0 1 0 28 0 a14 14 0 1 0 -28 0 Z M36 71 a14 14 0 1 0 28 0 a14 14 0 1 0 -28 0 Z M15 50 a14 14 0 1 0 28 0 a14 14 0 1 0 -28 0 Z' },
  { kind: 'shape', path: 'M50.0 18.0 L55.0 38.0 L72.6 27.4 L62.0 45.0 L82.0 50.0 L62.0 55.0 L72.6 72.6 L55.0 62.0 L50.0 82.0 L45.0 62.0 L27.4 72.6 L38.0 55.0 L18.0 50.0 L38.0 45.0 L27.4 27.4 L45.0 38.0 Z' },
  { kind: 'shape', path: 'M44 18 H56 V38 H76 V50 H56 V82 H44 V50 H24 V38 H44 Z' },
];

/** Index des symboles de chaque famille — une question n'en mélange jamais deux. */
export const LETTER_SYMS = [0, 1, 2, 3, 4, 5];
export const SHAPE_SYMS = [6, 7, 8, 9, 10, 11];

const SHAPE_NAMES = ['carré', 'octogone', 'cercle', 'trèfle', 'étoile', 'croix'] as const;

/** Libellé utilisateur du symbole réellement dessiné sur une face. */
export function symbolName(sym: number): string {
  const definition = SYMBOLS[sym];
  if (!definition) return `symbole ${sym + 1}`;
  if (definition.kind === 'letter') return definition.char;
  return SHAPE_NAMES[sym - LETTER_SYMS.length] ?? `symbole ${sym + 1}`;
}

export function Glyph({ sym, rot, color = 'var(--ink-200)' }: { sym: number; rot: number; color?: string }) {
  // rot = quarts de tour anti-horaires dans le repère (u droite, v haut) de la
  // face ⇒ rotate(-90·rot) en SVG (y vers le bas). Convention IDENTIQUE patron/cube.
  const def = SYMBOLS[sym] ?? SYMBOLS[0];
  return (
    <g transform={`rotate(${-90 * rot} 50 50)`}>
      {def.kind === 'letter' ? (
        <text
          x={50}
          y={53}
          textAnchor="middle"
          dominantBaseline="central"
          fill={color}
          style={{ fontSize: 64, fontWeight: 800, fontFamily: 'Helvetica, Arial, sans-serif' }}
        >
          {def.char}
        </text>
      ) : (
        <path d={def.path} fill={color} fillRule="evenodd" />
      )}
    </g>
  );
}

/** Patron en croix :  U / L F R B / D — se plie exactement sur l'état du cube. */
export function NetSvg({ cube, size = 44 }: { cube: Cube; size?: number }) {
  const cells: Array<{ pos: number; col: number; row: number }> = [
    { pos: POS.U, col: 1, row: 0 },
    { pos: POS.L, col: 0, row: 1 },
    { pos: POS.F, col: 1, row: 1 },
    { pos: POS.R, col: 2, row: 1 },
    { pos: POS.B, col: 3, row: 1 },
    { pos: POS.D, col: 1, row: 2 },
  ];
  const s = size;
  return (
    <svg width={4 * s + 2} height={3 * s + 2} viewBox={`0 0 ${4 * s + 2} ${3 * s + 2}`}>
      {cells.map(({ pos, col, row }) => (
        <g key={pos} transform={`translate(${col * s + 1} ${row * s + 1})`}>
          <rect width={s} height={s} fill="var(--ink-800)" stroke="var(--ink-500)" />
          <g transform={`scale(${s / 100})`}>
            <Glyph sym={cube[pos].sym} rot={cube[pos].rot} />
          </g>
        </g>
      ))}
    </svg>
  );
}

interface V3 {
  x: number;
  y: number;
  z: number;
}

function project(p: V3, s: number, cx: number, cy: number): [number, number] {
  return [cx + (p.x - p.z) * 0.866 * s, cy + (p.x + p.z) * 0.5 * s - p.y * s];
}

/** Une face du cube isométrique : coin (u=0,v=0), arêtes U et V en coordonnées monde. */
function IsoFace({
  cube,
  pos,
  corner,
  eu,
  ev,
  fill,
  s,
  cx,
  cy,
}: {
  cube: Cube;
  pos: number;
  corner: V3;
  eu: V3;
  ev: V3;
  fill: string;
  s: number;
  cx: number;
  cy: number;
}) {
  const add = (a: V3, b: V3): V3 => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z });
  const p00 = project(corner, s, cx, cy);
  const p10 = project(add(corner, eu), s, cx, cy);
  const p11 = project(add(add(corner, eu), ev), s, cx, cy);
  const p01 = project(add(corner, ev), s, cx, cy);
  // Matrice : boîte 100×100 (y vers le bas) → parallélogramme de la face,
  // avec « haut de la boîte » = direction v de la face.
  const a = (p10[0] - p00[0]) / 100;
  const b = (p10[1] - p00[1]) / 100;
  const c = -(p01[0] - p00[0]) / 100;
  const d = -(p01[1] - p00[1]) / 100;
  const e = p01[0];
  const f = p01[1];
  return (
    <g>
      <polygon
        points={`${p00} ${p10} ${p11} ${p01}`}
        fill={fill}
        stroke="var(--ink-600)"
        strokeWidth={1}
      />
      <g transform={`matrix(${a} ${b} ${c} ${d} ${e} ${f})`}>
        <Glyph sym={cube[pos].sym} rot={cube[pos].rot} color="var(--ink-900)" />
      </g>
    </g>
  );
}

/** Cube isométrique montrant les faces F (avant-gauche), U (dessus), R (avant-droite). */
export function IsoCubeSvg({ cube, size = 40 }: { cube: Cube; size?: number }) {
  const s = size;
  const w = 3.6 * s;
  const h = 3.6 * s;
  const cx = w / 2;
  const cy = h / 2;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <IsoFace cube={cube} pos={POS.U} corner={{ x: -1, y: 1, z: 1 }} eu={{ x: 2, y: 0, z: 0 }} ev={{ x: 0, y: 0, z: -2 }} fill="var(--ink-400)" s={s} cx={cx} cy={cy} />
      <IsoFace cube={cube} pos={POS.F} corner={{ x: -1, y: -1, z: 1 }} eu={{ x: 2, y: 0, z: 0 }} ev={{ x: 0, y: 2, z: 0 }} fill="var(--ink-300)" s={s} cx={cx} cy={cy} />
      <IsoFace cube={cube} pos={POS.R} corner={{ x: 1, y: -1, z: 1 }} eu={{ x: 0, y: 0, z: -2 }} ev={{ x: 0, y: 2, z: 0 }} fill="var(--ink-500)" s={s} cx={cx} cy={cy} />
    </svg>
  );
}
