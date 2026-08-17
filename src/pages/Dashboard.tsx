import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { getEvents } from '../core/eventlog';
import { getSessions, getSavedLevel } from '../core/session';
import { VERDICT_LABEL, gapExplanation, isAtLocalCeiling, pilotestGap } from '../analysis/pilotestGap';
import type { GapVerdict } from '../analysis/pilotestGap';
import { chartColors, readPreference, resolveTheme, systemPrefersDark } from '../core/theme';
import { computeStats, rankWeakest } from '../analysis/scores';
import { weakestTagOf } from '../analysis/errorTaxonomy';
import { fatigueReport } from '../analysis/fatigue';
import { bestWorstSlot } from '../analysis/timeOfDay';
import { detectPlateaus } from '../analysis/plateau';
import { currentStreak, dailyProgress, familyScores, sparklineOf, trendOf } from '../analysis/trends';
import { getExercise } from '../exercises';
import { useSession } from '../app/SessionContext';
import { Sparkline } from '../components/Sparkline';
import type { ExerciseStats } from '../analysis/scores';
import type { SessionRecord } from '../core/types';
import { getPrefs } from '../core/prefs';

const MODE_LABELS: Record<string, string> = {
  free: 'Libre',
  guided30: 'Guidée 30 min',
  guided60: 'Guidée 60 min',
  guided90: 'Guidée 1 h 30',
  guided120: 'Guidée 2 h',
  simulation: 'Simulation',
  sprint: 'Sprint',
};

