/**
 * 커리어 패스 AI 자동 생성 — 서버 연동 전 더미 구현.
 *
 * 서버가 준비되면 이 파일의 함수 본문만 fetch 호출로 바꾸면 된다.
 * 예상 엔드포인트: POST /api/v1/career-plan/path-ai/generate/
 * 요청 본문 = AiPathDraftRequest, 응답 본문 = AiPathDraftResponse.
 * 지금은 더미 JSON(data/career/ai-path/ai-path-generator.json)과 기존 직업·추천 데이터를 조합한다.
 */
import type { YearPlan } from '../../components/CareerPathBuilder';
import { AI_PATH_CONFIG as C } from './config';
import { generateDraftYears, regenerateSingleYear, summarizeDraft } from './generateDraft';
import { AiQuotaError, type AiOperation, type AiPathDraftRequest, type AiPathDraftResponse } from './types';

const { storageKey, freeTrialCredits, costs, mockDelayMs } = C.pricing;

export function readAiCredits(): number {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (raw === null) return freeTrialCredits;
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? n : freeTrialCredits;
  } catch {
    return freeTrialCredits;
  }
}

export function writeAiCredits(value: number): void {
  try {
    window.localStorage.setItem(storageKey, String(Math.max(0, value)));
  } catch {
    /* 저장소를 쓸 수 없으면 이번 세션에서만 유지된다 */
  }
}

export function getOperationCost(operation: AiOperation): number {
  return costs[operation] ?? 0;
}

function charge(operation: AiOperation): number {
  const cost = getOperationCost(operation);
  const credits = readAiCredits();
  if (cost > credits) throw new AiQuotaError();
  const remaining = credits - cost;
  if (cost > 0) writeAiCredits(remaining);
  return remaining;
}

function wait(operation: AiOperation): Promise<void> {
  const [min, max] = mockDelayMs;
  // 크레딧을 쓰지 않는 가벼운 작업은 짧게만 기다린다
  const ms = getOperationCost(operation) > 0 ? min + Math.random() * (max - min) : 350;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toResponse(request: AiPathDraftRequest, years: YearPlan[], remaining: number): AiPathDraftResponse {
  const { summary, assumptions } = summarizeDraft(request, years);
  return { schema_version: C.schemaVersion, summary, assumptions, years, quota_remaining_after: remaining };
}

export async function postAiPathGenerate(
  request: AiPathDraftRequest,
  operation: Extract<AiOperation, 'generate' | 'regenerateAll' | 'changeIntensity'>,
  previousYears: YearPlan[] = [],
): Promise<AiPathDraftResponse> {
  if (getOperationCost(operation) > readAiCredits()) throw new AiQuotaError();
  await wait(operation);
  const years = generateDraftYears(request, previousYears);
  return toResponse(request, years, charge(operation));
}

export async function postAiPathRegenerateYear(
  request: AiPathDraftRequest,
  years: YearPlan[],
  gradeId: string,
  operation: Extract<AiOperation, 'regenerateYear' | 'expandYear'>,
): Promise<AiPathDraftResponse> {
  if (getOperationCost(operation) > readAiCredits()) throw new AiQuotaError();
  await wait(operation);
  const next = regenerateSingleYear(request, years, gradeId, operation === 'expandYear');
  return toResponse(request, next, charge(operation));
}
