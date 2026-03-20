import type { RoadmapTodoItem } from '../types';

/** 주차 내 목표(goal)와 그에 매달린 하위(task) 묶음 */
export type RoadmapGoalBlock = {
  readonly goal: RoadmapTodoItem | null;
  readonly tasks: readonly RoadmapTodoItem[];
};

/**
 * 같은 주차 안에서 원본 순서를 유지한 채, 목표 → 하위 작업 블록으로 나눕니다.
 * - 하위가 없는 목표만 단독 체크 대상이 됩니다.
 * - 맨 앞에 목표 없이 작업만 있으면 goal: null 블록으로 묶입니다.
 */
export function groupWeekIntoGoalBlocks(orderedTodos: readonly RoadmapTodoItem[]): RoadmapGoalBlock[] {
  const blocks: RoadmapGoalBlock[] = [];
  let current: RoadmapGoalBlock | null = null;

  for (const todo of orderedTodos) {
    if (todo.entryType === 'goal') {
      if (current) {
        blocks.push(current);
      }
      current = { goal: todo, tasks: [] };
    } else {
      if (!current) {
        current = { goal: null, tasks: [] };
      }
      current = { goal: current.goal, tasks: [...current.tasks, todo] };
    }
  }

  if (current) {
    blocks.push(current);
  }

  return blocks;
}

export function getWeekProgressFromBlocks(blocks: readonly RoadmapGoalBlock[]): {
  done: number;
  total: number;
} {
  let done = 0;
  let total = 0;
  for (const block of blocks) {
    if (block.tasks.length > 0) {
      total += block.tasks.length;
      done += block.tasks.filter((t) => t.isDone).length;
    } else if (block.goal) {
      total += 1;
      if (block.goal.isDone) {
        done += 1;
      }
    }
  }
  return { done, total };
}
