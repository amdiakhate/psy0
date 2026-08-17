import type { Lesson } from '../../core/types';

/**
 * Leçon « Airways » : une situation critique décortiquée, du scan des compteurs
 * jusqu'au choix de l'avion à dérouter — et pourquoi la grosse croix est un piège.
 */

const CELL = 26;
const ROW = 24;
const COLS = 18;
const span = (line: number) => (line < 3 ? { start: 7, end: 10 } : { start: 9, end: 12 });

interface P {
  col: number;
  line: number;
  color: 'blue' | 'purple';
  mark?: 'danger' | 'exiting' | 'chosen';
}

/** Situations figées de la leçon. */
const SCENES: Record<string, { planes: P[]; counters: [number, number]; faulty?: boolean }> = {
  calm: {
    planes: [
      { col: 8, line: 0, color: 'blue' },
      { col: 3, line: 4, color: 'purple' },
      { col: 14, line: 2, color: 'blue' },
    ],
    counters: [1, 1],
  },
  filling: {
    planes: [
      { col: 8, line: 0, color: 'blue' },
      { col: 10, line: 2, color: 'blue' },
      { col: 10, line: 3, color: 'purple' },
      { col: 14, line: 4, color: 'blue', mark: 'danger' },
    ],
    counters: [2, 3],
  },
  exiting: {
    planes: [
      { col: 8, line: 0, color: 'blue', mark: 'exiting' },
      { col: 10, line: 2, color: 'blue' },
      { col: 10, line: 3, color: 'purple' },
      { col: 14, line: 4, color: 'blue', mark: 'danger' },
    ],
    counters: [2, 3],
  },
  chosen: {
    planes: [
      { col: 8, line: 0, color: 'blue' },
      { col: 10, line: 2, color: 'blue' },
      { col: 10, line: 3, color: 'purple' },
      { col: 14, line: 4, color: 'blue', mark: 'chosen' },
    ],
    counters: [2, 3],
  },
  crash: {
    planes: [
      { col: 8, line: 0, color: 'blue' },
      { col: 10, line: 2, color: 'blue' },
      { col: 10, line: 3, color: 'purple' },
      { col: 10, line: 4, color: 'blue', mark: 'danger' },
    ],
    counters: [3, 4],
    faulty: true,
  },
  swept: {
    planes: [{ col: 10, line: 3, color: 'purple' }],
    counters: [0, 1],
  },
};

