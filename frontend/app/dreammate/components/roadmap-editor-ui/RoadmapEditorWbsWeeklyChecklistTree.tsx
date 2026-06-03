'use client';

import { ChevronRight, MessageSquare } from 'lucide-react';
import type { RoadmapItem } from '../../types';
import type { WeekGroupViewModel } from './roadmapEditorWbsTypes';
import { roadmapEditorSoftInsetPanelClassName } from './roadmapEditorUiTokens';
import { getGoalStatus, getRoadmapGoalStatusMeta } from '../../utils/roadmapGoalStatus';

export interface RoadmapEditorWbsWeeklyChecklistLabels {
  sectionTitle: string;
  addWeekGroupButton: string;
  noWeekGroupHint: string;
  /** 목표 입력란 위 짧은 안내 (config에서 주입). */
  weekGoalEditHelpHint?: string;
  weekGoalValidationHint: string;
  /** 목표가 비어 있는 주차 행에 보일 안내 문구 */
  emptyGoalRowLabel: string;
}

interface RoadmapEditorWbsWeeklyChecklistTreeProps {
  item: RoadmapItem;
  sortedWeekGroups: WeekGroupViewModel[];
  labels: RoadmapEditorWbsWeeklyChecklistLabels;
  onAddWeekGroup: () => void;
  /** 주차 행 클릭 → 해당 주차 편집 팝업 열기 */
  onSelectWeek: (groupKey: string) => void;
  hasMissingGoalInItem: boolean;
}

const wbsToolbarButtonClassName =
  'text-sm font-bold px-2.5 py-1.5 rounded-lg bg-sky-500/18 text-sky-200 hover:bg-sky-500/28 transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/45';

export function RoadmapEditorWbsWeeklyChecklistTree({
  item,
  sortedWeekGroups,
  labels,
  onAddWeekGroup,
  onSelectWeek,
  hasMissingGoalInItem,
}: RoadmapEditorWbsWeeklyChecklistTreeProps) {
  return (
    <div className="space-y-1.5 pt-1">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-bold text-gray-400">{labels.sectionTitle}</span>
        <button type="button" onClick={onAddWeekGroup} className={wbsToolbarButtonClassName}>
          + {labels.addWeekGroupButton}
        </button>
      </div>

      {labels.weekGoalEditHelpHint ? (
        <p className="text-[11px] leading-snug text-gray-500">{labels.weekGoalEditHelpHint}</p>
      ) : null}

      {sortedWeekGroups.length === 0 ? (
        <p className="text-sm text-gray-600">{labels.noWeekGroupHint}</p>
      ) : (
        <div className="relative pt-1">
          <div
            className="pointer-events-none absolute left-[5px] top-1 bottom-2 w-[2px] rounded-full bg-gradient-to-b from-sky-400/30 via-violet-400/15 to-fuchsia-400/8"
            aria-hidden
          />
          <div className="space-y-2 pl-3">
            {sortedWeekGroups.map(group => {
              const { groupKey } = group;
              const hasGoalText = (group.goal?.title.trim().length ?? 0) > 0;
              const hasTaskText = group.tasks.some(task => task.title.trim().length > 0);
              const isMissingGoal = hasTaskText && !hasGoalText;
              const isPlaceholderOnly = !group.goal && group.tasks.length === 0;
              const statusMeta = getRoadmapGoalStatusMeta(getGoalStatus(group.goal));
              const taskCount = group.tasks.length;
              const commentCount =
                (group.goal?.comments?.length ?? 0) +
                group.tasks.reduce((sum, task) => sum + (task.comments?.length ?? 0), 0);

              const weekToneClassName = isMissingGoal
                ? 'bg-red-500/[0.1]'
                : isPlaceholderOnly
                  ? 'border border-dashed border-white/10 bg-white/[0.02]'
                  : 'bg-white/[0.03]';

              return (
                <div key={groupKey} className="relative flex gap-2">
                  <div className="flex w-3 flex-shrink-0 flex-col items-center pt-3">
                    <div
                      className={`z-[1] h-2 w-2 flex-shrink-0 rounded-full ring-2 ${
                        isPlaceholderOnly
                          ? 'bg-violet-400/40 ring-violet-500/15'
                          : 'bg-violet-400/80 ring-violet-500/25'
                      }`}
                      aria-hidden
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectWeek(groupKey)}
                    className={`${roadmapEditorSoftInsetPanelClassName} flex min-w-0 flex-1 items-start gap-2 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-white/[0.06] ${weekToneClassName}`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-sm font-black ${isPlaceholderOnly ? 'text-violet-200/60' : 'text-violet-200'}`}>
                          {group.sequentialWeek}
                          주차
                        </span>
                        <span className="text-[11px] text-gray-500">
                          {group.month}
                          월
                          {' '}
                          {group.week}
                          주차
                        </span>
                        {hasGoalText && (
                          <span
                            className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                            style={{ backgroundColor: `${statusMeta.color}22`, color: statusMeta.color }}
                          >
                            {statusMeta.emoji} {statusMeta.label}
                          </span>
                        )}
                        {taskCount > 0 && (
                          <span className="rounded-full bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-bold text-gray-400">
                            하위 {taskCount}
                          </span>
                        )}
                        {commentCount > 0 && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-sky-500/20 px-1.5 py-0.5 text-[10px] font-bold text-sky-200">
                            <MessageSquare className="h-2.5 w-2.5" />
                            {commentCount}
                          </span>
                        )}
                      </div>
                      <p
                        className={`mt-0.5 truncate text-[12px] ${
                          hasGoalText ? 'text-gray-200' : isMissingGoal ? 'text-red-300' : 'text-gray-600'
                        }`}
                      >
                        {hasGoalText ? group.goal!.title : labels.emptyGoalRowLabel}
                      </p>
                      {taskCount > 0 && (
                        <ul className="mt-1 space-y-0.5 border-l border-white/[0.08] pl-2">
                          {group.tasks.map(task => {
                            const taskTitle = task.title.trim();
                            return (
                              <li key={task.id} className="flex items-start gap-1.5">
                                <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-emerald-400/50" aria-hidden />
                                <span className={`truncate text-[11px] ${taskTitle ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {taskTitle || '항목 미입력'}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                    <ChevronRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {hasMissingGoalInItem && <p className="text-sm text-red-300">{labels.weekGoalValidationHint}</p>}
    </div>
  );
}
