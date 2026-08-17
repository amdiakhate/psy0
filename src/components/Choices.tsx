import type { ReactNode } from 'react';
import { useKeys } from '../hooks/useKeys';

/**
 * QCM générique : options répondables aux touches 1-9.
 * Utilisé par la plupart des exercices per-item.
 */
export function Choices({
  options,
  onPick,
  columns = 2,
}: {
  options: ReactNode[];
  onPick: (index: number) => void;
  columns?: number;
}) {
  useKeys((e) => {
    const n = Number(e.key);
    if (n >= 1 && n <= options.length) onPick(n - 1);
  });

  return (
    <div
      className="grid gap-3"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {options.map((opt, i) => (
        <button
          key={i}
          onClick={() => onPick(i)}
          className="flex items-center gap-3 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-left hover:border-sky-500 hover:bg-zinc-800 focus:outline-none"
        >
          <kbd className="rounded bg-zinc-800 px-2 py-0.5 font-mono text-sm text-sky-400 border border-zinc-600">
            {i + 1}
          </kbd>
          <span className="flex-1">{opt}</span>
        </button>
      ))}
    </div>
  );
}