function AirwaysScene({ scene }: { scene: string; stepIndex: number }) {
  const data = SCENES[scene] ?? SCENES.calm;
  const W = COLS * CELL;
  const [blues, total] = data.counters;

  return (
    <div>
      <div className="mb-1 flex justify-center gap-1 font-mono text-sm">
        <span
          className={`rounded-md border px-3 py-0.5 ${
            blues > 2
              ? 'border-red-500 bg-red-950/60 font-bold text-red-300'
              : blues === 2
                ? 'border-amber-500 bg-amber-950/40 text-amber-300'
                : 'border-zinc-700 bg-zinc-900 text-zinc-300'
          }`}
        >
          {blues}/2 ◀ bleus
        </span>
        <span
          className={`rounded-md border px-3 py-0.5 ${
            total > 4
              ? 'border-red-500 bg-red-950/60 font-bold text-red-300'
              : 'border-zinc-700 bg-zinc-900 text-zinc-300'
          }`}
        >
          {total}/4 total
        </span>
      </div>
      <div className="flex items-stretch gap-1">
        <div
          className={`flex w-8 items-center justify-center rounded-lg bg-violet-500 ${
            scene === 'swept' ? 'ring-2 ring-red-500' : ''
          }`}
        >
          <BigCross />
        </div>
        <svg viewBox={`0 0 ${W} ${6 * ROW}`} className="flex-1 rounded border border-zinc-600 bg-zinc-100">
          {Array.from({ length: 6 }, (_, line) => {
            const s = span(line);
            return (
              <rect
                key={line}
                x={s.start * CELL}
                y={line * ROW}
                width={(s.end - s.start + 1) * CELL}
                height={ROW}
                fill={data.faulty ? '#f59e0b' : '#a1a1aa'}
                opacity={data.faulty ? 0.9 : 0.45}
              />
            );
          })}
          {Array.from({ length: COLS + 1 }, (_, c) => (
            <line key={`c${c}`} x1={c * CELL} y1={0} x2={c * CELL} y2={6 * ROW} stroke="#d4d4d8" strokeWidth={0.5} />
          ))}
          {Array.from({ length: 7 }, (_, r) => (
            <line key={`r${r}`} x1={0} y1={r * ROW} x2={W} y2={r * ROW} stroke="#a1a1aa" strokeWidth={0.7} />
          ))}
          {data.planes.map((p, i) => {
            const cx = p.col * CELL + CELL / 2;
            const cy = p.line * ROW + ROW / 2;
            const s = 7;
            const points =
              p.color === 'blue'
                ? `${cx - s},${cy} ${cx + s},${cy - s * 0.85} ${cx + s},${cy + s * 0.85}`
                : `${cx + s},${cy} ${cx - s},${cy - s * 0.85} ${cx - s},${cy + s * 0.85}`;
            return (
              <g key={i}>
                <polygon points={points} fill={p.color === 'blue' ? '#38bdf8' : '#7c3aed'} />
                {p.mark === 'danger' && <circle cx={cx} cy={cy} r={12} fill="none" stroke="#dc2626" strokeWidth={2} strokeDasharray="4 3" />}
                {p.mark === 'exiting' && <circle cx={cx} cy={cy} r={12} fill="none" stroke="#22c55e" strokeWidth={2} strokeDasharray="4 3" />}
                {p.mark === 'chosen' && (
                  <>
                    <circle cx={cx} cy={cy} r={12} fill="none" stroke="#22c55e" strokeWidth={2.5} />
                    <line x1={cx} y1={cy - 18} x2={W - CELL / 2} y2={p.line * ROW + ROW / 2 - 18} stroke="#22c55e" strokeWidth={1.5} strokeDasharray="3 3" />
                  </>
                )}
              </g>
            );
          })}
          {/* Petites croix : lignes contenant un bleu */}
          {[...new Set(data.planes.filter((p) => p.color === 'blue').map((p) => p.line))].map((line) => (
            <g key={line}>
              <rect x={(COLS - 1) * CELL} y={line * ROW} width={CELL} height={ROW} fill="#7dd3fc" />
              <circle cx={(COLS - 0.5) * CELL} cy={line * ROW + ROW / 2} r={6} fill="none" stroke="#fff" strokeWidth={1.5} />
              <path
                d={`M${(COLS - 0.5) * CELL - 3.5},${line * ROW + ROW / 2 - 3.5} l7,7 M${(COLS - 0.5) * CELL + 3.5},${line * ROW + ROW / 2 - 3.5} l-7,7`}
                stroke="#fff"
                strokeWidth={1.5}
              />
            </g>
          ))}
        </svg>
        <div
          className={`flex w-8 items-center justify-center rounded-lg bg-sky-300 ${
            scene === 'swept' ? 'ring-2 ring-red-500' : ''
          }`}
        >
          <BigCross />
        </div>
      </div>
    </div>
  );
}

function BigCross() {
  return (
    <svg width="20" height="20" viewBox="0 0 34 34">
      <circle cx="17" cy="17" r="15" fill="none" stroke="#fff" strokeWidth="2.5" />
      <path d="M10,10 L24,24 M24,10 L10,24" stroke="#fff" strokeWidth="2.5" />
    </svg>
  );
}

