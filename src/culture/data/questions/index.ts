import type { CultureDomain, CultureQuestion } from '../../types';
import { aerodromesContent } from './aerodromes';
import { aerodynamicsContent } from './aerodynamics';
import { airFranceContent } from './airFrance';
import { document2026Questions } from './document2026';
import { geographyContent } from './geography';
import { historyCommercialContent } from './historyCommercial';
import { instrumentsContent } from './instruments';
import { navigationContent } from './navigation';
import { regulationsTrainingContent } from './regulationsTraining';
import { weatherContent } from './weather';

function documentDomain(number: number): CultureDomain {
  if ((number >= 3 && number <= 10) || number === 36) return 'navigation';
  if (number >= 11 && number <= 18) return 'aerodynamics';
  if (number >= 19 && number <= 24) return 'instruments';
  if (number >= 25 && number <= 28) return 'aerodromes';
  if ((number >= 29 && number <= 32) || (number >= 65 && number <= 72)) return 'history-commercial';
  if ((number >= 33 && number <= 39) && number !== 36) return 'weather';
  if (number >= 40 && number <= 48) return 'regulations-training';
  if (number >= 49 && number <= 64) return 'air-france';
  return 'geography';
}

export const documentEditorialQuestions: CultureQuestion[] = document2026Questions
  .filter((question) => question.type !== 'numeric')
  .map((question) => ({ ...question, domain: documentDomain(question.sourceQuestionNumber ?? 0) }));

export const DOMAIN_CONTENT = {
  'air-france': airFranceContent,
  navigation: navigationContent,
  weather: weatherContent,
  aerodynamics: aerodynamicsContent,
  instruments: instrumentsContent,
  aerodromes: aerodromesContent,
  'regulations-training': regulationsTrainingContent,
  geography: geographyContent,
  'history-commercial': historyCommercialContent,
} as const;

export const allCultureQuestions: CultureQuestion[] = [
  ...documentEditorialQuestions,
  ...Object.values(DOMAIN_CONTENT).flatMap((content) => content.questions),
];

export const allCultureLessons = Object.values(DOMAIN_CONTENT).flatMap((content) => content.lessons);
