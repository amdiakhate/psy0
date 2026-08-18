import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import { healthy, migrate, pool } from './db.ts';
import {
  SESSION_COOKIE,
  SESSION_TTL_SEC,
  isValidHash,
  issueToken,
  verifyAccessCode,
  verifyToken,
} from './auth.ts';
import { toInt, toIso, usable } from './coerce.ts';

/**
 * API de synchronisation PSY0 Trainer + service du front statique.
 *
 * Le front continue de fonctionner entièrement hors-ligne : cette API ne sert
 * qu'à sauvegarder la progression entre deux séances et à la retrouver sur un
 * autre appareil. Aucun appel réseau n'a lieu pendant un exercice.
 */

const ACCESS_CODE_HASH = process.env.ACCESS_CODE_HASH ?? '';
const SESSION_SECRET = process.env.SESSION_SECRET ?? '';
const PORT = Number(process.env.PORT ?? 3000);
const IS_PROD = process.env.NODE_ENV === 'production';

if (!ACCESS_CODE_HASH || !SESSION_SECRET) {
  console.error(
    'Configuration manquante : ACCESS_CODE_HASH et SESSION_SECRET sont obligatoires.\n' +
      'Génère-les avec « npm run hash-code » — sans eux, l’API refuserait toute connexion.',
  );
  process.exit(1);
}

// Mieux vaut ne pas démarrer du tout que démarrer avec une porte ouverte :
// une empreinte tronquée au copier-coller validerait n'importe quel code.
if (!isValidHash(ACCESS_CODE_HASH)) {
  console.error(
    'ACCESS_CODE_HASH est malformé (attendu : scrypt:<sel hex>:<128 caractères hex>).\n' +
      'Regénère-le avec « npm run hash-code » et recopie la ligne entière.',
  );
  process.exit(1);
}

if (SESSION_SECRET.length < 32) {
  console.error('SESSION_SECRET doit faire au moins 32 caractères.');
  process.exit(1);
}

const app = new Hono();

app.get('/api/health', async (c) => {
  const db = await healthy();
  return c.json({ ok: db, db }, db ? 200 : 503);
});

app.post('/api/login', async (c) => {
  const body = await c.req.json<{ code?: string }>().catch(() => ({ code: undefined }));
  if (!body.code || !verifyAccessCode(body.code, ACCESS_CODE_HASH)) {
    // Message volontairement identique dans tous les cas d'échec.
    return c.json({ error: 'Code incorrect.' }, 401);
  }
  setCookie(c, SESSION_COOKIE, issueToken(SESSION_SECRET), {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'Lax',
    path: '/',
    maxAge: SESSION_TTL_SEC,
  });
  return c.json({ ok: true });
});

app.post('/api/logout', (c) => {
  setCookie(c, SESSION_COOKIE, '', { httpOnly: true, secure: IS_PROD, sameSite: 'Lax', path: '/', maxAge: 0 });
  return c.json({ ok: true });
});

/** Toutes les routes de données sont fermées : l'app est publique sur Internet. */
app.use('/api/state', requireSession);
app.use('/api/events', requireSession);
app.use('/api/stats', requireSession);

async function requireSession(c: Parameters<Parameters<Hono['use']>[1]>[0], next: () => Promise<void>) {
  if (!verifyToken(getCookie(c, SESSION_COOKIE), SESSION_SECRET)) {
    return c.json({ error: 'Session expirée ou absente.' }, 401);
  }
  await next();
}

app.get('/api/state', async (c) => {
  const { rows } = await pool.query<{ version: number; data: unknown; created_at: Date; device: string | null }>(
    'SELECT version, data, created_at, device FROM snapshots ORDER BY version DESC LIMIT 1',
  );
  if (rows.length === 0) return c.json({ version: 0, data: null, updatedAt: null, device: null });
  return c.json({
    version: rows[0].version,
    data: rows[0].data,
    updatedAt: rows[0].created_at.toISOString(),
    device: rows[0].device,
  });
});

app.put('/api/state', async (c) => {
  const body = await c.req.json<{ baseVersion?: number; data?: unknown; device?: string; force?: boolean }>()
    .catch(() => ({}) as Record<string, never>);
  if (body.data === undefined || body.data === null) {
    return c.json({ error: 'Corps invalide : « data » est requis.' }, 400);
  }

  const { rows } = await pool.query<{ version: number }>('SELECT COALESCE(MAX(version), 0) AS version FROM snapshots');
  const serverVersion = Number(rows[0].version);
  const baseVersion = Number(body.baseVersion ?? 0);

  // Un autre appareil a écrit depuis le dernier pull : on refuse plutôt que
  // d'écraser en silence. Le client décide alors, explicitement.
  if (!body.force && baseVersion < serverVersion) {
    return c.json({ error: 'conflict', serverVersion, baseVersion }, 409);
  }

  const nextVersion = serverVersion + 1;
  await pool.query('INSERT INTO snapshots (version, data, device) VALUES ($1, $2, $3)', [
    nextVersion,
    JSON.stringify(body.data),
    body.device ?? null,
  ]);
  // On garde 50 versions : de quoi revenir en arrière sans faire enfler la base.
  await pool.query('DELETE FROM snapshots WHERE version <= $1', [nextVersion - 50]);
  return c.json({ version: nextVersion });
});

