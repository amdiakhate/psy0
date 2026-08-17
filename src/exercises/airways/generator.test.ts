import { describe, expect, it } from 'vitest';
import { generate, inGreyZone, isOnBoard, minimalRemovals, planeCol, violationAt } from './generator';
import { COLS, GROUPS, LEVELS, LINES_PER_GROUP, MAX_BLUE, MAX_TOTAL } from './config';

describe('airways — critères et plateau conformes au test', () => {
  it('reprend les critères officiels : max 4 avions, max 2 bleus, 2 blocs de 6 lignes', () => {
    expect(MAX_TOTAL).toBe(4);
    expect(MAX_BLUE).toBe(2);
    expect(GROUPS).toBe(2);
    expect(LINES_PER_GROUP).toBe(6);
    const q = generate(1, 3).question;
    expect(q.maxTotal).toBe(MAX_TOTAL);
    expect(q.maxBlue).toBe(MAX_BLUE);
    expect(q.zones).toHaveLength(2);
    q.zones.forEach((z) => expect(z.perLine).toHaveLength(6));
  });

  it('est déterministe : même seed → même trafic', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      for (let seed = 0; seed < 40; seed++) {
        expect(generate(seed, level)).toEqual(generate(seed, level));
      }
    }
  });

  it('les zones grises tiennent dans le plateau et forment des paliers (escalier)', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      for (let seed = 0; seed < 60; seed++) {
        const q = generate(seed, level).question;
        for (const zone of q.zones) {
          for (const span of zone.perLine) {
            expect(span.start).toBeGreaterThan(0);
            expect(span.end).toBeLessThan(COLS);
            expect(span.end).toBeGreaterThan(span.start);
          }
          // Paliers : lignes 0-2 identiques, lignes 3-5 identiques.
          expect(zone.perLine[0]).toEqual(zone.perLine[1]);
          expect(zone.perLine[1]).toEqual(zone.perLine[2]);
          expect(zone.perLine[3]).toEqual(zone.perLine[4]);
          expect(zone.perLine[4]).toEqual(zone.perLine[5]);
        }
      }
    }
  });

  it('le trafic est valide et contient les deux couleurs', () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      for (let seed = 0; seed < 40; seed++) {
        const q = generate(seed, level).question;
        for (const p of q.planes) {
          expect(p.line).toBeGreaterThanOrEqual(0);
          expect(p.line).toBeLessThan(LINES_PER_GROUP);
          expect(p.group).toBeLessThan(GROUPS);
          expect(p.spawnTick).toBeGreaterThanOrEqual(0);
          expect(p.spawnTick).toBeLessThan(q.durationTicks);
        }
        expect(q.planes.some((p) => p.color === 'blue')).toBe(true);
        expect(q.planes.some((p) => p.color === 'purple')).toBe(true);
      }
    }
  });

  it('les bleus vont vers la gauche, les violets vers la droite', () => {
    const q = generate(3, 3).question;
    const blue = q.planes.find((p) => p.color === 'blue')!;
    const purple = q.planes.find((p) => p.color === 'purple')!;
    expect(planeCol(blue, blue.spawnTick, q.cols)).toBe(q.cols - 1);
    expect(planeCol(blue, blue.spawnTick + 1, q.cols)).toBe(q.cols - 2);
    expect(planeCol(purple, purple.spawnTick, q.cols)).toBe(0);
    expect(planeCol(purple, purple.spawnTick + 1, q.cols)).toBe(1);
  });

  it('deux avions ne se superposent jamais sur une même trajectoire', () => {
    for (let seed = 0; seed < 30; seed++) {
      const q = generate(seed, 5).question;
      for (let t = 0; t <= q.durationTicks; t++) {
        const seen = new Set<string>();
        for (const p of q.planes) {
          if (!isOnBoard(p, t, q.cols)) continue;
          const key = `${p.group}:${p.line}:${planeCol(p, t, q.cols)}:${p.color}`;
          expect(seen.has(key)).toBe(false);
          seen.add(key);
        }
      }
    }
  });

  it("L'INVARIANT : la série est gagnable — les déroutages de référence (par) évitent tout accident", () => {
    for (let level = 1; level <= LEVELS.length; level++) {
      for (let seed = 0; seed < 60; seed++) {
        const q = generate(seed, level).question;
        const removed = new Set(minimalRemovals(q));
        expect(removed.size).toBe(q.par);
        for (let t = 0; t <= q.durationTicks; t++) {
          expect(violationAt(q, t, removed)).toBeNull();
        }
      }
    }
  });

  it('le par n’est pas gratuit : ne rien dérouter provoque bien un accident', () => {
    let checked = 0;
    for (let seed = 0; seed < 100 && checked < 20; seed++) {
      const q = generate(seed, 4).question;
      if (q.par === 0) continue;
      checked++;
      const none = new Set<number>();
      let violated = false;
      for (let t = 0; t <= q.durationTicks && !violated; t++) {
        if (violationAt(q, t, none)) violated = true;
      }
      expect(violated).toBe(true);
    }
    expect(checked).toBeGreaterThan(0);
  });

  it('inGreyZone respecte la zone PROPRE À LA LIGNE (escalier)', () => {
    const q = generate(9, 4).question;
    for (const p of q.planes.slice(0, 40)) {
      for (let t = p.spawnTick; t < p.spawnTick + q.cols; t += 2) {
        const col = planeCol(p, t, q.cols);
        const span = q.zones[p.group].perLine[p.line];
        expect(inGreyZone(p, t, q)).toBe(col >= span.start && col <= span.end);
      }
    }
  });
});
