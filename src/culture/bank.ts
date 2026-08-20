import type { CultureEntry, CultureTheme } from './types';
import { THEMES } from './types';
import { aerodynamique } from './data/aerodynamique';
import { motorisation } from './data/motorisation';
import { instruments } from './data/instruments';
import { meteo } from './data/meteo';
import { navigation } from './data/navigation';
import { reglementation } from './data/reglementation';
import { histoire } from './data/histoire';
import { airFrance } from './data/air-france';
import { geographie } from './data/geographie';
import { aeronefs } from './data/aeronefs';
import { cultureGenerale } from './data/culture-generale';

/** La banque complète, dans l'ordre des thèmes. */
export const BANK: CultureEntry[] = [
  ...aerodynamique,
  ...motorisation,
  ...instruments,
  ...meteo,
  ...navigation,
  ...reglementation,
  ...histoire,
  ...airFrance,
  ...geographie,
  ...aeronefs,
  ...cultureGenerale,
];

const BY_ID = new Map(BANK.map((e) => [e.id, e]));

export function entryById(id: string): CultureEntry | undefined {
  return BY_ID.get(id);
}

export function byTheme(theme: CultureTheme): CultureEntry[] {
  return BANK.filter((e) => e.theme === theme);
}

/** Nombre de questions par thème — sert à l'affichage du programme. */
export function counts(): Record<CultureTheme, number> {
  const out = {} as Record<CultureTheme, number>;
  for (const t of THEMES) out[t] = 0;
  for (const e of BANK) out[e.theme] += 1;
  return out;
}

/**
 * Les questions calquées sur une question RÉELLEMENT relevée dans les annales
 * Pilotest 2018 ou 2019. À réviser en priorité : ce sont les seules dont on
 * sait qu'un examinateur les a jugées dignes d'être posées.
 */
export const ASKED: CultureEntry[] = BANK.filter((e) => e.asked !== undefined);
