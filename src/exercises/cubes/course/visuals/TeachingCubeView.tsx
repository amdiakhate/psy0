import { FoldingNet } from '../../FoldingNet';
import type { Cube, FacePosition } from '../../domain/types';
import { COURSE_FACE_COLORS } from '../courseFixtures';
import type { CourseFaceId } from '../courseModel';

function visualMaps(cube: Cube) {
  const labels: Partial<Record<FacePosition, string>> = {};
  const colors: Partial<Record<FacePosition, string>> = {};
  cube.forEach((face, position) => {
    labels[position as FacePosition] = face.id;
    colors[position as FacePosition] = COURSE_FACE_COLORS[face.id as CourseFaceId];
  });
  return { labels, colors };
}

export function TeachingCubeView({ cube, fold, focus, label }: {
  cube: Cube; fold: number; focus: CourseFaceId; label: string;
}) {
  const { labels, colors } = visualMaps(cube);
  return (
    <figure className="relative rounded-2xl border border-zinc-800 bg-[#e7e5e4] p-3">
      <figcaption className="absolute left-3 top-3 z-10 rounded-md bg-zinc-950/85 px-2 py-1 text-[10px] font-bold uppercase tracking-[.14em] text-zinc-200">{label}</figcaption>
      <div className="pointer-events-none absolute right-3 top-3 z-10 flex items-center gap-2 rounded-full bg-zinc-950/90 px-3 py-1.5 text-xs font-bold" style={{ color: COURSE_FACE_COLORS[focus] }}>
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: COURSE_FACE_COLORS[focus], boxShadow: `0 0 16px ${COURSE_FACE_COLORS[focus]}` }} />
        face {focus}
      </div>
      <FoldingNet cube={cube} t={fold} faceLabels={labels} faceColors={colors} px={360} />
    </figure>
  );
}

