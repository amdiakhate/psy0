import { useEffect, useRef, useState, useCallback } from 'react';
import type { ExerciseComponentProps } from '../../core/types';
import type { PsyQuestion } from './generator';
import { calcIndexAt, directionAt, positionAt, scrollOffsetAt, shapeIndexAt, waveAt } from './generator';
import { ARROW_OF } from './config';
import type { Direction, ShapeName } from './config';
import type { CalcItem, CalcWave } from './generator';

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

// Aucune flèche n'est affichée EN PERMANENCE : le sens se lit sur le mouvement.
// Le chevron n'apparaît qu'en confirmation d'une flèche correctement maintenue,
// et alors il montre le sens réel — sinon il validerait le geste en pointant
// ailleurs que là où va le cercle.
const CHEVRON_GLYPH: Record<Direction, string> = { up: '\u2227', down: '\u2228', left: '\u003c', right: '\u003e' };

/** Placement autour du cercle, du côté du déplacement. */
const CHEVRON_POS: Record<Direction, string> = {
  up: '-top-10 left-1/2 -translate-x-1/2',
  down: '-bottom-10 left-1/2 -translate-x-1/2',
  left: '-left-10 top-1/2 -translate-y-1/2',
  right: '-right-10 top-1/2 -translate-y-1/2',
};

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
  const calcState = useRef<{ index: number; answered: boolean; shownAt: number; wave: CalcWave | null }>({
    index: -1, answered: false, shownAt: 0, wave: null,
  });

  // Les deux touches s'illuminent brièvement à l'appui, comme sur Pilotest :
  // c'est le seul retour immédiat que l'appui a bien été pris en compte.
  const [flash, setFlash] = useState({ space: false, f: false });
  const flashTimers = useRef<{ space: number; f: number }>({ space: 0, f: 0 });
  const blink = useCallback((key: 'space' | 'f') => {
    setFlash((s) => ({ ...s, [key]: true }));
    window.clearTimeout(flashTimers.current[key]);
    flashTimers.current[key] = window.setTimeout(
      () => setFlash((s) => ({ ...s, [key]: false })),
      140,
    );
  }, []);

  const [ui, setUi] = useState({
    direction: 'up' as Direction,
    correct: false,
    pos: { x: 0.5, y: 0.5 },
    left: 'rond' as ShapeName,
    inCircle: 'rond' as ShapeName,
    lane: [] as CalcItem[],
    laneIndex: -1,
    scroll: 0,
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
        blink('space');
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
        blink('f');
        const wave = waveAt(q.waves, t, q.calcIntervalMs);
        const i = wave ? calcIndexAt(wave.calcs, t, q.calcIntervalMs) : -1;
        if (!wave || i < 0 || calcState.current.answered) return;
        calcState.current.answered = true;
        const calc = wave.calcs[i];
        scores.current.taskTotal += 1;
        if (calc.wrong) scores.current.taskOk += 1;
        cbRef.current.onContinuousEvent?.({
          tags: ['calc-check', 'dual-load', calc.trap],
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
    calcState.current = { index: -1, answered: false, shownAt: now0, wave: null };
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

      // ③ Calculs : le cadre orange parcourt la vague visible.
      const wave = waveAt(q.waves, t, q.calcIntervalMs);
      // La vague suivante est affichée à la suite : sans elle, le dernier
      // calcul entouré n'aurait aucun successeur visible à anticiper.
      const nextWave = wave ? q.waves[q.waves.indexOf(wave) + 1] : undefined;
      const ci = wave ? calcIndexAt(wave.calcs, t, q.calcIntervalMs) : -1;
      if (ci !== calcState.current.index) {
        const prev = calcState.current.index;
        if (prev >= 0 && !calcState.current.answered) {
          const calc = calcState.current.wave?.calcs[prev];
          if (!calc) return;
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
        calcState.current = { index: ci, answered: false, shownAt: now, wave };
      }

      const s = scores.current;
      setUi({
        direction: dir,
        correct: ok,
        pos: positionAt(q.segments, t),
        left: si >= 0 ? q.shapes[si].left : 'rond',
        inCircle: si >= 0 ? q.shapes[si].inCircle : 'rond',
        lane: wave ? [...wave.calcs, ...(nextWave?.calcs.slice(0, 3) ?? [])] : [],
        laneIndex: ci,
        scroll: wave ? scrollOffsetAt(wave, t, q.calcIntervalMs) : 0,
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

  // Les trois tâches exigent flèches MAINTENUES, Espace et F simultanément :
  // sans clavier physique, l'exercice est injouable et les données produites
  // seraient trompeuses. On détecte l'absence probable de clavier (pointeur
  // grossier) plutôt que la présence du tactile, pour ne pas écarter les
  // portables à écran tactile, qui en ont un.
  const sansClavier =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(pointer: coarse)').matches === true &&
    window.matchMedia?.('(hover: none)').matches === true;

  if (sansClavier) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-2xl font-bold text-amber-400">Clavier physique requis</p>
        <p className="max-w-md text-zinc-300">
          Le Psychomoteur demande de maintenir une flèche tout en frappant Espace et F. Sur un
          écran tactile, l'exercice est injouable — et le score obtenu ne voudrait rien dire.
        </p>
        <p className="max-w-md text-sm text-zinc-500">
          Reprends-le sur ordinateur. Le jour du test, ce sera de toute façon au clavier.
        </p>
      </div>
    );
  }

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

      {/* L'encart est À GAUCHE et NETTEMENT SÉPARÉ du cercle, comme sur
          Pilotest : la comparaison des deux formes doit coûter un déplacement
          du regard. Collés, ils se comparaient d'un seul coup d'œil, ce qui
          supprimait l'essentiel de la charge de la tâche ②. */}
      {/* ① Zone de déplacement du cercle : large et SANS cadre, comme sur
          Pilotest — le cercle évolue dans l'espace de l'écran. */}
      <div className="relative h-64 w-full max-w-4xl">
        <div
          className="absolute"
          style={{
            left: `${ui.pos.x * 100}%`,
            top: `${ui.pos.y * 100}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="relative flex h-20 w-20 items-center justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-sky-500">
              <Shape name={ui.inCircle} size={40} color="#0ea5e9" />
            </div>
            {/*
              Le chevron est SOLIDAIRE du sens de déplacement : il se place du
              côté vers lequel le cercle va, et pointe dans cette direction.
              Fixe à droite, il contredisait le mouvement dès que le cercle
              partait à gauche ou vers le haut — et confirmait un geste correct
              en montrant la mauvaise direction.
            */}
            <span
              className={`absolute flex h-9 w-7 items-center justify-center rounded font-bold text-white transition-opacity ${
                CHEVRON_POS[ui.direction]
              } ${ui.correct ? 'bg-green-600 opacity-100' : 'opacity-0'}`}
            >
              {CHEVRON_GLYPH[ui.direction]}
            </span>
          </div>
        </div>
      </div>

      {/* ② l'encart pointillé et ③ le bandeau, SUR LA MÊME LIGNE : c'est la
          disposition officielle, et elle impose un vrai déplacement du regard
          entre la forme de référence et le cercle, resté en haut. */}
      <div className="flex w-full max-w-5xl items-center gap-6 px-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-zinc-500">
          <Shape name={ui.left} size={40} color="#0ea5e9" />
        </div>

        <div className="min-w-0 flex-1 overflow-hidden">
          <div
            className="flex items-center gap-10 whitespace-nowrap will-change-transform"
            style={{ transform: `translateX(${-ui.scroll * 100}%)` }}
          >
            {ui.lane.length === 0 ? (
              <span className="text-zinc-700">—</span>
            ) : (
              ui.lane.map((c, i) => (
                <span
                  key={`${c.t}-${i}`}
                  className={`shrink-0 rounded-lg px-5 py-3 font-mono text-xl tabular-nums transition-colors ${
                    i === ui.laneIndex
                      ? 'border-2 border-amber-500 text-zinc-100'
                      : 'border-2 border-transparent text-zinc-400'
                  }`}
                >
                  {c.display}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Les deux touches, aux couleurs de leur tâche : bleu pour les formes,
          orange pour les calculs. Elles s'illuminent à l'appui. */}
      <div className="flex w-full max-w-5xl items-center gap-4 px-4">
        <span
          className={`rounded-lg px-6 py-2.5 text-sm font-bold tracking-wide transition-colors ${
            flash.space ? 'bg-sky-400 text-zinc-950' : 'bg-sky-700 text-white'
          }`}
        >
          ESPACE
        </span>
        <span
          className={`rounded-lg px-5 py-2.5 text-sm font-bold transition-colors ${
            flash.f ? 'bg-amber-400 text-zinc-950' : 'bg-amber-600 text-white'
          }`}
        >
          F
        </span>
      </div>

      {/* Barre de progression : le temps restant, lisible sans quitter la zone. */}
      <div className="h-1.5 w-full max-w-5xl overflow-hidden rounded-full bg-zinc-700">
        <div
          className="h-full bg-red-500 transition-[width] duration-1000 ease-linear"
          style={{ width: `${Math.max(0, 100 - (ui.remaining / durationSec) * 100)}%` }}
        />
      </div>

      <p className="max-w-2xl text-center text-xs text-zinc-500">
        ① Regarde où va le cercle et MAINTIENS la flèche de ce sens (un{' '}
        <span className="text-green-500">&gt;</span> vert confirme) · ② <kbd className="rounded bg-zinc-800 px-1">Espace</kbd> si les deux formes sont
        identiques · ③ <kbd className="rounded bg-zinc-800 px-1">F</kbd> si le calcul entouré est FAUX
      </p>
    </div>
  );
}
