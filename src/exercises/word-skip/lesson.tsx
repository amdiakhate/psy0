import type { Lesson } from '../../core/types';

/**
 * Leçon « Un mot sur deux » : la chaîne alternée sur grille, avec le tri
 * initial en deux files alphabétiques — la clé de tout l'exercice.
 */
interface W {
  word: string;
  theme: 0 | 1;
  x: number;
  y: number;
  start?: boolean;
}

const WORDS: W[] = [
  { word: 'ASTROLABE', theme: 1, x: 18, y: 20, start: true },
  { word: 'OPUS', theme: 0, x: 62, y: 14 },
  { word: 'NEUTRON', theme: 1, x: 80, y: 42 },
  { word: 'ARIA', theme: 0, x: 40, y: 46 },
  { word: 'RADIANT', theme: 1, x: 14, y: 62 },
  { word: 'SOUPIR', theme: 0, x: 66, y: 70 },
  { word: 'NOYAU', theme: 1, x: 38, y: 82 },
  { word: 'TREMOLO', theme: 0, x: 84, y: 84 },
];

/** L'ordre officiel : ASTROLABE (start) puis ARIA, NEUTRON, OPUS, NOYAU, SOUPIR, RADIANT, TREMOLO. */
const CHAIN = ['ARIA', 'NEUTRON', 'OPUS', 'NOYAU', 'SOUPIR', 'RADIANT', 'TREMOLO'];

const THEME_LABEL = ['Musique classique', 'Science physique'];

