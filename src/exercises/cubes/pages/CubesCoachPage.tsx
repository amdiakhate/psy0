import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSession } from '../../../app/SessionContext';
import { generate, solutionAnswer } from '../generator';
import { analyzeCubeAttempt } from '../domain/cubeAnalysis';
import type { CubeDrillType } from '../domain/cubeDrills';
import { loadCubeCoachState } from '../progress/cubeCoachStorage';
import type { CubeSkill } from '../progress/cubeCoachStorage';
import { computeCubeCoachStats, dominantCubeWeakness } from '../progress/cubeCoachStats';
import { OppositePairsDiagram } from '../coach/CubeCoachVisuals';
import { CubeRotationExplanation } from '../coach/CubeRotationExplanation';

const SKILL_LABEL: Record<CubeSkill, string> = {
  opposites: 'Opposées',
  adjacency: 'Voisinages',
  'deductive-placement': 'Placement par déduction',
  'two-candidates-ring': '2 candidats / anneau',
  mirror: 'Miroirs',
  'rotation-90': 'Orientations 90°',
  'rotation-180': 'Orientations 180°',
  'full-puzzle': 'Exercice complet',
};

const SKILL_DRILL: Record<CubeSkill, CubeDrillType> = {
  opposites: 'opposites',
  adjacency: 'adjacency',
  'deductive-placement': 'two-remaining',
  'two-candidates-ring': 'two-remaining',
  mirror: 'mirror',
  'rotation-90': 'orientation-only',
  'rotation-180': 'orientation-only',
  'full-puzzle': 'full-puzzle',
};

const DRILLS: Array<{ type: CubeDrillType; title: string; description: string }> = [
  { type: 'opposites', title: 'Opposées', description: 'Identifier les trois paires sans replier le cube.' },
  { type: 'adjacency', title: 'Adjacence', description: 'Reconnaître les quatre voisines d’une face.' },
  { type: 'rings', title: 'Anneaux', description: 'Lire l’ordre horaire des voisins.' },
  { type: 'mirror', title: 'Miroir', description: 'Distinguer rotation et ordre inversé.' },
  { type: 'rotation', title: 'Rotation', description: 'Déduire un quart ou un demi-tour.' },
  { type: 'two-remaining', title: '2 faces restantes', description: 'Départager les deux derniers candidats par l’anneau.' },
  { type: 'orientation-only', title: 'Face correcte, orientation fausse', description: 'Orienter 1 à 3 symboles sans déplacer les faces.' },
  { type: 'full-puzzle', title: 'Exercice complet', description: 'Transférer la méthode sur une planche entière, sans aide.' },
];

