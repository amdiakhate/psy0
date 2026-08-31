import { useState } from 'react';
import { Glyph } from '../CubeSvg';
import type { Cube } from '../domain/types';
import type { OrientationDiagnostic } from '../domain/cubeAnalysis';
import { faceName } from './CubeCoachVisuals';

const edgeClass = {
  top: 'left-2 right-2 top-0 h-1',
  right: 'bottom-2 right-0 top-2 w-1',
  bottom: 'bottom-0 left-2 right-2 h-1',
  left: 'bottom-2 left-0 top-2 w-1',
} as const;

function turnLabel(correction: number): string {
  if (correction === 0) return 'aucune rotation';
  if (correction === 2) return '180°';
  return correction === 1 ? '90° antihoraire' : '90° horaire';
}

export function CubeRotationExplanation({ diagnostic, cube }: { diagnostic: OrientationDiagnostic; cube: Cube }) {
  const [replay, setReplay] = useState(0);
  const face = cube.find((candidate) => candidate.id === diagnostic.faceId)!;
  return (
    <section className="rounded-xl bg-sky-950/25 p-4" aria-label={`Pourquoi la face ${faceName(cube, diagnostic.faceId)} tourne`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="font-semibold text-sky-200">Même bord physique, autre côté à l’écran</h4>
          <p className="mt-1 max-w-2xl text-sm text-zinc-300">
            L’arête rouge touchait {faceName(cube, diagnostic.anchorFaceId)} sur le patron de référence.
            Dans le patron cible, ce même voisin impose l’arête {diagnostic.targetEdge}. Le symbole tourne avec la face.
          </p>
        </div>
        <button onClick={() => setReplay((value) => value + 1)} className="rounded-md border border-sky-700 px-3 py-1.5 text-sm text-sky-200 hover:bg-sky-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400">
          Rejouer la rotation
        </button>
      </div>
      <div className="mt-4 grid items-center gap-4 sm:grid-cols-[1fr_auto_1fr]">
        <FaceWithEdge sym={face.sym} rot={diagnostic.givenRot} edge={diagnostic.sourceEdge} label="Ta rotation" />
        <svg viewBox="0 0 48 24" className="mx-auto h-6 w-12 text-sky-400" aria-hidden>
          <path d="M3 12h36m-8-7 8 7-8 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div key={replay} className="cube-coach-turn" style={{ '--cube-turn': `${-90 * diagnostic.correction}deg` } as React.CSSProperties}>
          <FaceWithEdge sym={face.sym} rot={diagnostic.expectedRot} edge={diagnostic.targetEdge} label="Orientation correcte" />
        </div>
      </div>
      <p className="mt-3 text-center text-sm font-semibold text-sky-200">Rotation nécessaire : {turnLabel(diagnostic.correction)}</p>
    </section>
  );
}

function FaceWithEdge({ sym, rot, edge, label }: { sym: number; rot: number; edge: keyof typeof edgeClass; label: string }) {
  return (
    <figure className="text-center">
      <div className="relative mx-auto h-28 w-28 rounded-lg border border-zinc-600 bg-zinc-800">
        <span className={`absolute z-10 rounded-full bg-red-400 ${edgeClass[edge]}`} />
        <svg viewBox="0 0 100 100" className="h-full w-full" aria-label={`${label}, symbole tourné de ${rot * 90} degrés`}>
          <Glyph sym={sym} rot={rot} />
        </svg>
      </div>
      <figcaption className="mt-2 text-xs text-zinc-400">{label}</figcaption>
    </figure>
  );
}
