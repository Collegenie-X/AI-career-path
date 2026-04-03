import type { CareerPlan } from '../components/CareerPathBuilder';

/** 학년·그룹·학기 구조 전체 항목 수·완료 수 (리스트 카드·진행률 공통) */
export function getCareerPlanProgressStats(plan: CareerPlan): {
  totalItems: number;
  checkedItems: number;
  completionPercent: number;
} {
  const totalItems = plan.years.reduce((sum, year) => {
    const baseItemsCount = year.items.length;
    const groupedItemsCount = (year.groups ?? []).reduce((groupSum, group) => groupSum + group.items.length, 0);
    const goalGroupItemsCount = (year.goalGroups ?? []).reduce((groupSum, group) => groupSum + group.items.length, 0);
    const splitSemesterItemsCount = (year.semesterPlans ?? []).reduce((semesterSum, semesterPlan) => {
      const semesterGoalItemsCount = semesterPlan.goalGroups.reduce(
        (goalSum, goalGroup) => goalSum + goalGroup.items.length,
        0,
      );
      return semesterSum + semesterGoalItemsCount;
    }, 0);

    return sum + baseItemsCount + groupedItemsCount + goalGroupItemsCount + splitSemesterItemsCount;
  }, 0);

  const checkedItems = plan.years.reduce((sum, year) => {
    const baseCheckedCount = year.items.filter((item) => item.checked).length;
    const groupedCheckedCount = (year.groups ?? []).reduce(
      (groupSum, group) => groupSum + group.items.filter((item) => item.checked).length,
      0,
    );
    const goalGroupCheckedCount = (year.goalGroups ?? []).reduce(
      (groupSum, group) => groupSum + group.items.filter((item) => item.checked).length,
      0,
    );
    const splitSemesterCheckedCount = (year.semesterPlans ?? []).reduce((semesterSum, semesterPlan) => {
      const semesterGoalCheckedCount = semesterPlan.goalGroups.reduce(
        (goalSum, goalGroup) => goalSum + goalGroup.items.filter((item) => item.checked).length,
        0,
      );
      return semesterSum + semesterGoalCheckedCount;
    }, 0);

    return sum + baseCheckedCount + groupedCheckedCount + goalGroupCheckedCount + splitSemesterCheckedCount;
  }, 0);

  const completionPercent = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0;

  return { totalItems, checkedItems, completionPercent };
}
