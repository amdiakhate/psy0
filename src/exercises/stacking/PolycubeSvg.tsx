import type { ReactNode } from 'react';
import { isoBounds, isoFaces, worldSizeFor, IDENTITY } from './model';
import type { Mat3, Shape } from './model';

/**
 * Rendu d'un empilement de cubes. La géométrie vient de `model.ts` — c'est
 * EXACTEMENT celle que `rasterize` utilise pour garantir, à la génération et
 * dans les tests, qu'aucun item n'affiche deux dessins trop semblables.
 *
 * Palette calquée sur Pilotest : dessus rouge vif, flancs presque noirs. Ce
 * n'est pas qu'une question de ressemblance — un contraste faible entre les
 * trois familles de faces rend le relief ambigu, et l'exercice se joue
 * précisément sur la lecture du relief.
 *
 * L'échelle est imposée de l'extérieur via `world` (côté du viewBox en unités
 * cube) : les trois empilements d'un item ont ainsi des cubes exactement de la
 * même taille, chacun centré sur sa propre boîte.
 */

export type Rgb = readonly [number, number, number];

const NEUTRAL: { dark: Rgb; bright: Rgb } = { dark: [58, 51, 53], bright: [251, 116, 114] };
const ACCENT: { dark: Rgb; bright: Rgb } = { dark: [24, 52, 71], bright: [94, 200, 251] };

/**
 * Gamma > 1 : il creuse l'écart entre le dessus et les flancs. Une rampe
 * linéaire donnait trois gris trop voisins, où le relief se devinait au lieu de
 * se voir.
 */
const SHADE_GAMMA = 1.5;

function ramp(palette: { dark: Rgb; bright: Rgb }, shade: number): string {
  const t = Math.pow(Math.max(0, Math.min(1, shade)), SHADE_GAMMA);
  const c = [0, 1, 2].map((i) => Math.round(palette.dark[i] + (palette.bright[i] - palette.dark[i]) * t));
  return `rgb(${c[0]} ${c[1]} ${c[2]})`;
}

/** Côté (en unités cube) du viewBox nécessaire pour contenir toutes ces formes. */
export function commonWorldSize(shapes: Shape[], tilts?: Mat3[]): number {
  return worldSizeFor(shapes.map((shape, i) => ({ shape, tilt: tilts?.[i] })));
}

export function PolycubeSvg({
  shape,
  tilt = IDENTITY,
  world,
  px = 150,
  accent = false,
  cellPalette,
  children,
}: {
  shape: Shape;
  /** Inclinaison de présentation — identité pour les figures de la leçon. */
  tilt?: Mat3;
  /** Côté du viewBox en unités cube — identique pour tous les empilements d'un item. */
  world: number;
  /** Côté du SVG en pixels. */
  px?: number;
  accent?: boolean;
  /** Leçon : palette dédiée pour certains cubes (index → couleurs), pour montrer bras / saillie / dessus. */
  cellPalette?: (cellIndex: number) => { dark: Rgb; bright: Rgb } | null;
  /** Leçon : tracés ajoutés PAR-DESSUS les faces, dans le même repère (voir `projectPoint`). */
  children?: ReactNode;
}) {
  const faces = isoFaces(shape, tilt);
  const { minX, maxX, minY, maxY } = isoBounds(faces);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const palette = accent ? ACCENT : NEUTRAL;

  return (
    <svg
      width={px}
      height={px}
      viewBox={`${cx - world / 2} ${cy - world / 2} ${world} ${world}`}
      role="img"
      aria-label="Empilement de cubes"
    >
      {faces.map((f, i) => (
        <polygon
          key={i}
          points={f.points.map(([x, y]) => `${x.toFixed(3)},${y.toFixed(3)}`).join(' ')}
          fill={ramp(cellPalette?.(f.cell) ?? palette, f.shade)}
          stroke="rgb(32 27 29)"
          strokeWidth={0.03}
          strokeLinejoin="round"
        />
      ))}
      {children}
    </svg>
  );
}
