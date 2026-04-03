'use client';

import { CheckCircle2, Circle } from 'lucide-react';
import type { RoadmapTodoItem } from '../types';
import type { RoadmapGoalBlock } from '../utils/roadmapTreeGoalBlocks';
import type { RoadmapTreeTodoRowVisualMode } from '../config/roadmap-timeline-display.config';
import { RoadmapTimelineGoalBlockFrame } from './roadmap-timeline/RoadmapTimelineSectionChrome';

function TreeGoalOrTaskRow({
  todoItem,
  itemId,
  mode,
  todoRowVisualMode,
  onToggleTodoItem,
}: {
  todoItem: RoadmapTodoItem;
  itemId: string;
  mode: 'goal-checkable' | 'goal-heading' | 'task';
  todoRowVisualMode: RoadmapTreeTodoRowVisualMode;
  onToggleTodoItem?: (itemId: string, todoId: string) => void;
}) {
  const interactive =
    todoRowVisualMode === 'interactive' &&
    Boolean(onToggleTodoItem) &&
    (mode === 'goal-checkable' || mode === 'task');

  /** 내 기록·피드 뷰(status_readonly / feed_minimal): 원형 체크 UI 없이 점만 표시 (클릭 유도 방지) */
  const showInteractiveCheckShape =
    mode !== 'goal-heading' &&
    todoRowVisualMode === 'interactive' &&
    (mode === 'goal-checkable' || mode === 'task');

  const Wrapper = interactive ? 'button' : 'div';
  const titleClass = `text-sm break-words ${todoItem.isDone ? 'text-gray-500 line-through' : 'text-gray-300'}`;

  const leadingIcon = (() => {
    if (mode === 'goal-heading') {
      return <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-violet-400" aria-hidden />;
    }
    if (todoRowVisualMode === 'feed_minimal' || todoRowVisualMode === 'status_readonly') {
      return <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-gray-600" aria-hidden />;
    }
    if (showInteractiveCheckShape) {
      return todoItem.isDone ? (
        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-400" aria-hidden />
      ) : (
        <Circle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-gray-500" aria-hidden />
      );
    }
    return <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-transparent" aria-hidden />;
  })();

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
      {leadingIcon}

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

export function WeekGoalBlock({
  block,
  blockIndex,
  itemId,
  accentColor,
  weekLabel,
  todoRowVisualMode,
  onToggleTodoItem,
}: {
  block: RoadmapGoalBlock;
  blockIndex: number;
  itemId: string;
  accentColor: string;
  weekLabel: string;
  todoRowVisualMode: RoadmapTreeTodoRowVisualMode;
  onToggleTodoItem?: (itemId: string, todoId: string) => void;
}) {
  const goalHasSubtasks = block.tasks.length > 0;
  const showGoalCheckbox = Boolean(block.goal && !goalHasSubtasks);

  const blockLabel =
    block.goal?.title?.trim() ?? `${weekLabel} ${blockIndex + 1}번째 목표 블록`;

  return (
    <RoadmapTimelineGoalBlockFrame accentColor={accentColor} blockLabel={blockLabel}>
      <div className="space-y-0.5">
        {block.goal && (
          <TreeGoalOrTaskRow
            todoItem={block.goal}
            itemId={itemId}
            mode={showGoalCheckbox ? 'goal-checkable' : 'goal-heading'}
            todoRowVisualMode={todoRowVisualMode}
            onToggleTodoItem={onToggleTodoItem}
          />
        )}
        {block.tasks.map(task => (
          <div
            key={task.id}
            className={block.goal ? 'pl-3 ml-0.5' : undefined}
            style={block.goal ? { borderLeft: `1px solid ${accentColor}26` } : undefined}
          >
            <TreeGoalOrTaskRow
              todoItem={task}
              itemId={itemId}
              mode="task"
              todoRowVisualMode={todoRowVisualMode}
              onToggleTodoItem={onToggleTodoItem}
            />
          </div>
        ))}
      </div>
    </RoadmapTimelineGoalBlockFrame>
  );
}
