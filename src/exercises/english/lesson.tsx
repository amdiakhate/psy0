import type { Lesson } from '../../core/types';

/**
 * Leçon « Anglais présélection » : 30 QCM en 7 min 30, soit 15 s par question.
 * La méthode : trouver le marqueur, éliminer, trancher.
 */
interface Q {
  sentence: string;
  options: string[];
  correct: number;
  /** Indices des options éliminées par le marqueur. */
  killed?: number[];
  marker?: string;
}

const QUESTIONS: Record<string, Q> = {
  grammar: {
    sentence: 'She ___ to Paris last week.',
    options: ['has gone', 'went', 'goes', 'was going'],
    correct: 1,
    killed: [0, 2],
    marker: 'last week',
  },
  since: {
    sentence: 'He has worked here ___ 2019.',
    options: ['for', 'since', 'during', 'from'],
    correct: 1,
    marker: '2019 = un point de départ',
  },
  aviation: {
    sentence: 'The aircraft was cleared to land on ___ 27 left.',
    options: ['the runway', 'the taxiway', 'the apron', 'the gate'],
    correct: 0,
    marker: 'cleared to land',
  },
  comprehension: {
    sentence: 'The flight was delayed due to fog. — Why was the flight late?',
    options: ['Because of the weather', 'Because of a strike', 'Because of the crew', 'Because of traffic'],
    correct: 0,
    marker: 'due to fog',
  },
};

