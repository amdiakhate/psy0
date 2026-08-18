import type { Lesson } from '../../core/types';

/**
 * Leçon « Grilles de calculs » : la méthode des trois passes sur une grille
 * figée de 9 calculs, dont 2 sont faux.
 */
interface Cell {
  display: string;
  wrong: boolean;
  /** Ce qu'on repère à la passe des unités. */
  units: string;
}

const GRID: Cell[] = [
  { display: '47 + 38 = 85', wrong: false, units: '7+8 → 5 ✓' },
  { display: '63 − 27 = 46', wrong: true, units: '3−7 → …6 ✓ mais retenue' },
  { display: '8 × 7 = 56', wrong: false, units: '8×7 → 6 ✓' },
  { display: '25 % de 80 = 20', wrong: false, units: '÷4 ✓' },
  { display: '144 ÷ 12 = 12', wrong: false, units: '12×12 ✓' },
  { display: '56 + 29 = 87', wrong: true, units: '6+9 → 5, or 7 ✗' },
  { display: '3/4 de 60 = 45', wrong: false, units: '60÷4×3 ✓' },
  { display: '19 × 4 = 76', wrong: false, units: '9×4 → 6 ✓' },
  { display: '91 − 34 = 57', wrong: false, units: '1−4 → …7 ✓' },
];

function Scene({ scene }: { scene: string; stepIndex: number }) {
  const show = (i: number): { border: string; note?: string } => {
    if (scene === 'units') {
      if (i === 5) return { border: 'border-red-500 bg-red-950/40', note: GRID[i].units };
      return { border: 'border-zinc-700', note: GRID[i].units };
    }
    if (scene === 'suspect' && i === 1) return { border: 'border-amber-500 bg-amber-950/30', note: 'à recalculer' };
    if (scene === 'answer') {
      if (GRID[i].wrong) return { border: 'border-red-500 bg-red-950/50', note: 'FAUX' };
      return { border: 'border-green-700/50' };
    }
    return { border: 'border-zinc-700' };
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      {GRID.map((cell, i) => {
        const { border, note } = show(i);
        return (
          <div key={i} className={`rounded-lg border-2 px-3 py-2 text-center ${border}`}>
            <p className="font-mono text-base tabular-nums text-zinc-100">{cell.display}</p>
            {note && <p className="mt-0.5 font-mono text-[10px] text-zinc-400">{note}</p>}
          </div>
        );
      })}
    </div>
  );
}

export const lesson: Lesson = {
  reality: {
    atFirst:
      "Les premières grilles, tu recalculeras les opérations une par une et tu en traiteras cinq sur neuf avant la fin du chrono. C’est le passage obligé : le contrôle par les unités ne devient rapide qu’après quelques centaines de calculs. L’atelier de Calcul mental existe exactement pour raccourcir cette étape.",
    budget:
      "45 s suppose que « le dernier chiffre » est un réflexe, pas une opération. Tant qu’il te demande de réfléchir, compte 20 s pour la première passe au lieu de 10 — et accepte de ne pas atteindre la troisième. Mieux vaut deux passes propres que trois bâclées.",
    fallback: [
      "Le temps file : arrête de chercher et coche uniquement ce que la passe des unités a franchement invalidé. Un faux certain vaut mieux que trois cases à moitié explorées.",
      "Traite les grosses multiplications en dernier : ce sont les plus coûteuses à vérifier, et pas les plus souvent fausses.",
      "À 5 secondes de la fin, VALIDE. Une grille non validée perd tout, y compris les bonnes cases déjà cochées.",
    ],
    recover:
      "Chaque grille est indépendante : il n’y a rien à rattraper. Le piège est de sortir d’une grille ratée et de cocher plus largement sur la suivante « pour compenser » — c’est exactement ce qui fabrique les faux positifs.",
    bail:
      "Le doute non résolu se tranche en faveur du « juste ». Ne coche jamais une case pour te rassurer : un faux positif coûte autant qu’une erreur manquée, et une grille sans aucune faute est une réponse parfaitement légitime.",
  },
  title: 'Trouver les calculs faux en trois passes',
  intro:
    'Neuf calculs, 45 secondes : recalculer les neuf est impossible, et c’est exactement le piège de conception. La méthode tient en trois passes de plus en plus coûteuses, appliquées à de moins en moins de cases.',
  Scene,
  steps: [
    {
      scene: 'plain',
      title: 'La grille',
      observe:
        'Neuf calculs avec leur résultat proposé. Entre 0 et 4 sont faux — parfois aucun. Il faut cliquer les faux, puis valider.',
      why: 'Le nombre d’erreurs est inconnu : tu ne peux pas t’arrêter « quand tu en as trouvé assez ». C’est la grille entière qu’il faut couvrir, mais pas au même niveau de détail partout.',
      pitfall:
        'Se lancer dans le recalcul du premier calcul venu : à ce rythme tu traites 4 cases sur 9 avant la fin du chrono.',
    },
    {
      scene: 'units',
      title: 'Passe 1 — les unités (10 s)',
      observe:
        'On ne regarde QUE le dernier chiffre. 47+38 : 7+8 = 15, le résultat doit finir par 5 → 85 ✓. 56+29 : 6+9 = 15, le résultat doit finir par 5 → mais on lit 87 ✗. Erreur trouvée sans rien calculer.',
      why: 'Le chiffre des unités se vérifie en une fraction de seconde et attrape la moitié des erreurs. Pour ×, on multiplie les unités : 8×7 finit par 6 ✓ ; 19×4 finit par 6 ✓.',
      action: 'Balaye les 9 cases en ne regardant que les unités. Coche ce qui est franchement faux, marque ce qui reste douteux.',
    },
    {
      scene: 'suspect',
      title: 'Passe 2 — les cas à retenue (10 s)',
      observe:
        '63 − 27 = 46 : les unités semblent cohérentes (13−7 = 6), mais c’est une soustraction À RETENUE, l’endroit exact où le test glisse ses erreurs.',
      why: 'La passe des unités valide autant les bons calculs que certains faux à ±10 — précisément le cas d’une retenue oubliée. Les soustractions à retenue passent donc automatiquement en « suspect ».',
      action: 'Recalcule proprement : 63 − 27 = 63 − 30 + 3 = 36. Le résultat affiché est 46 → FAUX.',
      pitfall:
        'Les faux sont PLAUSIBLES (±1, ±2, ±10, chiffres inversés). L’ordre de grandeur ne les démasque jamais — seul le recalcul ciblé y arrive.',
    },
    {
      scene: 'answer',
      title: 'Passe 3 — décision et validation (5 s)',
      observe:
        'Deux erreurs : 63 − 27 = 46 (retenue) et 56 + 29 = 87 (unités). Les sept autres sont justes.',
      why: 'Un faux positif coûte autant qu’une erreur manquée : ne coche que ce que tu as réellement invalidé. Le doute non résolu se tranche en faveur du « juste ».',
      action:
        'Coche les deux, vérifie que tu n’as pas plus de 4 cases sélectionnées, et VALIDE — au test, une grille non validée perd toutes ses bonnes réponses.',
    },
    {
      scene: 'plain',
      title: 'Le cas particulier : la grille sans erreur',
      observe:
        'Certaines grilles ne contiennent aucune faute. Après trois passes propres, la bonne réponse est de valider sans rien cocher.',
      why:
        'Le doute pousse à cocher « au cas où ». C’est un piège de conception : la règle officielle dit bien « de 0 à 4 calculs faux ». Zéro est une réponse légitime.',
      pitfall: 'Cocher une case au hasard pour se rassurer transforme une grille parfaite en grille ratée.',
    },
  ],
};
