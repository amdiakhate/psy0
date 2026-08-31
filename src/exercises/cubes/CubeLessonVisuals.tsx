import { useState } from 'react';
import { FoldPlayer } from './FoldingNet';
import { Glyph, symbolName } from './CubeSvg';
import { ALL_ROTATIONS, applyRotation, POS } from './cube-model';
import type { Cube } from './cube-model';
import { getOppositePosition, getSharedEdge, rotateEdge } from './domain/cubeGeometry';
import type { FaceEdge, FaceId, FacePosition } from './domain/types';
import { quarterTurn } from './domain/types';

const REFERENCE: Cube = [
  { id: 'right', originalPosition: POS.R, sym: 0, rot: 0 },
  { id: 'left', originalPosition: POS.L, sym: 1, rot: 0 },
  { id: 'up', originalPosition: POS.U, sym: 2, rot: 0 },
  { id: 'down', originalPosition: POS.D, sym: 3, rot: 0 },
  { id: 'front', originalPosition: POS.F, sym: 4, rot: 0 },
  { id: 'back', originalPosition: POS.B, sym: 5, rot: 0 },
];

const ORIENTED = applyRotation(REFERENCE, ALL_ROTATIONS[5]);
export const CUBE_LESSON_HOLES: readonly FacePosition[] = [POS.F, POS.R];
const CELLS: ReadonlyArray<{ position: FacePosition; col: number; row: number }> = [
  { position: POS.U, col: 1, row: 0 },
  { position: POS.L, col: 0, row: 1 },
  { position: POS.F, col: 1, row: 1 },
  { position: POS.R, col: 2, row: 1 },
  { position: POS.B, col: 3, row: 1 },
  { position: POS.D, col: 1, row: 2 },
];

const PAIRS: ReadonlyArray<{ positions: readonly [FacePosition, FacePosition]; color: string }> = [
  { positions: [POS.L, POS.R], color: '#38bdf8' },
  { positions: [POS.F, POS.B], color: '#4ade80' },
  { positions: [POS.U, POS.D], color: '#c084fc' },
];

const EDGE_POSITION: Record<FaceEdge, { x1: number; y1: number; x2: number; y2: number }> = {
  top: { x1: 8, y1: 3, x2: 92, y2: 3 },
  right: { x1: 97, y1: 8, x2: 97, y2: 92 },
  bottom: { x1: 8, y1: 97, x2: 92, y2: 97 },
  left: { x1: 3, y1: 8, x2: 3, y2: 92 },
};

function pairColor(faceId: FaceId): string | undefined {
  const position = REFERENCE.findIndex((face) => face.id === faceId) as FacePosition;
  return PAIRS.find((pair) => pair.positions.includes(position))?.color;
}

function Net({
  cube,
  label,
  holes = [],
  colorPairs = false,
  focusIds = [],
  faceColors = {},
}: {
  cube: Cube;
  label: string;
  holes?: readonly FacePosition[];
  colorPairs?: boolean;
  focusIds?: readonly FaceId[];
  faceColors?: Readonly<Partial<Record<FaceId, string>>>;
}) {
  const size = 56;
  return (
    <figure className="min-w-0">
      <figcaption className="mb-2 text-center text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">{label}</figcaption>
      <svg viewBox={`0 0 ${4 * size + 2} ${3 * size + 2}`} className="mx-auto h-auto w-full max-w-[290px]" role="img" aria-label={label}>
        {CELLS.map(({ position, col, row }) => {
          const face = cube[position];
          const missing = holes.includes(position);
          const color = faceColors[face.id] ?? (colorPairs ? pairColor(face.id) : undefined);
          const focused = focusIds.includes(face.id);
          return (
            <g key={position} transform={`translate(${col * size + 1} ${row * size + 1})`} className={focused ? 'cube-lesson-pulse' : undefined}>
              <rect width={size} height={size} rx="4" fill={missing ? 'var(--ink-950)' : 'var(--ink-800)'} stroke={focused ? '#f59e0b' : color ?? 'var(--ink-500)'} strokeWidth={focused || color ? 3 : 1} strokeDasharray={missing ? '6 4' : undefined} />
              {!missing && <g transform={`scale(${size / 100})`}><Glyph sym={face.sym} rot={face.rot} /></g>}
              {missing && <text x={size / 2} y={size / 2 + 6} textAnchor="middle" fill="var(--ink-500)" fontSize="22" fontWeight="700">?</text>}
            </g>
          );
        })}
      </svg>
    </figure>
  );
}

