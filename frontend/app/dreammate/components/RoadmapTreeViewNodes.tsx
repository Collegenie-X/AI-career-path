'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { RoadmapItem } from '../types';
import { getEffectiveTodoCounts } from '../utils/roadmapTodoCounts';
import { getWeekProgressFromBlocks, groupWeekIntoGoalBlocks } from '../utils/roadmapTreeGoalBlocks';
import { formatRoadmapItemMonthLabel, groupSubItemsByWeek, type RoadmapWeekGroup } from '../utils/roadmapTreeWeekGrouping';
import { RoadmapTodoHeaderInlineProgressBar } from './RoadmapTodoProgressBars';
import type { RoadmapTreeTodoRowVisualMode } from '../config/roadmap-timeline-display.config';
import type { PlanFolderVariant } from './roadmap-timeline/RoadmapTimelineSectionChrome';
import {
  RoadmapTimelinePlanItemFolderFrame,
  RoadmapTimelineWeekSectionFrame,
  RoadmapTimelineWeekTreeNode,
  RoadmapTimelineWeekTreeStack,
} from './roadmap-timeline/RoadmapTimelineSectionChrome';
import { WeekGoalBlock } from './RoadmapTreeViewTodoRows';

function TreeWeekNode({
  weekGroup,
  item,
  showProgressBars,
  todoRowVisualMode,
  onToggleTodoItem,
  accentColor,
}: {
  weekGroup: RoadmapWeekGroup;
  item: RoadmapItem;
  showProgressBars?: boolean;
  todoRowVisualMode: RoadmapTreeTodoRowVisualMode;
  onToggleTodoItem?: (itemId: string, todoId: string) => void;
  accentColor: string;
}) {
  const [open, setOpen] = useState(true);

  const goalBlocks = useMemo(() => groupWeekIntoGoalBlocks(weekGroup.todoItems), [weekGroup.todoItems]);
  const { done: weekDone, total: weekTotal } = useMemo(
    () => getWeekProgressFromBlocks(goalBlocks),
    [goalBlocks],
  );

  return (
    <RoadmapTimelineWeekSectionFrame accentColor={accentColor} weekLabel={weekGroup.weekLabel}>
      <div className="relative">
        <div
          className="cursor-pointer rounded-md px-1.5 py-1 transition-colors hover:bg-white/5"
          onClick={() => setOpen(prev => !prev)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setOpen(prev => !prev);
            }
          }}
        >
          <div className="flex items-center gap-2">
            <span className="flex w-4 flex-shrink-0 items-center justify-center text-gray-500">
              {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            </span>
            <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
              <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="text-sm font-semibold text-gray-300">{weekGroup.weekLabel}</span>
                <span className="text-[13px] text-gray-600">({weekTotal}개)</span>
              </div>
              {showProgressBars && weekTotal > 0 && (
                <RoadmapTodoHeaderInlineProgressBar
                  doneCount={weekDone}
                  totalCount={weekTotal}
                  accentColor={accentColor}
                />
              )}
            </div>
          </div>
        </div>
        {open && (
          <div
            className="mt-2 space-y-2 border-l-2 pl-3 ml-0.5"
            style={{ borderColor: `${accentColor}28` }}
          >
            {goalBlocks.map((block, blockIdx) => (
              <WeekGoalBlock
                key={`${weekGroup.weekKey}-b${blockIdx}-${block.goal?.id ?? 'g0'}`}
                block={block}
                blockIndex={blockIdx}
                itemId={item.id}
                accentColor={accentColor}
                weekLabel={weekGroup.weekLabel}
                todoRowVisualMode={todoRowVisualMode}
                onToggleTodoItem={onToggleTodoItem}
              />
            ))}
          </div>
        )}
      </div>
    </RoadmapTimelineWeekSectionFrame>
  );
}

