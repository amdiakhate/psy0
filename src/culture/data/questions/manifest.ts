import type { CultureDomain } from '../../types';

export const CULTURE_BANK_TARGETS: Record<CultureDomain, { total: number; core: number }> = {
  'air-france': { total: 50, core: 28 },
  navigation: { total: 55, core: 30 },
  weather: { total: 50, core: 25 },
  aerodynamics: { total: 45, core: 22 },
  instruments: { total: 35, core: 18 },
  aerodromes: { total: 30, core: 14 },
  'regulations-training': { total: 40, core: 18 },
  geography: { total: 45, core: 14 },
  'history-commercial': { total: 30, core: 11 },
};

export const CULTURE_BANK_TOTAL = 380;
export const CULTURE_CORE_TOTAL = 180;
export const CULTURE_EXTENDED_TOTAL = 200;
export const CULTURE_LESSON_TOTAL = 60;
