import { FAMILIES } from '../core/types';
import type { ExerciseId } from '../core/types';
import { EXERCISES } from '../exercises';
import type { AnyExerciseModule } from '../exercises';
import { getSavedLevel } from '../core/session';

/**
 * Sélecteur d'exercices trié par catégories (les 8 familles, comme Pilotest).
 * Un exercice apparaît dans chacune de ses familles.
 */
export function ExercisePicker({
  selected,
  onSelect,
  showLevel = false,
}: {
  selected?: ExerciseId | null;
  onSelect: (m: AnyExerciseModule) => void;
  showLevel?: boolean;
}) {
  return (
    <div className="space-y-6">
      {FAMILIES.map((family) => {
        const members = EXERCISES.filter((e) => e.families.includes(family));
        if (members.length === 0) return null;
        return (
          <section key={family}>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
              {family}
            </h3>
            <div className="mt-2 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {members.map((e) => (
                <button
                  key={e.id}
                  onClick={() => onSelect(e)}
                  className={`rounded-lg border p-3 text-left ${
                    selected === e.id
                      ? 'border-sky-500 bg-sky-950/40'
                      : 'border-zinc-800 bg-zinc-900 hover:border-zinc-600'
                  }`}
                >
                  <p className="font-semibold">{e.name}</p>
                  {showLevel && (
                    <p className="mt-1 text-xs text-zinc-600">niveau actuel : {getSavedLevel(e.id)}</p>
                  )}
                </button>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
