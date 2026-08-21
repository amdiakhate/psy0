import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ExerciseComponentProps } from '../../core/types';
import { LINES_PER_GROUP, SERIES_PER_PASSATION } from './config';
import type { AirwaysQuestion, Channel, PlaneColor, Series } from './generator';
import {
  groupViolationAt,
  inGreyZone,
  isDiverted,
  isOnBoard,
  makeChannel,
  occupancyAt,
  planeCol,
} from './generator';
import { GLOBAL_COST, passationPercent, seriesScore, stanineFor } from './scoring';

const CELL = 20;
const ROW = 24;

const COLORS: Record<PlaneColor, { fill: string; bar: string; label: string }> = {
  purple: { fill: '#7c3aed', bar: '#8b5cf6', label: 'violets ▶' },
  blue: { fill: '#38bdf8', bar: '#7dd3fc', label: 'bleus ◀' },
};

interface Tally {
  /** Voies fermées une par une. */
  closures: number;
  globals: number;
  accident: boolean;
}

const EMPTY_TALLY: Tally = { closures: 0, globals: 0, accident: false };

/**
 * Airways — dix séries d'affilée, un problème d'optimisation par série.
 *
 * On ne clique pas sur un avion : on ferme une VOIE, et c'est définitif. Les
 * boutons de couleur en extrémité de ligne ferment cette ligne pour cette
 * couleur ; le bouton global ferme les six d'un coup, et coûte cinq points.
 *
 * Un accident gèle les avions du groupe fautif — l'autre groupe continue, comme
 * au test. La série va jusqu'à son terme : on ne « rejoue » pas une erreur, on
 * la paie et on garde la tête froide pour la suite.
 */