export function TreeItemNode({
  item,
  accentColor,
  typeLabel,
  typeEmoji,
  showProgressBars,
  todoRowVisualMode,
  onToggleTodoItem,
  onSelectItem,
  planFolderVariant = 'box',
}: {
  item: RoadmapItem;
  accentColor: string;
  typeLabel: string;
  typeEmoji: string;
  showProgressBars?: boolean;
  todoRowVisualMode: RoadmapTreeTodoRowVisualMode;
  onToggleTodoItem?: (itemId: string, todoId: string) => void;
  onSelectItem: (item: RoadmapItem) => void;
  planFolderVariant?: PlanFolderVariant;
}) {
  const [open, setOpen] = useState(true);
  const weekGroups = useMemo(() => groupSubItemsByWeek(item.subItems ?? []), [item.subItems]);
  const { total, done } = getEffectiveTodoCounts(item);

  return (
    <RoadmapTimelinePlanItemFolderFrame accentColor={accentColor} variant={planFolderVariant}>
      <div
        className="cursor-pointer px-3 py-2.5 transition-colors hover:bg-white/5"
        style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
        onClick={() => setOpen(prev => !prev)}
      >
        <div className="flex items-start gap-2">
          <span className="flex w-5 flex-shrink-0 items-center justify-center pt-0.5 text-gray-400">
            {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </span>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
              <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-base leading-none" aria-hidden>
                  {typeEmoji}
                </span>
                <span
                  className="text-[13px] font-bold px-2 py-0.5 rounded"
                  style={{ backgroundColor: `${accentColor}22`, color: accentColor }}
                >
                  {typeLabel}
                </span>
                <span className="text-[13px] text-gray-500">{formatRoadmapItemMonthLabel(item)}</span>
              </div>
              {showProgressBars && total > 0 && (
                <div className="shrink-0 pt-0.5">
                  <RoadmapTodoHeaderInlineProgressBar
                    doneCount={done}
                    totalCount={total}
                    accentColor={accentColor}
                  />
                </div>
              )}
            </div>
            <p className="text-sm font-bold leading-snug text-white break-words">{item.title}</p>
          </div>
        </div>
      </div>
      {open && (
        <div className="px-3 pb-3 pt-1">
          <div
            role="button"
            tabIndex={0}
            className="mb-2 cursor-pointer rounded px-2 py-1.5 hover:bg-white/5 transition-colors"
            onClick={e => {
              e.stopPropagation();
              onSelectItem(item);
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectItem(item);
              }
            }}
          >
            {(item.targetOutput || item.successCriteria) && (
              <div className="flex flex-wrap gap-2">
                {item.targetOutput && (
                  <span
                    className="text-[13px] px-1.5 py-0.5 rounded break-words"
                    style={{ backgroundColor: 'rgba(6,182,212,0.15)', color: '#67e8f9' }}
                  >
                    산출: {item.targetOutput}
                  </span>
                )}
                {item.successCriteria && (
                  <span
                    className="text-[13px] px-1.5 py-0.5 rounded break-words"
                    style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: '#6ee7b7' }}
                  >
                    기준: {item.successCriteria}
                  </span>
                )}
              </div>
            )}
          </div>
          {weekGroups.length === 0 ? (
            <p className="text-sm text-gray-600 py-2">등록된 할 일이 없어요.</p>
          ) : (
            <RoadmapTimelineWeekTreeStack accentColor={accentColor}>
              {weekGroups.map(wg => (
                <RoadmapTimelineWeekTreeNode key={wg.weekKey} accentColor={accentColor}>
                  <TreeWeekNode
                    weekGroup={wg}
                    item={item}
                    showProgressBars={showProgressBars}
                    todoRowVisualMode={todoRowVisualMode}
                    onToggleTodoItem={onToggleTodoItem}
                    accentColor={accentColor}
                  />
                </RoadmapTimelineWeekTreeNode>
              ))}
            </RoadmapTimelineWeekTreeStack>
          )}
        </div>
      )}
    </RoadmapTimelinePlanItemFolderFrame>
  );
}
