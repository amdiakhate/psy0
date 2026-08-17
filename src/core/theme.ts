/**
 * Thème clair / sombre.
 *
 * L'app a été écrite en sombre : ses 1140 classes de couleur utilisent l'échelle
 * `zinc` et les accents `sky`/`amber`/`red`/`green`. Plutôt que de les réécrire
 * une à une, le mode clair **redéfinit les variables CSS de Tailwind** en
 * inversant l'échelle de gris (`index.css`). `bg-zinc-900` devient donc un fond
 * clair et `text-zinc-200` un texte foncé, sans toucher au JSX.
 *
 * Les couleurs RÉGLEMENTAIRES des exercices (bleu/violet d'Airways, marine/gris
 * des Formes glissées, bleu/orange des Formes et couleurs) sont écrites en
 * hexadécimal en dur : elles échappent volontairement à ce mécanisme, car les
 * inverser contredirait les règles officielles.
 */

export type ThemePreference = 'clair' | 'sombre' | 'systeme';
export type ResolvedTheme = 'clair' | 'sombre';

export const THEME_PREFERENCES: ThemePreference[] = ['clair', 'sombre', 'systeme'];

/** Clé lue par le script anti-scintillement dans index.html — ne pas renommer. */
export const THEME_STORAGE_KEY = 'psy0.theme';

export function resolveTheme(preference: ThemePreference, systemPrefersDark: boolean): ResolvedTheme {
  if (preference === 'systeme') return systemPrefersDark ? 'sombre' : 'clair';
  return preference;
}

/** Valeur de l'attribut `data-theme` posé sur `<html>`. */
export function themeAttribute(resolved: ResolvedTheme): 'light' | 'dark' {
  return resolved === 'clair' ? 'light' : 'dark';
}

/** Indique au navigateur comment rendre les widgets natifs (champs, scrollbars). */
export function colorScheme(resolved: ResolvedTheme): 'light' | 'dark' {
  return themeAttribute(resolved);
}

/** Tolère une valeur inconnue ou absente venant du storage. */
export function parsePreference(raw: string | null): ThemePreference {
  return raw === 'clair' || raw === 'sombre' || raw === 'systeme' ? raw : 'systeme';
}

export const PREFERENCE_LABEL: Record<ThemePreference, string> = {
  clair: 'Clair',
  sombre: 'Sombre',
  systeme: 'Comme le système',
};

/** Couleurs des graphiques, que recharts veut en valeurs et non en classes. */
export interface ChartColors {
  grid: string;
  axis: string;
  line: string;
  tooltipBg: string;
  tooltipBorder: string;
}

export function chartColors(resolved: ResolvedTheme): ChartColors {
  return resolved === 'clair'
    ? {
        grid: '#d4d4d8',
        axis: '#52525b',
        line: '#0284c7',
        tooltipBg: '#ffffff',
        tooltipBorder: '#d4d4d8',
      }
    : {
        grid: '#3f3f46',
        axis: '#71717a',
        line: '#38bdf8',
        tooltipBg: '#18181b',
        tooltipBorder: '#3f3f46',
      };
}

export function readPreference(): ThemePreference {
  try {
    return parsePreference(localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return 'systeme';
  }
}

export function systemPrefersDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/** Applique le thème au document. Idempotent. */
export function applyTheme(preference: ThemePreference): ResolvedTheme {
  const resolved = resolveTheme(preference, systemPrefersDark());
  const root = document.documentElement;
  root.setAttribute('data-theme', themeAttribute(resolved));
  root.style.colorScheme = colorScheme(resolved);
  return resolved;
}

export function savePreference(preference: ThemePreference): ResolvedTheme {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // Navigation privée : le thème s'appliquera quand même pour cette session.
  }
  return applyTheme(preference);
}
