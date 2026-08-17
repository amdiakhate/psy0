import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import type { ExerciseComponentProps } from '../../core/types';
import type { SlidingAnswer, SlidingQuestion } from './generator';
import { GREY, MARINE } from './config';
import { buildGrid, fits, gridsEqual } from './model';
import type { Cell, Grid, Placement, Shape } from './model';
import { useKeys } from '../../hooks/useKeys';
import { useDragDrop } from '../../hooks/useDragDrop';

const CELL = 26;

function cellStyle(v: Cell): string {
  return v === 1 ? GREY : MARINE;
}

/** Un damier simple (grille cible, grille de jeu ou motif d'une forme). */
function Board({
  grid,
  cell = CELL,
  ghost,
}: {
  grid: Grid;
  cell?: number;
  /** Aperçu de la forme sélectionnée : cases marquées d'un liseré. */
  ghost?: boolean[][];
}) {
  return (
    <div
      className="grid gap-[2px] rounded-md bg-zinc-800 p-[2px]"
      style={{ gridTemplateColumns: `repeat(${grid[0]?.length ?? 0}, ${cell}px)` }}
    >
      {grid.map((row, r) =>
        row.map((v, c) => (
          <div
            key={`${r}-${c}`}
            style={{ width: cell, height: cell, background: cellStyle(v) }}
            className={`rounded-[3px] ${ghost?.[r]?.[c] ? 'outline outline-2 outline-sky-400' : ''}`}
          />
        )),
      )}
    </div>
  );
}

/** Le motif d'une forme, rendu dans sa boîte englobante. */
function ShapeBoard({ shape }: { shape: Shape }) {
  return <Board grid={shape.cells} cell={20} />;
}

