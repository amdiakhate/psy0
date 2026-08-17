import { EXERCISES } from '../exercises';
import { useSession } from '../app/SessionContext';
import { composeSimulation } from '../coach/simulation';
import { daysUntil, MILESTONE_SIMULATIONS } from '../core/config';

const TOTAL_EXERCISES = 16;

export default function Simulation() {
  const { start } = useSession();
  const ready = EXERCISES.length >= TOTAL_EXERCISES;
  const dSim = daysUntil(MILESTONE_SIMULATIONS);

  return (
    <div>
      <h2 className="text-2xl font-bold">Simulation PSY0</h2>
      <p className="mt-1 text-zinc-400">
        Les {TOTAL_EXERCISES} exercices enchaînés sans pause, ordre randomisé, ~45 minutes. Rapport
        final avec verdict par famille : acquis / à consolider / critique.
      </p>
      <p className="mt-2 text-sm text-zinc-500">
        {dSim > 0
          ? `Tes simulations officielles sont prévues du 30 août au 2 septembre (J-${dSim}). Rien n'empêche un galop d'essai avant.`
          : 'Période de simulations : c’est maintenant. Une par jour, dans les conditions du réel.'}
      </p>

      {ready ? (
        <button
          onClick={() => start(composeSimulation())}
          className="mt-6 rounded-lg bg-sky-600 px-6 py-3 text-lg font-semibold hover:bg-sky-500"
        >
          Lancer la simulation complète
        </button>
      ) : (
        <p className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 text-zinc-400">
          {EXERCISES.length}/{TOTAL_EXERCISES} exercices implémentés — la simulation se débloque
          quand ils y sont tous.
        </p>
      )}
    </div>
  );
}
