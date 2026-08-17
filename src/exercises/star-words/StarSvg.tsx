import { INTERSECTIONS, SLOT_COUNT, SLOT_LABELS, WORD_LENGTH, conflictingIntersections } from './geometry';
import type { Placement } from './geometry';

/* ------------------------------------------------------------------ */
/* Coordonnées                                                         */
/* ------------------------------------------------------------------ */

const R = 150; // rayon circonscrit des deux triangles
const H = Math.sqrt(3) / 2;

type Pt = [number, number];

const T: Pt = [0, -R];
const BR: Pt = [R * H, R / 2];
const BL: Pt = [-R * H, R / 2];
const TL: Pt = [-R * H, -R / 2];
const TR: Pt = [R * H, -R / 2];
const B: Pt = [0, R];

/** Les 6 segments, dans l'ordre des emplacements (cf. geometry.ts). */
const SEGMENTS: [Pt, Pt][] = [
  [T, BR],
  [BR, BL],
  [BL, T],
  [TL, TR],
  [TR, B],
  [B, TL],
];

/**
 * Les cases 2 et 4 tombent exactement sur les croisements des deux triangles
 * (au tiers et aux deux tiers du côté) : c'est ce qui rend le partage visuel
 * exact. Les cases 0 et 6 tomberaient, elles, pile sur les pointes, où deux
 * mots se rejoignent SANS partager la case — on les décale donc vers
 * l'extérieur pour que les deux cases restent distinctes et lisibles.
 */
const TIP_OFFSET = 0.78;

function cellPoint(slot: number, index: number): Pt {
  const [s, e] = SEGMENTS[slot];
  const dx = (e[0] - s[0]) / (WORD_LENGTH - 1);
  const dy = (e[1] - s[1]) / (WORD_LENGTH - 1);
  let x = s[0] + dx * index;
  let y = s[1] + dy * index;
  if (index === 0) {
    x -= dx * TIP_OFFSET;
    y -= dy * TIP_OFFSET;
  } else if (index === WORD_LENGTH - 1) {
    x += dx * TIP_OFFSET;
    y += dy * TIP_OFFSET;
  }
  return [x, y];
}

interface Cell {
  x: number;
  y: number;
  /** (emplacement, indice de lettre) — deux propriétaires si la case est commune. */
  owners: { slot: number; index: number }[];
  /** Index dans INTERSECTIONS, si la case est commune. */
  intersection: number | null;
}

/** Les 36 cases distinctes : 6 mots × 7 lettres − 6 cases communes comptées deux fois. */
const CELLS: Cell[] = (() => {
  const byKey = new Map<string, Cell>();
  const cells: Cell[] = [];
  INTERSECTIONS.forEach((x, i) => {
    const [px, py] = cellPoint(x.wordA, x.indexA);
    const cell: Cell = {
      x: px,
      y: py,
      owners: [
        { slot: x.wordA, index: x.indexA },
        { slot: x.wordB, index: x.indexB },
      ],
      intersection: i,
    };
    byKey.set(`${x.wordA}:${x.indexA}`, cell);
    byKey.set(`${x.wordB}:${x.indexB}`, cell);
    cells.push(cell);
  });
  for (let slot = 0; slot < SLOT_COUNT; slot++) {
    for (let index = 0; index < WORD_LENGTH; index++) {
      if (byKey.has(`${slot}:${index}`)) continue;
      const [x, y] = cellPoint(slot, index);
      cells.push({ x, y, owners: [{ slot, index }], intersection: null });
    }
  }
  return cells;
})();

/** Pastille de l'emplacement : au centre du segment, ramenée dans l'hexagone vide. */
function badgePoint(slot: number): Pt {
  const [s, e] = SEGMENTS[slot];
  const mx = (s[0] + e[0]) / 2;
  const my = (s[1] + e[1]) / 2;
  return [mx * 0.56, my * 0.56];
}

/* ------------------------------------------------------------------ */
/* Rendu                                                               */
/* ------------------------------------------------------------------ */

const CELL = 30;

