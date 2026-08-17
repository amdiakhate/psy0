import type { Lesson } from '../../core/types';
import { ShapeGlyph } from './ShapeGlyph';
import type { Color, Fill, Shape } from './generator';

/**
 * Leçon « Formes et couleurs » : l'arbre de décision à deux étages, annoté
 * étage par étage. Le remplissage est la racine (il choisit la règle), et
 * l'attribut de la branche atteinte choisit la touche. Toutes les scènes sont
 * figées : aucun timer, aucun état.
 *
 * Règles montrées : l'exemple officiel (vide → couleur, rempli → forme) pour
 * les six premières étapes, puis un couple de règles de niveau 5 (mode 'free',
 * 4 valeurs par branche, les DEUX branches sur la forme) pour l'étape dure.
 */

type Key = 'N' | 'X';

interface Row {
  label: string;
  key: Key;
}

interface BranchDef {
  /** Le second critère de cette branche, formulé comme au briefing. */
  attr: string;
  rows: Row[];
}

/** Exemple officiel : les vides se départagent à la couleur, les remplis à la forme. */
const VIDE_CANON: BranchDef = {
  attr: 'la COULEUR',
  rows: [
    { label: 'BLEUE', key: 'N' },
    { label: 'ORANGE', key: 'X' },
  ],
};

const REMPLI_CANON: BranchDef = {
  attr: 'la FORME',
  rows: [
    { label: 'CARRÉE', key: 'N' },
    { label: 'TRIANGULAIRE', key: 'X' },
  ],
};

/** Niveau 5 (mode libre) : les deux branches lisent la forme, avec des touches opposées. */
const VIDE_HARD: BranchDef = {
  attr: 'la FORME',
  rows: [
    { label: 'CARRÉE', key: 'N' },
    { label: 'TRIANGULAIRE', key: 'X' },
    { label: 'RONDE', key: 'N' },
    { label: 'ÉTOILÉE', key: 'X' },
  ],
};

const REMPLI_HARD: BranchDef = {
  attr: 'la FORME',
  rows: [
    { label: 'CARRÉE', key: 'X' },
    { label: 'TRIANGULAIRE', key: 'N' },
    { label: 'RONDE', key: 'X' },
    { label: 'ÉTOILÉE', key: 'N' },
  ],
};

type BranchMode = 'neutral' | 'active' | 'off';

