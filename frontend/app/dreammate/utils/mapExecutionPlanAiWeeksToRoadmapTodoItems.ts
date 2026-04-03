/**
 * 실행계획 AI 응답 weeks[] → RoadmapTodoItem[] (주 목표 + 하위 task).
 */

import type { RoadmapTodoItem } from '../types';
import {
  buildMonthWeekLabel,
  createWeeklyGoalSubItem,
  createWeeklyTaskSubItem,
  normalizeSubItemsToAvailableMonths,
} from './roadmapWeeklySubItemBuilders';

export interface ExecutionPlanAiWeekPayload {
  month: number;
  weekIndexInMonth: number;
  goal: string;
  deliverable?: string;
  researchNoteOutline?: {
    whatToDo?: string;
    howToVerify?: string;
    reflectionPrompts?: string[];
  };
  subTasks?: string[];
}

function buildNoteFromResearchOutline(outline: ExecutionPlanAiWeekPayload['researchNoteOutline']): string | undefined {
  if (!outline) return undefined;
  const parts: string[] = [];
  if (outline.whatToDo?.trim()) parts.push(`[할 일]\n${outline.whatToDo.trim()}`);
  if (outline.howToVerify?.trim()) parts.push(`[확인 방법]\n${outline.howToVerify.trim()}`);
  if (outline.reflectionPrompts?.length) {
    parts.push(`[회고 질문]\n${outline.reflectionPrompts.filter(Boolean).join('\n')}`);
  }
  const text = parts.join('\n\n');
  return text.length > 0 ? text : undefined;
}

/**
 * AI 주차 배열을 한 활동(RoadmapItem)의 subItems로 변환합니다.
 * goal 1개 + task N개를 같은 month/week에 묶습니다.
 */
export function mapExecutionPlanAiWeeksToRoadmapTodoItems(
  weeks: ExecutionPlanAiWeekPayload[],
  selectedMonths: number[],
): RoadmapTodoItem[] {
  const months = selectedMonths.length > 0 ? [...selectedMonths].sort((a, b) => a - b) : [3];
  const fallbackMonth = months[0] ?? 3;

  const sorted = [...weeks].sort((a, b) => {
    if (a.month !== b.month) return a.month - b.month;
    return a.weekIndexInMonth - b.weekIndexInMonth;
  });

  const todos: RoadmapTodoItem[] = [];

  sorted.forEach(week => {
    const month = months.includes(week.month) ? week.month : fallbackMonth;
    const wn = week.weekIndexInMonth >= 1 && week.weekIndexInMonth <= 5 ? week.weekIndexInMonth : 1;
    const goalTitle = week.goal.trim() || `${month}월 ${wn}주차 목표`;
    const goal = createWeeklyGoalSubItem(month, wn, goalTitle);
    goal.weekLabel = buildMonthWeekLabel(month, wn);
    const deliverable = week.deliverable?.trim();
    if (deliverable) {
      goal.outputRef = deliverable;
    }
    const note = buildNoteFromResearchOutline(week.researchNoteOutline);
    if (note) {
      goal.note = note;
    }
    todos.push(goal);

    const subTasks = week.subTasks ?? [];
    subTasks.forEach(text => {
      const t = text.trim();
      if (!t) return;
      const task = createWeeklyTaskSubItem(month, wn);
      task.title = t;
      task.weekLabel = buildMonthWeekLabel(month, wn);
      todos.push(task);
    });
  });

  return normalizeSubItemsToAvailableMonths(todos, months);
}
