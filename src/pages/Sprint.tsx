import { useSession } from '../app/SessionContext';
import { psychoRemainingTodaySec } from '../coach/daily';
import { PSYCHO_DAILY_CAP_SEC } from '../coach/daily-logic';
import { getExercise, hasExercise } from '../exercises';

/**
 * Dose quotidienne de Psychomoteur. Le format 5 min n'a de sens que pour cet
 * exercice : c'est sa durée officielle, et l'apprentissage moteur se consolide
 * par doses courtes répétées, pas par volume. Pour tous les autres exercices,
 * un sprint isolé ne fait que produire des données hors contexte.
 */
export default function Sprint() {
  const { start } = useSession();
  const remainingSec = psychoRemainingTodaySec();
  const usedSec = PSYCHO_DAILY_CAP_SEC - remainingSec;
  const pct = Math.min(100, Math.round((usedSec / PSYCHO_DAILY_CAP_SEC) * 100));
  const module_ = hasExercise('psychomotor') ? getExercise('psychomotor') : null;
  const canRun = remainingSec >= 60;

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold">Psychomoteur quotidien</h2>
      <p className="mt-1 text-zinc-400">
        Une séquence de 5 minutes, niveau adaptatif. Trois tâches simultanées : poursuite du cercle,
        formes identiques, calcul faux.
      </p>

      <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
        <div className="flex items-baseline justify-between">
          <p className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
            Consommé aujourd'hui
          </p>
          <p className="font-mono text-lg">
            <span className={remainingSec === 0 ? 'text-amber-400' : 'text-sky-400'}>
              {Math.round(usedSec / 60)}
            </span>
            <span className="text-zinc-500"> / {Math.round(PSYCHO_DAILY_CAP_SEC / 60)} min</span>
          </p>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-800">
          <div
            className={`h-full transition-[width] duration-500 ${pct >= 100 ? 'bg-amber-500' : 'bg-sky-600'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-3 text-sm text-zinc-500">
          Cap dur de 12 min par jour, tous modes confondus. L'apprentissage moteur se consolide
          entre les séances, pas pendant : au-delà, tu fatigues sans progresser.
        </p>

        <button
          onClick={() =>
            module_ &&
            start({
              mode: 'sprint',
              blocks: [{ exercise: 'psychomotor', level: 'adaptive', durationSec: 300, role: 'psychomotor' }],
              briefing: [
                'Psychomoteur — 5 minutes, la durée officielle de l’épreuve.',
                'Les trois tâches comptent autant : ne sacrifie pas la poursuite pour le calcul.',
                'Précision avant tout : une séquence propre vaut mieux que deux bâclées.',
              ],
            })
          }
          disabled={!canRun || module_ === null}
          className={`mt-4 rounded-lg px-6 py-2.5 font-semibold ${
            canRun && module_
              ? 'bg-sky-600 hover:bg-sky-500'
              : 'cursor-not-allowed bg-zinc-800 text-zinc-600'
          }`}
        >
          {canRun ? 'Lancer 5 minutes' : 'Cap atteint — reviens demain'}
        </button>
      </div>

      <p className="mt-4 text-sm text-zinc-600">
        Les autres exercices ne se travaillent plus en sprint isolé : ils passent par la session du
        jour, qui les place selon tes priorités.
      </p>
    </div>
  );
}
