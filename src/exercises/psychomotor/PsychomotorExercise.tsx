import { useEffect, useRef, useState } from 'react';
import type { ExerciseComponentProps } from '../../core/types';
import type { PsyQuestion } from './generator';
import { calcIndexAt, directionAt, shapeIndexAt } from './generator';
import { ARROW_OF } from './config';
import type { Direction, ShapeName } from './config';

const SHAPE_PATH: Record<ShapeName, string> = {
  rond: 'M50,12 A38,38 0 1,1 49.9,12 Z',
  carre: 'M16,16 H84 V84 H16 Z',
  triangle: 'M50,12 L86,84 H14 Z',
  etoile: 'M50,10 L61,40 L93,40 L67,59 L77,89 L50,71 L23,89 L33,59 L7,40 L39,40 Z',
  losange: 'M50,10 L88,50 L50,90 L12,50 Z',
};

function Shape({ name, size = 60, color = 'var(--ink-200)' }: { name: ShapeName; size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <path d={SHAPE_PATH[name]} fill={color} />
    </svg>
  );
}

const ARROW_GLYPH: Record<Direction, string> = { up: '↑', down: '↓', left: '←', right: '→' };

/**
 * Psychomoteur : trois tâches simultanées de même importance.
 * ① maintenir la flèche du sens de déplacement du cercle (« > » vert si correct)
 * ② barre d'espace quand la forme du cercle = celle de l'encart pointillé
 * ③ touche F quand le calcul entouré est faux
 */