export function AirwaysExercise({
  item,
  durationSec,
  onContinuousEvent,
  onFinished,
}: ExerciseComponentProps<AirwaysQuestion, string>) {
  const q = item.question;
  /**
   * Une passation dure 3 à 5 minutes selon le niveau. Un bloc de 3 minutes ne
   * doit pas en durer 5 : passé le budget, on s'arrête à la fin de la série en
   * cours et on note sur ce qui a été joué. Couper au milieu d'une série
   * fabriquerait un score qui ne veut rien dire.
   */
  const startedAt = useRef(Date.now());

  const [seriesIndex, setSeriesIndex] = useState(0);
  const [tick, setTick] = useState(0);
  const [closures, setClosures] = useState<Map<Channel, number>>(() => new Map());
  const [frozen, setFrozen] = useState<Array<number | null>>([null, null]);
  const [tally, setTally] = useState<Tally>(EMPTY_TALLY);
  const [scores, setScores] = useState<number[]>([]);
  const [recap, setRecap] = useState<null | { score: number; par: number }>(null);

  const series: Series | undefined = q.series[seriesIndex];
  const passationDone = seriesIndex >= q.series.length;

  // Les callbacks changent d'identité à chaque rendu du parent : on les lit par
  // référence pour ne jamais relancer l'horloge de la série en cours.
  const cbRef = useRef({ onContinuousEvent, onFinished });
  cbRef.current = { onContinuousEvent, onFinished };

  /**
   * Miroir en ref de l'état courant.
   *
   * L'horloge et les boutons DOIVENT lire et écrire hors des fonctions de mise
   * à jour de `useState` : React les rejoue à l'identique en mode strict, et un
   * effet de bord placé dedans — compter une fermeture, clore une série —
   * s'exécuterait deux fois. Un score compté double est indétectable à l'œil et
   * fausse toute la passation.
   */
  const tickRef = useRef(0);
  const stateRef = useRef({ closures, frozen, tally, series });
  stateRef.current = { closures, frozen, tally, series };

  /** Pas effectif d'un groupe : figé à l'instant de l'accident, s'il y en a eu un. */
  const tickOf = useCallback((group: number, t: number) => frozen[group] ?? t, [frozen]);

  const closeSeries = useCallback(
    (finalTally: Tally, s: Series) => {
      const score = seriesScore(finalTally);
      const closed = finalTally.closures + finalTally.globals * LINES_PER_GROUP;
      cbRef.current.onContinuousEvent?.({
        tags: finalTally.accident ? ['flow', 'accident'] : ['flow', 'strategy'],
        // « Bien joué » = zéro accident ET pas plus de voies fermées que la
        // référence. Survivre en fermant tout n'est pas une réussite ici.
        correct: !finalTally.accident && closed <= s.par,
        rtMs: s.tickMs * s.durationTicks,
        given: finalTally.accident
          ? `accident · ${closed} voie(s) fermée(s)`
          : `${closed} voie(s) fermée(s)`,
        expected: `zéro accident, ≤ ${s.par} voie(s)`,
      });
      setScores((prev) => [...prev, score]);
      setRecap({ score, par: s.par });
    },
    [],
  );

  // L'horloge d'une série. Remontée à chaque changement de série ou d'item.
  useEffect(() => {
    if (!series) return;
    setTick(0);
    setClosures(new Map());
    setFrozen([null, null]);
    setTally(EMPTY_TALLY);
    setRecap(null);

    tickRef.current = 0;
    let stopped = false;
    const timer = setInterval(() => {
      if (stopped) return;
      const st = stateRef.current;
      if (!st.series) return;
      const next = tickRef.current + 1;
      tickRef.current = next;

      // Accident : on gèle le groupe fautif à ce pas. L'autre continue de voler,
      // comme au test — une erreur dans un groupe ne suspend pas l'autre.
      const nextFrozen = [...st.frozen];
      let crashed = false;
      for (let g = 0; g < st.series.zones.length; g++) {
        if (nextFrozen[g] !== null) continue;
        if (groupViolationAt(st.series, g, next, st.closures)) {
          nextFrozen[g] = next;
          crashed = true;
        }
      }
      if (crashed) {
        setFrozen(nextFrozen);
        setTally((prev) => ({ ...prev, accident: true }));
      }

      setTick(next);

      if (next >= st.series.durationTicks) {
        stopped = true;
        clearInterval(timer);
        closeSeries(crashed || st.tally.accident ? { ...st.tally, accident: true } : st.tally, st.series);
      }
    }, series.tickMs);

    return () => {
      stopped = true;
      clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.seed, seriesIndex]);

  // Enchaînement des séries, puis fin de passation.
  useEffect(() => {
    if (!recap) return;
    const id = setTimeout(() => {
      setRecap(null);
      const elapsed = (Date.now() - startedAt.current) / 1000;
      const outOfTime = durationSec !== undefined && elapsed >= durationSec;
      setSeriesIndex((i) => (outOfTime ? q.series.length : i + 1));
    }, 1400);
    return () => clearTimeout(id);
  }, [recap, durationSec, q.series.length]);

  useEffect(() => {
    if (!passationDone) return;
    const id = setTimeout(() => cbRef.current.onFinished?.(), 2600);
    return () => clearTimeout(id);
  }, [passationDone]);

  /** Ferme des voies. Une voie déjà fermée ne se repaie pas. */
  const close = useCallback((channels: Channel[], viaGlobal: boolean) => {
    const prev = stateRef.current.closures;
    const fresh = channels.filter((c) => !prev.has(c));
    if (fresh.length === 0) return;
    const next = new Map(prev);
    for (const c of fresh) next.set(c, tickRef.current);
    setClosures(next);
    setTally((t) =>
      viaGlobal
        ? { ...t, globals: t.globals + 1 }
        : { ...t, closures: t.closures + fresh.length },
    );
  }, []);

  const percent = passationPercent(scores);

  if (passationDone) {
    return <PassationRecap scores={scores} percent={percent} />;
  }
  if (!series) return null;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-2">
      <div className="flex w-full max-w-5xl items-baseline justify-between text-sm">
        <span className="text-zinc-400">
          Série <span className="font-mono text-lg text-sky-300">{seriesIndex + 1}</span>
          <span className="text-zinc-600">/{SERIES_PER_PASSATION}</span>
          <span className="ml-4 text-zinc-500">
            fermées : <span className="font-mono text-zinc-300">{tally.closures}</span>
            {tally.globals > 0 && (
              <span className="text-amber-400"> + {tally.globals} global</span>
            )}
          </span>
        </span>
        <span className="font-mono text-zinc-400">
          {scores.length > 0 && <span className="mr-4 text-sky-300">{percent} %</span>}
          {Math.max(0, Math.round(((series.durationTicks - tick) * series.tickMs) / 1000))} s
        </span>
      </div>

      {series.zones.map((_zone, g) => {
        const t = tickOf(g, tick);
        const occ = occupancyAt(series, g, t, closures);
        const isFrozen = frozen[g] !== null;
        return (
          <div key={g} className="flex w-full max-w-5xl items-center gap-2">
            {/* Compteurs À L'EXTÉRIEUR du groupe, comme au test. */}
            <div className="flex w-24 shrink-0 flex-col gap-1">
              <Counter value={occ.total} max={q.maxTotal} label="total" />
              <Counter value={occ.blue} max={q.maxBlue} label="◀ bleus" />
            </div>

            <ColorColumn
              color="purple"
              group={g}
              disabled={isFrozen}
              closures={closures}
              onLine={(line) => close([makeChannel(g, line, 'purple')], false)}
              onGlobal={() =>
                close(
                  Array.from({ length: LINES_PER_GROUP }, (_, l) => makeChannel(g, l, 'purple')),
                  true,
                )
              }
            />

            <Board series={series} group={g} tick={t} closures={closures} frozen={isFrozen} />

            <ColorColumn
              color="blue"
              group={g}
              disabled={isFrozen}
              closures={closures}
              onLine={(line) => close([makeChannel(g, line, 'blue')], false)}
              onGlobal={() =>
                close(
                  Array.from({ length: LINES_PER_GROUP }, (_, l) => makeChannel(g, l, 'blue')),
                  true,
                )
              }
            />
          </div>
        );
      })}

      {recap ? (
        <div
          className={`w-full max-w-5xl rounded-lg border px-4 py-2 text-center font-semibold ${
            tally.accident
              ? 'border-red-600 bg-red-950/50 text-red-300'
              : 'border-green-700 bg-green-950/40 text-green-300'
          }`}
        >
          {tally.accident ? '⚠ Accident' : 'Série tenue'} · {recap.score}/100 · référence :{' '}
          {recap.par} voie{recap.par > 1 ? 's' : ''} à fermer
        </div>
      ) : (
        <p className="max-w-4xl text-center text-xs text-zinc-500">
          Ferme une voie avec le bouton de couleur en bout de ligne — c’est définitif, et un avion
          déjà dans la bande grise ne fait pas demi-tour. Le bouton global (les six d’un coup) coûte{' '}
          {GLOBAL_COST} points. Maximum {q.maxTotal} avions et {q.maxBlue} bleus dans la bande.
        </p>
      )}
    </div>
  );
}

