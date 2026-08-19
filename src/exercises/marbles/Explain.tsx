import { useMemo } from 'react';
import type { ExplainProps } from '../../core/types';
import { MoveAnimation } from './MoveAnimation';
import type { Move } from './MoveAnimation';
import { TubesSvg } from './TubesSvg';
import { optimalPath } from './model';
import type { State } from './model';
import type { MarblesQuestion } from './generator';

/**
 * Correction des Billes : la solution optimale REJOUÉE, coup par coup.
 *
 * C'est ce que fait Pilotest — sa page de règles l'annonce : « la correction
 * permet de visualiser de façon animée le passage de la configuration de départ
 * à la configuration d'arrivée étape par étape ». Et c'est le seul format qui
 * enseigne quelque chose ici : voir le nombre attendu ne dit pas POURQUOI il
 * faut ce nombre de coups, alors que regarder la séquence montre exactement où
 * partent les coups « perdus » à dégager une bille bloquante.
 *
 * Le chemin vient du solveur qui a servi à poser la question : l'animation ne
 * peut donc pas montrer une solution plus courte ou plus longue que la réponse.
 */
export function MarblesExplain({ item, answer }: ExplainProps<MarblesQuestion, string>) {
  const q = item.question;
  // La réponse du QCM est une chaîne : on la ramène au nombre pour comparer.
  const donne = Number(answer);
  const path = useMemo(() => optimalPath(q.start, q.goal), [q.start, q.goal]);
  const moves = useMemo(() => (path ? movesOf(path) : []), [path]);

  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-sm text-zinc-300">
        Il fallait <span className="font-semibold text-green-400">{q.answer}</span> déplacement
        {q.answer > 1 ? 's' : ''}
        {Number.isFinite(donne) && donne !== q.answer && (
          <>
            , tu as répondu <span className="font-semibold text-amber-400">{donne}</span>
          </>
        )}
        .
      </p>

      {moves.length > 0 ? (
        <>
          <p className="mt-4 text-xs uppercase tracking-widest text-zinc-500">
            La solution optimale, jouée
          </p>
          <div className="mt-2">
            <MoveAnimation start={q.start} moves={moves} />
          </div>
          <p className="mt-4 rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 text-sm text-zinc-200">
            Suis les coups un par un : ceux qui servent à DÉGAGER une bille avant de pouvoir en
            prendre une autre sont les coups « perdus ». Ce sont eux que le comptage doit prévoir,
            et c’est en les oubliant qu’on répond trop bas.
          </p>
        </>
      ) : (
        <div className="mt-4 flex flex-wrap items-start justify-center gap-6">
          <TubesSvg state={q.start} label="Départ" />
          <TubesSvg state={q.goal} label="Arrivée" />
        </div>
      )}
    </div>
  );
}

/** Le chemin d'états rendu en coups : quel tube perd une bille, lequel la reçoit. */
function movesOf(path: State[]): Move[] {
  const out: Move[] = [];
  for (let i = 1; i < path.length; i++) {
    const before = path[i - 1];
    const after = path[i];
    const from = before.findIndex((tube, t) => tube.length > after[t].length);
    const to = before.findIndex((tube, t) => tube.length < after[t].length);
    if (from < 0 || to < 0) continue;
    const marble = before[from][before[from].length - 1];
    out.push({
      from,
      to,
      note: `Coup ${i} — la bille ${marble} part du tube ${from + 1} vers le tube ${to + 1}.`,
    });
  }
  return out;
}
