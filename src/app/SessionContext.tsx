import { createContext, useContext, useState } from 'react';
import type { SessionPlan } from '../core/types';
import { guardPsycho } from '../coach/daily';

interface SessionCtx {
  active: SessionPlan | null;
  /** Message affiché quand un lancement est refusé ou amputé (cap Psychomoteur). */
  notice: string | null;
  start: (plan: SessionPlan) => void;
  exit: () => void;
  clearNotice: () => void;
}

const Ctx = createContext<SessionCtx>({
  active: null,
  notice: null,
  start: () => {},
  exit: () => {},
  clearNotice: () => {},
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState<SessionPlan | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Tout lancement passe par le garde-fou : cap dur Psychomoteur 12 min/jour,
  // quel que soit le mode (libre, sprint, guidée, simulation, session du jour).
  const start = (plan: SessionPlan) => {
    const guarded = guardPsycho(plan);
    if (guarded.plan === null) {
      setNotice(guarded.note ?? 'Session refusée.');
      return;
    }
    setNotice(guarded.note ?? null);
    setActive(guarded.plan);
  };

  return (
    <Ctx.Provider
      value={{ active, notice, start, exit: () => setActive(null), clearNotice: () => setNotice(null) }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useSession(): SessionCtx {
  return useContext(Ctx);
}
