import { useEffect, useState, useCallback } from 'react';
import type { ExerciseComponentProps } from '../../core/types';
import type { CubesAnswer, CubesQuestion, Piece } from './generator';
import { Glyph, NetSvg } from './CubeSvg';
import { POS } from './cube-model';
import { useKeys } from '../../hooks/useKeys';
import { useDragDrop } from '../../hooks/useDragDrop';
import { getCubeHint } from './coach/cubeHints';
import { noteCubeHint } from './coach/cubeHintRuntime';

const CELLS: Array<{ pos: number; col: number; row: number }> = [
  { pos: POS.U, col: 1, row: 0 },
  { pos: POS.L, col: 0, row: 1 },
  { pos: POS.F, col: 1, row: 1 },
  { pos: POS.R, col: 2, row: 1 },
  { pos: POS.B, col: 3, row: 1 },
  { pos: POS.D, col: 1, row: 2 },
];

const S = 58;

/** Une pièce : proposée à l'endroit, tournée par quarts de tour au clic. */
function PieceSvg({ piece, rot, size = 46 }: { piece: Piece; rot: number; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect width="100" height="100" fill="var(--ink-800)" stroke="var(--ink-500)" />
      <Glyph sym={piece.sym} rot={rot} />
    </svg>
  );
}

