import type { ExerciseModule } from '../../core/types';
import { generate } from './generator';
import type { StarAnswer, StarQuestion } from './generator';
import { validate } from './validator';
import { tips } from './tips';
import { lesson } from './lesson';
import { StarWordsExplain } from './Explain';
import { StarWordsExercise } from './StarWordsExercise';
import { SLOT_LABELS } from './geometry';
import { LEVELS } from './config';

export const starWords: ExerciseModule<StarQuestion, StarAnswer> = {
  id: 'star-words',
  name: 'Mots en étoile',
  description:
    'Neuf mots de 7 lettres, six emplacements sur l’étoile : place 6 mots de façon que chaque case commune à deux mots ne porte qu’UNE seule lettre. Toute configuration sans erreur vaut le point.',
  families: ['Verbale'],
  levels: LEVELS.length,
  defaultItemSeconds: 50,
  /** Pilotest : 10 questions, 50 s chacune. */
  itemLimitSec: 50,
  timed: 'per-item',
  generate,
  validate,
  // La réponse ne contient que des index de mots : on les note « A=#3 » —
  // le seed de l'item permet de retrouver les mots exacts si besoin.
  answerToString: (answer) =>
    answer
      .map((idx, slot) => `${SLOT_LABELS[slot]}=${idx === null || idx === undefined ? '—' : `#${idx + 1}`}`)
      .join(' '),
  expectedToString: (item) =>
    item.question.solution
      .map((idx, slot) => `${SLOT_LABELS[slot]}=${item.question.words[idx]}`)
      .join(' '),
  tips,
  lesson,
  visualCorrectionOnly: true,
  Explain: StarWordsExplain,
  Component: StarWordsExercise,
};
