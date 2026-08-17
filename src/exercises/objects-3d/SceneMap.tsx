import { VIEWPOINT_COUNT, VIEW_RADIUS } from './config';
import { OBJECT_COLORS, OBJECT_LABELS, viewpointPosition } from './scene';
import type { SceneObject } from './scene';

/**
 * Le plan vu du dessus : les objets et les 8 ronds numérotés.
 * Convention : x monde → x écran, z monde → y écran (on regarde le sol depuis +Y).
 */

const SIZE = 320;
const CENTER = SIZE / 2;
const SCALE = (SIZE / 2 - 30) / VIEW_RADIUS;

const sx = (x: number) => CENTER + x * SCALE;
const sy = (z: number) => CENTER + z * SCALE;

function ObjectGlyph({ o }: { o: SceneObject }) {
  const color = OBJECT_COLORS[o.kind];
  const label = OBJECT_LABELS[o.kind];
  const cx = sx(o.x);
  const cy = sy(o.z);
  const w = label.length * 5.2 + 8;
  return (
    <g>
      <rect x={cx - w / 2} y={cy - 22} width={w} height={13} rx={3} fill="#09090be6" />
      <text x={cx} y={cy - 12} textAnchor="middle" fontSize={9} fill="#e4e4e7" className="select-none">
        {label}
      </text>
      <circle cx={cx} cy={cy} r={6.5} fill={color} stroke="#18181b" strokeWidth={1.5} />
    </g>
  );
}

export function SceneMap({
  objects,
  onPick,
  highlight = null,
  reveal = null,
}: {
  objects: readonly SceneObject[];
  onPick?: (viewpoint: number) => void;
  /** Point de vue survolé / sélectionné. */
  highlight?: number | null;
  /** Point de vue à mettre en évidence (corrigé, démo). */
  reveal?: number | null;
}) {
  return (
    <svg
      width={SIZE}
      height={SIZE}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="rounded-xl border border-zinc-800 bg-zinc-900"
      role="img"
      aria-label="Plan du désert vu du dessus, avec les 8 points de vue numérotés"
    >
      <circle
        cx={CENTER}
        cy={CENTER}
        r={VIEW_RADIUS * SCALE}
        fill="none"
        stroke="#3f3f46"
        strokeWidth={1.5}
        strokeDasharray="4 4"
      />
      <circle cx={CENTER} cy={CENTER} r={3} fill="#52525b" />

      {Array.from({ length: VIEWPOINT_COUNT }, (_, k) => {
        const p = viewpointPosition(k);
        const cx = sx(p.x);
        const cy = sy(p.z);
        const active = highlight === k || reveal === k;
        // Amorce de visée : un trait court vers le centre, qui ne traverse pas la carte.
        const len = active ? 0.62 : 0.16;
        return (
          <line
            key={k}
            x1={cx}
            y1={cy}
            x2={cx + (CENTER - cx) * len}
            y2={cy + (CENTER - cy) * len}
            stroke={active ? '#0ea5e9' : '#3f3f46'}
            strokeWidth={active ? 1.6 : 1}
            strokeDasharray={active ? undefined : '3 3'}
          />
        );
      })}

      {objects.map((o, i) => (
        <ObjectGlyph key={i} o={o} />
      ))}

      {Array.from({ length: VIEWPOINT_COUNT }, (_, k) => {
        const p = viewpointPosition(k);
        const cx = sx(p.x);
        const cy = sy(p.z);
        const active = highlight === k || reveal === k;
        return (
          <g
            key={k}
            onClick={onPick ? () => onPick(k) : undefined}
            className={onPick ? 'cursor-pointer' : undefined}
          >
            <circle
              cx={cx}
              cy={cy}
              r={13}
              fill={reveal === k ? '#166534' : active ? '#0369a1' : '#27272a'}
              stroke={active ? '#38bdf8' : '#52525b'}
              strokeWidth={1.5}
            />
            <text
              x={cx}
              y={cy + 4}
              textAnchor="middle"
              fontSize={12}
              fontWeight="bold"
              fill={active ? '#f0f9ff' : '#a1a1aa'}
              className="select-none"
            >
              {k + 1}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
