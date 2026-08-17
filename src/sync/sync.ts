import { exportAll, importAll, loadJson, resetAll, saveJson } from '../core/storage';
import { discardCache, getEvents } from '../core/eventlog';
import { SyncError, fetchState, pushEvents, pushState } from './client';
import { chunk, decideSync, pendingEvents } from './sync-logic';
import type { SyncStatus } from './sync-logic';

/**
 * Câblage de la synchronisation : lit le localStorage, appelle l'API, applique
 * la décision prise par `sync-logic.ts`.
 *
 * Rien ici n'est appelé pendant un exercice. La synchronisation se déclenche à
 * l'ouverture de l'app, à la fin d'une séance, et sur demande explicite.
 */

interface SyncMeta {
  /** Version serveur sur laquelle le local est basé. */
  baseVersion: number;
  /** Horodatage du dernier event envoyé avec succès. */
  lastEventTs: number;
  /** Le local a-t-il changé depuis la dernière synchronisation réussie ? */
  dirty: boolean;
  /** Identifiant lisible de cet appareil, pour savoir qui a écrit quoi. */
  device: string;
}

const DEFAULT_META: SyncMeta = { baseVersion: 0, lastEventTs: 0, dirty: false, device: '' };

export function getSyncMeta(): SyncMeta {
  const meta = { ...DEFAULT_META, ...loadJson<Partial<SyncMeta>>('sync', {}) };
  if (!meta.device) {
    meta.device = detectDevice();
    saveJson('sync', meta);
  }
  return meta;
}

function setSyncMeta(patch: Partial<SyncMeta>): SyncMeta {
  const next = { ...getSyncMeta(), ...patch };
  saveJson('sync', next);
  return next;
}

function detectDevice(): string {
  const ua = navigator.userAgent;
  const platform = /iPhone|iPad/.test(ua) ? 'iOS' : /Android/.test(ua) ? 'Android' : /Mac/.test(ua) ? 'Mac' : 'PC';
  return `${platform}-${Math.random().toString(36).slice(2, 6)}`;
}

/** Marque le local comme modifié — appelé en fin de session. */
export function markDirty(): void {
  setSyncMeta({ dirty: true });
}

function localHasData(): boolean {
  return getEvents().length > 0 || localStorage.getItem('psy0.prefs') !== null;
}

export type SyncOutcome =
  | { kind: 'nothing' }
  | { kind: 'pulled'; version: number }
  | { kind: 'pushed'; version: number; events: number }
  | { kind: 'in-sync' }
  | { kind: 'conflict'; serverVersion: number; localBaseVersion: number }
  | { kind: 'error'; message: string; offline: boolean };

/**
 * Une passe de synchronisation. Ne lève jamais : une panne réseau doit laisser
 * l'app parfaitement utilisable hors-ligne, pas afficher une erreur bloquante.
 */
export async function syncNow(): Promise<SyncOutcome> {
  const meta = getSyncMeta();
  try {
    const remote = await fetchState();
    const decision = decideSync({
      localBaseVersion: meta.baseVersion,
      localDirty: meta.dirty,
      localHasData: localHasData(),
      serverVersion: remote.version,
    });

    switch (decision.kind) {
      case 'nothing':
        return { kind: 'nothing' };

      case 'conflict':
        return { kind: 'conflict', serverVersion: decision.serverVersion, localBaseVersion: decision.localBaseVersion };

      case 'pull': {
        if (!remote.data) return { kind: 'nothing' };
        applyRemote(remote.data, remote.version);
        return { kind: 'pulled', version: remote.version };
      }

      case 'in-sync':
        // Même à jour, les events peuvent rester à pousser : ils ne passent
        // pas par le snapshot et doivent alimenter la table normalisée.
        return { kind: 'pushed', version: remote.version, events: await sendEvents() };

      case 'push': {
        const events = await sendEvents();
        const { version } = await pushState({
          baseVersion: meta.baseVersion,
          data: JSON.parse(exportAll()),
          device: meta.device,
        });
        setSyncMeta({ baseVersion: version, dirty: false });
        return { kind: 'pushed', version, events };
      }
    }
  } catch (error) {
    if (error instanceof SyncError && error.conflict) {
      return {
        kind: 'conflict',
        serverVersion: error.conflict.serverVersion,
        localBaseVersion: error.conflict.baseVersion,
      };
    }
    const message = error instanceof Error ? error.message : String(error);
    return { kind: 'error', message, offline: error instanceof SyncError && error.status === 0 };
  }
}

/** Envoie les events non encore transmis. Idempotent côté serveur. */
async function sendEvents(): Promise<number> {
  const meta = getSyncMeta();
  const toSend = pendingEvents(getEvents(), meta.lastEventTs);
  if (toSend.length === 0) return 0;

  let sent = 0;
  for (const lot of chunk(toSend, 1000)) {
    await pushEvents(lot);
    sent += lot.length;
    // On avance le curseur lot par lot : une coupure en cours de route ne
    // fait pas repartir l'envoi du début à la prochaine tentative.
    setSyncMeta({ lastEventTs: Math.max(...lot.map((e) => e.ts)) });
  }
  return sent;
}

/**
 * Écrase le local par l'état serveur.
 *
 * `resetAll()` d'abord : sans lui, une clé présente en local mais absente du
 * snapshot survivrait à la restauration, et l'appareil resterait dans un état
 * hybride que personne n'a jamais eu.
 *
 * `discardCache()` ensuite : sans lui, le cache mémoire de l'event log
 * réécrirait les anciens events par-dessus au prochain déchargement de page —
 * la restauration serait annulée en silence.
 *
 * `data` est l'enveloppe complète produite par `exportAll()`, telle qu'elle a
 * été poussée : on la repasse à `importAll()` sans la réencapsuler.
 */
function applyRemote(payload: Record<string, unknown>, version: number): void {
  const meta = getSyncMeta();
  resetAll();
  importAll(JSON.stringify(payload));
  discardCache();
  // resetAll() a emporté la méta de synchronisation : on la reconstruit.
  saveJson('sync', { ...meta, baseVersion: version, dirty: false, lastEventTs: 0 });
}

/** Résolution manuelle d'un conflit : garder le serveur. */
export async function resolveKeepServer(): Promise<SyncOutcome> {
  try {
    const remote = await fetchState();
    if (!remote.data) return { kind: 'nothing' };
    applyRemote(remote.data, remote.version);
    return { kind: 'pulled', version: remote.version };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { kind: 'error', message, offline: error instanceof SyncError && error.status === 0 };
  }
}

/** Résolution manuelle d'un conflit : imposer l'état de cet appareil. */
export async function resolveKeepLocal(): Promise<SyncOutcome> {
  try {
    const events = await sendEvents();
    const { version } = await pushState({
      baseVersion: getSyncMeta().baseVersion,
      data: JSON.parse(exportAll()),
      device: getSyncMeta().device,
      force: true,
    });
    setSyncMeta({ baseVersion: version, dirty: false });
    return { kind: 'pushed', version, events };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { kind: 'error', message, offline: error instanceof SyncError && error.status === 0 };
  }
}

export function outcomeToStatus(outcome: SyncOutcome, now = Date.now()): SyncStatus {
  switch (outcome.kind) {
    case 'conflict':
      return { state: 'conflit', serverVersion: outcome.serverVersion, localBaseVersion: outcome.localBaseVersion };
    case 'error':
      return outcome.offline ? { state: 'hors-ligne' } : { state: 'erreur', message: outcome.message };
    case 'nothing':
    case 'in-sync':
    case 'pulled':
    case 'pushed':
      return { state: 'synchronise', at: now };
  }
}