function Board({
  series,
  group,
  tick,
  closures,
  frozen,
}: {
  series: Series;
  group: number;
  tick: number;
  closures: Map<Channel, number>;
  frozen: boolean;
}) {
  const zone = series.zones[group];
  const width = series.cols * CELL;
  const height = LINES_PER_GROUP * ROW;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`min-w-0 flex-1 rounded border bg-zinc-100 ${
        frozen ? 'border-red-500' : 'border-zinc-600'
      }`}
    >
      {/* La bande grise : une seule, centrale, sur les lignes qu'elle couvre. */}
      <rect
        x={zone.start * CELL}
        y={zone.lineFrom * ROW}
        width={(zone.end - zone.start + 1) * CELL}
        height={(zone.lineTo - zone.lineFrom + 1) * ROW}
        fill={frozen ? '#f59e0b' : 'var(--ink-400)'}
        opacity={frozen ? 0.95 : 0.5}
      />
      {Array.from({ length: series.cols + 1 }, (_, c) => (
        <line
          key={`c${c}`}
          x1={c * CELL}
          y1={0}
          x2={c * CELL}
          y2={height}
          stroke="var(--ink-300)"
          strokeWidth={0.5}
        />
      ))}
      {Array.from({ length: LINES_PER_GROUP + 1 }, (_, r) => (
        <line
          key={`r${r}`}
          x1={0}
          y1={r * ROW}
          x2={width}
          y2={r * ROW}
          stroke="var(--ink-400)"
          strokeWidth={0.7}
        />
      ))}
      {series.planes
        .filter(
          (p) =>
            p.group === group &&
            !isDiverted(p, series, closures) &&
            isOnBoard(p, tick, series.cols),
        )
        .map((p) => {
          const cx = planeCol(p, tick, series.cols) * CELL + CELL / 2;
          const cy = p.line * ROW + ROW / 2;
          const s = 7;
          const dir = p.color === 'blue' ? -1 : 1;
          const tri = (offset: number) =>
            `${cx + dir * (s + offset)},${cy} ${cx - dir * (s - offset)},${cy - s * 0.8} ${
              cx - dir * (s - offset)
            },${cy + s * 0.8}`;
          const hot = inGreyZone(p, tick, series);
          return (
            <g key={p.id} opacity={hot ? 1 : 0.85}>
              <polygon points={tri(0)} fill={COLORS[p.color].fill} />
              {/* Double chevron = avion rapide : il traverse la bande deux fois plus vite. */}
              {p.speed > 1 && (
                <polygon points={tri(-7)} fill={COLORS[p.color].fill} opacity={0.7} />
              )}
            </g>
          );
        })}
    </svg>
  );
}

