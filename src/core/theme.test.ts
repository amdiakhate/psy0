import { describe, expect, it } from 'vitest';
import {
  PREFERENCE_LABEL,
  THEME_PREFERENCES,
  THEME_STORAGE_KEY,
  chartColors,
  colorScheme,
  cubeSceneColors,
  parsePreference,
  resolveTheme,
  themeAttribute,
} from './theme';

describe('resolveTheme', () => {
  it('respecte un choix explicite, quel que soit le système', () => {
    for (const systemDark of [false, true]) {
      expect(resolveTheme('clair', systemDark)).toBe('clair');
      expect(resolveTheme('sombre', systemDark)).toBe('sombre');
    }
  });

  it('suit le système quand c’est ce qui est demandé', () => {
    expect(resolveTheme('systeme', true)).toBe('sombre');
    expect(resolveTheme('systeme', false)).toBe('clair');
  });
});

describe('parsePreference', () => {
  it('accepte les trois valeurs connues', () => {
    for (const p of THEME_PREFERENCES) expect(parsePreference(p)).toBe(p);
  });

  it('retombe sur « systeme » pour toute valeur inconnue ou absente', () => {
    // Un storage corrompu ne doit pas laisser l'app sans thème.
    for (const bad of [null, '', 'light', 'dark', 'clair ', 'CLAIR', '{}']) {
      expect(parsePreference(bad)).toBe('systeme');
    }
  });
});

describe('themeAttribute / colorScheme', () => {
  it('traduit vers les valeurs attendues par CSS', () => {
    expect(themeAttribute('clair')).toBe('light');
    expect(themeAttribute('sombre')).toBe('dark');
    // color-scheme pilote les widgets natifs (champs, barres de défilement).
    expect(colorScheme('clair')).toBe('light');
    expect(colorScheme('sombre')).toBe('dark');
  });

  it('utilise la clé de storage attendue par le script anti-scintillement', () => {
    // index.html lit cette clé en dur : la renommer ferait clignoter l'écran.
    expect(THEME_STORAGE_KEY).toBe('psy0.theme');
  });
});

describe('chartColors', () => {
  it('donne des couleurs distinctes par thème', () => {
    const clair = chartColors('clair');
    const sombre = chartColors('sombre');
    for (const key of ['grid', 'axis', 'line', 'tooltipBg', 'tooltipBorder'] as const) {
      expect(clair[key]).not.toBe(sombre[key]);
      expect(clair[key]).toMatch(/^#[0-9a-f]{6}$/i);
      expect(sombre[key]).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('donne un fond d’infobulle clair en thème clair, sombre en thème sombre', () => {
    // Une infobulle sombre sur fond clair est illisible : c'est le cas que
    // recharts ne gère pas tout seul, ses couleurs étant passées en props.
    expect(chartColors('clair').tooltipBg).toBe('#ffffff');
    expect(chartColors('sombre').tooltipBg).toBe('#18181b');
  });
});

describe('cubeSceneColors', () => {
  it('utilise une arête sombre en clair et claire en sombre', () => {
    expect(cubeSceneColors('clair').edge).toBe('#52525b');
    expect(cubeSceneColors('sombre').edge).toBe('#e4e4e7');
  });
});

describe('PREFERENCE_LABEL', () => {
  it('nomme les trois préférences en français', () => {
    for (const p of THEME_PREFERENCES) {
      expect(PREFERENCE_LABEL[p]).toBeTruthy();
      expect(PREFERENCE_LABEL[p]).not.toMatch(/light|dark|system/i);
    }
  });
});
