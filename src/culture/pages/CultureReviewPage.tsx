import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { mulberry32, newSeed } from '../../core/rng';
import { QUESTIONS } from '../bank';
import { CultureSession } from '../components/CultureSession';
import { useCultureStore } from '../hooks/useCultureStore';
import { selectReviewQuestions } from '../selection';
import type { CultureCategory } from '../types';

export function CultureReviewPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { store } = useCultureStore();
  const count = Math.min(30, Math.max(5, Number(params.get('count')) || 20));
  const category = params.get('category') as CultureCategory | null;
  const filter = params.get('filter') as 'weak' | 'errors' | 'new' | 'traps' | null;
  const ids = params.get('ids')?.split(',').filter(Boolean);
  const questions = useMemo(() => {
    if (ids?.length) return ids.map((id) => QUESTIONS.find((question) => question.id === id)).filter((question): question is NonNullable<typeof question> => Boolean(question));
    return selectReviewQuestions(QUESTIONS, store, count, new Date(), mulberry32(newSeed()), { category: category ?? undefined, filter: filter ?? undefined });
  }, [category, count, filter, ids?.join(','), store]);
  return <CultureSession questions={questions} title="Révision du jour" subtitle={`${questions.length} questions · erreurs et échéances en priorité`} mode="review" onExit={() => navigate('/culture')} />;
}
