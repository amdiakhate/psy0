import type { Cube } from '../domain/types';
import type { OrientationDiagnostic } from '../domain/cubeAnalysis';
import { PhysicalEdgeJourney } from '../course/visuals/PhysicalEdgeJourney';
import { faceName } from './CubeCoachVisuals';

export function CubeRotationExplanation({ diagnostic, reference, target }: { diagnostic: OrientationDiagnostic; reference: Cube; target: Cube }) {
  return (
    <PhysicalEdgeJourney
      originalCube={reference}
      targetCube={target}
      faceId={diagnostic.faceId}
      anchorFaceId={diagnostic.anchorFaceId}
      sourceEdge={diagnostic.sourceEdge}
      targetEdge={diagnostic.targetEdge}
      referenceRot={diagnostic.referenceRot}
      expectedRot={diagnostic.expectedRot}
      faceLabel={(id) => faceName(target, id)}
    />
  );
}
