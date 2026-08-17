/**
 * Illustration statique du Psychomoteur : l'écran réel figé, les trois tâches
 * annotées et la boucle de balayage.
 */
export function PsychomotorTip() {
  return (
    <div>
      <p className="text-sm text-zinc-300">
        L'écran réel : trois tâches simultanées, <span className="font-semibold text-sky-400">de même importance</span>{' '}
        selon la consigne officielle. Aucune ne se sacrifie.
      </p>

      <div className="mt-4 flex flex-col items-center gap-3">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-xl border-2 border-dashed border-zinc-600 bg-zinc-900">
              <svg width="48" height="48" viewBox="0 0 100 100">
                <path
                  d="M50,10 L61,40 L93,40 L67,59 L77,89 L50,71 L23,89 L33,59 L7,40 L39,40 Z"
                  fill="#a1a1aa"
                />
              </svg>
            </div>
            <p className="mt-1 text-[11px] text-zinc-500">l'encart pointillé</p>
          </div>

          <div className="text-center">
            <div className="relative flex h-32 w-32 items-center justify-center">
              <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-green-500 bg-zinc-900">
                <svg width="56" height="56" viewBox="0 0 100 100">
                  <path
                    d="M50,10 L61,40 L93,40 L67,59 L77,89 L50,71 L23,89 L33,59 L7,40 L39,40 Z"
                    fill="#e4e4e7"
                  />
                </svg>
              </div>
              <span className="absolute -right-5 text-3xl font-bold text-green-500">&gt;</span>
              <span className="absolute -top-7 font-mono text-2xl text-sky-400">↑</span>
            </div>
            <p className="mt-1 text-[11px] text-zinc-500">le cercle et son sens</p>
          </div>
        </div>

        <div className="rounded-full border-2 border-amber-500 bg-amber-950/20 px-6 py-1.5">
          <span className="font-mono text-xl tabular-nums text-zinc-100">47 + 28 = 78</span>
        </div>
      </div>

      <ul className="mt-5 space-y-2 text-sm text-zinc-400">
        <li>
          <span className="font-semibold text-sky-300">① Poursuite</span> — le cercle monte, tu
          MAINTIENS ↑. Le <span className="font-bold text-green-500">&gt;</span> vert confirme que
          c'est la bonne flèche. Tâche continue : elle est échantillonnée en permanence.
        </li>
        <li>
          <span className="font-semibold text-sky-300">② Formes</span> — encart et cercle montrent
          deux étoiles : elles sont identiques → <kbd className="rounded bg-zinc-800 px-1">Espace</kbd>,
          sans lâcher la flèche.
        </li>
        <li>
          <span className="font-semibold text-sky-300">③ Calcul</span> — 47 + 28 : 7+8 = 15, le
          résultat doit finir par 5. Il finit par 8 → faux →{' '}
          <kbd className="rounded bg-zinc-800 px-1">F</kbd>. Contrôle par les unités, jamais de
          recalcul complet.
        </li>
      </ul>

      <p className="mt-4 rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-sm text-zinc-300">
        <span className="font-semibold text-amber-400">La boucle</span> : cercle (flèche + vert) →
        formes → calcul → cercle, environ une seconde par tour. C'est la régularité du balayage qui
        fait le score, jamais les pics sur une tâche isolée.
      </p>
    </div>
  );
}
