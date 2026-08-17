import type { Color, Fill, Shape } from './generator';
import { COLOR_HEX, COLOR_LABELS, SHAPE_LABELS } from './generator';

/** Étoile à 5 branches centrée (80,80), rayon externe 72 / interne 30. */
const STAR_POINTS =
  '80,10 97.8,57.4 148.3,59.5 108.6,90.8 122.1,139.5 80,111.6 37.9,139.5 51.4,90.8 11.7,59.5 62.2,57.4';

/**
 * Le stimulus du test : une forme, une couleur, et un remplissage — VIDE
 * (contour seul) ou REMPLI. Le remplissage est le premier critère de l'arbre :
 * il doit rester lisible même en 0,5 s, d'où le contour épais.
 */
export function ShapeGlyph({
  shape,
  color,
  fill,
  size = 160,
}: {
  shape: Shape;
  color: Color;
  fill: Fill;
  size?: number;
}) {
  const hex = COLOR_HEX[color];
  const paint =
    fill === 'rempli'
      ? { fill: hex }
      : { fill: 'none', stroke: hex, strokeWidth: 12, strokeLinejoin: 'round' as const };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      role="img"
      aria-label={`${SHAPE_LABELS[shape]} ${COLOR_LABELS[color]} ${fill}`}
    >
      {shape === 'rond' && <circle cx={80} cy={80} r={66} {...paint} />}
      {shape === 'carre' && <rect x={16} y={16} width={128} height={128} rx={8} {...paint} />}
      {shape === 'triangle' && <polygon points="80,14 146,138 14,138" {...paint} />}
      {shape === 'etoile' && <polygon points={STAR_POINTS} {...paint} />}
    </svg>
  );
}
