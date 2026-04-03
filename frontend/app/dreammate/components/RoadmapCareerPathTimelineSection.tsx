'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, Circle } from 'lucide-react';
import { PlanItemDetailSheet, PlanItemRowCard } from '@/app/career/components/PlanItemDetailSheet';
import { GOAL_GROUP_TEMPLATES_BY_ITEM_TYPE, LABELS, PERIOD_FILTERS } from '../config';
import type { DreamItemType, RoadmapItem, SharedRoadmap } from '../types';
import { getEffectiveTodoCounts } from '../utils/roadmapTodoCounts';
import { sortByEarliestMonth } from '@/lib/timelineTreeUtils';
import { RoadmapTodoHeaderInlineProgressBar, RoadmapTodoInlineProgressBar } from './RoadmapTodoProgressBars';

interface RoadmapCareerPathTimelineSectionProps {
  roadmap: SharedRoadmap;
  showProgressBars?: boolean;
  showTodoCheckboxes?: boolean;
  onToggleTodoItem?: (itemId: string, todoId: string) => void;
}

type GroupedRoadmapItemsByGoal = {
  goalId: DreamItemType;
  goalTitle: string;
  items: RoadmapItem[];
};

function getPeriodLabel(periodId: SharedRoadmap['period']): string {
  return PERIOD_FILTERS.find(period => period.id === periodId)?.label ?? periodId;
}

function buildGroupedGoals(items: RoadmapItem[]): GroupedRoadmapItemsByGoal[] {
  const itemsByType = new Map<DreamItemType, RoadmapItem[]>();
  items.forEach(item => {
    const currentItems = itemsByType.get(item.type) ?? [];
    currentItems.push(item);
    itemsByType.set(item.type, currentItems);
  });

  return GOAL_GROUP_TEMPLATES_BY_ITEM_TYPE.map(template => ({
    goalId: template.itemType,
    goalTitle: template.goalTitle,
    items: sortByEarliestMonth(itemsByType.get(template.itemType) ?? []),
  })).filter(group => group.items.length > 0);
}

function getWeekLabelFromTodo(weekNumber?: number, weekLabel?: string): string {
  if (weekLabel?.trim()) return weekLabel;
  if (typeof weekNumber === 'number' && weekNumber > 0) {
    return `${weekNumber}주차`;
  }
  return '1주차';
}

function parseTodoMonthWeek(todoItem: { weekNumber?: number; weekLabel?: string }): { month: number; week: number } {
  const matched = (todoItem.weekLabel ?? '').match(/(\d+)\s*월\s*(\d+)\s*주차/);
  if (matched) {
    const month = Number(matched[1]);
    const week = Number(matched[2]);
    if (Number.isInteger(month) && Number.isInteger(week)) {
      return { month, week };
    }
  }

  if (typeof todoItem.weekNumber === 'number' && todoItem.weekNumber > 0) {
    return { month: 99, week: todoItem.weekNumber };
  }

  return { month: 99, week: 1 };
}

function getActionableTodoItems(item: RoadmapItem) {
  return (item.subItems ?? []).filter(todoItem => todoItem.entryType !== 'goal');
}

function getGoalTodoItems(item: RoadmapItem) {
  return (item.subItems ?? []).filter(todoItem => todoItem.entryType === 'goal');
}

function isRoadmapItemFullyCompleted(item: RoadmapItem): boolean {
  const { total, done } = getEffectiveTodoCounts(item);
  return total > 0 && done === total;
}

function hasTodoExecutionRecord(todoItem: { outputRef?: string }): boolean {
  return Boolean(todoItem.outputRef?.trim());
}

function formatRoadmapItemMonthLabel(item: RoadmapItem): string {
  const sortedMonths = (item.months ?? [])
    .filter(month => month >= 1 && month <= 12)
    .sort((leftMonth, rightMonth) => leftMonth - rightMonth);
  if (sortedMonths.length === 0) return '시기 미정';
  if (sortedMonths.length === 1) return `${sortedMonths[0]}월`;
  return `${sortedMonths[0]}월~${sortedMonths[sortedMonths.length - 1]}월`;
}

