import { Link } from 'react-router-dom';
import { mulberry32 } from '../../core/rng';
import { Sparkline } from '../../components/Sparkline';
import { QUESTIONS } from '../bank';
import { CULTURE_CATEGORIES, CULTURE_CATEGORY_BY_ID } from '../data/categories';
import { useCultureStore } from '../hooks/useCultureStore';
import { selectReviewQuestions } from '../selection';
import { getCultureDashboardStats } from '../statistics';
import { setFinalStretch } from '../storage';

const DEFAULT_FOCUS = ['instruments', 'weather', 'navigation'] as const;

export function CultureDashboard() {
  const { store, updateStore } = useCultureStore();
  const now = new Date();
  const stats = getCultureDashboardStats(QUESTIONS, store, now);
  const focus = [...stats.weakest.map((item) => item.category), ...DEFAULT_FOCUS]
    .filter((category, index, all) => all.indexOf(category) === index)
    .slice(0, 3);
  const recommendation = selectReviewQuestions(QUESTIONS, store, store.finalStretch ? 30 : 20, now, mulberry32(now.getDate() + 2026), { finalStretch: store.finalStretch });
  const todayErrors = recommendation.filter((question) => (store.progress[question.id]?.incorrectCount ?? 0) > 0).length;
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
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
            <Metric label="CORE" value={`${stats.core.seen}/${stats.core.total}`} detail="questions vues" tone="text-sky-300" />
            <Metric label="EXTENDED" value={`${stats.extended.seen}/${stats.extended.total}`} detail="questions vues" tone="text-zinc-300" />
            <Metric label="Couverture CORE" value={`${Math.round(stats.core.coverage * 100)} %`} detail={`${stats.core.mastered} maîtrisées`} tone="text-green-400" />
            <Metric label="Réussite CORE" value={`${Math.round(stats.core.accuracy * 100)} %`} detail="sur tes réponses" tone="text-sky-400" />
            <Metric label="À revoir" value={String(stats.toReview)} detail={`${stats.due} due${stats.due > 1 ? 's' : ''} aujourd’hui`} tone="text-amber-400" />
            <Metric label="Erreurs" value={String(stats.errors)} detail="encore actives" tone="text-red-400" />
          </div>
        </div>
      </section>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
        <div>
          <p className="font-medium">Mode dernière ligne droite</p>
          <p className="text-sm text-zinc-500">Priorise erreurs, points faibles et essentiels ; réduit les notions parfaitement connues.</p>
        </div>
        <button type="button" role="switch" aria-checked={store.finalStretch} onClick={() => updateStore((current) => setFinalStretch(current, !current.finalStretch))} className={`rounded-full border px-4 py-2 text-sm font-semibold ${store.finalStretch ? 'border-amber-600 bg-amber-950/40 text-amber-300' : 'border-zinc-700 text-zinc-400'}`}>{store.finalStretch ? 'Activé' : 'Activer'}</button>
      </div>

      <section className="mt-7">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><p className="text-xs font-semibold uppercase tracking-widest text-amber-400">À travailler aujourd’hui</p><h3 className="mt-1 text-xl font-semibold">Tes trois priorités</h3></div>
          <Link to={`/culture/review?filter=weak&count=15`} className="text-sm text-sky-400 hover:text-sky-300">Session ciblée →</Link>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {focus.map((category, index) => {
            const item = stats.categories.find((entry) => entry.category === category)!;
            return <div key={category} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4"><div className="flex items-center justify-between"><span className="font-mono text-xs text-zinc-600">0{index + 1}</span><span className={`font-mono text-sm ${item.accuracy === null ? 'text-zinc-600' : item.accuracy >= 0.75 ? 'text-green-400' : 'text-amber-400'}`}>{item.accuracy === null ? 'à découvrir' : `${Math.round(item.accuracy * 100)} %`}</span></div><p className="mt-4 font-semibold">{CULTURE_CATEGORY_BY_ID[category].label}</p><p className="mt-1 text-sm text-zinc-500">{item.errors} erreur{item.errors > 1 ? 's' : ''} · {item.due} due{item.due > 1 ? 's' : ''}</p></div>;
          })}
        </div>
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
            const item = stats.categories.find((entry) => entry.category === category.id)!;
            const percent = item.total === 0 ? 0 : Math.round(item.mastered / item.total * 100);
            return <Link key={category.id} to={category.id === 'air-france' ? '/culture/air-france' : `/culture/quiz?category=${category.id}`} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 transition hover:border-zinc-700"><div className="flex items-center justify-between gap-3"><p className="font-medium">{category.label}</p><span className="font-mono text-sm text-zinc-500">{item.accuracy === null ? '—' : `${Math.round(item.accuracy * 100)} %`}</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-800"><div className="h-full bg-green-600" style={{ width: `${percent}%` }} /></div><p className="mt-2 text-xs text-zinc-600">{item.seen}/{item.total} vues · {item.mastered} maîtrisées · {item.due} dues</p></Link>;
          })}
        </div>
      </section>

      <p className="mt-6 text-xs text-zinc-600">Dernier entraînement : {stats.lastTrainingAt ? new Date(stats.lastTrainingAt).toLocaleString('fr-FR') : 'aucun — commence par la recommandation du jour'}</p>
    </div>
  );
}

function Metric({ label, value, detail, tone }: { label: string; value: string; detail: string; tone: string }) { return <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-4"><p className="text-xs uppercase tracking-wider text-zinc-500">{label}</p><p className={`mt-1 font-mono text-2xl font-bold ${tone}`}>{value}</p><p className="mt-1 text-xs text-zinc-600">{detail}</p></div>; }
function Action({ to, label, detail }: { to: string; label: string; detail: string }) { return <Link to={to} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition hover:border-sky-700 hover:bg-sky-950/20"><p className="font-semibold text-zinc-100">{label}</p><p className="mt-1 text-xs text-zinc-500">{detail}</p></Link>; }
function PlanCount({ value, label }: { value: number; label: string }) { return <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2"><span className="font-mono font-bold text-amber-300">{value}</span><span className="ml-1 text-zinc-500">{label}</span></div>; }
