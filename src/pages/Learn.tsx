import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { EXERCISES, getExercise, hasExercise } from '../exercises';
import type { ExerciseId, LessonReality } from '../core/types';
import { useKeys } from '../hooks/useKeys';

/** Mode apprentissage : leçons pas-à-pas avec arrêt sur image. */
export default function Learn() {
  const { id } = useParams<{ id: string }>();
  if (id && hasExercise(id as ExerciseId) && getExercise(id as ExerciseId).lesson) {
    return <LessonPlayer id={id as ExerciseId} />;
  }

  const withLesson = EXERCISES.filter((e) => e.lesson);
  return (
    <div>
      <h2 className="text-2xl font-bold">Mode apprentissage</h2>
      <p className="mt-1 text-zinc-400">
        Les exercices difficiles, décortiqués étape par étape : ce qu'il faut voir, quoi faire, et
        surtout pourquoi. À faire une fois avant de s'entraîner dessus.
      </p>
      {withLesson.length === 0 ? (
        <p className="mt-6 text-zinc-500">Aucune leçon disponible pour l'instant.</p>
      ) : (
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {withLesson.map((e) => (
            <Link
              key={e.id}
              to={`/learn/${e.id}`}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 hover:border-sky-500"
            >
              <p className="font-semibold">{e.name}</p>
              <p className="mt-1 text-sm text-sky-400">{e.lesson!.title}</p>
              <p className="mt-1 text-xs text-zinc-500">{e.lesson!.steps.length} étapes</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function LessonPlayer({ id }: { id: ExerciseId }) {
  const module_ = getExercise(id);
  const lesson = module_.lesson!;
  // La dernière planche n'est pas une étape de la méthode : c'est « quand ça se
  // passe mal ». Elle vient APRÈS, volontairement — on ne lit pas un plan B
  // avant de savoir de quoi on se replie.
  const total = lesson.steps.length + 1;
  const [index, setIndex] = useState(-1); // -1 = intro
  const onReality = index === lesson.steps.length;
  const step = index >= 0 && !onReality ? lesson.steps[index] : null;
  const last = index === total - 1;

  const next = () => setIndex((i) => Math.min(i + 1, total - 1));
  const prev = () => setIndex((i) => Math.max(i - 1, -1));

  useKeys((e) => {
    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      next();
    }
    if (e.key === 'ArrowLeft') prev();
  });

  return (
    <div className="max-w-3xl">
      <Link to="/learn" className="text-sm text-sky-400 hover:underline">
        ← Toutes les leçons
      </Link>
      <h2 className="mt-2 text-2xl font-bold">{module_.name}</h2>
      <p className="text-sky-400">{lesson.title}</p>
      {id === 'cubes' && (
        <Link to="/cubes" className="mt-3 inline-flex rounded-lg border border-sky-800/70 px-3 py-2 text-sm font-semibold text-sky-300 hover:border-sky-500">
          Coach interactif et drills ciblés
        </Link>
      )}

      {index === -1 ? (
        <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
          <p className="text-lg text-zinc-200">{lesson.intro}</p>
          <button
            onClick={next}
            className="mt-5 rounded-lg bg-sky-600 px-6 py-2.5 font-semibold hover:bg-sky-500"
          >
            Commencer la leçon →
          </button>
          <p className="mt-3 text-xs text-zinc-500">Navigation : ← → ou Espace</p>
        </div>
      ) : (
        <>
          {/* Progression */}
          <div className="mt-5 flex items-center gap-2">
            {Array.from({ length: total }, (_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-1.5 flex-1 rounded-full ${
                  i > index
                    ? 'bg-zinc-800'
                    : i === lesson.steps.length
                      ? 'bg-amber-500'
                      : 'bg-sky-500'
                }`}
                title={i === lesson.steps.length ? 'Quand ça se passe mal' : `Étape ${i + 1}`}
              />
            ))}
          </div>
          <p className="mt-2 text-xs text-zinc-500">
            {onReality ? 'Dernière planche' : `Étape ${index + 1} / ${lesson.steps.length}`}
          </p>

          {onReality ? (
            <Reality reality={lesson.reality} />
          ) : (
            <>
              {/* Arrêt sur image */}
              <div className="mt-3 flex justify-center rounded-xl border border-zinc-800 bg-zinc-950/60 p-5">
                <lesson.Scene scene={step!.scene} stepIndex={index} />
              </div>

              {/* Commentaire */}
              <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
                <h3 className="text-lg font-semibold">{step!.title}</h3>
                <Block label="Ce qu'on voit" accent="text-zinc-400" text={step!.observe} />
                {step!.action && <Block label="Ce qu'on fait" accent="text-sky-400" text={step!.action} />}
                <Block label="Pourquoi" accent="text-green-400" text={step!.why} />
                {step!.pitfall && <Block label="Le piège" accent="text-red-400" text={step!.pitfall} />}
              </div>
            </>
          )}

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={prev}
              className="rounded-lg border border-zinc-700 px-4 py-2 text-zinc-300 hover:border-zinc-500"
            >
              ← Précédent
            </button>
            {last ? (
              <Link
                to="/train"
                className="rounded-lg bg-green-600 px-5 py-2 font-semibold hover:bg-green-500"
              >
                Leçon terminée — s'entraîner
              </Link>
            ) : (
              <button
                onClick={next}
                className="rounded-lg bg-sky-600 px-5 py-2 font-semibold hover:bg-sky-500"
              >
                Suivant →
              </button>
            )}
            <Link to={`/tips/${id}`} className="ml-auto text-sm text-sky-400 hover:underline">
              Voir les astuces complètes
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * « Quand ça se passe mal ».
 *
 * Une leçon décrit la méthode quand elle marche : on trouve, dans les temps,
 * sans se tromper. Ça n'arrive presque jamais — et c'est là que les points se
 * perdent. Cette planche dit ce que les leçons taisaient : ce que ça donne
 * VRAIMENT au début, ce que le budget officiel suppose déjà acquis, ce qu'on
 * lâche en premier quand le temps manque, comment reprendre après une erreur,
 * et quand renoncer. Sans elle, un dépassement de chrono se lit comme un
 * verdict personnel au lieu d'un cas prévu.
 */
function Reality({ reality }: { reality: LessonReality }) {
  return (
    <div className="mt-3 space-y-4">
      <div className="rounded-xl border border-amber-800/60 bg-amber-950/20 p-5">
        <h3 className="text-lg font-semibold text-amber-200">Quand ça se passe mal</h3>
        <p className="mt-1 text-sm text-amber-300/80">
          Tout ce qui précède décrit la méthode quand elle marche. Voici le reste du temps.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
        <Block label="Au début, ça donne ça" accent="text-amber-400" text={reality.atFirst} />
        <Block label="Ce que le chrono suppose vraiment" accent="text-sky-400" text={reality.budget} />
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-green-400">
          Le plan B — ce qu'on lâche, dans l'ordre
        </p>
        <ol className="mt-2 space-y-2">
          {reality.fallback.map((line, i) => (
            <li key={i} className="flex gap-3 text-zinc-200">
              <span className="w-5 shrink-0 text-right font-mono text-zinc-600">{i + 1}</span>
              <span>{line}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
        <Block label="Reprendre après une erreur" accent="text-zinc-400" text={reality.recover} />
        <Block label="Quand renoncer" accent="text-red-400" text={reality.bail} />
      </div>
    </div>
  );
}

function Block({ label, accent, text }: { label: string; accent: string; text: string }) {
  return (
    <div className="mt-3">
      <p className={`text-xs font-semibold uppercase tracking-widest ${accent}`}>{label}</p>
      <p className="mt-0.5 text-zinc-200">{text}</p>
    </div>
  );
}
