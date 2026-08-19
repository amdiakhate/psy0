import { VIEWPOINT_COUNT, VIEW_RADIUS } from './config';
import { OBJECT_LABELS, viewpointPosition } from './scene';
import type { ObjectKind, SceneObject } from './scene';

/**
 * La vue aérienne, calquée sur Pilotest : un disque de sable où les objets sont
 * vus DU DESSUS avec leur ombre portée, et huit anneaux disposés autour, chacun
 * projetant vers le centre un cône de visée.
 *
 * L'ancienne version était un schéma — fond sombre, pastilles de couleur,
 * étiquettes « tour », « cactus ». Elle rendait l'exercice plus facile que le
 * test sur son point le plus coûteux : chez Pilotest, RECONNAÎTRE un objet vu
 * du dessus fait partie du travail, et sa couleur ne le trahit pas — tous sont
 * du même violet. S'entraîner avec des étiquettes, c'est s'entraîner à une
 * tâche qu'on ne passera pas.
 *
 * Convention : x monde → x écran, z monde → y écran (on regarde le sol depuis +Y).
 */

const SIZE = 340;
const CENTER = SIZE / 2;
/** Le disque n'occupe pas tout le cadre : les anneaux vivent DEHORS, comme sur Pilotest. */
const DISC = SIZE / 2 - 34;
const SCALE = DISC / VIEW_RADIUS;

const sx = (x: number) => CENTER + x * SCALE;
const sy = (z: number) => CENTER + z * SCALE;

/**
 * Les anneaux vivent HORS du disque, comme sur Pilotest. Posés pile sur le bord,
 * ils écrasaient leur propre cône de visée : il ne restait aucune place entre
 * l'anneau et le sable pour le voir.
 */
const RING_OFFSET = 24;
function ringXY(k: number): { x: number; y: number; ux: number; uy: number } {
  const p = viewpointPosition(k);
  const len = Math.hypot(p.x, p.z) || 1;
  const ux = p.x / len;
  const uy = p.z / len;
  return { x: CENTER + ux * (DISC + RING_OFFSET), y: CENTER + uy * (DISC + RING_OFFSET), ux, uy };
}

/** Le violet unique de Pilotest : la couleur ne distingue jamais deux objets. */
const OBJECT_FILL = '#a021a0';
const OBJECT_EDGE = '#6b1470';
const SHADOW = '#8a7a55';

/**
 * Silhouette vue du dessus, en unités monde. Un objet ne se reconnaît que par
 * sa forme et son ombre — exactement ce que le test demande de lire.
 */
function silhouette(kind: ObjectKind, cx: number, cy: number, s: number): string {
  switch (kind) {
    case 'cube':
      return `M${cx - s} ${cy - s} H${cx + s} V${cy + s} H${cx - s} Z`;
    case 'pyramide':
      // Vue du dessus : un losange (les quatre arêtes montant vers la pointe).
      return `M${cx} ${cy - s} L${cx + s} ${cy} L${cx} ${cy + s} L${cx - s} ${cy} Z`;
    case 'tour': {
      // Cylindre élancé : un disque net, plus petit que son emprise au sol.
      const r = s * 0.78;
      return `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0 Z`;
    }
    case 'rocher': {
      // Contour irrégulier : c'est ce qui le distingue d'un cube au premier coup d'œil.
      const pts = [
        [cx - s, cy - s * 0.5],
        [cx - s * 0.3, cy - s],
        [cx + s * 0.7, cy - s * 0.8],
        [cx + s, cy + s * 0.2],
        [cx + s * 0.4, cy + s],
        [cx - s * 0.6, cy + s * 0.85],
      ];
      return `M${pts.map((p) => p.join(' ')).join(' L')} Z`;
    }
    case 'cactus':
      // Croix trapue : le tronc et les deux bras, lisibles de haut.
      return (
        `M${cx - s * 0.28} ${cy - s} H${cx + s * 0.28} V${cy - s * 0.2} ` +
        `H${cx + s} V${cy + s * 0.28} H${cx + s * 0.28} V${cy + s} ` +
        `H${cx - s * 0.28} V${cy + s * 0.28} H${cx - s} V${cy - s * 0.2} ` +
        `H${cx - s * 0.28} Z`
      );
    case 'antenne': {
      // Mât fin : un très petit disque, l'objet le plus discret vu du dessus.
      const r = s * 0.32;
      return `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0 Z`;
    }
  }
}

/** Demi-emprise au sol de chaque objet, en pixels du plan. */
const FOOTPRINT: Record<ObjectKind, number> = {
  cube: 9,
  pyramide: 10,
  tour: 8,
  rocher: 11,
  cactus: 9,
  antenne: 6,
};

