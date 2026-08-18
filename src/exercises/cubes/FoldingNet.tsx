import { useMemo } from 'react';
import { Glyph } from './CubeSvg';
import type { Cube } from './cube-model';
import { POS } from './cube-model';
import { foldedFaces } from './fold-model';
import type { V3 } from './fold-model';
import { foldCycle } from '../../anim/timeline';
import { useTimeline } from '../../hooks/useTimeline';

/**
 * Le patron qui SE PLIE, en continu, du plat au cube fermé.
 *
 * C'est le geste que l'épreuve demande de faire de tête : le voir une fois en
 * vrai fonde tout le reste de la leçon — notamment pourquoi deux cases
 * séparées d'une case dans le patron finissent sur des faces OPPOSÉES, la
 * règle centrale de la méthode.
 *
 * La géométrie vient de `fold-model.ts`, prouvée par tests (cube unité exact à
 * t=1, charnières jamais déchirées, symboles à l'extérieur). Ici on ne fait
 * que projeter et peindre.
 */

const SQRT3 = Math.sqrt(3);

function project(p: V3): [number, number] {
  return [(p[0] - p[2]) * 0.866, (p[0] + p[2]) * 0.5 - p[1]];
}

/** Cadre FIXE contenant le pliage à tous les instants : un zoom qui respire distrairait du mouvement utile. */
const BOUNDS = (() => {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (let i = 0; i <= 8; i++) {
    for (const f of foldedFaces(i / 8)) {
      for (const c of f.corners) {
        const [x, y] = project(c);
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }
  return { minX: minX - 0.25, minY: minY - 0.25, w: maxX - minX + 0.5, h: maxY - minY + 0.5 };
})();

/** Paires d'opposées — la leçon les colore pour qu'on VOIE les trois familles se faire face. */
const PAIR_FILL: Record<number, string> = {
  [POS.L]: '#7cc4ff',
  [POS.R]: '#7cc4ff',
  [POS.U]: '#86efac',
  [POS.D]: '#86efac',
  [POS.F]: '#fcd34d',
  [POS.B]: '#fcd34d',
};

/**
 * Assombrit une couleur hex vers l'ombre, en OPAQUE. L'ombrage par opacité
 * laisserait transparaître les faces d'arrière-plan à travers celles de devant
 * — un cube fantôme au lieu d'un cube en carton.
 */
function shadeHex(hex: string, k: number): string {
  const v = parseInt(hex.slice(1), 16);
  const mix = (c: number) => Math.round(c * (0.4 + 0.6 * k));
  return `rgb(${mix((v >> 16) & 255)} ${mix((v >> 8) & 255)} ${mix(v & 255)})`;
}

const LIGHT: V3 = [0.25, 0.9, 0.35];
const LIGHT_LEN = Math.hypot(...LIGHT);

export function FoldingNet({
  cube,
  t,
  pairColors = false,
  px = 340,
}: {
  cube: Cube;
  /** 0 = patron à plat, 1 = cube fermé. */
  t: number;
  pairColors?: boolean;
  px?: number;
}) {
  const faces = useMemo(() => {
    return foldedFaces(t)
      .map((f) => {
        const depth =
          f.corners.reduce((s, c) => s + (c[0] + c[1] + c[2]), 0) / (4 * SQRT3);
        const nLen = Math.hypot(...f.normal) || 1;
        // Verso visible quand la face imprimée tourne le dos au spectateur (+1,+1,+1).
        const facing = (f.normal[0] + f.normal[1] + f.normal[2]) / (nLen * SQRT3);
        const shade =
          0.35 +
          0.65 *
            Math.max(
              0,
              (f.normal[0] * LIGHT[0] + f.normal[1] * LIGHT[1] + f.normal[2] * LIGHT[2]) /
                (nLen * LIGHT_LEN),
            );
        return { ...f, depth, backSide: facing < 0, shade };
      })
      .sort((a, b) => a.depth - b.depth);
  }, [t]);

  return (
    <svg
      width={px}
      height={px * (BOUNDS.h / BOUNDS.w)}
      viewBox={`${BOUNDS.minX} ${BOUNDS.minY} ${BOUNDS.w} ${BOUNDS.h}`}
      role="img"
      aria-label="Patron de cube en cours de pliage"
    >
      {faces.map((f) => {
        const pts = f.corners.map(project);
        const polygon = pts.map(([x, y]) => `${x.toFixed(4)},${y.toFixed(4)}`).join(' ');
        if (f.backSide) {
          // Le verso du carton : gris, sans symbole. Voir le dos fait partie de
          // la compréhension du pliage — le masquer rendrait le mouvement illisible.
          return (
            <polygon key={f.pos} points={polygon} fill="#9b9b9b" stroke="#3f3f3f" strokeWidth={0.02} />
          );
        }
        const p0 = pts[0];
        const pu = project([f.origin[0] + f.u[0], f.origin[1] + f.u[1], f.origin[2] + f.u[2]]);
        const pv = project([f.origin[0] + f.v[0], f.origin[1] + f.v[1], f.origin[2] + f.v[2]]);
        const m = [
          (pu[0] - p0[0]) / 100,
          (pu[1] - p0[1]) / 100,
          (pv[0] - p0[0]) / 100,
          (pv[1] - p0[1]) / 100,
          p0[0],
          p0[1],
        ];
        const base = pairColors ? PAIR_FILL[f.pos] : '#e8e4de';
        return (
          <g key={f.pos}>
            <polygon
              points={polygon}
              fill={shadeHex(base, f.shade)}
              stroke="#3f3f3f"
              strokeWidth={0.022}
              strokeLinejoin="round"
            />
            <g transform={`matrix(${m.map((v) => v.toFixed(5)).join(' ')})`}>
              <Glyph sym={cube[f.pos].sym} rot={cube[f.pos].rot} color="#26221f" />
            </g>
          </g>
        );
      })}
    </svg>
  );
}

/**
 * Le lecteur : boucle plier / tenir / déplier / tenir, avec pause et curseur.
 * Le curseur n'est pas un gadget : pouvoir ARRÊTER le pliage à mi-course et le
 * faire avancer soi-même, c'est le moment où l'animation devient un modèle
 * mental. En `prefers-reduced-motion`, rien ne bouge seul — le curseur reste.
 */
export function FoldPlayer({ cube, pairColors = false }: { cube: Cube; pairColors?: boolean }) {
  const { value, playing, toggle, scrub } = useTimeline(foldCycle());
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="rounded-lg border-2 border-zinc-700 px-3 py-1" style={{ background: '#e7e5e4' }}>
        <FoldingNet cube={cube} t={value} pairColors={pairColors} />
      </div>
      <div className="flex w-full max-w-sm items-center gap-3">
        <button
          onClick={toggle}
          className="rounded-lg border border-zinc-600 px-3 py-1 font-mono text-sm text-zinc-300 hover:border-sky-500"
          aria-label={playing ? 'Pause' : 'Lecture'}
        >
          {playing ? '⏸' : '▶'}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.005}
          value={value}
          onChange={(e) => scrub(Number(e.target.value))}
          className="flex-1 accent-sky-500"
          aria-label="Avancement du pliage"
        />
        <span className="w-14 text-right font-mono text-xs text-zinc-500">
          {Math.round(value * 100)} %
        </span>
      </div>
    </div>
  );
}
