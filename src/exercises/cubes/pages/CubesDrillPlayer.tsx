import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useKeys } from '../../../hooks/useKeys';
import { newSeed } from '../../../core/rng';
import { CoachNet, RingDiagram, faceName } from '../coach/CubeCoachVisuals';
import { generateCubeDrill, validateCubeDrill } from '../domain/cubeDrills';
import type {
  CubeDrillQuestion,
  CubeDrillType,
  OrientationOnlyCubeDrill,
} from '../domain/cubeDrills';
import { appendCubeAttempt, skillsForCubeDrill } from '../progress/cubeCoachStorage';
import type { QuarterTurn } from '../domain/types';
import { quarterTurn } from '../domain/types';
import { CubesExercise } from '../CubesExercise';

const AVAILABLE: CubeDrillType[] = ['opposites', 'adjacency', 'rings', 'mirror', 'rotation', 'two-remaining', 'orientation-only', 'full-puzzle'];

const TITLES: Record<CubeDrillType, string> = {
  opposites: 'Opposées',
  adjacency: 'Adjacence',
  rings: 'Anneaux',
  mirror: 'Même cube ou miroir',
  rotation: 'Rotation',
  'full-puzzle': 'Exercice complet',
  'two-remaining': '2 faces restantes',
  'orientation-only': 'Face correcte, orientation fausse',
};

function isDrillType(value: string | undefined): value is CubeDrillType {
  return value !== undefined && AVAILABLE.includes(value as CubeDrillType);
}