function ObjectGlyph({ o, showLabel }: { o: SceneObject; showLabel: boolean }) {
  const cx = sx(o.x);
  const cy = sy(o.z);
  const s = FOOTPRINT[o.kind];
  // L'ombre part vers le bas-droite, comme celle du soleil de la vue 3D.
  const shadow = silhouette(o.kind, cx + s * 0.75, cy + s * 0.6, s * 1.05);
  return (
    <g>
      <path d={shadow} fill={SHADOW} opacity={0.5} />
      <path d={silhouette(o.kind, cx, cy, s)} fill={OBJECT_FILL} stroke={OBJECT_EDGE} strokeWidth={1} />
      {showLabel && (
        <text
          x={cx}
          y={cy - s - 4}
          textAnchor="middle"
          fontSize={9}
          fill="#3b2f18"
          fontWeight={600}
          className="select-none"
        >
          {OBJECT_LABELS[o.kind]}
        </text>
      )}
    </g>
  );
}

export function SceneMap({
  objects,
  onPick,
  highlight = null,
  reveal = null,
  showLabels = false,
}: {
  objects: readonly SceneObject[];
  onPick?: (viewpoint: number) => void;
  /** Point de vue survolé / sélectionné. */
  highlight?: number | null;
  /** Point de vue à mettre en évidence (corrigé, démo). */
  reveal?: number | null;
  /** Étiquettes des objets. Réservé aux leçons : le test n'en donne aucune. */
  showLabels?: boolean;
}) {
  return (
    <svg
      width={SIZE}
      height={SIZE}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      role="img"
      aria-label="Vue aérienne du désert, avec les 8 emplacements de prise de vue"
    >
      <defs>
        <radialGradient id="sable" cx="45%" cy="40%">
          <stop offset="0%" stopColor="#f2e2c0" />
          <stop offset="70%" stopColor="#e8d5ac" />
          <stop offset="100%" stopColor="#dcc596" />
        </radialGradient>
        {/* Un dégradé PAR CÔNE, en coordonnées absolues : un dégradé unique,
            défini dans le repère de la forme, sortait gris parce qu'il ne
            s'orientait pas le long de l'axe de visée. */}
        {Array.from({ length: VIEWPOINT_COUNT }, (_, k) => {
          const { x, y, ux, uy } = ringXY(k);
          const active = highlight === k || reveal === k;
          const reach = active ? DISC * 0.55 : RING_OFFSET + DISC * 0.16;
          const color = active ? '#0ea5e9' : '#1d2a8a';
          return (
            <linearGradient
              key={k}
              id={`visee-${k}`}
              gradientUnits="userSpaceOnUse"
              x1={x}
              y1={y}
              x2={x - ux * reach}
              y2={y - uy * reach}
            >
              <stop offset="0%" stopColor={color} stopOpacity={0.95} />
              <stop offset="100%" stopColor={color} stopOpacity={0.05} />
            </linearGradient>
          );
        })}
      </defs>

      <circle cx={CENTER} cy={CENTER} r={DISC} fill="url(#sable)" />

      {/* Cônes de visée, PAR-DESSUS le sable : ils mordent légèrement sur le
          disque, comme sur Pilotest, et s'évanouissent avant les objets. */}
      {Array.from({ length: VIEWPOINT_COUNT }, (_, k) => {
        const { x, y, ux, uy } = ringXY(k);
        const active = highlight === k || reveal === k;
        const tipX = x - ux * 11;
        const tipY = y - uy * 11;
        const reach = active ? DISC * 0.55 : RING_OFFSET + DISC * 0.16;
        const farX = tipX - ux * reach;
        const farY = tipY - uy * reach;
        const spread = reach * 0.34;
        return (
          <polygon
            key={k}
            points={`${tipX},${tipY} ${farX - uy * spread},${farY + ux * spread} ${farX + uy * spread},${farY - ux * spread}`}
            fill={`url(#visee-${k})`}
          />
        );
      })}

      {objects.map((o, i) => (
        <ObjectGlyph key={i} o={o} showLabel={showLabels} />
      ))}

      {Array.from({ length: VIEWPOINT_COUNT }, (_, k) => {
        const { x: cx, y: cy } = ringXY(k);
        return (
          <g
            key={k}
            onClick={onPick ? () => onPick(k) : undefined}
            className={onPick ? 'cursor-pointer' : undefined}
          >
            {/* Anneau ÉVIDÉ, comme sur Pilotest : le numéro n'y figure pas, c'est
                la position autour du cercle qui identifie le point de vue. */}
            <circle cx={cx} cy={cy} r={13} fill="transparent" />
            <circle
              cx={cx}
              cy={cy}
              r={11}
              fill={reveal === k ? '#22c55e' : highlight === k ? '#f59e0b' : 'none'}
              stroke={reveal === k ? '#15803d' : highlight === k ? '#b45309' : '#1d2a8a'}
              strokeWidth={4}
            />
          </g>
        );
      })}
    </svg>
  );
}
