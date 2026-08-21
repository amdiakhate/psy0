import type { BlockResult, BlockRole, ExerciseId, SessionBlock } from './types';
import type { ExternalEntry } from '../coach/external';

/**
 * Les lignes du log de fin de séance.
 *
 * Extrait de l'écran pour être testable : c'est ici que se décide ce qui est
 * remonté au candidat, et la règle « un bloc sans item ne compte pas » avait un
 * angle mort — un créneau fait sur Pilotest n'a AUCUN item joué ici, et
 * disparaissait donc du log alors qu'il est précisément la seule mesure fiable
 * de la séance.
 */
export interface LogRow {
  exercise: ExerciseId;
  /** Niveau adaptatif atteint, ou classe Pilotest relevée pour un créneau externe. */
  level: number;
  errPct: number;
  role?: BlockRole;
  passes: number;
  /** Relevé à la main sur Pilotest : chiffres déclarés, pas mesurés. */
  external?: boolean;
  pilotestClass?: number;
  /** Note pré-remplie lors de la saisie manuelle. */
  note?: string;
}

/**
 * Le rôle vient du PLAN (ce qui était prévu), les passes du RECORD (ce qui a
 * réellement été joué — une séance coupée en a moins). Les créneaux externes
 * arrivent à part : ils ne produisent pas de `BlockResult`.
 */
export function buildLogRows(args: {
  played: BlockResult[];
  planBlocks: SessionBlock[];
  externals: ExternalEntry[];
}): LogRow[] {
  const { played, planBlocks, externals } = args;

  const roleOf = new Map<ExerciseId, BlockRole>();
  for (const b of planBlocks) if (b.role) roleOf.set(b.exercise, b.role);

  const byExercise = new Map<
    ExerciseId,
    { items: number; correct: number; level: number; passes: number }
  >();
  for (const b of played) {
    if (b.items === 0) continue;
    const s = byExercise.get(b.exercise) ?? { items: 0, correct: 0, level: 1, passes: 0 };
    s.items += b.items;
    s.correct += b.correct;
    s.level = Math.max(s.level, b.endLevel);
    s.passes += 1;
    byExercise.set(b.exercise, s);
  }

  const rows: LogRow[] = [...byExercise.entries()].map(([exercise, s]) => ({
    exercise,
    level: s.level,
    errPct: Math.round(100 * (1 - s.correct / s.items)),
    role: roleOf.get(exercise),
    passes: s.passes,
  }));

  // Un créneau externe compte autant de passes qu'il occupait de blocs dans le
  // plan : c'est ce que le candidat a réellement fait à la source.
  for (const entry of externals) {
    const passes = planBlocks.filter((b) => b.exercise === entry.exercise && b.external).length;
    rows.push({
      exercise: entry.exercise,
      level: entry.pilotestClass,
      errPct: entry.errPct,
      role: roleOf.get(entry.exercise),
      passes: Math.max(1, passes),
      external: true,
      pilotestClass: entry.pilotestClass,
      note: entry.note,
    });
  }

  return rows;
}

/** Les exercices d'un plan à faire ailleurs, dédoublonnés, dans l'ordre du plan. */
export function externalExercisesOf(planBlocks: SessionBlock[]): ExerciseId[] {
  const seen = new Set<ExerciseId>();
  const out: ExerciseId[] = [];
  for (const b of planBlocks) {
    if (!b.external || seen.has(b.exercise)) continue;
    seen.add(b.exercise);
    out.push(b.exercise);
  }
  return out;
}
