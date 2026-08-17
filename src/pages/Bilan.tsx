import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EXERCISES, getExercise } from '../exercises';
import { getEvents } from '../core/eventlog';
import { getSavedLevel } from '../core/session';
import { getPrefs, savePrefs, arePrioritiesLocked, PRIORITIES_LOCKED_UNTIL } from '../core/prefs';
import { normalizeLevel, isAtLocalCeiling } from '../analysis/pilotestGap';
import { parisMoment } from '../coach/daily-logic';
import type { ExerciseId } from '../core/types';

/** Un exercice est « découvert » dès qu'un item a été joué. */
const DISCOVERY_MIN_ITEMS = 1;
/** En dessous, la mesure locale n'est pas exploitable. */
const RELIABLE_MIN_ITEMS = 10;

interface Row {
  exercise: ExerciseId;
  name: string;
  items: number;
  level: number;
  maxLevel: number;
  localClass: number;
  discovered: boolean;
  reliable: boolean;
  atCeiling: boolean;
}

/**
 * Bilan Phase 1 → Phase 2, écran unique de bascule (17/08 au soir).
 * Il met face à face ce que l'app mesure et ce que Pilotest mesure, puis
 * demande les deux seules choses que l'app ne peut pas déduire : les classes
 * officielles et les trois priorités.
 */
