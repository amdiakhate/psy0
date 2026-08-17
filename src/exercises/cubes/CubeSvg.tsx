import type { Cube } from './cube-model';
import { POS } from './cube-model';

/**
 * Symboles orientés et chiraux (flèche, L, drapeau, T, P, S) dessinés dans une
 * boîte 100×100, pointe en haut. La chiralité rend les pièges miroir visibles.
 */
export const SYMBOL_PATHS = [
  'M50 12 L78 48 L60 48 L60 88 L40 88 L40 48 L22 48 Z', // flèche ↑
  'M30 12 H50 V70 H80 V88 H30 Z', // L
  'M40 12 H48 V88 H40 Z M48 16 L84 30 L48 44 Z', // drapeau
  'M20 12 H80 V30 H60 V88 H40 V30 H20 Z', // T
  'M32 12 H68 Q84 12 84 34 Q84 56 68 56 H48 V88 H32 Z', // P
  'M24 12 H76 V30 H44 V44 H76 V88 H24 V70 H56 V56 H24 Z', // S
];

function Glyph({ sym, rot, color = '#e4e4e7' }: { sym: number; rot: number; color?: string }) {
  // rot = quarts de tour anti-horaires dans le repère (u droite, v haut) de la
  // face ⇒ rotate(-90·rot) en SVG (y vers le bas). Convention IDENTIQUE patron/cube.
  return (
    <g transform={`rotate(${-90 * rot} 50 50)`}>
      <path d={SYMBOL_PATHS[sym]} fill={color} />
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
          <rect width={s} height={s} fill="#27272a" stroke="#71717a" />
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
        stroke="#52525b"
        strokeWidth={1}
      />
      <g transform={`matrix(${a} ${b} ${c} ${d} ${e} ${f})`}>
        <Glyph sym={cube[pos].sym} rot={cube[pos].rot} color="#18181b" />
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
      <IsoFace cube={cube} pos={POS.U} corner={{ x: -1, y: 1, z: 1 }} eu={{ x: 2, y: 0, z: 0 }} ev={{ x: 0, y: 0, z: -2 }} fill="#a1a1aa" s={s} cx={cx} cy={cy} />
      <IsoFace cube={cube} pos={POS.F} corner={{ x: -1, y: -1, z: 1 }} eu={{ x: 2, y: 0, z: 0 }} ev={{ x: 0, y: 2, z: 0 }} fill="#d4d4d8" s={s} cx={cx} cy={cy} />
      <IsoFace cube={cube} pos={POS.R} corner={{ x: 1, y: -1, z: 1 }} eu={{ x: 0, y: 0, z: -2 }} ev={{ x: 0, y: 2, z: 0 }} fill="#71717a" s={s} cx={cx} cy={cy} />
    </svg>
  );
}