export function CubesDrillPlayer() {
  const { type: rawType } = useParams<{ type: string }>();
  const type = isDrillType(rawType) ? rawType : null;
  const [count, setCount] = useState<number | null>(null);
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [answer, setAnswer] = useState<unknown>(null);
  const [feedback, setFeedback] = useState<boolean | null>(null);
  const [startedAt, setStartedAt] = useState(Date.now());
  const baseSeed = useMemo(newSeed, []);
  const question = useMemo(
    () => (type ? generateCubeDrill(baseSeed + index, type) : null),
    [baseSeed, index, type],
  );

  const submit = (candidate: unknown = answer) => {
    if (!question || candidate === null || feedback !== null) return;
    const correct = validateCubeDrill(question, candidate);
    setAnswer(candidate);
    if (correct) setCorrectCount((value) => value + 1);
    setFeedback(correct);
    appendCubeAttempt({
      id: `cube-drill-${question.id}-${Date.now()}`,
      answeredAt: new Date().toISOString(),
      mode: 'drill',
      drillType: question.type,
      seed: baseSeed + index,
      level: 1,
      durationMs: Date.now() - startedAt,
      correct,
      question,
      answer: candidate,
      solution: question.answer,
      errorCauses: [],
      skills: skillsForCubeDrill(question, correct),
    });
  };

  const next = () => {
    if (count !== null && index + 1 >= count) {
      setIndex(count);
      return;
    }
    setIndex((value) => value + 1);
    setAnswer(null);
    setFeedback(null);
    setStartedAt(Date.now());
  };

  useKeys((event) => {
    if (!question || count === null || index >= count) return;
    if (feedback !== null && (event.key === ' ' || event.key === 'Enter')) {
      event.preventDefault();
      next();
      return;
    }
    if (feedback === null && 'choices' in question) {
      const choiceIndex = Number(event.key) - 1;
      if (choiceIndex >= 0 && choiceIndex < question.choices.length) {
        setAnswer({ choiceId: question.choices[choiceIndex].id });
      }
    }
    if (feedback === null && event.key === 'Enter') submit();
  });

  if (!type) {
    return <p className="text-red-300">Drill Cubes inconnu. <Link to="/cubes" className="underline">Retour au Coach</Link></p>;
  }

  if (count === null) {
    return (
      <div className="mx-auto max-w-2xl">
        <Link to="/cubes" className="text-sm text-sky-400 hover:underline">← Coach Cubes</Link>
        <h2 className="mt-3 text-3xl font-bold">{TITLES[type]}</h2>
        <p className="mt-2 text-zinc-400">Choisis une série courte. Chaque réponse reçoit une correction immédiate.</p>
        <div className="mt-6 flex gap-3">
          {[5, 10].map((value) => (
            <button key={value} onClick={() => { setCount(value); setStartedAt(Date.now()); }} className="rounded-lg bg-sky-600 px-5 py-2.5 font-semibold hover:bg-sky-500">{value} questions</button>
          ))}
        </div>
      </div>
    );
  }

  if (index >= count) {
    return (
      <div className="mx-auto max-w-xl rounded-xl bg-zinc-900/70 p-6 text-center">
        <p className="font-mono text-5xl font-bold text-sky-300">{correctCount}/{count}</p>
        <h2 className="mt-3 text-2xl font-semibold">Série terminée</h2>
        <p className="mt-2 text-zinc-400">{Math.round((correctCount / count) * 100)} % de réussite sur {TITLES[type].toLowerCase()}.</p>
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={() => { setIndex(0); setCorrectCount(0); setAnswer(null); setFeedback(null); setStartedAt(Date.now()); }} className="rounded-lg bg-sky-600 px-4 py-2 font-semibold hover:bg-sky-500">Rejouer</button>
          <Link to="/cubes" className="rounded-lg border border-zinc-700 px-4 py-2 text-zinc-300 hover:border-zinc-500">Retour au Coach</Link>
        </div>
      </div>
    );
  }

  if (!question) return null;
  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center justify-between text-sm text-zinc-500">
        <Link to="/cubes" className="text-sky-400 hover:underline">Quitter le drill</Link>
        <span className="font-mono">{index + 1}/{count} · {correctCount} juste{correctCount > 1 ? 's' : ''}</span>
      </div>
      <div className="mt-3 h-1 overflow-hidden rounded bg-zinc-800"><div className="h-full bg-sky-500 transition-[width]" style={{ width: `${(index / count) * 100}%` }} /></div>

      <section className="mt-6 rounded-xl bg-zinc-900/65 p-5 sm:p-7">
        <h2 className="text-xl font-semibold text-zinc-100">{question.prompt}</h2>
        <DrillVisual question={question} answer={answer} setAnswer={setAnswer} onSubmit={submit} disabled={feedback !== null} />
        {feedback === null ? (
          question.type !== 'full-puzzle' && <button onClick={() => submit()} disabled={answer === null} className="mt-6 rounded-lg bg-sky-600 px-5 py-2 font-semibold disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-600">Valider · Entrée</button>
        ) : (
          <div className={`mt-6 rounded-lg p-4 ${feedback ? 'bg-green-950/35 text-green-200' : 'bg-red-950/35 text-red-200'}`}>
            <p className="font-semibold">{feedback ? 'Bonne réponse' : 'Réponse incorrecte'}</p>
            <DrillCorrection question={question} />
            <button onClick={next} autoFocus className="mt-4 rounded-lg bg-sky-600 px-4 py-2 font-semibold text-white hover:bg-sky-500">Continuer · Espace</button>
          </div>
        )}
      </section>
    </div>
  );
}

function DrillVisual({ question, answer, setAnswer, onSubmit, disabled }: { question: CubeDrillQuestion; answer: unknown; setAnswer: (answer: unknown) => void; onSubmit: (answer?: unknown) => void; disabled: boolean }) {
  if (question.type === 'full-puzzle') {
    return <div className="mt-5"><CubesExercise item={{ question: question.question, seed: Number(question.id.split('-').at(-1)) || 0, level: 3, tags: [] }} onAnswer={onSubmit} /></div>;
  }
  if (question.type === 'orientation-only') {
    return <OrientationInput question={question} answer={answer} setAnswer={setAnswer} disabled={disabled} />;
  }
  return (
    <>
      {question.type === 'two-remaining' ? (
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <CoachNet cube={question.reference} label="Patron de référence" />
          <CoachNet cube={question.target} label="Deux cases restent" highlights={{ [question.focusPosition]: 'focus' }} />
        </div>
      ) : question.type === 'mirror' && question.ringA && question.ringB ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <RingDiagram center={question.reference[question.focusPosition].id} order={question.ringA} cube={question.reference} label="Anneau 1" />
          <RingDiagram center={question.reference[question.focusPosition].id} order={question.ringB} cube={question.reference} label="Anneau 2" />
        </div>
      ) : question.type === 'rings' && question.ringA ? (
        <div className="mt-5"><CoachNet cube={question.reference} label="Patron de référence" /></div>
      ) : question.type === 'rotation' && question.target ? (
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <CoachNet cube={question.reference} label="Patron de référence" />
          <CoachNet cube={question.target} label="Patron cible" highlights={{ [question.focusPosition]: 'focus' }} />
        </div>
      ) : (
        <div className="mt-5"><CoachNet cube={question.reference} label="Patron de référence" /></div>
      )}
      <ChoiceInput question={question} answer={answer} setAnswer={setAnswer} disabled={disabled} />
    </>
  );
}

