'use client';

import { useMemo, useState } from 'react';
import { DREAM_ITEM_TYPES, LABELS, PERIOD_FILTERS } from '../config';
import type { RoadmapItem, SharedRoadmap } from '../types';
import { getEffectiveTodoCounts } from '../utils/roadmapTodoCounts';
import { sortByEarliestMonth } from '@/lib/timelineTreeUtils';
import { PlanItemDetailSheet } from '@/app/career/components/PlanItemDetailSheet';
import { RoadmapTodoHeaderInlineProgressBar } from './RoadmapTodoProgressBars';
import { toPlanItemDetail } from './RoadmapCareerPathTimelineSection';
import { TreeItemNode } from './RoadmapTreeViewNodes';
import {
  getRoadmapTreeTodoRowVisualModeFromDetailMode,
  getShowTimelineProgressBarsFromDetailMode,
  type RoadmapTimelineDetailMode,
} from '../config/roadmap-timeline-display.config';

function getPeriodLabel(periodId: SharedRoadmap['period']): string {
  return PERIOD_FILTERS.find(period => period.id === periodId)?.label ?? periodId;
}

interface RoadmapTreeViewProps {
  roadmap: SharedRoadmap;
  /** 피드(뷰만) / 커뮤니티·내기록 패널(상태만) / 전용 페이지(체크) */
  timelineDetailMode: RoadmapTimelineDetailMode;
  onToggleTodoItem?: (itemId: string, todoId: string) => void;
  /** 상세 다이얼로그 세로 플로우 — 상단 WBS 소개 카드 생략, 트리만 */
  layoutVariant?: 'default' | 'detailFlow';
}

export function RoadmapTreeView({
  roadmap,
  timelineDetailMode,
  onToggleTodoItem,
  layoutVariant = 'default',
}: RoadmapTreeViewProps) {
  const showProgressBars = getShowTimelineProgressBarsFromDetailMode(timelineDetailMode);
  const todoRowVisualMode = getRoadmapTreeTodoRowVisualModeFromDetailMode(timelineDetailMode);
  const effectiveToggleTodoItem =
    timelineDetailMode === 'interactive' ? onToggleTodoItem : undefined;
  const [selectedItem, setSelectedItem] = useState<RoadmapItem | null>(null);
  const periodLabel = useMemo(() => getPeriodLabel(roadmap.period), [roadmap.period]);
  const sortedItems = useMemo(() => sortByEarliestMonth(roadmap.items), [roadmap.items]);
  const typeByValue = useMemo(
    () => Object.fromEntries(DREAM_ITEM_TYPES.map(t => [t.value, { label: t.label, emoji: t.emoji }])),
    [],
  );
  const weeklyTotal = useMemo(
    () => roadmap.items.reduce((s, i) => s + getEffectiveTodoCounts(i).total, 0),
    [roadmap.items],
  );
  const weeklyDone = useMemo(
    () => roadmap.items.reduce((s, i) => s + getEffectiveTodoCounts(i).done, 0),
    [roadmap.items],
  );

  if (sortedItems.length === 0) {
    return (
      <div className="py-10 text-center rounded-xl" style={{ border: '1px dashed rgba(255,255,255,0.1)' }}>
        <p className="text-sm text-gray-500">로드맵 항목이 아직 없어요.</p>
      </div>
    );
  }

  const sprintIntroBlock =
    layoutVariant === 'detailFlow' ? (
      <div className="mb-3 space-y-2 border-l-2 pl-3" style={{ borderColor: `${roadmap.starColor}44` }}>
        <p className="text-xs font-bold uppercase tracking-wide text-gray-500">{LABELS.timelineViewLabel}</p>
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400">
          <span className="font-semibold text-white">{LABELS.wbsSprintSectionTitle}</span>
          <span
            className="font-bold px-2 py-0.5 rounded-full text-xs"
            style={{ backgroundColor: `${roadmap.starColor}22`, color: roadmap.starColor }}
          >
            {periodLabel}
          </span>
        </div>
        <p className="text-xs text-gray-500 leading-snug">{LABELS.sprintGuideLabel}</p>
        {showProgressBars && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-gray-600">{LABELS.roadmapSprintSummaryLineLabel}</span>
            <RoadmapTodoHeaderInlineProgressBar
              doneCount={weeklyDone}
              totalCount={weeklyTotal}
              accentColor={roadmap.starColor}
            />
          </div>
        )}
      </div>
    ) : (
      <div
        className="rounded-xl px-3 py-2.5 mb-3"
        style={{ backgroundColor: `${roadmap.starColor}12`, border: `1px solid ${roadmap.starColor}22` }}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-bold text-white">{LABELS.wbsSprintSectionTitle}</span>
          <span
            className="text-sm font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${roadmap.starColor}22`, color: roadmap.starColor }}
          >
            {periodLabel}
          </span>
        </div>
        <p className="text-sm text-gray-400 mt-1">{LABELS.sprintGuideLabel}</p>
        {showProgressBars && (
          <div className="flex items-center justify-between gap-2 mt-1">
            <span className="text-sm text-gray-500">{LABELS.roadmapSprintSummaryLineLabel}</span>
            <RoadmapTodoHeaderInlineProgressBar
              doneCount={weeklyDone}
              totalCount={weeklyTotal}
              accentColor={roadmap.starColor}
            />
          </div>
        )}
      </div>
    );

  return (
    <div className="space-y-2">
      {sprintIntroBlock}

      <div className="space-y-2">
        {sortedItems.map(item => {
          const typeInfo = typeByValue[item.type] ?? { label: item.type, emoji: '📌' };
          return (
            <TreeItemNode
              key={item.id}
              item={item}
              accentColor={roadmap.starColor}
              typeLabel={typeInfo.label}
              typeEmoji={typeInfo.emoji}
              showProgressBars={showProgressBars}
              todoRowVisualMode={todoRowVisualMode}
              onToggleTodoItem={effectiveToggleTodoItem}
              onSelectItem={setSelectedItem}
              planFolderVariant={layoutVariant === 'detailFlow' ? 'spine' : 'box'}
            />
          );
        })}
      </div>

      {selectedItem && (
        <PlanItemDetailSheet
          item={toPlanItemDetail(selectedItem, { includeSubItems: true })}
          gradeLabel={periodLabel}
          color={roadmap.starColor}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