export function StarSvg({
  placement,
  onSlotClick,
  activeSlot = null,
  highlightIntersections = [],
  size = 340,
}: {
  placement: Placement;
  onSlotClick?: (slot: number) => void;
  activeSlot?: number | null;
  highlightIntersections?: number[];
  size?: number;
}) {
  const conflicts = new Set(conflictingIntersections(placement));
  const highlighted = new Set(highlightIntersections);

  return (
    <svg
      viewBox="-205 -205 410 410"
      width={size}
      height={size}
      className="shrink-0 select-none rounded-xl border border-zinc-800 bg-zinc-950"
    >
      {/*
        Les 6 côtés des deux triangles, tracés d'une case extrême à l'autre :
        les traits dépassent donc légèrement les pointes, ce qui relie
        visuellement les deux cases distinctes de chaque pointe.
      */}
      {SEGMENTS.map((_, slot) => {
        const [x1, y1] = cellPoint(slot, 0);
        const [x2, y2] = cellPoint(slot, WORD_LENGTH - 1);
        return (
          <line
            key={`seg${slot}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#3f3f46"
            strokeWidth={1.5}
          />
        );
      })}

      {/* Zone cliquable de chaque segment (sous les cases). */}
      {onSlotClick &&
        SEGMENTS.map(([s, e], slot) => (
          <line
            key={`hit${slot}`}
            x1={s[0]}
            y1={s[1]}
            x2={e[0]}
            y2={e[1]}
            stroke="transparent"
            strokeWidth={CELL + 6}
            className="cursor-pointer"
            onClick={() => onSlotClick(slot)}
          />
        ))}

      {/* Segment sélectionné : surligné. */}
      {activeSlot !== null && (
        <line
          x1={SEGMENTS[activeSlot][0][0]}
          y1={SEGMENTS[activeSlot][0][1]}
          x2={SEGMENTS[activeSlot][1][0]}
          y2={SEGMENTS[activeSlot][1][1]}
          stroke="#0284c7"
          strokeWidth={CELL + 8}
          opacity={0.25}
          pointerEvents="none"
        />
      )}

      {CELLS.map((cell, i) => {
        const letters = cell.owners.map(({ slot, index }) => placement[slot]?.[index] ?? null);
        const inConflict = cell.intersection !== null && conflicts.has(cell.intersection);
        const isShared = cell.intersection !== null;
        const isHighlighted = cell.intersection !== null && highlighted.has(cell.intersection);
        const shown = letters.find((l) => l !== null) ?? null;

        const fill = inConflict
          ? '#450a0a'
          : isHighlighted
            ? '#164e63'
            : isShared
              ? '#082f49'
              : '#18181b';
        const stroke = inConflict
          ? '#ef4444'
          : isHighlighted
            ? '#22d3ee'
            : isShared
              ? '#0ea5e9'
              : '#3f3f46';

        return (
          <g key={i} pointerEvents="none">
            <rect
              x={cell.x - CELL / 2}
              y={cell.y - CELL / 2}
              width={CELL}
              height={CELL}
              rx={5}
              fill={fill}
              stroke={stroke}
              strokeWidth={isShared ? 2 : 1.2}
            />
            {inConflict ? (
              <text
                x={cell.x}
                y={cell.y + 5}
                textAnchor="middle"
                fontSize={14}
                fontWeight={700}
                fill="#fca5a5"
                fontFamily="ui-monospace, monospace"
              >
                {letters[0]}/{letters[1]}
              </text>
            ) : (
              shown && (
                <text
                  x={cell.x}
                  y={cell.y + 7}
                  textAnchor="middle"
                  fontSize={20}
                  fontWeight={700}
                  fill={isShared ? '#7dd3fc' : '#e4e4e7'}
                  fontFamily="ui-monospace, monospace"
                >
                  {shown}
                </text>
              )
            )}
          </g>
        );
      })}

      {/* Pastilles A-F, au centre de l'étoile. */}
      {SLOT_LABELS.map((label, slot) => {
        const [x, y] = badgePoint(slot);
        const filled = placement[slot] !== null && placement[slot] !== undefined;
        return (
          <g
            key={label}
            className={onSlotClick ? 'cursor-pointer' : undefined}
            onClick={onSlotClick ? () => onSlotClick(slot) : undefined}
          >
            <circle
              cx={x}
              cy={y}
              r={13}
              fill={activeSlot === slot ? '#0369a1' : filled ? '#27272a' : '#18181b'}
              stroke={activeSlot === slot ? '#38bdf8' : filled ? '#52525b' : '#71717a'}
              strokeWidth={1.5}
            />
            <text
              x={x}
              y={y + 5}
              textAnchor="middle"
              fontSize={14}
              fontWeight={700}
              fill={filled ? '#a1a1aa' : '#e4e4e7'}
              fontFamily="ui-monospace, monospace"
              pointerEvents="none"
            >
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
