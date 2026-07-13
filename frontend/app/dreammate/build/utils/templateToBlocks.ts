import type { TrackDef } from '../tracks';
import { makeBuilderId, type PhaseBlock } from '../types';
import { inferPhase } from './phaseMap';

/** 위저드/갤러리에서 쓰는 템플릿 주차 형태 */
export interface WeeklyGoalLike {
  weekLabel?: string;
  title: string;
  tasks?: string[];
  output?: string;
}

export interface TemplateLike {
  id: string;
  title: string;
  emoji?: string;
  description?: string;
  weeklyGoals: WeeklyGoalLike[];
}

/** 템플릿 주차들 → phase 블록[] (원래 주차 순서를 order로 보존) */
export function templateToBlocks(track: TrackDef, template: TemplateLike): PhaseBlock[] {
  return template.weeklyGoals.map((wg, idx) => ({
    id: makeBuilderId(),
    phase: inferPhase(track, wg.title),
    order: idx,
    goalTitle: wg.title,
    tasks: (wg.tasks ?? []).map((t) => ({ id: makeBuilderId('task'), title: t })),
    plannedOutput: wg.output,
  }));
}

/** 빈 캔버스: 트랙의 4단계 빈 블록 한 세트 */
export function emptyBlocks(track: TrackDef): PhaseBlock[] {
  return track.phases.map((phase, idx) => ({
    id: makeBuilderId(),
    phase: phase.key,
    order: idx,
    goalTitle: '',
    tasks: [],
    plannedOutput: '',
  }));
}
