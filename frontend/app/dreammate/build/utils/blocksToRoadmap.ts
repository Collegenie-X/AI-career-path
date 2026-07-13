import type { RoadmapEditorPayload } from '../../components/RoadmapEditorDialog';
import type { RoadmapItem, RoadmapTodoItem } from '../../types';
import { makeBuilderId, type BuilderState, type PhaseBlock } from '../types';

const WEEKS_PER_MONTH = 4;

/** 저장 주차 순서: order 오름차순 (동률이면 입력 순서 유지) */
export function orderedBlocks(blocks: PhaseBlock[]): PhaseBlock[] {
  return blocks
    .map((b, i) => ({ b, i }))
    .sort((x, y) => (x.b.order !== y.b.order ? x.b.order - y.b.order : x.i - y.i))
    .map((x) => x.b);
}

/** 빌더 편집 상태 → 저장 페이로드 (= 기존 위저드/에디터와 동일 형태) */
export function builderToPayload(state: BuilderState, startMonth = 3): RoadmapEditorPayload {
  const ordered = orderedBlocks(state.blocks).filter((b) => b.goalTitle.trim() || b.tasks.length > 0);

  const subItems: RoadmapTodoItem[] = [];
  const months = new Set<number>();

  ordered.forEach((block, idx) => {
    const month = startMonth + Math.floor(idx / WEEKS_PER_MONTH);
    const weekNumber = (idx % WEEKS_PER_MONTH) + 1;
    const weekLabel = `${month}월 ${weekNumber}주차`;
    months.add(month);

    // goal — 편집 모드면 원본 실행 기록 보존
    subItems.push({
      ...(block.srcGoal ?? {}),
      id: block.srcGoal?.id ?? makeBuilderId('goal'),
      entryType: 'goal',
      weekLabel,
      weekNumber,
      title: block.goalTitle.trim() || '(제목 없음)',
      plannedOutput: block.plannedOutput?.trim() || undefined,
      isDone: block.srcGoal?.isDone ?? false,
    });

    block.tasks.forEach((task) => {
      if (!task.title.trim()) return;
      subItems.push({
        ...(task.src ?? {}),
        id: task.src?.id ?? makeBuilderId('task'),
        entryType: 'task',
        weekLabel,
        weekNumber,
        title: task.title.trim(),
        isDone: task.src?.isDone ?? false,
      });
    });
  });

  const uniqueMonths = [...months].sort((a, b) => a - b);

  const item: RoadmapItem = {
    id: makeBuilderId('item'),
    type: state.focusItemType,
    title: state.title.trim() || '새 프로젝트',
    months: uniqueMonths.length > 0 ? uniqueMonths : [startMonth],
    difficulty: 3,
    subItems,
  };

  return {
    title: state.title.trim() || '새 프로젝트',
    description: state.description.trim(),
    period: state.period,
    starColor: state.starColor,
    focusItemTypes: [state.focusItemType],
    milestoneResults: [],
    finalResultTitle: '',
    finalResultDescription: '',
    finalResultUrl: '',
    finalResultImageUrl: '',
    groupIds: [],
    items: subItems.length > 0 ? [item] : [],
  };
}
