'use client';

import { Target } from 'lucide-react';
import { GRADE_YEARS } from '../config';
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
  onUpdateYear: (y: YearPlan) => void;
  onItemInfoClick: (item: PlanItem, gradeLabel: string) => void;
};

export function YearTimelineNode({
  year, color, isEditMode, onUpdateYear, onItemInfoClick,
}: Props) {
  const grade = GRADE_YEARS.find((g) => g.id === year.gradeId);
  const groupItems = (year.groups ?? []).flatMap(g => g.items) as PlanItemWithCheck[];

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

        {/* Groups (PlanGroup 구조) */}
        {(year.groups ?? []).length > 0 && (
          <div className="space-y-2">
            {(year.groups ?? []).map((group) => (
              <div key={group.id} className="rounded-2xl overflow-hidden"
                style={{ border: `1px solid ${color}28`, backgroundColor: `${color}06` }}>
                <div className="flex items-center gap-2 px-3 py-2"
                  style={{ borderBottom: group.items.length > 0 ? `1px solid ${color}18` : 'none' }}>
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                  <span className="flex-1 text-xs font-bold" style={{ color }}>{group.label}</span>
                  <span className="text-[10px] text-gray-600">{group.items.length}개</span>
                </div>
                {group.items.length > 0 && (
                  <div className="px-3 py-2 space-y-1.5">
                    {(group.items as PlanItemWithCheck[]).map((item) => (
                      <ItemRow
                        key={item.id}
                        item={item}
                        color={color}
                        isEditMode={isEditMode}
                        onToggleCheck={() => toggleCheckInGroup(group.id, item.id)}
                        onDelete={() => deleteItemFromGroup(group.id, item.id)}
                        onTitleSave={(title) => saveItemTitleInGroup(group.id, item.id, title)}
                        onInfoClick={() => onItemInfoClick(item, year.gradeLabel)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* goalGroups 구조 (semester !== 'split') */}
        {year.semester !== 'split' && (year.goalGroups ?? []).length > 0 && (
          <div className="space-y-2">
            {(year.goalGroups ?? []).map((group) => (
              <div key={group.id} className="rounded-2xl overflow-hidden"
                style={{ border: `1px solid ${color}28`, backgroundColor: `${color}06` }}>
                <div className="flex items-center gap-2 px-3 py-2"
                  style={{ borderBottom: group.items.length > 0 ? `1px solid ${color}18` : 'none' }}>
                  <Target style={{ width: 11, height: 11, color, flexShrink: 0 }} />
                  <span className="flex-1 text-xs font-bold" style={{ color }}>{group.goal}</span>
                  <span className="text-[10px] text-gray-600">{group.items.length}개</span>
                </div>
                {group.items.length > 0 && (
                  <div className="px-3 py-2 space-y-1.5">
                    {(group.items as PlanItemWithCheck[]).map((item) => (
                      <ItemRow
                        key={item.id}
                        item={item}
                        color={color}
                        isEditMode={isEditMode}
                        onToggleCheck={() => toggleCheckInGoalGroup(group.id, item.id)}
                        onDelete={() => {}}
                        onTitleSave={() => {}}
                        onInfoClick={() => onItemInfoClick(item, year.gradeLabel)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* semesterPlans 구조 (semester === 'split') */}
        {year.semester === 'split' && (year.semesterPlans ?? []).length > 0 && (
          <div className="space-y-3">
            {(year.semesterPlans ?? []).map((sp) => (
              <div key={sp.semesterId} className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">{sp.semesterId === 'first' ? '🌸' : '🍂'}</span>
                  <span className="text-[11px] font-bold text-gray-400">{sp.semesterLabel}</span>
                  <div className="flex-1 h-px" style={{ backgroundColor: `${color}20` }} />
                </div>
                {sp.goalGroups.map((group) => (
                  <div key={group.id} className="rounded-2xl overflow-hidden"
                    style={{ border: `1px solid ${color}28`, backgroundColor: `${color}06` }}>
                    <div className="flex items-center gap-2 px-3 py-2"
                      style={{ borderBottom: group.items.length > 0 ? `1px solid ${color}18` : 'none' }}>
                      <Target style={{ width: 11, height: 11, color, flexShrink: 0 }} />
                      <span className="flex-1 text-xs font-bold" style={{ color }}>{group.goal}</span>
                      <span className="text-[10px] text-gray-600">{group.items.length}개</span>
                    </div>
                    {group.items.length > 0 && (
                      <div className="px-3 py-2 space-y-1.5">
                        {(group.items as PlanItemWithCheck[]).map((item) => (
                          <ItemRow
                            key={item.id}
                            item={item}
                            color={color}
                            isEditMode={isEditMode}
                            onToggleCheck={() => toggleCheckInSemesterPlan(sp.semesterId, group.id, item.id)}
                            onDelete={() => {}}
                            onTitleSave={() => {}}
                            onInfoClick={() => onItemInfoClick(item, year.gradeLabel)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {sp.goalGroups.length === 0 && (
                  <p className="text-xs text-gray-600 pl-2">이 학기에 계획이 없어요</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Ungrouped items (직접 추가 항목) — goalGroups에 이미 포함된 항목 제외하여 이중 표시 방지 */}
        {(() => {
          if (ungroupedYearItems.length === 0 && !isEditMode) return null;
          return (
            <div className="space-y-2">
              {ungroupedYearItems.map((item) => (
                <ItemRow key={item.id} item={item} color={color} isEditMode={isEditMode}
                  onToggleCheck={() => toggleCheck(item.id)}
                  onDelete={() => deleteItem(item.id)}
                  onTitleSave={(title) => saveItemTitle(item.id, title)}
                  onInfoClick={() => onItemInfoClick(item, year.gradeLabel)} />
              ))}
              {isEditMode && <QuickAddItem color={color} onAdd={addItem} />}
            </div>
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
