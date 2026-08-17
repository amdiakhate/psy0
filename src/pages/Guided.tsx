import { composeGuided } from '../coach/composer';
import type { GuidedDuration } from '../coach/composer';
import { useSession } from '../app/SessionContext';
import { currentPhase, isLongSessionAllowed } from '../core/config';
import { parisMoment } from '../coach/daily-logic';
import { getExercise } from '../exercises';
import { useMemo, useState } from 'react';
import type { SessionPlan } from '../core/types';

const FORMATS: Array<{ min: GuidedDuration; label: string; note: string; longSessionOnly?: boolean }> = [
  { min: 30, label: '30 minutes', note: 'Format court : quand la journée est pleine.' },
  { min: 60, label: '1 heure', note: 'Le format de référence.' },
  { min: 90, label: '1 h 30', note: 'Volume sérieux, réparti sur plus d’exercices.' },
  {
    min: 120,
    label: '2 heures',
    note: 'Réservé à la semaine de simulations : coupure à mi-parcours conseillée.',
    longSessionOnly: true,
  },
];

export default function Guided() {
  const { start } = useSession();
  const phase = currentPhase();
  const [preview, setPreview] = useState<SessionPlan | null>(null);
  const recommended: GuidedDuration = useMemo(() => (phase === 'guided30' ? 30 : 60), [phase]);
  // Le format 2 h ne s'ouvre que du 30/08 au 01/09 : avant, il contredit le protocole.
  const longAllowed = useMemo(() => isLongSessionAllowed(parisMoment(new Date()).dayKey), []);
  const formats = useMemo(() => FORMATS.filter((f) => !f.longSessionOnly || longAllowed), [longAllowed]);

  const compose = (min: GuidedDuration) => {
    const plan = composeGuided(min);
    setPreview(plan);
    return plan;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold">Session guidée</h2>
      <p className="mt-1 text-zinc-400">
        Le coach compose la session depuis tes faiblesses : 50 % sur tes 3 exercices les plus
        faibles (drills ciblés inclus), 30 % sur le milieu, 20 % de maintien — et toujours au
        moins 10 min de Psychomoteur.
      </p>

      {phase === 'simulation-first' && (
        <div className="mt-4 rounded-xl border border-amber-700/60 bg-amber-950/20 p-4">
          <p className="font-semibold text-amber-400">Phase simulations (30 août – 2 septembre)</p>
          <p className="mt-1 text-sm text-zinc-300">
            À ce stade, le protocole change : commence par une{' '}
            <a href="/simulation" className="text-sky-400 underline">
              simulation complète
            </a>{' '}
            en conditions réelles, puis reviens au dashboard pour driller les faiblesses qu'elle a
            révélées. Les sessions guidées classiques passent en complément, pas en principal.
          </p>
        </div>
      )}

      {!longAllowed && (
        <p className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-sm text-zinc-400">
          Le format 2 h n'apparaît qu'entre le 30/08 et le 01/09, pendant la semaine de simulations.
          D'ici là, 2 h de drill d'affilée contredisent le protocole : le volume passe par la
          régularité quotidienne, pas par les grosses séances.
        </p>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {formats.map((f) => (
          <div
            key={f.min}
            className={`rounded-xl border p-5 ${
              recommended === f.min ? 'border-sky-600 bg-sky-950/20' : 'border-zinc-800 bg-zinc-900/60'
            }`}
          >
            <div className="flex items-baseline justify-between">
              <h3 className="text-xl font-bold">{f.label}</h3>
              {recommended === f.min && (
                <span className="rounded-full bg-sky-900/60 px-3 py-0.5 text-xs font-semibold text-sky-300">
                  recommandé
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-zinc-500">{f.note}</p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => start(compose(f.min))}
                className="rounded-lg bg-sky-600 px-4 py-2 font-semibold hover:bg-sky-500"
              >
                Lancer
              </button>
              <button
                onClick={() => compose(f.min)}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-zinc-300 hover:border-zinc-500"
              >
                Voir la composition
              </button>
            </div>
          </div>
        ))}
      </div>

      {preview && (
        <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
          <h3 className="font-semibold text-sky-400">Composition proposée</h3>
          <div className="mt-2 space-y-1 text-sm text-zinc-400">
            {preview.briefing?.map((line, i) => <p key={i}>{line}</p>)}
          </div>
          <ul className="mt-4 space-y-1.5">
            {preview.blocks.map((b, i) => (
              <li key={i} className="flex items-center justify-between rounded-md bg-zinc-900 px-3 py-1.5 text-sm">
                <span>
                  {getExercise(b.exercise).name}
                  {b.tagFilter && <span className="text-amber-400"> · drill {b.tagFilter}</span>}
                </span>
                <span className="font-mono text-zinc-500">{Math.round((b.durationSec ?? 0) / 60)} min</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-zinc-500">
            Total : {Math.round(preview.blocks.reduce((s, b) => s + (b.durationSec ?? 0), 0) / 60)} min
          </p>
        </div>
      )}
    </div>
  );
}
