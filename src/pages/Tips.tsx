import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { EXERCISES, getExercise, hasExercise } from '../exercises';
import type { AnyExerciseModule } from '../exercises';
import { getSavedLevel } from '../core/session';
import { isAtLocalCeiling } from '../analysis/pilotestGap';
import type { ExerciseId, TipExample } from '../core/types';

export default function Tips() {
  const { id } = useParams<{ id: string }>();

  if (id && hasExercise(id as ExerciseId)) {
    return <TipsDetail id={id as ExerciseId} />;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold">Astuces</h2>
      <p className="mt-1 text-zinc-400">Méthode, pièges classiques et gestion du temps, par exercice.</p>
      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {EXERCISES.map((e) => (
          <Link
            key={e.id}
            to={`/tips/${e.id}`}
            className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 hover:border-sky-500"
          >
            <p className="font-semibold">{e.name}</p>
            <p className="mt-1 text-sm text-zinc-500">{e.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function TipsDetail({ id }: { id: ExerciseId }) {
  const module_ = getExercise(id);
  const { tips } = module_;
  const level = getSavedLevel(id);
  const atCeiling = isAtLocalCeiling(level, module_.levels);

  return (
    <div className="max-w-2xl">
      <Link to="/tips" className="text-sm text-sky-400 hover:underline">
        ← Toutes les astuces
      </Link>
      <h2 className="mt-2 text-2xl font-bold">{module_.name}</h2>
      <p className="mt-1 text-zinc-400">{module_.description}</p>
      {id === 'cubes' && (
        <Link to="/cubes" className="mt-3 inline-flex rounded-lg border border-sky-800/70 px-3 py-2 text-sm font-semibold text-sky-300 hover:border-sky-500">
          Ouvrir le Coach Cubes
        </Link>
      )}

      {atCeiling && (
        <div className="mt-4 rounded-xl border border-amber-800/60 bg-amber-950/20 p-4 text-sm text-amber-200">
          <p className="font-semibold">Plafond local atteint — niveau {level}/{module_.levels}</p>
          <p className="mt-1">
            La difficulté adaptative ne peut plus monter : au-dessus, cette app ne mesure plus rien.
            Un score parfait ici ne dit donc pas où tu en es réellement.{' '}
            <strong>Vérifie ta classe sur Pilotest avant de sortir cet exercice de tes priorités.</strong>
          </p>
        </div>
      )}

      <Section title="La méthode" items={tips.method} accent="text-sky-400" />

      {(tips.examples?.length || module_.TipsIllustration) && (
        <section className="mt-6">
          <h3 className="font-semibold text-green-400">Exemples illustrés</h3>
          {module_.TipsIllustration && (
            <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
              <module_.TipsIllustration />
            </div>
          )}
          <div className="mt-3 space-y-4">
            {tips.examples?.map((ex, i) => <ExampleCard key={i} module_={module_} example={ex} />)}
          </div>
        </section>
      )}

      <Section title="Les 3 pièges classiques" items={tips.traps} accent="text-red-400" />
      <Section title="Gestion du temps" items={tips.timing} accent="text-amber-400" />
    </div>
  );
}

/** Un vrai item généré (seed fixé), rendu par le vrai composant, réponse et raisonnement dépliables. */
function ExampleCard({ module_, example }: { module_: AnyExerciseModule; example: TipExample }) {
  const item = useMemo(
    () => module_.generate(example.seed, example.level, example.forceTag),
    [module_, example],
  );
  const [revealed, setRevealed] = useState(false);
  const Component = module_.Component;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
      <p className="font-semibold text-zinc-200">{example.title}</p>
      <div className="pointer-events-none mt-3 rounded-lg border border-zinc-800/60 bg-zinc-950/40 p-3 [&_.text-7xl]:text-5xl">
        <Component item={item} onAnswer={() => {}} />
      </div>
      {!revealed ? (
        <button
          onClick={() => setRevealed(true)}
          className="mt-3 rounded-lg border border-zinc-700 px-4 py-1.5 text-sm text-zinc-300 hover:border-sky-500"
        >
          Voir la réponse et le raisonnement
        </button>
      ) : (
        <div className="mt-3">
          <p className="font-semibold text-green-400">Réponse : {module_.expectedToString(item)}</p>
          <ol className="mt-2 space-y-1.5">
            {example.walkthrough.map((step, i) => (
              <li key={i} className="flex gap-2 text-sm text-zinc-300">
                <span className="font-mono text-zinc-600">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

function Section({ title, items, accent }: { title: string; items: string[]; accent: string }) {
  return (
    <section className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
      <h3 className={`font-semibold ${accent}`}>{title}</h3>
      <ul className="mt-3 space-y-2">
        {items.map((t, i) => (
          <li key={i} className="flex gap-2 text-zinc-300">
            <span className="text-zinc-600">·</span>
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