function ChoiceInput({ question, answer, setAnswer, disabled }: { question: Exclude<CubeDrillQuestion, OrientationOnlyCubeDrill>; answer: unknown; setAnswer: (answer: unknown) => void; disabled: boolean }) {
  if (!('choices' in question)) return null;
  const selected = typeof answer === 'object' && answer !== null && 'choiceId' in answer ? (answer as { choiceId: unknown }).choiceId : null;
  return (
    <div className="mt-5 grid gap-2 sm:grid-cols-2">
      {question.choices.map((option, index) => (
        <button key={option.id} aria-pressed={selected === option.id} disabled={disabled} onClick={() => setAnswer({ choiceId: option.id })} className={`rounded-lg border px-4 py-3 text-left text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 ${selected === option.id ? 'border-sky-400 bg-sky-950/60 text-sky-100' : 'border-zinc-700 bg-zinc-950/40 text-zinc-300 hover:border-zinc-500'}`}>
          <span className="mr-3 font-mono text-xs text-zinc-600">{index + 1}</span>{option.label}
        </button>
      ))}
    </div>
  );
}

function OrientationInput({ question, answer, setAnswer, disabled }: { question: OrientationOnlyCubeDrill; answer: unknown; setAnswer: (answer: unknown) => void; disabled: boolean }) {
  const current = typeof answer === 'object' && answer !== null && 'rotations' in answer
    ? { ...question.displayedRotations, ...(answer as { rotations: Record<number, QuarterTurn> }).rotations }
    : { ...question.displayedRotations };
  const shown = question.target.map((face, position) => ({ ...face, rot: current[position] ?? face.rot }));
  const turn = (position: number) => setAnswer({ rotations: { ...current, [position]: quarterTurn((current[position] ?? 0) + 1) } });
  return (
    <div className="mt-5">
      <CoachNet cube={shown} label="Clique les faces ambrées pour les tourner" highlights={Object.fromEntries(question.orientationTargets.map((position) => [position, 'focus']))} />
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {question.orientationTargets.map((position) => (
          <button key={position} disabled={disabled} onClick={() => turn(position)} className="rounded-lg border border-amber-700 px-3 py-2 text-sm text-amber-200 hover:bg-amber-950/40">Tourner {faceName(question.target, question.target[position].id)}</button>
        ))}
      </div>
    </div>
  );
}

function DrillCorrection({ question }: { question: CubeDrillQuestion }) {
  if (question.type === 'orientation-only') return <p className="mt-1 text-sm opacity-80">Le voisin ancre fixe le bord physique de chaque face ; le symbole tourne avec ce bord.</p>;
  if (question.type === 'two-remaining') return <p className="mt-1 text-sm opacity-80">Les opposées laissent deux candidats. L’ordre circulaire des quatre voisins choisit {question.answer.choiceId}.</p>;
  if ('choices' in question) {
    const option = question.choices.find((candidate) => candidate.id === question.answer.choiceId);
    return <p className="mt-1 text-sm opacity-80">Réponse : {option?.label ?? question.answer.choiceId}.</p>;
  }
  return null;
}
