/**
 * Illustration statique du M2 Back : le dispositif réel (1 s d'affichage,
 * puis 3 s avec les deux boutons) et une séquence annotée qui montre le match,
 * le lure N±1 (LE piège) et les positions neutres.
 */
const SEQ: Array<{ digit: number; kind: 'warmup' | 'match' | 'lure' | 'plain'; note?: string }> = [
  { digit: 5, kind: 'warmup' },
  { digit: 3, kind: 'warmup' },
  { digit: 5, kind: 'match', note: '= il y a 2 → OUI' },
  { digit: 8, kind: 'plain', note: 'Non' },
  { digit: 3, kind: 'lure', note: '= il y a 3 (pas 2 !) → NON' },
  { digit: 3, kind: 'lure', note: '= il y a 1 (pas 2 !) → NON' },
];

const STYLE: Record<string, string> = {
  warmup: 'border-zinc-700 text-zinc-500',
  match: 'border-green-500 text-green-300 bg-green-950/40',
  lure: 'border-red-500 text-red-300 bg-red-950/40',
  plain: 'border-zinc-600 text-zinc-300',
};

export function NBackTip() {
  return (
    <div>
      <p className="text-sm text-zinc-300">
        Le dispositif, pour chacun des <span className="font-semibold text-sky-400">42 chiffres</span>{' '}
        d’une série :
      </p>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
        <div className="flex flex-col items-center gap-1">
          <div className="flex h-20 w-20 items-center justify-center rounded-xl border-2 border-zinc-600 bg-zinc-900 font-mono text-4xl font-bold text-zinc-100">
            7
          </div>
          <span className="text-[11px] text-zinc-500">1 s d’affichage</span>
        </div>
        <span className="text-2xl text-zinc-600">→</span>
        <div className="flex flex-col items-center gap-1">
          <div className="flex h-20 items-center gap-2">
            <span className="rounded-lg border-2 border-zinc-600 bg-zinc-900 px-5 py-2 font-semibold text-zinc-100">
              Oui
            </span>
            <span className="rounded-lg border-2 border-zinc-600 bg-zinc-900 px-5 py-2 font-semibold text-zinc-100">
              Non
            </span>
          </div>
          <span className="text-[11px] text-zinc-500">
            3 s pour trancher — sans réponse, c’est faux
          </span>
        </div>
      </div>

      <p className="mt-5 text-sm text-zinc-300">
        Séquence d’exemple : le chiffre est-il identique à celui de{' '}
        <span className="font-semibold text-sky-400">2 coups avant</span> ? Lis-la de gauche à droite
        comme si elle défilait :
      </p>
      <div className="mt-3 flex flex-wrap items-start justify-center gap-3">
        {SEQ.map((s, i) => (
          <div key={i} className="flex w-20 flex-col items-center gap-1">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-lg border-2 font-mono text-3xl font-bold ${STYLE[s.kind]}`}
            >
              {s.digit}
            </div>
            <p className="text-center text-[11px] leading-tight text-zinc-500">
              {s.kind === 'warmup' ? 'amorce' : s.note}
            </p>
          </div>
        ))}
      </div>
      <ul className="mt-4 space-y-1 text-sm text-zinc-400">
        <li>
          <span className="text-green-400">■ Match</span> : le 3ᵉ chiffre (5) est identique à celui
          d’il y a exactement 2 positions → bouton « Oui ».
        </li>
        <li>
          <span className="text-red-400">■ Lure</span> : les deux derniers 3 « sonnent familiers » —
          mais ils répètent à distance 3 puis 1, PAS 2. Si ça semble familier sans certitude de
          position, c’est presque toujours un lure : « Non ».
        </li>
        <li>
          <span className="text-zinc-300">■ Neutre</span> : un chiffre sans écho — c’est « Non », et
          ce Non doit être cliqué comme les autres.
        </li>
      </ul>
    </div>
  );
}
