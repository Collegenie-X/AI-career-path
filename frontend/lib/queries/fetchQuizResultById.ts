import { buildApiUrl } from '@/lib/config/api';
import type { QuizResultApiPayload } from '@/lib/queries/mapQuizResultApiToRiasec';

export async function fetchQuizResultById(id: string): Promise<QuizResultApiPayload | null> {
  const path = `/api/v1/quiz/results/${encodeURIComponent(id)}/`;
  const url = buildApiUrl(path);
  const res = await fetch(url, { credentials: 'omit', cache: 'no-store' });
  if (!res.ok) return null;
  const json: unknown = await res.json();
  if (!json || typeof json !== 'object') return null;
  return json as QuizResultApiPayload;
}
