import type { Lesson } from '../../core/types';

/**
 * Leçon « Airways ».
 *
 * L'ancienne version enseignait le mauvais geste : viser un avion et l'écarter.
 * Airways ne se joue pas comme ça. On ferme une VOIE — définitivement — et on
 * paie pour ça. Toute la leçon tient dans trois idées : le compteur décide, la
 * fermeture doit précéder l'entrée dans la bande, et chaque fermeture se paie.
 */

const CELL = 26;
const ROW = 24;
const COLS = 18;
/** Bande centrale, colonnes 8-12, sur les lignes 1 à 5 : la ligne 6 n'est pas couverte. */
const ZONE = { start: 8, end: 12, lineFrom: 0, lineTo: 4 };

interface P {
  col: number;
  line: number;
  color: 'blue' | 'purple';
  fast?: boolean;
  mark?: 'danger' | 'exiting' | 'free';
}

interface Scene {
  planes: P[];
  /** [bleus, total] dans la bande. */
  counters: [number, number];
  faulty?: boolean;
  /** Voies fermées, rendues barrées : `${color}${line}`. */
  closed?: string[];
  /** Colonne entière fermée par le bouton global. */
  globalClosed?: 'blue' | 'purple';
  /** Bouton mis en évidence. */
  highlight?: { color: 'blue' | 'purple'; line: number };
  highlightGlobal?: 'blue' | 'purple';
}

const SCENES: Record<string, Scene> = {
  board: {
    planes: [
      { col: 9, line: 0, color: 'blue' },
      { col: 3, line: 3, color: 'purple' },
      { col: 15, line: 2, color: 'blue' },
    ],
    counters: [1, 1],
  },
  filling: {
    planes: [
      { col: 9, line: 0, color: 'blue' },
      { col: 11, line: 2, color: 'blue' },
      { col: 10, line: 1, color: 'purple' },
      { col: 16, line: 3, color: 'blue', fast: true, mark: 'danger' },
    ],
    counters: [2, 3],
  },
  exiting: {
    planes: [
      { col: 8, line: 0, color: 'blue', mark: 'exiting' },
      { col: 11, line: 2, color: 'blue' },
      { col: 10, line: 1, color: 'purple' },
      { col: 16, line: 3, color: 'blue', fast: true, mark: 'danger' },
    ],
    counters: [2, 3],
  },
  closed: {
    planes: [
      { col: 9, line: 0, color: 'blue' },
      { col: 11, line: 2, color: 'blue' },
      { col: 10, line: 1, color: 'purple' },
    ],
    counters: [2, 3],
    closed: ['blue3'],
    highlight: { color: 'blue', line: 3 },
  },
  toolate: {
    planes: [
      { col: 9, line: 0, color: 'blue' },
      { col: 11, line: 2, color: 'blue' },
      { col: 10, line: 1, color: 'purple' },
      { col: 12, line: 3, color: 'blue', mark: 'danger' },
    ],
    counters: [3, 4],
    faulty: true,
    closed: ['blue3'],
  },
  global: {
    planes: [{ col: 10, line: 1, color: 'purple' }],
    counters: [0, 1],
    closed: ['blue0', 'blue1', 'blue2', 'blue3', 'blue4', 'blue5'],
    globalClosed: 'blue',
    highlightGlobal: 'blue',
  },
  free: {
    planes: [
      { col: 9, line: 0, color: 'blue' },
      { col: 11, line: 2, color: 'blue' },
      { col: 6, line: 5, color: 'purple', mark: 'free' },
    ],
    counters: [2, 2],
  },
};

function triangle(cx: number, cy: number, color: 'blue' | 'purple', offset = 0): string {
  const s = 7;
  const d = color === 'blue' ? -1 : 1;
  return `${cx + d * (s + offset)},${cy} ${cx - d * (s - offset)},${cy - s * 0.85} ${
    cx - d * (s - offset)
  },${cy + s * 0.85}`;
}

