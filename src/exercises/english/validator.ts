import type { Item } from '../../core/types';
import type { EnglishAnswer, EnglishQuestion } from './generator';

export function validate(item: Item<EnglishQuestion>, answer: EnglishAnswer): boolean {
  return answer === item.question.correctIndex;
}
