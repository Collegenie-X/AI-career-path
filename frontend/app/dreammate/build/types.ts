import type { DreamItemType, PeriodType, RoadmapTodoItem } from '../types';

/** phase 키는 트랙마다 다르므로 문자열. 메타/순서는 tracks.ts의 TrackDef.phases에서 가져온다 */
export type PhaseKey = string;

export interface BlockTask {
  id: string;
  title: string;
  /** 편집 모드 보존용 — 원본 task subItem (실행 기록 유지) */
  src?: RoadmapTodoItem;
}

/** 한 단계 안의 블록 한 개 (= 한 주차 목표). 저장하지 않는 UI 전용 편집 상태 */
export interface PhaseBlock {
  id: string;
  phase: PhaseKey;
  /** 저장 시 주차 순서 (작을수록 먼저). 화면은 단계별로 묶어 보여준다 */
  order: number;
  goalTitle: string;
  tasks: BlockTask[];
  plannedOutput?: string;
  /** 편집 모드 보존용 — 원본 goal subItem (note·회고·코멘트·상태 유지) */
  srcGoal?: RoadmapTodoItem;
}

/** 빌더 전체 편집 상태 */
export interface BuilderState {
  title: string;
  description: string;
  period: PeriodType;
  starColor: string;
  focusItemType: DreamItemType;
  blocks: PhaseBlock[];
}

export function makeBuilderId(prefix = 'blk'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
