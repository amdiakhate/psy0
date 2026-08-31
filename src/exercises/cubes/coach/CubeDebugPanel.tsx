import type { CubesQuestion } from '../generator';
import { FACE_FRAMES, getClockwiseNeighbors, getOppositePosition } from '../domain/cubeGeometry';
import type { ReasoningPath } from '../domain/reasoningPath';
import type { FacePosition } from '../domain/types';

export function CubeDebugPanel({ question, path }: { question: CubesQuestion; path: ReasoningPath }) {
  const positions: FacePosition[] = [0, 1, 2, 3, 4, 5];
  return (
    <details className="mt-4 rounded-lg border border-fuchsia-800/60 bg-fuchsia-950/20 p-3 text-xs">
      <summary className="cursor-pointer font-semibold text-fuchsia-300">Debug cube</summary>
      <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap text-fuchsia-100/80">
        {JSON.stringify({
          faces: positions.map((position) => ({
            position,
            id: question.reference[position].id,
            opposite: getOppositePosition(position),
            ring: getClockwiseNeighbors(position),
            frame: FACE_FRAMES[position],
          })),
          holes: question.holes,
          path,
        }, null, 2)}
      </pre>
    </details>
  );
}
