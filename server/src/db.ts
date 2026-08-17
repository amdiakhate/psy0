import { readFile, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const { Pool } = pg;

/**
 * Accès Postgres. Un seul pool pour tout le processus ; les migrations sont
 * appliquées au démarrage, dans une transaction, et tracées pour ne jamais
 * rejouer deux fois le même fichier.
 */

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Coolify place Postgres sur le réseau interne : TLS inutile et souvent absent.
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  max: 5,
});

const here = dirname(fileURLToPath(import.meta.url));

/** Les migrations vivent à côté du code compilé comme des sources. */
async function migrationsDir(): Promise<string> {
  for (const candidate of [join(here, '../migrations'), join(here, '../../migrations')]) {
    try {
      await readdir(candidate);
      return candidate;
    } catch {
      // dossier absent : on essaie le suivant
    }
  }
  throw new Error('Dossier de migrations introuvable');
}

export async function migrate(): Promise<string[]> {
  const dir = await migrationsDir();
  const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  const applied = new Set(
    (await pool.query<{ name: string }>('SELECT name FROM schema_migrations')).rows.map((r) => r.name),
  );

  const ran: string[] = [];
  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = await readFile(join(dir, file), 'utf8');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
      await client.query('COMMIT');
      ran.push(file);
    } catch (error) {
      await client.query('ROLLBACK');
      throw new Error(`Migration ${file} échouée : ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      client.release();
    }
  }
  return ran;
}

export async function healthy(): Promise<boolean> {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}
