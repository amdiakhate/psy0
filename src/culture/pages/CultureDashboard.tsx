import { Link } from 'react-router-dom';
import { mulberry32 } from '../../core/rng';
import { Sparkline } from '../../components/Sparkline';
import { QUESTIONS } from '../bank';
import { CULTURE_CATEGORIES, CULTURE_CATEGORY_BY_ID } from '../data/categories';
import { categoryCoreCoverageLabel, categoryCoreCoveragePercent } from '../dashboardMetrics';
import { CULTURE_DRILL_LABELS, getDrillDashboardStats } from '../drillStatistics';
import { useCultureStore } from '../hooks/useCultureStore';
import { selectReviewQuestions } from '../selection';
import { getCultureDashboardStats } from '../statistics';
import { setFinalStretch } from '../storage';
import { hasActiveError } from '../progress';

export function CultureDashboard() {
  const { store, updateStore } = useCultureStore();
  const now = new Date();
  const stats = getCultureDashboardStats(QUESTIONS, store, now);
  const drillStats = getDrillDashboardStats(store.drillAttempts, now);
  const weakFocus = stats.weakest.slice(0, 3);
  const exploreFocus = stats.toExplore.slice(0, Math.max(0, 3 - weakFocus.length));
  const recommendation = selectReviewQuestions(QUESTIONS, store, store.finalStretch ? 30 : 20, now, mulberry32(now.getDate() + 2026), { finalStretch: store.finalStretch });
  const todayErrors = recommendation.filter((question) => hasActiveError(store.progress[question.id])).length;
  const todayNavigation = recommendation.filter((question) => question.categories.includes('navigation')).length;
  const todayAirFrance = recommendation.filter((question) => question.categories.includes('air-france')).length;
  const todayInstruments = recommendation.filter((question) => question.categories.includes('instruments')).length;
  const values = stats.lastSevenDays.map((day) => day.accuracy);

  return (
    <div>
      <section className="overflow-hidden rounded-2xl border border-sky-900/60 bg-gradient-to-br from-sky-950/60 via-zinc-900/70 to-zinc-950 p-5 md:p-7">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-sky-800 bg-sky-950 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-sky-300">Recommandation du jour</span>
              {store.finalStretch && <span className="rounded-full border border-amber-700 bg-amber-950/40 px-2.5 py-1 text-xs text-amber-300">Dernière ligne droite</span>}
            </div>
            <h3 className="mt-4 text-3xl font-bold tracking-tight">Commence par ce qui rapporte maintenant.</h3>
            <p className="mt-2 max-w-xl text-zinc-400">{todayErrors > 0 ? `${todayErrors} erreur${todayErrors > 1 ? 's' : ''} récente${todayErrors > 1 ? 's' : ''}, puis les échéances et tes thèmes faibles.` : 'Les notions prioritaires, les questions dues et du contenu nouveau — sans sur-réviser ce qui est déjà acquis.'}</p>
            {store.finalStretch && <div className="mt-4 grid max-w-xl grid-cols-2 gap-2 text-sm sm:grid-cols-4"><PlanCount value={todayErrors} label="erreurs"/><PlanCount value={todayNavigation} label="navigation"/><PlanCount value={todayAirFrance} label="Air France"/><PlanCount value={todayInstruments} label="instruments"/></div>}
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to={`/culture/review?count=${recommendation.length}`} className="rounded-lg bg-sky-600 px-5 py-2.5 font-semibold text-white hover:bg-sky-500">Lancer la session · ~{Math.max(10, Math.round(recommendation.length * 0.8))} min</Link>
              <Link to="/culture/express" className="rounded-lg border border-zinc-700 px-5 py-2.5 text-zinc-200 hover:bg-zinc-800">Révision express</Link>
            </div>
          </div>
          {store.finalStretch ? <div className="grid grid-cols-2 gap-3">
            <Metric label="Couverture CORE" value={`${Math.round(stats.core.coverage * 100)} %`} detail={`${stats.core.seen}/${stats.core.total} vues`} tone="text-green-400" />
            <Metric label="CORE solides" value={`${Math.round(stats.core.solidRate * 100)} %`} detail={`${stats.core.solid}/${stats.core.seen} vues solides · réussite actuelle ${Math.round(stats.core.currentAccuracy * 100)} %`} tone="text-sky-400" />
            <Metric label="Exam ready" value={`${stats.core.examReady}/${stats.core.total}`} detail="deux sessions espacées" tone="text-emerald-300" />
            <Metric label="Erreurs actives" value={String(stats.errors)} detail="à reconfirmer" tone="text-red-400" />
          </div> : <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
            <Metric label="CORE" value={`${stats.core.seen}/${stats.core.total}`} detail="questions vues" tone="text-sky-300" />
            <Metric label="EXTENDED" value={`${stats.extended.seen}/${stats.extended.total}`} detail="questions vues" tone="text-zinc-300" />
            <Metric label="Couverture CORE" value={`${Math.round(stats.core.coverage * 100)} %`} detail={`${stats.core.examReady} exam ready`} tone="text-green-400" />
            <Metric label="Réussite actuelle CORE" value={`${Math.round(stats.core.currentAccuracy * 100)} %`} detail="dernier verdict par question" tone="text-sky-400" />
            <Metric label="Précision des tentatives" value={`${Math.round(stats.core.attemptAccuracy * 100)} %`} detail="historique CORE" tone="text-zinc-300" />
            <Metric label="Erreurs" value={String(stats.errors)} detail="encore actives" tone="text-red-400" />
          </div>}
        </div>
      </section>

      <DrillOverview stats={drillStats} />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
        <div>
          <p className="font-medium">Mode dernière ligne droite</p>
          <p className="text-sm text-zinc-500">Priorise erreurs, points faibles et essentiels ; réduit les notions parfaitement connues.</p>
        </div>
        <button type="button" role="switch" aria-checked={store.finalStretch} onClick={() => updateStore((current) => setFinalStretch(current, !current.finalStretch))} className={`rounded-full border px-4 py-2 text-sm font-semibold ${store.finalStretch ? 'border-amber-600 bg-amber-950/40 text-amber-300' : 'border-zinc-700 text-zinc-400'}`}>{store.finalStretch ? 'Activé' : 'Activer'}</button>
      </div>

      <section className="mt-7">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><p className="text-xs font-semibold uppercase tracking-widest text-amber-400">À travailler aujourd’hui</p><h3 className="mt-1 text-xl font-semibold">Priorités de couverture</h3></div>
        </div>
        {weakFocus.length > 0 && <div className="mt-4"><div className="flex items-center justify-between gap-3"><h4 className="text-sm font-semibold text-zinc-300">Points faibles</h4><Link to="/culture/review?filter=weak&count=15" className="text-sm text-sky-400 hover:text-sky-300">Session ciblée →</Link></div><div className="mt-2 grid gap-3 md:grid-cols-3">{weakFocus.map((item, index) => <PriorityCard key={item.category} item={item} index={index} kind="weak" />)}</div></div>}
        {exploreFocus.length > 0 && <div className="mt-5"><h4 className="text-sm font-semibold text-zinc-300">À explorer davantage</h4><div className="mt-2 grid gap-3 md:grid-cols-3">{exploreFocus.map((item, index) => <PriorityCard key={item.category} item={item} index={weakFocus.length + index} kind="explore" />)}</div></div>}
      </section>

      <section className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <Action to="/culture/review" label="Réviser" detail="Priorités du jour" />
        <Action to="/culture/quiz" label="Quiz rapide" detail="5, 10 ou 20" />
        <Action to="/culture/errors" label="Mes erreurs" detail={`${stats.errors} actives`} />
        <Action to="/culture/simulation" label="Simulation" detail="20 questions" />
        <Action to="/culture/lessons" label="Fiches" detail="Cours courts" />
        <Action to="/culture/favorites" label="Favoris" detail="À revoir" />
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between"><h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">Progression par catégorie</h3><div className="flex items-center gap-3 text-xs text-zinc-500"><Sparkline values={values} /><span>{stats.streak} j de suite</span></div></div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {CULTURE_CATEGORIES.map((category) => {
            if (category.id === 'mental-math') return <DrillCategoryCard key={category.id} stats={drillStats} />;
            const item = stats.categories.find((entry) => entry.category === category.id)!;
            const percent = categoryCoreCoveragePercent(item);
            return <Link key={category.id} to={category.id === 'air-france' ? '/culture/air-france' : `/culture/quiz?category=${category.id}`} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 transition hover:border-zinc-700"><div className="flex items-center justify-between gap-3"><p className="font-medium">{category.label}</p><span className="font-mono text-sm text-zinc-500">{item.accuracy === null ? '—' : `${Math.round(item.accuracy * 100)} %`}</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-800"><div className="h-full bg-green-600" style={{ width: `${percent}%` }} /></div><p className="mt-2 text-xs text-zinc-600">{categoryCoreCoverageLabel(item)} · {item.mastered} maîtrisées · {item.due} dues</p></Link>;
          })}
        </div>
      </section>

      <p className="mt-6 text-xs text-zinc-600">Dernier entraînement : {stats.lastTrainingAt ? new Date(stats.lastTrainingAt).toLocaleString('fr-FR') : 'aucun — commence par la recommandation du jour'}</p>
    </div>
  );
}

