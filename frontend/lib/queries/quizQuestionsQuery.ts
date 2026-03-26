import { buildApiUrl, API_PATHS } from '@/lib/config/api';
import type { QuizMode, QuizQuestion, QuizChoice } from '@/app/quiz/types';
import { loadLocalQuizQuestionsForMode } from '@/lib/queries/loadLocalQuizQuestionsForMode';

export const quizQuestionsQueryKey = (mode: QuizMode) => ['quizQuestions', mode] as const;

interface QuizChoiceApi {
  id: number;
  choice_key: string;
  text: string;
  riasec_scores: Record<string, number>;
  order_index: number;
}

interface QuizQuestionApi {
  id: number;
  order_index: number;
  zone: string;
  zone_icon: string;
  situation: string;
  description: string;
  feedback_map: Record<string, string>;
  choices: QuizChoiceApi[];
}

function mapChoice(row: QuizChoiceApi): QuizChoice {
  return {
    id: row.choice_key,
    text: row.text,
    riasecScores: row.riasec_scores ?? {},
  };
}

function mapQuestion(row: QuizQuestionApi): QuizQuestion {
  const choices = [...(row.choices ?? [])]
    .sort((a, b) => a.order_index - b.order_index)
    .map(mapChoice);

  return {
    id: row.id,
    zone: row.zone,
    zoneIcon: row.zone_icon,
    situation: row.situation,
    description: row.description,
    feedbackMap: row.feedback_map ?? {},
    choices,
  };
}

function parseQuestionsPayload(data: unknown): QuizQuestion[] {
  if (!Array.isArray(data)) {
    throw new Error('quiz_questions_invalid_payload');
  }
  return (data as QuizQuestionApi[]).map(mapQuestion);
}

export async function fetchQuizQuestions(mode: QuizMode): Promise<QuizQuestion[]> {
  try {
    const apiMode = mode === '10' ? 'quick' : 'full';
    const url = `${buildApiUrl(API_PATHS.quizQuestions)}?mode=${encodeURIComponent(apiMode)}`;
    // 공개 문항 API — 쿠키 불필요. cross-origin(127.0.0.1:8000) 시 credentials 는 CORS 제약을 키움.
    const res = await fetch(url, { credentials: 'omit', cache: 'no-store' });
    if (!res.ok) {
      return loadLocalQuizQuestionsForMode(mode);
    }
    const json: unknown = await res.json();
    const parsed = parseQuestionsPayload(json);
    if (parsed.length === 0) {
      return loadLocalQuizQuestionsForMode(mode);
    }
    return parsed;
  } catch {
    // 네트워크·CORS·파싱 오류 시 `frontend/data/quiz-questions.json` 사용
    return loadLocalQuizQuestionsForMode(mode);
  }
}
