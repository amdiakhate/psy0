import { generate, completeCube } from '../generator';
import type { CubesAnswer, CubesQuestion, Piece } from '../generator';
import {
  ALL_ROTATIONS,
  SYMBOL_QUARTER_SYMMETRY,
  applyRotation,
  orbitOf,
  serializeCube,
} from '../cube-model';
import type { Cube } from './types';
import { identityOrbitOf, serializeIdentityCube } from './cubeGeometry';

export interface CubeDifferentialExample {
  seed: number;
  level: number;
  holes: number[];
  answer: CubesAnswer;
  oldIdentity: boolean;
  newIdentity: boolean;
  oldVerdict: boolean;
  newVerdict: boolean;
}

export interface CubeDifferentialReport {
  casesCompared: number;
  identityDivergences: number;
  orientationDivergences: number;
  verdictDivergences: number;
  examples: CubeDifferentialExample[];
}

const symbolIdentity = (cube: Cube): string => cube.map((face) => face.sym).join('|');
const faceIdentity = (cube: Cube): string => cube.map((face) => face.id).join('|');

function permutations<T>(values: readonly T[]): T[][] {
  if (values.length <= 1) return [values.slice()];
  const out: T[][] = [];
  for (let index = 0; index < values.length; index++) {
    const head = values[index];
    const rest = [...values.slice(0, index), ...values.slice(index + 1)];
    for (const tail of permutations(rest)) out.push([head, ...tail]);
  }
  return out;
}

function visibleRotations(piece: Piece): readonly number[] {
  return SYMBOL_QUARTER_SYMMETRY[piece.sym] === 4 ? [0] : [0, 1, 2, 3];
}

function forEachCompleteAnswer(question: CubesQuestion, visit: (answer: CubesAnswer) => void): void {
  for (const assignment of permutations(question.pieces)) {
    const answer: CubesAnswer = {};
    const walkRotations = (holeIndex: number): void => {
      if (holeIndex === question.holes.length) {
        visit({ ...answer });
        return;
      }
      const hole = question.holes[holeIndex];
      const piece = assignment[holeIndex];
      for (const rot of visibleRotations(piece)) {
        answer[hole] = { pieceId: piece.id, rot };
        walkRotations(holeIndex + 1);
      }
    };
    walkRotations(0);
  }
}

export function buildDifferentialReport(seedsPerLevel: number): CubeDifferentialReport {
  const report: CubeDifferentialReport = {
    casesCompared: 0,
    identityDivergences: 0,
    orientationDivergences: 0,
    verdictDivergences: 0,
    examples: [],
  };

  for (let level = 1; level <= 5; level++) {
    for (let seed = 0; seed < seedsPerLevel; seed++) {
      const item = generate(seed, level);
      const reference = item.question.reference;
      const oldOrbit = orbitOf(reference);
      const newOrbit = identityOrbitOf(reference);
      const oldIdentityOrbit = new Set(ALL_ROTATIONS.map((rotation) => symbolIdentity(applyRotation(reference, rotation))));
      const newIdentityOrbit = new Set(ALL_ROTATIONS.map((rotation) => faceIdentity(applyRotation(reference, rotation))));

      forEachCompleteAnswer(item.question, (answer) => {
        const candidate = completeCube(item.question, answer);
        if (candidate === null) throw new Error('L’énumérateur a produit une réponse incomplète');
        const oldIdentity = oldIdentityOrbit.has(symbolIdentity(candidate));
        const newIdentity = newIdentityOrbit.has(faceIdentity(candidate));
        const oldVerdict = oldOrbit.has(serializeCube(candidate));
        const newVerdict = newOrbit.has(serializeIdentityCube(candidate));

        report.casesCompared += 1;
        if (oldIdentity !== newIdentity) report.identityDivergences += 1;
        if (oldIdentity && newIdentity && oldVerdict !== newVerdict) report.orientationDivergences += 1;
        if (oldVerdict !== newVerdict) report.verdictDivergences += 1;

        if (
          report.examples.length < 10 &&
          (oldIdentity !== newIdentity || oldVerdict !== newVerdict)
        ) {
          report.examples.push({
            seed,
            level,
            holes: [...item.question.holes],
            answer,
            oldIdentity,
            newIdentity,
            oldVerdict,
            newVerdict,
          });
        }
      });
    }
  }

  return report;
}