/**
 * La colonne de boutons d'une couleur, à l'extrémité par laquelle ses avions
 * ARRIVENT : les violets entrent par la gauche, les bleus par la droite.
 * Un bouton fermé reste visible, barré — une fermeture est définitive, et le
 * voir évite de repayer un appui pour rien.
 */
function ColorColumn({
  color,
  group,
  disabled,
  closures,
  onLine,
  onGlobal,
}: {
  color: PlaneColor;
  group: number;
  disabled: boolean;
  closures: Map<Channel, number>;
  onLine: (line: number) => void;
  onGlobal: () => void;
}) {
  const allClosed = Array.from({ length: LINES_PER_GROUP }, (_, l) =>
    closures.has(makeChannel(group, l, color)),
  ).every(Boolean);

  return (
    <div className="flex w-11 shrink-0 flex-col gap-0.5">
      <button
        onClick={onGlobal}
        disabled={disabled || allClosed}
        title={`Fermer les 6 voies ${COLORS[color].label} de ce groupe (${GLOBAL_COST} points)`}
        className="rounded-t-md py-0.5 text-center text-[10px] font-bold text-zinc-950 transition-opacity disabled:opacity-30"
        style={{ backgroundColor: COLORS[color].bar }}
      >
        ×6
      </button>
      {Array.from({ length: LINES_PER_GROUP }, (_, line) => {
        const closed = closures.has(makeChannel(group, line, color));
        return (
          <button
            key={line}
            onClick={() => onLine(line)}
            disabled={disabled || closed}
            title={`Fermer la voie ${line + 1} aux ${COLORS[color].label}`}
            className="flex items-center justify-center rounded-sm transition-opacity disabled:cursor-not-allowed"
            style={{
              height: ROW - 2,
              backgroundColor: closed ? 'transparent' : COLORS[color].bar,
              border: closed ? '1px solid var(--ink-600)' : 'none',
              opacity: disabled && !closed ? 0.3 : 1,
            }}
          >
            <span className={closed ? 'text-xs text-zinc-500' : 'text-xs font-bold text-zinc-950'}>
              {closed ? '—' : '✕'}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function Counter({ value, max, label }: { value: number; max: number; label: string }) {
  const over = value > max;
  const tight = value === max;
  return (
    <span
      className={`rounded-md border px-2 py-0.5 text-center font-mono text-xs ${
        over
          ? 'border-red-500 bg-red-950/60 font-bold text-red-300'
          : tight
            ? 'border-amber-500 bg-amber-950/40 text-amber-300'
            : 'border-zinc-700 bg-zinc-900 text-zinc-300'
      }`}
    >
      {value}/{max} {label}
    </span>
  );
}

function PassationRecap({ scores, percent }: { scores: number[]; percent: number }) {
  const stanine = useMemo(() => stanineFor(percent), [percent]);
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <p className="text-sm uppercase tracking-widest text-zinc-500">
        Passation terminée · {scores.length} séries
      </p>
      <p className="text-6xl font-bold text-sky-300">{percent} %</p>
      <p className="text-2xl font-semibold">
        Classe <span className={stanine >= 7 ? 'text-green-400' : 'text-amber-400'}>{stanine}</span>
        <span className="text-zinc-600"> / 9</span>
      </p>
      <div className="flex flex-wrap justify-center gap-1">
        {scores.map((s, i) => (
          <span
            key={i}
            className={`rounded px-2 py-0.5 font-mono text-xs ${
              s >= 95
                ? 'bg-green-950/60 text-green-300'
                : s >= 50
                  ? 'bg-zinc-800 text-zinc-300'
                  : 'bg-red-950/60 text-red-300'
            }`}
          >
            {s}
          </span>
        ))}
      </div>
      <p className="max-w-md text-center text-xs text-zinc-500">
        Cible cadets : classe 7. La classe 9 exige 100 %, donc une passation sans le moindre
        déroutement — les séries en forcent toujours quelques-uns, exactement comme au test.
      </p>
    </div>
  );
}
