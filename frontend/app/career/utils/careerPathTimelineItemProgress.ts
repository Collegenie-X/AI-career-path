import type { PlanItemWithCheck } from '../types/timelinePlanItemTypes';

/** 목표 그룹·플랜 그룹 등 항목 배열의 완료 수 합산 */
export function countCheckedAndTotalForPlanItems(items: PlanItemWithCheck[]): {
  readonly checkedCount: number;
  readonly totalCount: number;
} {
  const totalCount = items.length;
  const checkedCount = items.filter((it) => it.checked).length;
  return { checkedCount, totalCount };
}
