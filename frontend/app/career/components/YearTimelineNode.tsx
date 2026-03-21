'use client';

import { useState, useEffect } from 'react';
import { GRADE_YEARS } from '../config';
import {
  CareerPathGoalHeaderButton,
  CareerPathNestedRail,
  CareerPathPlanGroupHeader,
} from './timeline-dream-path/CareerTimelineCareerPathChrome';
import type { PlanItem, YearPlan } from './CareerPathBuilder';
import {
  ItemRow, QuickAddItem,
  type PlanItemWithCheck,
} from './TimelineItemComponents';

type Props = {
  year: YearPlan & { items: PlanItemWithCheck[] };
  color: string;
  isLast: boolean;
  isEditMode: boolean;
  showCheckboxes?: boolean;
  onUpdateYear: (y: YearPlan) => void;
  onItemInfoClick: (item: PlanItem, gradeLabel: string) => void;
};

export function YearTimelineNode({
  year, color, isEditMode, showCheckboxes = true, onUpdateYear, onItemInfoClick,
}: Props) {
  const [expandedGoalIds, setExpandedGoalIds] = useState<Set<string>>(() => {
    const ids = year.semester === 'split'
      ? (year.semesterPlans ?? []).flatMap(sp => sp.goalGroups.map(g => g.id))
      : (year.goalGroups ?? []).map(g => g.id);
    return new Set(ids);
  });

  const toggleGoalExpand = (goalId: string) => {
    setExpandedGoalIds(prev => {
      const next = new Set(prev);
      if (next.has(goalId)) next.delete(goalId);
      else next.add(goalId);
      return next;
    });
  };

  const goalGroupIdList = year.semester === 'split'
    ? (year.semesterPlans ?? []).flatMap(sp => sp.goalGroups.map(g => g.id)).join(',')
    : (year.goalGroups ?? []).map(g => g.id).join(',');
  useEffect(() => {
    const ids = year.semester === 'split'
      ? (year.semesterPlans ?? []).flatMap(sp => sp.goalGroups.map(g => g.id))
      : (year.goalGroups ?? []).map(g => g.id);
    setExpandedGoalIds(prev => {
      const next = new Set(prev);
      ids.forEach(id => next.add(id));
      return next;
    });
  }, [year.gradeId, goalGroupIdList]);

  const grade = GRADE_YEARS.find((g) => g.id === year.gradeId);
  const groupItems = (year.groups ?? []).flatMap(g => g.items) as PlanItemWithCheck[];

  /** ID·내용 기준 중복 제거 (같은 항목 반복 표시 방지) */
  const dedupeItems = (items: PlanItemWithCheck[]): PlanItemWithCheck[] => {
    const seenIds = new Set<string>();
    const seenContent = new Set<string>();
    return items.filter(it => {
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
    ? (year.semesterPlans ?? []).flatMap(sp => sp.goalGroups.flatMap(g => g.items)) as PlanItemWithCheck[]
    : (year.goalGroups ?? []).flatMap(g => g.items) as PlanItemWithCheck[];

  const idsInGoalGroups = new Set(goalGroupItems.map(it => it.id));
  const ungroupedYearItems = year.items.filter(it => !idsInGoalGroups.has(it.id));

  const checkedCount = [
    ...ungroupedYearItems.filter((it) => (it as PlanItemWithCheck).checked),
    ...groupItems.filter(it => it.checked),
    ...goalGroupItems.filter(it => it.checked),
  ].length;
  const totalCount = ungroupedYearItems.length + groupItems.length + goalGroupItems.length;

  const toggleCheck = (itemId: string) =>
    onUpdateYear({ ...year, items: year.items.map((it) => it.id === itemId ? { ...it, checked: !(it as PlanItemWithCheck).checked } : it) });

  const toggleCheckInGroup = (groupId: string, itemId: string) => {
    const groups = (year.groups ?? []).map(g =>
      g.id === groupId
        ? { ...g, items: g.items.map(it => it.id === itemId ? { ...it, checked: !(it as PlanItemWithCheck).checked } : it) }
        : g
    );
    onUpdateYear({ ...year, groups });
  };

  const toggleCheckInGoalGroup = (groupId: string, itemId: string) => {
    const goalGroups = (year.goalGroups ?? []).map(g =>
      g.id === groupId
        ? { ...g, items: g.items.map(it => it.id === itemId ? { ...it, checked: !(it as PlanItemWithCheck).checked } : it) }
        : g
    );
    onUpdateYear({ ...year, goalGroups });
  };

  const toggleCheckInSemesterPlan = (semesterId: string, groupId: string, itemId: string) => {
    const semesterPlans = (year.semesterPlans ?? []).map(sp =>
      sp.semesterId === semesterId
        ? {
            ...sp,
            goalGroups: sp.goalGroups.map(g =>
              g.id === groupId
                ? { ...g, items: g.items.map(it => it.id === itemId ? { ...it, checked: !(it as PlanItemWithCheck).checked } : it) }
                : g
            ),
          }
        : sp
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
    const groups = (year.groups ?? []).map(g =>
      g.id === groupId ? { ...g, items: g.items.filter(it => it.id !== itemId) } : g
    );
    onUpdateYear({ ...year, groups });
  };

  const saveItemTitle = (itemId: string, title: string) =>
    onUpdateYear({ ...year, items: year.items.map((it) => it.id === itemId ? { ...it, title } : it) });

  const saveItemTitleInGroup = (groupId: string, itemId: string, title: string) => {
    const groups = (year.groups ?? []).map(g =>
      g.id === groupId ? { ...g, items: g.items.map(it => it.id === itemId ? { ...it, title } : it) } : g
    );
    onUpdateYear({ ...year, groups });
  };

  const addItem = (title: string, type: PlanItem['type']) => {
    const newItem: PlanItemWithCheck = {
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type, title, months: [3], difficulty: 2, cost: '무료', organizer: '',
    };
    onUpdateYear({ ...year, items: [...year.items, newItem] });
  };

  return (
    <div className="relative pl-14 pb-6">
      <div className="absolute left-0 top-0 w-11 h-11 rounded-full flex items-center justify-center text-sm font-black z-10 select-none"
        style={{ backgroundColor: color, color: '#fff', boxShadow: `0 0 0 4px rgba(10,10,30,1), 0 0 14px ${color}55` }}>
        {year.gradeLabel}
      </div>

      <div className="space-y-3">
        {/* Header */}
        <div className="pt-1.5 flex items-start justify-between gap-2">
          <div>
            <div className="text-base font-bold text-white">{grade?.fullLabel ?? year.gradeLabel}</div>
            <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
              {totalCount > 0 && <span>{checkedCount}/{totalCount} 완료</span>}
            </div>
          </div>
          {totalCount > 0 && (
            <div className="flex-shrink-0 mt-2">
              <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${(checkedCount / totalCount) * 100}%`, backgroundColor: color }} />
              </div>
            </div>
          )}
        </div>

        {/* Groups (PlanGroup) — 커리어 패스 상세와 동일: 이중 박스 테두리 없이 헤더 + 세로 레일 */}
        {(year.groups ?? []).length > 0 && (
          <div className="space-y-3">
            {(year.groups ?? []).map((group) => (
              <div key={group.id} className="space-y-1">
                <CareerPathPlanGroupHeader
                  accentColor={color}
                  label={group.label}
                  itemCount={group.items.length}
                />
                {group.items.length > 0 && (
                  <CareerPathNestedRail accentColor={color}>
                    {dedupeItems(group.items as PlanItemWithCheck[]).map((item) => (
                      <ItemRow
                        key={item.id}
                        item={item}
                        color={color}
                        isEditMode={isEditMode}
                        showCheckbox={showCheckboxes}
                        useLightBorder
                        onToggleCheck={() => toggleCheckInGroup(group.id, item.id)}
                        onDelete={() => deleteItemFromGroup(group.id, item.id)}
                        onTitleSave={(title) => saveItemTitleInGroup(group.id, item.id, title)}
                        onInfoClick={() => onItemInfoClick(item, year.gradeLabel)}
                        onToggleSubItemDone={!isEditMode ? (_, subId) => updateItemSubItem(item.id, subId) : undefined}
                      />
                    ))}
                  </CareerPathNestedRail>
                )}
              </div>
            ))}
          </div>
        )}

        {/* goalGroups 구조 (semester !== 'split') — 트리 선 연결, 테두리 연하게 */}
        {year.semester !== 'split' && (year.goalGroups ?? []).filter(g => (g.items ?? []).length > 0).length > 0 && (
          <div className="space-y-3">
            {(year.goalGroups ?? []).filter(g => (g.items ?? []).length > 0).map((group) => {
              const isExpanded = expandedGoalIds.has(group.id);
              const goalCount = (year.goalGroups ?? []).filter(g => (g.items ?? []).length > 0).length;
              const showAccordionIcon = goalCount > 1;
              return (
              <div key={group.id} className="space-y-1">
                {showAccordionIcon ? (
                  <CareerPathGoalHeaderButton
                    accentColor={color}
                    title={group.goal}
                    itemCount={group.items.length}
                    isExpanded={isExpanded}
                    showChevron
                    onToggle={() => toggleGoalExpand(group.id)}
                    variant="accordion"
                  />
                ) : (
                  <CareerPathGoalHeaderButton
                    accentColor={color}
                    title={group.goal}
                    itemCount={group.items.length}
                    variant="static"
                  />
                )}
                {(showAccordionIcon ? isExpanded : true) && group.items.length > 0 && (
                  <CareerPathNestedRail accentColor={color}>
                    {dedupeItems(group.items as PlanItemWithCheck[]).map((item) => (
                      <ItemRow
                        key={item.id}
                        item={item}
                        color={color}
                        isEditMode={isEditMode}
                        showCheckbox={showCheckboxes}
                        useLightBorder
                        onToggleCheck={() => toggleCheckInGoalGroup(group.id, item.id)}
                        onDelete={() => {}}
                        onTitleSave={() => {}}
                        onInfoClick={() => onItemInfoClick(item, year.gradeLabel)}
                        onToggleSubItemDone={!isEditMode ? (_, subId) => updateItemSubItem(item.id, subId) : undefined}
                      />
                    ))}
                  </CareerPathNestedRail>
                )}
              </div>
              );
            })}
          </div>
        )}

        {/* semesterPlans 구조 (semester === 'split') — 트리 선 연결, 테두리 연하게 */}
        {year.semester === 'split' && (year.semesterPlans ?? []).length > 0 && (
          <div className="space-y-3">
            {(year.semesterPlans ?? []).map((sp) => (
              <div key={sp.semesterId} className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">{sp.semesterId === 'first' ? '🌸' : '🍂'}</span>
                  <span className="text-[12px] font-bold text-gray-400">{sp.semesterLabel}</span>
                  <div className="flex-1 h-px" style={{ backgroundColor: `${color}20` }} />
                </div>
                {sp.goalGroups.filter(g => (g.items ?? []).length > 0).map((group) => {
                  const isExpanded = expandedGoalIds.has(group.id);
                  const goalCountInSemester = sp.goalGroups.filter(g => (g.items ?? []).length > 0).length;
                  const showAccordionIcon = goalCountInSemester > 1;
                  return (
                  <div key={group.id} className="space-y-1">
                    {showAccordionIcon ? (
                      <CareerPathGoalHeaderButton
                        accentColor={color}
                        title={group.goal}
                        itemCount={group.items.length}
                        isExpanded={isExpanded}
                        showChevron
                        onToggle={() => toggleGoalExpand(group.id)}
                        variant="accordion"
                      />
                    ) : (
                      <CareerPathGoalHeaderButton
                        accentColor={color}
                        title={group.goal}
                        itemCount={group.items.length}
                        variant="static"
                      />
                    )}
                    {(showAccordionIcon ? isExpanded : true) && group.items.length > 0 && (
                      <CareerPathNestedRail accentColor={color}>
                        {dedupeItems(group.items as PlanItemWithCheck[]).map((item) => (
                          <ItemRow
                            key={item.id}
                            item={item}
                            color={color}
                            isEditMode={isEditMode}
                            showCheckbox={showCheckboxes}
                            useLightBorder
                            onToggleCheck={() => toggleCheckInSemesterPlan(sp.semesterId, group.id, item.id)}
                            onDelete={() => {}}
                            onTitleSave={() => {}}
                            onInfoClick={() => onItemInfoClick(item, year.gradeLabel)}
                            onToggleSubItemDone={!isEditMode ? (_, subId) => updateItemSubItem(item.id, subId) : undefined}
                          />
                        ))}
                      </CareerPathNestedRail>
                    )}
                  </div>
                  );
                })}
                {sp.goalGroups.filter(g => (g.items ?? []).length > 0).length === 0 && (
                  <p className="text-xs text-gray-600 pl-2">이 학기에 계획이 없어요</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Ungrouped items (직접 추가 항목) — 트리 선 연결, 테두리 연하게 */}
        {(() => {
          if (ungroupedYearItems.length === 0 && !isEditMode) return null;
          return (
            <CareerPathNestedRail accentColor={color}>
              {ungroupedYearItems.map((item) => (
                <ItemRow key={item.id} item={item} color={color} isEditMode={isEditMode}
                  showCheckbox={showCheckboxes}
                  useLightBorder
                  onToggleCheck={() => toggleCheck(item.id)}
                  onDelete={() => deleteItem(item.id)}
                  onTitleSave={(title) => saveItemTitle(item.id, title)}
                  onInfoClick={() => onItemInfoClick(item, year.gradeLabel)}
                  onToggleSubItemDone={!isEditMode ? (_, subId) => updateItemSubItem(item.id, subId) : undefined} />
              ))}
              {isEditMode && <QuickAddItem color={color} onAdd={addItem} />}
            </CareerPathNestedRail>
          );
        })()}

        {totalCount === 0 && isEditMode && (
          <div className="text-center py-3 rounded-xl"
            style={{ border: `1px dashed ${color}28`, backgroundColor: `${color}05` }}>
            <p className="text-xs text-gray-500">항목을 추가해 보세요</p>
          </div>
        )}
      </div>
    </div>
  );
}
