import type { ExerciseId, SessionBlock, SessionMode, SessionPlan } from '../core/types';

/**
 * Logique PURE du composer de sessions guidées : aucune lecture de storage,
 * aucune dépendance au registre d'exercices — tout est injecté, tout est testable.
 * Le câblage vit dans `composer.ts`, sur le modèle de `daily-logic.ts` / `daily.ts`.
 *
 * Principe : 50 % du temps sur les 3 exercices les plus faibles (drills ciblés
 * sur leur sous-type d'erreur), 30 % sur le milieu de classement, 20 % de
 * maintien sur les forces. Le Psychomoteur est toujours inclus, au moins 10 min.
 */

/**
 * Au-delà de 8 minutes sur le même exercice, l'attention décroche et le volume
 * ne sert plus à rien. Un temps plus long est donc DÉCOUPÉ et réparti dans la
 * séance : on gagne en plus de la répétition espacée intra-session.
 * Seul le Psychomoteur échappe au plafond — sa durée EST son format.
 */
export const MAX_BLOCK_SEC = 480;

/** En dessous de 2 minutes, un bloc n'a pas le temps d'installer quoi que ce soit. */
export const MIN_BLOCK_SEC = 120;

export type GuidedDuration = 30 | 60 | 90 | 120;

/** À partir de 1 h 30, la séance propose une coupure en deux à mi-parcours. */
export const HALFWAY_FROM_MIN = 90;

export interface WeakTag {
  tag: string;
  errorRate: number;
}

export interface RankedExercise {
  exercise: ExerciseId;
  name: string;
  items: number;
  accuracy: number;
  /** Sous-type d'erreur le plus coûteux, ou null si les données manquent. */
  weakTag: WeakTag | null;
}

export interface GuidedInput {
  durationMin: GuidedDuration;
  /** Du plus faible au plus fort, **Psychomoteur exclu**. */
  ranked: RankedExercise[];
  /** Le Psychomoteur est-il présent dans le registre ? */
  hasPsycho: boolean;
}

export function guidedMode(durationMin: GuidedDuration): SessionMode {
  switch (durationMin) {
    case 30:
      return 'guided30';
    case 60:
      return 'guided60';
    case 90:
      return 'guided90';
    case 120:
      return 'guided120';
  }
}

/** Secondes de Psychomoteur d'une séance : ~14 % du temps, borné à [10 min, 12 min]. */
export function psychoSecondsFor(totalSec: number): number {
  return Math.min(720, Math.max(600, Math.round(totalSec * 0.14)));
}

/**
 * Découpe une durée en parts de `maxSec` au plus, aussi égales que possible.
 * La somme des parts vaut EXACTEMENT `totalSec` (le reste est réparti sur les
 * premières parts) : c'est ce qui garantit qu'une séance de 2 h dure 2 h.
 */
export function splitDuration(totalSec: number, maxSec = MAX_BLOCK_SEC): number[] {
  if (totalSec <= 0) return [];
  const count = Math.max(1, Math.ceil(totalSec / maxSec));
  const base = Math.floor(totalSec / count);
  const rest = totalSec - base * count;
  return Array.from({ length: count }, (_, i) => base + (i < rest ? 1 : 0));
}

/** Distribue `totalSec` sur `count` exercices, le reliquat allant aux premiers. */
export function shareBetween(totalSec: number, count: number): number[] {
  if (count <= 0) return [];
  const base = Math.floor(totalSec / count);
  const rest = totalSec - base * count;
  return Array.from({ length: count }, (_, i) => base + (i < rest ? 1 : 0));
}

/** Entrelace des listes de blocs : un tour par exercice, puis le tour suivant. */
export function roundRobin(lists: SessionBlock[][]): SessionBlock[] {
  const out: SessionBlock[] = [];
  const longest = lists.reduce((m, l) => Math.max(m, l.length), 0);
  for (let i = 0; i < longest; i++) {
    for (const list of lists) if (i < list.length) out.push(list[i]);
  }
  return out;
}

/**
 * Fusionne deux listes en respectant leurs proportions : sans cela, une séance
 * de 2 h commencerait par 54 minutes sur les trois mêmes exercices avant de
 * voir quoi que ce soit d'autre.
 */
