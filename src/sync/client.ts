import type { ItemEvent } from '../core/types';

/**
 * Client HTTP de l'API de synchronisation. Aucune logique de décision ici —
 * elle est dans `sync-logic.ts`, pure et testée.
 *
 * Le cookie de session est HttpOnly : le JavaScript de la page ne peut pas le
 * lire, donc `credentials: 'include'` est indispensable sur chaque appel.
 */

export class SyncError extends Error {
  /** 0 = réseau injoignable (l'app reste utilisable hors-ligne). */
  status: number;
  conflict?: { serverVersion: number; baseVersion: number };

  constructor(message: string, status: number, conflict?: { serverVersion: number; baseVersion: number }) {
    super(message);
    this.name = 'SyncError';
    this.status = status;
    this.conflict = conflict;
  }
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      ...init,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...init.headers },
    });
  } catch {
    // Réseau injoignable : ce n'est pas une erreur applicative, l'app continue en local.
    throw new SyncError('Serveur injoignable', 0);
  }

  if (response.status === 409) {
    const body = (await response.json().catch(() => ({}))) as {
      serverVersion?: number;
      baseVersion?: number;
    };
    throw new SyncError('conflict', 409, {
      serverVersion: body.serverVersion ?? 0,
      baseVersion: body.baseVersion ?? 0,
    });
  }
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new SyncError(body.error ?? `HTTP ${response.status}`, response.status);
  }

  // Une réponse HTML au lieu de JSON signifie qu'aucune API n'écoute derrière :
  // serveur de développement seul, proxy mal configuré, page d'erreur d'un
  // hébergeur. C'est fonctionnellement un « hors-ligne », pas une panne à
  // signaler en rouge — et sûrement pas un « Unexpected token '<' ».
  if (!isJson(response)) throw new SyncError('API indisponible', 0);

  return (await response.json()) as T;
}

function isJson(response: Response): boolean {
  return (response.headers.get('content-type') ?? '').toLowerCase().includes('application/json');
}

export function login(code: string): Promise<{ ok: true }> {
  return call('/api/login', { method: 'POST', body: JSON.stringify({ code }) });
}

export function logout(): Promise<{ ok: true }> {
  return call('/api/logout', { method: 'POST' });
}

export interface RemoteState {
  version: number;
  data: Record<string, unknown> | null;
  updatedAt: string | null;
  device: string | null;
}

export function fetchState(): Promise<RemoteState> {
  return call<RemoteState>('/api/state');
}

export function pushState(args: {
  baseVersion: number;
  data: unknown;
  device: string;
  force?: boolean;
}): Promise<{ version: number }> {
  return call('/api/state', { method: 'PUT', body: JSON.stringify(args) });
}

export function pushEvents(events: ItemEvent[]): Promise<{ inserted: number; received: number }> {
  return call('/api/events', { method: 'POST', body: JSON.stringify({ events }) });
}

export function health(): Promise<{ ok: boolean; db: boolean }> {
  return call('/api/health');
}
