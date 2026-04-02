import type { QuizMode, QuizQuestion } from '@/app/quiz/types';
import quizQuestionsJson from '@/data/quiz-questions.json';

/**
 * 백엔드 `GET /api/v1/quiz/questions/?mode=` 와 동일한 규칙:
 * - quick: DB/정적 데이터 상위 10문항
 * - full: 전체(현재 JSON 30문항)
 */
const ALL_LOCAL_QUIZ_QUESTIONS = quizQuestionsJson as unknown as QuizQuestion[];

export function loadLocalQuizQuestionsForMode(mode: QuizMode): QuizQuestion[] {
  if (mode === '10') {
    return ALL_LOCAL_QUIZ_QUESTIONS.slice(0, 10);
  }
  return [...ALL_LOCAL_QUIZ_QUESTIONS];
}
