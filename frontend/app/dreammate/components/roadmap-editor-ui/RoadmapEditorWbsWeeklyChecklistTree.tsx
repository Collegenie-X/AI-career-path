'use client';

import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import type { RoadmapItem, RoadmapTodoItem } from '../../types';
import type { WeekGroupViewModel } from './roadmapEditorWbsTypes';
import { groupSortedWeekGroupsByMonth } from './roadmapEditorWbsTypes';
import {
  RoadmapEditorWbsMonthTreeNode,
  RoadmapEditorWbsSubItemLeafRow,
  RoadmapEditorWbsWeekBranchStack,
  RoadmapEditorWbsWeekDetailStack,
  RoadmapEditorWbsWeekTreeNode,
} from './RoadmapEditorWbsTreeRails';
import { roadmapEditorSoftInsetPanelClassName } from './roadmapEditorUiTokens';

export interface RoadmapEditorWbsWeeklyChecklistLabels {
  sectionTitle: string;
  addWeekGroupButton: string;
  noWeekGroupHint: string;
  deleteWeekGroupButton: string;
  weekGoalLabel: string;
  /** 목표 입력란 위·아래 짧은 안내 (config에서 주입). */
  weekGoalEditHelpHint?: string;
  weekGoalRequiredHint: string;
  weekGoalValidationHint: string;
  goalOutputLabel: string;
  subItemSectionLabel: string;
  addSubItemButton: string;
  todoAutoCompleteHint: string;
}

interface RoadmapEditorWbsWeeklyChecklistTreeProps {
  item: RoadmapItem;
  sortedWeekGroups: WeekGroupViewModel[];
  labels: RoadmapEditorWbsWeeklyChecklistLabels;
  weekGoalPlaceholderTemplate: string;
  weekTaskPlaceholderTemplate: string;
  monthAccordionOpenMap: Record<string, boolean>;
  weekAccordionOpenMap: Record<string, boolean>;
  onToggleMonthAccordion: (monthAccordionKey: string) => void;
  onToggleWeekAccordion: (weekAccordionKey: string) => void;
  onAddWeekGroup: () => void;
  onRemoveWeekGroup: (groupKey: string) => void;
  onUpsertWeekGoal: (groupKey: string, title: string) => void;
  onUpdateSubItem: (subItemId: string, patch: Partial<RoadmapTodoItem>) => void;
  onRemoveSubItem: (subItemId: string) => void;
  onAddWeekTask: (groupKey: string) => void;
  autocompleteListId: string;
  autocompleteSuggestions: readonly string[];
  hasMissingGoalInItem: boolean;
}

const wbsToolbarButtonClassName =
  'text-sm font-bold px-2.5 py-1.5 rounded-lg bg-sky-500/18 text-sky-200 hover:bg-sky-500/28 transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/45';

const wbsSubToolbarButtonClassName =
  'text-[13px] font-bold px-2 py-1 rounded-lg bg-sky-500/18 text-sky-200 hover:bg-sky-500/28 transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/45';

const wbsDeleteWeekButtonClassName =
  'text-sm font-bold px-2.5 py-1.5 rounded-lg bg-red-500/15 text-red-200 hover:bg-red-500/25 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/35';

const softField =
  'w-full rounded-lg text-white placeholder-gray-500 outline-none border-0 bg-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]';

