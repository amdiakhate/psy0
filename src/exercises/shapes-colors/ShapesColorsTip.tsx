import { ShapeGlyph } from './ShapeGlyph';
import type { Color, Fill, Shape } from './generator';

/**
 * Illustration figée : l'arbre de décision officiel (remplissage d'abord),
 * puis quatre stimuli consécutifs annotés — dont un changement de branche,
 * LE moment où l'arbre doit être re-parcouru.
 */
const SEQ: Array<{
  shape: Shape;
  color: Color;
  fill: Fill;
  key: 'N' | 'X';
  why: string;
  danger?: boolean;
}> = [
  { shape: 'rond', color: 'bleu', fill: 'vide', key: 'N', why: 'vide → couleur → bleue → N' },
  { shape: 'triangle', color: 'orange', fill: 'vide', key: 'X', why: 'vide → couleur → orange → X' },
  {
    shape: 'triangle',
    color: 'bleu',
    fill: 'rempli',
    key: 'X',
    why: 'REMPLI → forme → triangulaire → X',
    danger: true,
  },
  { shape: 'carre', color: 'orange', fill: 'rempli', key: 'N', why: 'rempli → forme → carrée → N' },
];

export function ShapesColorsTip() {
  return (
    <div>
      <p className="text-sm text-zinc-300">
        Exemple de couple de règles (celui de l’énoncé officiel) et de ce qu’il produit sur quatre
        stimuli consécutifs :
      </p>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-zinc-700 bg-zinc-950/40 p-3 text-sm">
          <p className="font-semibold text-sky-400">Règle n°1 — forme VIDE</p>
          <p className="mt-1 text-zinc-300">
            <span className="font-mono text-sky-300">N</span> si BLEUE ·{' '}
            <span className="font-mono text-sky-300">X</span> si ORANGE
          </p>
          <p className="mt-1 text-xs text-zinc-500">La forme elle-même ne compte pas.</p>
        </div>
        <div className="rounded-lg border border-zinc-700 bg-zinc-950/40 p-3 text-sm">
          <p className="font-semibold text-sky-400">Règle n°2 — forme REMPLIE</p>
          <p className="mt-1 text-zinc-300">
            <span className="font-mono text-sky-300">N</span> si CARRÉE ·{' '}
            <span className="font-mono text-sky-300">X</span> si TRIANGULAIRE
          </p>
          <p className="mt-1 text-xs text-zinc-500">La couleur ne compte plus.</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-start justify-center gap-4">
        {SEQ.map((s, i) => (
          <div key={i} className="flex w-36 flex-col items-center gap-1">
            <div
              className={`flex h-24 w-24 items-center justify-center rounded-xl border-2 ${
                s.danger ? 'border-red-500 bg-red-950/30' : 'border-zinc-700 bg-zinc-950/40'
              }`}
            >
              <ShapeGlyph shape={s.shape} color={s.color} fill={s.fill} size={72} />
            </div>
            <span className="font-mono text-lg font-bold text-sky-300">{s.key}</span>
            <p className="text-center text-[11px] leading-tight text-zinc-500">{s.why}</p>
          </div>
        ))}
      </div>

      <ul className="mt-4 space-y-1.5 text-sm text-zinc-400">
        <li>
          <span className="font-semibold text-red-400">Le changement de branche</span> (3ᵉ stimulus,
          encadré) : le triangle est BLEU, comme le 1er stimulus qui valait N — mais il est REMPLI,
          donc la couleur ne décide plus rien. La bonne touche est X. C’est là que se concentrent les
          erreurs.
        </li>
        <li>
          <span className="font-semibold text-sky-300">L’ordre de lecture est fixe</span> : rempli ou
          vide ? — puis, et seulement ensuite, l’attribut de cette branche. Jamais l’inverse.
        </li>
        <li>
          <span className="font-semibold text-zinc-300">La forme disparaît en 0,5 s</span> : la
          décision se prend sur une image mémorisée, pas sur l’écran. Ce qu’il faut retenir tient en
          deux mots : « vide-bleu », « rempli-triangle ».
        </li>
      </ul>
    </div>
  );
}
