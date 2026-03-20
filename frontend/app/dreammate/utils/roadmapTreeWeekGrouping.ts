import type { RoadmapItem, RoadmapTodoItem } from '../types';

export type RoadmapWeekGroup = { weekKey: string; weekLabel: string; todoItems: RoadmapTodoItem[] };

export function getWeekLabelFromTodo(weekNumber?: number, weekLabel?: string): string {
  if (weekLabel?.trim()) return weekLabel;
  if (typeof weekNumber === 'number' && weekNumber > 0) return `${weekNumber}주차`;
  return '1주차';
}

export function parseTodoMonthWeek(todoItem: { weekNumber?: number; weekLabel?: string }): { month: number; week: number } {
  const matched = (todoItem.weekLabel ?? '').match(/(\d+)\s*월\s*(\d+)\s*주차/);
  if (matched) {
    const month = Number(matched[1]);
    const week = Number(matched[2]);
    if (Number.isInteger(month) && Number.isInteger(week)) return { month, week };
  }
  if (typeof todoItem.weekNumber === 'number' && todoItem.weekNumber > 0) {
    return { month: 99, week: todoItem.weekNumber };
  }
  return { month: 99, week: 1 };
}

export function formatRoadmapItemMonthLabel(item: RoadmapItem): string {
  const sortedMonths = (item.months ?? []).filter(m => m >= 1 && m <= 12).sort((a, b) => a - b);
  if (sortedMonths.length === 0) return '시기 미정';
  if (sortedMonths.length === 1) return `${sortedMonths[0]}월`;
  return `${sortedMonths[0]}월~${sortedMonths[sortedMonths.length - 1]}월`;
}

/** 주·월만으로 정렬하고, 같은 주 안에서는 편집기 저장 순서(원본 인덱스)를 유지합니다. */
export function groupSubItemsByWeek(subItems: RoadmapTodoItem[]): RoadmapWeekGroup[] {
  const sorted = [...subItems]
    .map((todo, idx) => ({ todo, idx }))
    .sort((a, b) => {
      const am = parseTodoMonthWeek(a.todo);
      const bm = parseTodoMonthWeek(b.todo);
      if (am.month !== bm.month) return am.month - bm.month;
      if (am.week !== bm.week) return am.week - bm.week;
      return a.idx - b.idx;
    })
    .map(({ todo }) => todo);

  const bucket = new Map<string, RoadmapWeekGroup>();
  sorted.forEach(todo => {
    const weekLabel = getWeekLabelFromTodo(todo.weekNumber, todo.weekLabel);
    const weekKey = `${todo.weekNumber ?? 'na'}-${todo.weekLabel ?? weekLabel}`;
    const existing = bucket.get(weekKey);
    if (existing) {
      existing.todoItems.push(todo);
    } else {
      bucket.set(weekKey, { weekKey, weekLabel, todoItems: [todo] });
    }
  });
  return [...bucket.values()];
}
