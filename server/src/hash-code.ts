import { randomBytes } from 'node:crypto';
import { hashAccessCode } from './auth.ts';

/**
 * Génère les deux secrets à coller dans Coolify.
 *   npm run hash-code -- "mon code d'accès"
 *
 * Le code en clair n'est jamais écrit sur disque ni transmis : il ne sort pas
 * de ton terminal. Seule son empreinte part en variable d'environnement.
 */

const code = process.argv[2];
if (!code || code.length < 8) {
  console.error('Usage : npm run hash-code -- "<code d’accès de 8 caractères minimum>"');
  process.exit(1);
}

console.log(`ACCESS_CODE_HASH=${hashAccessCode(code)}`);
console.log(`SESSION_SECRET=${randomBytes(32).toString('hex')}`);
console.log('\nColle ces deux lignes dans les variables d’environnement Coolify.');
console.log('Change SESSION_SECRET et toutes tes sessions ouvertes sont invalidées.');
