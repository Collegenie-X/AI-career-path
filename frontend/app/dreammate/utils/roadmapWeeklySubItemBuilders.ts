/**
 * 로드맵 주간 WBS용 RoadmapTodoItem 생성·정규화 (에디터·AI 매핑 공통).
 */

import type { RoadmapTodoItem } from '../types';

export function buildMonthWeekLabel(month: number, week: number): string {
  return `${month}월 ${week}주차`;
}

export function extractWeekNumber(todoItem: RoadmapTodoItem): number {
  if (typeof todoItem.weekNumber === 'number' && todoItem.weekNumber > 0) {
    return todoItem.weekNumber;
  }
  const matchedMonthWeek = (todoItem.weekLabel ?? '').match(/(\d+)\s*월\s*(\d+)\s*주차/);
  if (matchedMonthWeek) {
    const weekFromMonthWeek = Number(matchedMonthWeek[2]);
    if (Number.isFinite(weekFromMonthWeek) && weekFromMonthWeek > 0) return weekFromMonthWeek;
  }
  const numberMatches = (todoItem.weekLabel ?? '').match(/\d+/g);
  const lastNumber = numberMatches ? Number(numberMatches[numberMatches.length - 1]) : NaN;
  return Number.isFinite(lastNumber) && lastNumber > 0 ? lastNumber : 1;
}

export function extractMonthWeek(
  todoItem: RoadmapTodoItem,
  fallbackMonth: number,
): { month: number; week: number } {
  const matched = (todoItem.weekLabel ?? '').match(/(\d+)\s*월\s*(\d+)\s*주차/);
  if (matched) {
    const month = Number(matched[1]);
    const week = Number(matched[2]);
    if (month >= 1 && month <= 12 && week >= 1 && week <= 5) {
      return { month, week };
    }
  }

  return {
    month: fallbackMonth,
    week: Math.min(Math.max(extractWeekNumber(todoItem), 1), 5),
  };
}

export function isGoalTodoEntry(todoItem: RoadmapTodoItem): boolean {
  return todoItem.entryType === 'goal';
}

export function createWeeklyTaskSubItem(month: number, week: number): RoadmapTodoItem {
  return {
    id: `draft-sub-item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    weekNumber: week,
    weekLabel: buildMonthWeekLabel(month, week),
    entryType: 'task',
    title: `${month}월 ${week}주차 항목`,
    isDone: false,
  };
}

export function createWeeklyGoalSubItem(month: number, week: number, title = ''): RoadmapTodoItem {
  return {
    id: `draft-sub-item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    weekNumber: week,
    weekLabel: buildMonthWeekLabel(month, week),
    entryType: 'goal',
    title,
    isDone: false,
  };
}

export function normalizeSubItemsToAvailableMonths(
  subItems: RoadmapTodoItem[],
  availableMonths: number[],
): RoadmapTodoItem[] {
  const normalizedMonths = availableMonths.length > 0 ? availableMonths : [3];
  const fallbackMonth = normalizedMonths[0];
  return subItems.map(subItem => {
    const parsed = extractMonthWeek(subItem, fallbackMonth);
    const targetMonth = normalizedMonths.includes(parsed.month) ? parsed.month : fallbackMonth;
    const entryType = subItem.entryType ?? 'task';
    const trimmedTitleLength = subItem.title?.trim().length ?? 0;
    const titleForEmpty =
      entryType === 'goal'
        ? ''
        : `${targetMonth}월 ${parsed.week}주차 활동`;
    return {
      ...subItem,
      weekNumber: parsed.week,
      weekLabel: buildMonthWeekLabel(targetMonth, parsed.week),
      entryType,
      title: trimmedTitleLength > 0 ? subItem.title! : titleForEmpty,
    };
  });
}
