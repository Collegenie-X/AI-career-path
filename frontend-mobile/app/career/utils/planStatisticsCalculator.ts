import type { YearPlan } from '../components/CareerPathBuilder';
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
