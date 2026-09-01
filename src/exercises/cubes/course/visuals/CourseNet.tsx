import type { CourseFaceId } from '../courseModel';
import { COURSE_FACE_COLORS, COURSE_NET_CELLS } from '../courseFixtures';

export function CourseFace({ face, size = 72, muted = false }: { face: CourseFaceId; size?: number; muted?: boolean }) {
  const color = COURSE_FACE_COLORS[face];
  return (
    <div className="grid aspect-square place-items-center rounded-xl border-2 font-mono text-xl font-black shadow-lg transition-all"
      style={{ width: size, borderColor: color, color, background: muted ? '#18181b' : `color-mix(in srgb, ${color} 14%, #18181b)` }}>
      {face}
    </div>
  );
}

export function CourseNet({
  label,
  focus = [],
  muted = [],
  compact = false,
}: {
  label: string;
  focus?: readonly CourseFaceId[];
  muted?: readonly CourseFaceId[];
  compact?: boolean;
}) {
  const size = compact ? 48 : 66;
  return (
    <figure className="min-w-0">
      <figcaption className="mb-3 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">{label}</figcaption>
      <svg viewBox={`0 0 ${size * 4 + 8} ${size * 3 + 8}`} className="mx-auto w-full max-w-[330px]" role="img" aria-label={`${label} : E au-dessus de B, A B C D en ligne, F sous B`}>
        {COURSE_NET_CELLS.map(({ faceId, col, row }) => {
          const color = COURSE_FACE_COLORS[faceId];
          const isFocus = focus.includes(faceId);
          const isMuted = muted.includes(faceId);
          return (
            <g key={faceId} transform={`translate(${col * size + 4} ${row * size + 4})`} opacity={isMuted ? 0.28 : 1}>
              <rect width={size} height={size} rx="7" fill={isFocus ? color : '#202126'} fillOpacity={isFocus ? 0.2 : 1} stroke={color} strokeWidth={isFocus ? 4 : 2} />
              <text x={size / 2} y={size / 2 + 8} textAnchor="middle" fill={color} fontSize={size * 0.34} fontWeight="900" fontFamily="ui-monospace, monospace">{faceId}</text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}

