import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { exportAll, importAll, resetAll } from '../core/storage';
import { discardCache, getEvents } from '../core/eventlog';
import { getPrefs, savePrefs, arePrioritiesLocked, PRIORITIES_LOCKED_UNTIL } from '../core/prefs';
import { EXERCISES } from '../exercises';
import { exportDayLog } from '../core/logs';
import { parisMoment } from '../coach/daily-logic';
import { isCadredPhase } from '../core/config';
import { PREFERENCE_LABEL, THEME_PREFERENCES, readPreference, savePreference } from '../core/theme';
import type { ThemePreference } from '../core/theme';
import type { ExerciseId } from '../core/types';

export default function Settings() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const eventCount = getEvents().length;

  const doExport = () => {
    const blob = new Blob([exportAll()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `psy0-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const doImport = async (file: File) => {
    try {
      const { keys } = importAll(await file.text());
      // Sans cet abandon, le cache mémoire des events réécrirait l'historique
      // d'avant l'import au rechargement : la sauvegarde serait perdue.
      discardCache();
      setMessage(`Import réussi (${keys} clés). Recharge la page pour voir les données.`);
    } catch (e) {
      setMessage(`Échec de l'import : ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold">Réglages</h2>
      <div className="mt-6 space-y-6 max-w-xl">
        <ThemeSection />
        <PrioritiesSection />
        <PilotestSection />
        <DayLogSection />
        <FreeTrainingSection />
        <ExplainSection />
        <AdvancedSection />
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
          <h3 className="font-semibold">Sauvegarde</h3>
          <p className="mt-1 text-sm text-zinc-400">
            {eventCount.toLocaleString('fr-FR')} items enregistrés. Exporte régulièrement : tout est
            dans le localStorage de ce navigateur.
          </p>
          <div className="mt-3 flex gap-3">
            <button onClick={doExport} className="rounded-lg bg-sky-600 px-4 py-2 font-semibold hover:bg-sky-500">
              Exporter (JSON)
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="rounded-lg border border-zinc-700 px-4 py-2 hover:border-zinc-500"
            >
              Importer
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && doImport(e.target.files[0])}
            />
          </div>
          {message && <p className="mt-3 text-sm text-amber-400">{message}</p>}
        </section>

        {/* sections dynamiques au-dessus ; zone dangereuse en dernier */}
        <section className="rounded-xl border border-red-900/40 bg-zinc-900/60 p-5">
          <h3 className="font-semibold text-red-400">Zone dangereuse</h3>
          <p className="mt-1 text-sm text-zinc-400">Efface tout l'historique et les niveaux.</p>
          <button
            onClick={() => {
              if (window.confirm('Tout effacer ? Exporte d’abord si tu veux garder une trace.')) {
                resetAll();
                // Idem : sans cet abandon, le cache réécrirait les events effacés.
                discardCache();
                window.location.reload();
              }
            }}
            className="mt-3 rounded-lg border border-red-800 px-4 py-2 text-red-400 hover:bg-red-950/40"
          >
            Réinitialiser toutes les données
          </button>
        </section>
      </div>
    </div>
  );
}

