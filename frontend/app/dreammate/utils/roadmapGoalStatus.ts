/**
 * 주차 목표 Jira식 상태(할 일 / 진행 중 / 완료 / 막힘) 공통 설정·헬퍼.
 * 편집기·상세 배지·상태 전이 코멘트가 같은 정의를 공유한다.
 */

import type { RoadmapGoalComment, RoadmapGoalStatus, RoadmapTodoItem } from '../types';

export interface RoadmapGoalStatusMeta {
  key: RoadmapGoalStatus;
  label: string;
  emoji: string;
  color: string;
}

/** 상태 순서 = 워크플로 진행 순서 (할 일 → 진행 중 → 완료, 막힘은 별도) */
export const ROADMAP_GOAL_STATUSES: readonly RoadmapGoalStatusMeta[] = [
  { key: 'todo', label: '할 일', emoji: '⚪', color: '#94a3b8' },
  { key: 'inprogress', label: '진행 중', emoji: '🔵', color: '#3b82f6' },
  { key: 'done', label: '완료', emoji: '✅', color: '#22c55e' },
  { key: 'blocked', label: '막힘', emoji: '🔴', color: '#ef4444' },
] as const;

const STATUS_META_BY_KEY: Record<RoadmapGoalStatus, RoadmapGoalStatusMeta> = Object.fromEntries(
  ROADMAP_GOAL_STATUSES.map(meta => [meta.key, meta]),
) as Record<RoadmapGoalStatus, RoadmapGoalStatusMeta>;

export const DEFAULT_ROADMAP_GOAL_STATUS: RoadmapGoalStatus = 'todo';

/** goalStatus 미지정 시 'todo'로 보정해 메타를 반환 */
export function getRoadmapGoalStatusMeta(status: RoadmapGoalStatus | undefined): RoadmapGoalStatusMeta {
  return STATUS_META_BY_KEY[status ?? DEFAULT_ROADMAP_GOAL_STATUS] ?? STATUS_META_BY_KEY.todo;
}

/** 목표 subItem의 현재 상태 (없으면 'todo') */
export function getGoalStatus(goal: RoadmapTodoItem | undefined): RoadmapGoalStatus {
  return goal?.goalStatus ?? DEFAULT_ROADMAP_GOAL_STATUS;
}

/**
 * 상태 전이를 코멘트 스레드 맨 앞에 자동 기록한다 (Jira 히스토리처럼).
 * 같은 상태로의 변경이면 null을 반환해 기록을 건너뛴다.
 */
export function buildStatusChangeComment(
  fromStatus: RoadmapGoalStatus,
  toStatus: RoadmapGoalStatus,
  nowIso: string,
): RoadmapGoalComment | null {
  if (fromStatus === toStatus) return null;
  const fromMeta = getRoadmapGoalStatusMeta(fromStatus);
  const toMeta = getRoadmapGoalStatusMeta(toStatus);
  return {
    id: `goal-comment-${nowIso}-${toStatus}`,
    kind: 'status',
    body: `${fromMeta.label} → ${toMeta.label}`,
    createdAt: nowIso,
    statusFrom: fromStatus,
    statusTo: toStatus,
  };
}
