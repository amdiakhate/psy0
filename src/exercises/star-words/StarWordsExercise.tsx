import { useEffect, useState } from 'react';
import type { ExerciseComponentProps } from '../../core/types';
import type { StarAnswer, StarQuestion } from './generator';
import { SLOT_COUNT, SLOT_LABELS } from './geometry';
import { StarSvg } from './StarSvg';
import { useKeys } from '../../hooks/useKeys';

const EMPTY: StarAnswer = Array.from({ length: SLOT_COUNT }, () => null);

export function StarWordsExercise({ item, onAnswer }: ExerciseComponentProps<StarQuestion, StarAnswer>) {
  const q = item.question;
  const [slots, setSlots] = useState<StarAnswer>(EMPTY);
  const [selected, setSelected] = useState<number | null>(null);

  // Nouvel item → étoile vide (le composant peut être réutilisé sans remontage).
  useEffect(() => {
    setSlots(EMPTY);
    setSelected(null);
  }, [item.seed, item.level]);

  const placement = slots.map((i) => (i === null ? null : q.words[i]));
  const slotOfWord = (word: number) => slots.findIndex((i) => i === word);
  const placedCount = slots.filter((i) => i !== null).length;

  /** Clic sur un mot : le sélectionner, le désélectionner, ou le retirer de l'étoile. */
  const toggleWord = (word: number) => {
    const slot = slotOfWord(word);
    if (slot >= 0) {
      setSlots((s) => s.map((v, k) => (k === slot ? null : v)));
      setSelected(word);
      return;
    }
    setSelected((cur) => (cur === word ? null : word));
  };

  /** Poubelle Pilotest : remet le mot dans la liste sans le présélectionner. */
  const removeWord = (word: number) => {
    setSlots((current) => current.map((value) => (value === word ? null : value)));
    setSelected((current) => (current === word ? null : current));
  };

  /** Clic sur un emplacement : y poser le mot sélectionné, ou vider l'emplacement. */
  const toggleSlot = (slot: number) => {
    if (slots[slot] !== null) {
      setSlots((s) => s.map((v, k) => (k === slot ? null : v)));
      return;
    }
    if (selected === null) return;
    setSlots((s) => s.map((v, k) => (k === slot ? selected : v === selected ? null : v)));
    setSelected(null);
  };

  useKeys((e) => {
    const n = Number(e.key);
    if (n >= 1 && n <= q.words.length) {
      toggleWord(n - 1);
      return;
    }
    const slot = SLOT_LABELS.indexOf(e.key.toUpperCase() as (typeof SLOT_LABELS)[number]);
    if (slot >= 0) {
      toggleSlot(slot);
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      onAnswer(slots);
    }
  });

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 py-2">
      <p className="text-center text-sm text-zinc-400">
        Place <span className="font-semibold text-zinc-200">6 mots sur les 9</span> dans l'étoile :
        chaque case bleue est <span className="font-semibold text-sky-400">commune à deux mots</span>{' '}
        et ne doit porter qu'<span className="italic">une seule</span> lettre.
      </p>

      <div className="grid w-full items-center gap-5 px-2 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-10 lg:px-10">
        {/* Pilotest présente les neuf mots en colonne à gauche de l'étoile. */}
        <div className="order-2 grid min-w-0 grid-cols-3 gap-2 lg:order-1 lg:grid-cols-1 lg:gap-4">
          {q.words.map((word, i) => {
            const slot = slotOfWord(i);
            const isSelected = selected === i;
            return (
              <div key={word} className="relative min-w-0">
                <button
                  onClick={() => toggleWord(i)}
                  className={`w-full overflow-hidden rounded-lg border px-1.5 py-2.5 text-center font-mono text-xs tracking-wide transition-colors md:text-sm lg:px-4 lg:py-3 lg:text-lg ${
                    isSelected
                      ? 'border-sky-400 bg-sky-900/50 text-sky-100'
                      : slot >= 0
                        ? 'border-indigo-500 bg-indigo-700 text-white'
                        : 'border-zinc-700 bg-zinc-900 text-zinc-100 hover:border-sky-500'
                  }`}
                >
                  <span className={`mr-1 text-[10px] ${slot >= 0 ? 'text-indigo-200' : 'text-zinc-500'}`}>
                    {i + 1}
                  </span>
                  {word}
                </button>
                {slot >= 0 && (
                  <button
                    type="button"
                    aria-label={`Retirer ${word} de l’étoile`}
                    onClick={() => removeWord(i)}
                    className="absolute -left-3 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full border border-indigo-300 bg-indigo-700 text-white shadow-md hover:bg-indigo-600"
                  >
                    <svg viewBox="0 0 20 20" className="size-3.5" aria-hidden="true">
                      <path
                        d="M5.5 6.5h9l-.7 9.2a1.5 1.5 0 0 1-1.5 1.3H7.7a1.5 1.5 0 0 1-1.5-1.3L5.5 6.5Zm2-3h5l.7 1.5H15v1H5V5h1.8l.7-1.5Z"
                        fill="currentColor"
                      />
                    </svg>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="order-1 flex min-w-0 flex-col items-center lg:order-2">
          <StarSvg
            placement={placement}
            onSlotClick={toggleSlot}
            activeSlot={null}
            size={680}
            framed={false}
            showSlotLabels={false}
          />

          <p className="mt-1 text-center text-xs text-zinc-500">
            Touches <kbd className="text-zinc-300">1-9</kbd> pour choisir un mot, puis clique sur un
            côté de l'étoile pour le placer. Re-cliquer sur un mot ou un emplacement le retire.
          </p>

          <div className="mt-3 flex items-center justify-center gap-3">
            <button
              onClick={() => onAnswer(slots)}
              className={`rounded-lg px-5 py-2 font-semibold ${
                placedCount === SLOT_COUNT
                  ? 'bg-sky-600 hover:bg-sky-500'
                  : 'border border-zinc-700 text-zinc-400 hover:border-zinc-500'
              }`}
            >
              {placedCount === SLOT_COUNT ? 'Valider (Entrée)' : 'Passer — incomplet (Entrée)'}
            </button>
            <span className="text-sm text-zinc-500">{placedCount}/6 placés</span>
          </div>
        </div>
      </div>
    </div>
  );
}