function AirwaysScene({ scene }: { scene: string; stepIndex: number }) {
  const data = SCENES[scene] ?? SCENES.board;
  const W = COLS * CELL;
  const [blues, total] = data.counters;

  return (
    <div className="mx-auto flex w-full max-w-2xl items-center gap-2">
      {/* Les compteurs vivent À L'EXTÉRIEUR du groupe, comme au test. */}
      <div className="flex w-24 shrink-0 flex-col gap-1 font-mono text-xs">
        <span
          className={`rounded-md border px-2 py-0.5 text-center ${
            total > 4
              ? 'border-red-500 bg-red-950/60 font-bold text-red-300'
              : total === 4
                ? 'border-amber-500 bg-amber-950/40 text-amber-300'
                : 'border-zinc-700 bg-zinc-900 text-zinc-300'
          }`}
        >
          {total}/4 total
        </span>
        <span
          className={`rounded-md border px-2 py-0.5 text-center ${
            blues > 2
              ? 'border-red-500 bg-red-950/60 font-bold text-red-300'
              : blues === 2
                ? 'border-amber-500 bg-amber-950/40 text-amber-300'
                : 'border-zinc-700 bg-zinc-900 text-zinc-300'
          }`}
        >
          {blues}/2 ◀ bleus
        </span>
      </div>

      <Column color="purple" data={data} />

      <svg
        viewBox={`0 0 ${W} ${6 * ROW}`}
        className={`min-w-0 flex-1 rounded border bg-zinc-100 ${
          data.faulty ? 'border-red-500' : 'border-zinc-600'
        }`}
      >
        <rect
          x={ZONE.start * CELL}
          y={ZONE.lineFrom * ROW}
          width={(ZONE.end - ZONE.start + 1) * CELL}
          height={(ZONE.lineTo - ZONE.lineFrom + 1) * ROW}
          fill={data.faulty ? '#f59e0b' : 'var(--ink-400)'}
          opacity={data.faulty ? 0.9 : 0.45}
        />
        {Array.from({ length: COLS + 1 }, (_, c) => (
          <line
            key={`c${c}`}
            x1={c * CELL}
            y1={0}
            x2={c * CELL}
            y2={6 * ROW}
            stroke="var(--ink-300)"
            strokeWidth={0.5}
          />
        ))}
        {Array.from({ length: 7 }, (_, r) => (
          <line
            key={`r${r}`}
            x1={0}
            y1={r * ROW}
            x2={W}
            y2={r * ROW}
            stroke="var(--ink-400)"
            strokeWidth={0.7}
          />
        ))}
        {data.planes.map((p, i) => {
          const cx = p.col * CELL + CELL / 2;
          const cy = p.line * ROW + ROW / 2;
          return (
            <g key={i}>
              <polygon points={triangle(cx, cy, p.color)} fill={p.color === 'blue' ? '#38bdf8' : '#7c3aed'} />
              {p.fast && (
                <polygon
                  points={triangle(cx, cy, p.color, -8)}
                  fill={p.color === 'blue' ? '#38bdf8' : '#7c3aed'}
                  opacity={0.7}
                />
              )}
              {p.mark === 'danger' && (
                <circle cx={cx} cy={cy} r={12} fill="none" stroke="#dc2626" strokeWidth={2} strokeDasharray="4 3" />
              )}
              {p.mark === 'exiting' && (
                <circle cx={cx} cy={cy} r={12} fill="none" stroke="#22c55e" strokeWidth={2} strokeDasharray="4 3" />
              )}
              {p.mark === 'free' && (
                <circle cx={cx} cy={cy} r={12} fill="none" stroke="#16a34a" strokeWidth={2} strokeDasharray="4 3" />
              )}
            </g>
          );
        })}
      </svg>

      <Column color="blue" data={data} />
    </div>
  );
}

