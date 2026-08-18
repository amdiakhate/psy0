import { useMemo } from 'react';
import { GREY, MARINE } from './config';
import { buildGrid } from './model';
import type { Grid, Placement, Shape } from './model';
import { easeInOut, linear } from '../../anim/timeline';
import { useTimeline } from '../../hooks/useTimeline';

/**
 * Les formes qui GLISSENT sur la grille, une par une.
 *
 * La règle de superposition (marine + marine = marine, marine + gris = gris,
 * gris + gris = marine) est un XOR — et un XOR ne se retient pas comme une
 * table : il se comprend en voyant une case BASCULER. C'est particulièrement
 * vrai du cas contre-intuitif : deux formes grises qui se recouvrent laissent
 * du MARINE, alors que l'intuition attend du gris renforcé. C'est le piège
 * principal de l'épreuve, et il devient évident quand on voit la case
 * s'éteindre au passage de la seconde forme.
 *
 * Les grilles intermédiaires viennent de `buildGrid`, la même fonction que
 * l'exercice : l'animation ne peut pas raconter autre chose que le jeu.
 */

const SLIDE_MS = 900;
const HOLD_MS = 1100;

export function DropAnimation({
  size,
  shapes,
  solution,
  cell = 26,
}: {
  size: number;
  shapes: Shape[];
  solution: readonly Placement[];
  cell?: number;
}) {
  const steps = useMemo(
    () => solution.map((_, i) => buildGrid(size, shapes, solution.slice(0, i + 1))),
    [size, shapes, solution],
  );
  const empty = useMemo(() => buildGrid(size, shapes, []), [size, shapes]);

  const segments = useMemo(
    () => [
      { to: 0, ms: HOLD_MS, ease: linear },
      ...solution.flatMap((_, i) => [
        { to: i + 0.999, ms: SLIDE_MS, ease: easeInOut },
        { to: i + 1, ms: 1, ease: linear },
        { to: i + 1, ms: HOLD_MS, ease: linear },
      ]),
    ],
    [solution],
  );
  const { value, playing, toggle, scrub } = useTimeline(segments);

  const index = Math.min(Math.floor(value), solution.length - 1);
  const phase = value - index;
  const landed = phase >= 0.999;
  // Grille visible : toutes les formes DÉJÀ posées. La forme en cours survole.
  const base: Grid = landed ? steps[index] : index === 0 ? empty : steps[index - 1];

  const placement = solution[index];
  const shape = shapes[placement.shapeId];
  const gap = 2;
  const step = cell + gap;
  const startTop = -(shape.h + 1.2) * step;
  const top = placement.row * step + (landed ? 0 : (1 - phase / 0.999) * startTop);
  const left = placement.col * step;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative overflow-hidden rounded-md bg-zinc-800 p-[2px]" style={{ paddingTop: 2 }}>
        <div
          className="grid gap-[2px]"
          style={{ gridTemplateColumns: `repeat(${size}, ${cell}px)` }}
        >
          {base.map((row, r) =>
            row.map((v, c) => (
              <div
                key={`${r}-${c}`}
                style={{ width: cell, height: cell, background: v === 1 ? GREY : MARINE }}
                className="rounded-[3px]"
              />
            )),
          )}
        </div>
        {/* La forme en vol : posée par-dessus, avec un liseré, jusqu'à l'atterrissage. */}
        {!landed && (
          <div className="pointer-events-none absolute" style={{ top: top + 2, left: left + 2 }}>
            <div className="grid gap-[2px]" style={{ gridTemplateColumns: `repeat(${shape.w}, ${cell}px)` }}>
              {shape.cells.map((row, r) =>
                row.map((v, c) => (
                  <div
                    key={`${r}-${c}`}
                    style={{
                      width: cell,
                      height: cell,
                      background: v === 1 ? GREY : 'transparent',
                      opacity: v === 1 ? 0.92 : 0,
                    }}
                    className={v === 1 ? 'rounded-[3px] outline outline-2 outline-sky-400' : ''}
                  />
                )),
              )}
            </div>
          </div>
        )}
      </div>

      <p className="min-h-[36px] max-w-md text-center text-sm text-zinc-300">
        {landed
          ? `Forme ${index + 1} posée. Les cases grises qui se recouvrent viennent de basculer en MARINE.`
          : `Forme ${index + 1} en approche — regarde les cases déjà grises qu’elle va couvrir.`}
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
          max={solution.length}
          step={0.005}
          value={value}
          onChange={(e) => scrub(Number(e.target.value))}
          className="flex-1 accent-sky-500"
          aria-label="Avancement de la pose"
        />
        <span className="w-20 text-right font-mono text-xs text-zinc-500">
          {landed ? index + 1 : index} / {solution.length}
        </span>
      </div>
    </div>
  );
}
