import type { ExerciseModule } from '../../core/types';
import { generate } from './generator';
import type { WordBoxesAnswer, WordBoxesQuestion } from './generator';
import { validate } from './validator';
import { tips } from './tips';
import { lesson } from './lesson';
import { WordBoxesExercise } from './WordBoxesExercise';
import { WordBoxesTip } from './WordBoxesTip';
import { LEVELS } from './config';

export const wordBoxes: ExerciseModule<WordBoxesQuestion, WordBoxesAnswer> = {
  id: 'word-boxes',
  name: 'Boîtes à mots',
  description:
    'Des boîtes VIDES et sans étiquette. Un mot apparaît brièvement : au premier mot d’un champ lexical tu choisis librement sa boîte, tous les suivants doivent retrouver la MÊME. Test de mémoire associative.',
  families: ['Verbale'],
  levels: LEVELS.length,
  defaultItemSeconds: 60,
  timed: 'continuous',
  generate,
  validate,
  answerToString: (a) => `boîte ${a + 1}`,
  expectedToString: () => '—',
  tips,
  lesson,
  Component: WordBoxesExercise,
  TipsIllustration: WordBoxesTip,
};
