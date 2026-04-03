import { API_PATHS, buildApiUrl } from '@/lib/config/api';
import { fetchWithAuthRetry } from '@/lib/auth/fetchWithAuthRetry';
import type {
  ExecutionPlanAiGenerateRequestBody,
  ExecutionPlanAiGenerateResponseBody,
} from './executionPlanAiTypes';

export async function postExecutionPlanAiGenerate(
  body: ExecutionPlanAiGenerateRequestBody,
): Promise<ExecutionPlanAiGenerateResponseBody> {
  const url = buildApiUrl(API_PATHS.executionPlanAiGenerate);
  const res = await fetchWithAuthRetry(url, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error('AI 응답을 해석하지 못했어요.');
  }
  if (!res.ok) {
    const err = data as { detail?: string; code?: string };
    const msg = err.detail ?? `요청 실패 (${res.status})`;
    const e = new Error(msg) as Error & { code?: string; status?: number };
    e.code = err.code;
    e.status = res.status;
    throw e;
  }
  return data as ExecutionPlanAiGenerateResponseBody;
}
