'use client';

import { useMemo, useState } from 'react';
import { DREAM_ITEM_TYPES, LABELS, PERIOD_FILTERS } from '../config';
import type { RoadmapItem, SharedRoadmap } from '../types';
import { getEffectiveTodoCounts } from '../utils/roadmapTodoCounts';
import { sortByEarliestMonth } from '@/lib/timelineTreeUtils';
import { PlanItemDetailSheet } from '@/app/career/components/PlanItemDetailSheet';
import { RoadmapTodoProgressBarCard } from './RoadmapTodoProgressBars';
import { toPlanItemDetail } from './RoadmapCareerPathTimelineSection';
import { TreeItemNode } from './RoadmapTreeViewNodes';

function getPeriodLabel(periodId: SharedRoadmap['period']): string {
  return PERIOD_FILTERS.find(period => period.id === periodId)?.label ?? periodId;
}

interface RoadmapTreeViewProps {
  roadmap: SharedRoadmap;
  showProgressBars?: boolean;
  showTodoCheckboxes?: boolean;
  onToggleTodoItem?: (itemId: string, todoId: string) => void;
}

export function RoadmapTreeView({
  roadmap,
  showProgressBars = true,
  showTodoCheckboxes = true,
  onToggleTodoItem,
}: RoadmapTreeViewProps) {
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

  return (
    <div className="space-y-3">
      <div
        className="rounded-xl px-3 py-2.5"
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
        <p className="text-sm text-gray-500 mt-1">
          계획 {roadmap.items.length}개 · {LABELS.weeklyChecklistLabel} {weeklyDone}/{weeklyTotal}
        </p>
        {showProgressBars && weeklyTotal > 0 && (
          <div className="mt-2">
            <RoadmapTodoProgressBarCard
              title={LABELS.overallProgressLabel}
              doneCount={weeklyDone}
              totalCount={weeklyTotal}
              accentColor={roadmap.starColor}
            />
          </div>
        )}
      </div>

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
              showTodoCheckboxes={showTodoCheckboxes}
              onToggleTodoItem={onToggleTodoItem}
              onSelectItem={setSelectedItem}
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
