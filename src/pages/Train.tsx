import { useState } from 'react';
import { EXERCISES } from '../exercises';
import { useSession } from '../app/SessionContext';
import { ExercisePicker } from '../components/ExercisePicker';
import { psychoRemainingTodaySec } from '../coach/daily';
import type { ExerciseId, Family } from '../core/types';
import { FAMILIES } from '../core/types';

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
      <p className="mt-1 text-zinc-400">
        Lance une famille entière, ou choisis un exercice précis plus bas.
      </p>

      <FamilyLauncher />

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

/**
 * Lancement par TYPE D'ACTIVITÉ : une famille entière, ses exercices enchaînés
 * en blocs égaux et entrelacés.
 *
 * Choisir un exercice précis suppose de savoir lequel travailler ; travailler
 * une aptitude — spatiale, numérique, verbale — est la demande courante, et
 * rien ne la servait. Les exercices en flux sont exclus des mêlées courtes :
 * une séquence de Psychomoteur dure 5 minutes à elle seule.
 */
function FamilyLauncher() {
  const { start } = useSession();
  const [family, setFamily] = useState<Family | null>(null);

  const membersOf = (f: Family) =>
    EXERCISES.filter((e) => e.families.includes(f) && e.timed !== 'continuous');

  const launch = (f: Family, totalSec: number) => {
    const members = membersOf(f);
    if (members.length === 0) return;
    const per = Math.max(120, Math.round(totalSec / members.length));
    start({
      mode: 'free',
      blocks: members.map((m) => ({ exercise: m.id, level: 'adaptive' as const, durationSec: per })),
      briefing: [
        `Famille ${f} — ${members.length} exercices enchaînés.`,
        'Niveau adaptatif sur chacun : le premier bloc te situe, les suivants ajustent.',
        'Entraînement libre : rien n’est recompté dans le programme du jour.',
      ],
    });
  };

  return (
    <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
      <p className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
        Par type d’activité
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {FAMILIES.map((f) => {
          const n = membersOf(f).length;
          if (n === 0) return null;
          return (
            <button
              key={f}
              onClick={() => setFamily(family === f ? null : f)}
              className={`rounded-lg border px-3 py-1.5 text-sm ${
                family === f
                  ? 'border-sky-500 bg-sky-950/40 text-sky-200'
                  : 'border-zinc-700 text-zinc-300 hover:border-zinc-500'
              }`}
            >
              {f} <span className="text-zinc-500">· {n}</span>
            </button>
          );
        })}
      </div>
      {family && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="text-sm text-zinc-400">
            {membersOf(family).map((m) => m.name).join(' · ')}
          </span>
          <div className="flex gap-2">
            {[600, 900, 1200].map((sec) => (
              <button
                key={sec}
                onClick={() => launch(family, sec)}
                className="rounded-lg bg-sky-600 px-4 py-1.5 text-sm font-semibold hover:bg-sky-500"
              >
                {sec / 60} min
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
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
