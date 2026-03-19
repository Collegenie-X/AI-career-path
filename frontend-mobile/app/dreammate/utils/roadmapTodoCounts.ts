import type { RoadmapItem } from '../types';

/**
 * 항목이 있으면 항목 기준, 항목이 없으면 목표 기준으로 진행 카운트 반환.
 * 프로그레스바, 실행 요약 등에 동일하게 적용.
 */
export function getEffectiveTodoCounts(item: RoadmapItem): { total: number; done: number } {
  const actionableTodoItems = (item.subItems ?? []).filter(todoItem => todoItem.entryType !== 'goal');
  const goalTodoItems = (item.subItems ?? []).filter(todoItem => todoItem.entryType === 'goal');

  if (actionableTodoItems.length > 0) {
    return {
      total: actionableTodoItems.length,
      done: actionableTodoItems.filter(t => t.isDone).length,
    };
  }
  if (goalTodoItems.length > 0) {
    return {
      total: goalTodoItems.length,
      done: goalTodoItems.filter(t => t.isDone).length,
    };
  }
  return { total: 0, done: 0 };
}

/** 로드맵 전체의 유효 진행 카운트 (항목 우선, 항목 없으면 목표) */
export function getRoadmapEffectiveTodoCounts(items: RoadmapItem[]): { total: number; done: number } {
  return items.reduce(
    (acc, item) => {
      const { total, done } = getEffectiveTodoCounts(item);
      return { total: acc.total + total, done: acc.done + done };
    },
    { total: 0, done: 0 },
  );
}
