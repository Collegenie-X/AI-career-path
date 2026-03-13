'use client';

import { useMemo, useState } from 'react';
import { Calendar, CheckCircle2, ChevronDown, ChevronUp, Circle, Clock3 } from 'lucide-react';
import { PlanItemDetailSheet, PlanItemRowCard } from '@/app/career/components/PlanItemDetailSheet';
import { GOAL_GROUP_TEMPLATES_BY_ITEM_TYPE, LABELS, PERIOD_FILTERS } from '../config';
import type { DreamItemType, RoadmapItem, SharedRoadmap } from '../types';
import { sortByEarliestMonth } from '@/lib/timelineTreeUtils';

interface RoadmapCareerPathTimelineSectionProps {
  roadmap: SharedRoadmap;
  onToggleTodoItem?: (itemId: string, todoId: string) => void;
}

type GroupedRoadmapItemsByGoal = {
  goalId: DreamItemType;
  goalTitle: string;
  items: RoadmapItem[];
};

type ChronologicalMonthGroup = {
  month: number;
  monthLabel: string;
  items: RoadmapItem[];
  totalTodoCount: number;
  doneTodoCount: number;
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
  if (typeof weekNumber === 'number' && weekNumber > 0) {
    return `${weekNumber}주차`;
  }
  if (weekLabel?.trim()) return weekLabel;
  return '1주차';
}

function getEarliestMonth(item: RoadmapItem): number {
  if ((item.months ?? []).length === 0) return 99;
  const validMonths = item.months.filter(month => month >= 1 && month <= 12);
  if (validMonths.length === 0) return 99;
  return Math.min(...validMonths);
}

function getMonthLabel(month: number): string {
  return month === 99 ? '시기 미정' : `${month}월`;
}

function buildChronologicalMonthGroups(items: RoadmapItem[]): ChronologicalMonthGroup[] {
  const bucketByMonth = new Map<number, RoadmapItem[]>();
  sortByEarliestMonth(items).forEach(item => {
    const month = getEarliestMonth(item);
    const bucket = bucketByMonth.get(month) ?? [];
    bucket.push(item);
    bucketByMonth.set(month, bucket);
  });

  return [...bucketByMonth.entries()]
    .sort(([leftMonth], [rightMonth]) => leftMonth - rightMonth)
    .map(([month, monthItems]) => {
      const totalTodoCount = monthItems.reduce((sum, item) => sum + (item.subItems?.length ?? 0), 0);
      const doneTodoCount = monthItems.reduce((sum, item) => {
        return sum + (item.subItems ?? []).filter(subItem => subItem.isDone).length;
      }, 0);
      return {
        month,
        monthLabel: getMonthLabel(month),
        items: monthItems,
        totalTodoCount,
        doneTodoCount,
      };
    });
}

function RoadmapTodoChecklist({ 
  item, 
  onToggleTodoItem 
}: { 
  item: RoadmapItem;
  onToggleTodoItem?: (itemId: string, todoId: string) => void;
}) {
  const sortedTodoItems = useMemo(
    () =>
      [...(item.subItems ?? [])].sort((leftTodo, rightTodo) => {
        const leftWeek = leftTodo.weekNumber ?? 999;
        const rightWeek = rightTodo.weekNumber ?? 999;
        return leftWeek - rightWeek;
      }),
    [item.subItems],
  );

  if (sortedTodoItems.length === 0) {
    return (
      <div
        className="mt-1.5 ml-3 pl-3 py-1.5 rounded-lg"
        style={{ borderLeft: '1px dashed rgba(255,255,255,0.18)', backgroundColor: 'rgba(255,255,255,0.02)' }}
      >
        <p className="text-[10px] text-gray-500">등록된 할 일이 없어요.</p>
      </div>
    );
  }

  return (
    <div className="mt-1.5 ml-3 pl-3 py-1.5 space-y-1.5 rounded-lg" style={{ borderLeft: '1px dashed rgba(255,255,255,0.18)' }}>
      {sortedTodoItems.map(todoItem => (
        <button
          key={todoItem.id}
          onClick={(event) => {
            event.stopPropagation();
            onToggleTodoItem?.(item.id, todoItem.id);
          }}
          disabled={!onToggleTodoItem}
          className="w-full flex items-center gap-1.5 text-[10px] text-left transition-opacity"
          style={{ 
            color: 'rgba(255,255,255,0.7)',
            cursor: onToggleTodoItem ? 'pointer' : 'default',
            opacity: onToggleTodoItem ? 1 : 0.9,
          }}
        >
          {todoItem.isDone
            ? <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
            : <Circle className="w-3 h-3 text-gray-500 flex-shrink-0" />}
          <span className="text-[10px] font-semibold text-gray-400 flex-shrink-0">
            {getWeekLabelFromTodo(todoItem.weekNumber, todoItem.weekLabel)}
          </span>
          <span className="truncate">{todoItem.title}</span>
        </button>
      ))}
    </div>
  );
}