/** Choix du thème. Appliqué immédiatement, sans rechargement. */
function ThemeSection() {
  const [preference, setPreference] = useState<ThemePreference>(readPreference);

  const choose = (p: ThemePreference) => {
    setPreference(p);
    savePreference(p);
  };

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
      <h3 className="font-semibold">Apparence</h3>
      <p className="mt-1 text-sm text-zinc-400">
        Le thème clair conserve les couleurs officielles des exercices — bleu et violet d'Airways,
        marine et gris des Formes glissées, bleu et orange des Formes et couleurs.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {THEME_PREFERENCES.map((p) => (
          <button
            key={p}
            onClick={() => choose(p)}
            aria-pressed={preference === p}
            className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
              preference === p
                ? 'border-sky-600 bg-sky-950/40 text-sky-300'
                : 'border-zinc-800 text-zinc-400 hover:border-zinc-600'
            }`}
          >
            {PREFERENCE_LABEL[p]}
          </button>
        ))}
      </div>
    </section>
  );
}

/**
 * Entraînement libre : retiré de la navigation en période cadrée, mais pas
 * supprimé. Choisir soi-même son exercice quand le programme est écrit, c'est
 * presque toujours éviter celui qui fait mal — d'où le détour par ici.
 */
function FreeTrainingSection() {
  if (!isCadredPhase()) return null;
  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
      <h3 className="font-semibold">Entraînement libre</h3>
      <p className="mt-1 text-sm text-zinc-400">
        Retiré du menu depuis le 18/08 : en période cadrée, le libre sert surtout à repousser les
        priorités. Il reste là pour un besoin ponctuel — revoir une mécanique, tester un niveau.
      </p>
      <Link
        to="/train"
        className="mt-3 inline-block rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-400 hover:border-zinc-500"
      >
        Ouvrir quand même
      </Link>
    </section>
  );
}

/** Correction visuelle après une erreur : montrer POURQUOI, pas seulement QUOI. */
function ExplainSection() {
  const [prefs, setPrefs] = useState(getPrefs);
  const withExplain = EXERCISES.filter((e) => e.Explain);
  const withHint = EXERCISES.filter((e) => e.hint);

  const toggle = () => {
    const fresh = getPrefs();
    const next = { ...fresh, explainOnError: !fresh.explainOnError };
    setPrefs(next);
    savePrefs(next);
  };

  const toggleHints = () => {
    const fresh = getPrefs();
    const next = { ...fresh, hintsEnabled: !fresh.hintsEnabled };
    setPrefs(next);
    savePrefs(next);
  };

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
      <h3 className="font-semibold text-zinc-300">Aide pendant l’entraînement</h3>
      <label className="mt-3 flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          checked={prefs.explainOnError}
          onChange={toggle}
          className="mt-0.5 h-4 w-4 accent-sky-600"
        />
        <span>
          <span className="font-medium text-zinc-200">Expliquer mes erreurs en image</span>
          <span className="block text-zinc-500">
            Après une erreur, la séance s'arrête et affiche le schéma qui montre pourquoi c'était
            cette réponse-là. Le temps de lecture n'est pas décompté du chrono du bloc, et
            l'explication ne s'affiche jamais en simulation — au test, personne ne t'explique rien.
          </span>
        </span>
      </label>
      <label className="mt-4 flex items-start gap-3 border-t border-zinc-800 pt-4 text-sm">
        <input
          type="checkbox"
          checked={prefs.hintsEnabled}
          onChange={toggleHints}
          className="mt-0.5 h-4 w-4 accent-amber-600"
        />
        <span>
          <span className="font-medium text-zinc-200">Astuces à la volée (touche H)</span>
          <span className="block text-zinc-500">
            Pendant un item, H révèle d'abord OÙ regarder, puis le premier geste de la méthode
            appliqué à cet item. Jamais la réponse. Un item résolu avec astuce est marqué comme tel
            dans ton historique, sinon ton niveau mesuré serait faussé — et comme la correction,
            les astuces ne s'affichent pas en simulation.
          </span>
        </span>
      </label>
      <p className="mt-3 text-sm text-zinc-500">
        {withHint.length > 0 && (
          <span className="block">Astuces sur : {withHint.map((e) => e.name).join(', ')}.</span>
        )}
        {withExplain.length === 0
          ? 'Aucun exercice ne sait encore se démontrer en image.'
          : `Schéma d'explication sur : ${withExplain.map((e) => e.name).join(', ')}.`}
      </p>
    </section>
  );
}

/** Bascules de mise au point. À retirer avant le test. */
function AdvancedSection() {
  const [prefs, setPrefs] = useState(getPrefs);

  const toggleFastHalfway = () => {
    const fresh = getPrefs();
    const next = { ...fresh, dev: { ...fresh.dev, fastHalfway: !fresh.dev.fastHalfway } };
    setPrefs(next);
    savePrefs(next);
  };

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
      <h3 className="font-semibold text-zinc-300">Avancé</h3>
      <label className="mt-3 flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          checked={prefs.dev.fastHalfway}
          onChange={toggleFastHalfway}
          className="mt-0.5 h-4 w-4 accent-sky-600"
        />
        <span>
          <span className="font-medium text-zinc-200">Simuler 45 min écoulées</span>
          <span className="block text-zinc-500">
            Déclenche l'écran de coupure de mi-parcours dès le premier bloc d'une séance de 1 h 30,
            pour le valider sans jouer 45 minutes. À décocher avant le 20/08 — sinon toutes tes
            séances longues te proposeront de couper au bout de 5 minutes.
          </span>
        </span>
      </label>
      {prefs.dev.fastHalfway && (
        <p className="mt-3 rounded-lg border border-amber-800/60 bg-amber-950/20 p-3 text-sm text-amber-300">
          Bascule active : la prochaine séance de 1 h 30 proposera la coupure après le premier bloc.
        </p>
      )}
    </section>
  );
}

