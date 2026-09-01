import { useMemo, useState, type ReactNode } from 'react';
import { Glyph } from '../../CubeSvg';
import { POS } from '../../cube-model';
import { rotateEdge } from '../../domain/cubeGeometry';
import type { Cube, FaceEdge, FaceId, FacePosition, QuarterTurn } from '../../domain/types';

const CELLS: ReadonlyArray<{ pos: FacePosition; col: number; row: number }> = [
  { pos: POS.U, col: 1, row: 0 }, { pos: POS.L, col: 0, row: 1 },
  { pos: POS.F, col: 1, row: 1 }, { pos: POS.R, col: 2, row: 1 },
  { pos: POS.B, col: 3, row: 1 }, { pos: POS.D, col: 1, row: 2 },
];

const EDGE_LINE: Record<FaceEdge, { x1: number; y1: number; x2: number; y2: number }> = {
  top: { x1: 9, y1: 5, x2: 51, y2: 5 }, right: { x1: 55, y1: 9, x2: 55, y2: 51 },
  bottom: { x1: 9, y1: 55, x2: 51, y2: 55 }, left: { x1: 5, y1: 9, x2: 5, y2: 51 },
};
const EDGE_LABEL: Record<FaceEdge, string> = { top: 'haut', right: 'droite', bottom: 'bas', left: 'gauche' };
const TURN_LABEL: Record<QuarterTurn, string> = {
  0: '0°', 1: '90° antihoraire', 2: '180°', 3: '90° horaire',
};

export interface PhysicalEdgeJourneyProps {
  originalCube: Cube;
  targetCube: Cube;
  faceId: FaceId;
  anchorFaceId: FaceId;
  sourceEdge: FaceEdge;
  targetEdge: FaceEdge;
  referenceRot: QuarterTurn;
  expectedRot: QuarterTurn;
  faceLabel(faceId: FaceId): string;
  intro?: ReactNode;
  interactive?: boolean;
  isolatedGlyph?: ReactNode;
}

function positionOf(cube: Cube, faceId: FaceId): FacePosition {
  const index = cube.findIndex((face) => face.id === faceId);
  if (index < 0) throw new Error(`Face absente du cube : ${faceId}`);
  return index as FacePosition;
}

function turnFromEdges(source: FaceEdge, target: FaceEdge): QuarterTurn {
  return ([0, 1, 2, 3] as const).find((turn) => rotateEdge(source, turn) === target) ?? 0;
}