export function blend(primary: SessionBlock[], secondary: SessionBlock[]): SessionBlock[] {
  const out: SessionBlock[] = [];
  let i = 0;
  let j = 0;
  while (i < primary.length || j < secondary.length) {
    const primaryAhead = primary.length === 0 ? 1 : i / primary.length;
    const secondaryAhead = secondary.length === 0 ? 1 : j / secondary.length;
    if (i < primary.length && (j >= secondary.length || primaryAhead <= secondaryAhead)) {
      out.push(primary[i]);
      i += 1;
    } else {
      out.push(secondary[j]);
      j += 1;
    }
  }
  return out;
}

/**
 * Réordonne pour qu'un exercice n'apparaisse jamais deux blocs de suite, en
 * préservant au maximum l'ordre d'origine (les faiblesses restent en premier).
 * Filet de sécurité après le round-robin, pour les jointures entre tiers.
 */
export function interleave(blocks: SessionBlock[]): SessionBlock[] {
  const queue = [...blocks];
  const out: SessionBlock[] = [];
  while (queue.length > 0) {
    const previous = out.length > 0 ? out[out.length - 1].exercise : null;
    let index = 0;
    if (previous !== null && queue[0].exercise === previous) {
      const alternative = queue.findIndex((b) => b.exercise !== previous);
      if (alternative !== -1) index = alternative;
    }
    out.push(queue.splice(index, 1)[0]);
  }
  return out;
}

/** Blocs d'un exercice pour une enveloppe de temps donnée, drill ciblé compris. */
function blocksForExercise(entry: RankedExercise, totalSec: number, drill: boolean): SessionBlock[] {
  const parts = splitDuration(totalSec);
  // Drill : la première moitié des blocs travaille le sous-type fautif, la
  // seconde remet l'exercice en conditions normales — sans transfert, un drill
  // n'apprend qu'à réussir le drill.
  const drilled = drill && entry.weakTag && totalSec >= 240 ? Math.ceil(parts.length / 2) : 0;
  return parts.map((durationSec, i) =>
    i < drilled && entry.weakTag
      ? {
          exercise: entry.exercise,
          level: 'adaptive' as const,
          durationSec,
          tagFilter: entry.weakTag.tag,
          label: `Drill ciblé : ${entry.weakTag.tag} (${Math.round(entry.weakTag.errorRate * 100)} % d'erreurs)`,
        }
      : { exercise: entry.exercise, level: 'adaptive' as const, durationSec },
  );
}

/**
 * Alloue `totalSec` à un tier du classement. `spread` = combien d'exercices du
 * tier couvrir : sur les séances longues on élargit plutôt que d'allonger.
 */
function allocateTier(
  entries: RankedExercise[],
  totalSec: number,
  spread: number,
  drill: boolean,
): SessionBlock[] {
  const count = Math.max(0, Math.min(spread, entries.length, Math.floor(totalSec / MIN_BLOCK_SEC)));
  if (count === 0) return [];
  const shares = shareBetween(totalSec, count);
  return roundRobin(entries.slice(0, count).map((e, i) => blocksForExercise(e, shares[i], drill)));
}

function durationOf(b: SessionBlock): number {
  return b.durationSec ?? 0;
}

/**
 * Index du bloc devant lequel proposer la coupure : le premier qui commence
 * après la moitié de la séance. `undefined` s'il n'y a rien à couper.
 */
export function computeHalfwayIndex(blocks: SessionBlock[]): number | undefined {
  const total = blocks.reduce((s, b) => s + durationOf(b), 0);
  if (total === 0) return undefined;
  let accumulated = 0;
  for (let i = 0; i < blocks.length; i++) {
    accumulated += durationOf(blocks[i]);
    if (accumulated >= total / 2) return i + 1 < blocks.length ? i + 1 : undefined;
  }
  return undefined;
}