function Replayable({ children, label = 'Rejouer' }: { children: (replay: number) => React.ReactNode; label?: string }) {
  const [replay, setReplay] = useState(0);
  return (
    <div className="w-full">
      <div key={replay}>{children(replay)}</div>
      <button onClick={() => setReplay((value) => value + 1)} className="mx-auto mt-4 flex items-center gap-2 rounded-lg border border-sky-700 px-3 py-1.5 text-sm font-semibold text-sky-300 hover:bg-sky-950/35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400">
        <span aria-hidden>↻</span> {label}
      </button>
    </div>
  );
}

function PairLegend({ animated = false }: { animated?: boolean }) {
  return (
    <div className="mx-auto mt-4 grid max-w-2xl gap-2 sm:grid-cols-3">
      {PAIRS.map(({ positions, color }, index) => (
        <div key={positions.join('-')} className={animated ? 'cube-lesson-reveal rounded-lg border border-zinc-800 bg-zinc-950/40 p-3' : 'rounded-lg border border-zinc-800 bg-zinc-950/40 p-3'} style={animated ? { animationDelay: `${index * 180}ms` } : undefined}>
          <div className="flex items-center justify-center gap-2">
            <FaceChip face={REFERENCE[positions[0]]} color={color} />
            <span className="h-0.5 w-8" style={{ backgroundColor: color }} />
            <FaceChip face={REFERENCE[positions[1]]} color={color} />
          </div>
          <p className="mt-2 text-center text-[11px] font-semibold uppercase tracking-wide text-zinc-500">ne se touchent jamais</p>
        </div>
      ))}
    </div>
  );
}

function FaceChip({ face, color = '#38bdf8' }: { face: Cube[number]; color?: string }) {
  return <span className="grid h-11 w-11 place-items-center rounded-md border-2 bg-zinc-900 text-lg font-bold" style={{ borderColor: color, color }}>{symbolName(face.sym)}</span>;
}

function CompareNets() {
  const tracked = [REFERENCE[POS.U].id, REFERENCE[POS.F].id, REFERENCE[POS.R].id];
  const identityColors: Readonly<Partial<Record<FaceId, string>>> = {
    [tracked[0]]: '#c084fc',
    [tracked[1]]: '#4ade80',
    [tracked[2]]: '#38bdf8',
  };
  return (
    <Replayable label="Rejouer les correspondances">
      {() => <div className="grid w-full items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
        <Net cube={REFERENCE} label="Patron de référence" focusIds={tracked} faceColors={identityColors} />
        <div className="hidden flex-col gap-4 md:flex" aria-hidden>
          {tracked.map((id, index) => <span key={id} className="cube-lesson-arrow text-2xl" style={{ color: identityColors[id], animationDelay: `${index * 180}ms` }}>⟶</span>)}
        </div>
        <Net cube={ORIENTED} label="Même cube, autre dépliage" focusIds={tracked} faceColors={identityColors} />
        <p className="text-center text-xs text-zinc-500 md:col-span-3">Même couleur = même face physique. Sa case à l’écran peut changer.</p>
      </div>}
    </Replayable>
  );
}

function OppositeMap() {
  return <Replayable label="Rejouer les trois paires">{() => <div className="w-full"><Net cube={REFERENCE} label="Lis les trois axes du patron" colorPairs /><PairLegend animated /></div>}</Replayable>;
}

