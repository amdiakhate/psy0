import { NavLink, Outlet } from 'react-router-dom';

const LINKS = [
  { to: '/culture', label: 'Vue d’ensemble', end: true },
  { to: '/culture/air-france', label: 'Air France 2026' },
  { to: '/culture/review', label: 'Réviser' },
  { to: '/culture/quiz', label: 'Quiz' },
  { to: '/culture/errors', label: 'Erreurs' },
  { to: '/culture/lessons', label: 'Fiches' },
  { to: '/culture/favorites', label: 'À revoir' },
  { to: '/culture/express', label: 'Express' },
  { to: '/culture/simulation', label: 'Simulation' },
  { to: '/culture/drills', label: 'Calculs & caps' },
] as const;

export function CultureLayout() {
  return (
    <div className="max-w-5xl">
      <div className="mb-6 border-b border-zinc-800 pb-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">Préparation connaissances</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight">Culture Aéro</h2>
          </div>
          <p className="max-w-md text-right text-xs text-zinc-500">Module indépendant · aucun score ni classe Pilotest</p>
        </div>
        <nav aria-label="Navigation Culture Aéro" className="mt-4 flex gap-1 overflow-x-auto pb-1">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={'end' in link ? link.end : false}
              className={({ isActive }) => `whitespace-nowrap rounded-md px-3 py-1.5 text-sm transition ${
                isActive ? 'bg-sky-950 text-sky-300' : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'
              }`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <Outlet />
    </div>
  );
}
