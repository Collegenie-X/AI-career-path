import { buildApiUrl } from '@/lib/config/api';
import type { QuizMode } from '@/app/quiz/types';

export type QuizResultAnswerPayload = {
  question_id: number;
  choice_key: string;
};

/**
 * 적성 검사 완료 시 Django `QuizResult` 생성 (POST /api/v1/quiz/results/).
 * 스펙트럼·추천 직업군·TOP5 는 서버에서 계산해 저장합니다.
 */
export async function submitQuizResultToBackend(
  mode: QuizMode,
  answers: QuizResultAnswerPayload[]
): Promise<string | null> {
  const apiMode = mode === '10' ? 'quick' : 'full';
  const url = buildApiUrl('/api/v1/quiz/results/');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'omit',
    body: JSON.stringify({ mode: apiMode, answers }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`quiz_submit_failed:${res.status}:${text.slice(0, 300)}`);
  }
  const data: unknown = await res.json().catch(() => null);
  if (data && typeof data === 'object' && 'id' in data && typeof (data as { id: unknown }).id === 'string') {
    return (data as { id: string }).id;
  }
  return null;
}
