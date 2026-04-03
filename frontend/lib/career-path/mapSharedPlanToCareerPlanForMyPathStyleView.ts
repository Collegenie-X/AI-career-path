/**
 * 커뮤니티 SharedPlan → 내 패스 타임라인(YearTimelineNode)용 CareerPlan 매핑
 */

import type { CareerPlan, GoalActivityGroup, PlanItem, SubItem, YearPlan } from '@/app/career/components/CareerPathBuilder';
import type {
  SharedPlan,
  SharedPlanGoalGroup,
  SharedPlanItem,
  SharedPlanSubItem,
  SharedPlanYear,
} from '@/app/career/components/community/types';
import type { CareerItemLink } from '@/data/career-item-structure';

function mapSharedSubItemToSubItem(s: SharedPlanSubItem): SubItem {
  return {
    id: s.id,
    title: s.title,
    done: s.done,
    url: s.url,
    description: s.description,
  };
}

function mapSharedItemToPlanItem(item: SharedPlanItem): PlanItem {
  const m = item.month;
  const months = typeof m === 'number' && m >= 1 && m <= 12 ? [m] : [1];
  const subItems = (item.subItems ?? []).map((s) => mapSharedSubItemToSubItem(s));
  const links: CareerItemLink[] | undefined = item.links?.map((l) => ({
    title: l.title,
    url: l.url,
    kind: l.kind as CareerItemLink['kind'],
  }));
  return {
    id: item.id,
    type: item.type,
    title: item.title,
    months,
    difficulty: item.difficulty ?? 2,
    cost: item.cost ?? '',
    organizer: item.organizer ?? '',
    url: item.url,
    description: item.description,
    categoryTags: item.categoryTags,
    activitySubtype: item.activitySubtype,
    subItems: subItems.length ? subItems : undefined,
    links: links?.length ? links : undefined,
  };
}

function mapSharedGoalGroupToGoalActivityGroup(
  gradeId: string,
  index: number,
  group: SharedPlanGoalGroup,
): GoalActivityGroup {
  return {
    id: `gg-${gradeId}-${index}`,
    goal: group.goal,
    items: group.items.map(mapSharedItemToPlanItem),
  };
}

function mapSharedYearToYearPlan(y: SharedPlanYear): YearPlan {
  const goalGroups: GoalActivityGroup[] | undefined = y.goalGroups?.length
    ? y.goalGroups.map((g, idx) => mapSharedGoalGroupToGoalActivityGroup(y.gradeId, idx, g))
    : undefined;
  const rootItems = y.items.map(mapSharedItemToPlanItem);
  const goalsFromGroups = goalGroups?.map((g) => g.goal) ?? [];
  const goals = goalsFromGroups.length > 0 ? goalsFromGroups : y.goals;

  return {
    gradeId: y.gradeId,
    gradeLabel: y.gradeLabel,
    semester: 'both',
    goals,
    items: rootItems,
    goalGroups,
  };
}

/** 공유 패스 상세 데이터를 내 패스와 동일한 타임라인 컴포넌트에 넣기 위한 CareerPlan으로 변환 */
export function mapSharedPlanToCareerPlanForMyPathStyleView(shared: SharedPlan): CareerPlan {
  return {
    id: shared.planId || shared.id,
    starId: '',
    starName: shared.starName,
    starEmoji: shared.starEmoji,
    starColor: shared.starColor,
    jobId: '',
    jobName: shared.jobName,
    jobEmoji: shared.jobEmoji,
    title: shared.title,
    description: shared.description,
    createdAt: shared.sharedAt,
    isPublic: shared.shareType === 'public',
    shareType: shared.shareType,
    years: shared.years.map(mapSharedYearToYearPlan),
  };
}
