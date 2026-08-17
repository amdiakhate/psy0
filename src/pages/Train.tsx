import { useState } from 'react';
import { EXERCISES } from '../exercises';
import { useSession } from '../app/SessionContext';
import { ExercisePicker } from '../components/ExercisePicker';
import { psychoRemainingTodaySec } from '../coach/daily';
import type { ExerciseId } from '../core/types';

const DURATIONS = [
  { label: '3 min', sec: 180 },
  { label: '5 min', sec: 300 },
  { label: '10 min', sec: 600 },
  { label: '20 items', count: 20 },
  { label: '50 items', count: 50 },
];

export default function Train() {
  const { start } = useSession();
  const [selected, setSelected] = useState<ExerciseId | null>(EXERCISES[0]?.id ?? null);
  const [level, setLevel] = useState<number | 'adaptive'>('adaptive');

  const module_ = EXERCISES.find((e) => e.id === selected);
  // Les exercices continus (psychomoteur, n-back) se jouent à la durée, pas au nombre d'items.
  const durations = module_?.timed === 'continuous' ? DURATIONS.filter((d) => d.sec) : DURATIONS;

  return (
    <div>
      <h2 className="text-2xl font-bold">Entraînement libre</h2>
      <p className="mt-1 text-zinc-400">Choisis un exercice, un niveau et une durée.</p>

      <div className="mt-6">
        <ExercisePicker selected={selected} onSelect={(m) => setSelected(m.id)} showLevel />
      </div>

      {module_ && (
        <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
          <p className="font-semibold">{module_.name}</p>
          <p className="mt-1 text-zinc-400">{module_.description}</p>
          {module_.id === 'psychomotor' && <PsychoBudget />}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-sm text-zinc-500">Niveau :</span>
            <LevelBtn active={level === 'adaptive'} onClick={() => setLevel('adaptive')}>
              Adaptatif
            </LevelBtn>
            {Array.from({ length: module_.levels }, (_, i) => (
              <LevelBtn key={i} active={level === i + 1} onClick={() => setLevel(i + 1)}>
                {i + 1}
              </LevelBtn>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {durations.map((d) => (
              <button
                key={d.label}
                onClick={() =>
                  start({
                    mode: 'free',
                    blocks: [
                      {
                        exercise: module_.id,
                        level,
                        durationSec: d.sec,
                        itemCount: d.count,
                      },
                    ],
                  })
                }
                className="rounded-lg bg-sky-600 px-4 py-2 font-semibold hover:bg-sky-500"
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** Cap dur : 12 min de Psychomoteur par jour, l'app refuse au-delà. */
function PsychoBudget() {
  const remaining = psychoRemainingTodaySec();
  const min = Math.floor(remaining / 60);
  return (
    <p className={`mt-2 rounded-lg border p-3 text-sm ${remaining < 60 ? 'border-red-800 bg-red-950/30 text-red-300' : 'border-amber-800/60 bg-amber-950/20 text-amber-200'}`}>
      {remaining < 60
        ? 'Cap atteint : 12 min de Psychomoteur aujourd’hui. L’apprentissage moteur se consolide par doses courtes quotidiennes — en refaire maintenant n’apporte rien, reviens demain.'
        : `Budget Psychomoteur restant aujourd'hui : ${min} min (cap 12 min/jour — apprentissage moteur, doses courtes quotidiennes). Les blocs plus longs seront tronqués.`}
    </p>
  );
}

function LevelBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md border px-3 py-1 text-sm ${
        active ? 'border-sky-500 bg-sky-950/60 text-sky-300' : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
      }`}
    >
      {children}
    </button>
  );
}