function Grid({ done, next, sorted }: { done: number; next?: string; sorted?: boolean }) {
  const rank = (w: string) => CHAIN.indexOf(w);
  return (
    <div>
      {sorted && (
        <div className="mb-3 grid grid-cols-2 gap-3 text-xs">
          {[0, 1].map((t) => (
            <div key={t} className={`rounded-lg border p-2 ${t === 0 ? 'border-sky-700' : 'border-violet-700'}`}>
              <p className={t === 0 ? 'text-sky-400' : 'text-violet-400'}>{THEME_LABEL[t]}</p>
              <p className="mt-1 font-mono text-zinc-300">
                {WORDS.filter((w) => w.theme === t)
                  .map((w) => w.word)
                  .sort()
                  .join(' → ')}
              </p>
            </div>
          ))}
        </div>
      )}
      <div className="relative h-56 w-full rounded-lg border border-zinc-800 bg-zinc-950">
        {WORDS.map((w) => {
          const r = rank(w.word);
          const validated = r >= 0 && r < done;
          const isNext = w.word === next;
          return (
            <span
              key={w.word}
              style={{ left: `${w.x}%`, top: `${w.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-md border px-2 py-1 font-mono text-xs ${
                validated
                  ? 'border-green-600 bg-green-950/50 text-green-300'
                  : isNext
                    ? 'border-amber-500 bg-amber-950/40 text-amber-200'
                    : w.start
                      ? 'border-zinc-400 bg-zinc-800 text-zinc-100'
                      : w.theme === 0
                        ? 'border-sky-800 text-sky-200'
                        : 'border-violet-800 text-violet-200'
              }`}
            >
              {w.word}
              {w.start && <span className="ml-1 text-[9px] text-zinc-400">START</span>}
              {validated && <span className="ml-1 text-[9px]">#{r + 1}</span>}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function Scene({ scene }: { scene: string; stepIndex: number }) {
  if (scene === 'raw') return <Grid done={0} />;
  if (scene === 'sorted') return <Grid done={0} sorted />;
  if (scene === 'first') return <Grid done={0} next="ARIA" sorted />;
  if (scene === 'second') return <Grid done={1} next="NEUTRON" sorted />;
  if (scene === 'mid') return <Grid done={3} next="NOYAU" sorted />;
  return <Grid done={CHAIN.length} />;
}

export const lesson: Lesson = {
  reality: {
    atFirst:
      "« Construis les deux files dans ta tête » donne l’impression que tout le monde y arrive sauf toi. Personne n’y arrive : huit mots triés en deux listes ne tiennent PAS dans une mémoire humaine, et prétendre le contraire ne rend service à personne. Ce qui tient, c’est DEUX mots — le dernier joué de chaque thématique — et la grille reste sous tes yeux pour le reste.",
    budget:
      "Compte 10 s de lecture initiale plutôt que 5. Le but de cette lecture n’est pas de mémoriser : c’est de savoir OÙ sont les mots de chaque thématique à l’écran, et lesquels ouvrent chaque file. Ensuite tu ne retiens que deux mots à la fois et tu relis la grille autant que nécessaire — elle est ta mémoire externe.",
    fallback: [
      "Tu ne sais plus où tu en es : regarde les deux derniers mots cliqués. Ils donnent la thématique à jouer et le seuil alphabétique à dépasser. C’est toute l’information nécessaire.",
      "Deux mots à même initiale (FRISE / FRONTON) : compare lettre à lettre, FRI < FRO. Ni la longueur, ni la position à l’écran ne veulent rien dire.",
      "Sous pression, ralentis. Une erreur renvoie au début de la série : chaque seconde « gagnée » se paie dix fois.",
    ],
    recover:
      "Après une erreur, tu reprends la série mais pas ton travail : la grille n’a pas bougé et tu connais déjà les premiers coups. Rejoue-les vite, sans les revérifier, puis reprends au rythme normal. C’est la précipitation post-erreur qui déclenche la deuxième reprise — jamais la lenteur.",
    bail:
      "Rien ne s’abandonne : la série ne se termine que réussie. La seule décision utile est de ralentir dès la deuxième reprise. Une série finie lentement vaut mieux que trois séries recommencées vite.",
  },
  title: 'Deux files alphabétiques qu’on dépile en alternance',
  intro:
    'Exemple officiel du test : deux thématiques, « Musique classique » et « Science physique », mélangées sur la grille. En partant de START, on clique alternativement un mot de chaque thématique, en respectant l’ordre alphabétique DANS chaque thématique. Toute erreur renvoie au début.',
  Scene,
  steps: [
    {
      scene: 'raw',
      title: 'La grille brute',
      observe:
        'Huit mots éparpillés, deux thématiques mélangées, un mot marqué START (ASTROLABE). La disposition à l’écran ne veut rien dire : elle est là pour te désorganiser.',
      why: 'La tentation est de chercher « le mot suivant » directement sur la grille, en balayant des yeux. C’est la garantie d’une erreur — et une erreur renvoie au tout début de la série.',
      pitfall: 'Cliquer avant d’avoir trié. Le premier clic ne doit venir qu’après le tri mental complet.',
    },
    {
      scene: 'sorted',
      title: 'Étape 1 — le tri initial (5 à 8 s)',
      observe:
        'Une seule passe sur la grille, et on RANGE DES YEUX : Musique = ARIA, OPUS, SOUPIR, TREMOLO. Physique = ASTROLABE, NEUTRON, NOYAU, RADIANT. Le but n’est pas d’apprendre ces listes par cœur — c’est de savoir OÙ elles sont à l’écran, et lequel ouvre chaque file.',
      why: 'Huit mots triés en deux listes ne tiennent pas dans une mémoire humaine, et essayer de les y mettre coûte le temps de toute la série. Ce qu’on retient réellement est bien plus léger : DEUX mots, le dernier joué de chaque thématique. La grille reste sous tes yeux — c’est elle, ta mémoire.',
      action: 'Repère seulement les deux mots qui ouvrent chaque file, et les zones de l’écran où chaque thématique se concentre. Le reste, tu le reliras au fur et à mesure.',
    },
    {
      scene: 'first',
      title: 'Étape 2 — le START ne se clique pas',
      observe:
        'ASTROLABE porte le START et appartient à Physique. Il compte comme le premier mot de sa file, mais il est déjà acquis : on ne le clique pas.',
      why: 'Puisque le START occupe le premier tour de Physique, le premier clic est forcément dans l’AUTRE thématique — Musique — et sur son plus petit mot alphabétiquement : ARIA.',
      action: 'Premier clic : ARIA. Jamais le START.',
      pitfall: 'Cliquer le START « pour commencer » est l’erreur classique de la toute première série.',
    },
    {
      scene: 'second',
      title: 'Étape 3 — l’alternance stricte',
      observe:
        'Après ARIA (Musique), on retourne obligatoirement en Physique, sur le mot qui suit ASTROLABE dans sa file : NEUTRON.',
      why: 'Deux contraintes se combinent à chaque coup : changer de thématique ET prendre le suivant immédiat de la file concernée. Verbalise le rythme « Musique – Physique – Musique… » pendant que tu cliques.',
      pitfall:
        'Enchaîner deux mots de la même thématique parce que l’un « saute aux yeux ». La disposition est un leurre.',
    },
    {
      scene: 'mid',
      title: 'Étape 4 — dépiler sans relire',
      observe:
        'ARIA, NEUTRON, OPUS sont validés. Le suivant est NOYAU : c’est le mot de Physique qui suit NEUTRON. Aucune relecture de la grille n’est nécessaire.',
      why: 'Ta mémoire de travail ne porte jamais que deux choses : le dernier mot joué en Musique, le dernier joué en Physique. Le mot suivant se RELIT sur la grille — « le plus petit de cette thématique après celui-là » — au lieu de se rappeler. Deux items tenus, c’est soutenable ; huit ne l’est pas.',
      action: 'Anticipe : pendant que tu cliques, ton œil cherche déjà, sur la grille, le suivant de l’autre thématique.',
    },
    {
      scene: 'done',
      title: 'La chaîne complète',
      observe:
        'ARIA, NEUTRON, OPUS, NOYAU, SOUPIR, RADIANT, TREMOLO — l’ordre officiel de l’exemple Pilotest. La série se termine en Musique parce que le START avait « consommé » le premier tour de Physique.',
      why:
        'Avec un nombre impair de mots restants, la thématique du START en compte un de moins à cliquer. Le savoir à l’avance évite de chercher un mot supplémentaire qui n’existe pas.',
      action:
        'Sur les mots à même initiale (FRISE / FRONTON), compare lettre à lettre : FRI < FRO. Ne te fie ni à la longueur ni à la position à l’écran.',
    },
  ],
};