/** P1/P2/P3 : les 3 priorités saisies le 17/08 au soir, rotation stricte des matins. */
function PrioritiesSection() {
  // État local des 3 slots : les choix partiels restent affichés ;
  // on ne persiste les priorités que quand les trois sont remplis.
  const [slots, setSlots] = useState<(ExerciseId | '')[]>(() => {
    const p = getPrefs().priorities;
    return p ? [...p] : ['', '', ''];
  });
  const today = parisMoment(new Date()).dayKey;
  const [unlocked, setUnlocked] = useState(false);
  const locked = arePrioritiesLocked(today) && !unlocked;
  const lockLabel = PRIORITIES_LOCKED_UNTIL.split('-').reverse().slice(0, 2).join('/');

  const setPriority = (index: number, id: ExerciseId | '') => {
    const next = [...slots];
    next[index] = id;
    setSlots(next);
    const prefs = getPrefs();
    savePrefs({
      ...prefs,
      priorities: next.every((p) => p !== '') ? (next as [ExerciseId, ExerciseId, ExerciseId]) : null,
    });
  };

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
      <h3 className="font-semibold">Priorités P1 / P2 / P3</h3>
      <p className="mt-1 text-sm text-zinc-400">
        La session du matin les travaille en rotation stricte P1 → P2 → P3 → P1… persistée (un jour
        raté ne remet rien à zéro).{' '}
        {locked && <span className="text-amber-400">Figées jusqu'au {lockLabel}.</span>}
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <label key={i} className="text-sm text-zinc-400">
            P{i + 1}
            <select
              value={slots[i]}
              disabled={locked}
              onChange={(e) => setPriority(i, e.target.value as ExerciseId | '')}
              className={`mt-1 w-full rounded-md border px-2 py-1.5 focus:outline-none ${
                locked
                  ? 'cursor-not-allowed border-zinc-800 bg-zinc-950 text-zinc-500'
                  : 'border-zinc-700 bg-zinc-900 text-zinc-200 focus:border-sky-600'
              }`}
            >
              <option value="">—</option>
              {EXERCISES.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      {locked ? (
        <button
          onClick={() => {
            if (window.confirm(`Changer de priorités avant le ${lockLabel} casse la rotation en cours. Continuer ?`)) {
              setUnlocked(true);
            }
          }}
          className="mt-3 rounded-lg border border-amber-800 px-4 py-2 text-sm text-amber-400 hover:bg-amber-950/30"
        >
          Débloquer pour modifier
        </button>
      ) : (
        slots.some((s) => s === '') && (
          <p className="mt-2 text-xs text-zinc-500">
            Incomplet : le coach utilise ton exercice le plus faible en attendant les trois.
          </p>
        )
      )}
    </section>
  );
}

/** Classe Pilotest par exercice (1-9) : sert à afficher l'écart local vs officiel au dashboard. */
function PilotestSection() {
  const [prefs, setPrefs] = useState(getPrefs);

  const setClass = (id: ExerciseId, value: string) => {
    // Toujours partir des prefs fraîches : une autre section a pu écrire entre-temps.
    const fresh = getPrefs();
    const next = {
      ...fresh,
      pilotestClass: { ...fresh.pilotestClass, [id]: value === '' ? null : Number(value) },
    };
    setPrefs(next);
    savePrefs(next);
  };

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
      <h3 className="font-semibold">Classes Pilotest actuelles</h3>
      <p className="mt-1 text-sm text-zinc-400">
        Ta classe officielle (1-9) par exercice. Le dashboard affichera l'écart avec tes perfs
        locales — pour repérer où ta salle de drill surestime ton niveau réel.
      </p>
      <div className="mt-3 grid gap-x-4 gap-y-2 sm:grid-cols-2">
        {EXERCISES.map((ex) => (
          <label key={ex.id} className="flex items-center justify-between gap-2 text-sm text-zinc-300">
            <span className="truncate">{ex.name}</span>
            <select
              value={prefs.pilotestClass[ex.id] ?? ''}
              onChange={(e) => setClass(ex.id, e.target.value)}
              className="w-16 rounded-md border border-zinc-700 bg-zinc-900 px-1 py-1 text-center focus:border-sky-600 focus:outline-none"
            >
              <option value="">—</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
    </section>
  );
}

/** Export texte brut du log du jour, une ligne par exercice. */
function DayLogSection() {
  const [copied, setCopied] = useState(false);
  const day = parisMoment(new Date()).dayKey;
  const text = exportDayLog(day);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copie manuelle :', text);
    }
  };

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
      <h3 className="font-semibold">Log du jour</h3>
      {text ? (
        <>
          <pre className="mt-2 overflow-x-auto rounded-md bg-zinc-950/60 p-3 font-mono text-xs text-zinc-400">{text}</pre>
          <button
            onClick={copy}
            className="mt-3 rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:border-zinc-500"
          >
            {copied ? 'Copié ✓' : 'Copier'}
          </button>
        </>
      ) : (
        <p className="mt-1 text-sm text-zinc-500">Aucun log aujourd'hui — il se remplit à la fin des sessions du matin.</p>
      )}
    </section>
  );
}