function SolveByOpposite() {
  const hole = POS.F;
  const visiblePosition = getOppositePosition(hole);
  const visible = ORIENTED[visiblePosition];
  const visibleInReference = REFERENCE.findIndex((face) => face.id === visible.id) as FacePosition;
  const answer = REFERENCE[getOppositePosition(visibleInReference)];
  return (
    <Replayable label="Rejouer la déduction">
      {() => <div className="w-full">
        <div className="grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr]">
          <VisualCard eyebrow="1 · Face visible" face={visible} caption="en face du trou" tone="amber" />
          <Arrow delay={120} />
          <VisualCard eyebrow="2 · Référence" face={visible} caption="retrouve ce symbole" tone="blue" />
          <Arrow delay={300} />
          <VisualCard eyebrow="3 · Son opposée" face={answer} caption="va dans le trou" tone="green" moving />
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2"><Net cube={ORIENTED} label="Trou à résoudre" holes={CUBE_LESSON_HOLES} focusIds={[visible.id]} /><Net cube={ORIENTED} label={`Face imposée : ${symbolName(answer.sym)}`} holes={[POS.R]} focusIds={[answer.id]} /></div>
      </div>}
    </Replayable>
  );
}

function Arrow({ delay }: { delay: number }) {
  return <svg viewBox="0 0 54 24" className="cube-lesson-arrow mx-auto h-6 w-14 text-sky-400" style={{ animationDelay: `${delay}ms` }} aria-hidden><path d="M3 12h42m-8-7 8 7-8 7" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function VisualCard({ eyebrow, face, caption, tone, moving = false }: { eyebrow: string; face: Cube[number]; caption: string; tone: 'amber' | 'blue' | 'green'; moving?: boolean }) {
  const colors = { amber: '#f59e0b', blue: '#38bdf8', green: '#4ade80' };
  return <div className={`rounded-xl border border-zinc-800 bg-zinc-950/45 p-3 text-center ${moving ? 'cube-lesson-arrive' : 'cube-lesson-reveal'}`}><p className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">{eyebrow}</p><div className="mx-auto mt-3 w-fit"><FaceChip face={face} color={colors[tone]} /></div><p className="mt-2 text-xs text-zinc-400">{caption}</p></div>;
}

function EdgeOrientation() {
  const targetPosition = POS.F;
  const face = ORIENTED[targetPosition];
  const anchorPosition = POS.U;
  const anchor = ORIENTED[anchorPosition];
  const sourceEdge = getSharedEdge(face.originalPosition, anchor.originalPosition)?.aEdge ?? 'top';
  const targetEdge = getSharedEdge(targetPosition, anchorPosition)?.aEdge ?? 'top';
  return (
    <Replayable label="Rejouer le déplacement du bord">
      {() => <div className="grid w-full items-center gap-5 sm:grid-cols-[1fr_auto_1fr]">
        <EdgeFace face={REFERENCE[face.originalPosition]} anchor={anchor} edge={sourceEdge} label="Sur la référence" />
        <Arrow delay={180} />
        <div className="cube-lesson-turn"><EdgeFace face={face} anchor={anchor} edge={targetEdge} label="Dans le patron cible" /></div>
        <p className="text-center text-xs text-zinc-500 sm:col-span-3"><span className="font-semibold text-red-400">Le trait rouge est la même arête physique.</span> Elle reste collée au même voisin.</p>
      </div>}
    </Replayable>
  );
}

function EdgeFace({ face, anchor, edge, label }: { face: Cube[number]; anchor: Cube[number]; edge: FaceEdge; label: string }) {
  const line = EDGE_POSITION[edge];
  return <figure className="text-center"><figcaption className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</figcaption><svg viewBox="-28 -28 156 156" className="mx-auto h-44 w-44"><rect width="100" height="100" rx="8" fill="var(--ink-800)" stroke="var(--ink-500)" /><Glyph sym={face.sym} rot={face.rot} /><line {...line} stroke="#f87171" strokeWidth="6" strokeLinecap="round" /><circle cx={edge === 'left' ? -17 : edge === 'right' ? 117 : 50} cy={edge === 'top' ? -17 : edge === 'bottom' ? 117 : 50} r="17" fill="var(--ink-950)" stroke="#f87171" strokeWidth="2" /><text x={edge === 'left' ? -17 : edge === 'right' ? 117 : 50} y={(edge === 'top' ? -17 : edge === 'bottom' ? 117 : 50) + 6} textAnchor="middle" fill="#f87171" fontSize="18" fontWeight="800">{symbolName(anchor.sym)}</text></svg></figure>;
}

function RotatePiece() {
  const face = ORIENTED[POS.F];
  const turns = face.rot === 0 ? 1 : face.rot;
  const targetEdge = rotateEdge('top', quarterTurn(turns));
  return <Replayable label="Rejouer la rotation">{() => <div className="w-full"><div className="grid items-center gap-5 sm:grid-cols-[1fr_auto_1fr]"><EdgeFace face={{ ...face, rot: 0 }} anchor={ORIENTED[POS.U]} edge="top" label="Pièce proposée" /><div className="text-center"><div className="cube-lesson-spin text-5xl text-sky-400" style={{ '--lesson-turn': `${-90 * turns}deg` } as React.CSSProperties}>↻</div><p className="mt-2 font-mono text-sm text-sky-300">{turns === 2 ? '180°' : turns === 1 ? '90° anti-horaire' : '90° horaire'}</p></div><div className="cube-lesson-turn" style={{ '--lesson-turn': `${-90 * turns}deg` } as React.CSSProperties}><EdgeFace face={face} anchor={ORIENTED[POS.U]} edge={targetEdge} label="Orientation visée" /></div></div><p className="mt-3 text-center text-xs text-zinc-500">Le symbole tourne avec le carré : le clic ne déplace jamais la face.</p></div>}</Replayable>;
}

function SymmetricSymbols() {
  return <Replayable label="Rejouer les quarts de tour">{() => <div className="grid w-full gap-5 md:grid-cols-2"><RotationStrip sym={6} label="Carré : identique dans les 4 sens" invariant /><RotationStrip sym={11} label="Croix : le bras long change de côté" /></div>}</Replayable>;
}

function RotationStrip({ sym, label, invariant = false }: { sym: number; label: string; invariant?: boolean }) {
  return <figure className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4"><figcaption className={`text-center text-sm font-semibold ${invariant ? 'text-green-400' : 'text-amber-400'}`}>{label}</figcaption><div className="mt-4 grid grid-cols-4 gap-2">{[0, 1, 2, 3].map((rot) => <div key={rot} className="cube-lesson-reveal" style={{ animationDelay: `${rot * 160}ms` }}><svg viewBox="0 0 100 100" className="w-full rounded-md border border-zinc-700 bg-zinc-800"><Glyph sym={sym} rot={rot} /></svg><p className="mt-1 text-center font-mono text-[10px] text-zinc-500">{rot * 90}°</p></div>)}</div><p className="mt-3 text-center text-xs text-zinc-500">{invariant ? '✓ aucune orientation à résoudre' : '⚠ orientation obligatoire'}</p></figure>;
}

function VerifyPairs() {
  return <Replayable label="Rejouer le contrôle">{() => <div className="w-full"><div className="grid gap-4 sm:grid-cols-2"><Net cube={REFERENCE} label="Référence" colorPairs /><Net cube={ORIENTED} label="Patron complété" colorPairs /></div><div className="mt-4"><PairLegend animated /></div><p className="mt-3 text-center text-sm font-semibold text-green-400">✓ 3 paires identiques : le placement est cohérent</p></div>}</Replayable>;
}

export function CubesLessonScene({ scene }: { scene: string; stepIndex: number }) {
  if (scene === 'fold' || scene === 'fold-pairs') return <div className="w-full text-center"><p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">{scene === 'fold' ? 'Pilote le pliage avec le curseur' : 'Les couleurs finissent face à face'}</p><FoldPlayer cube={REFERENCE} pairColors={scene === 'fold-pairs'} />{scene === 'fold-pairs' && <PairLegend />}</div>;
  if (scene === 'compare-nets') return <CompareNets />;
  if (scene === 'map-opposites') return <OppositeMap />;
  if (scene === 'solve-opposite') return <SolveByOpposite />;
  if (scene === 'orient-edge') return <EdgeOrientation />;
  if (scene === 'rotate-piece') return <RotatePiece />;
  if (scene === 'symmetric-symbols') return <SymmetricSymbols />;
  if (scene === 'verify-pairs') return <VerifyPairs />;
  return <p className="text-red-400">Scène Cubes inconnue.</p>;
}
