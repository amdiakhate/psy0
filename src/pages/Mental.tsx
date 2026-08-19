import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MasteryChip, MentalDrill } from '../mental/MentalDrill';
import { DRILL_COUNT, MELEE_COUNT, composeDrill, composeMelee } from '../mental/drill';
import { assess, assessAll, loadProgress, responseModeFor, statOf } from '../mental/progress';
import { getPrefs } from '../core/prefs';
import { FAMILY_ORDER, TECHNIQUES, techniqueById, techniquesOf } from '../mental/techniques';
import type { Technique } from '../mental/techniques';
import { TechniqueDiagram } from '../mental/diagrams';
import { IO_FLOOR } from '../mental/techniques';
import { mulberry32 } from '../core/rng';

/**
 * Atelier de calcul mental.
 *
 * Séparé des 16 exercices à dessein : ce n'est pas une épreuve du PSY0, c'est le
 * socle sur lequel deux d'entre elles reposent — les Grilles de calculs, qui
 * sont infaisables sans raccourcis, et le Psychomoteur, où il faut juger un
 * calcul tout en poursuivant le cercle. Rien de ce qui se passe ici n'entre
 * dans les rotations, les priorités ni la stanine.
 */

interface Running {
  ids: string[];
  title: string;
  subtitle: string;
}

