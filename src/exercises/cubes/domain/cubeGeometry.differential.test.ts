import { describe, expect, it } from 'vitest';
import { buildDifferentialReport } from './differentialReport';

describe('migration différentielle du moteur Cubes', () => {
  it('ne diverge ni sur les identités, ni sur les orientations, ni sur le verdict', () => {
    const exhaustive = import.meta.env.VITE_CUBES_EXHAUSTIVE === '1';
    const report = buildDifferentialReport(exhaustive ? 200 : 10);

    if (exhaustive) {
      console.log(`cases compared: ${report.casesCompared.toLocaleString('en-US')}`);
      console.log(`face identity divergences: ${report.identityDivergences}`);
      console.log(`symbol orientation divergences: ${report.orientationDivergences}`);
      console.log(`global verdict divergences: ${report.verdictDivergences}`);
    }

    expect(report.casesCompared).toBeGreaterThan(exhaustive ? 1_000_000 : 100_000);
    expect(report.identityDivergences).toBe(0);
    expect(report.orientationDivergences).toBe(0);
    expect(report.verdictDivergences).toBe(0);
    expect(report.examples).toEqual([]);
  });
});
