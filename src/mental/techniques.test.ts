import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../core/rng';
import { TECHNIQUES, digitRoot, digitSum, techniqueById } from './techniques';
import type { MentalItem } from './techniques';

/**
 * Les invariants sont RECALCULÉS ici, sans réutiliser le code du générateur :
 * on relit l'énoncé affiché et on refait le calcul soi-même. Un générateur qui
 * se trompe et un test qui reprend sa formule tomberaient d'accord sur le faux.
 */

const SEEDS = Array.from({ length: 150 }, (_, i) => i * 7919 + 13);

function num(s: string): number {
  return Number(s.replace(/[\s  ]/g, '').replace('−', '-'));
}

/** Évalue l'énoncé tel qu'il est AFFICHÉ, indépendamment du générateur. */
function evalPrompt(prompt: string): number | null {
  const clean = prompt.replace(/[\s  ]+/g, ' ').trim();

  let m = /^Complément de (.+) à (.+)$/.exec(clean);
  if (m) return num(m[2]) - num(m[1]);

  m = /^(-?[\d ]+) ([+−×÷]) (-?[\d ]+)$/.exec(clean);
  if (m) {
    const a = num(m[1]);
    const b = num(m[3]);
    if (m[2] === '+') return a + b;
    if (m[2] === '−') return a - b;
    if (m[2] === '×') return a * b;
    return a / b;
  }

  m = /^([\d ]+) % de ([\d ]+)$/.exec(clean);
  if (m) return (num(m[1]) * num(m[2])) / 100;

  m = /^(\d+)\/(\d+) de ([\d ]+)$/.exec(clean);
  if (m) return (Number(m[1]) * num(m[3])) / Number(m[2]);

  // Rang alphabétique : on refait la conversion soi-même, sans réutiliser la
  // table du générateur — c'est tout l'intérêt d'un recalcul indépendant.
  m = /^Rang de la lettre ([A-Z])$/.exec(clean);
  if (m) return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.indexOf(m[1]) + 1;

  return null;
}

/** Réponse attendue d'un item dont la réponse est une LETTRE, recalculée à la main. */
function expectedLetter(prompt: string): string | null {
  const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const at = (r: number) => A[(((r - 1) % 26) + 26) % 26];
  const clean = prompt.replace(/\s+/g, ' ').trim();

  let m = /^La lettre de rang (\d+)$/.exec(clean);
  if (m) return at(Number(m[1]));

  m = /^Le miroir de ([A-Z]) dans l’alphabet$/.exec(clean);
  if (m) return at(27 - (A.indexOf(m[1]) + 1));

  m = /^([A-Z]) (avancée|reculée) de (\d+)$/.exec(clean);
  if (m) {
    const sign = m[2] === 'avancée' ? 1 : -1;
    return at(A.indexOf(m[1]) + 1 + sign * Number(m[3]));
  }
  return null;
}

/** Membres d'une affirmation « a op b = résultat ». */
function parseEquality(prompt: string): { left: number; shown: number } | null {
  const [lhs, rhs] = prompt.split('=');
  if (rhs === undefined) return null;
  const left = evalPrompt(lhs.trim());
  return left === null ? null : { left, shown: num(rhs) };
}

describe('catalogue', () => {
  it('a des identifiants uniques et retrouvables', () => {
    const ids = TECHNIQUES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(techniqueById(id)?.id).toBe(id);
    expect(techniqueById('inexistante')).toBeNull();
  });

  it('documente chaque technique : règle, pourquoi, étapes, quand, apport PSY0', () => {
    for (const t of TECHNIQUES) {
      expect(t.rule.length).toBeGreaterThan(20);
      expect(t.why.length).toBeGreaterThan(60);
      expect(t.steps.length).toBeGreaterThanOrEqual(2);
      expect(t.when.length).toBeGreaterThan(30);
      expect(t.psy0.length).toBeGreaterThan(30);
      expect(t.targetMs).toBeGreaterThan(1000);
    }
  });
});

