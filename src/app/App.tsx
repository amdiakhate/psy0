import { NavLink, Outlet } from 'react-router-dom';
import { useMemo } from 'react';
import { daysUntil, MILESTONE_60MIN, MILESTONE_SIMULATIONS, TEST_DATE, currentPhase, isCadredPhase } from '../core/config';
import { SessionProvider, useSession } from './SessionContext';
import { SessionRunner } from './SessionRunner';
import { SyncBar } from '../sync/SyncBar';

interface NavItem {
  to: string;
  label: string;
  /**
   * Masqué en période cadrée. Plus utilisé : l'entraînement libre l'était, au
   * motif qu'il détournerait des priorités. Le résultat était l'inverse — il
   * n'existait plus aucun moyen de travailler une famille précise, et l'entrée
   * disparaissait de la navigation sans rien dire. Le coach recommande ; il ne
   * cache pas.
   */
  hiddenWhenCadred?: boolean;
}

const NAV: NavItem[] = [
  { to: '/', label: "Aujourd'hui" },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/train', label: 'Entraînement libre' },
  { to: '/guided', label: 'Session guidée' },
  { to: '/simulation', label: 'Simulation PSY0' },
  { to: '/sprint', label: 'Psychomoteur quotidien' },
  { to: '/mental', label: 'Calcul mental' },
  { to: '/learn', label: 'Apprendre' },
  { to: '/tips', label: 'Astuces' },
  { to: '/settings', label: 'Réglages' },
];

function useNavItems(): NavItem[] {
  const cadred = useMemo(() => isCadredPhase(), []);
  return NAV.filter((n) => !(cadred && n.hiddenWhenCadred));
}

export default function App() {
  return (
    <SessionProvider>
      <Shell />
    </SessionProvider>
  );
}

function Shell() {
  const { active, exit, notice, clearNotice } = useSession();
  const navItems = useNavItems();

  if (active) {
    return (
      <div className="h-screen">
        <SessionRunner plan={active} onExit={exit} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {notice && (
        <div className="fixed inset-x-0 top-0 z-50 flex items-start justify-center p-3">
          <div className="flex max-w-xl items-start gap-3 rounded-xl border border-amber-700 bg-zinc-900 p-4 text-sm text-amber-200 shadow-xl">
            <p>{notice}</p>
            <button onClick={clearNotice} className="text-amber-400 hover:text-amber-200">✕</button>
          </div>
        </div>
      )}
      <aside className="flex w-56 shrink-0 flex-col border-r border-zinc-800 bg-zinc-900/40 max-md:hidden">
        <div className="px-4 py-5">
          <h1 className="text-lg font-bold tracking-tight">
            PSY0 <span className="text-sky-400">Trainer</span>
          </h1>
          <p className="text-xs text-zinc-500">Cadets Air France</p>
        </div>
        <nav className="flex flex-col gap-0.5 px-2">
          {navItems.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm ${
                  isActive ? 'bg-sky-950 text-sky-300 font-medium' : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto p-4">
          <Countdown />
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <MobileNav />
        <main className="mx-auto max-w-5xl p-4 md:p-8">
          <SyncBar />
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function MobileNav() {
  const navItems = useNavItems();
  return (
    <nav className="sticky top-0 z-10 flex gap-1 overflow-x-auto border-b border-zinc-800 bg-zinc-950/95 px-2 py-2 backdrop-blur md:hidden">
      {navItems.map((n) => (
        <NavLink
          key={n.to}
          to={n.to}
          end={n.to === '/'}
          className={({ isActive }) =>
            `whitespace-nowrap rounded-md px-3 py-1.5 text-sm ${
              isActive ? 'bg-sky-950 text-sky-300' : 'text-zinc-400'
            }`
          }
        >
          {n.label}
        </NavLink>
      ))}
    </nav>
  );
}

function Countdown() {
  const days = daysUntil(TEST_DATE);
  const phase = currentPhase();
  const milestones = [
    { d: daysUntil(MILESTONE_60MIN), label: 'Sessions 60 min' },
    { d: daysUntil(MILESTONE_SIMULATIONS), label: 'Simulations complètes' },
  ].filter((m) => m.d > 0);

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-3">
      <p className="text-3xl font-bold text-sky-400">J-{days}</p>
      <p className="text-xs text-zinc-500">Test PSY0 · 3 septembre</p>
      <div className="mt-2 space-y-1 text-xs text-zinc-400">
        {milestones.map((m) => (
          <p key={m.label}>
            <span className="text-zinc-500">J-{m.d} :</span> {m.label}
          </p>
        ))}
        <p className="pt-1 text-amber-400/80">
          {phase === 'guided30' && 'Phase actuelle : sessions 30 min'}
          {phase === 'guided60' && 'Phase actuelle : sessions 60 min'}
          {phase === 'simulation-first' && 'Phase actuelle : simulations !'}
        </p>
      </div>
    </div>
  );
}