function Metric({ label, value, detail, tone }: { label: string; value: string; detail: string; tone: string }) { return <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-4"><p className="text-xs uppercase tracking-wider text-zinc-500">{label}</p><p className={`mt-1 font-mono text-2xl font-bold ${tone}`}>{value}</p><p className="mt-1 text-xs text-zinc-600">{detail}</p></div>; }
function DrillOverview({ stats }: { stats: ReturnType<typeof getDrillDashboardStats> }) {
  const visibleTypes = stats.byType.filter((item) => item.type !== 'time-conversion' || item.attempts > 0);
  return <section className="mt-4 rounded-2xl border border-cyan-900/50 bg-cyan-950/10 p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-widest text-cyan-400">Calculs & caps</p><h3 className="mt-1 text-xl font-semibold">Exercices générés, statistiques séparées du CORE</h3></div><Link to="/culture/drills" className="rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-600">Continuer le drill</Link></div><div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4"><DrillMetric label="Réussite" value={formatRate(stats.successRate)} /><DrillMetric label="Réalisés" value={String(stats.total)} /><DrillMetric label="Aujourd’hui" value={String(stats.today)} /><DrillMetric label="Dernière session" value={stats.lastAttemptAt ? new Date(stats.lastAttemptAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Aucune'} /></div><div className="mt-5 grid gap-2 md:grid-cols-2">{visibleTypes.map((item) => <div key={item.type} className="flex items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm"><div><p className="text-zinc-300">{CULTURE_DRILL_LABELS[item.type]}</p><p className="text-xs text-zinc-600">{item.attempts} tentative{item.attempts > 1 ? 's' : ''}{!item.sampleSufficient ? ' · échantillon faible' : ''}</p></div><span className="font-mono text-cyan-300">{formatRate(item.rate)}</span></div>)}</div>{stats.weakest && <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-900/60 bg-amber-950/20 p-4"><div><p className="text-xs font-semibold uppercase tracking-wider text-amber-400">Drill recommandé aujourd’hui</p><p className="mt-1 font-medium">{CULTURE_DRILL_LABELS[stats.weakest.type]} · {formatRate(stats.weakest.rate)}</p><p className="text-xs text-zinc-500">{stats.weakest.correct}/{stats.weakest.attempts} corrects sur la fenêtre récente</p></div><Link to={`/culture/drills?type=${stats.weakest.type}&count=5`} className="rounded-lg bg-amber-700 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600">Faire 5 exercices</Link></div>}</section>;
}
function DrillCategoryCard({ stats }: { stats: ReturnType<typeof getDrillDashboardStats> }) { return <Link to="/culture/drills" className="rounded-xl border border-cyan-900/50 bg-cyan-950/10 p-4 transition hover:border-cyan-700"><div className="flex items-center justify-between gap-3"><div><p className="font-medium">Performances / calculs</p><p className="mt-1 text-xs text-cyan-500">Exercices générés</p></div><span className="font-mono text-sm text-cyan-300">{formatRate(stats.successRate)}</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-800"><div className="h-full bg-cyan-600" style={{ width: `${Math.round((stats.successRate ?? 0) * 100)}%` }} /></div><p className="mt-2 text-xs text-zinc-500">{stats.total} exercice{stats.total > 1 ? 's' : ''} réalisé{stats.total > 1 ? 's' : ''} · activité dynamique</p></Link>; }
function DrillMetric({ label, value }: { label: string; value: string }) { return <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3"><p className="text-xs uppercase tracking-wider text-zinc-600">{label}</p><p className="mt-1 font-mono text-lg font-semibold text-cyan-300">{value}</p></div>; }
function formatRate(rate: number | null): string { return rate === null ? '—' : `${Math.round(rate * 100)} %`; }
function PriorityCard({ item, index, kind }: { item: ReturnType<typeof getCultureDashboardStats>['categories'][number]; index: number; kind: 'weak' | 'explore' }) { return <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"><div className="flex items-center justify-between"><span className="font-mono text-xs text-zinc-600">0{index + 1}</span><span className={`font-mono text-sm ${kind === 'weak' ? 'text-amber-400' : 'text-sky-400'}`}>{kind === 'weak' ? `${Math.round((item.accuracy ?? 0) * 100)} %` : `${item.coreUnseen} CORE à découvrir`}</span></div><p className="mt-4 font-semibold">{CULTURE_CATEGORY_BY_ID[item.category].label}</p><p className="mt-1 text-sm text-zinc-500">{kind === 'weak' ? `${item.sampleSize} questions distinctes · ${item.errors} erreur${item.errors > 1 ? 's' : ''}` : `${item.sampleSize}/5 pour un échantillon fiable · ${categoryCoreCoverageLabel(item)}`}</p></div>; }
function Action({ to, label, detail }: { to: string; label: string; detail: string }) { return <Link to={to} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition hover:border-sky-700 hover:bg-sky-950/20"><p className="font-semibold text-zinc-100">{label}</p><p className="mt-1 text-xs text-zinc-500">{detail}</p></Link>; }
function PlanCount({ value, label }: { value: number; label: string }) { return <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2"><span className="font-mono font-bold text-amber-300">{value}</span><span className="ml-1 text-zinc-500">{label}</span></div>; }