export const lesson: Lesson = {
  title: 'Lire les compteurs et choisir qui dérouter',
  intro:
    'Airways n’est pas un jeu de réflexes : c’est un jeu de comptage. Tout se décide sur deux chiffres. On déroule une situation qui dégénère, image par image, pour voir où se prend la bonne décision.',
  Scene: AirwaysScene,
  steps: [
    {
      scene: 'calm',
      title: 'Le tableau de bord : deux compteurs',
      observe:
        'Un bloc de 6 lignes, sa zone grise (en escalier : décalée entre les lignes 1-3 et 4-6), et surtout DEUX compteurs : 1/2 bleus et 1/4 au total.',
      why: 'Les compteurs disent tout : le premier est deux fois plus serré que le second. La limite bleue (2) casse presque toujours avant la limite totale (4) — c’est elle qu’on surveille en priorité.',
      action:
        'Ancre ta boucle de scan : compteurs du haut → avions qui vont entrer en haut → compteurs du bas → avions qui vont entrer en bas. Environ 2 secondes par tour.',
    },
    {
      scene: 'filling',
      title: 'Le moment critique : 2/2 bleus',
      observe:
        'Deux bleus sont maintenant dans la zone grise : le compteur affiche 2/2 en ambre. Un troisième bleu (cerclé de rouge) arrive par la droite, à 3-4 cases de SA zone.',
      why:
        'À 2/2, l’accident n’a pas encore eu lieu — mais il est programmé. C’est exactement ici que la décision doit se prendre, pas quand le compteur passe au rouge.',
      pitfall:
        'Attendre « pour voir » est perdant : quand le troisième bleu entre, c’est déjà l’accident. La décision se prend AVANT l’entrée en zone.',
    },
    {
      scene: 'exiting',
      title: 'Avant de dérouter : compter les sorties',
      observe:
        'Le bleu de la ligne 1 (cerclé de vert) est presque au bord gauche de sa zone : il en sort dans une ou deux cases, et le compteur retombera à 1/2 tout seul.',
      why:
        'Un avion qui traverse libère sa place gratuitement. Si la sortie arrive AVANT l’entrée du nouveau, il n’y a rien à faire : zéro déroutage, score parfait.',
      action:
        'Compare les distances : le sortant est à 1-2 cases de la sortie, l’entrant à 3-4 cases de l’entrée. Ici la sortie arrive avant → on ne déroute rien.',
      pitfall:
        'Le sur-déroutage « par sécurité » est l’erreur la plus coûteuse en points. Chaque avion dérouté inutilement dégrade ton score de stratégie.',
    },
    {
      scene: 'chosen',
      title: 'Quand il faut dérouter : choisir la victime',
      observe:
        'Situation inverse : aucun bleu ne sortira à temps. Il faut dérouter — et c’est la PETITE croix de la ligne du bleu entrant (trait vert) qu’on vise.',
      why:
        'Entre plusieurs candidats, on déroute celui qui RESTERAIT le plus longtemps dans la zone : celui qui vient d’entrer. On libère plus de capacité pour le même coût d’un avion.',
      action:
        'Clique la petite croix en bout de ligne du bleu entrant. Coût : 1 avion. Le compteur reste à 2/2, la série continue.',
    },
    {
      scene: 'crash',
      title: 'Ce qui arrive si on hésite',
      observe:
        'Le troisième bleu est entré : 3/2 bleus, la zone passe à l’orange, accident. La série est perdue, et avec elle tous les points de la série.',
      why:
        'Un accident coûte infiniment plus qu’un déroutage. La hiérarchie est claire : d’abord ne jamais casser les critères, ensuite seulement économiser les déroutages.',
      pitfall:
        'L’accumulation lente est traître : trois avions déjà là, un quatrième qui arrive « tranquillement ». L’œil s’habitue au trafic dense — seul le compteur donne l’alerte.',
    },
    {
      scene: 'swept',
      title: 'Le faux ami : la grosse croix',
      observe:
        'La grosse croix latérale déroute TOUS les avions de sa couleur, partout sur le plateau. Ici elle a balayé les 3 bleus d’un coup.',
      why:
        'Elle sauve la série, mais le test note ta stratégie depuis 2019 : une série sauvée avec 3 avions déroutés vaut beaucoup moins qu’une série sauvée avec 1. C’est le piège n°1 rapporté par les candidats.',
      pitfall:
        'Ne la dégaine que si plusieurs lignes saturent en même temps et que tu n’as plus le temps de viser. Dans 90 % des cas, une petite croix bien choisie suffisait.',
      action:
        'Règle simple : petite croix par défaut, grosse croix uniquement en dernier recours assumé.',
    },
  ],
};