export default function Bilan() {
  const navigate = useNavigate();
  const today = useMemo(() => parisMoment(new Date()).dayKey, []);
  const [prefs, setPrefs] = useState(getPrefs);
  const [confirmUnlock, setConfirmUnlock] = useState(false);

  const rows = useMemo<Row[]>(() => {
    const counts = new Map<ExerciseId, number>();
    for (const e of getEvents()) counts.set(e.exercise, (counts.get(e.exercise) ?? 0) + 1);
    return EXERCISES.map((ex) => {
      const items = counts.get(ex.id) ?? 0;
      const level = getSavedLevel(ex.id);
      return {
        exercise: ex.id,
        name: ex.name,
        items,
        level,
        maxLevel: ex.levels,
        localClass: normalizeLevel(level, ex.levels),
        discovered: items >= DISCOVERY_MIN_ITEMS,
        reliable: items >= RELIABLE_MIN_ITEMS,
        atCeiling: isAtLocalCeiling(level, ex.levels),
      };
    });
  }, []);

  const locked = arePrioritiesLocked(today, prefs);
  const editable = !locked || confirmUnlock;

  const [slots, setSlots] = useState<(ExerciseId | '')[]>(() => {
    const p = getPrefs().priorities;
    return p ? [...p] : ['', '', ''];
  });

  const setClass = (id: ExerciseId, value: string) => {
    const next = {
      ...getPrefs(),
      pilotestClass: { ...getPrefs().pilotestClass, [id]: value === '' ? null : Number(value) },
    };
    setPrefs(next);
    savePrefs(next);
  };

  const setSlot = (index: number, id: ExerciseId | '') => {
    const next = [...slots];
    next[index] = id;
    setSlots(next);
  };

  const duplicates = slots.filter((s) => s !== '').length !== new Set(slots.filter((s) => s !== '')).size;
  const prioritiesComplete = slots.every((s) => s !== '') && !duplicates;
  const filledClasses = rows.filter((r) => (prefs.pilotestClass[r.exercise] ?? null) !== null).length;

  const validate = () => {
    if (!prioritiesComplete) return;
    const next = {
      ...getPrefs(),
      priorities: slots as [ExerciseId, ExerciseId, ExerciseId],
      phase1ReviewAt: Date.now(),
    };
    savePrefs(next);
    setPrefs(next);
    navigate('/dashboard');
  };

  return (
    <div className="mx-auto max-w-4xl">
      <h2 className="text-2xl font-bold">Bilan Phase 1 → Phase 2</h2>
      <p className="mt-1 text-zinc-400">
        Ce que cette app mesure, face à ce que Pilotest mesure. L'app ne connaît que ses propres
        niveaux : elle ne peut pas deviner tes classes officielles ni ce que tu décides de
        travailler en priorité. C'est le seul écran où tu saisis les deux, en une fois.
      </p>

      <section className="mt-6 overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-900 text-zinc-500">
            <tr>
              <th className="px-4 py-2">Exercice</th>
              <th className="px-2 py-2">Découverte</th>
              <th className="px-2 py-2">Niveau local</th>
              <th className="px-2 py-2">≈ classe</th>
              <th className="px-2 py-2">Classe Pilotest</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.exercise} className="border-t border-zinc-800/60">
                <td className="px-4 py-2 font-medium">
                  {r.name}
                  {r.atCeiling && r.reliable && (
                    <span
                      title="Plafond de la difficulté adaptative : l'app ne mesure plus rien au-dessus."
                      className="ml-2 rounded-full bg-amber-950/60 px-2 py-0.5 text-xs text-amber-400"
                    >
                      plafond local
                    </span>
                  )}
                </td>
                <td className="px-2 py-2">
                  {r.discovered ? (
                    <span className="text-green-400">découvert · {r.items} items</span>
                  ) : (
                    <span className="text-red-400">non découvert</span>
                  )}
                </td>
                <td className="px-2 py-2 font-mono text-zinc-300">
                  {r.discovered ? `${r.level}/${r.maxLevel}` : '—'}
                </td>
                <td className="px-2 py-2 font-mono text-zinc-500">
                  {r.reliable ? `${r.localClass}/9` : <span title="Moins de 10 items : mesure non fiable">—</span>}
                </td>
                <td className="px-2 py-2">
                  <select
                    value={prefs.pilotestClass[r.exercise] ?? ''}
                    onChange={(e) => setClass(r.exercise, e.target.value)}
                    className="w-16 rounded-md border border-zinc-700 bg-zinc-900 px-1 py-1 text-center focus:border-sky-600 focus:outline-none"
                  >
                    <option value="">—</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <p className="mt-2 text-sm text-zinc-500">
        {filledClasses}/{rows.length} classes Pilotest saisies. Les manquantes ne bloquent rien —
        elles privent juste le dashboard de son garde-fou anti-clone.
      </p>

      <section className="mt-8 rounded-xl border border-sky-900/60 bg-sky-950/20 p-5">
        <h3 className="font-semibold text-sky-300">Tes trois priorités</h3>
        <p className="mt-1 text-sm text-zinc-400">
          La session du matin les travaille en rotation stricte P1 → P2 → P3 → P1…
          {locked && !confirmUnlock ? (
            <> Elles sont figées jusqu'au {PRIORITIES_LOCKED_UNTIL.split('-').reverse().slice(0, 2).join('/')}.</>
          ) : (
            <> Une fois validées, elles seront figées jusqu'au{' '}
              {PRIORITIES_LOCKED_UNTIL.split('-').reverse().slice(0, 2).join('/')} : changer de cible
              tous les deux jours, c'est n'en travailler aucune.</>
          )}
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <label key={i} className="text-sm text-zinc-400">
              P{i + 1}
              <select
                value={slots[i]}
                disabled={!editable}
                onChange={(e) => setSlot(i, e.target.value as ExerciseId | '')}
                className={`mt-1 w-full rounded-md border px-2 py-1.5 focus:outline-none ${
                  editable
                    ? 'border-zinc-700 bg-zinc-900 text-zinc-200 focus:border-sky-600'
                    : 'cursor-not-allowed border-zinc-800 bg-zinc-950 text-zinc-500'
                }`}
              >
                <option value="">—</option>
                {EXERCISES.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>

        {duplicates && (
          <p className="mt-3 text-sm text-red-400">
            Deux priorités identiques : la rotation tournerait à vide sur le même exercice.
          </p>
        )}

        {locked && !confirmUnlock ? (
          <button
            onClick={() => {
              if (window.confirm('Changer de priorités avant le 25/08 casse la rotation en cours. Continuer ?')) {
                setConfirmUnlock(true);
              }
            }}
            className="mt-4 rounded-lg border border-amber-800 px-4 py-2 text-sm text-amber-400 hover:bg-amber-950/30"
          >
            Modifier quand même
          </button>
        ) : (
          <button
            onClick={validate}
            disabled={!prioritiesComplete}
            className={`mt-4 rounded-lg px-6 py-2.5 font-semibold ${
              prioritiesComplete ? 'bg-sky-600 hover:bg-sky-500' : 'cursor-not-allowed bg-zinc-800 text-zinc-600'
            }`}
          >
            {prioritiesComplete ? 'Valider et passer en Phase 2' : 'Choisis trois priorités distinctes'}
          </button>
        )}
      </section>

      {rows.some((r) => r.atCeiling && r.reliable) && (
        <p className="mt-6 rounded-xl border border-amber-800/60 bg-amber-950/20 p-4 text-sm text-amber-200">
          Plafond local atteint sur{' '}
          {rows
            .filter((r) => r.atCeiling && r.reliable)
            .map((r) => getExercise(r.exercise).name)
            .join(', ')}{' '}
          : l'app ne peut plus monter la difficulté, donc elle ne mesure plus rien au-dessus.
          Vérifie ta classe sur Pilotest avant de sortir ces exercices de tes priorités.
        </p>
      )}
    </div>
  );
}