export function composeGuidedFrom({ durationMin, ranked, hasPsycho }: GuidedInput): SessionPlan {
  const totalSec = durationMin * 60;
  const psychoSec = hasPsycho ? psychoSecondsFor(totalSec) : 0;
  const remaining = totalSec - psychoSec;

  const weak = ranked.slice(0, 3);
  const midCount = Math.max(1, Math.floor((ranked.length - 3) / 2));
  const mid = ranked.slice(3, 3 + midCount);
  const strong = ranked.slice(3 + mid.length);

  // 50 / 30 / 20. Un tier inexploitable (trop peu de temps ou pas d'exercice)
  // reverse son temps sur les faiblesses : la séance dure toujours ce qu'elle annonce.
  let weakSec = Math.round(remaining * 0.5);
  let midSec = Math.round(remaining * 0.3);
  let strongSec = remaining - weakSec - midSec;
  if (mid.length === 0 || midSec < MIN_BLOCK_SEC) {
    weakSec += midSec;
    midSec = 0;
  }
  if (strong.length === 0 || strongSec < MIN_BLOCK_SEC) {
    weakSec += strongSec;
    strongSec = 0;
  }

  const weakBlocks = allocateTier(weak, weakSec, 3, true);
  const midBlocks = allocateTier(mid, midSec, Math.max(2, Math.ceil(midSec / MAX_BLOCK_SEC)), false);
  const strongBlocks = allocateTier(
    [...strong].reverse(),
    strongSec,
    Math.max(1, Math.ceil(strongSec / MAX_BLOCK_SEC)),
    false,
  );

  // Les faiblesses portent la séance, mais réparties parmi le reste : revenir
  // sur un exercice après en avoir fait un autre, c'est de la répétition espacée.
  const woven = blend(weakBlocks, [...midBlocks, ...strongBlocks]);

  // Le Psychomoteur au milieu : il coupe la séance en deux et sert de respiration
  // entre deux exercices de raisonnement.
  if (hasPsycho) {
    woven.splice(Math.floor(woven.length / 2), 0, {
      exercise: 'psychomotor',
      level: 'adaptive',
      durationSec: psychoSec,
    });
  }

  const blocks = interleave(woven);

  const halfwayIndex = durationMin >= HALFWAY_FROM_MIN ? computeHalfwayIndex(blocks) : undefined;

  return {
    mode: guidedMode(durationMin),
    blocks,
    briefing: buildBriefing({ weak, psychoSec, hasPsycho, blocks, halfwayIndex }),
    meta: halfwayIndex !== undefined ? { halfwayIndex } : undefined,
  };
}

function buildBriefing({
  weak,
  psychoSec,
  hasPsycho,
  blocks,
  halfwayIndex,
}: {
  weak: RankedExercise[];
  psychoSec: number;
  hasPsycho: boolean;
  blocks: SessionBlock[];
  halfwayIndex: number | undefined;
}): string[] {
  const drilled = weak.filter((w) => w.weakTag);
  const programme = weak
    .map((w) => (w.weakTag ? `${w.name} (drill ${w.weakTag.tag})` : w.name))
    .join(', ');
  const target = weak[0];
  const lines = [
    `Au programme : ${programme || 'premiers relevés'}${
      hasPsycho ? ` + Psychomoteur (${Math.round(psychoSec / 60)} min)` : ''
    } · ${blocks.length} blocs de ${Math.round(MAX_BLOCK_SEC / 60)} min maximum.`,
    target && target.items > 0
      ? `Pourquoi : ${weak.map((w) => w.name).join(', ')} sont tes points faibles actuels${
          drilled.length > 0 ? `, sur les sous-types « ${drilled.map((w) => w.weakTag!.tag).join(' », « ')} »` : ''
        }.`
      : 'Pourquoi : on constitue ta base de données — la composition se resserrera dès les premiers relevés.',
    target
      ? target.items === 0
        ? `Objectif : établir une première mesure fiable sur ${target.name}.`
        : `Objectif : faire passer ${target.name} de ${Math.round(target.accuracy * 100)} % à ${Math.min(
            100,
            Math.round(target.accuracy * 100) + 5,
          )} % de précision.`
      : '',
    halfwayIndex !== undefined
      ? `Coupure possible après le bloc ${halfwayIndex} : tu pourras reprendre la seconde moitié plus tard depuis l'accueil.`
      : '',
  ];
  return lines.filter(Boolean);
}