export function PhysicalEdgeJourney({
  originalCube, targetCube, faceId, anchorFaceId, sourceEdge, targetEdge,
  referenceRot, expectedRot, faceLabel, intro, interactive = false, isolatedGlyph,
}: PhysicalEdgeJourneyProps) {
  const correctTurn = useMemo(() => turnFromEdges(sourceEdge, targetEdge), [sourceEdge, targetEdge]);
  const [selectedTurn, setSelectedTurn] = useState<QuarterTurn | null>(interactive ? null : correctTurn);
  const [replay, setReplay] = useState(0);
  const face = originalCube[positionOf(originalCube, faceId)];
  const isCorrect = selectedTurn === correctTurn;
  const displayedTurn = selectedTurn ?? 0;

  return (
    <section className="cube-edge-journey rounded-2xl border border-sky-900/70 bg-sky-950/15 p-4" aria-label={`Pourquoi la face ${faceLabel(faceId)} tourne`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-sky-400">Même arête physique</p>
          <h4 className="mt-1 text-lg font-semibold text-sky-100">Voisin ancre : {faceLabel(anchorFaceId)} · le bord rouge reste attaché</h4>
          {intro ?? <p className="mt-1 max-w-2xl text-sm text-zinc-400">Suis le bord dans les trois vues : il quitte le patron de référence, tourne avec le symbole, puis rejoint le même voisin dans le patron cible.</p>}
        </div>
        <button type="button" onClick={() => setReplay((value) => value + 1)} className="rounded-lg border border-sky-700 px-3 py-2 text-sm font-semibold text-sky-200 hover:bg-sky-950/50">↻ Rejouer</button>
      </div>

      <div className="mt-5 grid items-stretch gap-4 lg:grid-cols-[1fr_.72fr_1fr]">
        <EdgeNet cube={originalCube} faceId={faceId} anchorFaceId={anchorFaceId} edge={sourceEdge} label="1 · Patron original" faceLabel={faceLabel} />
        <figure className="rounded-xl border border-zinc-800 bg-zinc-950/65 p-3 text-center">
          <figcaption className="text-[11px] font-bold uppercase tracking-[.16em] text-zinc-500">2 · Face isolée</figcaption>
          <svg key={`${replay}-${displayedTurn}`} viewBox="-18 -18 136 136" className="mx-auto mt-3 w-full max-w-[190px]" role="img" aria-label={`Face ${faceLabel(faceId)}, rotation ${TURN_LABEL[displayedTurn]}`}>
            <g className="cube-edge-face-turn" style={{ '--cube-edge-turn': `${-90 * displayedTurn}deg`, transformOrigin: '50px 50px' } as React.CSSProperties}>
              <rect width="100" height="100" rx="10" fill="#202126" stroke="#71717a" strokeWidth="2" />
              {isolatedGlyph ?? <Glyph sym={face.sym} rot={referenceRot} />}
              <line {...scaleEdge(EDGE_LINE[sourceEdge], 100 / 60)} stroke="#fb7185" strokeWidth="7" strokeLinecap="round" />
            </g>
          </svg>
          <p className="mt-2 font-mono text-sm font-semibold text-sky-300">{TURN_LABEL[displayedTurn]}</p>
        </figure>
        <EdgeNet cube={targetCube} faceId={faceId} anchorFaceId={anchorFaceId} edge={targetEdge} label="3 · Patron cible" faceLabel={faceLabel} />
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2" aria-label="Choisir la rotation">
        {([0, 1, 2, 3] as const).map((turn) => (
          <button key={turn} type="button" onClick={() => setSelectedTurn(turn)} aria-pressed={selectedTurn === turn}
            className={`rounded-lg border px-3 py-2 text-sm font-semibold ${selectedTurn === turn ? 'border-sky-400 bg-sky-950 text-sky-100' : 'border-zinc-700 text-zinc-300'}`}>
            {TURN_LABEL[turn]}
          </button>
        ))}
      </div>
      {selectedTurn !== null && (
        <p className={`mt-3 text-center text-sm font-semibold ${isCorrect ? 'text-green-400' : 'text-red-400'}`} role="status">
          {isCorrect
            ? `✓ Le bord physique rejoint bien ${faceLabel(anchorFaceId)} côté ${EDGE_LABEL[targetEdge]}.`
            : `✗ Le bord rouge arrive côté ${EDGE_LABEL[rotateEdge(sourceEdge, selectedTurn)]}, pas côté ${EDGE_LABEL[targetEdge]}.`}
        </p>
      )}
      {selectedTurn !== null && <p className="mt-2 text-center text-xs text-zinc-500">Orientation finale du symbole : {TURN_LABEL[expectedRot]} dans le patron cible.</p>}
    </section>
  );
}

function scaleEdge(line: { x1: number; y1: number; x2: number; y2: number }, factor: number) {
  return { x1: line.x1 * factor, y1: line.y1 * factor, x2: line.x2 * factor, y2: line.y2 * factor };
}

function EdgeNet({ cube, faceId, anchorFaceId, edge, label, faceLabel }: {
  cube: Cube; faceId: FaceId; anchorFaceId: FaceId; edge: FaceEdge; label: string; faceLabel(id: FaceId): string;
}) {
  const size = 60;
  const position = positionOf(cube, faceId);
  return (
    <figure className="rounded-xl border border-zinc-800 bg-zinc-950/65 p-3">
      <figcaption className="text-center text-[11px] font-bold uppercase tracking-[.16em] text-zinc-500">{label}</figcaption>
      <svg viewBox="0 0 248 188" className="mx-auto mt-3 w-full max-w-[300px]" role="img" aria-label={`${label}, le bord de ${faceLabel(faceId)} touche ${faceLabel(anchorFaceId)}`}>
        {CELLS.map(({ pos, col, row }) => {
          const current = cube[pos];
          const focused = pos === position;
          const anchor = current.id === anchorFaceId;
          return (
            <g key={pos} transform={`translate(${col * size + 4} ${row * size + 4})`} opacity={focused || anchor ? 1 : .3}>
              <rect width={size} height={size} rx="6" fill={focused ? '#172554' : anchor ? '#3f1d2e' : '#202126'} stroke={focused ? '#38bdf8' : anchor ? '#fb7185' : '#52525b'} strokeWidth={focused || anchor ? 3 : 1.5} />
              <text x={size / 2} y={size / 2 + 6} textAnchor="middle" fill={focused ? '#7dd3fc' : anchor ? '#fda4af' : '#a1a1aa'} fontSize="18" fontWeight="900">{faceLabel(current.id)}</text>
              {focused && <line {...EDGE_LINE[edge]} stroke="#fb7185" strokeWidth="6" strokeLinecap="round" />}
            </g>
          );
        })}
      </svg>
      <p className="mt-2 text-center text-xs text-zinc-400">{faceLabel(faceId)} touche {faceLabel(anchorFaceId)} par son bord {EDGE_LABEL[edge]}.</p>
    </figure>
  );
}
