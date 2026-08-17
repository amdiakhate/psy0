/**
 * Modèle de cube réel : 6 faces portant chacune un symbole ET son orientation
 * (quarts de tour dans le repère local de la face). C'est ce qui permet de
 * générer des pièges d'orientation corrects et NON ambigus.
 *
 * Positions : 0=R(+X, droite), 1=L(−X), 2=U(+Y, dessus), 3=D(−Y), 4=F(+Z, avant), 5=B(−Z).
 * Repères locaux (u=droite, v=haut, vus de L'EXTÉRIEUR de la face) :
 *   F: u=+X v=+Y · B: u=−X v=+Y · R: u=−Z v=+Y · L: u=+Z v=+Y · U: u=+X v=−Z · D: u=+X v=+Z
 * Le patron en croix ( U / L F R B / D ) se plie EXACTEMENT sur ces repères :
 * un patron est donc directement un état de cube, sans conversion.
 */

export interface FaceState {
  /** Index du symbole (0-5 dans la table de symboles du composant). */
  sym: number;
  /** Rotation du symbole en quarts de tour anti-horaires dans le repère de la face. */
  rot: number;
}

/** Cube = état des 6 positions. */
export type Cube = FaceState[];

export const POS = { R: 0, L: 1, U: 2, D: 3, F: 4, B: 5 } as const;

/** Une rotation du cube : position d'arrivée et twist (quarts de tour ajoutés au symbole) par position de départ. */
export interface Rotation {
  dest: number[];
  twist: number[];
}

/** 90° autour de l'axe Y (vertical) : F→R→B→L→F, U et D tournent sur place. */
const RY: Rotation = { dest: [5, 4, 2, 3, 0, 1], twist: [0, 0, 1, 3, 0, 0] };
/** 90° autour de l'axe X (horizontal droite) : U→F→D→B→U, R et L tournent sur place. */
const RX: Rotation = { dest: [0, 1, 4, 5, 3, 2], twist: [1, 3, 0, 2, 0, 2] };

const IDENTITY: Rotation = { dest: [0, 1, 2, 3, 4, 5], twist: [0, 0, 0, 0, 0, 0] };

function composeRotations(first: Rotation, then: Rotation): Rotation {
  const dest = new Array<number>(6);
  const twist = new Array<number>(6);
  for (let src = 0; src < 6; src++) {
    dest[src] = then.dest[first.dest[src]];
    twist[src] = (first.twist[src] + then.twist[first.dest[src]]) % 4;
  }
  return { dest, twist };
}

function rotationKey(r: Rotation): string {
  return r.dest.join('') + '|' + r.twist.join('');
}

/** Les 24 rotations du cube, générées par clôture de RX et RY. */
export const ALL_ROTATIONS: Rotation[] = (() => {
  const seen = new Map<string, Rotation>();
  const queue: Rotation[] = [IDENTITY];
  seen.set(rotationKey(IDENTITY), IDENTITY);
  while (queue.length > 0) {
    const r = queue.pop()!;
    for (const g of [RX, RY]) {
      const next = composeRotations(r, g);
      const key = rotationKey(next);
      if (!seen.has(key)) {
        seen.set(key, next);
        queue.push(next);
      }
    }
  }
  return [...seen.values()];
})();

export function applyRotation(cube: Cube, r: Rotation): Cube {
  const out = new Array<FaceState>(6);
  for (let src = 0; src < 6; src++) {
    out[r.dest[src]] = { sym: cube[src].sym, rot: (cube[src].rot + r.twist[src]) % 4 };
  }
  return out;
}

export function serializeCube(cube: Cube): string {
  return cube.map((f) => `${f.sym}.${f.rot}`).join('|');
}

/** Toutes les orientations possibles d'un cube (l'orbite sous les 24 rotations). */
export function orbitOf(cube: Cube): Set<string> {
  return new Set(ALL_ROTATIONS.map((r) => serializeCube(applyRotation(cube, r))));
}

/** Deux cubes sont « le même » s'ils diffèrent d'une rotation. */
export function sameCube(a: Cube, b: Cube): boolean {
  return orbitOf(a).has(serializeCube(b));
}

/** Le triplet visible en vue isométrique : (F, U, R). */
export function visibleTriple(cube: Cube): string {
  const f = (p: number) => `${cube[p].sym}.${cube[p].rot}`;
  return `${f(POS.F)}/${f(POS.U)}/${f(POS.R)}`;
}

/** Tous les triplets (F, U, R) atteignables en tournant le cube. */
export function allVisibleTriples(cube: Cube): Set<string> {
  return new Set(ALL_ROTATIONS.map((r) => visibleTriple(applyRotation(cube, r))));
}