export function PsychomotorExercise({
  item,
  durationSec = 300,
  onContinuousEvent,
  onFinished,
}: ExerciseComponentProps<PsyQuestion, string>) {
  const q = item.question;

  const held = useRef<Direction | null>(null);
  const startRef = useRef(0);
  const finished = useRef(false);
  const rafRef = useRef(0);

  // Échantillonnage de la poursuite : une fenêtre d'1 s.
  const trackWindow = useRef({ start: 0, okMs: 0, totalMs: 0, last: 0 });
  // Tâches discrètes : index traité et réponse donnée.
  const shapeState = useRef({ index: -1, answered: false, shownAt: 0 });
  const calcState = useRef({ index: -1, answered: false, shownAt: 0 });

  const [ui, setUi] = useState({
    direction: 'up' as Direction,
    correct: false,
    left: 'rond' as ShapeName,
    inCircle: 'rond' as ShapeName,
    calc: '',
    remaining: durationSec,
    trackPct: 100,
    taskPct: 100,
  });
  const scores = useRef({ trackOk: 0, trackTotal: 0, taskOk: 0, taskTotal: 0 });

  const cbRef = useRef({ onContinuousEvent, onFinished });
  cbRef.current = { onContinuousEvent, onFinished };

  // Saisie : flèches maintenues, Espace et F pour les tâches secondaires.
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      for (const [dir, key] of Object.entries(ARROW_OF) as Array<[Direction, string]>) {
        if (e.key === key) {
          held.current = dir;
          e.preventDefault();
          return;
        }
      }
      const now = performance.now();
      const t = (now - startRef.current) / 1000;
      if (e.key === ' ') {
        e.preventDefault();
        const i = shapeIndexAt(q.shapes, t, q.shapeIntervalMs);
        if (i < 0 || shapeState.current.answered) return;
        shapeState.current.answered = true;
        const pair = q.shapes[i];
        scores.current.taskTotal += 1;
        if (pair.match) scores.current.taskOk += 1;
        cbRef.current.onContinuousEvent?.({
          tags: ['shape-match', 'dual-load'],
          correct: pair.match,
          rtMs: now - shapeState.current.shownAt,
          given: 'espace',
          expected: pair.match ? 'espace' : 'ne rien faire',
        });
      }
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        const i = calcIndexAt(q.calcs, t, q.calcIntervalMs);
        if (i < 0 || calcState.current.answered) return;
        calcState.current.answered = true;
        const calc = q.calcs[i];
        scores.current.taskTotal += 1;
        if (calc.wrong) scores.current.taskOk += 1;
        cbRef.current.onContinuousEvent?.({
          tags: ['calc-check', 'dual-load'],
          correct: calc.wrong,
          rtMs: now - calcState.current.shownAt,
          given: 'F',
          expected: calc.wrong ? 'F' : 'ne rien faire',
        });
      }
    };
    const up = (e: KeyboardEvent) => {
      for (const [dir, key] of Object.entries(ARROW_OF) as Array<[Direction, string]>) {
        if (e.key === key && held.current === dir) held.current = null;
      }
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [q]);

  // Boucle principale.
  useEffect(() => {
    finished.current = false;
    const now0 = performance.now();
    startRef.current = now0;
    trackWindow.current = { start: now0, okMs: 0, totalMs: 0, last: now0 };
    shapeState.current = { index: -1, answered: false, shownAt: now0 };
    calcState.current = { index: -1, answered: false, shownAt: now0 };
    scores.current = { trackOk: 0, trackTotal: 0, taskOk: 0, taskTotal: 0 };

    const frame = (now: number) => {
      if (finished.current) return;
      const t = (now - startRef.current) / 1000;
      const dt = now - trackWindow.current.last;
      trackWindow.current.last = now;

      // ① Poursuite : la flèche maintenue doit correspondre au sens courant.
      const dir = directionAt(q.segments, t);
      const ok = held.current === dir;
      trackWindow.current.totalMs += dt;
      if (ok) trackWindow.current.okMs += dt;

      if (now - trackWindow.current.start >= 1000) {
        const ratio = trackWindow.current.okMs / Math.max(1, trackWindow.current.totalMs);
        scores.current.trackTotal += 1;
        if (ratio >= 0.7) scores.current.trackOk += 1;
        cbRef.current.onContinuousEvent?.({
          tags: ['tracking'],
          correct: ratio >= 0.7,
          rtMs: 1000,
          given: `${Math.round(ratio * 100)} % suivi`,
          expected: '≥ 70 %',
        });
        trackWindow.current = { start: now, okMs: 0, totalMs: 0, last: now };
      }

      // ② Formes : émettre l'event de la paire précédente si elle a expiré sans réponse.
      const si = shapeIndexAt(q.shapes, t, q.shapeIntervalMs);
      if (si !== shapeState.current.index) {
        const prev = shapeState.current.index;
        if (prev >= 0 && !shapeState.current.answered) {
          const pair = q.shapes[prev];
          scores.current.taskTotal += 1;
          if (!pair.match) scores.current.taskOk += 1;
          cbRef.current.onContinuousEvent?.({
            tags: ['shape-match', 'dual-load', ...(pair.match ? ['missed'] : [])],
            correct: !pair.match,
            rtMs: q.shapeIntervalMs,
            given: 'rien',
            expected: pair.match ? 'espace' : 'ne rien faire',
          });
        }
        shapeState.current = { index: si, answered: false, shownAt: now };
      }

      // ③ Calculs : idem.
      const ci = calcIndexAt(q.calcs, t, q.calcIntervalMs);
      if (ci !== calcState.current.index) {
        const prev = calcState.current.index;
        if (prev >= 0 && !calcState.current.answered) {
          const calc = q.calcs[prev];
          scores.current.taskTotal += 1;
          if (!calc.wrong) scores.current.taskOk += 1;
          cbRef.current.onContinuousEvent?.({
            tags: ['calc-check', 'dual-load', ...(calc.wrong ? ['missed'] : [])],
            correct: !calc.wrong,
            rtMs: q.calcIntervalMs,
            given: 'rien',
            expected: calc.wrong ? 'F' : 'ne rien faire',
          });
        }
        calcState.current = { index: ci, answered: false, shownAt: now };
      }

      const s = scores.current;
      setUi({
        direction: dir,
        correct: ok,
        left: si >= 0 ? q.shapes[si].left : 'rond',
        inCircle: si >= 0 ? q.shapes[si].inCircle : 'rond',
        calc: ci >= 0 ? q.calcs[ci].display : '',
        remaining: Math.max(0, durationSec - t),
        trackPct: s.trackTotal > 0 ? Math.round((100 * s.trackOk) / s.trackTotal) : 100,
        taskPct: s.taskTotal > 0 ? Math.round((100 * s.taskOk) / s.taskTotal) : 100,
      });

      if (t >= durationSec) {
        finished.current = true;
        cbRef.current.onFinished?.();
        return;
      }
      rafRef.current = requestAnimationFrame(frame);
    };
    rafRef.current = requestAnimationFrame(frame);

    return () => {
      finished.current = true;
      cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.seed, durationSec]);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-5">
      <div className="flex w-full max-w-3xl items-center justify-between text-sm text-zinc-400">
        <span>
          Poursuite : <span className={ui.trackPct >= 70 ? 'text-green-400' : 'text-red-400'}>{ui.trackPct} %</span>
        </span>
        <span className="font-mono text-lg">
          {Math.floor(ui.remaining / 60)}:{String(Math.floor(ui.remaining % 60)).padStart(2, '0')}
        </span>
        <span>
          Tâches : <span className={ui.taskPct >= 70 ? 'text-green-400' : 'text-red-400'}>{ui.taskPct} %</span>
        </span>
      </div>

      <div className="flex items-center justify-center gap-8">
        {/* ② Encart pointillé : la forme de référence */}
        <div className="flex h-32 w-32 items-center justify-center rounded-xl border-2 border-dashed border-zinc-600 bg-zinc-900">
          <Shape name={ui.left} size={64} color="var(--ink-400)" />
        </div>

        {/* ① Le cercle et son sens de déplacement, ② la forme qu'il contient */}
        <div className="relative flex h-44 w-44 items-center justify-center">
          <div
            className={`flex h-40 w-40 items-center justify-center rounded-full border-4 ${
              ui.correct ? 'border-green-500' : 'border-zinc-600'
            } bg-zinc-900`}
          >
            <Shape name={ui.inCircle} size={72} color="var(--ink-200)" />
          </div>
          {/* Le « > » vert quand la bonne flèche est maintenue */}
          {ui.correct && (
            <span className="absolute -right-6 text-4xl font-bold text-green-500">&gt;</span>
          )}
          {/* Sens de déplacement du cercle */}
          <span
            className={`absolute font-mono text-3xl text-sky-400 ${
              ui.direction === 'up'
                ? '-top-8'
                : ui.direction === 'down'
                  ? '-bottom-8'
                  : ui.direction === 'left'
                    ? '-left-9'
                    : '-right-9'
            }`}
          >
            {ARROW_GLYPH[ui.direction]}
          </span>
        </div>
      </div>

      {/* ③ Le calcul entouré */}
      <div className="flex h-16 items-center">
        {ui.calc ? (
          <div className="rounded-full border-2 border-amber-500 bg-amber-950/20 px-8 py-2">
            <span className="font-mono text-2xl tabular-nums text-zinc-100">{ui.calc}</span>
          </div>
        ) : (
          <span className="text-zinc-700">—</span>
        )}
      </div>

      <p className="max-w-2xl text-center text-xs text-zinc-500">
        ① Maintiens la flèche du sens du cercle (un <span className="text-green-500">&gt;</span> vert
        confirme) · ② <kbd className="rounded bg-zinc-800 px-1">Espace</kbd> si les deux formes sont
        identiques · ③ <kbd className="rounded bg-zinc-800 px-1">F</kbd> si le calcul entouré est FAUX
      </p>
    </div>
  );
}