function Card({ q, reveal, showKilled }: { q: Q; reveal?: boolean; showKilled?: boolean }) {
  return (
    <div className="w-full max-w-lg">
      <p className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-lg text-zinc-100">
        {q.marker
          ? q.sentence.split(new RegExp(`(${q.marker.split(' =')[0]})`, 'i')).map((part, i) =>
              part.toLowerCase() === q.marker!.split(' =')[0].toLowerCase() ? (
                <mark key={i} className="rounded bg-amber-500/30 px-1 text-amber-200">
                  {part}
                </mark>
              ) : (
                <span key={i}>{part}</span>
              ),
            )
          : q.sentence}
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {q.options.map((opt, i) => {
          const killed = showKilled && q.killed?.includes(i);
          const good = reveal && i === q.correct;
          return (
            <div
              key={i}
              className={`rounded-md border px-3 py-2 text-sm ${
                good
                  ? 'border-green-500 bg-green-950/40 text-green-200'
                  : killed
                    ? 'border-red-900 text-zinc-600 line-through'
                    : 'border-zinc-700 text-zinc-300'
              }`}
            >
              {opt}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Scene({ scene }: { scene: string; stepIndex: number }) {
  if (scene === 'timing') {
    return (
      <div className="text-center">
        <p className="font-mono text-5xl font-bold text-sky-400">15 s</p>
        <p className="mt-2 text-zinc-300">par question — 30 questions en 7 min 30</p>
        <p className="mt-4 max-w-md text-sm text-zinc-500">
          Le test cherche l’automatisme, pas la réflexion : à ce rythme, une question qu’on
          « travaille » est une question perdue, et deux autres avec elle.
        </p>
      </div>
    );
  }
  if (scene === 'marker') return <Card q={QUESTIONS.grammar} />;
  if (scene === 'kill') return <Card q={QUESTIONS.grammar} showKilled />;
  if (scene === 'decide') return <Card q={QUESTIONS.grammar} showKilled reveal />;
  if (scene === 'since') return <Card q={QUESTIONS.since} reveal />;
  if (scene === 'aviation') return <Card q={QUESTIONS.aviation} reveal />;
  return <Card q={QUESTIONS.comprehension} reveal />;
}

export const lesson: Lesson = {
  reality: {
    atFirst:
      "Les premières séries, tu traduiras mentalement — et tu dépasseras les 15 s sur la moitié des questions. C’est le mécanisme même que le test cherche à départager. La méthode du marqueur ne devient rapide qu’une fois la table des marqueurs sue par cœur, pas comprise : apprends-la comme une liste, pas comme une règle.",
    budget:
      "15 s par question suppose que tu reconnais le marqueur sans le chercher. Au début, compte 25 s sur les questions de temps verbaux et 8 s sur le vocabulaire — le total tient quand même, parce que le lexique va très vite.",
    fallback: [
      "Tu ne trouves pas le marqueur : élimine les deux options les plus improbables et choisis entre les deux restantes. Une chance sur deux vaut mieux qu’une sur quatre.",
      "Sur une question de vocabulaire que tu ne sais pas, ne réfléchis pas : le mot manquant n’apparaîtra pas. Choisis et passe immédiatement.",
      "Sur la compréhension, lis LA QUESTION d’abord, puis cherche le seul mot-clé dans le texte. Ne lis jamais le texte en entier.",
    ],
    recover:
      "Rien ne s’enchaîne ici : une question ratée n’en abîme aucune autre. Le vrai risque est le décrochage de rythme — si tu sens que tu traînes, force-toi à répondre aux trois suivantes en moins de 10 s chacune pour te recaler.",
    bail:
      "Ce que tu sais, tu le sais en 3 secondes. Au-delà, la réponse ne viendra pas : élimine ce que tu peux, choisis, passe. Il n’y a pas de point négatif — une case cochée au hasard vaut toujours mieux qu’une case vide.",
  },
  title: 'Trouver le marqueur, éliminer, trancher',
  intro:
    '30 questions en 7 min 30, soit 15 secondes chacune. À ce rythme la réponse doit relever du réflexe. La bonne nouvelle : la grande majorité des questions de grammaire se résolvent avec UN seul élément de la phrase — le marqueur.',
  Scene,
  steps: [
    {
      scene: 'timing',
      title: 'Le rythme impose la méthode',
      observe: '15 secondes par question. Pas le temps de traduire mentalement, encore moins d’hésiter.',
      why: 'Le test est conçu pour distinguer ceux qui « savent » de ceux qui reconstruisent. Toute méthode qui demande de réfléchir à la règle est trop lente : il faut une procédure mécanique.',
      action: 'Découpe chaque question : 3 s pour le marqueur, 4 s pour éliminer, 3 s pour trancher. Le reste est de la marge.',
    },
    {
      scene: 'marker',
      title: 'Étape 1 — repérer le marqueur',
      observe:
        '« She ___ to Paris last week. » Le marqueur, c’est « last week » : un moment précis, terminé, dans le passé.',
      why: 'Le marqueur décide du temps, pas l’oreille. Table à connaître par cœur : yesterday / last week / ago / in 1990 → prétérit ; since / for / already / yet / just / ever → present perfect ; while + action en cours → past continuous ; tomorrow / next week → will ou going to ; every day / usually → présent simple.',
      action: 'Cherche le marqueur AVANT de lire les options. Elles sont faites pour t’influencer.',
    },
    {
      scene: 'kill',
      title: 'Étape 2 — éliminer avec le marqueur',
      observe:
        '« has gone » (present perfect) et « goes » (présent simple) sont incompatibles avec un moment passé et terminé. Deux options tombent d’un coup.',
      why: 'Les distracteurs sont plausibles HORS contexte — c’est leur seule force. Confrontés au marqueur, ils deviennent grammaticalement impossibles.',
      pitfall:
        '« Ça sonne bien » : les distracteurs sont choisis pour sonner naturel à une oreille française. Seul le marqueur fait foi.',
    },
    {
      scene: 'decide',
      title: 'Étape 3 — trancher entre les survivantes',
      observe:
        'Restent « went » et « was going ». Le prétérit simple décrit l’action terminée ; le past continuous décrirait une action en cours interrompue, ce que rien n’indique ici. Réponse : went.',
      why: 'Entre deux formes compatibles, choisis la plus SIMPLE qui satisfait le marqueur. Le test ne récompense jamais la subtilité inutile.',
    },
    {
      scene: 'since',
      title: 'Le piège récurrent : since vs for',
      observe: '« He has worked here since 2019. » — since + point de départ, for + durée (for two years).',
      why: 'C’est le distracteur favori des QCM parce que les deux se traduisent par « depuis » en français. La distinction est mécanique : une DATE ou un ÉVÉNEMENT → since ; une DURÉE → for.',
      action: 'Verrouille cette paire une bonne fois : c’est un point gratuit à chaque fois qu’il tombe.',
    },
    {
      scene: 'aviation',
      title: 'Le vocabulaire aviation',
      observe:
        '« cleared to land on the runway 27 left. » On atterrit sur une piste (runway), pas sur un taxiway (voie de circulation) ni sur une aire de stationnement (apron).',
      why: 'Ce lexique est fermé et se sait par cœur : runway, taxiway, clearance (autorisation), take-off, landing, approach, holding pattern (circuit d’attente), fuel, crew, altitude, heading (cap), airspeed, tailwind / headwind, delay, divert (dérouter).',
      action: 'Relis cette liste avant chaque session : 10 minutes par jour rapportent plus que 30 minutes de QCM en plus.',
      pitfall:
        'Les faux-amis : actually = en réalité (« actuellement » = currently), library = bibliothèque, attend = assister à. Méfiance sur tout mot transparent.',
    },
    {
      scene: 'comprehension',
      title: 'La compréhension : lire la question d’abord',
      observe:
        '« The flight was delayed due to fog. — Why was the flight late? » On cherche une cause : « due to fog » → la météo.',
      why:
        'Ne comprends pas le texte : EXTRAIS l’information demandée. Lire la question en premier transforme un exercice de compréhension en une recherche ciblée (because / due to / in order to…).',
      action:
        'Et pour finir : ce que tu sais, tu le sais en 3 secondes. Au-delà, élimine les options absurdes, choisis, et passe — le temps passé ne fait pas apparaître le vocabulaire manquant.',
    },
  ],
};
