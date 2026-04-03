import type { PlanItem } from '../components/CareerPathBuilder';

/** 타임라인·체크리스트에서 사용하는 계획 항목 (체크 상태 선택) */
export type PlanItemWithCheck = PlanItem & { readonly checked?: boolean };
