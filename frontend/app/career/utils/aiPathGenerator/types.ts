import type { PlanItem, YearPlan } from '../../components/CareerPathBuilder';

export type AiIntensityId = 'light' | 'normal' | 'challenge';
export type AiHorizonId = 'mid' | 'high' | 'job';
export type AiStyleId = 'project' | 'reading' | 'service' | 'competition' | 'certification';
export type AiStageId = 'elemLow' | 'elemHigh' | 'mid' | 'high';
export type AiDetailLevel = 'detail' | 'outline';
export type AiItemSource = 'milestone' | 'foundation' | 'style' | 'freeText' | 'balance';

/** 사용자가 자동 생성 폼에서 고른 값 — 서버 연동 시 요청 본문이 된다 */
export type AiPathSelection = {
  currentGradeId: string;
  horizonId: AiHorizonId | '';
  styleIds: AiStyleId[];
  intensityId: AiIntensityId;
  freeText: string;
};

export type AiPathDraftRequest = AiPathSelection & {
  starId: string;
  jobId: string;
  jobName: string;
  /** 재생성할 때마다 1씩 올려 다른 조합을 뽑는다 */
  variant: number;
};

/** PlanItem에서 교체 후보로 들고 다니는 최소 형태 */
export type AiAlternativeItem = Omit<PlanItem, 'id' | 'subItems' | 'aiAlternatives'>;

export type AiPathDraftResponse = {
  schema_version: number;
  summary: string;
  assumptions: string[];
  years: YearPlan[];
  quota_remaining_after: number;
};

export type AiOperation =
  | 'generate'
  | 'regenerateAll'
  | 'regenerateYear'
  | 'expandYear'
  | 'changeIntensity'
  | 'swapItem'
  | 'addBalanceGoal';

export class AiQuotaError extends Error {
  code = 'quota_exceeded' as const;
  constructor() {
    super('AI 크레딧이 부족해요.');
  }
}
