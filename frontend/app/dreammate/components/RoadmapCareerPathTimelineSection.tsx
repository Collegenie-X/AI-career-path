'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, Circle, Target } from 'lucide-react';
import { PlanItemDetailSheet, PlanItemRowCard } from '@/app/career/components/PlanItemDetailSheet';
import { GOAL_GROUP_TEMPLATES_BY_ITEM_TYPE, LABELS, PERIOD_FILTERS } from '../config';
import type { DreamItemType, RoadmapItem, SharedRoadmap } from '../types';
import { sortByEarliestMonth } from '@/lib/timelineTreeUtils';

interface RoadmapCareerPathTimelineSectionProps {
  roadmap: SharedRoadmap;
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
  if (typeof weekNumber === 'number' && weekNumber > 0) {
    return `${weekNumber}주차`;
  }
  if (weekLabel?.trim()) return weekLabel;
  return '1주차';
}

function GoalGroupTimelineCard({
  goal,
  accentColor,
  periodLabel,
}: {
  goal: GroupedRoadmapItemsByGoal;
  accentColor: string;
  periodLabel: string;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedItem, setSelectedItem] = useState<RoadmapItem | null>(null);

  const mapRoadmapItemTypeToCareerItemType = (itemType: DreamItemType): 'activity' | 'award' | 'portfolio' | 'certification' => {
    if (itemType === 'award') return 'award';
    if (itemType === 'activity') return 'activity';
    if (itemType === 'project') return 'portfolio';
    return 'certification';
  };

  const toPlanItemDetail = (item: RoadmapItem) => ({
    ...item,
    type: mapRoadmapItemTypeToCareerItemType(item.type),
    subItems: (item.subItems ?? []).map(subItem => ({
      id: subItem.id,
      title: `${getWeekLabelFromTodo(subItem.weekNumber, subItem.weekLabel)} · ${subItem.title}`,
      done: Boolean(subItem.isDone),
    })),
  });

  const sprintCompletion = useMemo(() => {
    const totalCount = goal.items.reduce((sum, item) => sum + (item.subItems?.length ?? 0), 0);
    const doneCount = goal.items.reduce((sum, item) => {
      return sum + (item.subItems ?? []).filter(subItem => subItem.isDone).length;
    }, 0);
    return { totalCount, doneCount };
  }, [goal.items]);

  return (
    <div className="space-y-1.5">
      <button
        onClick={() => setIsOpen(previous => !previous)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-left transition-all"
        style={{ backgroundColor: `${accentColor}10`, border: `1px solid ${accentColor}1e` }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Target className="w-4 h-4 flex-shrink-0" style={{ color: accentColor }} />
          <span className="text-sm font-semibold text-white truncate">{goal.goalTitle}</span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[10px] font-bold text-gray-500">
            {goal.items.length}개 · {LABELS.weeklyChecklistLabel} {sprintCompletion.doneCount}/{sprintCompletion.totalCount}
          </span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-gray-500" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-500" />}
        </div>
      </button>

      {isOpen && (
        <div className="pl-6 space-y-1">
          {goal.items.map(item => (
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              className="cursor-pointer"
              onClick={() => setSelectedItem(item)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setSelectedItem(item);
                }
              }}
            >
              <PlanItemRowCard item={toPlanItemDetail(item)} color={accentColor} />
              {(item.subItems ?? []).length > 0 && (
                <div className="mt-1 pl-2.5 space-y-1">
                  {(item.subItems ?? []).map(subItem => (
                    <div
                      key={subItem.id}
                      className="flex items-center gap-1.5 text-[10px]"
                      style={{ color: 'rgba(255,255,255,0.6)' }}
                    >
                      {subItem.isDone
                        ? <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        : <Circle className="w-3 h-3 text-gray-500" />}
                      <span className="truncate">
                        {getWeekLabelFromTodo(subItem.weekNumber, subItem.weekLabel)} {subItem.title}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedItem && (
        <PlanItemDetailSheet
          item={toPlanItemDetail(selectedItem)}
          gradeLabel={periodLabel}
          color={accentColor}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}

export function RoadmapCareerPathTimelineSection({
  roadmap,
}: RoadmapCareerPathTimelineSectionProps) {
  const groupedGoals = useMemo(() => buildGroupedGoals(roadmap.items), [roadmap.items]);
  const periodLabel = useMemo(() => getPeriodLabel(roadmap.period), [roadmap.period]);
  const weeklyTotalCount = useMemo(
    () => roadmap.items.reduce((sum, item) => sum + (item.subItems?.length ?? 0), 0),
    [roadmap.items],
  );
  const weeklyDoneCount = useMemo(
    () => roadmap.items.reduce((sum, item) => sum + (item.subItems ?? []).filter(subItem => subItem.isDone).length, 0),
    [roadmap.items],
  );

  if (groupedGoals.length === 0) {
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
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${roadmap.starColor}22`, color: roadmap.starColor }}
          >
            {periodLabel}
          </span>
        </div>
        <div className="text-[10px] text-gray-400 mt-1">
          {LABELS.sprintGuideLabel}
        </div>
        <div className="text-[10px] text-gray-500 mt-1">
          목표 {groupedGoals.length}개 · 계획 {roadmap.items.length}개 · {LABELS.weeklyChecklistLabel} {weeklyDoneCount}/{weeklyTotalCount}
        </div>
      </div>
      <div className="space-y-3">
        {groupedGoals.map(goal => (
          <GoalGroupTimelineCard
            key={goal.goalId}
            goal={goal}
            accentColor={roadmap.starColor}
            periodLabel={periodLabel}
          />
        ))}
      </div>
    </div>
  );
}

