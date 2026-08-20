import { useRouteError } from 'react-router-dom';
import { getSuspended } from '../coach/suspended';
import { parisMoment } from '../coach/daily-logic';

/**
 * Écran de secours quand un rendu plante.
 *
 * Sans lui, React Router affiche sa page d'erreur brute : une trace minifiée sur
 * fond blanc, aucun moyen de revenir, et l'impression que la séance est perdue.
 * Elle ne l'est pas — les items joués sont déjà dans le journal et la position
 * est sauvegardée à chaque bloc. Encore faut-il le dire, et offrir le chemin du
 * retour.
 */
export function CrashScreen() {
  const error = useRouteError();
  const message = error instanceof Error ? error.message : String(error);
  const reprise = getSuspended();
  const reprenable = reprise !== null && reprise.dayKey === parisMoment(new Date()).dayKey;

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-5 p-8">
      <h1 className="text-2xl font-bold text-zinc-100">La séance s’est interrompue</h1>

      <div className="rounded-xl border border-green-800 bg-green-950/20 p-5 text-zinc-200">
        <p className="font-semibold text-green-300">Rien de ce que tu as joué n’est perdu.</p>
        <p className="mt-1 text-sm">
          Chaque réponse part dans ton journal au moment où tu la donnes, et ta position dans la
          séance est enregistrée à la fin de chaque bloc.
          {reprenable && ' Tu peux reprendre là où tu en étais depuis l’accueil.'}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <a
          href="/"
          className="rounded-lg bg-sky-600 px-6 py-2.5 font-semibold text-white hover:bg-sky-500"
        >
          {reprenable ? 'Revenir et reprendre' : 'Revenir à l’accueil'}
        </a>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg border border-zinc-700 px-5 py-2.5 text-zinc-300 hover:border-zinc-500"
        >
          Recharger la page
        </button>
      </div>

      <details className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-sm">
        <summary className="cursor-pointer text-zinc-400">Détail technique</summary>
        <p className="mt-2 break-words font-mono text-xs text-zinc-500">{message}</p>
      </details>
    </div>
  );
}
