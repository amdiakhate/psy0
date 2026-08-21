import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MORNING_DURATIONS, getDailyOffer, psychoRemainingTodaySec } from '../coach/daily';
import type { MorningDuration } from '../coach/daily';
import { composeGuided } from '../coach/composer';
import { clearSuspended, remainingMinutes, resumableToday } from '../coach/suspended';
import { isAfterBedtime } from '../coach/daily-logic';
import { useSession } from '../app/SessionContext';
import { getPrefs, missingPilotestClasses } from '../core/prefs';
import { daysUntil, TEST_DATE, isCadredPhase } from '../core/config';
import { EXERCISES, getExercise } from '../exercises';
import { useKeys } from '../hooks/useKeys';

/**
 * Écran d'accueil : zéro décision. Un bouton, la bonne session.
 * La composition dépend de la date (Europe/Paris), du moment et de l'historique.
 */
export default function Today() {
  const { start } = useSession();
  // 60 min reste le format du protocole : monter à 1 h 30 ou 2 h est une
  // décision consciente du matin, pas un réglage qui se règle une fois.
  const [morningMin, setMorningMin] = useState<MorningDuration>(60);
  // Recalculé à chaque affichage (la page est légère, l'offre dépend de l'heure).
  const offer = useMemo(() => getDailyOffer(new Date(), morningMin), [morningMin]);
  const prefs = getPrefs();
  const bedtime = isAfterBedtime(offer.moment);
  const days = daysUntil(TEST_DATE);

  const isLocked = offer.decision.kind === 'locked';
  const [overrideUnlocked, setOverrideUnlocked] = useState(false);
  const [suspended, setSuspended] = useState(() => resumableToday(offer.moment.dayKey));

  // Le bilan reste proposé tant qu'il n'a pas été validé : c'est lui qui
  // apporte les classes Pilotest et les priorités, que rien d'autre ne fournit.
  const bilanPending = prefs.phase1ReviewAt === null;
  const missingClasses = useMemo(
    () => missingPilotestClasses(EXERCISES.map((e) => e.id), prefs),
    [prefs],
  );
  const showMissingBanner = isCadredPhase() && missingClasses.length > 0;

  return (
    <div className="mx-auto max-w-2xl">
      {bilanPending && !isLocked && (
        <Link
          to="/bilan"
          className="mb-4 block rounded-2xl border border-sky-700 bg-sky-950/30 p-5 transition-colors hover:border-sky-500"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-sky-400">
            À faire une fois
          </p>
          <h3 className="mt-1 text-lg font-bold">Bilan Phase 1 → Phase 2</h3>
          <p className="mt-1 text-sm text-zinc-400">
            Saisis tes 16 classes Pilotest et tes trois priorités en une passe. Sans elles, le coach
            ne peut pas cibler : il étale la matinée sur tes trois exercices les plus faibles au lieu
            d'en travailler un en profondeur.
          </p>
        </Link>
      )}

      {showMissingBanner && !isLocked && (
        <div className="mb-4 rounded-xl border border-amber-800/60 bg-amber-950/20 p-4 text-sm text-amber-200">
          {missingClasses.length} classe{missingClasses.length > 1 ? 's' : ''} Pilotest encore non
          saisie{missingClasses.length > 1 ? 's' : ''} ({missingClasses.slice(0, 3).map((id) => getExercise(id).name).join(', ')}
          {missingClasses.length > 3 ? '…' : ''}). Le dashboard ne peut pas comparer ton niveau local
          au niveau officiel sur ces exercices.{' '}
          <Link to="/bilan" className="underline hover:text-amber-100">
            Les compléter
          </Link>
        </div>
      )}

      {suspended && !isLocked && (
        <div className="mb-4 rounded-2xl border border-sky-800 bg-sky-950/30 p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-sky-400">
            Séance coupée à mi-parcours
          </p>
          <h3 className="mt-1 text-lg font-bold">{suspended.title}</h3>
          <p className="mt-1 text-sm text-zinc-400">
            {suspended.doneMin} min déjà faites · il reste {remainingMinutes(suspended)} min
            ({suspended.plan.blocks.length} blocs).
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={() => {
                clearSuspended();
                start(suspended.plan);
              }}
              className="rounded-lg bg-sky-600 px-5 py-2 font-semibold hover:bg-sky-500"
            >
              Reprendre la suite
            </button>
            <button
              onClick={() => {
                clearSuspended();
                setSuspended(null);
              }}
              className="rounded-lg border border-zinc-700 px-5 py-2 text-sm text-zinc-400 hover:border-zinc-500"
            >
              Abandonner cette moitié
            </button>
          </div>
        </div>
      )}

      {bedtime && !isLocked && (
        <div className="mb-4 rounded-xl border border-indigo-700/60 bg-indigo-950/30 p-4 text-sm text-indigo-200">
          🌙 Il est plus de 22 h 30 : à J-{days}, le sommeil rapporte plus que cette session. Elle
          reste lançable — mais demain matin vaut mieux que ce soir tard.
        </div>
      )}

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          {offer.moment.dayKey.split('-').reverse().slice(0, 2).join('/')} · J-{days} avant le test
        </p>
        <h2 className="mt-2 text-3xl font-bold">{offer.title}</h2>
        <p className="mt-3 text-zinc-400">{offer.subtitle}</p>
        {offer.note && <p className="mt-2 text-sm text-amber-400">{offer.note}</p>}

        {isLocked ? (
          <LockedOverride unlocked={overrideUnlocked} onUnlock={() => setOverrideUnlocked(true)} onLaunch={() => start(composeGuided(30))} />
        ) : offer.plan ? (
          <>
            {offer.decision.kind === 'buildup-morning' && (
              <MorningDurationPicker value={morningMin} onChange={setMorningMin} />
            )}
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <button
                onClick={() => start(offer.plan!)}
                className="rounded-xl bg-sky-600 px-8 py-3 text-lg font-semibold hover:bg-sky-500"
              >
                Lancer ma session
              </button>
              {offer.optional && (
                <span className="text-sm text-zinc-500">Optionnelle — passer n'est pas un échec.</span>
              )}
            </div>
          </>
        ) : offer.replay ? (
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button
              onClick={() => start(offer.replay!)}
              className="rounded-xl border border-zinc-600 px-6 py-2.5 font-semibold text-zinc-200 hover:border-sky-500 hover:text-sky-300"
            >
              Refaire le programme du matin
            </button>
            <span className="max-w-md text-sm text-zinc-500">
              Mêmes exercices, mêmes durées, questions nouvelles. Compté comme entraînement libre :
              ni rotation avancée, ni journal de fin, ni double comptage.
            </span>
          </div>
        ) : null}
      </div>

      {offer.decision.kind === 'buildup-morning' && prefs.priorities === null && (
        <p className="mt-4 rounded-xl border border-amber-800/60 bg-amber-950/20 p-4 text-sm text-amber-300">
          Session dégradée : sans P1/P2/P3, le coach répartit les trois passes sur tes trois
          exercices les plus faibles — une passe chacun. C'est un filet, pas une cible : 24 minutes
          sur UN exercice choisi, c'est ce qui fait bouger une classe.{' '}
          <Link to="/settings" className="text-sky-400 underline">Les saisir dans Réglages</Link>.
        </p>
      )}

      <p className="mt-4 text-center text-sm text-zinc-600">
        Psychomoteur restant aujourd'hui : {Math.floor(psychoRemainingTodaySec() / 60)} min / 12 min
      </p>
    </div>
  );
}