function RoadmapItemTodoAccordionCard({
  item,
  accentColor,
  goalTitleByItemType,
  onSelectItem,
  onToggleTodoItem,
}: {
  item: RoadmapItem;
  accentColor: string;
  goalTitleByItemType: Record<DreamItemType, string>;
  onSelectItem: (item: RoadmapItem) => void;
  onToggleTodoItem?: (itemId: string, todoId: string) => void;
}) {
  const [isTodoOpen, setIsTodoOpen] = useState(true);

  return (
    <div
      className="rounded-lg p-2"
      style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${accentColor}1a`, color: accentColor }}>
          {goalTitleByItemType[item.type] ?? item.type}
        </span>
        <button
          onClick={() => setIsTodoOpen(previous => !previous)}
          className="text-[10px] text-gray-500 flex items-center gap-1"
        >
          {LABELS.todoSectionLabel} {(item.subItems ?? []).filter(todoItem => todoItem.isDone).length}/{(item.subItems ?? []).length}
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
        <PlanItemRowCard item={toPlanItemDetail(item)} color={accentColor} />
      </div>
      {isTodoOpen && <RoadmapTodoChecklist item={item} onToggleTodoItem={onToggleTodoItem} />}
    </div>
  );
}

function MonthTimelineNode({
  monthGroup,
  isLast,
  accentColor,
  goalTitleByItemType,
  onSelectItem,
  onToggleTodoItem,
}: {
  monthGroup: ChronologicalMonthGroup;
  isLast: boolean;
  accentColor: string;
  goalTitleByItemType: Record<DreamItemType, string>;
  onSelectItem: (item: RoadmapItem) => void;
  onToggleTodoItem?: (itemId: string, todoId: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="relative pl-10 pb-4">
      <div
        className="absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black z-10"
        style={{ backgroundColor: accentColor, color: '#fff', boxShadow: `0 0 0 3px #0f1025, 0 0 12px ${accentColor}66` }}
      >
        <Calendar className="w-4 h-4" />
      </div>
      {!isLast && (
        <div className="absolute left-[15px] top-8 bottom-0 w-0.5" style={{ backgroundColor: `${accentColor}2a` }} />
      )}

      <div className="rounded-xl px-3 py-2.5" style={{ backgroundColor: `${accentColor}0f`, border: `1px solid ${accentColor}22` }}>
        <button onClick={() => setIsOpen(previous => !previous)} className="w-full flex items-center justify-between gap-2 text-left">
          <div className="min-w-0">
            <div className="text-sm font-bold text-white flex items-center gap-1.5">
              <Clock3 className="w-3.5 h-3.5" style={{ color: accentColor }} />
              {monthGroup.monthLabel}
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">
              계획 {monthGroup.items.length}개 · {LABELS.weeklyChecklistLabel} {monthGroup.doneTodoCount}/{monthGroup.totalTodoCount}
            </div>
          </div>
          {isOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
        </button>

        {isOpen && (
          <div className="mt-2.5 space-y-2">
            {monthGroup.items.map(item => (
              <RoadmapItemTodoAccordionCard
                key={item.id}
                item={item}
                accentColor={accentColor}
                goalTitleByItemType={goalTitleByItemType}
                onSelectItem={onSelectItem}
                onToggleTodoItem={onToggleTodoItem}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const mapRoadmapItemTypeToCareerItemType = (itemType: DreamItemType): 'activity' | 'award' | 'portfolio' | 'certification' => {
  if (itemType === 'award') return 'award';
  if (itemType === 'activity') return 'activity';
  if (itemType === 'project') return 'portfolio';
  return 'certification';
};

function toPlanItemDetail(item: RoadmapItem) {
  return {
    ...item,
    type: mapRoadmapItemTypeToCareerItemType(item.type),
    subItems: (item.subItems ?? []).map(subItem => ({
      id: subItem.id,
      title: `${getWeekLabelFromTodo(subItem.weekNumber, subItem.weekLabel)} · ${subItem.title}`,
      done: Boolean(subItem.isDone),
    })),
  };
}

export function RoadmapCareerPathTimelineSection({
  roadmap,
  onToggleTodoItem,
}: RoadmapCareerPathTimelineSectionProps) {
  const [selectedItem, setSelectedItem] = useState<RoadmapItem | null>(null);
  const periodLabel = useMemo(() => getPeriodLabel(roadmap.period), [roadmap.period]);
  const groupedGoals = useMemo(() => buildGroupedGoals(roadmap.items), [roadmap.items]);
  const chronologicalMonthGroups = useMemo(
    () => buildChronologicalMonthGroups(roadmap.items),
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
    () => roadmap.items.reduce((sum, item) => sum + (item.subItems?.length ?? 0), 0),
    [roadmap.items],
  );
  const weeklyDoneCount = useMemo(
    () => roadmap.items.reduce((sum, item) => sum + (item.subItems ?? []).filter(subItem => subItem.isDone).length, 0),
    [roadmap.items],
  );

  if (chronologicalMonthGroups.length === 0) {
    return (
      <div className="py-10 text-center rounded-xl" style={{ border: '1px dashed rgba(255,255,255,0.1)' }}>
        <p className="text-xs text-gray-500">로드맵 항목이 아직 없어요.</p>
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
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${roadmap.starColor}22`, color: roadmap.starColor }}>
            {periodLabel}
          </span>
        </div>
        <div className="text-[10px] text-gray-400 mt-1">{LABELS.sprintGuideLabel}</div>
        <div className="text-[10px] text-gray-500 mt-1">
          목표 {groupedGoals.length}개 · 계획 {roadmap.items.length}개 · {LABELS.weeklyChecklistLabel} {weeklyDoneCount}/{weeklyTotalCount}
        </div>
      </div>

      <div className="space-y-0">
        {chronologicalMonthGroups.map((monthGroup, index) => (
          <MonthTimelineNode
            key={`${monthGroup.month}-${index}`}
            monthGroup={monthGroup}
            isLast={index === chronologicalMonthGroups.length - 1}
            accentColor={roadmap.starColor}
            goalTitleByItemType={goalTitleByItemType}
            onSelectItem={setSelectedItem}
            onToggleTodoItem={onToggleTodoItem}
          />
        ))}
      </div>

      {selectedItem && (
        <PlanItemDetailSheet
          item={toPlanItemDetail(selectedItem)}
          gradeLabel={periodLabel}
          color={roadmap.starColor}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}