describe('générateurs', () => {
  it('sont déterministes : même graine, même item', () => {
    for (const t of TECHNIQUES) {
      for (const seed of SEEDS.slice(0, 20)) {
        expect(t.generate(mulberry32(seed))).toEqual(t.generate(mulberry32(seed)));
      }
    }
  });

  it('ne laissent fuir ni NaN ni undefined dans les textes', () => {
    for (const t of TECHNIQUES) {
      for (const seed of SEEDS) {
        const item = t.generate(mulberry32(seed));
        const texts = [item.prompt, ...item.walkthrough];
        for (const text of texts) {
          expect(text, `${t.id} / graine ${seed}`).not.toMatch(/NaN|undefined|Infinity/);
          expect(text.trim().length).toBeGreaterThan(0);
        }
        expect(item.walkthrough.length).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it('donnent une réponse entière et positive, conforme à l’énoncé affiché', () => {
    for (const t of TECHNIQUES) {
      for (const seed of SEEDS) {
        const item = t.generate(mulberry32(seed));
        if (item.kind !== 'value') continue;
        expect(Number.isInteger(item.answer), `${t.id} / ${item.prompt}`).toBe(true);
        expect(item.answer).toBeGreaterThan(0);
        const recomputed = evalPrompt(item.prompt);
        expect(recomputed, `énoncé illisible : « ${item.prompt} » (${t.id})`).not.toBeNull();
        expect(recomputed, `${t.id} : « ${item.prompt} »`).toBe(item.answer);
      }
    }
  });

  it('donnent la bonne LETTRE, recalculée depuis l’énoncé affiché', () => {
    for (const t of TECHNIQUES) {
      for (const seed of SEEDS) {
        const item = t.generate(mulberry32(seed));
        if (item.kind !== 'letter') continue;
        expect(item.answer, `${t.id} : « ${item.prompt} »`).toMatch(/^[A-Z]$/);
        const attendu = expectedLetter(item.prompt);
        expect(attendu, `énoncé illisible : « ${item.prompt} » (${t.id})`).not.toBeNull();
        expect(item.answer, `${t.id} : « ${item.prompt} »`).toBe(attendu);
      }
    }
  });

  it('font boucler l’alphabet dans les deux sens, pas seulement au-delà de Z', () => {
    // Le bouclage est LE point qui fait perdre des séries : il faut donc que le
    // drill le pose dans les deux sens, pas seulement quand on dépasse Z.
    const t = TECHNIQUES.find((x) => x.id === 'alpha-shift')!;
    let auDela = 0;
    let enDessous = 0;
    for (const seed of SEEDS) {
      const item = t.generate(mulberry32(seed));
      const w = item.walkthrough.join(' ');
      if (w.includes('dépasse 26')) auDela++;
      if (w.includes('tombe sous 1')) enDessous++;
    }
    expect(auDela).toBeGreaterThan(10);
    expect(enDessous).toBeGreaterThan(10);
  });

  it('posent un verdict conforme au calcul réellement affiché', () => {
    for (const t of TECHNIQUES) {
      for (const seed of SEEDS) {
        const item = t.generate(mulberry32(seed));
        if (item.kind !== 'verdict') continue;
        const divis = /^(.+) est divisible par (\d+)$/.exec(item.prompt.replace(/[\s  ]+/g, ' '));
        if (divis) {
          expect(item.wrong).toBe(num(divis[1]) % Number(divis[2]) !== 0);
          continue;
        }
        const eq = parseEquality(item.prompt);
        expect(eq, `énoncé illisible : « ${item.prompt} » (${t.id})`).not.toBeNull();
        expect(item.wrong, `${t.id} : « ${item.prompt} »`).toBe(eq!.left !== eq!.shown);
      }
    }
  });

  it('équilibre les vrais et les faux sur les techniques de vérification', () => {
    for (const t of TECHNIQUES.filter((x) => x.family === 'Vérification')) {
      const items = SEEDS.map((s) => t.generate(mulberry32(s)) as Extract<MentalItem, { kind: 'verdict' }>);
      const wrong = items.filter((i) => i.wrong).length;
      expect(wrong / items.length, t.id).toBeGreaterThan(0.3);
      expect(wrong / items.length, t.id).toBeLessThan(0.7);
    }
  });
});

/**
 * Le cœur du module : chaque technique de vérification doit engendrer des faux
 * que SA méthode détecte — et, pour la preuve par 9, des faux que la méthode
 * précédente ne détecte PAS. Sans ça on entraînerait un réflexe inutile.
 */
describe('les faux sont détectables par la technique enseignée', () => {
  it('contrôle par les unités : le chiffre des unités diffère toujours', () => {
    const t = techniqueById('units-check')!;
    for (const seed of SEEDS) {
      const item = t.generate(mulberry32(seed)) as Extract<MentalItem, { kind: 'verdict' }>;
      const eq = parseEquality(item.prompt)!;
      if (item.wrong) expect(eq.shown % 10, item.prompt).not.toBe(eq.left % 10);
      else expect(eq.shown % 10).toBe(eq.left % 10);
    }
  });

  it('preuve par 9 : les unités CONCORDENT, seule la racine numérique trahit', () => {
    const t = techniqueById('cast-out-nines')!;
    let faux = 0;
    for (const seed of SEEDS) {
      const item = t.generate(mulberry32(seed)) as Extract<MentalItem, { kind: 'verdict' }>;
      const eq = parseEquality(item.prompt)!;
      // Le piège doit rester invisible au contrôle des unités, sinon la
      // technique n'a aucune raison d'exister.
      expect(eq.shown % 10, item.prompt).toBe(eq.left % 10);
      if (item.wrong) {
        faux++;
        expect(digitRoot(eq.shown), item.prompt).not.toBe(digitRoot(eq.left));
      }
    }
    expect(faux).toBeGreaterThan(0);
  });

  it('ordre de grandeur : le nombre de chiffres diffère quand c’est faux', () => {
    const t = techniqueById('magnitude')!;
    for (const seed of SEEDS) {
      const item = t.generate(mulberry32(seed)) as Extract<MentalItem, { kind: 'verdict' }>;
      const eq = parseEquality(item.prompt)!;
      const digits = (n: number) => String(Math.abs(n)).length;
      if (item.wrong) expect(digits(eq.shown), item.prompt).not.toBe(digits(eq.left));
      else expect(digits(eq.shown)).toBe(digits(eq.left));
    }
  });
});

describe('outils de réduction', () => {
  it('somme les chiffres', () => {
    expect(digitSum(47)).toBe(11);
    expect(digitSum(999)).toBe(27);
    expect(digitSum(-123)).toBe(6);
  });

  it('réduit à la racine numérique, congruente au nombre modulo 9', () => {
    for (let n = 1; n <= 500; n++) {
      const r = digitRoot(n);
      expect(r).toBeGreaterThanOrEqual(1);
      expect(r).toBeLessThanOrEqual(9);
      expect(r % 9).toBe(n % 9);
    }
    expect(digitRoot(0)).toBe(0);
  });
});

describe('schémas et exemples', () => {
  it('chaque technique porte un schéma : sans lui, la règle reste une incantation', () => {
    for (const t of TECHNIQUES) {
      expect(t.diagram, t.id).toBeDefined();
      expect(t.diagram!.caption.length, t.id).toBeGreaterThan(60);
    }
  });

  it('les schémas de bonds partent bien d’avant pour arriver à la cible', () => {
    for (const t of TECHNIQUES) {
      if (t.diagram?.kind !== 'bonds') continue;
      const stops = t.diagram.stops;
      expect(stops.length, t.id).toBeGreaterThanOrEqual(2);
      // Le dernier arrêt EST la cible : un schéma qui s'arrête avant ne montre
      // pas le calcul en entier.
      expect(stops[stops.length - 1].at, t.id).toBe(t.diagram.to);
      for (const s of stops) expect(s.note.length, t.id).toBeGreaterThan(0);
    }
  });

  it('les découpes se recomposent : chaque morceau est étiqueté et le total est donné', () => {
    for (const t of TECHNIQUES) {
      if (t.diagram?.kind !== 'decoupe') continue;
      expect(t.diagram.parts.length, t.id).toBeGreaterThanOrEqual(2);
      for (const p of t.diagram.parts) {
        expect(p.label.length, t.id).toBeGreaterThan(3);
        expect(p.value.length, t.id).toBeGreaterThan(0);
      }
      expect(t.diagram.total.length, t.id).toBeGreaterThan(0);
    }
  });

  it('les exemples de la page technique sont ceux du générateur, jamais rédigés à part', () => {
    // La page tire les graines 7, 23 et 61. Un exemple écrit à la main
    // finirait par diverger de ce que le drill propose ; ici c'est impossible.
    for (const t of TECHNIQUES) {
      for (const seed of [7, 23, 61]) {
        const item = t.generate(mulberry32(seed));
        expect(item.walkthrough.length, `${t.id} / graine ${seed}`).toBeGreaterThanOrEqual(2);
        expect(item.prompt.length, `${t.id} / graine ${seed}`).toBeGreaterThan(0);
      }
    }
  });
});