const DURATION_LABELS: Record<MorningDuration, { label: string; note: string }> = {
  60: { label: '60 min', note: 'le format du protocole' },
  90: { label: '1 h 30', note: '+ une priorité et une rotation' },
};

/**
 * Choix de la durée du matin. 60 min est le format écrit du protocole ; les
 * formats longs l'étendent sans en changer le cœur.
 */
function MorningDurationPicker({
  value,
  onChange,
}: {
  value: MorningDuration;
  onChange: (v: MorningDuration) => void;
}) {
  return (
    <div className="mt-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
        Durée de la séance
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {MORNING_DURATIONS.map((min) => (
          <button
            key={min}
            onClick={() => onChange(min)}
            aria-pressed={value === min}
            className={`rounded-lg border px-4 py-2 text-left text-sm transition-colors ${
              value === min
                ? 'border-sky-600 bg-sky-950/40 text-sky-200'
                : 'border-zinc-800 text-zinc-400 hover:border-zinc-600'
            }`}
          >
            <span className="block font-semibold">{DURATION_LABELS[min].label}</span>
            <span className="block text-xs text-zinc-500">{DURATION_LABELS[min].note}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Le 02/09 l'app est verrouillée. L'override existe mais est volontairement
 * pénible : il faut taper « je sais ce que je fais » au clavier, sans indice.
 */
function LockedOverride({
  unlocked,
  onUnlock,
  onLaunch,
}: {
  unlocked: boolean;
  onUnlock: () => void;
  onLaunch: () => void;
}) {
  const [buffer, setBuffer] = useState('');
  const SECRET = 'jesaiscequejefais';

  useKeys((e) => {
    if (e.key.length === 1) setBuffer((b) => (b + e.key.toLowerCase()).replace(/[^a-z]/g, '').slice(-SECRET.length));
  });

  useEffect(() => {
    if (buffer === SECRET) onUnlock();
  }, [buffer, onUnlock]);

  return (
    <div className="mt-6">
      <p className="text-lg text-zinc-300">
        🛌 Pas de bouton aujourd'hui. La meilleure préparation des dernières 24 h, c'est zéro
        entraînement.
      </p>
      {unlocked && (
        <button
          onClick={onLaunch}
          className="mt-4 rounded-lg border border-red-800 px-4 py-2 text-sm text-red-400 hover:bg-red-950/40"
        >
          Lancer quand même (tu sais que c'est une mauvaise idée)
        </button>
      )}
    </div>
  );
}