export function CubesCoachPage() {
  const { start } = useSession();
  const attempts = loadCubeCoachState().attempts;
  const stats = computeCubeCoachStats(attempts);
  const weakness = dominantCubeWeakness(attempts);
  const reference = useMemo(() => generate(120, 3, 'letters').question.reference, []);
  const rotationDemo = useMemo(() => {
    for (let seed = 0; seed < 100; seed++) {
      const item = generate(seed, 4, 'letters');
      const answer = solutionAnswer(item.question);
      const hole = item.question.holes[0];
      answer[hole] = { ...answer[hole], rot: (answer[hole].rot + 1) % 4 };
      const analysis = analyzeCubeAttempt(item.question, answer);
      if (analysis.orientationErrors[0]) {
        return { diagnostic: analysis.orientationErrors[0], cube: item.question.reference };
      }
    }
    return null;
  }, []);

  const launchFull = () => start({
    mode: 'free',
    blocks: [{ exercise: 'cubes', level: 'adaptive', itemCount: 10 }],
    briefing: [
      'Cubes 2D/3D — 10 planches.',
      'Opposées d’abord, anneau seulement quand deux candidats restent.',
      'Le Coach détaillera les erreurs après chaque planche hors simulation.',
    ],
  });

  return (
    <div className="max-w-5xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to="/train" className="text-sm text-sky-400 hover:underline">← Entraînement libre</Link>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">Coach Cubes</h2>
          <p className="mt-2 max-w-2xl text-zinc-400">Travaille une règle précise, puis transfère-la sur une planche complète. Les scores ci-dessous ne mélangent pas les sous-compétences.</p>
        </div>
        <button onClick={launchFull} className="rounded-lg bg-sky-600 px-5 py-2.5 font-semibold hover:bg-sky-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400">Faire 10 planches</button>
      </div>

      <section className="mt-7 overflow-hidden rounded-xl bg-zinc-900/70">
        <div className="grid gap-0 lg:grid-cols-[1fr_1.15fr]">
          <div className="p-5">
            <h3 className="text-lg font-semibold">Ordre de résolution</h3>
            <ol className="mt-4 space-y-3">
              {['Opposées', 'Placements certains', 'S’il reste 2 choix : anneau', 'Vérifier le miroir', 'Orienter les symboles'].map((label, index) => (
                <li key={label} className="flex items-center gap-3 text-sm text-zinc-200">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-zinc-800 font-mono text-xs text-sky-300">{index + 1}</span>
                  {label}
                </li>
              ))}
            </ol>
            <Link to="/cubes/guided" className="mt-5 inline-flex rounded-lg border border-sky-700 px-4 py-2 text-sm font-semibold text-sky-200 hover:bg-sky-950/40">Résoudre avec moi</Link>
          </div>
          <div className="border-t border-zinc-800 bg-zinc-950/35 p-5 lg:border-l lg:border-t-0">
            <h3 className="text-lg font-semibold">Tes sous-compétences</h3>
            <div className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {stats.map((stat) => (
                <div key={stat.skill} className="border-b border-zinc-800/70 pb-2">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm text-zinc-300">{SKILL_LABEL[stat.skill]}</span>
                    <span className="font-mono text-sm font-semibold text-zinc-100">{stat.accuracy === null ? '—' : `${Math.round(stat.accuracy * 100)} %`}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-zinc-600">{stat.sampleSufficient ? `${stat.attempts} observations récentes` : `échantillon faible · ${stat.attempts}/5`}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {weakness && (
        <section className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-amber-950/25 p-4">
          <div>
            <h3 className="font-semibold text-amber-200">Ton problème principal aujourd’hui : {SKILL_LABEL[weakness.skill]}</h3>
            <p className="mt-1 text-sm text-amber-100/70">{weakness.correct}/{weakness.attempts} réussites sur les observations récentes.</p>
          </div>
          {SKILL_DRILL[weakness.skill] === 'full-puzzle' ? (
            <button onClick={launchFull} className="rounded-lg bg-amber-500 px-4 py-2 font-semibold text-zinc-950 hover:bg-amber-400">Refaire des planches</button>
          ) : (
            <Link to={`/cubes/drill/${SKILL_DRILL[weakness.skill]}`} className="rounded-lg bg-amber-500 px-4 py-2 font-semibold text-zinc-950 hover:bg-amber-400">Driller {SKILL_LABEL[weakness.skill].toLowerCase()}</Link>
          )}
        </section>
      )}

      <section className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold">Drills ciblés</h3>
            <p className="mt-1 text-sm text-zinc-500">5 ou 10 questions, correction immédiate.</p>
          </div>
          <Link to="/cubes/history" className="text-sm text-sky-400 hover:underline">Historique des corrections</Link>
        </div>
        <div className="mt-4 divide-y divide-zinc-800 overflow-hidden rounded-xl bg-zinc-900/55 md:grid md:grid-cols-2 md:divide-x md:divide-y-0">
          {DRILLS.map((drill, index) => (
            <Link key={drill.type} to={`/cubes/drill/${drill.type}`} className={`group flex items-center justify-between gap-4 p-4 hover:bg-zinc-800/70 ${index >= 2 ? 'md:border-t md:border-zinc-800' : ''}`}>
              <div>
                <h4 className="font-semibold text-zinc-100 group-hover:text-sky-300">{drill.title}</h4>
                <p className="mt-1 text-sm text-zinc-500">{drill.description}</p>
              </div>
              <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-zinc-600 group-hover:text-sky-400" aria-hidden><path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl bg-zinc-900/55 p-5">
          <h3 className="text-lg font-semibold">Patron actuel à connaître</h3>
          <p className="mt-1 text-sm text-zinc-500">Le jeu utilise la croix U / L-F-R-B / D. Les relations viennent de sa géométrie, pas d’une table mémorisée.</p>
          <div className="mt-4"><OppositePairsDiagram cube={reference} /></div>
        </div>
        <div className="rounded-xl bg-zinc-900/55 p-5">
          <h3 className="text-lg font-semibold">Pourquoi la lettre tourne ?</h3>
          <p className="mt-1 text-sm text-zinc-500">Le côté visible change ; l’arête physique qui touche le voisin reste la même.</p>
          {rotationDemo && <div className="mt-4"><CubeRotationExplanation diagnostic={rotationDemo.diagnostic} cube={rotationDemo.cube} /></div>}
        </div>
      </section>
    </div>
  );
}
