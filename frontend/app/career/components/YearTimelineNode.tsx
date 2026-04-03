'use client';

import { useState, useEffect } from 'react';
import { GRADE_YEARS, LABELS } from '../config';
import { CareerPathNestedRail } from './timeline-dream-path/CareerTimelineCareerPathChrome';
import { CareerPathTimelineGradeSectionChrome } from './timeline-dream-path/CareerPathTimelineListChrome';
import { YearTimelineNodePlanAndGoalSections } from './YearTimelineNodePlanAndGoalSections';
import type { PlanItem, YearPlan } from './CareerPathBuilder';
import {
  ItemRow, QuickAddItem,
  type PlanItemWithCheck,
} from './TimelineItemComponents';
import { calculateYearStatistics } from '../utils/planStatisticsCalculator';

type YearTimelineNodeProps = {
  year: YearPlan & { items: PlanItemWithCheck[] };
  color: string;
  isLast: boolean;
  isEditMode: boolean;
  showCheckboxes?: boolean;
  /** false: 탐색·커뮤니티 등 — 학년·목표 행에 체크 진행 막대 숨김 */
  showTimelineProgressBars?: boolean;
  onUpdateYear: (y: YearPlan) => void;
  onItemInfoClick: (item: PlanItem, gradeLabel: string) => void;
};

function buildExpandedGoalIdSet(year: YearPlan & { items: PlanItemWithCheck[] }): Set<string> {
  const ids: string[] = [];
  (year.groups ?? []).forEach((g) => ids.push(`plan-group-${g.id}`));
  if (year.semester === 'split') {
    (year.semesterPlans ?? []).forEach((sp) => {
      sp.goalGroups.forEach((g) => ids.push(g.id));
    });
  } else {
    (year.goalGroups ?? []).forEach((g) => ids.push(g.id));
  }
  return new Set(ids);
}

