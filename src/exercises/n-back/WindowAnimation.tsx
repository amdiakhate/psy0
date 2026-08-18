import { useMemo } from 'react';
import { linear } from '../../anim/timeline';
import { useTimeline } from '../../hooks/useTimeline';

/**
 * La fenêtre glissante, en mouvement.
 *
 * Le M2 Back ne demande pas de mémoriser une suite : il demande de tenir DEUX
 * chiffres et de les faire défiler. Écrit, ça reste abstrait ; en mouvement, on
 * voit le chiffre le plus ancien tomber au moment où le nouveau entre — et
 * c'est exactement le geste mental à automatiser.
 *
 * Le pas de temps respecte le dispositif officiel : 1 s d'affichage puis 3 s de
 * décision. La lenteur n'est pas un défaut de l'animation, c'est le rythme réel
 * de l'épreuve.
 */

export interface SlotDef {
  digit: number;
  verdict: 'oui' | 'non' | null;
  why: string;
}

/** 5 3 5 8 3 8 : un match, un neutre, puis les deux leurres N±1. */
export const DEMO: SlotDef[] = [
  { digit: 5, verdict: null, why: 'amorce — rien à comparer' },
  { digit: 3, verdict: null, why: 'amorce — rien à comparer' },
  { digit: 5, verdict: 'oui', why: 'identique à 2 coups avant' },
  { digit: 8, verdict: 'non', why: 'à 2 coups il y a 3, pas 8' },
  { digit: 3, verdict: 'non', why: 'ce 3 est à 3 coups — le leurre' },
  { digit: 8, verdict: 'non', why: 'ce 8 est à 1 coup — l’autre leurre' },
];

const STEP_MS = 1800;
const CELL = 74;
const GAP = 14;

export function WindowAnimation({ slots = DEMO }: { slots?: SlotDef[] }) {
  const segments = useMemo(
    () => slots.map(() => ({ to: 0, ms: STEP_MS, ease: linear })).map((s, i) => ({ ...s, to: i + 1 })),
    [slots],
  );
  const { value, playing, toggle, scrub } = useTimeline(segments);

  // `value` avance de 0 à slots.length : partie entière = index courant,
  // partie fractionnaire = glissement du cadre vers la case suivante.
  const index = Math.min(Math.floor(value), slots.length - 1);
  const current = slots[index];
  const frameX = value * (CELL + GAP);
  const width = slots.length * CELL + (slots.length - 1) * GAP;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width, height: CELL + 30 }}>
        {/* La fenêtre : elle couvre les DEUX chiffres à retenir, et glisse. */}
        <div
          className="absolute rounded-xl border-2 border-sky-400 bg-sky-400/10"
          style={{
            left: frameX - 2 * (CELL + GAP) - 4,
            top: -4,
            width: 2 * CELL + GAP + 8,
            height: CELL + 8,
            transition: 'none',
          }}
        />
        {slots.map((s, i) => {
          const isCurrent = i === index;
          const inWindow = i === index - 1 || i === index - 2;
          return (
            <div
              key={i}
              className={`absolute flex items-center justify-center rounded-lg border-2 font-mono text-3xl font-bold ${
                isCurrent
                  ? 'border-amber-400 bg-amber-400/15 text-amber-200'
                  : inWindow
                    ? 'border-sky-500 text-sky-200'
                    : i < index
                      ? 'border-zinc-800 text-zinc-700'
                      : 'border-zinc-700 text-zinc-500'
              }`}
              style={{ left: i * (CELL + GAP), top: 0, width: CELL, height: CELL }}
            >
              {i > index ? '·' : s.digit}
            </div>
          );
        })}
      </div>

      <div className="flex min-h-[52px] flex-col items-center gap-1">
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm text-zinc-500">en tête :</span>
          <span className="rounded-lg border border-sky-800 bg-sky-950/30 px-3 py-1 font-mono text-lg text-sky-200">
            {index >= 2 ? `${slots[index - 2].digit} – ${slots[index - 1].digit}` : index === 1 ? `– ${slots[0].digit}` : '– –'}
          </span>
          {current.verdict && (
            <span
              className={`rounded-lg border px-3 py-1 font-semibold ${
                current.verdict === 'oui'
                  ? 'border-green-500 bg-green-950/40 text-green-300'
                  : 'border-red-500 bg-red-950/40 text-red-300'
              }`}
            >
              {current.verdict === 'oui' ? 'Oui' : 'Non'}
            </span>
          )}
        </div>
        <p className="text-center text-xs text-zinc-400">{current.why}</p>
      </div>

      <div className="flex w-full max-w-sm items-center gap-3">
        <button
          onClick={toggle}
          className="rounded-lg border border-zinc-600 px-3 py-1 font-mono text-sm text-zinc-300 hover:border-sky-500"
          aria-label={playing ? 'Pause' : 'Lecture'}
        >
          {playing ? '⏸' : '▶'}
        </button>
        <input
          type="range"
          min={0}
          max={slots.length}
          step={0.01}
          value={value}
          onChange={(e) => scrub(Number(e.target.value))}
          className="flex-1 accent-sky-500"
          aria-label="Avancement de la série"
        />
        <span className="w-16 text-right font-mono text-xs text-zinc-500">
          {index + 1} / {slots.length}
        </span>
      </div>
    </div>
  );
}