interface IncomingEvent {
  ts: number;
  sessionId: string;
  mode: string;
  exercise: string;
  level: number;
  seed: number;
  tags: string[];
  rtMs: number;
  correct: boolean;
  given?: string;
  expected?: string;
  posInSession: number;
  minuteInSession: number;
}

app.post('/api/events', async (c) => {
  const body = await c.req.json<{ events?: IncomingEvent[] }>().catch(() => ({}) as Record<string, never>);
  const received = Array.isArray(body.events) ? body.events : null;
  if (!received) return c.json({ error: 'Corps invalide : « events » doit être un tableau.' }, 400);
  if (received.length === 0) return c.json({ inserted: 0, received: 0 });
  if (received.length > 5000) return c.json({ error: 'Lot trop grand (5000 maximum).' }, 413);

  // Un event inexploitable est ÉCARTÉ, pas propagé : perdre une ligne vaut
  // mieux que perdre le lot, donc toute une séance d'entraînement.
  const events = received.filter(usable);
  if (events.length === 0) return c.json({ inserted: 0, received: received.length, skipped: received.length });

  // Insertion en masse, idempotente : l'index unique (session_id, pos_in_session)
  // absorbe les renvois. Sans ça, chaque synchronisation dupliquerait l'historique.
  const values: unknown[] = [];
  const tuples = events.map((e, i) => {
    const b = i * 13;
    values.push(
      toIso(e.ts),
      e.sessionId,
      String(e.mode ?? ''),
      String(e.exercise ?? ''),
      toInt(e.level, 1),
      toInt(e.seed),
      Array.isArray(e.tags) ? e.tags.map(String) : [],
      toInt(e.rtMs),
      Boolean(e.correct),
      e.given ?? null,
      e.expected ?? null,
      toInt(e.posInSession),
      toInt(e.minuteInSession),
    );
    return `($${b + 1},$${b + 2},$${b + 3},$${b + 4},$${b + 5},$${b + 6},$${b + 7},$${b + 8},$${b + 9},$${b + 10},$${b + 11},$${b + 12},$${b + 13})`;
  });

  const { rowCount } = await pool.query(
    `INSERT INTO item_events
       (ts, session_id, mode, exercise, level, seed, tags, rt_ms, correct, given, expected, pos_in_session, minute_in_session)
     VALUES ${tuples.join(',')}
     ON CONFLICT (session_id, pos_in_session) DO NOTHING`,
    values,
  );
  return c.json({ inserted: rowCount ?? 0, received: received.length, skipped: received.length - events.length });
});

/** Vue serveur de l'historique — utile pour vérifier une sauvegarde sans ouvrir l'app. */
app.get('/api/stats', async (c) => {
  const [total, byExercise] = await Promise.all([
    pool.query<{ n: string; first: Date | null; last: Date | null }>(
      'SELECT COUNT(*) AS n, MIN(ts) AS first, MAX(ts) AS last FROM item_events',
    ),
    pool.query<{ exercise: string; n: string; accuracy: string }>(
      `SELECT exercise, COUNT(*) AS n, AVG(CASE WHEN correct THEN 1.0 ELSE 0.0 END) AS accuracy
       FROM item_events GROUP BY exercise ORDER BY n DESC`,
    ),
  ]);
  return c.json({
    items: Number(total.rows[0].n),
    first: total.rows[0].first?.toISOString() ?? null,
    last: total.rows[0].last?.toISOString() ?? null,
    byExercise: byExercise.rows.map((r) => ({
      exercise: r.exercise,
      items: Number(r.n),
      accuracy: Number(r.accuracy),
    })),
  });
});

// Une route d'API inconnue doit répondre en JSON, AVANT le repli SPA : sinon
// elle renvoie index.html avec un code 200, et le client échoue sur un parsing
// JSON illisible au lieu de voir sa faute de frappe.
app.all('/api/*', (c) => c.json({ error: `Route inconnue : ${c.req.path}` }, 404));

// Front statique. Le routeur est côté client : toute autre route rend index.html.
app.use('/assets/*', serveStatic({ root: './public' }));
app.use('/*', serveStatic({ root: './public' }));
app.get('/*', serveStatic({ path: './public/index.html' }));

const ran = await migrate();
console.log(ran.length > 0 ? `Migrations appliquées : ${ran.join(', ')}` : 'Base à jour, aucune migration.');

serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.log(`PSY0 Trainer — API et front sur le port ${info.port}`);
});
