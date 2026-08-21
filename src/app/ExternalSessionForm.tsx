import { useMemo, useState } from 'react';
import type { ExerciseId } from '../core/types';
import { EXERCISES } from '../exercises';
import { FEELINGS } from '../core/logs';
import type { Feeling } from '../core/logs';
import { PROTOCOL_ROLES, ROLE_LABEL, isValidExternal } from '../coach/external-session';
import type { ExternalBlockEntry, ProtocolRole } from '../coach/external-session';
import { morningRoleDefaults, recordExternalSession } from '../coach/daily';
import type { MorningDuration } from '../coach/daily';

interface RowState {
  done: boolean;
  exercise: ExerciseId | '';
  pilotestClass: string;
  successPct: string;
}

const ROLE_HINT: Record<ProtocolRole, string> = {
  warmup: 'Les 5 min de mise en route (Grilles de calculs, en principe).',
  priority: 'La cible du jour. C’est ce bloc, et lui seul, qui fait tourner P1 → P2 → P3.',
  rotation: 'L’exercice du groupe de rotation programmé aujourd’hui.',
  psychomotor: 'Compté sur le cap de 12 min/jour, où qu’il ait été fait.',
};

/**
 * Consigner une séance faite ailleurs.
 *
 * Le formulaire est volontairement pré-rempli avec ce que le protocole
 * prévoyait : dans la plupart des cas le candidat a fait exactement ça, sur
 * Pilotest. Lui demander de tout ressaisir garantirait qu'il ne consigne rien —
 * et une séance non consignée vaut, pour le coach, une séance non faite.
 */
export function ExternalSessionForm({
  morningMin,
  onCancel,
  onSaved,
}: {
  morningMin: MorningDuration;
  onCancel: () => void;
  onSaved: (result: { complete: boolean; missing: ProtocolRole[]; rotationAdvanced: boolean }) => void;
}) {
  const defaults = useMemo(() => morningRoleDefaults(new Date(), morningMin), [morningMin]);
  const [rows, setRows] = useState<Record<ProtocolRole, RowState>>(() =>
    Object.fromEntries(
      PROTOCOL_ROLES.map((r) => [
        r,
        { done: false, exercise: defaults[r] ?? '', pilotestClass: '', successPct: '' },
      ]),
    ) as Record<ProtocolRole, RowState>,
  );
  const [psychoMin, setPsychoMin] = useState('');
  const [feeling, setFeeling] = useState<Feeling | ''>('');

  const patch = (role: ProtocolRole, next: Partial<RowState>) =>
    setRows((prev) => ({ ...prev, [role]: { ...prev[role], ...next } }));

  const blocks: ExternalBlockEntry[] = PROTOCOL_ROLES.filter(
    (r) => rows[r].done && rows[r].exercise !== '',
  ).map((r) => ({
    role: r,
    exercise: rows[r].exercise as ExerciseId,
    pilotestClass: rows[r].pilotestClass === '' ? undefined : Number(rows[r].pilotestClass),
    successPct: rows[r].successPct === '' ? undefined : Number(rows[r].successPct),
  }));

  const minutes = psychoMin === '' ? 0 : Number(psychoMin);
  const valid = isValidExternal(blocks, minutes);

  return (
    <div className="mt-4 rounded-2xl border border-zinc-700 bg-zinc-900/80 p-5">
      <h3 className="font-semibold">Consigner une séance faite ailleurs</h3>
      <p className="mt-1 text-sm text-zinc-500">
        Coche les blocs que tu as réellement faits. Les mesures sont facultatives — mieux vaut une
        ligne sans chiffre qu’un chiffre inventé, puisque c’est lui qui pilotera tes priorités.
      </p>

      <div className="mt-4 space-y-3">
        {PROTOCOL_ROLES.map((role) => {
          const row = rows[role];
          return (
            <div
              key={role}
              className={`rounded-lg border p-3 ${
                row.done ? 'border-sky-800 bg-sky-950/20' : 'border-zinc-800 bg-zinc-950/40'
              }`}
            >
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={row.done}
                  onChange={(e) => patch(role, { done: e.target.checked })}
                  className="mt-1 h-4 w-4 shrink-0 accent-sky-600"
                />
                <span>
                  <span className="font-medium text-zinc-200">{ROLE_LABEL[role]}</span>
                  <span className="block text-xs text-zinc-500">{ROLE_HINT[role]}</span>
                </span>
              </label>

              {row.done && (
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <label className="text-xs text-zinc-400">
                    Exercice
                    <select
                      value={row.exercise}
                      onChange={(e) => patch(role, { exercise: e.target.value as ExerciseId | '' })}
                      className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-sm text-zinc-200 focus:border-sky-600 focus:outline-none"
                    >
                      <option value="">—</option>
                      {EXERCISES.map((ex) => (
                        <option key={ex.id} value={ex.id}>
                          {ex.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-xs text-zinc-400">
                    Classe Pilotest (optionnel)
                    <select
                      value={row.pilotestClass}
                      onChange={(e) => patch(role, { pilotestClass: e.target.value })}
                      className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-sm text-zinc-200 focus:border-sky-600 focus:outline-none"
                    >
                      <option value="">—</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-xs text-zinc-400">
                    % de réussite (optionnel)
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={row.successPct}
                      onChange={(e) => patch(role, { successPct: e.target.value })}
                      placeholder="ex : 68"
                      className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-sky-600 focus:outline-none"
                    />
                  </label>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-xs text-zinc-400">
          Minutes de psychomoteur consommées ailleurs
          <input
            type="number"
            min={0}
            max={120}
            value={psychoMin}
            onChange={(e) => setPsychoMin(e.target.value)}
            placeholder="0"
            className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-sky-600 focus:outline-none"
          />
          <span className="mt-1 block text-zinc-600">
            Elles se décomptent du cap de 12 min/jour.
          </span>
        </label>
        <div className="text-xs text-zinc-400">
          Ressenti global (optionnel)
          <div className="mt-1 flex flex-wrap gap-2">
            {FEELINGS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFeeling(feeling === f ? '' : f)}
                className={`rounded-full border px-3 py-1 text-sm ${
                  feeling === f
                    ? 'border-sky-500 bg-sky-950/60 text-sky-300'
                    : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          disabled={!valid}
          onClick={() =>
            onSaved(
              recordExternalSession({
                blocks,
                psychoMin: minutes,
                feeling: feeling === '' ? undefined : feeling,
              }),
            )
          }
          className={`rounded-lg px-5 py-2 font-semibold ${
            valid
              ? 'bg-sky-600 text-white hover:bg-sky-500'
              : 'cursor-not-allowed bg-zinc-800 text-zinc-500'
          }`}
        >
          Enregistrer la séance
        </button>
        <button
          onClick={onCancel}
          className="text-sm text-zinc-500 underline-offset-4 hover:text-zinc-300 hover:underline"
        >
          Annuler
        </button>
        {!valid && (
          <span className="text-xs text-zinc-600">
            Coche au moins un bloc et choisis son exercice.
          </span>
        )}
      </div>
    </div>
  );
}