export default function Mental() {
  const { id } = useParams<{ id: string }>();
  const [running, setRunning] = useState<Running | null>(null);
  const navigate = useNavigate();
  // Rechargé à chaque fin de séance : le drill écrit dans localStorage.
  const [version, setVersion] = useState(0);
  const progress = useMemo(() => loadProgress(), [version]);

  if (running) {
    return (
      <MentalDrill
        ids={running.ids}
        title={running.title}
        subtitle={running.subtitle}
        onExit={() => {
          setRunning(null);
          setVersion((v) => v + 1);
        }}
      />
    );
  }

  const startDrill = (technique: Technique) =>
    setRunning({
      ids: composeDrill(technique.id, DRILL_COUNT),
      title: technique.name,
      // L'objectif dépend du mode, qui dépend de la maîtrise : l'annoncer ici
      // avec la valeur « produire » contredirait celui que le drill affiche.
      subtitle: `${DRILL_COUNT} items sur cette seule technique. ${
        responseModeFor(
          getPrefs().mentalResponse,
          assess(statOf(progress, technique.id), technique.targetMs).level,
        ) === 'qcm'
          ? 'Acquise : on passe au QCM, le geste réel de l’épreuve, pour gagner en vitesse.'
          : 'Réponse à taper : produire interdit de deviner par élimination, et c’est ce qui installe la technique.'
      }`,
    });

  const technique = id ? techniqueById(id) : null;
  if (id && !technique) {
    return (
      <div className="max-w-3xl">
        <p className="text-zinc-400">Technique inconnue.</p>
        <Link to="/mental" className="mt-3 inline-block text-sky-400 hover:underline">
          ← Retour à l’atelier
        </Link>
      </div>
    );
  }

  if (technique) {
    const verdict = assess(statOf(progress, technique.id), technique.targetMs);
    return (
      <div className="max-w-3xl">
        <Link to="/mental" className="text-sm text-sky-400 hover:underline">
          ← Toutes les techniques
        </Link>
        <div className="mt-2 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-zinc-500">{technique.family}</p>
            <h2 className="text-2xl font-bold">{technique.name}</h2>
          </div>
          <MasteryChip level={verdict.level} />
        </div>

        <p className="mt-4 rounded-xl border border-sky-900/60 bg-sky-950/20 p-4 text-lg text-sky-100">
          {technique.rule}
        </p>

        {/* Le schéma AVANT le texte : une règle comme « les dizaines se
            complètent à 9 » n'est qu'une incantation tant qu'on ne voit pas
            d'où sort le 9. */}
        {technique.diagram && (
          <div className="mt-4">
            <TechniqueDiagram diagram={technique.diagram} />
          </div>
        )}

        <Section title="Pourquoi ça marche" accent="text-green-400">
          <p className="text-zinc-200">{technique.why}</p>
        </Section>

        <Section title="La procédure" accent="text-sky-400">
          <ol className="space-y-1.5">
            {technique.steps.map((s, i) => (
              <li key={i} className="flex gap-3 text-zinc-200">
                <span className="w-5 shrink-0 text-right font-mono text-zinc-600">{i + 1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </Section>

        <WorkedExamples technique={technique} />

        <Section title="Quand l’utiliser" accent="text-amber-400">
          <p className="text-zinc-200">{technique.when}</p>
        </Section>

        <Section title="Ce que ça rapporte au PSY0" accent="text-zinc-400">
          <p className="text-zinc-200">{technique.psy0}</p>
        </Section>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            onClick={() => startDrill(technique)}
            className="rounded-lg bg-sky-600 px-6 py-2.5 font-semibold hover:bg-sky-500"
          >
            Drill {DRILL_COUNT} items
          </button>
          <p className="text-sm text-zinc-500">
            Objectif : <span className="text-zinc-300">{(technique.targetMs / 1000).toFixed(1)} s</span> par
            item, de bout en bout — dont environ{' '}
            {(IO_FLOOR[technique.answerInput] / 1000).toFixed(1)} s pour lire l’énoncé et{' '}
            {technique.answerInput === 'keyed' ? 'appuyer sur la touche' : 'taper la réponse'}. Il te
            reste donc {((technique.targetMs - IO_FLOOR[technique.answerInput]) / 1000).toFixed(1)} s
            pour réfléchir.
            {verdict.medianMs !== null && ` Tes derniers essais justes : ${(verdict.medianMs / 1000).toFixed(1)} s.`}
          </p>
        </div>
      </div>
    );
  }

  const all = assessAll(progress);
  const acquises = all.filter((a) => a.verdict.level === 'acquis').length;
  const melee = composeMelee(
    all.map((a) => ({ id: a.technique.id, mastery: a.verdict.level })),
    MELEE_COUNT,
  );

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold">Calcul mental</h2>
      <p className="mt-1 text-zinc-400">
        {TECHNIQUES.length} techniques nommées, drillées séparément puis mélangées. Ce n’est pas une
        épreuve du PSY0 : c’est le socle des Grilles de calculs — 9 calculs en 45 s, impossible sans
        raccourcis — et des calculs du Psychomoteur.
      </p>

      <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
        <div className="flex items-baseline justify-between">
          <p className="text-sm font-semibold uppercase tracking-widest text-zinc-500">Techniques acquises</p>
          <p className="font-mono text-lg">
            <span className="text-sky-400">{acquises}</span>
            <span className="text-zinc-500"> / {TECHNIQUES.length}</span>
          </p>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full bg-sky-600 transition-[width] duration-500"
            style={{ width: `${Math.round((acquises / TECHNIQUES.length) * 100)}%` }}
          />
        </div>
        <p className="mt-3 text-sm text-zinc-500">
          Une technique n’est acquise que si elle est juste ET rapide : au test, hésiter coûte autant
          que se tromper.
        </p>
        <button
          onClick={() =>
            setRunning({
              ids: melee,
              title: 'Mêlée',
              subtitle: `${MELEE_COUNT} items entrelacés — la difficulté est de reconnaître laquelle s’applique.`,
            })
          }
          className="mt-4 rounded-lg bg-sky-600 px-6 py-2.5 font-semibold hover:bg-sky-500"
        >
          Mêlée — {MELEE_COUNT} items
        </button>
        <p className="mt-2 text-xs text-zinc-600">
          Les techniques fragiles reviennent plus souvent, les acquises restent en entretien.
        </p>
      </div>

      {FAMILY_ORDER.map((family) => (
        <section key={family} className="mt-8">
          <h3 className="text-lg font-semibold">{family}</h3>
          <div className="mt-3 space-y-2">
            {techniquesOf(family).map((t) => {
              const verdict = assess(statOf(progress, t.id), t.targetMs);
              return (
                <div
                  key={t.id}
                  className="flex items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-900/60 p-4"
                >
                  <div className="min-w-0 flex-1">
                    <button
                      onClick={() => navigate(`/mental/${t.id}`)}
                      className="text-left font-medium hover:text-sky-400"
                    >
                      {t.name}
                    </button>
                    <p className="mt-0.5 text-sm text-zinc-500">{t.rule}</p>
                  </div>
                  <MasteryChip level={verdict.level} />
                  <button
                    onClick={() => startDrill(t)}
                    className="shrink-0 rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:border-sky-500 hover:text-sky-300"
                  >
                    Drill
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

/**
 * Trois exemples travaillés, tirés du VRAI générateur.
 *
 * Ils ne sont pas rédigés à la main : ce sont des items que le drill peut
 * poser, avec le pas-à-pas que la correction afficherait. Un exemple écrit à
 * part finirait par diverger de ce que l'exercice propose — ici c'est
 * impossible par construction.
 */
function WorkedExamples({ technique }: { technique: Technique }) {
  const examples = useMemo(
    () => [7, 23, 61].map((seed) => technique.generate(mulberry32(seed))),
    [technique],
  );

  return (
    <div className="mt-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">
        Trois exemples, déroulés
      </p>
      <div className="mt-2 space-y-3">
        {examples.map((item, i) => (
          <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
            <p className="font-mono text-xl font-bold text-zinc-100">
              {item.prompt}
              <span className="ml-3 text-base font-normal text-green-400">
                {item.kind === 'value' || item.kind === 'letter'
                  ? `= ${item.answer}`
                  : item.wrong
                    ? '→ FAUX'
                    : '→ JUSTE'}
              </span>
            </p>
            <ol className="mt-2 space-y-1">
              {item.walkthrough.map((line, j) => (
                <li key={j} className="flex gap-3 text-sm text-zinc-300">
                  <span className="w-4 shrink-0 text-right font-mono text-zinc-600">{j + 1}</span>
                  <span>{line}</span>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
}

function Section({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <p className={`text-xs font-semibold uppercase tracking-widest ${accent}`}>{title}</p>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
