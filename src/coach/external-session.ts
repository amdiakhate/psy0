import type { BlockRole, ExerciseId } from '../core/types';
import { loadJson, saveJson } from '../core/storage';
import type { Feeling } from '../core/logs';

/**
 * Séance du matin faite AILLEURS — sur Pilotest, sur papier, peu importe.
 *
 * Sans ce mécanisme, l'app ignore purement et simplement une séance réelle :
 * elle repropose le programme entier, la rotation ne bouge pas, le cap
 * psychomoteur ne se décompte pas, et le log du jour est vide alors que le
 * travail a été fait. Le coach devient faux, et un coach faux se contourne.
 *
 * Une séance externe peut être TOTALE ou PARTIELLE, et la différence a des
 * conséquences : seule la première clôt la journée. Une partielle laisse
 * l'app proposer exactement ce qui manque, avec son minutage normal.
 */

export const STORAGE_KEY = 'external-sessions';

/** Les rôles du protocole du matin. C'est la grille de couverture. */
export type ProtocolRole = Extract<BlockRole, 'warmup' | 'priority' | 'rotation' | 'psychomotor'>;

export const PROTOCOL_ROLES: ProtocolRole[] = ['warmup', 'priority', 'rotation', 'psychomotor'];

export const ROLE_LABEL: Record<ProtocolRole, string> = {
  warmup: 'Échauffement',
  priority: 'Passe priorité',
  rotation: 'Rotation',
  psychomotor: 'Psychomoteur',
};

export interface ExternalBlockEntry {
  role: ProtocolRole;
  exercise: ExerciseId;
  /** Classe Pilotest relevée (1-9). Facultative : tout ne se mesure pas. */
  pilotestClass?: number;
  /** Pourcentage de réussite relevé. Facultatif. */
  successPct?: number;
}

export interface ExternalSession {
  /** dayKey Paris. Une seule séance externe par jour. */
  dayKey: string;
  savedAt: number;
  blocks: ExternalBlockEntry[];
  /** Minutes de psychomoteur consommées ailleurs — elles pèsent sur le cap. */
  psychoMin: number;
  feeling?: Feeling;
  /**
   * La rotation a-t-elle avancé au moment de la saisie ? Mémorisé pour ne pas
   * la faire avancer une seconde fois si la séance est complétée ensuite.
   */
  advanced: boolean;
}

export interface Coverage {
  covered: ProtocolRole[];
  missing: ProtocolRole[];
  complete: boolean;
}

export function coverageOf(
  blocks: ExternalBlockEntry[],
  roles: ProtocolRole[] = PROTOCOL_ROLES,
): Coverage {
  const done = new Set(blocks.map((b) => b.role));
  const covered = roles.filter((r) => done.has(r));
  const missing = roles.filter((r) => !done.has(r));
  return { covered, missing, complete: missing.length === 0 };
}

/**
 * La rotation P1→P2→P3 avance-t-elle ?
 *
 * Sa seule raison d'être est de faire tourner les priorités : elle doit donc
 * avancer dès que la PASSE PRIORITÉ du jour a été travaillée, complète ou pas —
 * et rester immobile sinon. Une séance où l'on a fait l'échauffement et la
 * rotation sans toucher à la priorité n'a pas fait avancer la cible : la
 * reprendre demain sur la MÊME priorité est le comportement voulu, pas un bug.
 *
 * L'exercice doit correspondre : consigner « passe priorité : Billes » un jour
 * où la priorité est « Un mot sur deux » ne fait pas avancer quoi que ce soit.
 */
export function advancesRotation(
  blocks: ExternalBlockEntry[],
  priorities: ExerciseId[],
): boolean {
  return blocks.some((b) => b.role === 'priority' && priorities.includes(b.exercise));
}

export function loadExternalSessions(): ExternalSession[] {
  return loadJson<ExternalSession[]>(STORAGE_KEY, []);
}

export function saveExternalSessions(sessions: ExternalSession[]): void {
  saveJson(STORAGE_KEY, sessions);
}

export function externalOf(dayKey: string, all = loadExternalSessions()): ExternalSession | null {
  return all.find((s) => s.dayKey === dayKey) ?? null;
}

/** Enregistre (ou remplace) la séance externe d'un jour. */
export function putExternal(session: ExternalSession, all = loadExternalSessions()): ExternalSession[] {
  const next = [...all.filter((s) => s.dayKey !== session.dayKey), session];
  saveExternalSessions(next);
  return next;
}

/** Minutes de psychomoteur faites ailleurs un jour donné. */
export function externalPsychoSec(dayKey: string, all = loadExternalSessions()): number {
  return Math.max(0, Math.round((externalOf(dayKey, all)?.psychoMin ?? 0) * 60));
}

/**
 * Une saisie est recevable dès qu'un bloc est renseigné avec son exercice.
 * Les mesures, elles, restent facultatives : forcer une classe qu'on n'a pas
 * relevée produirait un chiffre inventé, et un chiffre inventé pilote ensuite
 * les priorités.
 */
export function isValidExternal(blocks: ExternalBlockEntry[], psychoMin: number): boolean {
  if (psychoMin < 0 || psychoMin > 120) return false;
  if (blocks.length === 0) return false;
  return blocks.every(
    (b) =>
      PROTOCOL_ROLES.includes(b.role) &&
      (b.pilotestClass === undefined ||
        (Number.isInteger(b.pilotestClass) && b.pilotestClass >= 1 && b.pilotestClass <= 9)) &&
      (b.successPct === undefined ||
        (Number.isFinite(b.successPct) && b.successPct >= 0 && b.successPct <= 100)),
  );
}
