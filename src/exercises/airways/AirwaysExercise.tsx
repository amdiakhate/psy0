import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import type { ExerciseComponentProps } from '../../core/types';
import type { AirwaysQuestion, Plane, PlaneColor } from './generator';
import { inGreyZone, isOnBoard, planeCol, violationAt } from './generator';

const CELL = 22;
const ROW = 26;

const COLORS: Record<PlaneColor, { fill: string; bar: string; label: string }> = {
  purple: { fill: '#7c3aed', bar: '#8b5cf6', label: 'violets ▶' },
  blue: { fill: '#38bdf8', bar: '#7dd3fc', label: 'bleus ◀' },
};

/**
 * Airways : simulation temps réel (les avions avancent d'une case par pas).
 * Déroutage — petite croix en bout de ligne : UN avion de cette ligne ;
 * grosse croix latérale : TOUS les avions de cette couleur (coûteux).
 * Accident dès qu'un critère de fluidité casse dans un bloc.
 */
export function AirwaysExercise({
  item,
  onContinuousEvent,
  onFinished,
}: ExerciseComponentProps<AirwaysQuestion, string>) {
  const q = item.question;
  const [tick, setTick] = useState(0);
  const [accident, setAccident] = useState<null | { group: number; reason: 'flow-total' | 'flow-blue' }>(null);
  const [, forceRender] = useReducer((x: number) => x + 1, 0);

  const removed = useRef(new Set<number>());
  const exited = useRef(new Set<number>());
  const reroutes = useRef(0);
  const done = useRef(false);
  const tickRef = useRef(0);
  tickRef.current = tick;

  const cbRef = useRef({ onContinuousEvent, onFinished });
  cbRef.current = { onContinuousEvent, onFinished };

  useEffect(() => {
    removed.current = new Set();
    exited.current = new Set();
    reroutes.current = 0;
    done.current = false;
    setTick(0);
    setAccident(null);

    // Les timers de fin de séquence doivent être annulés au démontage, sinon
    // l'ancien couperait la séquence suivante.
    let endTimer: ReturnType<typeof setTimeout> | undefined;

    const timer = setInterval(() => {
      setTick((t) => {
        if (done.current) return t;
        const next = t + 1;

        // Avions sortis normalement : un event de trafic écoulé chacun.
        for (const p of q.planes) {
          if (removed.current.has(p.id) || exited.current.has(p.id)) continue;
          if (next > p.spawnTick && !isOnBoard(p, next, q.cols)) {
            exited.current.add(p.id);
            cbRef.current.onContinuousEvent?.({
              tags: ['flow'],
              correct: true,
              rtMs: q.tickMs,
              given: 'trafic écoulé',
              expected: 'trafic écoulé',
            });
          }
        }

        const violation = violationAt(q, next, removed.current);
        if (violation) {
          done.current = true;
          clearInterval(timer);
          setAccident(violation);
          cbRef.current.onContinuousEvent?.({
            tags: ['accident', violation.reason],
            correct: false,
            rtMs: q.tickMs,
            given:
              violation.reason === 'flow-blue'
                ? `${q.maxBlue + 1} bleus en zone grise`
                : `${q.maxTotal + 1} avions en zone grise`,
            expected: 'critères de fluidité respectés',
          });
          endTimer = setTimeout(() => cbRef.current.onFinished?.(), 2200);
          return next;
        }

        if (next >= q.durationTicks) {
          done.current = true;
          clearInterval(timer);
          // Score de stratégie : réussi = pas d'accident ; « bien joué » = pas plus
          // de déroutages que la stratégie chirurgicale de référence.
          cbRef.current.onContinuousEvent?.({
            tags: ['strategy'],
            correct: reroutes.current <= q.par,
            rtMs: q.tickMs,
            given: `${reroutes.current} avion(s) dérouté(s)`,
            expected: `≤ ${q.par}`,
          });
          endTimer = setTimeout(() => cbRef.current.onFinished?.(), 900);
        }
        return next;
      });
    }, q.tickMs);

    return () => {
      done.current = true;
      clearInterval(timer);
      if (endTimer !== undefined) clearTimeout(endTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.seed]);

  const livePlanes = useCallback(
    (filter: (p: Plane) => boolean) =>
      q.planes.filter(
        (p) => !removed.current.has(p.id) && isOnBoard(p, tickRef.current, q.cols) && filter(p),
      ),
    [q],
  );

  /** Petite croix : déroute UN avion (le plus avancé) de cette ligne et couleur. */
  const rerouteOne = (group: number, line: number, color: PlaneColor) => {
    if (done.current) return;
    const candidates = livePlanes((p) => p.group === group && p.line === line && p.color === color);
    if (candidates.length === 0) return;
    const mostAdvanced = candidates.reduce((a, b) => (b.spawnTick < a.spawnTick ? b : a));
    removed.current.add(mostAdvanced.id);
    reroutes.current += 1;
    forceRender();
  };

  /** Grosse croix : déroute TOUS les avions de cette couleur sur le plateau. */
  const rerouteAll = (color: PlaneColor) => {
    if (done.current) return;
    const all = livePlanes((p) => p.color === color);
    if (all.length === 0) return;
    all.forEach((p) => removed.current.add(p.id));
    reroutes.current += all.length;
    forceRender();
  };

  const boardWidth = q.cols * CELL;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3">
      <div className="flex w-full max-w-4xl items-center justify-between text-sm">
        <span className="text-zinc-400">
          Déroutés : <span className="font-mono text-lg text-sky-300">{reroutes.current}</span>
          <span className="text-zinc-600"> · référence ≤ {q.par} · le moins possible</span>
        </span>
        <span className="font-mono text-zinc-400">
          {Math.max(0, Math.round(((q.durationTicks - tick) * q.tickMs) / 1000))} s
        </span>
      </div>

      <div className="flex w-full max-w-4xl items-stretch gap-1.5">
        {/* Grosse croix violette (gauche) : déroute tous les violets */}
        <SideBar color="purple" onClick={() => rerouteAll('purple')} count={livePlanes((p) => p.color === 'purple').length} />

        <div className="flex-1">
          {q.zones.map((zone, g) => {
            const occupants = q.planes.filter(
              (p) => p.group === g && !removed.current.has(p.id) && inGreyZone(p, tick, q),
            );
            const blues = occupants.filter((p) => p.color === 'blue').length;
            const total = occupants.length;
            const faulty = accident?.group === g;
            const counters = (
              <div className="flex justify-center gap-1">
                <Counter value={blues} max={q.maxBlue} label="◀ bleus" danger={blues >= q.maxBlue} />
                <Counter value={total} max={q.maxTotal} label="total" danger={total >= q.maxTotal} />
              </div>
            );
            return (
              <div key={g} className={g > 0 ? 'mt-1.5' : ''}>
                {g === 0 && counters}
                <svg
                  viewBox={`0 0 ${boardWidth} ${6 * ROW}`}
                  className="w-full rounded border border-zinc-600 bg-zinc-100"
                >
                  {/* Zone grise, en escalier : un intervalle par ligne */}
                  {zone.perLine.map((span, line) => (
                    <rect
                      key={line}
                      x={span.start * CELL}
                      y={line * ROW}
                      width={(span.end - span.start + 1) * CELL}
                      height={ROW}
                      fill={faulty ? '#f59e0b' : 'var(--ink-400)'}
                      opacity={faulty ? 0.95 : 0.5}
                    />
                  ))}
                  {/* Grille */}
                  {Array.from({ length: q.cols + 1 }, (_, c) => (
                    <line key={`c${c}`} x1={c * CELL} y1={0} x2={c * CELL} y2={6 * ROW} stroke="var(--ink-300)" strokeWidth={0.5} />
                  ))}
                  {Array.from({ length: 7 }, (_, r) => (
                    <line key={`r${r}`} x1={0} y1={r * ROW} x2={boardWidth} y2={r * ROW} stroke="var(--ink-400)" strokeWidth={0.7} />
                  ))}
                  {/* Avions */}
                  {q.planes
                    .filter((p) => p.group === g && !removed.current.has(p.id) && isOnBoard(p, tick, q.cols))
                    .map((p) => {
                      const cx = planeCol(p, tick, q.cols) * CELL + CELL / 2;
                      const cy = p.line * ROW + ROW / 2;
                      const s = 8;
                      const points =
                        p.color === 'blue'
                          ? `${cx - s},${cy} ${cx + s},${cy - s * 0.85} ${cx + s},${cy + s * 0.85}`
                          : `${cx + s},${cy} ${cx - s},${cy - s * 0.85} ${cx - s},${cy + s * 0.85}`;
                      return <polygon key={p.id} points={points} fill={COLORS[p.color].fill} />;
                    })}
                  {/* Petites croix : une par ligne contenant un avion de cette couleur.
                      Violets à gauche (leur entrée), bleus à droite. */}
                  {Array.from({ length: 6 }, (_, line) => {
                    const marks = [];
                    for (const color of ['purple', 'blue'] as PlaneColor[]) {
                      const has = livePlanes((p) => p.group === g && p.line === line && p.color === color).length > 0;
                      if (!has) continue;
                      const x = color === 'purple' ? CELL / 2 : boardWidth - CELL / 2;
                      marks.push(
                        <g
                          key={color}
                          className="cursor-pointer"
                          onClick={() => rerouteOne(g, line, color)}
                        >
                          <rect
                            x={x - CELL / 2}
                            y={line * ROW}
                            width={CELL}
                            height={ROW}
                            fill={COLORS[color].bar}
                          />
                          <circle cx={x} cy={line * ROW + ROW / 2} r={7} fill="none" stroke="var(--ink-0)" strokeWidth={1.5} />
                          <path
                            d={`M${x - 4},${line * ROW + ROW / 2 - 4} l8,8 M${x + 4},${line * ROW + ROW / 2 - 4} l-8,8`}
                            stroke="var(--ink-0)"
                            strokeWidth={1.5}
                          />
                        </g>,
                      );
                    }
                    return marks;
                  })}
                </svg>
                {g === q.zones.length - 1 && counters}
              </div>
            );
          })}
        </div>

        {/* Grosse croix bleue (droite) : déroute tous les bleus */}
        <SideBar color="blue" onClick={() => rerouteAll('blue')} count={livePlanes((p) => p.color === 'blue').length} />
      </div>

      {accident ? (
        <div className="w-full max-w-4xl rounded-lg border-2 border-red-600 bg-amber-500 px-4 py-2 text-center font-bold text-zinc-950">
          ⚠ Accident ! {accident.reason === 'flow-blue'
            ? `Plus de ${q.maxBlue} avions bleus`
            : `Plus de ${q.maxTotal} avions`}{' '}
          dans la zone grise du bloc {accident.group + 1}.
        </div>
      ) : (
        <p className="max-w-3xl text-center text-xs text-zinc-500">
          Petite croix en bout de ligne = déroute UN avion de cette ligne. Grosse croix latérale =
          déroute TOUS les avions de cette couleur (coûteux). Max {q.maxTotal} avions et{' '}
          {q.maxBlue} bleus par zone grise.
        </p>
      )}
    </div>
  );
}

function SideBar({ color, onClick, count }: { color: PlaneColor; onClick: () => void; count: number }) {
  return (
    <button
      onClick={onClick}
      disabled={count === 0}
      title={`Dérouter TOUS les avions ${COLORS[color].label} (${count})`}
      className="flex w-12 items-center justify-center rounded-xl transition-opacity disabled:opacity-30"
      style={{ backgroundColor: COLORS[color].bar }}
    >
      <svg width="34" height="34" viewBox="0 0 34 34">
        <circle cx="17" cy="17" r="15" fill="none" stroke="var(--ink-0)" strokeWidth="2" />
        <path d="M10,10 L24,24 M24,10 L10,24" stroke="var(--ink-0)" strokeWidth="2" />
      </svg>
    </button>
  );
}

function Counter({ value, max, label, danger }: { value: number; max: number; label: string; danger: boolean }) {
  return (
    <span
      className={`rounded-md border px-3 py-0.5 font-mono text-sm ${
        value > max
          ? 'border-red-500 bg-red-950/60 font-bold text-red-300'
          : danger
            ? 'border-amber-500 bg-amber-950/40 text-amber-300'
            : 'border-zinc-700 bg-zinc-900 text-zinc-300'
      }`}
    >
      {value}/{max} {label}
    </span>
  );
}
