import type { CultureCategory, CultureDiagram, CultureDomain, CultureLesson, CultureQuestion } from '../../types';

export type QuestionSeed = readonly [
  question: string,
  answer: string,
  distractors: readonly [string, string, string],
  explanation: string,
  tags?: readonly string[],
];

export interface CultureTopicSeed {
  slug: string;
  title: string;
  category: CultureCategory;
  categories?: CultureCategory[];
  source: string;
  verifiedAt?: string;
  takeaways: string[];
  trap?: string;
  memoryTip?: string;
  example?: string;
  diagram?: CultureDiagram;
  relatedQuestionIds?: string[];
  questions: QuestionSeed[];
}

export interface BuiltDomainContent {
  questions: CultureQuestion[];
  lessons: CultureLesson[];
}

export function buildDomainContent(
  domain: CultureDomain,
  prefix: string,
  topics: CultureTopicSeed[],
  coreCount: number,
): BuiltDomainContent {
  let ordinal = 0;
  const lessons: CultureLesson[] = [];
  const questions: CultureQuestion[] = [];

  for (const topic of topics) {
    const questionIds: string[] = [];
    for (const seed of topic.questions) {
      ordinal += 1;
      const id = `v3-${prefix}-${String(ordinal).padStart(3, '0')}`;
      questionIds.push(id);
      questions.push({
        id,
        domain,
        category: topic.category,
        categories: [...new Set([topic.category, ...(topic.categories ?? [])])],
        tags: [...(seed[4] ?? []), topic.slug],
        question: seed[0],
        type: 'single-choice',
        choices: [seed[1], ...seed[2]],
        answer: seed[1],
        explanation: seed[3],
        difficulty: ordinal <= coreCount ? 1 : 2,
        source: topic.source,
        isTimeSensitive: Boolean(topic.verifiedAt),
        verifiedAt: topic.verifiedAt,
        highYield: ordinal <= coreCount,
        trap: topic.trap,
        memoryTip: topic.memoryTip,
      });
    }
    lessons.push({
      id: `lesson-v3-${prefix}-${topic.slug}`,
      domain,
      category: topic.category,
      title: topic.title,
      takeaways: topic.takeaways,
      example: topic.example,
      trap: topic.trap,
      memoryTip: topic.memoryTip,
      tags: [topic.slug],
      questionIds: [...questionIds, ...(topic.relatedQuestionIds ?? [])],
      diagram: topic.diagram,
      source: topic.source,
      isTimeSensitive: Boolean(topic.verifiedAt),
      verifiedAt: topic.verifiedAt,
    });
  }
  return { questions, lessons };
}