function BranchCard({
  index,
  state,
  def,
  mode,
  hit,
}: {
  index: 1 | 2;
  state: string;
  def: BranchDef;
  mode: BranchMode;
  hit?: string;
}) {
  const box =
    mode === 'active'
      ? 'border-sky-500 bg-sky-950/30'
      : mode === 'off'
        ? 'border-zinc-800 bg-zinc-950/40 opacity-40'
        : 'border-zinc-700 bg-zinc-950/40';

  return (
    <div className={`rounded-lg border-2 p-3 ${box}`}>
      <p className="text-sm font-semibold text-sky-400">
        Règle n°{index} — si {state}
      </p>
      <p className="mt-0.5 text-[10px] uppercase tracking-widest text-zinc-500">
        second critère : {def.attr}
      </p>
      <ul className="mt-2 space-y-1">
        {def.rows.map((r) => {
          const on = hit === r.label;
          return (
            <li key={r.label} className="flex items-center gap-2 text-sm">
              <span
                className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold ${
                  on
                    ? 'bg-amber-500 text-zinc-950 ring-2 ring-amber-300'
                    : 'border border-zinc-700 text-zinc-400'
                }`}
              >
                {r.key}
              </span>
              <span className={on ? 'font-semibold text-zinc-100' : 'text-zinc-400'}>
                si {r.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Tree({
  vide,
  rempli,
  active,
  hit,
}: {
  vide: BranchDef;
  rempli: BranchDef;
  active?: Fill;
  hit?: string;
}) {
  const mode = (f: Fill): BranchMode =>
    active === undefined ? 'neutral' : active === f ? 'active' : 'off';

  return (
    <div className="w-full max-w-2xl">
      <p className="mb-2 text-center text-[10px] uppercase tracking-widest text-amber-400">
        1<sup>er</sup> critère — le REMPLISSAGE choisit la règle
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <BranchCard
          index={1}
          state="VIDE"
          def={vide}
          mode={mode('vide')}
          hit={active === 'vide' ? hit : undefined}
        />
        <BranchCard
          index={2}
          state="REMPLIE"
          def={rempli}
          mode={mode('rempli')}
          hit={active === 'rempli' ? hit : undefined}
        />
      </div>
    </div>
  );
}

function Stimulus({
  shape,
  color,
  fill,
  answer,
  caption,
  danger,
}: {
  shape: Shape;
  color: Color;
  fill: Fill;
  answer?: Key;
  caption?: string;
  danger?: boolean;
}) {
  return (
    <div className="flex w-32 flex-col items-center gap-1">
      <div
        className={`flex h-28 w-28 items-center justify-center rounded-xl border-2 ${
          danger ? 'border-red-500 bg-red-950/30' : 'border-zinc-700 bg-zinc-950/40'
        }`}
      >
        <ShapeGlyph shape={shape} color={color} fill={fill} size={88} />
      </div>
      {answer && (
        <span
          className={`font-mono text-xl font-bold ${danger ? 'text-red-300' : 'text-sky-300'}`}
        >
          {answer}
        </span>
      )}
      {caption && (
        <p className="text-center text-[11px] leading-tight text-zinc-500">{caption}</p>
      )}
    </div>
  );
}

type ChipRole = 'root' | 'used' | 'noise';

function Chips({ items }: { items: Array<{ label: string; role: ChipRole }> }) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {items.map((it) => (
        <span
          key={it.label}
          className={`rounded-full border px-2.5 py-0.5 text-[11px] ${
            it.role === 'root'
              ? 'border-amber-500 text-amber-300'
              : it.role === 'used'
                ? 'border-sky-500 text-sky-300'
                : 'border-zinc-800 text-zinc-600 line-through'
          }`}
        >
          {it.label}
        </span>
      ))}
    </div>
  );
}

/** La fenêtre de 3 s : 0,5 s d'affichage, 2,5 s d'écran vide. */
function Timeline() {
  return (
    <div className="w-full max-w-2xl">
      <div className="flex h-7 overflow-hidden rounded-lg border border-zinc-700">
        <div className="w-[16.6%] bg-sky-800/60" />
        <div className="flex-1 bg-zinc-900" />
      </div>
      <div className="mt-1 flex text-[10px] leading-tight">
        <div className="w-[16.6%] pr-1 text-sky-300">0,5 s forme visible</div>
        <div className="flex-1 text-zinc-500">
          2,5 s d’écran VIDE — c’est ici que la touche se tape
        </div>
      </div>
    </div>
  );
}

function EmptyScreen() {
  return (
    <div className="flex w-32 flex-col items-center gap-1">
      <div className="flex h-28 w-28 items-center justify-center rounded-xl border-2 border-dashed border-zinc-700 bg-zinc-950/40">
        <span className="text-[11px] text-zinc-600">écran vide</span>
      </div>
      <span className="font-mono text-xl font-bold text-sky-300">N</span>
      <p className="text-center text-[11px] leading-tight text-zinc-500">
        la réponse se donne ici
      </p>
    </div>
  );
}

function ShapesColorsScene({ scene }: { scene: string; stepIndex: number }) {
  if (scene === 'tree') {
    return <Tree vide={VIDE_CANON} rempli={REMPLI_CANON} />;
  }

  if (scene === 'read') {
    return (
      <div className="flex flex-col items-center gap-4">
        <Stimulus shape="rond" color="bleu" fill="vide" answer="N" caption="vide → bleue → N" />
        <Chips
          items={[
            { label: 'remplissage : VIDE', role: 'root' },
            { label: 'couleur : bleue', role: 'used' },
            { label: 'forme : ronde', role: 'noise' },
          ]}
        />
        <Tree vide={VIDE_CANON} rempli={REMPLI_CANON} active="vide" hit="BLEUE" />
      </div>
    );
  }

  if (scene === 'timing') {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-3">
          <Stimulus shape="rond" color="bleu" fill="vide" caption="0,5 s : on capture" />
          <span className="text-xl text-zinc-600">→</span>
          <EmptyScreen />
        </div>
        <Timeline />
      </div>
    );
  }

  if (scene === 'switch') {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-3">
          <Stimulus
            shape="rond"
            color="bleu"
            fill="vide"
            answer="N"
            caption="vide → bleue → N"
          />
          <span className="text-xl text-zinc-600">→</span>
          <Stimulus
            shape="triangle"
            color="bleu"
            fill="rempli"
            answer="X"
            danger
            caption="REMPLI → triangulaire → X"
          />
        </div>
        <Chips
          items={[
            { label: 'remplissage : REMPLI (il a changé)', role: 'root' },
            { label: 'forme : triangulaire', role: 'used' },
            { label: 'couleur : bleue', role: 'noise' },
          ]}
        />
        <Tree vide={VIDE_CANON} rempli={REMPLI_CANON} active="rempli" hit="TRIANGULAIRE" />
      </div>
    );
  }

  if (scene === 'noise') {
    return (
      <div className="flex flex-col items-center gap-4">
        <Stimulus
          shape="carre"
          color="orange"
          fill="rempli"
          answer="N"
          caption="rempli → carrée → N"
        />
        <Chips
          items={[
            { label: 'remplissage : REMPLI', role: 'root' },
            { label: 'forme : carrée', role: 'used' },
            { label: 'couleur : orange (vaut X dans l’autre branche)', role: 'noise' },
          ]}
        />
        <Tree vide={VIDE_CANON} rempli={REMPLI_CANON} active="rempli" hit="CARRÉE" />
      </div>
    );
  }

  if (scene === 'hard') {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-3">
          <Stimulus
            shape="carre"
            color="vert"
            fill="vide"
            answer="N"
            caption="vide → carrée → N"
          />
          <span className="text-xl text-zinc-600">vs</span>
          <Stimulus
            shape="carre"
            color="vert"
            fill="rempli"
            answer="X"
            danger
            caption="rempli → carrée → X"
          />
        </div>
        <Chips
          items={[
            { label: 'remplissage : la seule différence', role: 'root' },
            { label: 'forme : carrée des deux côtés', role: 'used' },
            { label: 'couleur : verte, jamais lue', role: 'noise' },
          ]}
        />
        <Tree vide={VIDE_HARD} rempli={REMPLI_HARD} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <Tree vide={VIDE_CANON} rempli={REMPLI_CANON} />
      <Timeline />
    </div>
  );
}

export const lesson: Lesson = {
  title: 'Un arbre à deux étages : le remplissage d’abord, toujours',
  intro:
    'Deux règles en cascade annoncées AVANT la série, puis 30 formes, une toutes les 3 s, chacune visible 0,5 s seulement. Le remplissage (vide / rempli) ne se répond pas : il décide quelle règle s’applique — et donc si c’est la couleur ou la forme qui commande N ou X. Exemple officiel décortiqué ici.',
  Scene: ShapesColorsScene,
  steps: [
    {
      scene: 'tree',
      title: 'Le briefing est le vrai moment de travail',
      observe:
        'Les deux règles s’affichent avant la série et ne reviendront plus. Exemple officiel : si la forme est VIDE, N si BLEUE, X si ORANGE ; si elle est REMPLIE, N si CARRÉE, X si TRIANGULAIRE.',
      why: 'C’est le seul écran où tu as du temps. Une fois la série lancée, tu disposes de 3 s par forme dont 0,5 s d’affichage : reconstruire la règle en cours de route est impossible. Encode d’abord la racine en quatre mots — « vide → couleur, rempli → forme » — et seulement ensuite les valeurs.',
      action:
        'Lis les deux règles deux fois à voix intérieure, puis récite-les écran caché. Tant que tu ne peux pas les réciter, ne lance pas la série.',
      pitfall:
        'Retenir « bleu = N » sans sa condition. Hors de sa branche, « bleu » ne commande rien : une valeur sans son remplissage est inutilisable.',
    },
    {
      scene: 'read',
      title: 'Étape 1 — l’ordre de lecture est verrouillé',
      observe:
        'Un rond bleu, contour seul. On lit le remplissage : VIDE. Cela ouvre la règle n°1, où le critère est la couleur. Bleue → N. La forme, elle, n’a pas été lue du tout.',
      why: 'Le remplissage n’est pas un attribut parmi trois : c’est celui qui décide quel autre attribut existe. Lire la couleur avant le remplissage, c’est répondre à une question qui n’a pas encore de sens.',
      action:
        'Deux temps, toujours les mêmes : « vide ! » puis « bleue → N ». Jamais trois temps, jamais dans l’autre ordre.',
      pitfall:
        'La couleur saute aux yeux avant le contour. Si tu te laisses conduire par ce qui est saillant, tu appliqueras la mauvaise branche dès qu’elle changera.',
    },
    {
      scene: 'timing',
      title: 'Étape 2 — tu réponds sur un écran vide',
      observe:
        'La forme reste 0,5 s puis disparaît. Il reste 2,5 s de noir avant la suivante : la touche se tape presque toujours alors qu’il n’y a plus rien à regarder.',
      why: 'Le test ne mesure pas ta perception mais ta capacité à appliquer un arbre sur une image mémorisée. Cette image ne se précise jamais avec le temps : elle se dégrade. Attendre pour « être sûr » te fait décider sur un souvenir plus pauvre.',
      action:
        'Pendant les 0,5 s, ne cherche pas la réponse : capture. Nomme le remplissage à l’instant où la forme apparaît (« creux ! », « plein ! »), la valeur utile juste après, et tape dans la seconde qui suit l’effacement.',
      pitfall:
        'Dépasser la fenêtre de 3 s. Une non-réponse coûte exactement autant qu’une erreur — mieux vaut trancher au feeling que laisser passer.',
    },
    {
      scene: 'switch',
      title: 'Étape 3 — le changement de branche, le piège mesuré',
      observe:
        'Deux formes qui se suivent. La première est vide et bleue : règle n°1, N. La seconde est bleue elle aussi, mais REMPLIE : on bascule en règle n°2, où la couleur ne décide plus rien. Elle est triangulaire, donc X.',
      why: 'C’est le branch-switch, et il concerne la moitié des stimuli de la série. La mémoire de travail garde la règle qui vient de servir et la ré-applique par inertie : c’est là que le temps de réaction explose et que les erreurs se concentrent.',
      action:
        'Fais du remplissage ton premier mot à chaque forme, même quand il ne change pas. Re-parcourir l’arbre pour rien coûte une fraction de seconde ; l’oublier une seule fois coûte un point.',
      pitfall:
        'Répondre N ici parce que le bleu valait N trois secondes plus tôt. La familiarité n’est pas la règle.',
    },
    {
      scene: 'noise',
      title: 'Étape 4 — inhiber l’attribut distracteur',
      observe:
        'Un carré orange, plein. Branche « remplie » : le critère est la forme, carrée → N. Que la forme soit orange ne change rien — alors même qu’ORANGE vaut X dans l’autre branche.',
      why: 'L’attribut non pertinent est tiré au hasard par le générateur : dans la branche « rempli », la couleur est du bruit pur, et réciproquement. Une fois sur deux ce bruit pointe la touche opposée. Inhiber ne veut pas dire ne pas voir : il faut reconnaître l’attribut puis décider activement qu’il ne compte pas.',
      action:
        'Ajoute un demi-mot avant de valider : « la couleur ne compte pas ici ». Court, mais prononcé.',
      pitfall:
        'Quand les deux attributs pointent des touches opposées, tu es sur un item piégé — c’est exactement le profil de ceux qu’on rate.',
    },
    {
      scene: 'hard',
      title: 'Étape 5 — au niveau dur, le même critère des deux côtés',
      observe:
        'Aux niveaux avancés, les deux branches peuvent se départager sur le MÊME attribut, avec quatre valeurs chacune et des touches opposées. Ici les deux règles lisent la forme : un carré VIDE vaut N, un carré REMPLI vaut X. Même forme, même couleur, réponse inverse. La fenêtre tombe en plus à 2 s.',
      why: 'La racine ne bouge jamais : le remplissage passe d’abord, quoi qu’il arrive. Quand les deux branches partagent l’attribut, l’envie de « répondre directement à la forme » devient irrésistible — et c’est le seul cas où elle est fausse à tous les coups.',
      action:
        'Encode des paires, jamais des valeurs seules : « vide-carré → N », « rempli-carré → X ». Deux mots collés par entrée.',
      pitfall:
        'Se dire « c’est la forme des deux côtés, je peux sauter le remplissage ». C’est l’inverse : quand l’attribut est commun, le remplissage est la SEULE information qui décide.',
    },
    {
      scene: 'method',
      title: 'La méthode complète',
      observe:
        'Trois gestes, dans cet ordre : capturer pendant les 0,5 s, nommer le remplissage, appliquer l’attribut de la branche. Le budget : environ 1 s pour répondre après l’effacement, le reste de la fenêtre pour réamorcer.',
      why: 'Rien ici ne demande de la vitesse pure : tout demande que l’arbre soit déjà en place. Un candidat qui hésite sur la racine perd sur chaque stimulus ; un candidat qui l’a automatisée ne paie que les changements de branche.',
      action:
        'Toutes les dix formes environ, profite du temps mort pour re-dire la racine. La chute de fin de série vient d’un arbre qui n’a plus été rafraîchi depuis vingt stimuli.',
      pitfall:
        'Ruminer une erreur après le feedback. Deux secondes d’analyse en coûtent une sur la forme suivante — recale l’arbre, puis lâche.',
    },
  ],
};
