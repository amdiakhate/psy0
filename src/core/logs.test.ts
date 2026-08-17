import { describe, expect, it } from 'vitest';
import { formatDayLog } from './logs';
import type { DayLogContext, DayLogEntry } from './logs';

const entry = (over: Partial<DayLogEntry> = {}): DayLogEntry => ({
  day: '2026-08-18',
  ts: 1_755_500_000_000,
  exercise: 'word-skip',
  level: 3,
  errPct: 22,
  feeling: 'laborieux',
  ...over,
});

const context = (over: Partial<DayLogContext> = {}): DayLogContext => ({
  day: '2026-08-18',
  entries: [entry({ role: 'priority', passes: 3 })],
  names: { 'word-skip': 'Un mot sur deux', cubes: 'Cubes 2D/3D', 'calc-grid': 'Grilles de calculs' },
  subtypes: {},
  psychoUsedSec: 300,
  psychoCapSec: 720,
  tomorrow: { priority: 'Billes', group: 'G3 Logique' },
  ...over,
});

describe('formatDayLog', () => {
  it('ne produit rien sans entrée', () => {
    expect(formatDayLog(context({ entries: [] }))).toBe('');
  });

  it('produit une ligne par exercice, préfixée du rôle', () => {
    const text = formatDayLog(
      context({
        entries: [
          entry({ role: 'warmup', exercise: 'calc-grid', level: 4, errPct: 8, feeling: 'fluide' }),
          entry({ role: 'priority', passes: 3 }),
          entry({ role: 'rotation', exercise: 'cubes', level: 2, errPct: 31, feeling: 'correct' }),
        ],
      }),
    );
    const lines = text.split('\n');
    expect(lines[0]).toBe('=== 18/08/2026 · PSY0 Trainer ===');
    // La priorité passe avant la rotation, l'échauffement après : on lit
    // d'abord ce qui pilote la suite.
    expect(lines[1]).toContain('PRIORITÉ');
    expect(lines[2]).toContain('ROTATION');
    expect(lines[3]).toContain('ÉCHAUFFEMENT');
  });

  it('reporte le nombre de passes de la priorité', () => {
    expect(formatDayLog(context())).toContain('3 passes');
    // Une seule passe : l'information n'apporte rien, on ne l'écrit pas.
    expect(formatDayLog(context({ entries: [entry({ role: 'rotation', passes: 1 })] }))).not.toContain('passes');
  });

  it('reporte les sous-types d’erreurs dominants avec leur taux', () => {
    const text = formatDayLog(
      context({
        subtypes: {
          'word-skip': [
            { tag: 'alpha-order', errorRate: 0.41, n: 17 },
            { tag: 'theme-switch', errorRate: 0.18, n: 22 },
          ],
        },
      }),
    );
    expect(text).toContain('sous-types : alpha-order 41%, theme-switch 18%');
  });

  it('reporte le Psychomoteur consommé sur le cap quotidien', () => {
    expect(formatDayLog(context())).toContain('PSYCHOMOTEUR · 5 min consommées / 12 min de cap quotidien');
  });

  it('annonce la priorité et la rotation du lendemain', () => {
    expect(formatDayLog(context())).toContain('DEMAIN · priorité : Billes · rotation : G3 Logique');
  });

  it('signale explicitement des priorités non saisies plutôt que de mentir', () => {
    const text = formatDayLog(context({ tomorrow: { priority: null, group: 'G1 Tri' } }));
    expect(text).toContain('non définie (P1/P2/P3 à saisir)');
  });

  it('inclut la note libre quand elle existe, le ressenti sinon', () => {
    expect(formatDayLog(context({ entries: [entry({ note: 'pièges miroirs' })] }))).toContain(
      'laborieux · pièges miroirs',
    );
    expect(formatDayLog(context({ entries: [entry({ note: '   ' })] }))).toContain('laborieux');
  });

  it('reste lisible pour une entrée sans rôle (ancien log)', () => {
    const text = formatDayLog(context({ entries: [entry({ role: undefined })] }));
    expect(text).toContain('SÉANCE · Un mot sur deux · niveau 3 · 22% err');
  });
});
