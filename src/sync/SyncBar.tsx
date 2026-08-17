import { useCallback, useEffect, useState } from 'react';
import { SyncError, login } from './client';
import { outcomeToStatus, resolveKeepLocal, resolveKeepServer, syncNow } from './sync';
import { describeStatus } from './sync-logic';
import type { SyncStatus } from './sync-logic';

/**
 * Bandeau de synchronisation. Volontairement discret et jamais bloquant :
 * l'app doit rester utilisable sans réseau et sans compte. Il ne dit
 * « synchronisé » que lorsque le serveur a effectivement accusé réception.
 */
export function SyncBar() {
  const [status, setStatus] = useState<SyncStatus>({ state: 'en-cours' });
  const [needsLogin, setNeedsLogin] = useState(false);

  const run = useCallback(async () => {
    setStatus({ state: 'en-cours' });
    const outcome = await syncNow();
    if (outcome.kind === 'error' && !outcome.offline && /401|session/i.test(outcome.message)) {
      setNeedsLogin(true);
      setStatus({ state: 'deconnecte' });
      return;
    }
    setStatus(outcomeToStatus(outcome));
  }, []);

  // Une passe à l'ouverture, puis au retour de connexion. Jamais pendant une séance.
  useEffect(() => {
    void run();
    const onOnline = () => void run();
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [run]);

  if (needsLogin) return <LoginPanel onSuccess={() => { setNeedsLogin(false); void run(); }} />;

  const isConflict = status.state === 'conflit';

  return (
    <div
      className={`mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-2 text-sm ${
        isConflict
          ? 'border-amber-700 bg-amber-950/30 text-amber-200'
          : status.state === 'erreur'
            ? 'border-red-900/60 bg-red-950/20 text-red-300'
            : 'border-zinc-800 bg-zinc-900/40 text-zinc-400'
      }`}
    >
      <span>{describeStatus(status)}</span>
      <div className="flex gap-2">
        {isConflict ? (
          <>
            <button
              onClick={async () => setStatus(outcomeToStatus(await resolveKeepServer()))}
              className="rounded-md border border-zinc-700 px-3 py-1 hover:border-zinc-500"
            >
              Garder le serveur
            </button>
            <button
              onClick={async () => setStatus(outcomeToStatus(await resolveKeepLocal()))}
              className="rounded-md border border-zinc-700 px-3 py-1 hover:border-zinc-500"
            >
              Garder cet appareil
            </button>
          </>
        ) : (
          <button
            onClick={() => void run()}
            disabled={status.state === 'en-cours'}
            className="rounded-md border border-zinc-700 px-3 py-1 hover:border-zinc-500 disabled:opacity-50"
          >
            {status.state === 'en-cours' ? '…' : 'Synchroniser'}
          </button>
        )}
      </div>
    </div>
  );
}

function LoginPanel({ onSuccess }: { onSuccess: () => void }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(code);
      setCode('');
      onSuccess();
    } catch (err) {
      setError(
        err instanceof SyncError && err.status === 0
          ? 'Serveur injoignable — tu peux continuer hors-ligne.'
          : 'Code incorrect.',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="mb-4 rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-sm"
    >
      <p className="text-zinc-400">
        Connecte-toi pour sauvegarder ta progression et la retrouver sur tes autres appareils.
        Sans connexion, tout reste sur cet appareil — et disparaît si tu vides ton navigateur.
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        <input
          type="password"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Code d'accès"
          autoComplete="current-password"
          className="min-w-48 flex-1 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-zinc-200 placeholder:text-zinc-600 focus:border-sky-600 focus:outline-none"
        />
        <button
          type="submit"
          disabled={busy || code.length === 0}
          className="rounded-md bg-sky-600 px-4 py-1.5 font-semibold hover:bg-sky-500 disabled:opacity-50"
        >
          {busy ? '…' : 'Se connecter'}
        </button>
      </div>
      {error && <p className="mt-2 text-red-400">{error}</p>}
    </form>
  );
}
