import type { Lesson } from '../../core/types';
import { WindowAnimation } from './WindowAnimation';

/**
 * Leçon « M2 Back » : le dispositif réel (1 s d'affichage puis Oui/Non pendant
 * 3 s, 42 chiffres) et la discrimination match / lure N±1.
 */
interface Slot {
  digit: number;
  kind: 'warmup' | 'match' | 'lure' | 'plain';
  note?: string;
}

const SEQ: Slot[] = [
  { digit: 5, kind: 'warmup', note: 'amorce' },
  { digit: 3, kind: 'warmup', note: 'amorce' },
  { digit: 5, kind: 'match', note: '= il y a 2 → Oui' },
  { digit: 8, kind: 'plain', note: 'rien à 2 coups → Non' },
  { digit: 3, kind: 'lure', note: 'à 3 coups, pas 2 → Non' },
  { digit: 8, kind: 'lure', note: 'à 1 coup, pas 2 → Non' },
];

const STYLE: Record<Slot['kind'], string> = {
  warmup: 'border-zinc-700 text-zinc-500',
  match: 'border-green-500 bg-green-950/40 text-green-300',
  lure: 'border-red-500 bg-red-950/40 text-red-300',
  plain: 'border-zinc-600 text-zinc-300',
};

function Sequence({ upTo, focus }: { upTo: number; focus?: number }) {
  return (
    <div className="flex flex-wrap items-start justify-center gap-3">
      {SEQ.slice(0, upTo).map((s, i) => (
        <div key={i} className="flex w-24 flex-col items-center gap-1">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-lg border-2 font-mono text-3xl font-bold ${STYLE[s.kind]} ${
              focus === i ? 'ring-2 ring-sky-400 ring-offset-2 ring-offset-zinc-950' : ''
            }`}
          >
            {s.digit}
          </div>
          <p className="text-center text-[11px] leading-tight text-zinc-500">{s.note}</p>
        </div>
      ))}
    </div>
  );
}

function Scene({ scene }: { scene: string; stepIndex: number }) {
  if (scene === 'slide') return <WindowAnimation />;
  if (scene === 'device') {
    return (
      <div className="flex flex-wrap items-center justify-center gap-4">
        <div className="flex flex-col items-center gap-1">
          <div className="flex h-24 w-24 items-center justify-center rounded-xl border-2 border-zinc-600 bg-zinc-900 font-mono text-5xl font-bold text-zinc-100">
            7
          </div>
          <span className="text-[11px] text-zinc-500">1 s d’affichage</span>
        </div>
        <span className="text-2xl text-zinc-600">→</span>
        <div className="flex flex-col items-center gap-1">
          <div className="flex gap-2">
            <span className="rounded-lg border-2 border-zinc-600 bg-zinc-900 px-6 py-2 font-semibold">Oui</span>
            <span className="rounded-lg border-2 border-zinc-600 bg-zinc-900 px-6 py-2 font-semibold">Non</span>
          </div>
          <span className="text-[11px] text-zinc-500">3 s pour trancher — sans réponse, c’est faux</span>
        </div>
      </div>
    );
  }
  if (scene === 'window') {
    return (
      <div className="flex flex-col items-center gap-3">
        <Sequence upTo={3} focus={2} />
        <p className="rounded-lg border border-sky-800 bg-sky-950/30 px-4 py-2 font-mono text-sm text-sky-200">
          fenêtre en tête : 5 – 3 &nbsp;→&nbsp; le 5 qui arrive se compare au premier 5
        </p>
      </div>
    );
  }
  if (scene === 'match') return <Sequence upTo={3} focus={2} />;
  if (scene === 'plain') return <Sequence upTo={4} focus={3} />;
  if (scene === 'lure1') return <Sequence upTo={5} focus={4} />;
  if (scene === 'lure2') return <Sequence upTo={6} focus={5} />;
  return <Sequence upTo={6} />;
}

export const lesson: Lesson = {
  title: 'Tenir une fenêtre de deux chiffres',
  intro:
    'Le dispositif officiel : un chiffre paraît 1 seconde, s’efface, puis « Oui » et « Non » restent 3 secondes. Oui si le chiffre est identique à celui de DEUX coups avant. 42 chiffres par série, et une non-réponse compte comme une faute.',
  Scene,
  steps: [
    {
      scene: 'slide',
      title: 'La fenêtre glissante, en mouvement',
      observe:
        "La série défile au rythme réel de l'épreuve. Le cadre bleu couvre les DEUX chiffres à garder en tête ; à chaque nouveau chiffre, il glisse d'un cran — le plus ancien tombe au moment exact où le nouveau entre.",
      why: "Le M2 Back ne demande pas de retenir une suite : il demande de tenir deux chiffres et de les faire DÉFILER. Écrite, l'idée reste abstraite ; en mouvement, on voit que la mémoire ne s'allonge jamais — elle se décale. C'est le geste à automatiser, et c'est pour ça que la série de 42 est tenable.",
      action:
        'Mets pause et fais défiler toi-même : à chaque cran, annonce à voix haute le couple en tête AVANT de regarder le chiffre qui arrive.',
    },
    {
      scene: 'device',
      title: 'Le dispositif',
      observe:
        'Chaque chiffre suit le même cycle : 1 s visible, puis l’écran de réponse avec les deux boutons pendant 3 s. Tu réponds 42 fois par série, à chaque chiffre — jamais « seulement quand c’est un match ».',
      why: 'La comparaison doit être FAITE pendant la seconde d’affichage. Les 3 s suivantes servent à cliquer et à réamorcer ta fenêtre, pas à réfléchir : si tu commences à chercher quand les boutons apparaissent, tu es déjà en retard.',
      pitfall: 'Laisser filer une fenêtre sans répondre : le timeout compte exactement comme une mauvaise réponse.',
    },
    {
      scene: 'window',
      title: 'La fenêtre glissante',
      observe:
        'Deux chiffres sont déjà passés : 5 puis 3. Ce sont les deux seuls que tu dois avoir en tête. Un troisième arrive et se compare au PREMIER des deux.',
      why: 'La mémoire utilisée est verbale, pas visuelle : répète « 5-3 » dans ta tête, en boucle, au rythme des apparitions. À N=2, pense « avant-dernier » — la formulation « celui d’il y a deux » force à recompter.',
      action:
        'Mise à jour volontaire (drop-oldest) : à chaque nouveau chiffre, JETTE explicitement le plus ancien et ajoute le nouveau. Ne laisse pas la fenêtre glisser toute seule.',
    },
    {
      scene: 'match',
      title: 'Le match — Oui',
      observe: 'Le 5 qui arrive est identique à celui d’exactement deux coups avant. C’est un match : bouton Oui.',
      why: 'Un match, c’est une identité de valeur ET de position. Les deux conditions ensemble, jamais l’une sans l’autre.',
      action: 'Réponds Oui, puis re-synchronise ta fenêtre sur les deux derniers chiffres AFFICHÉS : 3 puis 5.',
      pitfall:
        'Après un Oui, le cerveau garde le chiffre « vainqueur » et décale toute la suite d’un cran. C’est la principale cause d’effondrement en milieu de série.',
    },
    {
      scene: 'plain',
      title: 'Le neutre — Non, mais un Non cliqué',
      observe: 'Le 8 n’a aucun écho deux coups avant. C’est Non — et ce Non doit être cliqué comme les autres.',
      why: 'Il n’y a pas de « ne rien faire » dans ce test : chaque position exige un bouton. Une décision non prise est une faute.',
    },
    {
      scene: 'lure1',
      title: 'Le lure à 3 coups — le piège',
      observe:
        'Un 3 réapparaît. Il « sonne familier »… mais il répète le chiffre d’il y a TROIS coups, pas deux. C’est Non.',
      why: 'C’est le piège central du test, présent dans une part importante des non-matches (et sa densité augmente avec le niveau). La familiarité est un signal de fréquence, pas de position.',
      action: 'Règle de décision : « familier sans certitude de POSITION = Non ». Applique-la sans discuter.',
      pitfall: 'Cliquer Oui parce que « je l’ai vu récemment » : c’est exactement ce que le lure exploite.',
    },
    {
      scene: 'lure2',
      title: 'Le lure à 1 coup — l’autre versant',
      observe: 'Le 8 répète le chiffre immédiatement précédent. Encore plus tentant, et tout aussi faux : c’est Non.',
      why: 'Les lures existent des deux côtés (N−1 et N+1). Une répétition rapprochée est même plus saillante qu’un vrai match — d’où l’efficacité du piège.',
      action:
        'Le test intérieur correct est toujours le même : « est-il exactement à deux coups ? » Si tu ne peux pas répondre oui avec certitude, c’est Non.',
    },
    {
      scene: 'all',
      title: 'Tenir 42 chiffres',
      observe:
        'Une série complète, c’est trois minutes de comptine mentale ininterrompue. Les dix dernières positions concentrent les erreurs.',
      why:
        'La performance ne vient pas de la vitesse mais de la stabilité du rythme subvocal. Dès qu’il se relâche, la fenêtre se décale et les erreurs arrivent en grappe.',
      action:
        'Garde la répétition jusqu’au dernier chiffre. Entre deux séries, respire une fois profondément et vide EXPLICITEMENT la fenêtre précédente : ses restes fabriquent de faux lures dans la série suivante.',
    },
  ],
};