export function YearTimelineNode({
  year,
  color,
  isEditMode,
  showCheckboxes = true,
  showTimelineProgressBars = true,
  onUpdateYear,
  onItemInfoClick,
}: YearTimelineNodeProps) {
  const [gradeExpanded, setGradeExpanded] = useState(true);
  const [expandedGoalIds, setExpandedGoalIds] = useState<Set<string>>(() => buildExpandedGoalIdSet(year));

  /** Set에 id가 있으면 펼침(기존 동작과 동일) */
  const toggleGoalExpand = (goalId: string) => {
    setExpandedGoalIds((prev) => {
      const next = new Set(prev);
      if (next.has(goalId)) next.delete(goalId);
      else next.add(goalId);
      return next;
    });
  };

  const goalGroupIdList = year.semester === 'split'
    ? (year.semesterPlans ?? []).flatMap((sp) => sp.goalGroups.map((g) => g.id)).join(',')
    : (year.goalGroups ?? []).map((g) => g.id).join(',');
  const planGroupIdList = (year.groups ?? []).map((g) => g.id).join(',');

  useEffect(() => {
    const ids = buildExpandedGoalIdSet(year);
    setExpandedGoalIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });
  }, [year.gradeId, goalGroupIdList, planGroupIdList]);

  const grade = GRADE_YEARS.find((g) => g.id === year.gradeId);
  const groupItems = (year.groups ?? []).flatMap((g) => g.items) as PlanItemWithCheck[];

  const dedupeItems = (items: PlanItemWithCheck[]): PlanItemWithCheck[] => {
    const seenIds = new Set<string>();
    const seenContent = new Set<string>();
    return items.filter((it) => {
      if (seenIds.has(it.id)) return false;
      const months = Array.isArray(it.months) ? it.months : [];
      const contentKey = `${it.type ?? 'activity'}::${(it.title ?? '').trim()}::${months.join(',')}`;
      if (seenContent.has(contentKey)) return false;
      seenIds.add(it.id);
      seenContent.add(contentKey);
      return true;
    });
  };

  const goalGroupItems: PlanItemWithCheck[] = year.semester === 'split'
    ? (year.semesterPlans ?? []).flatMap((sp) => sp.goalGroups.flatMap((g) => g.items)) as PlanItemWithCheck[]
    : (year.goalGroups ?? []).flatMap((g) => g.items) as PlanItemWithCheck[];

  const idsInGoalGroups = new Set(goalGroupItems.map((it) => it.id));
  const idsInPlanGroups = new Set((year.groups ?? []).flatMap((g) => g.items.map((it) => it.id)));
  const ungroupedYearItems = year.items.filter(
    (it) => !idsInGoalGroups.has(it.id) && !idsInPlanGroups.has(it.id),
  );

  const yearStats = calculateYearStatistics(year);
  const completedSuffix = String(LABELS.timeline_summary_completed_label ?? '완료');

  const toggleCheck = (itemId: string) =>
    onUpdateYear({
      ...year,
      items: year.items.map((it) =>
        it.id === itemId ? { ...it, checked: !(it as PlanItemWithCheck).checked } : it,
      ),
    });

  const toggleCheckInGroup = (groupId: string, itemId: string) => {
    const groups = (year.groups ?? []).map((g) =>
      g.id === groupId
        ? {
            ...g,
            items: g.items.map((it) =>
              it.id === itemId ? { ...it, checked: !(it as PlanItemWithCheck).checked } : it,
            ),
          }
        : g,
    );
    onUpdateYear({ ...year, groups });
  };

  const toggleCheckInGoalGroup = (groupId: string, itemId: string) => {
    const goalGroups = (year.goalGroups ?? []).map((g) =>
      g.id === groupId
        ? {
            ...g,
            items: g.items.map((it) =>
              it.id === itemId ? { ...it, checked: !(it as PlanItemWithCheck).checked } : it,
            ),
          }
        : g,
    );
    onUpdateYear({ ...year, goalGroups });
  };

  const toggleCheckInSemesterPlan = (semesterId: string, groupId: string, itemId: string) => {
    const semesterPlans = (year.semesterPlans ?? []).map((sp) =>
      sp.semesterId === semesterId
        ? {
            ...sp,
            goalGroups: sp.goalGroups.map((g) =>
              g.id === groupId
                ? {
                    ...g,
                    items: g.items.map((it) =>
                      it.id === itemId ? { ...it, checked: !(it as PlanItemWithCheck).checked } : it,
                    ),
                  }
                : g,
            ),
          }
        : sp,
    );
    onUpdateYear({ ...year, semesterPlans });
  };

  const deleteItem = (itemId: string) =>
    onUpdateYear({ ...year, items: year.items.filter((it) => it.id !== itemId) });

  const updateItemSubItem = (itemId: string, subItemId: string) => {
    const toggleSub = (item: PlanItem): PlanItem => {
      if (item.id !== itemId) return item;
      const subs = item.subItems ?? [];
      return { ...item, subItems: subs.map((s) => (s.id === subItemId ? { ...s, done: !s.done } : s)) };
    };
    const newYear: YearPlan = {
      ...year,
      items: year.items.map(toggleSub),
      groups: (year.groups ?? []).map((g) => ({ ...g, items: g.items.map(toggleSub) })),
      goalGroups: (year.goalGroups ?? []).map((g) => ({ ...g, items: g.items.map(toggleSub) })),
      semesterPlans: (year.semesterPlans ?? []).map((sp) => ({
        ...sp,
        goalGroups: sp.goalGroups.map((g) => ({ ...g, items: g.items.map(toggleSub) })),
      })),
    };
    onUpdateYear(newYear);
  };

  const deleteItemFromGroup = (groupId: string, itemId: string) => {
    const groups = (year.groups ?? []).map((g) =>
      g.id === groupId ? { ...g, items: g.items.filter((it) => it.id !== itemId) } : g,
    );
    onUpdateYear({ ...year, groups });
  };

  const saveItemTitle = (itemId: string, title: string) =>
    onUpdateYear({ ...year, items: year.items.map((it) => (it.id === itemId ? { ...it, title } : it)) });

  const saveItemTitleInGroup = (groupId: string, itemId: string, title: string) => {
    const groups = (year.groups ?? []).map((g) =>
      g.id === groupId ? { ...g, items: g.items.map((it) => (it.id === itemId ? { ...it, title } : it)) } : g,
    );
    onUpdateYear({ ...year, groups });
  };

  const addItem = (title: string, type: PlanItem['type']) => {
    const newItem: PlanItemWithCheck = {
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type,
      title,
      months: [3],
      difficulty: 2,
      cost: '무료',
      organizer: '',
    };
    onUpdateYear({ ...year, items: [...year.items, newItem] });
  };

  return (
    <CareerPathTimelineGradeSectionChrome
      accentColor={color}
      gradeShortLabel={year.gradeLabel}
      gradeFullLabel={grade?.fullLabel ?? year.gradeLabel}
      isGradeExpanded={gradeExpanded}
      onToggleGrade={() => setGradeExpanded((v) => !v)}
      showGradeProgressBar={showTimelineProgressBars}
      gradeCheckedCount={yearStats.checked}
      gradeTotalCount={yearStats.total}
      completedSuffixLabel={completedSuffix}
    >
      <YearTimelineNodePlanAndGoalSections
        year={year}
        color={color}
        expandedGoalIds={expandedGoalIds}
        toggleGoalExpand={toggleGoalExpand}
        showTimelineProgressBars={showTimelineProgressBars}
        completedSuffix={completedSuffix}
        isEditMode={isEditMode}
        showCheckboxes={showCheckboxes}
        dedupeItems={dedupeItems}
        toggleCheckInGroup={toggleCheckInGroup}
        deleteItemFromGroup={deleteItemFromGroup}
        saveItemTitleInGroup={saveItemTitleInGroup}
        toggleCheckInGoalGroup={toggleCheckInGoalGroup}
        toggleCheckInSemesterPlan={toggleCheckInSemesterPlan}
        onItemInfoClick={onItemInfoClick}
        updateItemSubItem={updateItemSubItem}
      />

      {(() => {
        if (ungroupedYearItems.length === 0 && !isEditMode) return null;
        return (
          <CareerPathNestedRail accentColor={color}>
            {ungroupedYearItems.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                color={color}
                isEditMode={isEditMode}
                showCheckbox={showCheckboxes}
                useLightBorder
                onToggleCheck={() => toggleCheck(item.id)}
                onDelete={() => deleteItem(item.id)}
                onTitleSave={(title) => saveItemTitle(item.id, title)}
                onInfoClick={() => onItemInfoClick(item, year.gradeLabel)}
                onToggleSubItemDone={!isEditMode ? (_, subId) => updateItemSubItem(item.id, subId) : undefined}
              />
            ))}
            {isEditMode && <QuickAddItem color={color} onAdd={addItem} />}
          </CareerPathNestedRail>
        );
      })()}

      {yearStats.total === 0 && isEditMode && (
        <div
          className="text-center py-3 rounded-xl"
          style={{ border: `1px dashed ${color}28`, backgroundColor: `${color}05` }}
        >
          <p className="text-xs text-gray-500">항목을 추가해 보세요</p>
        </div>
      )}
    </CareerPathTimelineGradeSectionChrome>
  );
}
