'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronRight, Circle } from 'lucide-react';
import type { RoadmapItem, RoadmapTodoItem } from '../types';
import { getEffectiveTodoCounts } from '../utils/roadmapTodoCounts';
import { getWeekProgressFromBlocks, groupWeekIntoGoalBlocks, type RoadmapGoalBlock } from '../utils/roadmapTreeGoalBlocks';
import { formatRoadmapItemMonthLabel, groupSubItemsByWeek, type RoadmapWeekGroup } from '../utils/roadmapTreeWeekGrouping';
import { RoadmapTodoHeaderInlineProgressBar } from './RoadmapTodoProgressBars';

function TreeGoalOrTaskRow({
  todoItem,
  itemId,
  mode,
  showTodoCheckboxes,
  onToggleTodoItem,
}: {
  todoItem: RoadmapTodoItem;
  itemId: string;
  mode: 'goal-checkable' | 'goal-heading' | 'task';
  showTodoCheckboxes?: boolean;
  onToggleTodoItem?: (itemId: string, todoId: string) => void;
}) {
  const showCheckbox =
    showTodoCheckboxes &&
    onToggleTodoItem &&
    (mode === 'goal-checkable' || mode === 'task');

  const Wrapper = showCheckbox ? 'button' : 'div';

  const titleClass = `text-sm break-words ${todoItem.isDone ? 'text-gray-500 line-through' : 'text-gray-300'}`;

  return (
    <Wrapper
      {...(Wrapper === 'button'
        ? {
            type: 'button' as const,
            onClick: (e: React.MouseEvent) => {
              e.stopPropagation();
              onToggleTodoItem?.(itemId, todoItem.id);
            },
            className:
              'w-full flex items-start gap-2 text-left py-1 px-2 rounded transition-colors hover:bg-white/5',
          }
        : { className: 'flex items-start gap-2 py-1 px-2' })}
    >
      {mode === 'goal-heading' ? (
        <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-violet-400" aria-hidden />
      ) : showCheckbox ? (
        todoItem.isDone ? (
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-400" />
        ) : (
          <Circle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-gray-500" />
        )
      ) : (
        <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-transparent" aria-hidden />
      )}

      {mode !== 'task' && (
        <span
          className="mt-0.5 flex-shrink-0 text-[13px] font-bold px-1.5 py-0.5 rounded"
          style={{ backgroundColor: 'rgba(139,92,246,0.25)', color: '#c4b5fd' }}
        >
          목표
        </span>
      )}

      <span className={titleClass}>{todoItem.title}</span>
    </Wrapper>
  );
}

function TreeWeekNode({
  weekGroup,
  item,
  showProgressBars,
  showTodoCheckboxes,
  onToggleTodoItem,
  accentColor,
}: {
  weekGroup: RoadmapWeekGroup;
  item: RoadmapItem;
  showProgressBars?: boolean;
  showTodoCheckboxes?: boolean;
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
    <div className="relative">
      <div
        className="cursor-pointer rounded px-2 py-1.5 transition-colors hover:bg-white/5"
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
          className="ml-4 space-y-1 border-l-2 border-white/10 pl-3"
          style={{ borderColor: `${accentColor}30` }}
        >
          {goalBlocks.map((block, blockIdx) => (
            <WeekGoalBlock
              key={`${weekGroup.weekKey}-b${blockIdx}-${block.goal?.id ?? 'g0'}`}
              block={block}
              itemId={item.id}
              showTodoCheckboxes={showTodoCheckboxes}
              onToggleTodoItem={onToggleTodoItem}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function WeekGoalBlock({
  block,
  itemId,
  showTodoCheckboxes,
  onToggleTodoItem,
}: {
  block: RoadmapGoalBlock;
  itemId: string;
  showTodoCheckboxes?: boolean;
  onToggleTodoItem?: (itemId: string, todoId: string) => void;
}) {
  const goalHasSubtasks = block.tasks.length > 0;
  const showGoalCheckbox = Boolean(block.goal && !goalHasSubtasks);

  return (
    <div className="space-y-0.5">
      {block.goal && (
        <TreeGoalOrTaskRow
          todoItem={block.goal}
          itemId={itemId}
          mode={showGoalCheckbox ? 'goal-checkable' : 'goal-heading'}
          showTodoCheckboxes={showTodoCheckboxes}
          onToggleTodoItem={onToggleTodoItem}
        />
      )}
      {block.tasks.map((task) => (
        <div key={task.id} className={block.goal ? 'pl-3 border-l border-white/10 ml-1' : undefined}>
          <TreeGoalOrTaskRow
            todoItem={task}
            itemId={itemId}
            mode="task"
            showTodoCheckboxes={showTodoCheckboxes}
            onToggleTodoItem={onToggleTodoItem}
          />
        </div>
      ))}
    </div>
  );
}

export function TreeItemNode({
  item,
  accentColor,
  typeLabel,
  typeEmoji,
  showProgressBars,
  showTodoCheckboxes,
  onToggleTodoItem,
  onSelectItem,
}: {
  item: RoadmapItem;
  accentColor: string;
  typeLabel: string;
  typeEmoji: string;
  showProgressBars?: boolean;
  showTodoCheckboxes?: boolean;
  onToggleTodoItem?: (itemId: string, todoId: string) => void;
  onSelectItem: (item: RoadmapItem) => void;
}) {
  const [open, setOpen] = useState(true);
  const weekGroups = useMemo(() => groupSubItemsByWeek(item.subItems ?? []), [item.subItems]);
  const { total, done } = getEffectiveTodoCounts(item);

  return (
    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
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
            <div className="space-y-0.5 border-l-2 pl-3" style={{ borderColor: `${accentColor}25` }}>
              {weekGroups.map(wg => (
                <TreeWeekNode
                  key={wg.weekKey}
                  weekGroup={wg}
                  item={item}
                  showProgressBars={showProgressBars}
                  showTodoCheckboxes={showTodoCheckboxes}
                  onToggleTodoItem={onToggleTodoItem}
                  accentColor={accentColor}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
