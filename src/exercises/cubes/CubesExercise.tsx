import { useEffect, useState } from 'react';
import type { ExerciseComponentProps } from '../../core/types';
import type { CubesAnswer, CubesQuestion, Piece } from './generator';
import { NetSvg, SYMBOL_PATHS } from './CubeSvg';
import { POS } from './cube-model';
import { useKeys } from '../../hooks/useKeys';

const CELLS: Array<{ pos: number; col: number; row: number }> = [
  { pos: POS.U, col: 1, row: 0 },
  { pos: POS.L, col: 0, row: 1 },
  { pos: POS.F, col: 1, row: 1 },
  { pos: POS.R, col: 2, row: 1 },
  { pos: POS.B, col: 3, row: 1 },
  { pos: POS.D, col: 1, row: 2 },
];

const S = 58;

/** Une pièce : symbole orienté, éventuellement présenté en miroir. */
function PieceSvg({ piece, flipped, size = 46 }: { piece: Piece; flipped: boolean; size?: number }) {
  const mirrored = piece.mirrored !== flipped; // état visuel courant
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect width="100" height="100" fill="var(--ink-800)" stroke="var(--ink-500)" />
      <g transform={`${mirrored ? 'translate(100,0) scale(-1,1) ' : ''}rotate(${-90 * piece.rot} 50 50)`}>
        <path d={SYMBOL_PATHS[piece.sym]} fill="var(--ink-200)" />
      </g>
    </svg>
  );
}

export function CubesExercise({ item, onAnswer }: ExerciseComponentProps<CubesQuestion, CubesAnswer>) {
  const q = item.question;
  const [placed, setPlaced] = useState<CubesAnswer>({});
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    setPlaced({});
    setFlipped({});
    setSelected(null);
  }, [item.seed]);

  const usedPieceIds = new Set(Object.values(placed).map((p) => p.pieceId));
  const available = q.pieces.filter((p) => !usedPieceIds.has(p.id));
  const complete = q.holes.every((h) => placed[h]);

  const placeInHole = (hole: number) => {
    if (selected === null) return;
    setPlaced((prev) => ({ ...prev, [hole]: { pieceId: selected, flipped: flipped[selected] ?? false } }));
    setSelected(null);
  };

  const clearHole = (hole: number) =>
    setPlaced((prev) => {
      const next = { ...prev };
      delete next[hole];
      return next;
    });

  useKeys((e) => {
    const n = Number(e.key);
    if (n >= 1 && n <= available.length) setSelected(available[n - 1].id);
    // R : retourner la pièce sélectionnée
    if ((e.key === 'r' || e.key === 'R') && selected !== null) {
      setFlipped((prev) => ({ ...prev, [selected]: !prev[selected] }));
    }
    if (e.key === 'Enter' && complete) onAnswer(placed);
  });

  return (
    <div className="flex h-full flex-col items-center justify-center gap-5">
      <p className="text-sm text-zinc-300">
        Complète le patron de droite pour qu'il représente <span className="font-semibold text-sky-400">le même cube</span>{' '}
        que celui de gauche.
      </p>

      <div className="flex flex-wrap items-start justify-center gap-8">
        <div className="text-center">
          <p className="mb-1 text-xs uppercase tracking-widest text-zinc-500">Patron de référence</p>
          <NetSvg cube={q.reference} size={S} />
        </div>

        <div className="text-center">
          <p className="mb-1 text-xs uppercase tracking-widest text-zinc-500">À compléter</p>
          <svg width={4 * S + 2} height={3 * S + 2} viewBox={`0 0 ${4 * S + 2} ${3 * S + 2}`}>
            {CELLS.map(({ pos, col, row }) => {
              const face = q.target[pos];
              const put = placed[pos];
              const piece = put ? q.pieces.find((p) => p.id === put.pieceId)! : null;
              const isHole = face === null;
              return (
                <g
                  key={pos}
                  transform={`translate(${col * S + 1} ${row * S + 1})`}
                  onClick={() => (isHole ? (put ? clearHole(pos) : placeInHole(pos)) : undefined)}
                  className={isHole ? 'cursor-pointer' : ''}
                >
                  <rect
                    width={S}
                    height={S}
                    fill={isHole ? (put ? '#1e3a5f' : '#0c0a09') : 'var(--ink-800)'}
                    stroke={isHole && selected !== null && !put ? '#0ea5e9' : 'var(--ink-500)'}
                    strokeWidth={isHole && selected !== null && !put ? 2.5 : 1}
                    strokeDasharray={isHole && !put ? '4 3' : undefined}
                  />
                  <g transform={`scale(${S / 100})`}>
                    {face && (
                      <g transform={`rotate(${-90 * face.rot} 50 50)`}>
                        <path d={SYMBOL_PATHS[face.sym]} fill="var(--ink-200)" />
                      </g>
                    )}
                    {piece && (
                      <g
                        transform={`${piece.mirrored !== put!.flipped ? 'translate(100,0) scale(-1,1) ' : ''}rotate(${-90 * piece.rot} 50 50)`}
                      >
                        <path d={SYMBOL_PATHS[piece.sym]} fill="#7dd3fc" />
                      </g>
                    )}
                  </g>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Pièces disponibles */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {available.map((piece, i) => (
          <button
            key={piece.id}
            onClick={() => setSelected(piece.id)}
            onDoubleClick={() => setFlipped((prev) => ({ ...prev, [piece.id]: !prev[piece.id] }))}
            className={`flex flex-col items-center gap-1 rounded-lg border-2 p-1.5 ${
              selected === piece.id ? 'border-sky-500 bg-sky-950/40' : 'border-zinc-700 hover:border-zinc-500'
            }`}
          >
            <PieceSvg piece={piece} flipped={flipped[piece.id] ?? false} />
            <span className="text-[10px] text-zinc-500">
              {i + 1}
              {flipped[piece.id] ? ' ⇄' : ''}
            </span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => complete && onAnswer(placed)}
          disabled={!complete}
          className={`rounded-lg px-5 py-2 font-semibold ${
            complete ? 'bg-sky-600 hover:bg-sky-500' : 'cursor-not-allowed bg-zinc-800 text-zinc-600'
          }`}
        >
          Valider · Entrée ⏎
        </button>
        <p className="text-xs text-zinc-500">
          Touches 1-{available.length} pour choisir · <kbd className="rounded bg-zinc-800 px-1">R</kbd> ou
          double-clic pour retourner · clic sur un trou pour poser
        </p>
      </div>
    </div>
  );
}
