import { isoBounds, isoFaces } from './model';
import type { IsoFaceKind, Shape } from './model';

/**
 * Rendu isométrique d'un empilement de cubes. La géométrie vient de `model.ts`
 * (`isoFaces`, ordre du peintre) : c'est EXACTEMENT celle que `isoImageKey`
 * rasterise pour garantir, dans les tests, qu'aucune orientation ne produit la
 * même image qu'une autre.
 *
 * L'échelle est imposée de l'extérieur via `world` (côté du viewBox en unités
 * cube) : les trois empilements d'un item ont ainsi des cubes exactement de la
 * même taille, chacun centré sur sa propre boîte.
 */

const NEUTRAL: Record<IsoFaceKind, string> = { 1: 'var(--ink-200)', 2: 'var(--ink-400)', 3: 'var(--ink-500)' };
const ACCENT: Record<IsoFaceKind, string> = { 1: '#bae6fd', 2: '#38bdf8', 3: '#0369a1' };

/** Côté (en unités cube) du viewBox nécessaire pour contenir toutes ces formes. */
export function commonWorldSize(shapes: Shape[]): number {
  let side = 0;
  for (const s of shapes) {
    const { minX, maxX, minY, maxY } = isoBounds(isoFaces(s));
    side = Math.max(side, maxX - minX, maxY - minY);
  }
  return side + 0.7;
}

export function PolycubeSvg({
  shape,
  world,
  px = 150,
  accent = false,
}: {
  shape: Shape;
  /** Côté du viewBox en unités cube — identique pour tous les empilements d'un item. */
  world: number;
  /** Côté du SVG en pixels. */
  px?: number;
  accent?: boolean;
}) {
  const faces = isoFaces(shape);
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
          fill={palette[f.kind]}
          stroke="var(--ink-900)"
          strokeWidth={0.035}
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}
