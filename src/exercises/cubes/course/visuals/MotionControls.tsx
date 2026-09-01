export function MotionControls({ playing, onToggle, onReplay, label = 'animation' }: { playing: boolean; onToggle(): void; onReplay(): void; label?: string }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2" aria-label={`Contrôles de ${label}`}>
      <button type="button" onClick={onToggle} className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm font-semibold text-zinc-200 hover:border-sky-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400">
        {playing ? 'Pause' : 'Lecture'}
      </button>
      <button type="button" onClick={onReplay} className="rounded-lg border border-sky-800 bg-sky-950/30 px-3 py-2 text-sm font-semibold text-sky-300 hover:border-sky-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400">↻ Rejouer</button>
    </div>
  );
}

