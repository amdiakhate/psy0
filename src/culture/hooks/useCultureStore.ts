import { useCallback, useState } from 'react';
import { loadCultureStore, saveCultureStore } from '../storage';
import type { CultureStore } from '../types';

export function useCultureStore() {
  const [store, setStore] = useState<CultureStore>(() => loadCultureStore());

  const updateStore = useCallback((update: (current: CultureStore) => CultureStore) => {
    setStore((current) => {
      const next = update(current);
      saveCultureStore(next);
      return next;
    });
  }, []);

  const refreshStore = useCallback(() => setStore(loadCultureStore()), []);
  return { store, updateStore, refreshStore };
}
