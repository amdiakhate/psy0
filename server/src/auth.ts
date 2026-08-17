import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

/**
 * Authentification par code d'accès unique.
 *
 * Aucune dépendance native (pas de bcrypt à compiler dans l'image) : scrypt est
 * dans la bibliothèque standard de Node et convient parfaitement ici. Le code
 * n'est jamais stocké en clair — seul son empreinte salée l'est, dans une
 * variable d'environnement produite par `npm run hash-code`.
 */

const SCRYPT_KEYLEN = 64;
export const SESSION_COOKIE = 'psy0_session';
/** Une session dure une semaine : assez pour ne pas se reconnecter chaque matin. */
export const SESSION_TTL_SEC = 7 * 24 * 3600;

/**
 * Empreinte au format `scrypt:<sel hex>:<clé hex>`.
 *
 * Le séparateur est `:` et non `$` : docker compose, Coolify et la plupart des
 * shells traitent `$` comme le début d'une interpolation de variable, et
 * videraient silencieusement l'empreinte au déploiement.
 */
export function hashAccessCode(code: string, salt = randomBytes(16)): string {
  const derived = scryptSync(code.normalize('NFKC'), salt, SCRYPT_KEYLEN);
  return `scrypt:${salt.toString('hex')}:${derived.toString('hex')}`;
}

/**
 * Une empreinte est valide si elle a la forme attendue ET les bonnes longueurs.
 *
 * Ce contrôle n'est pas cosmétique : `Buffer.from('zz', 'hex')` renvoie un
 * buffer VIDE sans lever d'exception, et `timingSafeEqual(vide, vide)` vaut
 * `true`. Sans cette validation, un `ACCESS_CODE_HASH` tronqué ou mal recopié
 * accepterait n'importe quel code d'accès.
 */
export function isValidHash(stored: string): boolean {
  const parts = stored.split(':');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const [, saltHex, keyHex] = parts;
  return (
    /^[0-9a-f]+$/i.test(saltHex) &&
    /^[0-9a-f]+$/i.test(keyHex) &&
    saltHex.length >= 16 &&
    keyHex.length === SCRYPT_KEYLEN * 2
  );
}

/** Comparaison à temps constant : une comparaison naïve fuit le code caractère par caractère. */
export function verifyAccessCode(code: string, stored: string): boolean {
  if (!isValidHash(stored)) return false;
  const [, saltHex, keyHex] = stored.split(':');
  let expected: Buffer;
  let actual: Buffer;
  try {
    expected = Buffer.from(keyHex, 'hex');
    actual = scryptSync(code.normalize('NFKC'), Buffer.from(saltHex, 'hex'), expected.length);
  } catch {
    return false;
  }
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

/** Jeton `<expiration>.<signature>` — il n'y a qu'un utilisateur, rien d'autre à transporter. */
export function issueToken(secret: string, now = Date.now()): string {
  const expiresAt = Math.floor(now / 1000) + SESSION_TTL_SEC;
  const payload = String(expiresAt);
  return `${payload}.${sign(payload, secret)}`;
}

export function verifyToken(token: string | undefined, secret: string, now = Date.now()): boolean {
  if (!token) return false;
  const dot = token.lastIndexOf('.');
  if (dot <= 0) return false;
  const payload = token.slice(0, dot);
  const signature = token.slice(dot + 1);

  const expected = Buffer.from(sign(payload, secret));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return false;

  const expiresAt = Number(payload);
  return Number.isFinite(expiresAt) && expiresAt > Math.floor(now / 1000);
}
