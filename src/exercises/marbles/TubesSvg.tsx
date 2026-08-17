import { CAPACITIES } from './model';
import type { State } from './model';
import { MARBLE_COLORS } from './config';

/** Trois tubes en U (capacités 3, 2, 3), billes empilées depuis le fond. */
export function TubesSvg({ state, size = 1, label }: { state: State; size?: number; label?: string }) {
  const R = 17 * size;
  const GAP = 5 * size;
  const TUBE_W = 2 * R + 10 * size;
  const TUBE_GAP = 16 * size;
  const maxCap = Math.max(...CAPACITIES);
  const H = maxCap * (2 * R + GAP) + 14 * size;
  const W = 3 * TUBE_W + 2 * TUBE_GAP;

  return (
    <div className="text-center">
      {label && <p className="mb-1 text-xs uppercase tracking-widest text-zinc-500">{label}</p>}
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {CAPACITIES.map((cap, t) => {
          const x = t * (TUBE_W + TUBE_GAP);
          const tubeH = cap * (2 * R + GAP) + 8 * size;
          const y = H - tubeH;
          return (
            <g key={t}>
              {/* Tube en U : ouvert en haut, arrondi en bas */}
              <path
                d={`M${x},${y} L${x},${y + tubeH - TUBE_W / 2} A${TUBE_W / 2},${TUBE_W / 2} 0 0 0 ${x + TUBE_W},${y + tubeH - TUBE_W / 2} L${x + TUBE_W},${y}`}
                fill="#18181b"
                stroke="#71717a"
                strokeWidth={2 * size}
              />
              {/* Billes, du fond vers le haut */}
              {state[t].map((color, i) => (
                <circle
                  key={i}
                  cx={x + TUBE_W / 2}
                  cy={y + tubeH - 8 * size - R - i * (2 * R + GAP)}
                  r={R}
                  fill={MARBLE_COLORS[color % MARBLE_COLORS.length]}
                  stroke="#09090b"
                  strokeWidth={1.5}
                />
              ))}
              <text
                x={x + TUBE_W / 2}
                y={H - 1}
                textAnchor="middle"
                className="fill-zinc-600"
                style={{ fontSize: 10 * size, fontFamily: 'monospace' }}
              >
                {cap}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