/** Les violets entrent par la gauche, les bleus par la droite : les boutons vivent à leur entrée. */
function Column({ color, data }: { color: 'blue' | 'purple'; data: Scene }) {
  const fill = color === 'blue' ? '#7dd3fc' : '#8b5cf6';
  return (
    <div className="flex w-9 shrink-0 flex-col gap-0.5">
      <div
        className="rounded-t-md py-0.5 text-center text-[10px] font-bold text-zinc-950"
        style={{
          backgroundColor: data.globalClosed === color ? 'transparent' : fill,
          border: data.globalClosed === color ? '1px solid var(--ink-600)' : undefined,
          outline: data.highlightGlobal === color ? '2px solid #dc2626' : undefined,
          color: data.globalClosed === color ? 'var(--ink-500)' : undefined,
        }}
      >
        ×6
      </div>
      {Array.from({ length: 6 }, (_, line) => {
        const closed = data.closed?.includes(`${color}${line}`) ?? false;
        const lit = data.highlight?.color === color && data.highlight.line === line;
        return (
          <div
            key={line}
            className="flex items-center justify-center rounded-sm text-xs font-bold"
            style={{
              height: ROW - 2,
              backgroundColor: closed ? 'transparent' : fill,
              border: closed ? '1px solid var(--ink-600)' : undefined,
              outline: lit ? '2px solid #22c55e' : undefined,
              color: closed ? 'var(--ink-500)' : '#09090b',
            }}
          >
            {closed ? '—' : '✕'}
          </div>
        );
      })}
    </div>
  );
}

