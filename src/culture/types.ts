export type CultureCategory =
  | 'air-france'
  | 'aerodynamics'
  | 'navigation'
  | 'weather'
  | 'instruments'
  | 'aerodromes'
  | 'regulations'
  | 'training'
  | 'mental-math'
  | 'geography'
  | 'commercial-aviation'
  | 'general-aviation';

export type CultureQuestionType = 'single-choice' | 'true-false' | 'numeric' | 'short-answer';

export interface CultureQuestion {
  id: string;
  category: CultureCategory;
  categories: CultureCategory[];
  tags: string[];
  question: string;
  type: CultureQuestionType;
  choices?: string[];
  answer: string | number | boolean;
  acceptedAnswers?: Array<string | number>;
  explanation: string;
  difficulty: 1 | 2 | 3;
  source?: string;
  sourceQuestionNumber?: number;
  isTimeSensitive: boolean;
  verifiedAt?: string;
  trap?: string;
  memoryTip?: string;
  highYield: boolean;
}

export interface CultureLesson {
  id: string;
  category: CultureCategory;
  title: string;
  takeaways: string[];
  example?: string;
  trap?: string;
  memoryTip?: string;
  tags: string[];
  questionIds: string[];
  diagram?: CultureDiagram;
  source?: string;
  isTimeSensitive: boolean;
  verifiedAt?: string;
}

export type CultureDiagram =
  | 'forces'
  | 'fronts'
  | 'papi'
  | 'pitot-static'
  | 'qfu'
  | 'speed-distance-time'
  | 'heading-rose';

export type CultureMastery = 'new' | 'learning' | 'review' | 'mastered';
export type CultureConfidence = 0 | 1 | 2 | 3;

export interface CultureProgress {
  questionId: string;
  seenCount: number;
  correctCount: number;
  incorrectCount: number;
  currentStreak: number;
  mastery: CultureMastery;
  lastSeenAt?: string;
  lastIncorrectAt?: string;
  nextReviewAt?: string;
  confidence?: CultureConfidence;
  understoodAt?: string;
}

export type CultureReviewVerdict = 'wrong' | 'guessed' | 'known' | 'review';

export interface CultureAttempt {
  id: string;
  questionId: string;
  category: CultureCategory;
  answeredAt: string;
  correct: boolean;
  verdict: CultureReviewVerdict;
  sessionId: string;
  mode: CultureSessionMode;
}

export type CultureSessionMode =
  | 'review'
  | 'quick-quiz'
  | 'errors'
  | 'simulation'
  | 'express'
  | 'lesson'
  | 'flight-math'
  | 'headings';

export interface CultureSessionSummary {
  id: string;
  mode: CultureSessionMode;
  startedAt: string;
  endedAt: string;
  questionIds: string[];
  correct: number;
  total: number;
}

export interface CultureStoreV1 {
  version: 1;
  progress: Record<string, CultureProgress>;
  favoriteQuestionIds: string[];
  favoriteLessonIds: string[];
  attempts: CultureAttempt[];
  sessions: CultureSessionSummary[];
  activeDays: string[];
  lastTrainingAt?: string;
  finalStretch: boolean;
}

export type CultureStore = CultureStoreV1;
