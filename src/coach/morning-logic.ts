import type { ExerciseId, SessionBlock } from '../core/types';
import { MAX_BLOCK_SEC, blend, interleave, roundRobin, shareBetween, splitDuration } from './composer-logic';
import type { WeakTag } from './composer-logic';

/**
 * Logique PURE de la session du matin (phase montée en charge, 18/08 → 29/08).
 * Aucune lecture de storage, aucune dépendance au registre : tout est injecté.
 *
 * Structure sur 60 min :
 *   5 min échauffement · 24 min priorité · 21 min rotation · 5 min Psychomoteur · 5 min log
 * La priorité n'est plus un bloc de 25 min d'un tenant mais **3 passes de 8 min**
 * entrelacées avec la rotation : le plafond de 8 min par bloc n'a plus aucune
 * exception, et repasser sur l'exercice après en avoir fait un autre vaut mieux
 * qu'y rester une demi-heure.
 */

export const WARMUP_SEC = 300;
export const MORNING_PSYCHO_SEC = 300;
/** Minutes réservées au log de fin de séance, non modélisées en blocs. */
export const LOG_RESERVE_SEC = 300;

/**
 * Part du temps « utile » (hors échauffement, Psychomoteur et log) allant à la
 * priorité du jour : 24 min sur 45, soit 8/15. Le reste va à la rotation.
 */
export const PRIORITY_SHARE_NUM = 8;
export const PRIORITY_SHARE_DEN = 15;

/** 2 h de drill contredit le protocole de la phase 2 : le matin s'arrête à 1 h 30. */
export type MorningDuration = 60 | 90;
export const MORNING_DURATIONS: MorningDuration[] = [60, 90];

export interface MorningPriority {
  exercise: ExerciseId;
  /** Sous-type d'erreur à driller sur la première passe, si connu. */
  weakTag: WeakTag | null;
}

export interface MorningInput {
  durationMin: MorningDuration;
  /** Exercice d'échauffement (Grilles de calculs). */
  warmup: ExerciseId;
  /** Une priorité sur 60 min, deux sur 90 min (la suivante de la rotation). */
  priorities: MorningPriority[];
  /** Membres jouables de la rotation, Psychomoteur exclu. */
  rotationMembers: ExerciseId[];
  hasPsycho: boolean;
}

/** Répartit `totalSec` selon des poids entiers, le reliquat allant aux premiers. */
export function shareByWeights(totalSec: number, weights: number[]): number[] {
  const sum = weights.reduce((a, b) => a + b, 0);
  if (sum <= 0) return weights.map(() => 0);
  const raw = weights.map((w) => Math.floor((totalSec * w) / sum));
  let rest = totalSec - raw.reduce((a, b) => a + b, 0);
  return raw.map((v) => {
    if (rest <= 0) return v;
    rest -= 1;
    return v + 1;
  });
}

/** Poids entre priorités : la priorité du jour garde la part majoritaire. */
function priorityWeights(count: number): number[] {
  if (count <= 1) return [1];
  return count === 2 ? [3, 2] : Array.from({ length: count }, () => 1);
}

export function composeMorningBlocks({
  durationMin,
  warmup,
  priorities,
  rotationMembers,
  hasPsycho,
}: MorningInput): SessionBlock[] {
  const psychoSec = hasPsycho ? MORNING_PSYCHO_SEC : 0;
  const coreSec = durationMin * 60 - LOG_RESERVE_SEC - WARMUP_SEC - psychoSec;

  const prioritySec =
    priorities.length === 0
      ? 0
      : Math.round((coreSec * PRIORITY_SHARE_NUM) / PRIORITY_SHARE_DEN);
  const rotationSec = coreSec - prioritySec;

  // Priorités : chaque part découpée en passes de 8 min au plus. La première
  // passe drille le sous-type fautif, les suivantes remettent en conditions normales.
  const priorityShares = shareByWeights(prioritySec, priorityWeights(priorities.length));
  const priorityBlocks: SessionBlock[] = priorities.flatMap((p, i) =>
    splitDuration(priorityShares[i]).map((durationSec, k) => ({
      exercise: p.exercise,
      level: 'adaptive' as const,
      durationSec,
      role: 'priority' as const,
      tagFilter: k === 0 ? p.weakTag?.tag : undefined,
      label:
        k === 0 && p.weakTag
          ? `${i === 0 ? 'Priorité du jour' : 'Priorité suivante'} — drill ${p.weakTag.tag}`
          : i === 0
            ? 'Priorité du jour'
            : 'Priorité suivante',
    })),
  );

  // Rotation : le temps est partagé entre les membres, puis découpé si un membre
  // dépasse le plafond (un groupe de 2 membres sur 21 min, par exemple).
  const memberShares = shareBetween(rotationSec, rotationMembers.length);
  const rotationBlocks = roundRobin(
    rotationMembers.map((exercise, i) =>
      splitDuration(memberShares[i]).map((durationSec) => ({
        exercise,
        level: 'adaptive' as const,
        durationSec,
        role: 'rotation' as const,
        label: 'Rotation',
      })),
    ),
  );

  const blocks: SessionBlock[] = [
    { exercise: warmup, level: 'adaptive', durationSec: WARMUP_SEC, role: 'warmup', label: 'Échauffement' },
    ...blend(priorityBlocks, rotationBlocks),
  ];
  if (hasPsycho) {
    blocks.push({ exercise: 'psychomotor', level: 'adaptive', durationSec: psychoSec, role: 'psychomotor' });
  }

  // Filet de sécurité : l'échauffement peut se trouver être la priorité du jour.
  return interleave(blocks);
}

/** Secondes de priorité effectivement programmées — sert au briefing et aux tests. */
export function prioritySecondsOf(blocks: SessionBlock[]): number {
  return blocks.filter((b) => b.role === 'priority').reduce((s, b) => s + (b.durationSec ?? 0), 0);
}

/** Vrai si aucun bloc ne dépasse le plafond (le Psychomoteur a sa propre durée). */
export function respectsBlockCap(blocks: SessionBlock[]): boolean {
  return blocks.every((b) => b.role === 'psychomotor' || (b.durationSec ?? 0) <= MAX_BLOCK_SEC);
}
