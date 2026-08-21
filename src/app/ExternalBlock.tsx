import { useState } from 'react';
import type { ExerciseId } from '../core/types';
import { getExercise } from '../exercises';
import { MAX_CLASS, MIN_CLASS, isValidEntry, pilotestUrlFor } from '../coach/external';
import type { ExternalEntry } from '../coach/external';

/**
 * Un créneau que le coach a réservé mais qui ne se joue PAS ici.
 *
 * L'écran doit faire trois choses, dans cet ordre : dire pourquoi (sinon ça
 * ressemble à une panne), donner le lien, et récupérer le résultat. La saisie
 * est obligatoire pour valider — un créneau réservé qui ne remonte rien coûte
 * du temps de séance sans rien produire, ce qui est pire que de l'avoir joué en
 * local.
 */
export function ExternalBlock({
  exercise,
  minutes,
  onDone,
  onSkip,
}: {
  exercise: ExerciseId;
  minutes: number;
  onDone: (entry: ExternalEntry) => void;
  onSkip: () => void;
}) {
  const module_ = getExercise(exercise);
  const url = pilotestUrlFor(module_.pilotestUrl);
  const [pilotestClass, setPilotestClass] = useState('');
  const [errPct, setErrPct] = useState('');
  const [note, setNote] = useState('');

  const draft: Partial<ExternalEntry> = {
    exercise,
    pilotestClass: pilotestClass === '' ? undefined : Number(pilotestClass),
    errPct: errPct === '' ? undefined : Number(errPct),
  };
  const valid = isValidEntry(draft);

  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="w-full max-w-2xl rounded-xl border border-amber-800/60 bg-zinc-900/60 p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">
          Créneau à faire sur Pilotest
        </p>
        <h2 className="mt-2 text-2xl font-bold">{module_.name}</h2>
        <p className="mt-1 text-sm text-zinc-500">{minutes} min réservées dans la séance</p>

        <p className="mt-4 text-zinc-300">
          Tu as marqué cet exercice comme non calibré sur l’original. Le générateur d’ici reproduit
          le geste, pas le barème : un score obtenu en local n’a pas de sens, et il fausserait le
          classement qui décide de tes priorités. Fais donc la mesure à la source, puis reviens la
          saisir.
        </p>

        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-block rounded-lg bg-sky-600 px-5 py-2 font-semibold text-white hover:bg-sky-500"
        >
          Ouvrir sur Pilotest ↗
        </a>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="text-sm text-zinc-400">
            Classe obtenue ({MIN_CLASS}-{MAX_CLASS})
            <select
              value={pilotestClass}
              onChange={(e) => setPilotestClass(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-zinc-200 focus:border-sky-600 focus:outline-none"
            >
              <option value="">—</option>
              {Array.from({ length: MAX_CLASS - MIN_CLASS + 1 }, (_, i) => MIN_CLASS + i).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-zinc-400">
            Taux d’erreurs (%)
            <input
              type="number"
              min={0}
              max={100}
              value={errPct}
              onChange={(e) => setErrPct(e.target.value)}
              placeholder="ex : 35"
              className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-zinc-200 placeholder:text-zinc-600 focus:border-sky-600 focus:outline-none"
            />
          </label>
        </div>

        <input
          type="text"
          maxLength={140}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note libre (optionnelle) — ex : perdu le fil sur la troisième vague"
          className="mt-3 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm placeholder:text-zinc-600 focus:border-sky-600 focus:outline-none"
        />

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            disabled={!valid}
            onClick={() =>
              onDone({
                exercise,
                pilotestClass: Number(pilotestClass),
                errPct: Number(errPct),
                note: note.trim() || undefined,
              })
            }
            className={`rounded-lg px-5 py-2 font-semibold ${
              valid
                ? 'bg-sky-600 text-white hover:bg-sky-500'
                : 'cursor-not-allowed bg-zinc-800 text-zinc-500'
            }`}
          >
            Enregistrer et continuer
          </button>
          <button
            onClick={onSkip}
            className="text-sm text-zinc-500 underline-offset-4 hover:text-zinc-300 hover:underline"
          >
            Passer sans mesure
          </button>
        </div>
        <p className="mt-2 text-xs text-zinc-600">
          Passer laisse le créneau vide dans le log du jour : rien ne sera remonté pour cet exercice.
        </p>
      </div>
    </div>
  );
}
