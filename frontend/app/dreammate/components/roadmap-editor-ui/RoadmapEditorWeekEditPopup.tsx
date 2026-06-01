'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Trash2, X } from 'lucide-react';
import type { RoadmapGoalStatus, RoadmapTodoItem } from '../../types';
import type { WeekGroupViewModel } from './roadmapEditorWbsTypes';
import {
  RoadmapEditorWeekGoalEditPanel,
  type RoadmapEditorWeekGoalEditPanelLabels,
} from './RoadmapEditorWeekGoalEditPanel';
import { getGoalStatus, getRoadmapGoalStatusMeta } from '../../utils/roadmapGoalStatus';

interface RoadmapEditorWeekEditPopupProps {
  group: WeekGroupViewModel;
  labels: RoadmapEditorWeekGoalEditPanelLabels;
  deleteWeekGroupButton: string;
  weekGoalPlaceholderTemplate: string;
  weekTaskPlaceholderTemplate: string;
  onClose: () => void;
  onUpsertWeekGoal: (groupKey: string, title: string) => void;
  onSetGoalStatus: (groupKey: string, nextStatus: RoadmapGoalStatus) => void;
  onUpdateSubItem: (subItemId: string, patch: Partial<RoadmapTodoItem>) => void;
  onRemoveSubItem: (subItemId: string) => void;
  onAddWeekTask: (groupKey: string) => void;
  onRemoveWeekGroup: (groupKey: string) => void;
  autocompleteListId: string;
  autocompleteSuggestions: readonly string[];
}

/** 주차 목표를 한 주차씩 집중 편집하는 바텀시트 팝업 (전체펼침 개요에서 주차를 클릭하면 열림). */
export function RoadmapEditorWeekEditPopup({
  group,
  labels,
  deleteWeekGroupButton,
  weekGoalPlaceholderTemplate,
  weekTaskPlaceholderTemplate,
  onClose,
  onUpsertWeekGoal,
  onSetGoalStatus,
  onUpdateSubItem,
  onRemoveSubItem,
  onAddWeekTask,
  onRemoveWeekGroup,
  autocompleteListId,
  autocompleteSuggestions,
}: RoadmapEditorWeekEditPopupProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  if (!mounted) return null;

  const statusMeta = getRoadmapGoalStatusMeta(getGoalStatus(group.goal));
  const hasContent = Boolean(group.goal) || group.tasks.length > 0;

  return createPortal(
    <div
      className="fixed inset-0 z-[10070] flex flex-col justify-end"
      style={{ backgroundColor: 'rgba(0,0,0,0.72)' }}
      onClick={onClose}
    >
      <div
        className="mx-auto flex max-h-[calc(100vh-72px)] w-full max-w-[680px] flex-col overflow-hidden rounded-t-3xl"
        style={{ backgroundColor: '#15152e', border: '1px solid rgba(255,255,255,0.08)', borderBottom: 'none' }}
        onClick={event => event.stopPropagation()}
      >
        <div
          className="flex items-center justify-between gap-2 px-4 py-3"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex min-w-0 items-center gap-2">
            <span className="text-sm font-black text-white">{group.sequentialWeek}주차</span>
            <span className="text-[11px] text-gray-400">
              {group.month}월 {group.week}주차
            </span>
            <span
              className="rounded-full px-2 py-0.5 text-[11px] font-bold"
              style={{ backgroundColor: `${statusMeta.color}22`, color: statusMeta.color }}
            >
              {statusMeta.emoji} {statusMeta.label}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {hasContent && (
              <button
                type="button"
                onClick={() => {
                  onRemoveWeekGroup(group.groupKey);
                  onClose();
                }}
                className="flex items-center gap-1 rounded-lg bg-red-500/15 px-2.5 py-1.5 text-[13px] font-bold text-red-200 transition-colors hover:bg-red-500/25"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {deleteWeekGroupButton}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
              aria-label="닫기"
            >
              <X className="h-4 w-4 text-gray-300" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))' }}>
          <RoadmapEditorWeekGoalEditPanel
            group={group}
            labels={labels}
            weekGoalPlaceholderTemplate={weekGoalPlaceholderTemplate}
            weekTaskPlaceholderTemplate={weekTaskPlaceholderTemplate}
            onUpsertWeekGoal={onUpsertWeekGoal}
            onSetGoalStatus={onSetGoalStatus}
            onUpdateSubItem={onUpdateSubItem}
            onRemoveSubItem={onRemoveSubItem}
            onAddWeekTask={onAddWeekTask}
            autocompleteListId={autocompleteListId}
            autocompleteSuggestions={autocompleteSuggestions}
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
