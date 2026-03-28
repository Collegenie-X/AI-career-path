import type { CareerPlan, YearPlan } from '../components/CareerPathBuilder';
import type { PlanItemWithCheck } from '../components/TimelineItemComponents';

export function calculateYearStatistics(year: YearPlan): { total: number; checked: number } {
  const goalGroupItemIds = new Set(
    year.semester === 'split'
      ? (year.semesterPlans ?? []).flatMap(sp => sp.goalGroups.flatMap(g => g.items.map(it => it.id)))
      : (year.goalGroups ?? []).flatMap(g => g.items.map(it => it.id))
  );
  
  const ungroupedCount = year.items.filter(it => !goalGroupItemIds.has(it.id)).length;
  const groupCount = (year.groups ?? []).reduce((gs, g) => gs + g.items.length, 0);
  const goalGroupCount = year.semester === 'split'
    ? (year.semesterPlans ?? []).reduce((ss, sp) => ss + sp.goalGroups.reduce((gs, g) => gs + g.items.length, 0), 0)
    : (year.goalGroups ?? []).reduce((gs, g) => gs + g.items.length, 0);
  const total = ungroupedCount + groupCount + goalGroupCount;

  const directChecked = year.items.filter((it) => !goalGroupItemIds.has(it.id) && (it as PlanItemWithCheck).checked).length;
  const groupChecked = (year.groups ?? []).reduce((gs, g) => gs + g.items.filter(it => (it as PlanItemWithCheck).checked).length, 0);
  const goalGroupChecked = year.semester === 'split'
    ? (year.semesterPlans ?? []).reduce((ss, sp) => ss + sp.goalGroups.reduce((gs, g) => gs + g.items.filter(it => (it as PlanItemWithCheck).checked).length, 0), 0)
    : (year.goalGroups ?? []).reduce((gs, g) => gs + g.items.filter(it => (it as PlanItemWithCheck).checked).length, 0);
  const checked = directChecked + groupChecked + goalGroupChecked;

  return { total, checked };
}

/** 타임라인 상세·리스트 카드 공통 — 학년별 통계 합산 */
export function calculateCareerPlanStatistics(plan: CareerPlan): {
  totalItems: number;
  checkedItems: number;
  completionPercent: number;
} {
  const { totalItems, checkedItems } = plan.years.reduce(
    (acc, year) => {
      const stats = calculateYearStatistics(year);
      return {
        totalItems: acc.totalItems + stats.total,
        checkedItems: acc.checkedItems + stats.checked,
      };
    },
    { totalItems: 0, checkedItems: 0 },
  );
  const completionPercent = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0;
  return { totalItems, checkedItems, completionPercent };
}