export function SlidingShapesExercise({
  item,
  onAnswer,
}: ExerciseComponentProps<SlidingQuestion, SlidingAnswer>) {
  const q = item.question;
  const [placed, setPlaced] = useState<Record<number, { row: number; col: number }>>({});
  const [selected, setSelected] = useState<number | null>(q.shapes[0]?.id ?? null);
  const [cursor, setCursor] = useState({ row: 0, col: 0 });
  const answered = useRef(false);

  // Nouvel item : on repart d'une grille vierge.
  useEffect(() => {
    setPlaced({});
    setSelected(q.shapes[0]?.id ?? null);
    setCursor({ row: 0, col: 0 });
    answered.current = false;
  }, [item.seed, item.level, q.shapes]);

  const placements: Placement[] = useMemo(
    () =>
      Object.entries(placed).map(([id, p]) => ({ shapeId: Number(id), row: p.row, col: p.col })),
    [placed],
  );

  const grid = useMemo(
    () => buildGrid(q.size, q.shapes, placements),
    [q.size, q.shapes, placements],
  );

  const solved =
    placements.length === q.shapes.length && gridsEqual(grid, q.target);

  useEffect(() => {
    if (solved && !answered.current) {
      answered.current = true;
      onAnswer(placements);
    }
  }, [solved, placements, onAnswer]);

  const selectedShape = q.shapes.find((s) => s.id === selected) ?? null;

  /** Pose une forme DONNÉE : c'est ce dont le glisser-déposer a besoin. */
  const placeShape = useCallback(
    (shapeId: number, row: number, col: number) => {
      const shape = q.shapes.find((s) => s.id === shapeId);
      if (!shape || answered.current) return;
      if (!fits(q.size, shape, row, col)) return;
      setPlaced((prev) => ({ ...prev, [shape.id]: { row, col } }));
      setSelected((cur) => {
        if (cur !== shape.id) return cur;
        const next = q.shapes.find((s) => s.id !== shape.id && placed[s.id] === undefined);
        return next ? next.id : null;
      });
    },
    [q.shapes, q.size, placed],
  );

  const place = (row: number, col: number) => {
    if (!selectedShape) return;
    placeShape(selectedShape.id, row, col);
  };

  // Glisser-déposer : la case lâchée devient le coin haut-gauche de la forme,
  // comme sur Pilotest où l'on fait glisser la pièce sur la grille centrale.
  const onDrop = useCallback(
    (shapeId: number, zone: string) => {
      const [row, col] = zone.split('-').map(Number);
      if (Number.isInteger(row) && Number.isInteger(col)) placeShape(shapeId, row, col);
    },
    [placeShape],
  );
  const { drag, startDrag, moved } = useDragDrop<number>(onDrop);

  const remove = (id: number) => {
    setPlaced((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    setSelected(id);
  };

  useKeys((e) => {
    if (answered.current) return;
    const digit = Number(e.key);
    if (Number.isInteger(digit) && digit >= 1 && digit <= q.shapes.length) {
      e.preventDefault();
      const shape = q.shapes[digit - 1];
      if (placed[shape.id]) remove(shape.id);
      else setSelected(shape.id);
      return;
    }
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const dr = e.key === 'ArrowUp' ? -1 : e.key === 'ArrowDown' ? 1 : 0;
      const dc = e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : 0;
      setCursor((cur) => ({
        row: Math.min(q.size - 1, Math.max(0, cur.row + dr)),
        col: Math.min(q.size - 1, Math.max(0, cur.col + dc)),
      }));
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      place(cursor.row, cursor.col);
    }
  });

  // Aperçu : les cases grises de la forme sélectionnée à la position du curseur.
  const ghost = useMemo(() => {
    const mask = Array.from({ length: q.size }, () => new Array<boolean>(q.size).fill(false));
    if (!selectedShape || !fits(q.size, selectedShape, cursor.row, cursor.col)) return mask;
    for (let r = 0; r < selectedShape.h; r++) {
      for (let c = 0; c < selectedShape.w; c++) {
        if (selectedShape.cells[r][c] === 1) mask[cursor.row + r][cursor.col + c] = true;
      }
    }
    return mask;
  }, [q.size, selectedShape, cursor]);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-5">
      <div className="flex flex-wrap items-start justify-center gap-8">
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs uppercase tracking-widest text-zinc-500">Figure à reproduire</p>
          <Board grid={q.target} />
        </div>

        <div className="flex flex-col items-center gap-2">
          <p className="text-xs uppercase tracking-widest text-zinc-500">Grille de jeu</p>
          <div
            className="grid gap-[2px] rounded-md bg-zinc-800 p-[2px]"
            style={{ gridTemplateColumns: `repeat(${q.size}, ${CELL}px)` }}
          >
            {grid.map((row, r) =>
              row.map((v, c) => (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  data-drop={`${r}-${c}`}
                  onClick={() => {
                    setCursor({ row: r, col: c });
                    place(r, c);
                  }}
                  onMouseEnter={() => setCursor({ row: r, col: c })}
                  style={{ width: CELL, height: CELL, background: cellStyle(v) }}
                  className={`rounded-[3px] ${ghost[r][c] ? 'outline outline-2 outline-sky-400' : ''} ${
                    drag?.over === `${r}-${c}` ? 'ring-2 ring-sky-300' : ''
                  } ${cursor.row === r && cursor.col === c && !drag ? 'ring-1 ring-sky-200' : ''}`}
                  aria-label={`ligne ${r + 1} colonne ${c + 1}`}
                />
              )),
            )}
          </div>
        </div>

        <div className="rounded-lg border border-zinc-700 bg-zinc-900/70 p-3 text-sm">
          <p className="text-xs uppercase tracking-widest text-zinc-500">Superposition</p>
          <ul className="mt-2 space-y-1.5 text-zinc-300">
            <Rule a={0} b={0} out={0} />
            <Rule a={0} b={1} out={1} />
            <Rule a={1} b={1} out={0} />
          </ul>
        </div>
      </div>

      <div className="flex flex-wrap items-start justify-center gap-4">
        {q.shapes.map((shape, i) => {
          const pos = placed[shape.id];
          const isSelected = selected === shape.id;
          return (
            <button
              key={shape.id}
              type="button"
              onPointerDown={startDrag(shape.id)}
              // Un glissement ne doit pas déclencher le clic de sélection.
              onClick={() => {
                if (moved) return;
                if (pos) remove(shape.id);
                else setSelected(shape.id);
              }}
              className={`flex touch-none cursor-grab select-none flex-col items-center gap-1.5 rounded-lg border-2 px-3 py-2 transition active:cursor-grabbing ${
                drag?.payload === shape.id
                  ? 'border-sky-400 bg-sky-900/40 opacity-60'
                  : isSelected
                    ? 'border-sky-500 bg-sky-950/40'
                    : pos
                      ? 'border-zinc-800 bg-zinc-900/40 opacity-50'
                      : 'border-zinc-700 bg-zinc-900'
              }`}
            >
              <span className="font-mono text-xs text-zinc-400">{i + 1}</span>
              <ShapeBoard shape={shape} />
              <span className="text-[11px] text-zinc-500">
                {pos ? `posée (${pos.row + 1},${pos.col + 1}) · retirer` : 'à glisser'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Aperçu collé au pointeur : sans lui, on glisse à l'aveugle. */}
      {drag && (
        <div
          className="pointer-events-none fixed z-50 opacity-80"
          style={{ left: drag.x + 12, top: drag.y + 12 }}
        >
          <ShapeBoard shape={q.shapes.find((s) => s.id === drag.payload)!} />
        </div>
      )}

      <p className="text-xs text-zinc-500">
        Glisse une forme sur la grille (ou touches 1-{q.shapes.length} puis flèches et Entrée) ·
        la case lâchée devient son coin haut-gauche · l'ordre de dépose n'a aucune
        importance
      </p>
    </div>
  );
}

function Rule({ a, b, out }: { a: Cell; b: Cell; out: Cell }) {
  const Chip = ({ v }: { v: Cell }) => (
    <span
      className="inline-block h-4 w-4 rounded-[3px] align-middle"
      style={{ background: cellStyle(v) }}
    />
  );
  return (
    <li className="flex items-center gap-1.5">
      <Chip v={a} /> <span className="text-zinc-600">+</span> <Chip v={b} />{' '}
      <span className="text-zinc-600">=</span> <Chip v={out} />
    </li>
  );
}
