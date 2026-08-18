import type { Lesson } from '../../core/types';

/**
 * Leçon « Pair ou impair » : même mécanique de chaîne alternée que
 * « Un mot sur deux », mais sur la parité + l'ordre croissant.
 * Exemple officiel : 54 → 27, 678, 327, 764, 545, 816, 619, 952, 755.
 */
interface N {
  value: number;
  x: number;
  y: number;
  start?: boolean;
}

const NUMBERS: N[] = [
  { value: 54, x: 20, y: 18, start: true },
  { value: 678, x: 66, y: 12 },
  { value: 27, x: 44, y: 30 },
  { value: 764, x: 84, y: 34 },
  { value: 327, x: 14, y: 46 },
  { value: 545, x: 60, y: 52 },
  { value: 816, x: 30, y: 66 },
  { value: 952, x: 78, y: 66 },
  { value: 619, x: 16, y: 84 },
  { value: 755, x: 54, y: 86 },
];

const CHAIN = [27, 678, 327, 764, 545, 816, 619, 952, 755];

function Grid({ done, next, sorted }: { done: number; next?: number; sorted?: boolean }) {
  const evens = NUMBERS.filter((n) => n.value % 2 === 0).map((n) => n.value).sort((a, b) => a - b);
  const odds = NUMBERS.filter((n) => n.value % 2 === 1).map((n) => n.value).sort((a, b) => a - b);
  return (
    <div>
      {sorted && (
        <div className="mb-3 grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-lg border border-sky-700 p-2">
            <p className="text-sky-400">Pairs (croissants)</p>
            <p className="mt-1 font-mono text-zinc-300">{evens.join(' → ')}</p>
          </div>
          <div className="rounded-lg border border-violet-700 p-2">
            <p className="text-violet-400">Impairs (croissants)</p>
            <p className="mt-1 font-mono text-zinc-300">{odds.join(' → ')}</p>
          </div>
        </div>
      )}
      <div className="relative h-56 w-full rounded-lg border border-zinc-800 bg-zinc-950">
        {NUMBERS.map((n) => {
          const r = CHAIN.indexOf(n.value);
          const validated = r >= 0 && r < done;
          const isNext = n.value === next;
          const even = n.value % 2 === 0;
          return (
            <span
              key={n.value}
              style={{ left: `${n.x}%`, top: `${n.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-md border px-2.5 py-1 font-mono text-sm tabular-nums ${
                validated
                  ? 'border-green-600 bg-green-950/50 text-green-300'
                  : isNext
                    ? 'border-amber-500 bg-amber-950/40 text-amber-200'
                    : n.start
                      ? 'border-zinc-400 bg-zinc-800 text-zinc-100'
                      : even
                        ? 'border-sky-800 text-sky-200'
                        : 'border-violet-800 text-violet-200'
              }`}
            >
              {n.value}
              {n.start && <span className="ml-1 text-[9px] text-zinc-400">START</span>}
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
  if (scene === 'first') return <Grid done={0} next={27} sorted />;
  if (scene === 'second') return <Grid done={1} next={678} sorted />;
  if (scene === 'mid') return <Grid done={4} next={545} sorted />;
  return <Grid done={CHAIN.length} />;
}

export const lesson: Lesson = {
  reality: {
    atFirst:
      "Le tri « en une passe » donne l’impression que tout le monde y arrive sauf toi. Personne n’y arrive : dix nombres triés en deux files ne tiennent PAS dans une mémoire humaine. Ce qui tient, c’est deux nombres — le dernier pair et le dernier impair joués — et l’écran fait le reste.",
    budget:
      "Compte 8 à 10 s de lecture initiale, pas 5. Et ne cherche pas à mémoriser : cherche à REPÉRER, c’est-à-dire à savoir où se trouvent les petits nombres de chaque parité. La grille reste sous tes yeux pendant toute la série : elle est ta mémoire externe.",
    fallback: [
      "Tu ne sais plus où tu en es : relis simplement les deux derniers nombres cliqués. Ils te donnent la parité à jouer et le seuil à dépasser — c’est toute l’information nécessaire.",
      "Deux nombres proches de même parité (470 / 472) : compare les unités et rien d’autre. La longueur à l’écran est un leurre.",
      "Sous pression, ralentis au lieu d’accélérer. Une erreur renvoie au début de la série : le temps « gagné » se paie dix fois.",
    ],
    recover:
      "Après une erreur, tu reprends la série — mais pas ton travail : la grille n’a pas changé, et tu connais déjà les premiers coups. Rejoue le premier tiers vite et sans le revérifier, puis reprends au rythme normal. C’est la précipitation post-erreur qui déclenche la deuxième reprise, jamais la lenteur.",
    bail:
      "Rien ne s’abandonne : la série ne se termine que réussie. La seule décision qui compte est de ralentir dès la deuxième reprise — une série finie lentement vaut toutes les séries recommencées.",
  },
  title: 'Alterner pair/impair en restant croissant',
  intro:
    'Exemple officiel du test : en partant de 54 (START), on clique alternativement un nombre pair puis un impair, chaque catégorie devant rester croissante. Toute erreur renvoie au début de la série.',
  Scene,
  steps: [
    {
      scene: 'raw',
      title: 'La grille brute',
      observe:
        'Dix nombres dispersés, de 2 à 3 chiffres, un marqué START (54). Aucune structure visible : les nombres proches à l’écran n’ont aucun rapport entre eux.',
      why: 'Chercher « le suivant » directement sur la grille condamne à l’erreur, et une erreur renvoie au tout début. La grille se lit une fois, pour trier — pas pour jouer.',
      pitfall: 'Commencer à cliquer avant d’avoir trié.',
    },
    {
      scene: 'sorted',
      title: 'Étape 1 — deux files, triées (5 à 8 s)',
      observe:
        'Une passe, et on repère : pairs = 54, 678, 764, 816, 952 ; impairs = 27, 327, 545, 619, 755. La parité se lit sur le DERNIER chiffre, jamais sur le nombre entier.',
      why: 'Ne cherche pas à retenir ces dix nombres : personne n’y arrive, et l’essayer consomme toute ton attention. Cette passe sert à REPÉRER — savoir où sont les petits de chaque parité, et lequel ouvre chaque file. Ensuite tu ne tiens que deux nombres en tête : le dernier pair et le dernier impair joués. La grille, elle, ne bouge pas — elle porte le reste.',
      action: 'Compare par longueur d’abord (96 < 291 < 2152), par chiffres ensuite. Pas de calcul.',
    },
    {
      scene: 'first',
      title: 'Étape 2 — le START est déjà joué',
      observe:
        '54 porte le START et il est pair : il compte comme le premier nombre de la file des pairs, et ne se clique pas.',
      why: 'Le premier clic est donc obligatoirement chez les impairs, sur le plus petit de leur file : 27.',
      action: 'Premier clic : 27.',
      pitfall: 'Cliquer 54 pour « démarrer » — il est déjà acquis.',
    },
    {
      scene: 'second',
      title: 'Étape 3 — retour chez les pairs',
      observe: 'Après 27, on revient chez les pairs, sur celui qui suit 54 : 678.',
      why: 'Deux contraintes à chaque coup : changer de parité ET prendre le suivant immédiat dans la file. L’ordre croissant vaut à l’intérieur de chaque file, jamais entre les deux. Le « suivant » se RELIT sur la grille à partir du dernier joué — c’est une recherche, pas un souvenir.',
      pitfall:
        'Prendre 764 parce qu’il est plus visible : l’ordre est strict, c’est 678 qui vient d’abord.',
    },
    {
      scene: 'mid',
      title: 'Étape 4 — le piège des valeurs proches',
      observe:
        'La chaîne avance : 27, 678, 327, 764. Le suivant est 545. Sur des nombres proches de même parité (470 / 472), seules les unités décident.',
      why: 'Le cerveau compare la largeur du nombre à l’écran plutôt que sa valeur. Repérer les paires proches DÈS LE TRI désamorce le piège avant même d’y arriver.',
      action: 'Note mentalement, pendant le tri, les couples de même parité très voisins.',
    },
    {
      scene: 'done',
      title: 'La chaîne complète',
      observe: '27, 678, 327, 764, 545, 816, 619, 952, 755 — l’ordre officiel de l’exemple Pilotest.',
      why:
        'Une erreur en fin de chaîne coûte toute la série. C’est là que la fatigue fait cliquer au hasard : repère à l’avance les deux ou trois derniers de chaque file.',
      action:
        'Après une reprise, refais le premier tiers lentement — tu le connais déjà. C’est la précipitation post-erreur qui déclenche la deuxième reprise.',
    },
  ],
};