export function RoadmapEditorWbsWeeklyChecklistTree({
  item,
  sortedWeekGroups,
  labels,
  weekGoalPlaceholderTemplate,
  weekTaskPlaceholderTemplate,
  monthAccordionOpenMap,
  weekAccordionOpenMap,
  onToggleMonthAccordion,
  onToggleWeekAccordion,
  onAddWeekGroup,
  onRemoveWeekGroup,
  onUpsertWeekGoal,
  onUpdateSubItem,
  onRemoveSubItem,
  onAddWeekTask,
  autocompleteListId,
  autocompleteSuggestions,
  hasMissingGoalInItem,
}: RoadmapEditorWbsWeeklyChecklistTreeProps) {
  const monthEntries = groupSortedWeekGroupsByMonth(sortedWeekGroups);

  return (
    <div className="space-y-1.5 pt-1">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-bold text-gray-400">{labels.sectionTitle}</span>
        <button type="button" onClick={onAddWeekGroup} className={wbsToolbarButtonClassName}>
          + {labels.addWeekGroupButton}
        </button>
      </div>

      {(item.subItems ?? []).length === 0 ? (
        <p className="text-sm text-gray-600">{labels.noWeekGroupHint}</p>
      ) : (
        <div className="relative pt-1">
          <div
            className="pointer-events-none absolute left-[9px] top-1 bottom-2 w-[2px] rounded-full bg-gradient-to-b from-sky-400/30 via-violet-400/15 to-fuchsia-400/8"
            aria-hidden
          />
          <div className="space-y-4">
            {monthEntries.map(([month, monthGroupItems]) => {
              const monthAccordionKey = `${item.id}-month-${month}`;
              const isMonthOpen = monthAccordionOpenMap[monthAccordionKey] ?? true;
              return (
                <div key={monthAccordionKey} className="relative">
                  <RoadmapEditorWbsMonthTreeNode>
                    <button
                      type="button"
                      onClick={() => onToggleMonthAccordion(monthAccordionKey)}
                      className="flex w-full items-center justify-between gap-2 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-white/[0.04]"
                    >
                      <span className="text-sm font-bold text-sky-200">
                        {month}
                        월
                      </span>
                      <span className="text-gray-500">
                        {isMonthOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </span>
                    </button>
                  </RoadmapEditorWbsMonthTreeNode>

                  {isMonthOpen && (
                    <RoadmapEditorWbsWeekBranchStack>
                      {monthGroupItems.map(({ groupKey, group }) => {
                        const weekAccordionKey = `${item.id}-${groupKey}`;
                        const isWeekOpen = weekAccordionOpenMap[weekAccordionKey] ?? true;
                        const hasGoal = (group.goal?.title.trim().length ?? 0) > 0;
                        return (
                          <RoadmapEditorWbsWeekTreeNode key={weekAccordionKey}>
                            <div
                              className={`${roadmapEditorSoftInsetPanelClassName} rounded-xl px-2.5 py-2 ${
                                hasGoal ? 'bg-white/[0.03]' : 'bg-red-500/[0.1]'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <button
                                  type="button"
                                  onClick={() => onToggleWeekAccordion(weekAccordionKey)}
                                  className="flex min-w-0 flex-1 items-center gap-1 text-left text-sm font-bold text-violet-200"
                                >
                                  <span className="truncate">
                                    {group.month}
                                    월
                                    {' '}
                                    {group.week}
                                    주차
                                  </span>
                                  {isWeekOpen ? (
                                    <ChevronUp className="h-3.5 w-3.5 flex-shrink-0 text-gray-500" />
                                  ) : (
                                    <ChevronDown className="h-3.5 w-3.5 flex-shrink-0 text-gray-500" />
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onRemoveWeekGroup(groupKey)}
                                  className={wbsDeleteWeekButtonClassName}
                                >
                                  {labels.deleteWeekGroupButton}
                                </button>
                              </div>

                              {isWeekOpen && (
                                <RoadmapEditorWbsWeekDetailStack>
                                  <div className="space-y-2 rounded-lg bg-violet-500/[0.07] px-2 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                                    <label className="mb-0.5 block text-[13px] text-gray-500">{labels.weekGoalLabel}</label>
                                    {labels.weekGoalEditHelpHint ? (
                                      <p className="mb-1 text-[10px] leading-snug text-gray-500">
                                        {labels.weekGoalEditHelpHint}
                                      </p>
                                    ) : null}
                                    <input
                                      value={group.goal?.title ?? ''}
                                      onChange={event => onUpsertWeekGoal(groupKey, event.target.value)}
                                      placeholder={weekGoalPlaceholderTemplate
                                        .replaceAll('{month}', String(group.month))
                                        .replaceAll('{week}', String(group.week))}
                                      className={`${softField} h-8 px-2.5 text-[11px] ${
                                        hasGoal ? '' : 'ring-2 ring-red-400/35 ring-inset'
                                      }`}
                                    />
                                    {!hasGoal && (
                                      <p className="mt-0.5 text-[10px] text-red-300">{labels.weekGoalRequiredHint}</p>
                                    )}
                                    {group.goal && (
                                      <div className="mt-1.5">
                                        <label className="mb-0.5 block text-[13px] text-gray-500">{labels.goalOutputLabel}</label>
                                        <input
                                          value={group.goal.outputRef ?? ''}
                                          onChange={event => onUpdateSubItem(group.goal!.id, { outputRef: event.target.value })}
                                          placeholder="https://... 또는 파일명"
                                          className={`${softField} h-7 px-2 text-[10px]`}
                                        />
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex items-center justify-between pt-1">
                                    <span className="text-[13px] font-semibold text-gray-500">{labels.subItemSectionLabel}</span>
                                    <button
                                      type="button"
                                      onClick={() => onAddWeekTask(groupKey)}
                                      className={wbsSubToolbarButtonClassName}
                                    >
                                      + {labels.addSubItemButton}
                                    </button>
                                  </div>

                                  <div className="space-y-1.5">
                                    {group.tasks.map(subItem => (
                                      <RoadmapEditorWbsSubItemLeafRow key={subItem.id}>
                                        <div className="flex items-center gap-1.5 rounded-lg bg-white/[0.04] py-1 pl-1 pr-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                                          <input
                                            value={subItem.title}
                                            onChange={event => onUpdateSubItem(subItem.id, { title: event.target.value })}
                                            placeholder={weekTaskPlaceholderTemplate
                                              .replaceAll('{month}', String(group.month))
                                              .replaceAll('{week}', String(group.week))}
                                            list={autocompleteListId}
                                            className={`${softField} h-8 flex-1 px-2.5 text-[11px]`}
                                          />
                                          <button
                                            type="button"
                                            onClick={() => onRemoveSubItem(subItem.id)}
                                            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-red-500/15 text-red-400 transition-colors hover:bg-red-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/35"
                                          >
                                            <Trash2 className="h-3.5 w-3.5" />
                                          </button>
                                        </div>
                                      </RoadmapEditorWbsSubItemLeafRow>
                                    ))}
                                  </div>
                                </RoadmapEditorWbsWeekDetailStack>
                              )}
                            </div>
                          </RoadmapEditorWbsWeekTreeNode>
                        );
                      })}
                    </RoadmapEditorWbsWeekBranchStack>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {hasMissingGoalInItem && (
        <p className="text-sm text-red-300">{labels.weekGoalValidationHint}</p>
      )}

      <datalist id={autocompleteListId}>
        {autocompleteSuggestions.map(suggestion => (
          <option key={suggestion} value={suggestion} />
        ))}
      </datalist>
      <div className="text-sm text-gray-600">
        {labels.todoAutoCompleteHint}
        :
        {' '}
        {autocompleteSuggestions.join(' · ')}
      </div>
    </div>
  );
}