export default function Dashboard() {
  // recharts prend ses couleurs en props : elles n'héritent pas des variables
  // CSS redéfinies par le thème, il faut donc les lui passer explicitement.
  const chart = chartColors(resolveTheme(readPreference(), systemPrefersDark()));
  const events = getEvents();
  const sessions = getSessions();
  const stats = computeStats();
  const played = stats.filter((s) => s.items >= 10);
  const weakest = rankWeakest(played).slice(0, 3);
  const streak = currentStreak();
  const radar = familyScores();
  const progress = dailyProgress().slice(-30);
  const fatigue = fatigueReport();
  const slots = bestWorstSlot();
  const plateaus = detectPlateaus();
  const prefs = getPrefs();
  const hasPilotest = Object.values(prefs.pilotestClass).some((v) => v !== null && v !== undefined);

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-sm text-zinc-400">
          {events.length.toLocaleString('fr-FR')} items · {sessions.length} sessions ·{' '}
          <span className={streak >= 3 ? 'text-amber-400 font-semibold' : ''}>🔥 {streak} j de suite</span>
        </p>
      </div>

      {/* Tes 3 faiblesses */}
      <section className="mt-6">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-amber-400">
          Tes 3 faiblesses actuelles
        </h3>
        {weakest.length === 0 ? (
          <p className="mt-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 text-zinc-400">
            Pas encore assez de données (10 items minimum par exercice). Lance un entraînement libre
            ou une session guidée : le coach apprendra vite où tu pèches.
          </p>
        ) : (
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {weakest.map((s) => (
              <WeaknessCard key={s.exercise} stat={s} />
            ))}
          </div>
        )}
      </section>

      {/* Radar + progression */}
      <section className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">Les 8 familles</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radar} outerRadius="70%">
                <PolarGrid stroke={chart.grid} />
                <PolarAngleAxis dataKey="family" tick={{ fill: chart.axis, fontSize: 11 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar dataKey="score" stroke={chart.line} fill={chart.line} fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
            Progression (précision / jour)
          </h3>
          <div className="h-72">
            {progress.length < 2 ? (
              <p className="mt-8 text-center text-zinc-600">Reviens après quelques jours d'entraînement.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progress.map((p) => ({ ...p, pct: Math.round(p.accuracy * 100) }))}>
                  <XAxis dataKey="day" tick={{ fill: chart.axis, fontSize: 10 }} tickFormatter={(d: string) => d.slice(5)} />
                  <YAxis domain={[0, 100]} tick={{ fill: chart.axis, fontSize: 10 }} width={30} />
                  <Tooltip
                    contentStyle={{ background: chart.tooltipBg, border: `1px solid ${chart.tooltipBorder}`, borderRadius: 8 }}
                    labelStyle={{ color: chart.axis }}
                  />
                  <Line type="monotone" dataKey="pct" stroke={chart.line} strokeWidth={2} dot={false} name="Précision %" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>

      {/* Insights fatigue / horaire / plateaux */}
      {(fatigue.dropAtMinute !== null || slots !== null || plateaus.length > 0) && (
        <section className="mt-6 grid gap-3 md:grid-cols-3">
          {fatigue.dropAtMinute !== null && (
            <Insight title="Fatigue">
              Tu décroches vers la minute {fatigue.dropAtMinute} : ta précision chute de plus de 15
              points. Place tes exercices faibles AVANT ce cap, et le maintien après.
            </Insight>
          )}
          {slots !== null && (
            <Insight title="Créneau horaire">
              Tu es meilleur le {slots.best.slot} ({Math.round(slots.best.accuracy * 100)} %) que le{' '}
              {slots.worst.slot} ({Math.round(slots.worst.accuracy * 100)} %). Le test est le matin :
              privilégie les sessions du matin quand c'est possible.
            </Insight>
          )}
          {plateaus.slice(0, 1).map((p) => (
            <Insight key={p.exercise} title="Plateau détecté">
              {p.suggestion}
            </Insight>
          ))}
        </section>
      )}

      {/* Grille par exercice */}
      <section className="mt-8">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">Par exercice</h3>
        <div className="mt-3 overflow-x-auto rounded-xl border border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-900 text-zinc-500">
              <tr>
                <th className="px-4 py-2">Exercice</th>
                <th className="px-2 py-2">Items</th>
                <th className="px-2 py-2">Précision</th>
                <th className="px-2 py-2">Temps médian</th>
                <th className="px-2 py-2">Score</th>
                <th className="px-2 py-2">7 j</th>
                <th className="px-2 py-2">Tendance</th>
                {hasPilotest && <th className="px-2 py-2">vs Pilotest</th>}
              </tr>
            </thead>
            <tbody>
              {stats.map((s) => {
                const module_ = getExercise(s.exercise);
                const t7 = trendOf(s.exercise, 7);
                return (
                  <tr key={s.exercise} className="border-t border-zinc-800/60">
                    <td className="px-4 py-2 font-medium">
                      {module_.name}
                      {isAtLocalCeiling(getSavedLevel(s.exercise), module_.levels) && s.items >= 10 && (
                        <Link
                          to={`/tips/${s.exercise}`}
                          title="Plafond de la difficulté adaptative : vérifie sur Pilotest avant de sortir cet exercice des priorités."
                          className="ml-2 rounded-full bg-amber-950/60 px-2 py-0.5 text-xs font-normal text-amber-400 hover:bg-amber-900/60"
                        >
                          plafond
                        </Link>
                      )}
                    </td>
                    <td className="px-2 py-2 text-zinc-400">{s.items}</td>
                    <td className="px-2 py-2">
                      {s.items > 0 ? (
                        <span className={s.accuracy >= 0.75 ? 'text-green-400' : s.accuracy >= 0.55 ? 'text-amber-400' : 'text-red-400'}>
                          {Math.round(s.accuracy * 100)} %
                        </span>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="px-2 py-2 text-zinc-400">
                      {s.medianRtMs > 0 && module_.timed === 'per-item' ? `${(s.medianRtMs / 1000).toFixed(1)} s` : '—'}
                    </td>
                    <td className="px-2 py-2 font-mono font-semibold">{s.items > 0 ? s.score : '—'}</td>
                    <td className="px-2 py-2">
                      {t7 === null ? (
                        <span className="text-zinc-600">—</span>
                      ) : (
                        <span className={t7 >= 0 ? 'text-green-400' : 'text-red-400'}>
                          {t7 >= 0 ? '+' : ''}
                          {Math.round(t7 * 100)} pt
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-2">
                      <Sparkline values={sparklineOf(s.exercise)} />
                    </td>
                    {hasPilotest && <PilotestGapCell stat={s} declared={prefs.pilotestClass[s.exercise] ?? null} />}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Historique avec drill-down */}
      <section className="mt-8">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">Historique des sessions</h3>
        {sessions.length === 0 ? (
          <p className="mt-3 text-zinc-500">Aucune session pour l'instant.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {[...sessions]
              .reverse()
              .slice(0, 15)
              .map((s) => (
                <SessionRow key={s.sessionId} session={s} />
              ))}
          </ul>
        )}
      </section>
    </div>
  );
}

const VERDICT_STYLES: Record<GapVerdict, string> = {
  surestime: 'border-red-800 bg-red-950/40 text-red-300',
  coherent: 'border-zinc-700 bg-zinc-900 text-zinc-400',
  'sous-estime': 'border-sky-800 bg-sky-950/40 text-sky-300',
};

/**
 * Écart entre le niveau atteint ici et la classe Pilotest déclarée. Un écart
 * positif signifie que la salle de drill locale flatte le niveau réel : c'est
 * le signe qu'on s'optimise pour son propre clone plutôt que pour le test.
 */
function PilotestGapCell({ stat, declared }: { stat: ExerciseStats; declared: number | null }) {
  if (declared === null || stat.items < 10) {
    return <td className="px-2 py-2 text-zinc-600">—</td>;
  }
  const module_ = getExercise(stat.exercise);
  const gap = pilotestGap(getSavedLevel(stat.exercise), module_.levels, declared);
  return (
    <td className="px-2 py-2">
      <span
        title={gapExplanation(gap)}
        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${VERDICT_STYLES[gap.verdict]}`}
      >
        {VERDICT_LABEL[gap.verdict]}
        <span className="font-mono opacity-70">
          {gap.gap > 0 ? `+${gap.gap}` : gap.gap}
        </span>
      </span>
    </td>
  );
}

function Insight({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-sky-900/50 bg-sky-950/20 p-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-sky-400">{title}</p>
      <p className="mt-1 text-sm text-zinc-300">{children}</p>
    </div>
  );
}

function SessionRow({ session }: { session: SessionRecord }) {
  const [open, setOpen] = useState(false);
  const items = session.blocks.reduce((n, b) => n + b.items, 0);
  const correct = session.blocks.reduce((n, b) => n + b.correct, 0);

  return (
    <li className="rounded-lg border border-zinc-800 bg-zinc-900/50">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-2 text-sm hover:bg-zinc-900"
      >
        <span className="text-zinc-300">
          {open ? '▾' : '▸'} {MODE_LABELS[session.mode] ?? session.mode} ·{' '}
          {new Date(session.startedAt).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
          <span className="ml-2 text-zinc-500">{Math.round((session.endedAt - session.startedAt) / 60000)} min</span>
        </span>
        <span className="text-zinc-400">
          {items} items ·{' '}
          <span className={items > 0 && correct / items >= 0.75 ? 'text-green-400' : 'text-amber-400'}>
            {items > 0 ? `${Math.round((100 * correct) / items)} %` : '—'}
          </span>
        </span>
      </button>
      {open && <SessionDetail session={session} />}
    </li>
  );
}

function SessionDetail({ session }: { session: SessionRecord }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const events = getEvents().filter((e) => e.sessionId === session.sessionId);

  return (
    <div className="border-t border-zinc-800 px-4 py-3">
      {session.blocks.map((b, i) => {
        const name = getExercise(b.exercise).name;
        const key = `${i}`;
        const blockEvents = events.filter((e) => e.exercise === b.exercise);
        return (
          <div key={i} className="py-1">
            <button
              onClick={() => setExpanded(expanded === key ? null : key)}
              className="flex w-full items-center justify-between text-sm text-zinc-400 hover:text-zinc-200"
            >
              <span>
                {expanded === key ? '▾' : '▸'} {name}
              </span>
              <span>
                {b.correct}/{b.items} · {(b.avgRtMs / 1000).toFixed(1)} s/item · niveau {b.endLevel}
              </span>
            </button>
            {expanded === key && (
              <ul className="mt-1 max-h-56 space-y-0.5 overflow-y-auto rounded bg-zinc-950/60 p-2 font-mono text-xs">
                {blockEvents.slice(0, 100).map((e, j) => (
                  <li key={j} className={e.correct ? 'text-zinc-500' : 'text-red-400'}>
                    {e.correct ? '✓' : '✗'} [{e.tags.join(', ')}] {(e.rtMs / 1000).toFixed(1)}s — donné : {e.given}
                    {!e.correct && e.expected !== '—' ? ` · attendu : ${e.expected}` : ''}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

function WeaknessCard({ stat }: { stat: ExerciseStats }) {
  const { start } = useSession();
  const module_ = getExercise(stat.exercise);
  const weakTag = weakestTagOf(stat.exercise);

  return (
    <div className="rounded-xl border border-amber-900/50 bg-zinc-900/70 p-4">
      <div className="flex items-baseline justify-between">
        <p className="font-semibold">{module_.name}</p>
        <p className="font-mono text-2xl font-bold text-amber-400">{stat.score}</p>
      </div>
      <p className="mt-1 text-sm text-zinc-400">
        {Math.round(stat.accuracy * 100)} % de précision sur {stat.items} items
      </p>
      {weakTag ? (
        <p className="mt-2 text-sm text-red-400">
          Sous-type faible : « {weakTag.tag} » — {Math.round(weakTag.errorRate * 100)} % d'erreurs
        </p>
      ) : (
        <p className="mt-2 text-sm text-zinc-500">Pas de sous-type dominant : faiblesse globale.</p>
      )}
      <button
        onClick={() =>
          start({
            mode: 'free',
            blocks: [
              {
                exercise: stat.exercise,
                level: 'adaptive',
                durationSec: 300,
                tagFilter: weakTag?.tag,
                label: weakTag ? `Drill ciblé : ${weakTag.tag}` : undefined,
              },
            ],
            briefing: [
              `Drill : ${module_.name}${weakTag ? ` — sous-type « ${weakTag.tag} »` : ''}.`,
              weakTag
                ? `Tu fais ${Math.round(weakTag.errorRate * 100)} % d'erreurs sur ce sous-type (base : ${Math.round(weakTag.baseRate * 100)} %).`
                : 'Faiblesse globale : on retravaille les fondamentaux de cet exercice.',
              'Objectif : 5 minutes propres, précision avant vitesse.',
            ],
          })
        }
        className="mt-3 w-full rounded-lg bg-amber-600 py-2 font-semibold text-zinc-950 hover:bg-amber-500"
      >
        Drill maintenant
      </button>
    </div>
  );
}
