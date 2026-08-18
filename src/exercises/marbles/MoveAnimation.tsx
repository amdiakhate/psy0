import { useMemo } from 'react';
import { CAPACITIES } from './model';
import type { State } from './model';
import { MARBLE_COLORS } from './config';
import { easeInOut, linear } from '../../anim/timeline';
import { useTimeline } from '../../hooks/useTimeline';

/**
 * La séquence de déplacements, JOUÉE.
 *
 * L'exercice ne demande pas de résoudre le puzzle mais de compter le minimum de
 * coups — et c'est justement pour ça qu'il faut avoir vu, au moins une fois, à
 * quoi ressemble un déplacement : une bille se prend SUR LE DESSUS d'un tube et
 * se pose SUR LE DESSUS d'un autre. Toute la contrainte de l'exercice — les
 * billes bloquantes — découle de cette seule règle, et une bille qui monte,
 * traverse, puis redescend la rend évidente.
 *
 * Les états intermédiaires ne sont pas dessinés à la main : ils sont DÉDUITS de
 * la liste des coups, si bien qu'une animation fausse serait un état final faux,
 * et le test l'attraperait.
 */

export interface Move {
  from: number;
  to: number;
  note: string;
}

/** Applique un coup : la bille du dessus de `from` passe sur le dessus de `to`. */
export function applyMove(state: State, move: Move): State {
  const next = state.map((tube) => [...tube]) as State;
  const marble = next[move.from].pop();
  if (marble === undefined) throw new Error(`Tube ${move.from} vide : coup impossible`);
  if (next[move.to].length >= CAPACITIES[move.to]) throw new Error(`Tube ${move.to} plein`);
  next[move.to].push(marble);
  return next;
}

/** Tous les états traversés, du départ à l'arrivée. */
export function statesOf(start: State, moves: Move[]): State[] {
  const out: State[] = [start];
  for (const m of moves) out.push(applyMove(out[out.length - 1], m));
  return out;
}

const LIFT_MS = 520;
const CROSS_MS = 620;
const DROP_MS = 520;
const HOLD_MS = 900;

export function MoveAnimation({
  start,
  moves,
  size = 1,
}: {
  start: State;
  moves: Move[];
  size?: number;
}) {
  const states = useMemo(() => statesOf(start, moves), [start, moves]);
  const segments = useMemo(
    () => [
      { to: 0, ms: HOLD_MS, ease: linear },
      ...moves.flatMap((_, i) => [
        { to: i + 1 / 3, ms: LIFT_MS, ease: easeInOut },
        { to: i + 2 / 3, ms: CROSS_MS, ease: easeInOut },
        { to: i + 1, ms: DROP_MS, ease: easeInOut },
        { to: i + 1, ms: HOLD_MS, ease: linear },
      ]),
    ],
    [moves],
  );
  const { value, playing, toggle, scrub } = useTimeline(segments);

  const R = 17 * size;
  const GAP = 5 * size;
  const TUBE_W = 2 * R + 10 * size;
  const TUBE_GAP = 16 * size;
  const maxCap = Math.max(...CAPACITIES);
  const H = maxCap * (2 * R + GAP) + 14 * size;
  const W = 3 * TUBE_W + 2 * TUBE_GAP;
  const FLY_Y = 6 * size; // hauteur de survol, au-dessus de tous les tubes

  const moveIndex = Math.min(Math.floor(value), moves.length - 1);
  const phase = moves.length === 0 ? 0 : value - moveIndex;
  const inFlight = value < moves.length && phase > 0;
  const move = moves[moveIndex];
  const before = states[moveIndex];

  /** Centre d'une bille posée au rang `i` du tube `t`. */
  const seat = (t: number, i: number): [number, number] => {
    const x = t * (TUBE_W + TUBE_GAP);
    const tubeH = CAPACITIES[t] * (2 * R + GAP) + 8 * size;
    const y = H - tubeH;
    return [x + TUBE_W / 2, y + tubeH - 8 * size - R - i * (2 * R + GAP)];
  };

  // État affiché : le dernier état atteint, la bille en vol retirée de son tube.
  const shown: State = inFlight
    ? (before.map((tube, t) => (t === move.from ? tube.slice(0, -1) : [...tube])) as State)
    : states[Math.min(Math.round(value), states.length - 1)];

  let flying: { marble: number; x: number; y: number } | null = null;
  if (inFlight) {
    const marble = before[move.from][before[move.from].length - 1];
    const [fx, fy] = seat(move.from, before[move.from].length - 1);
    const [tx, ty] = seat(move.to, before[move.to].length);
    if (phase < 1 / 3) {
      const k = phase * 3;
      flying = { marble, x: fx, y: fy + (FLY_Y - fy) * k };
    } else if (phase < 2 / 3) {
      const k = (phase - 1 / 3) * 3;
      flying = { marble, x: fx + (tx - fx) * k, y: FLY_Y };
    } else {
      const k = (phase - 2 / 3) * 3;
      flying = { marble, x: tx, y: FLY_Y + (ty - FLY_Y) * k };
    }
  }

  const done = Math.min(Math.floor(value + 0.001), moves.length);

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Déplacement de billes">
        {CAPACITIES.map((cap, t) => {
          const x = t * (TUBE_W + TUBE_GAP);
          const tubeH = cap * (2 * R + GAP) + 8 * size;
          const y = H - tubeH;
          const isSource = inFlight && t === move.from;
          const isTarget = inFlight && t === move.to;
          return (
            <g key={t}>
              <path
                d={`M${x},${y} L${x},${y + tubeH - TUBE_W / 2} A${TUBE_W / 2},${TUBE_W / 2} 0 0 0 ${x + TUBE_W},${y + tubeH - TUBE_W / 2} L${x + TUBE_W},${y}`}
                fill="var(--ink-900)"
                stroke={isTarget ? '#22c55e' : isSource ? '#0ea5e9' : 'var(--ink-500)'}
                strokeWidth={(isSource || isTarget ? 3 : 2) * size}
              />
            </g>
          );
        })}
        {shown.map((tube, t) =>
          tube.map((marble, i) => {
            const [cx, cy] = seat(t, i);
            return <Marble key={`${t}-${i}`} marble={marble} cx={cx} cy={cy} r={R} size={size} />;
          }),
        )}
        {flying && <Marble marble={flying.marble} cx={flying.x} cy={flying.y} r={R} size={size} halo />}
      </svg>

      <p className="min-h-[20px] text-center text-sm text-zinc-300">
        {value >= moves.length ? 'Arrivée atteinte.' : move.note}
      </p>

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
          max={moves.length}
          step={0.01}
          value={value}
          onChange={(e) => scrub(Number(e.target.value))}
          className="flex-1 accent-sky-500"
          aria-label="Avancement des déplacements"
        />
        <span className="w-20 text-right font-mono text-xs text-zinc-500">
          {done} / {moves.length} coups
        </span>
      </div>
    </div>
  );
}

function Marble({
  marble,
  cx,
  cy,
  r,
  size = 1,
  halo = false,
}: {
  marble: number;
  cx: number;
  cy: number;
  r: number;
  size?: number;
  halo?: boolean;
}) {
  return (
    <g>
      {halo && <circle cx={cx} cy={cy} r={r + 4} fill="none" stroke="#0ea5e9" strokeWidth={2} opacity={0.8} />}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={MARBLE_COLORS[marble % MARBLE_COLORS.length]}
        stroke="var(--ink-950)"
        strokeWidth={1.5}
      />
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#ffffff"
        style={{ fontSize: 15 * size, fontWeight: 700 }}
      >
        {marble}
      </text>
    </g>
  );
}
