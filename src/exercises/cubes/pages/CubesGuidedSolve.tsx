import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { newSeed } from '../../../core/rng';
import { generate } from '../generator';
import { getOppositePosition } from '../domain/cubeGeometry';
import { buildReasoningPath, solutionCubeFor } from '../domain/reasoningPath';
import type { ReasoningStep } from '../domain/reasoningPath';
import { CoachNet, faceName } from '../coach/CubeCoachVisuals';
import { appendCubeAttempt } from '../progress/cubeCoachStorage';
import type { CubeSkillResult } from '../progress/cubeCoachStorage';

export function CubesGuidedSolve() {
  const seed = useMemo(newSeed, []);
  const item = useMemo(() => generate(seed, 4, 'letters'), [seed]);
  const solution = useMemo(() => solutionCubeFor(item.question), [item.question]);
  const path = useMemo(() => buildReasoningPath(item.question), [item.question]);
  const [selectedFace, setSelectedFace] = useState<string | null>(null);
  const [pairs, setPairs] = useState<string[]>([]);
  const [pairMessage, setPairMessage] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(-1);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [stepCorrect, setStepCorrect] = useState<boolean | null>(null);
  const [skills, setSkills] = useState<CubeSkillResult[]>([]);
  const startedAt = useMemo(() => Date.now(), []);

  const choosePairFace = (faceId: string) => {
    if (selectedFace === null) {
      setSelectedFace(faceId);
      setPairMessage(null);
      return;
    }
    if (selectedFace === faceId) {
      setSelectedFace(null);
      return;
    }
    const first = item.question.reference.find((face) => face.id === selectedFace)!;
    const second = item.question.reference.find((face) => face.id === faceId)!;
    const correct = getOppositePosition(first.originalPosition) === second.originalPosition;
    setSkills((current) => [...current, { skill: 'opposites', correct }]);
    if (correct) {
      const key = [selectedFace, faceId].sort().join('|');
      setPairs((current) => current.includes(key) ? current : [...current, key]);
      setPairMessage(`${faceName(solution, selectedFace)} et ${faceName(solution, faceId)} sont opposées.`);
    } else {
      setPairMessage('Ces deux faces se touchent : cherche la face située deux cases plus loin dans la bande ou l’axe vertical.');
    }
    setSelectedFace(null);
  };

  const currentStep = stepIndex >= 0 ? path.minimalSteps[stepIndex] : null;
  const options = currentStep ? optionsForStep(currentStep, item.question.pieces.map((piece) => piece.faceId), solution) : [];
  const correctOption = currentStep ? correctOptionForStep(currentStep) : '';

  const validateStep = () => {
    if (!currentStep || selectedOption === null) return;
    const correct = selectedOption === correctOption;
    setStepCorrect(correct);
    setSkills((current) => [...current, skillForStep(currentStep, correct)]);
  };

  const advance = () => {
    if (stepIndex + 1 >= path.minimalSteps.length) {
      appendCubeAttempt({
        id: `cube-guided-${seed}-${Date.now()}`,
        answeredAt: new Date().toISOString(),
        mode: 'guided',
        seed,
        level: item.level,
        durationMs: Date.now() - startedAt,
        correct: skills.every((result) => result.correct),
        question: item.question,
        answer: null,
        solution: path,
        errorCauses: [],
        skills,
      });
      setStepIndex(path.minimalSteps.length);
      return;
    }
    setStepIndex((value) => value + 1);
    setSelectedOption(null);
    setStepCorrect(null);
  };

  if (stepIndex >= path.minimalSteps.length) {
    return (
      <div className="mx-auto max-w-xl rounded-xl bg-zinc-900/70 p-6">
        <h2 className="text-2xl font-semibold text-green-300">Planche expliquée jusqu’au bout</h2>
        <p className="mt-2 text-zinc-400">Tu as séparé placement et orientation. Rejoue maintenant la sous-compétence qui t’a ralenti, puis reviens sur une planche complète.</p>
        <div className="mt-5 flex gap-3"><Link to="/cubes" className="rounded-lg bg-sky-600 px-4 py-2 font-semibold hover:bg-sky-500">Retour au Coach</Link><Link to="/cubes/drill/two-remaining" className="rounded-lg border border-zinc-700 px-4 py-2 text-zinc-300">Driller les anneaux</Link></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link to="/cubes" className="text-sm text-sky-400 hover:underline">← Coach Cubes</Link>
      <h2 className="mt-3 text-3xl font-bold">Résoudre avec moi</h2>
      <p className="mt-2 text-zinc-400">Le Coach ne donne qu’une décision à la fois. Le chrono est coupé.</p>
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <CoachNet cube={item.question.reference} label="Patron de référence" />
        <CoachNet cube={item.question.target} label="Patron à compléter" />
      </div>

      {stepIndex === -1 ? (
        <section className="mt-6 rounded-xl bg-zinc-900/65 p-5">
          <h3 className="text-lg font-semibold">Étape A : trouve les trois paires opposées</h3>
          <p className="mt-1 text-sm text-zinc-500">Clique deux symboles pour proposer une paire.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {item.question.reference.map((face) => (
              <button key={face.id} aria-pressed={selectedFace === face.id} onClick={() => choosePairFace(face.id)} className={`grid h-12 w-12 place-items-center rounded-lg border text-lg font-bold ${selectedFace === face.id ? 'border-sky-400 bg-sky-950 text-sky-200' : pairs.some((pair) => pair.includes(face.id)) ? 'border-green-700 bg-green-950/30 text-green-300' : 'border-zinc-700 bg-zinc-950 text-zinc-200'}`}>{faceName(solution, face.id)}</button>
            ))}
          </div>
          {pairMessage && <p className={`mt-3 text-sm ${pairMessage.startsWith('Ces') ? 'text-red-300' : 'text-green-300'}`}>{pairMessage}</p>}
          <button disabled={pairs.length < 3} onClick={() => setStepIndex(0)} className="mt-5 rounded-lg bg-sky-600 px-4 py-2 font-semibold disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-600">Continuer avec les 3 paires</button>
        </section>
      ) : currentStep ? (
        <section className="mt-6 rounded-xl bg-zinc-900/65 p-5">
          <p className="font-mono text-xs text-sky-400">Décision {stepIndex + 1}/{path.minimalSteps.length}</p>
          <h3 className="mt-2 text-lg font-semibold">{promptForStep(currentStep, solution)}</h3>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {options.map((option) => (
              <button key={option.id} aria-pressed={selectedOption === option.id} disabled={stepCorrect !== null} onClick={() => setSelectedOption(option.id)} className={`rounded-lg border px-4 py-3 text-left ${selectedOption === option.id ? 'border-sky-400 bg-sky-950/55' : 'border-zinc-700 bg-zinc-950/40 hover:border-zinc-500'}`}>{option.label}</button>
            ))}
          </div>
          {stepCorrect === null ? (
            <button onClick={validateStep} disabled={selectedOption === null} className="mt-5 rounded-lg bg-sky-600 px-4 py-2 font-semibold disabled:bg-zinc-800 disabled:text-zinc-600">Valider</button>
          ) : (
            <div className={`mt-5 rounded-lg p-4 ${stepCorrect ? 'bg-green-950/30 text-green-200' : 'bg-red-950/30 text-red-200'}`}><p className="font-semibold">{stepCorrect ? 'Bonne déduction.' : 'Pas encore.'}</p><p className="mt-1 text-sm opacity-80">{explanationForStep(currentStep, solution)}</p><button onClick={advance} className="mt-3 rounded-lg bg-sky-600 px-4 py-2 font-semibold text-white">Étape suivante</button></div>
          )}
        </section>
      ) : null}
    </div>
  );
}

function correctOptionForStep(step: ReasoningStep): string {
  if (step.kind === 'opposite-deduction' || step.kind === 'elimination') return step.placedFaceId;
  if (step.kind === 'two-candidates') return 'ring';
  if (step.kind === 'ring-comparison') return step.chosenFaceId;
  if (step.kind === 'mirror-rejection') return 'mirror';
  return String(step.pieceTurn);
}

function optionsForStep(step: ReasoningStep, allFaceIds: string[], cube: ReturnType<typeof solutionCubeFor>): Array<{ id: string; label: string }> {
  if (step.kind === 'opposite-deduction' || step.kind === 'elimination') return allFaceIds.map((id) => ({ id, label: faceName(cube, id) }));
  if (step.kind === 'two-candidates') return [{ id: 'opposites', label: 'Recalculer les opposées' }, { id: 'ring', label: 'Comparer l’anneau des voisins' }];
  if (step.kind === 'ring-comparison') return [step.chosenFaceId, ...step.rejectedFaceIds].map((id) => ({ id, label: faceName(cube, id) }));
  if (step.kind === 'mirror-rejection') return [{ id: 'same', label: 'Même cube' }, { id: 'mirror', label: 'Cube miroir' }];
  return [0, 1, 2, 3].map((turn) => ({ id: String(turn), label: turn === 0 ? 'Aucune' : turn === 2 ? '180°' : turn === 1 ? '90° antihoraire' : '90° horaire' }));
}

function promptForStep(step: ReasoningStep, cube: ReturnType<typeof solutionCubeFor>): string {
  if (step.kind === 'opposite-deduction') return `Quelle face est imposée à l’opposé de ${faceName(cube, step.visibleFaceId)} ?`;
  if (step.kind === 'elimination') return 'Quelle est la seule face encore disponible ?';
  if (step.kind === 'two-candidates') return 'Deux candidats restent. Quelle règle les départage ?';
  if (step.kind === 'ring-comparison') return 'Quel candidat respecte l’ordre circulaire des voisins ?';
  if (step.kind === 'mirror-rejection') return 'Cet ordre inversé décrit-il le même cube ?';
  return `Quelle rotation appliquer à ${faceName(cube, step.faceId)} ?`;
}

function explanationForStep(step: ReasoningStep, cube: ReturnType<typeof solutionCubeFor>): string {
  if (step.kind === 'opposite-deduction') return `${faceName(cube, step.visibleFaceId)} est opposée à ${faceName(cube, step.placedFaceId)} dans la référence.`;
  if (step.kind === 'elimination') return `${faceName(cube, step.placedFaceId)} est la dernière pièce libre.`;
  if (step.kind === 'two-candidates') return 'Les opposées sont identiques pour les deux propositions ; seul l’ordre des voisins conserve ou inverse le cube.';
  if (step.kind === 'ring-comparison') return `L’anneau autour de ${faceName(cube, step.chosenFaceId)} suit l’ordre demandé par le patron cible.`;
  if (step.kind === 'mirror-rejection') return 'Une rotation décale un anneau, mais ne l’inverse jamais.';
  return `Le voisin ${faceName(cube, step.anchorFaceId)} fixe la même arête physique après le déplacement.`;
}

function skillForStep(step: ReasoningStep, correct: boolean): CubeSkillResult {
  if (step.kind === 'opposite-deduction') return { skill: 'deductive-placement', correct };
  if (step.kind === 'elimination') return { skill: 'deductive-placement', correct };
  if (step.kind === 'two-candidates' || step.kind === 'ring-comparison') return { skill: 'two-candidates-ring', correct };
  if (step.kind === 'mirror-rejection') return { skill: 'mirror', correct };
  return { skill: step.pieceTurn === 2 ? 'rotation-180' : 'rotation-90', correct };
}
