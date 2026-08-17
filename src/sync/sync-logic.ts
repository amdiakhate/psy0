/**
 * Logique PURE de synchronisation : décide QUOI faire, sans rien lire ni écrire.
 * Le câblage (fetch, localStorage) vit dans `client.ts` et `sync.ts`.
 *
 * Principe : le front reste la source de vérité PENDANT une séance — aucun
 * appel réseau ne doit s'intercaler dans un exercice chronométré à la
 * demi-seconde. Le serveur est la source de vérité ENTRE deux séances.
 */

export interface SyncSnapshot {
  /** Version monotone attribuée par le serveur. 0 = rien sur le serveur. */
  version: number;
  updatedAt: string | null;
}

export type SyncDecision =
  /** Rien sur le serveur, rien en local : première utilisation. */
  | { kind: 'nothing' }
  /** Le serveur a des données, le local est vierge : on tire. */
  | { kind: 'pull'; reason: 'local-vide' }
  /** Le local a avancé depuis le dernier pull : on pousse. */
  | { kind: 'push'; reason: 'local-en-avance' }
  /** Déjà à jour de part et d'autre. */
  | { kind: 'in-sync' }
  /**
   * Les deux ont avancé depuis la dernière synchronisation : impossible de
   * trancher sans perdre du travail. C'est à l'utilisateur de choisir.
   */
  | { kind: 'conflict'; serverVersion: number; localBaseVersion: number };

export interface SyncState {
  /** Version serveur sur laquelle le local est basé (0 = jamais synchronisé). */
  localBaseVersion: number;
  /** Le local a-t-il changé depuis le dernier pull/push réussi ? */
  localDirty: boolean;
  /** Le local contient-il des données (items joués, préférences) ? */
  localHasData: boolean;
  /** Dernière version connue du serveur. */
  serverVersion: number;
}

export function decideSync({
  localBaseVersion,
  localDirty,
  localHasData,
  serverVersion,
}: SyncState): SyncDecision {
  if (serverVersion === 0 && !localHasData) return { kind: 'nothing' };

  // Local vierge : on tire, quoi qu'il arrive. Rien à perdre.
  if (!localHasData && serverVersion > 0) return { kind: 'pull', reason: 'local-vide' };

  // Le serveur a avancé sans nous. Si le local n'a rien de neuf, on tire sans risque.
  if (serverVersion > localBaseVersion) {
    if (!localDirty) return { kind: 'pull', reason: 'local-vide' };
    return { kind: 'conflict', serverVersion, localBaseVersion };
  }

  if (localDirty) return { kind: 'push', reason: 'local-en-avance' };
  return { kind: 'in-sync' };
}

/**
 * Events restant à envoyer. L'event log est append-only et le serveur
 * dédoublonne sur (sessionId, posInSession) : on peut donc renvoyer une marge
 * sans rien casser, ce qui évite de perdre des items si un envoi a échoué.
 */
export function pendingEvents<T extends { ts: number }>(
  events: T[],
  lastSyncedTs: number,
  overlapMs = 60_000,
): T[] {
  return events.filter((e) => e.ts > lastSyncedTs - overlapMs);
}

/** Découpe en lots : l'API refuse au-delà de 5000 events par requête. */
export function chunk<T>(items: T[], size = 1000): T[][] {
  if (size <= 0) throw new Error('taille de lot invalide');
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

export type SyncStatus =
  | { state: 'hors-ligne' }
  | { state: 'deconnecte' }
  | { state: 'synchronise'; at: number }
  | { state: 'en-cours' }
  | { state: 'en-attente' }
  | { state: 'conflit'; serverVersion: number; localBaseVersion: number }
  | { state: 'erreur'; message: string };

export function describeStatus(status: SyncStatus): string {
  switch (status.state) {
    case 'hors-ligne':
      return 'Hors-ligne — ta progression est enregistrée sur cet appareil et partira à la reconnexion.';
    case 'deconnecte':
      return 'Non connecté — ta progression reste sur cet appareil uniquement.';
    case 'synchronise':
      return `Synchronisé à ${new Date(status.at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    case 'en-cours':
      return 'Synchronisation en cours…';
    case 'en-attente':
      return 'Modifications locales en attente d’envoi.';
    case 'conflit':
      return `Conflit : le serveur est en version ${status.serverVersion}, cet appareil est parti de la ${status.localBaseVersion}. Choisis laquelle garder.`;
    case 'erreur':
      return `Échec de la synchronisation : ${status.message}`;
  }
}
