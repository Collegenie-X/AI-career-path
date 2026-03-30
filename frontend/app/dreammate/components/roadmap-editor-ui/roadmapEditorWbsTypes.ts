import type { RoadmapTodoItem } from '../../types';

/** 주차별로 묶인 뷰 모델 (로드맵 편집기 WBS 트리에서 공통 사용). */
export interface WeekGroupViewModel {
  groupKey: string;
  month: number;
  week: number;
  goal?: RoadmapTodoItem;
  tasks: RoadmapTodoItem[];
}

export function groupSortedWeekGroupsByMonth(
  sortedWeekGroups: WeekGroupViewModel[],
): [number, Array<{ groupKey: string; group: WeekGroupViewModel }>][] {
  const monthGroups = new Map<number, Array<{ groupKey: string; group: WeekGroupViewModel }>>();
  sortedWeekGroups.forEach(group => {
    const monthGroupItems = monthGroups.get(group.month) ?? [];
    monthGroupItems.push({ groupKey: group.groupKey, group });
    monthGroups.set(group.month, monthGroupItems);
  });
  return [...monthGroups.entries()].sort(([leftMonth], [rightMonth]) => leftMonth - rightMonth);
}
