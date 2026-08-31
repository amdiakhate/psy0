import { Glyph, symbolName } from '../CubeSvg';
import { POS } from '../cube-model';
import type { Cube } from '../domain/types';
import type { FaceId, FacePosition } from '../domain/types';

export const NET_CELLS: ReadonlyArray<{ position: FacePosition; col: number; row: number }> = [
  { position: POS.U, col: 1, row: 0 },
  { position: POS.L, col: 0, row: 1 },
  { position: POS.F, col: 1, row: 1 },
  { position: POS.R, col: 2, row: 1 },
  { position: POS.B, col: 3, row: 1 },
  { position: POS.D, col: 1, row: 2 },
];

const POSITION_NAMES: Readonly<Record<FacePosition, string>> = {
  [POS.R]: 'case à droite du centre',
  [POS.L]: 'case à gauche du centre',
  [POS.U]: 'case au-dessus du centre',
  [POS.D]: 'case sous le centre',
  [POS.F]: 'case centrale',
  [POS.B]: 'case à l’extrémité droite',
};

export function netPositionName(position: FacePosition): string {
  return POSITION_NAMES[position];
}

export function faceName(cube: Cube, faceId: FaceId): string {
  const face = cube.find((candidate) => candidate.id === faceId);
  if (!face) return faceId;
  return symbolName(face.sym);
}

export function CoachNet({
  cube,
  label,
  highlights = {},
  compact = false,
}: {
  cube: readonly (Cube[number] | null)[];
  label: string;
  highlights?: Partial<Record<FacePosition, 'correct' | 'wrong' | 'focus' | 'pair-a' | 'pair-b' | 'pair-c'>>;
  compact?: boolean;
}) {
  const size = compact ? 42 : 54;
  const colors = {
    correct: '#22c55e',
    wrong: '#ef4444',
    focus: '#f59e0b',
    'pair-a': '#38bdf8',
    'pair-b': '#4ade80',
    'pair-c': '#c084fc',
  } as const;
  return (
    <figure className="min-w-0">
      <figcaption className="mb-2 text-center text-xs font-medium text-zinc-400">{label}</figcaption>
      <svg
        viewBox={`0 0 ${4 * size + 2} ${3 * size + 2}`}
        className="mx-auto h-auto w-full max-w-[250px]"
        role="img"
        aria-label={label}
      >
        {NET_CELLS.map(({ position, col, row }) => {
          const face = cube[position];
          const state = highlights[position];
          return (
            <g key={position} transform={`translate(${col * size + 1} ${row * size + 1})`}>
              <rect
                width={size}
                height={size}
                rx={3}
                fill={face ? '#27272a' : '#09090b'}
                stroke={state ? colors[state] : '#52525b'}
                strokeWidth={state ? 3 : 1}
                strokeDasharray={face ? undefined : '5 4'}
              />
              {face && (
                <g transform={`scale(${size / 100})`}>
                  <Glyph sym={face.sym} rot={face.rot} color={state === 'wrong' ? '#fca5a5' : '#e4e4e7'} />
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </figure>
  );
}

export function RingDiagram({
  center,
  order,
  cube,
  tone = 'blue',
  label,
}: {
  center: FaceId;
  order: readonly FaceId[];
  cube: Cube;
  tone?: 'blue' | 'green' | 'red';
  label: string;
}) {
  const stroke = tone === 'green' ? '#22c55e' : tone === 'red' ? '#ef4444' : '#38bdf8';
  const coordinates = [
    [100, 25],
    [175, 100],
    [100, 175],
    [25, 100],
  ] as const;
  return (
    <figure className="min-w-0">
      <figcaption className="mb-2 text-center text-xs font-medium text-zinc-400">{label}</figcaption>
      <svg viewBox="0 0 200 200" className="mx-auto h-auto w-full max-w-[220px]" role="img" aria-label={`${label} : ${order.map((id) => faceName(cube, id)).join(', ')}`}>
        <defs>
          <marker id={`ring-arrow-${tone}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={stroke} />
          </marker>
        </defs>
        <path d="M108 20 A82 82 0 0 1 180 92" fill="none" stroke={stroke} strokeWidth="3" markerEnd={`url(#ring-arrow-${tone})`} />
        <path d="M180 108 A82 82 0 0 1 108 180" fill="none" stroke={stroke} strokeWidth="3" markerEnd={`url(#ring-arrow-${tone})`} />
        <path d="M92 180 A82 82 0 0 1 20 108" fill="none" stroke={stroke} strokeWidth="3" markerEnd={`url(#ring-arrow-${tone})`} />
        <path d="M20 92 A82 82 0 0 1 92 20" fill="none" stroke={stroke} strokeWidth="3" markerEnd={`url(#ring-arrow-${tone})`} />
        <rect x="70" y="70" width="60" height="60" rx="8" fill="#18181b" stroke={stroke} strokeWidth="2" />
        <text x="100" y="108" textAnchor="middle" fill="#fafafa" fontSize="28" fontWeight="700">{faceName(cube, center)}</text>
        {coordinates.map(([x, y], index) => (
          <g key={`${order[index]}-${index}`}>
            <circle cx={x} cy={y} r="21" fill="#27272a" stroke="#71717a" />
            <text x={x} y={y + 6} textAnchor="middle" fill="#e4e4e7" fontSize="20" fontWeight="700">{faceName(cube, order[index])}</text>
            <circle cx={x - 15} cy={y - 15} r="8" fill={stroke} />
            <text x={x - 15} y={y - 12} textAnchor="middle" fill="#09090b" fontSize="9" fontWeight="800">{index + 1}</text>
          </g>
        ))}
      </svg>
    </figure>
  );
}

export function OppositePairsDiagram({ cube }: { cube: Cube }) {
  const pairs: Array<{ positions: [FacePosition, FacePosition]; color: string }> = [
    { positions: [POS.L, POS.R], color: '#38bdf8' },
    { positions: [POS.F, POS.B], color: '#4ade80' },
    { positions: [POS.U, POS.D], color: '#c084fc' },
  ];
  return (
    <div className="grid gap-2 sm:grid-cols-3" aria-label="Les trois paires de faces opposées">
      {pairs.map(({ positions, color }) => (
        <div key={positions.join('-')} className="flex items-center justify-center gap-3 rounded-xl bg-zinc-950/70 px-3 py-3">
          {[cube[positions[0]], cube[positions[1]]].map((face, index) => (
            <div key={face.id} className="flex items-center gap-3">
              {index === 1 && <span className="h-px w-5" style={{ backgroundColor: color }} aria-hidden />}
              <span className="grid h-10 w-10 place-items-center rounded-md border text-lg font-bold" style={{ borderColor: color, color }}>
                {faceName(cube, face.id)}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