export const lesson: Lesson = {
  reality: {
    atFirst:
      "Les premières séries partent à l’accident sans que tu comprennes pourquoi : l’œil suit les avions, jamais les compteurs. C’est le défaut de départ de tout le monde, et l’un des plus rapides à corriger du PSY0 — souvent en trois ou quatre séries.",
    budget:
      "Pas de chrono par question : c’est le trafic qui impose le rythme. La boucle de scan « en 2 secondes » suppose que tu lises les deux compteurs sans les chercher des yeux. Au début elle t’en prendra quatre ou cinq, et tu rateras des entrées dans la bande. C’est mécanique, pas un manque d’attention.",
    fallback: [
      "Tu ne tiens plus les deux compteurs : ne garde que le BLEU. Son plafond est deux fois plus serré, il casse presque toujours en premier — et un compteur surveillé vaut mieux que deux survolés.",
      "Tu ne tiens plus les deux groupes : garde celui qui est le plus chargé. Un accident ne gèle QUE son groupe, l’autre continue de tourner.",
      "Plusieurs voies saturent en même temps : arrête d’économiser et ferme. Un accident coûte 50 points, une fermeture en coûte 1.",
      "Dernier recours assumé : le bouton global. Cinq points, mais il ne perd jamais la série.",
    ],
    recover:
      "Après un accident, la série est perdue — pas la passation. Le vrai danger est de vouloir « rattraper » en jouant plus serré : c’est comme ça qu’on en enchaîne deux. Il reste neuf séries ; repars sur la boucle normale.",
    bail:
      "Rien ne s’abandonne ici, la série va jusqu’au bout. Ce qui s’abandonne, c’est l’ambition du zéro fermeture — dès que tu n’es plus sûr de tenir, ferme et respire. Le 100 % n’existe pas de toute façon.",
  },
  title: 'Réguler un flux, pas éviter des obstacles',
  intro:
    'Airways n’est pas un jeu d’esquive : tu ne pilotes aucun avion. Tu es le régulateur, et ton seul geste est de FERMER une voie — définitivement, et contre des points. Toute la note tient dans un arbitrage : combien de voies fermer pour ne jamais dépasser 4 avions, dont 2 bleus, dans la bande grise.',
  Scene: AirwaysScene,
  steps: [
    {
      scene: 'board',
      title: 'Le tableau de bord : deux compteurs, douze boutons',
      observe:
        'Un groupe de 6 voies, une bande grise centrale, et surtout DEUX compteurs affichés à l’extérieur : total (max 4) et bleus (max 2). De chaque côté, six boutons de couleur — un par voie — et un bouton ×6 qui les ferme tous.',
      why:
        'Les bleus vont vers la gauche, les violets vers la droite : chaque couleur a ses boutons du côté par lequel elle ARRIVE. Le compteur bleu est deux fois plus serré que le total — c’est presque toujours par lui que la série casse.',
      action:
        'Ancre ta boucle de scan : compteurs du haut → arrivées imminentes en haut → compteurs du bas → arrivées imminentes en bas. Environ 2 secondes par tour.',
    },
    {
      scene: 'filling',
      title: 'Le moment de décider : 2/2 bleus',
      observe:
        'Deux bleus occupent la bande, le compteur passe en ambre. Un troisième bleu arrive par la droite — et il porte un DOUBLE CHEVRON : il avance deux fois plus vite, il sera dans la bande en deux pas, pas en quatre.',
      why:
        'À 2/2 l’accident n’a pas eu lieu, mais il est programmé. C’est exactement ici que la décision se prend. Compter les avions ne suffit pas : il faut lire les vitesses, sinon on se donne un délai qui n’existe pas.',
      pitfall:
        'Attendre « pour voir » est perdant. Quand le troisième bleu entre dans la bande, c’est déjà l’accident, et aucun bouton ne le rattrapera.',
    },
    {
      scene: 'exiting',
      title: 'Avant de payer : compter les sorties',
      observe:
        'Le bleu de la voie 1, cerclé de vert, touche le bord gauche de la bande : il en sort au prochain pas, et le compteur retombera à 1/2 tout seul.',
      why:
        'Un avion qui traverse libère sa place gratuitement. Si la sortie précède l’entrée, il n’y a rien à faire — zéro fermeture, zéro point perdu, série parfaite.',
      action:
        'Compare les deux distances : le sortant est à 1 case de la sortie, l’entrant rapide à 2 pas de l’entrée. Ici ça passe, on ne ferme rien.',
      pitfall:
        'Fermer « par sécurité » est l’erreur la plus coûteuse de la passation : chaque voie fermée est un point de moins, définitivement.',
    },
    {
      scene: 'closed',
      title: 'Fermer une voie : le geste, et son prix',
      observe:
        'Cas inverse : personne ne sortira à temps. On appuie sur le bouton bleu de la voie 4 (cerclé de vert). Le bouton devient barré : la voie est fermée pour de bon.',
      why:
        'La fermeture emporte l’avion qui arrivait ET tous les bleus qui seraient passés par cette voie jusqu’à la fin de la série. C’est puissant, et c’est pour ça que ça coûte : 1 point sur 100.',
      action:
        'Vise la voie qui apporte le prochain avion de trop — pas une voie « au hasard du bon côté ». Une voie fermée ne se rouvre jamais.',
    },
    {
      scene: 'toolate',
      title: 'Trois secondes trop tard',
      observe:
        'Même situation, décision prise un pas plus tard : le bouton est bien barré, mais le bleu est DÉJÀ dans la bande. Compteur à 3/2, la bande vire à l’orange, accident.',
      why:
        'Une fermeture agit sur les avions qui n’ont pas encore atteint la bande. Un avion engagé la traverse quoi qu’il arrive — on ne fait pas demi-tour à un appareil en approche. Résultat : on paie la fermeture ET l’accident.',
      pitfall:
        'C’est LE piège du test. Le geste juste, fait trop tard, coûte plus cher que de n’avoir rien fait. Airways récompense l’anticipation, jamais le réflexe.',
    },
    {
      scene: 'global',
      title: 'Le bouton ×6 : cinq points, d’un coup',
      observe:
        'Le bouton global ferme les six voies d’un groupe pour une couleur. Ici tous les bleus ont disparu du groupe, et les six boutons sont barrés.',
      why:
        'Il coûte 5 points, quand une voie en coûte 1. Il est donc perdant tant que quatre fermetures suffisent, à l’équilibre à cinq, et gagnant seulement s’il en fallait six. Dans le doute, il est perdant.',
      pitfall:
        'C’est le geste de panique par excellence : il sauve la série et enterre la note. Une passation à cinq appuis globaux plafonne à 75 %, soit la classe 5.',
      action:
        'Ne le déclenche que si tu as déjà décidé que le groupe est ingérable — pas parce qu’un compteur t’a fait peur.',
    },
    {
      scene: 'free',
      title: 'Ce qui ne compte pas : hors de la bande',
      observe:
        'La bande grise ne couvre que cinq voies sur six. Le violet cerclé de vert circule sur la voie 6, en dehors : il n’entrera dans aucun compteur.',
      why:
        'Fermer sa voie coûterait un point pour zéro capacité libérée. Lire les LIMITES de la bande fait donc partie de la lecture du plateau, au même titre que les compteurs.',
      action:
        'À l’ouverture de chaque série, repère en une seconde quelles voies la bande couvre. C’est gratuit, et ça élimine d’emblée les fermetures inutiles.',
    },
  ],
};
