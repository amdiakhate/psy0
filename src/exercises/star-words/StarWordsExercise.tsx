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
    <div className="flex h-full flex-col items-center justify-center gap-5">
      <p className="text-center text-sm text-zinc-400">
        Place <span className="font-semibold text-zinc-200">6 mots sur les 9</span> dans l'étoile :
        chaque case bleue est <span className="font-semibold text-sky-400">commune à deux mots</span>{' '}
        et ne doit porter qu'<span className="italic">une seule</span> lettre.
      </p>

      <div className="flex flex-col items-center gap-5 lg:flex-row lg:items-start lg:gap-8">
        <StarSvg placement={placement} onSlotClick={toggleSlot} activeSlot={null} size={320} />

        {/* min-w-0 : la colonne des mots doit pouvoir se comprimer (page d'astuces). */}
        <div className="w-full min-w-0 max-w-md">
          <div className="grid grid-cols-3 gap-1.5">
            {q.words.map((word, i) => {
              const slot = slotOfWord(i);
              const isSelected = selected === i;
              return (
                <button
                  key={word}
                  onClick={() => toggleWord(i)}
                  className={`overflow-hidden rounded-lg border px-1.5 py-2 text-center font-mono text-xs tracking-wide transition-colors md:text-sm ${
                    isSelected
                      ? 'border-sky-400 bg-sky-900/50 text-sky-100'
                      : slot >= 0
                        ? 'border-zinc-800 bg-zinc-950 text-zinc-600 line-through'
                        : 'border-zinc-700 bg-zinc-900 text-zinc-100 hover:border-sky-500'
                  }`}
                >
                  <span className="mr-1 text-[10px] text-zinc-500">{i + 1}</span>
                  {word}
                  {slot >= 0 && <span className="ml-1 text-[10px] text-sky-500">{SLOT_LABELS[slot]}</span>}
                </button>
              );
            })}
          </div>

          <p className="mt-3 text-xs text-zinc-500">
            Touches <kbd className="text-zinc-300">1-9</kbd> pour choisir un mot, puis{' '}
            <kbd className="text-zinc-300">A-F</kbd> pour l'emplacement. Re-cliquer sur un mot ou un
            emplacement le retire.
          </p>

          <div className="mt-3 flex items-center gap-3">
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