export function CubesExercise({ item, onAnswer }: ExerciseComponentProps<CubesQuestion, CubesAnswer>) {
  const q = item.question;
  const [placed, setPlaced] = useState<CubesAnswer>({});
  // Orientation courante de chaque pièce, en quarts de tour. Toutes démarrent à
  // l'endroit : produire l'orientation EST l'exercice.
  const [rots, setRots] = useState<Record<number, number>>({});
  const [selected, setSelected] = useState<number | null>(null);
  const [hintLevel, setHintLevel] = useState<0 | 1 | 2 | 3 | 4>(0);

  useEffect(() => {
    setPlaced({});
    setRots({});
    setSelected(null);
    setHintLevel(0);
  }, [item.seed]);

  const rotOf = (pieceId: number) => rots[pieceId] ?? 0;
  const turn = useCallback((pieceId: number) => {
    setRots((prev) => {
      const next = { ...prev, [pieceId]: ((prev[pieceId] ?? 0) + 1) % 4 };
      // Une pièce déjà posée garde sa place et tourne dedans, comme sur Pilotest
      // (« ou une fois positionnée sur le patron »).
      setPlaced((p) => {
        const hole = Object.keys(p).find((h) => p[Number(h)].pieceId === pieceId);
        return hole === undefined ? p : { ...p, [Number(hole)]: { pieceId, rot: next[pieceId] } };
      });
      return next;
    });
  }, []);

  const usedPieceIds = new Set(Object.values(placed).map((p) => p.pieceId));
  const available = q.pieces.filter((p) => !usedPieceIds.has(p.id));
  const complete = q.holes.every((h) => placed[h]);
  const currentHint = hintLevel === 0 ? null : getCubeHint(q, hintLevel);

  /** Pose une pièce DONNÉE dans un trou : nécessaire au glisser-déposer. */
  const placePiece = useCallback(
    (pieceId: number, hole: number) => {
      setPlaced((prev) => {
        // Une pièce déjà posée ailleurs est déplacée, pas dupliquée.
        const next = Object.fromEntries(
          Object.entries(prev).filter(([, v]) => v.pieceId !== pieceId),
        ) as typeof prev;
        next[hole] = { pieceId, rot: rots[pieceId] ?? 0 };
        return next;
      });
      setSelected(null);
    },
    [rots],
  );

  const placeInHole = (hole: number) => {
    if (selected === null) return;
    placePiece(selected, hole);
  };

  // Glisser-déposer des faces sur les trous du patron, comme sur Pilotest.
  const onDrop = useCallback(
    (pieceId: number, zone: string) => {
      const hole = Number(zone);
      if (Number.isInteger(hole)) placePiece(pieceId, hole);
    },
    [placePiece],
  );
  const { drag, startDrag, wasDragged } = useDragDrop<number>(onDrop);

  const clearHole = (hole: number) =>
    setPlaced((prev) => {
      const next = { ...prev };
      delete next[hole];
      return next;
    });

  useKeys((e) => {
    const n = Number(e.key);
    if (n >= 1 && n <= available.length) setSelected(available[n - 1].id);
    // R : quart de tour sur la pièce sélectionnée (équivalent clavier du clic).
    if ((e.key === 'r' || e.key === 'R') && selected !== null) turn(selected);
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
                  data-drop={isHole ? String(pos) : undefined}
                  onClick={() => {
                    if (!isHole) return;
                    // Une pièce posée tourne au clic ; c'est un clic droit — ou
                    // la touche R — qui la retire, sinon on ne pourrait plus
                    // l'orienter une fois en place.
                    if (put) turn(put.pieceId);
                    else placeInHole(pos);
                  }}
                  onContextMenu={(e) => {
                    if (!isHole || !put) return;
                    e.preventDefault();
                    clearHole(pos);
                  }}
                  className={isHole ? 'cursor-pointer' : ''}
                >
                  <rect
                    width={S}
                    height={S}
                    fill={isHole ? (put ? '#1e3a5f' : '#0c0a09') : 'var(--ink-800)'}
                    stroke={
                      isHole && (drag?.over === String(pos) || (selected !== null && !put))
                        ? '#0ea5e9'
                        : 'var(--ink-500)'
                    }
                    strokeWidth={
                      isHole && (drag?.over === String(pos) || (selected !== null && !put)) ? 2.5 : 1
                    }
                    strokeDasharray={isHole && !put ? '4 3' : undefined}
                  />
                  <g transform={`scale(${S / 100})`}>
                    {face && <Glyph sym={face.sym} rot={face.rot} />}
                    {piece && <Glyph sym={piece.sym} rot={put!.rot} color="#7dd3fc" />}
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
            onPointerDown={startDrag(piece.id)}
            // Pilotest : « Pour retourner une des faces du bas […], cliquez dessus. »
            // Le clic retourne donc, il ne sélectionne pas ; c'est le glissement
            // qui pose la face. Un micro-mouvement ne doit pas passer pour un clic.
            onClick={() => {
              // Pilotest : « Cliquez sur une pièce pour la faire tourner d'un
              // quart de tour. » Le clic tourne donc, il ne sélectionne pas ;
              // c'est le glissement qui pose. Un micro-mouvement pendant un
              // glisser ne doit pas passer pour un clic.
              if (wasDragged()) return;
              turn(piece.id);
              setSelected(piece.id);
            }}
            className={`flex touch-none cursor-grab select-none flex-col items-center gap-1 rounded-lg border-2 p-1.5 active:cursor-grabbing ${
              drag?.payload === piece.id
                ? 'border-sky-400 bg-sky-900/40 opacity-60'
                : selected === piece.id
                  ? 'border-sky-500 bg-sky-950/40'
                  : 'border-zinc-700 hover:border-zinc-500'
            }`}
          >
            <PieceSvg piece={piece} rot={rotOf(piece.id)} />
            <span className="text-[10px] text-zinc-500">
              {i + 1}
              {rotOf(piece.id) > 0 ? ` ↻${rotOf(piece.id)}` : ''}
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
          <span className="text-zinc-400">Glisse</span> une face sur un trou ·{' '}
          <span className="text-zinc-400">clique</span> une face pour la tourner d'un quart de tour
          (posée ou non) · clic droit pour la retirer · au clavier : touches 1-{available.length}
          puis <kbd className="rounded bg-zinc-800 px-1">R</kbd>
        </p>
      </div>
      <div className="w-full max-w-2xl rounded-xl border border-amber-900/50 bg-amber-950/15 p-3 text-sm">
        <button type="button" onClick={() => setHintLevel((current) => { const next = Math.min(4, current + 1) as 1 | 2 | 3 | 4; noteCubeHint(item.seed, next); return next; })} className="font-semibold text-amber-300 hover:text-amber-200">Besoin d’un indice{hintLevel > 0 && hintLevel < 4 ? ' · niveau suivant' : ''}</button>
        {currentHint && <div className="mt-2 border-t border-amber-900/40 pt-2"><strong className="text-amber-200">{currentHint.title} — </strong><span className="text-zinc-300">{currentHint.text}</span></div>}
      </div>
    </div>
  );
}
