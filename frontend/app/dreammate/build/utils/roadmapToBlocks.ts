import type { RoadmapItem, RoadmapTodoItem, SharedRoadmap } from '../../types';
import type { TrackDef } from '../tracks';
import { makeBuilderId, type BuilderState, type PhaseBlock } from '../types';
import { inferPhase } from './phaseMap';

/** 기존 SharedRoadmap → 빌더 편집 상태 (편집 모드). 실행 기록은 src로 보존 */
export function roadmapToBuilderState(track: TrackDef, roadmap: SharedRoadmap): BuilderState {
  const allSubItems: RoadmapTodoItem[] = (roadmap.items ?? []).flatMap((it) => it.subItems ?? []);

  // goal 단위로 블록을 만들고, 다음 goal 전까지의 task를 묶는다
  type Draft = { goal: RoadmapTodoItem; tasks: RoadmapTodoItem[] };
  const drafts: Draft[] = [];
  for (const sub of allSubItems) {
    if (sub.entryType === 'task' && drafts.length > 0) {
      drafts[drafts.length - 1].tasks.push(sub);
    } else {
      drafts.push({ goal: sub, tasks: [] });
    }
  }

  const blocks: PhaseBlock[] = drafts.map((d, idx) => ({
    id: makeBuilderId(),
    phase: inferPhase(track, d.goal.title),
    order: idx,
    goalTitle: d.goal.title,
    plannedOutput: d.goal.plannedOutput,
    srcGoal: d.goal,
    tasks: d.tasks.map((t) => ({ id: makeBuilderId('task'), title: t.title, src: t })),
  }));

  return {
    title: roadmap.title,
    description: roadmap.description,
    period: roadmap.period,
    starColor: roadmap.starColor,
    focusItemType: track.focusItemType,
    blocks,
  };
}

export type { RoadmapItem };
