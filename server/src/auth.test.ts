import { describe, expect, it } from 'vitest';
import {
  SESSION_TTL_SEC,
  hashAccessCode,
  isValidHash,
  issueToken,
  verifyAccessCode,
  verifyToken,
} from './auth.ts';

/**
 * Code de sécurité : c'est la seule chose qui sépare la progression de
 * l'utilisateur d'un Internet public. Les cas d'échec comptent autant que
 * le cas nominal.
 */

const SECRET = 'secret-de-test-suffisamment-long-0123456789';

describe('hashAccessCode / verifyAccessCode', () => {
  it('accepte le bon code', () => {
    const stored = hashAccessCode('mon-code-secret');
    expect(verifyAccessCode('mon-code-secret', stored)).toBe(true);
  });

  it('refuse un code faux, même très proche', () => {
    const stored = hashAccessCode('mon-code-secret');
    expect(verifyAccessCode('mon-code-secre', stored)).toBe(false);
    expect(verifyAccessCode('mon-code-secretx', stored)).toBe(false);
    expect(verifyAccessCode('Mon-code-secret', stored)).toBe(false);
    expect(verifyAccessCode('', stored)).toBe(false);
  });

  it('sale chaque empreinte : deux hachages du même code diffèrent', () => {
    const a = hashAccessCode('identique');
    const b = hashAccessCode('identique');
    expect(a).not.toBe(b);
    // …mais les deux valident bien le code.
    expect(verifyAccessCode('identique', a)).toBe(true);
    expect(verifyAccessCode('identique', b)).toBe(true);
  });

  it('ne stocke jamais le code en clair', () => {
    expect(hashAccessCode('trescodesecret')).not.toContain('trescodesecret');
  });

  it('normalise l’unicode : le même code tapé autrement passe quand même', () => {
    // « é » précomposé vs « e » + accent combinant — deux octets différents,
    // un seul code du point de vue de l'utilisateur.
    const stored = hashAccessCode('café-secret');
    expect(verifyAccessCode('café-secret', stored)).toBe(true);
  });

  it('refuse une empreinte malformée sans lever d’exception', () => {
    for (const bad of ['', 'nawak', 'scrypt:pasdesel', 'bcrypt:aa:bb', 'scrypt:zz:zz']) {
      expect(verifyAccessCode('peu-importe', bad)).toBe(false);
      expect(isValidHash(bad)).toBe(false);
    }
  });

  it('refuse une empreinte de longueur nulle — le piège du hex invalide', () => {
    // Buffer.from('zz', 'hex') rend un buffer VIDE sans erreur, et
    // timingSafeEqual(vide, vide) vaut true : une empreinte tronquée
    // validerait donc n'importe quel code. Ce cas doit rester couvert.
    const [, salt] = hashAccessCode('vrai-code').split(':');
    expect(verifyAccessCode('nimporte-quoi', 'scrypt:zz:zz')).toBe(false);
    expect(verifyAccessCode('nimporte-quoi', 'scrypt::')).toBe(false);
    expect(verifyAccessCode('nimporte-quoi', `scrypt:${salt}:`)).toBe(false);
  });

  it('exige une empreinte de la bonne longueur, même bien formée', () => {
    const valid = hashAccessCode('vrai-code');
    const [, salt, key] = valid.split(':');
    expect(isValidHash(valid)).toBe(true);
    // Clé tronquée de moitié : refusée.
    expect(isValidHash(`scrypt:${salt}:${key.slice(0, 64)}`)).toBe(false);
    // Sel trop court : refusé.
    expect(isValidHash(`scrypt:ab:${key}`)).toBe(false);
  });

  it('ne contient aucun caractère interprété par un shell ou docker compose', () => {
    // Un « $ » dans l'empreinte serait avalé comme une interpolation de
    // variable au déploiement, et viderait silencieusement le secret.
    const hash = hashAccessCode('un-code-quelconque');
    expect(hash).not.toMatch(/[$`"'\\ ]/);
    expect(hash).toMatch(/^scrypt:[0-9a-f]+:[0-9a-f]+$/);
  });
});

describe('issueToken / verifyToken', () => {
  it('accepte un jeton fraîchement émis', () => {
    expect(verifyToken(issueToken(SECRET), SECRET)).toBe(true);
  });

  it('refuse un jeton signé avec un autre secret', () => {
    // C'est ce qui rend la rotation de SESSION_SECRET efficace.
    expect(verifyToken(issueToken('autre-secret'), SECRET)).toBe(false);
  });

  it('refuse un jeton expiré', () => {
    const now = Date.now();
    const token = issueToken(SECRET, now);
    expect(verifyToken(token, SECRET, now + (SESSION_TTL_SEC - 10) * 1000)).toBe(true);
    expect(verifyToken(token, SECRET, now + (SESSION_TTL_SEC + 10) * 1000)).toBe(false);
  });

  it('refuse un jeton dont l’expiration a été rallongée à la main', () => {
    const token = issueToken(SECRET);
    const forged = `${Math.floor(Date.now() / 1000) + 999_999}.${token.split('.')[1]}`;
    expect(verifyToken(forged, SECRET)).toBe(false);
  });

  it('refuse les jetons absents ou malformés', () => {
    for (const bad of [undefined, '', 'sans-point', '.', 'abc.', '.abc']) {
      expect(verifyToken(bad, SECRET)).toBe(false);
    }
  });
});
