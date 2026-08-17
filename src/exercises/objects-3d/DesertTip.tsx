import { useMemo, useState } from 'react';
import { DesertView } from './DesertView';
import { SceneMap } from './SceneMap';
import { VIEWPOINT_COUNT } from './config';
import { OBJECT_LABELS, viewOrders, viewpointAngle } from './scene';
import { generate } from './generator';

/**
 * Démo interactive : une scène fixe, et les 8 points de vue à parcourir.
 * Le geste à ancrer — choisir DEUX objets repères et lire leur ordre gauche/droite,
 * puis vérifier lequel est devant l'autre.
 */
export function DesertTip() {
  const objects = useMemo(() => generate(11, 2, 'spread-layout').question.objects, []);
  const [k, setK] = useState(2);

  const orders = viewOrders(objects, viewpointAngle(k));
  const leftToRight = orders.leftToRight.map((i) => OBJECT_LABELS[objects[i].kind]).join(' › ');
  const nearest = OBJECT_LABELS[objects[orders.nearToFar[0]].kind];

  return (
    <div>
      <p className="text-sm text-zinc-300">
        Une seule scène, <span className="text-sky-400 font-semibold">huit points de vue</span> :
        clique les numéros et regarde l'ordre des objets se réorganiser. Chaque point de vue produit
        un ordre gauche→droite différent — c'est LA clé de l'exercice.
      </p>

      <div className="mt-4 flex flex-wrap items-start justify-center gap-5">
        <div className="w-[380px] max-w-full">
          <div className="aspect-[16/9] w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
            <DesertView objects={objects} viewpoint={k} />
          </div>
          <p className="mt-1 text-center text-xs text-zinc-500">vue depuis le point {k + 1}</p>
        </div>
        <div>
          <SceneMap objects={objects} highlight={k} onPick={setK} />
          <p className="mt-1 text-center text-xs text-zinc-500">clique un rond numéroté</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {Array.from({ length: VIEWPOINT_COUNT }, (_, i) => (
          <button
            key={i}
            onClick={() => setK(i)}
            className={`rounded-lg border px-3 py-1 text-sm ${
              i === k
                ? 'border-sky-500 bg-sky-950 text-sky-300'
                : 'border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-sky-600'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950/60 p-3 text-sm">
        <p className="text-zinc-300">
          <span className="text-zinc-500">De gauche à droite :</span> {leftToRight}
        </p>
        <p className="mt-1 text-zinc-300">
          <span className="text-zinc-500">Le plus proche :</span> {nearest}
        </p>
      </div>

      <p className="mt-4 text-sm text-zinc-400">
        Méthode : sur le plan, choisis les deux objets les plus éloignés l'un de l'autre. Le point de
        vue cherché est celui qui les voit dans l'ordre gauche→droite de l'image — il n'en reste
        généralement que deux, et la profondeur (qui est devant) tranche.
      </p>
    </div>
  );
}