function RoadmapTodoChecklist({ 
  item, 
  showTodoCheckboxes = true,
  onToggleTodoItem 
}: { 
  item: RoadmapItem;
  showTodoCheckboxes?: boolean;
  onToggleTodoItem?: (itemId: string, todoId: string) => void;
}) {
  const sortedTodoItems = useMemo(
    () =>
      [...(item.subItems ?? [])].sort((leftTodo, rightTodo) => {
        const leftMonthWeek = parseTodoMonthWeek(leftTodo);
        const rightMonthWeek = parseTodoMonthWeek(rightTodo);
        if (leftMonthWeek.month !== rightMonthWeek.month) return leftMonthWeek.month - rightMonthWeek.month;
        if (leftMonthWeek.week !== rightMonthWeek.week) return leftMonthWeek.week - rightMonthWeek.week;
        if (leftTodo.entryType === rightTodo.entryType) return 0;
        return leftTodo.entryType === 'goal' ? -1 : 1;
      }),
    [item.subItems],
  );
  const groupedTodoItemsByWeek = useMemo(() => {
    const weekBucket = new Map<string, { weekKey: string; weekLabel: string; todoItems: typeof sortedTodoItems }>();
    sortedTodoItems.forEach(todoItem => {
      const weekLabel = getWeekLabelFromTodo(todoItem.weekNumber, todoItem.weekLabel);
      const weekKey = `${todoItem.weekNumber ?? 'na'}-${todoItem.weekLabel ?? weekLabel}`;
      const currentWeekGroup = weekBucket.get(weekKey);
      if (currentWeekGroup) {
        currentWeekGroup.todoItems.push(todoItem);
        return;
      }
      weekBucket.set(weekKey, { weekKey, weekLabel, todoItems: [todoItem] });
    });
    return [...weekBucket.values()];
  }, [sortedTodoItems]);
  const [weekAccordionOpenMap, setWeekAccordionOpenMap] = useState<Record<string, boolean>>({});

  if (sortedTodoItems.length === 0) {
    return (
      <div
        className="mt-1.5 ml-3 pl-3 py-1.5 rounded-lg"
        style={{ borderLeft: '1px dashed rgba(255,255,255,0.18)', backgroundColor: 'rgba(255,255,255,0.02)' }}
      >
        <p className="text-sm text-gray-500">등록된 할 일이 없어요.</p>
      </div>
    );
  }

  return (
    <div className="mt-1.5 ml-3 pl-3 py-1.5 space-y-1.5 rounded-lg" style={{ borderLeft: '1px dashed rgba(255,255,255,0.18)' }}>
      {groupedTodoItemsByWeek.map(weekGroup => {
        const isWeekOpen = weekAccordionOpenMap[weekGroup.weekKey] ?? true;
        return (
          <div key={weekGroup.weekKey} className="rounded-lg px-2 py-1.5" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
            <button
              className="w-full flex items-center justify-between gap-2 text-left"
              onClick={(event) => {
                event.stopPropagation();
                setWeekAccordionOpenMap(previous => ({
                  ...previous,
                  [weekGroup.weekKey]: !(previous[weekGroup.weekKey] ?? true),
                }));
              }}
            >
              <span className="text-sm font-semibold text-gray-300">
                {weekGroup.weekLabel}
              </span>
              <span className="flex items-center gap-1 text-gray-500" style={{ fontSize: 10 }}>
                {(() => {
                  const subItemCount = weekGroup.todoItems.filter(t => t.entryType !== 'goal').length;
                  const goalCount = weekGroup.todoItems.filter(t => t.entryType === 'goal').length;
                  if (subItemCount > 0) return `${subItemCount}개`;
                  if (goalCount > 0) return '목표';
                  return null;
                })()}
                {isWeekOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </span>
            </button>

            {isWeekOpen && (
              <div className="mt-1.5 space-y-1.5">
                {weekGroup.todoItems.map(todoItem => {
                  const isGoalEntry = todoItem.entryType === 'goal';
                  const actionableCountInWeek = weekGroup.todoItems.filter(t => t.entryType !== 'goal').length;
                  const shouldShowGoalAsCheckable = isGoalEntry && actionableCountInWeek === 0;

                  const TodoItemContent = ({ children }: { children: React.ReactNode }) => (
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      {showTodoCheckboxes && (
                        todoItem.isDone
                          ? <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                          : <Circle className="w-3 h-3 text-gray-500 flex-shrink-0" />
                      )}
                      {children}
                    </div>
                  );

                  if (isGoalEntry && !shouldShowGoalAsCheckable) {
                    return (
                      <div key={todoItem.id} className="w-full text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                        <div className="flex items-center gap-1.5">
                          <span className="inline-block w-1 h-1 rounded-full bg-violet-400 flex-shrink-0" />
                          <span className="text-sm px-1.5 py-0.5 rounded-md font-bold text-violet-200" style={{ backgroundColor: 'rgba(139,92,246,0.2)' }}>
                            목표
                          </span>
                          <span className="truncate">{todoItem.title}</span>
                        </div>
                        {hasTodoExecutionRecord(todoItem) && (
                          <div className="mt-1 ml-4 space-y-0.5 text-gray-500" style={{ fontSize: 10 }}>
                            <p className="line-clamp-1">산출물: {todoItem.outputRef}</p>
                          </div>
                        )}
                      </div>
                    );
                  }

                  if (isGoalEntry && shouldShowGoalAsCheckable) {
                    const Wrapper = showTodoCheckboxes && onToggleTodoItem ? 'button' : 'div';
                    return (
                      <Wrapper
                        key={todoItem.id}
                        {...(Wrapper === 'button' ? {
                          onClick: (event: React.MouseEvent) => {
                            event.stopPropagation();
                            onToggleTodoItem?.(item.id, todoItem.id);
                          },
                          className: 'w-full flex items-center gap-1.5 text-sm text-left transition-opacity',
                          style: { color: 'rgba(255,255,255,0.7)', cursor: 'pointer' },
                        } : {
                          className: 'w-full flex items-center gap-1.5 text-sm text-left',
                          style: { color: 'rgba(255,255,255,0.7)' },
                        })}
                      >
                        <TodoItemContent>
                          <span className="text-sm px-1.5 py-0.5 rounded-md font-bold text-violet-200 flex-shrink-0" style={{ backgroundColor: 'rgba(139,92,246,0.2)' }}>
                            목표
                          </span>
                          <p className={`truncate ${todoItem.isDone ? 'text-gray-500 line-through decoration-1 decoration-gray-600' : ''}`}>
                            {todoItem.title}
                          </p>
                        </TodoItemContent>
                      </Wrapper>
                    );
                  }

                  const Wrapper = showTodoCheckboxes && onToggleTodoItem ? 'button' : 'div';
                  return (
                    <Wrapper
                      key={todoItem.id}
                      {...(Wrapper === 'button' ? {
                        onClick: (event: React.MouseEvent) => {
                          event.stopPropagation();
                          onToggleTodoItem?.(item.id, todoItem.id);
                        },
                        className: 'w-full flex items-center gap-1.5 text-sm text-left transition-opacity',
                        style: { color: 'rgba(255,255,255,0.7)', cursor: 'pointer' },
                      } : {
                        className: 'w-full flex items-center gap-1.5 text-sm text-left',
                        style: { color: 'rgba(255,255,255,0.7)' },
                      })}
                    >
                      <TodoItemContent>
                        <p className={`truncate min-w-0 flex-1 ${todoItem.isDone ? 'text-gray-500 line-through decoration-1 decoration-gray-600' : ''}`}>
                          {todoItem.title}
                        </p>
                      </TodoItemContent>
                    </Wrapper>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function RoadmapItemTodoAccordionCard({
  item,
  accentColor,
  goalTitleByItemType,
  showProgressBars,
  showTodoCheckboxes = true,
  onSelectItem,
  onToggleTodoItem,
}: {
  item: RoadmapItem;
  accentColor: string;
  goalTitleByItemType: Record<DreamItemType, string>;
  showProgressBars?: boolean;
  showTodoCheckboxes?: boolean;
  onSelectItem: (item: RoadmapItem) => void;
  onToggleTodoItem?: (itemId: string, todoId: string) => void;
}) {
  const [isTodoOpen, setIsTodoOpen] = useState(true);
  const { total: effectiveTotal, done: effectiveDone } = getEffectiveTodoCounts(item);

  return (
    <div
      className="rounded-lg p-2"
      style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-sm font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${accentColor}1a`, color: accentColor }}>
          {goalTitleByItemType[item.type] ?? item.type}
        </span>
        <button
          onClick={() => setIsTodoOpen(previous => !previous)}
          className="text-sm text-gray-500 flex items-center gap-1"
        >
          {showProgressBars && effectiveTotal > 0 && (
            <span className="inline-flex ml-1">
              <RoadmapTodoInlineProgressBar
                doneCount={effectiveDone}
                totalCount={effectiveTotal}
                accentColor={accentColor}
              />
            </span>
          )}
          {isTodoOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>
      <div
        role="button"
        tabIndex={0}
        className="cursor-pointer"
        onClick={() => onSelectItem(item)}
        onKeyDown={event => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onSelectItem(item);
          }
        }}
      >
        <p className="text-sm text-gray-500 mb-1.5 ml-0.5">
          실행 기간: {formatRoadmapItemMonthLabel(item)}
        </p>
        <PlanItemRowCard
          item={toPlanItemDetail(item, { includeSubItems: false })}
          color={accentColor}
          isTitleDone={isRoadmapItemFullyCompleted(item)}
        />
      </div>
      {(item.targetOutput || item.successCriteria) && (
        <div className="mt-1.5 ml-3 rounded-lg px-2.5 py-2 space-y-1" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {item.targetOutput && (
            <p className="text-sm text-cyan-200 leading-snug">
              <span className="text-cyan-300 font-semibold">산출물:</span> {item.targetOutput}
            </p>
          )}
          {item.successCriteria && (
            <p className="text-sm text-emerald-200 leading-snug">
              <span className="text-emerald-300 font-semibold">완료 기준:</span> {item.successCriteria}
            </p>
          )}
        </div>
      )}
      {isTodoOpen && <RoadmapTodoChecklist item={item} showTodoCheckboxes={showTodoCheckboxes} onToggleTodoItem={onToggleTodoItem} />}
    </div>
  );
}

const mapRoadmapItemTypeToCareerItemType = (itemType: DreamItemType): 'activity' | 'award' | 'portfolio' | 'certification' => {
  if (itemType === 'award') return 'award';
  if (itemType === 'activity') return 'activity';
  if (itemType === 'project') return 'portfolio';
  return 'certification';
};

export function toPlanItemDetail(item: RoadmapItem, options?: { includeSubItems?: boolean }) {
  const includeSubItems = options?.includeSubItems ?? true;
  const hasOnlyGoals = getActionableTodoItems(item).length === 0 && getGoalTodoItems(item).length > 0;
  return {
    ...item,
    type: mapRoadmapItemTypeToCareerItemType(item.type),
    subItems: includeSubItems
      ? (item.subItems ?? []).map(subItem => ({
          id: subItem.id,
          title: `${getWeekLabelFromTodo(subItem.weekNumber, subItem.weekLabel)} · ${subItem.entryType === 'goal' ? `[목표] ${subItem.title}` : subItem.title}`,
          done: subItem.entryType === 'goal'
            ? (hasOnlyGoals ? Boolean(subItem.isDone) : false)
            : Boolean(subItem.isDone),
        }))
      : [],
  };
}

export function RoadmapCareerPathTimelineSection({
  roadmap,
  showProgressBars = true,
  showTodoCheckboxes = true,
  onToggleTodoItem,
}: RoadmapCareerPathTimelineSectionProps) {
  const [selectedItem, setSelectedItem] = useState<RoadmapItem | null>(null);
  const periodLabel = useMemo(() => getPeriodLabel(roadmap.period), [roadmap.period]);
  const groupedGoals = useMemo(() => buildGroupedGoals(roadmap.items), [roadmap.items]);
  const sortedRoadmapItems = useMemo(
    () => sortByEarliestMonth(roadmap.items),
    [roadmap.items],
  );

  const goalTitleByItemType = useMemo(
    () =>
      GOAL_GROUP_TEMPLATES_BY_ITEM_TYPE.reduce((accumulator, template) => {
        accumulator[template.itemType] = template.goalTitle;
        return accumulator;
      }, {} as Record<DreamItemType, string>),
    [],
  );

  const weeklyTotalCount = useMemo(
    () => roadmap.items.reduce((sum, item) => sum + getEffectiveTodoCounts(item).total, 0),
    [roadmap.items],
  );
  const weeklyDoneCount = useMemo(
    () => roadmap.items.reduce((sum, item) => sum + getEffectiveTodoCounts(item).done, 0),
    [roadmap.items],
  );

  if (sortedRoadmapItems.length === 0) {
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
          <div className="text-sm font-bold text-white">{LABELS.wbsSprintSectionTitle}</div>
          <span className="text-sm font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${roadmap.starColor}22`, color: roadmap.starColor }}>
            {periodLabel}
          </span>
        </div>
        <div className="text-sm text-gray-400 mt-1">{LABELS.sprintGuideLabel}</div>
        {showProgressBars && (
          <div className="flex items-center justify-between gap-2 mt-1">
            <span className="text-sm text-gray-500">{LABELS.roadmapGoalPlanWeeklySummaryLineLabel}</span>
            <RoadmapTodoHeaderInlineProgressBar
              doneCount={weeklyDoneCount}
              totalCount={weeklyTotalCount}
              accentColor={roadmap.starColor}
            />
          </div>
        )}
      </div>

      <div className="space-y-2">
        {sortedRoadmapItems.map(item => (
          <RoadmapItemTodoAccordionCard
            key={item.id}
            item={item}
            accentColor={roadmap.starColor}
            goalTitleByItemType={goalTitleByItemType}
            showProgressBars={showProgressBars}
            showTodoCheckboxes={showTodoCheckboxes}
            onSelectItem={setSelectedItem}
            onToggleTodoItem={onToggleTodoItem}
          />
        ))}
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

