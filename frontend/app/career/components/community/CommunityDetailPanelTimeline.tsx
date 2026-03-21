'use client';

import { useState } from 'react';
import { Calendar, Target, ChevronDown, ChevronUp } from 'lucide-react';
import { GRADE_YEARS } from '../../config';
import type { SharedPlanYear, SharedPlanItem, SharedPlanGoalGroup } from './types';
import { PlanItemRowCard, PlanItemDetailSheet } from '../PlanItemDetailSheet';

/* ─── Compact progress bar (학년 헤더용 — 진행률 바만) ─── */
function CompactProgressBar({
  doneCount,
  totalCount,
  color,
}: {
  doneCount: number;
  totalCount: number;
  color: string;
}) {
  const percent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
  return (
    <div
      className="h-1 rounded-full overflow-hidden flex-shrink-0"
      style={{ width: 48, backgroundColor: 'rgba(255,255,255,0.08)' }}
    >
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{ width: `${percent}%`, backgroundColor: color }}
      />
    </div>
  );
}

/* ─── 학년별 subItems 진행률 계산 ─── */
function computeYearProgress(year: SharedPlanYear): { doneCount: number; totalCount: number } {
  const items = year.goalGroups?.flatMap((g) => g.items) ?? year.items;
  let doneCount = 0;
  let totalCount = 0;
  for (const item of items) {
    const subs = item.subItems ?? [];
    totalCount += subs.length;
    doneCount += subs.filter((s) => s.done).length;
  }
  return { doneCount, totalCount };
}

/* ─── GoalGroupSection (테두리 최소화, 트리 하위 항목으로 연결) ─── */
function GoalGroupSection({
  group,
  starColor,
  gradeLabel,
  onItemSelect,
}: {
  readonly group: SharedPlanGoalGroup;
  readonly starColor: string;
  readonly gradeLabel: string;
  readonly onItemSelect: (item: SharedPlanItem) => void;
}) {
  const [open, setOpen] = useState(true);
  const itemCount = group.items.length;

  return (
    <div className="space-y-1">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-left transition-all hover:bg-white/[0.03]"
        style={{ backgroundColor: `${starColor}08` }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Target className="w-3.5 h-3.5 flex-shrink-0 opacity-80" style={{ color: starColor }} />
          <span className="text-sm font-semibold text-white truncate">{group.goal}</span>
        </div>
        <span className="text-[11px] font-bold text-gray-500 flex-shrink-0">{itemCount}개</span>
        {open
          ? <ChevronUp className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
          : <ChevronDown className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />}
      </button>
      {open && itemCount > 0 && (
        <div className="pl-4 space-y-1 ml-2 border-l-2" style={{ borderColor: `${starColor}25` }}>
          {group.items.map(item => (
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              className="w-full text-left transition-all active:scale-[0.99] cursor-pointer py-0.5"
              onClick={() => onItemSelect(item)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onItemSelect(item); } }}
            >
              <PlanItemRowCard item={item} color={starColor} variant="minimal" showTodoReadOnly />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── YearSection (상하 연속 트리: 단일 세로선으로 학년 연결) ─── */
export function CommunityDetailPanelYearSection({
  year,
  starColor,
  isLast,
}: {
  readonly year: SharedPlanYear;
  readonly starColor: string;
  readonly isLast?: boolean;
}) {
  const [open, setOpen] = useState(true);
  const [selectedItem, setSelectedItem] = useState<SharedPlanItem | null>(null);
  const gradeInfo = GRADE_YEARS.find(g => g.id === year.gradeId);

  const goalGroups = year.goalGroups ?? [];
  const { doneCount: yearDoneCount, totalCount: yearTotalCount } = computeYearProgress(year);

  return (
    <div className="relative pl-11">
      {/* 트리 노드: 학년 원형 */}
      <div
        className="absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black z-10"
        style={{
          backgroundColor: starColor,
          color: '#fff',
          boxShadow: `0 0 0 2px rgb(var(--background)), 0 0 8px ${starColor}40`,
        }}
      >
        {year.gradeLabel}
      </div>
      {/* 상하 연결선 (마지막 학년이 아닐 때만, 다음 학년 노드까지 연장) */}
      {!isLast && (
        <div
          className="absolute left-[15px] top-8 w-0.5"
          style={{
            backgroundColor: `${starColor}25`,
            bottom: '-1.5rem',
          }}
        />
      )}

      <div className="pb-5">
        <button
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center justify-between gap-2 pt-0.5 pb-2 text-left"
        >
          <div className="text-sm font-bold text-white">{gradeInfo?.fullLabel ?? year.gradeLabel}</div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <CompactProgressBar
              doneCount={yearDoneCount}
              totalCount={Math.max(yearTotalCount, 1)}
              color={starColor}
            />
            {open
              ? <ChevronUp className="w-4 h-4 text-gray-500" />
              : <ChevronDown className="w-4 h-4 text-gray-500" />}
          </div>
        </button>

        {open && (
          <div className="space-y-2.5">
            {goalGroups.length > 0 ? (
              goalGroups.map((group, gi) => (
                <GoalGroupSection
                  key={gi}
                  group={group}
                  starColor={starColor}
                  gradeLabel={gradeInfo?.fullLabel ?? year.gradeLabel}
                  onItemSelect={setSelectedItem}
                />
              ))
            ) : (
              <>
                {year.goals.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      <Target style={{ width: 9, height: 9 }} />목표
                    </div>
                    {year.goals.map((goal, gi) => (
                      <div
                        key={gi}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs"
                        style={{ backgroundColor: `${starColor}08` }}
                      >
                        <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: starColor }} />
                        <span className="text-gray-200">{goal}</span>
                      </div>
                    ))}
                  </div>
                )}
                {year.items.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      <Calendar style={{ width: 9, height: 9 }} />활동·수상·자격증
                    </div>
                    {year.items.map(item => (
                      <div
                        key={item.id}
                        role="button"
                        tabIndex={0}
                        className="w-full text-left transition-all active:scale-[0.99] cursor-pointer"
                        onClick={() => setSelectedItem(item)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedItem(item); } }}
                      >
                        <PlanItemRowCard item={item} color={starColor} variant="minimal" showTodoReadOnly />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {selectedItem && (
        <PlanItemDetailSheet
          item={selectedItem}
          gradeLabel={gradeInfo?.fullLabel ?? year.gradeLabel}
          color={starColor}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
