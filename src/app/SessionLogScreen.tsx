import { useMemo, useState } from 'react';
import type { SessionPlan, SessionRecord } from '../core/types';
import type { BlockRole, ExerciseId } from '../core/types';
import { FEELINGS, saveLogEntries } from '../core/logs';
import type { Feeling } from '../core/logs';
import { buildLogRows } from '../core/log-rows';
import type { ExternalEntry } from '../coach/external';
import { getExercise } from '../exercises';
import { parisMoment } from '../coach/daily-logic';

const ROLE_BADGE: Record<BlockRole, string> = {
  warmup: 'échauffement',
  priority: 'priorité',
  rotation: 'rotation',
  psychomotor: 'psychomoteur',
};

/**
 * Log de fin de session (obligatoire pour les sessions du matin) :
 * ressenti en 1 chip, % d'erreurs auto-rempli, note libre optionnelle (140 car.).
 */
export function SessionLogScreen({
  record,
  plan,
  externals = [],
  onDone,
}: {
  record: SessionRecord;
  plan: SessionPlan;
  /** Créneaux faits sur Pilotest et saisis à la main pendant la séance. */
  externals?: ExternalEntry[];
  onDone: () => void;
}) {
  const rows = useMemo(
    () => buildLogRows({ played: record.blocks, planBlocks: plan.blocks, externals }),
    [record, plan, externals],
  );

  const [feelings, setFeelings] = useState<Partial<Record<ExerciseId, Feeling>>>({});
  // Les notes des créneaux externes sont déjà saisies : on les pré-remplit
  // plutôt que de demander deux fois la même chose.
  const [notes, setNotes] = useState<Partial<Record<ExerciseId, string>>>(() =>
    Object.fromEntries(externals.filter((e) => e.note).map((e) => [e.exercise, e.note!])),
  );

  const complete = rows.every((r) => feelings[r.exercise] !== undefined);

  const submit = () => {
    if (!complete) return;
    const day = parisMoment(new Date()).dayKey;
    saveLogEntries(
      rows.map((r) => ({
        day,
        ts: Date.now(),
        exercise: r.exercise,
        level: r.level,
        errPct: r.errPct,
        feeling: feelings[r.exercise]!,
        note: notes[r.exercise]?.trim() || undefined,
        role: r.role,
        passes: r.passes,
        external: r.external,
        pilotestClass: r.pilotestClass,
      })),
    );
    onDone();
  };

  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="w-full max-w-2xl rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
        <h2 className="text-xl font-semibold text-sky-400">Log de session</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Un ressenti par exercice — c'est ce qui pilote les prochaines sessions. 30 secondes, pas plus.
        </p>
        <div className="mt-4 max-h-[55vh] space-y-4 overflow-y-auto pr-1">
          {rows.map((r) => (
            <div key={r.exercise} className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-3">
              <div className="flex items-baseline justify-between">
                <p className="font-semibold">
                  {getExercise(r.exercise).name}
                  {r.role && (
                    <span className="ml-2 rounded-full bg-zinc-800 px-2 py-0.5 text-xs font-normal text-zinc-400">
                      {ROLE_BADGE[r.role]}
                      {r.passes > 1 && ` · ${r.passes} passes`}
                    </span>
                  )}
                </p>
                <p className="text-sm text-zinc-500">
                  {r.external ? (
                    <span className="text-amber-400">Pilotest · classe {r.pilotestClass}</span>
                  ) : (
                    `niveau ${r.level}`
                  )}{' '}
                  · <span className={r.errPct > 30 ? 'text-red-400' : 'text-zinc-400'}>{r.errPct}% err</span>
                </p>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {FEELINGS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFeelings((prev) => ({ ...prev, [r.exercise]: f }))}
                    className={`rounded-full border px-3 py-1 text-sm ${
                      feelings[r.exercise] === f
                        ? 'border-sky-500 bg-sky-950/60 text-sky-300'
                        : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <input
                type="text"
                maxLength={140}
                placeholder="Note libre (optionnelle, 140 car.) — ex : pièges miroirs"
                value={notes[r.exercise] ?? ''}
                onChange={(e) => setNotes((prev) => ({ ...prev, [r.exercise]: e.target.value }))}
                className="mt-2 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm placeholder:text-zinc-600 focus:border-sky-600 focus:outline-none"
              />
            </div>
          ))}
        </div>
        <button
          onClick={submit}
          disabled={!complete}
          className={`mt-5 w-full rounded-lg py-2.5 font-semibold ${
            complete ? 'bg-sky-600 hover:bg-sky-500' : 'cursor-not-allowed bg-zinc-800 text-zinc-600'
          }`}
        >
          {complete ? 'Valider le log' : 'Choisis un ressenti pour chaque exercice'}
        </button>
      </div>
    </div>
  );
}
