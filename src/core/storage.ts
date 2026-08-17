/** Toutes les clés localStorage du projet sont préfixées `psy0.` — export/import = dump/restore de ces clés. */

const PREFIX = 'psy0.';

export function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function saveJson(key: string, value: unknown): void {
  localStorage.setItem(PREFIX + key, JSON.stringify(value));
}

export function exportAll(): string {
  const dump: Record<string, unknown> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(PREFIX)) {
      dump[key] = JSON.parse(localStorage.getItem(key)!);
    }
  }
  return JSON.stringify({ app: 'psy0-trainer', exportedAt: Date.now(), data: dump }, null, 2);
}

export function importAll(json: string): { keys: number } {
  const parsed = JSON.parse(json) as { app?: string; data?: Record<string, unknown> };
  if (parsed.app !== 'psy0-trainer' || !parsed.data) {
    throw new Error('Fichier invalide : export psy0-trainer attendu.');
  }
  for (const [key, value] of Object.entries(parsed.data)) {
    if (key.startsWith(PREFIX)) localStorage.setItem(key, JSON.stringify(value));
  }
  return { keys: Object.keys(parsed.data).length };
}

export function resetAll(): void {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(PREFIX)) keys.push(key);
  }
  keys.forEach((k) => localStorage.removeItem(k));
}
