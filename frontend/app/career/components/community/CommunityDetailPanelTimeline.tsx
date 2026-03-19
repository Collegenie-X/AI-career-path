'use client';

import { useState } from 'react';
import { Calendar, Target, ChevronDown, ChevronUp } from 'lucide-react';
import { GRADE_YEARS } from '../../config';
import type { SharedPlanYear, SharedPlanItem, SharedPlanGoalGroup } from './types';
import { PlanItemRowCard, PlanItemDetailSheet } from '../PlanItemDetailSheet';

/* ─── GoalGroupSection ─── */
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
    <div className="space-y-1.5">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-left transition-all"
        style={{ backgroundColor: `${starColor}10`, border: `1px solid ${starColor}1e` }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Target className="w-4 h-4 flex-shrink-0" style={{ color: starColor }} />
          <span className="text-sm font-semibold text-white truncate">{group.goal}</span>
        </div>
        <span className="text-[12px] font-bold text-gray-500 flex-shrink-0">{itemCount}개</span>
        {open
          ? <ChevronUp className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
          : <ChevronDown className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />}
      </button>
      {open && itemCount > 0 && (
        <div className="pl-6 space-y-1">
          {group.items.map(item => (
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              className="w-full text-left transition-all active:scale-[0.98] cursor-pointer"
              onClick={() => onItemSelect(item)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onItemSelect(item); } }}
            >
              <PlanItemRowCard item={item} color={starColor} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── YearSection ─── */
export function CommunityDetailPanelYearSection({
  year,
  starColor,
}: {
  readonly year: SharedPlanYear;
  readonly starColor: string;
}) {
  const [open, setOpen] = useState(true);
  const [selectedItem, setSelectedItem] = useState<SharedPlanItem | null>(null);
  const gradeInfo = GRADE_YEARS.find(g => g.id === year.gradeId);

  const goalGroups = year.goalGroups ?? [];
  const goalCount = goalGroups.length || year.goals.length;
  const itemCount = goalGroups.length > 0
    ? goalGroups.reduce((acc, g) => acc + g.items.length, 0)
    : year.items.length;

  return (
    <div className="relative pl-12">
      <div
        className="absolute left-0 top-0 w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-black z-10"
        style={{ backgroundColor: starColor, color: '#fff', boxShadow: `0 0 0 3px #0e0e24, 0 0 10px ${starColor}55` }}
      >
        {year.gradeLabel}
      </div>
      <div className="absolute left-[17px] top-9 bottom-0 w-0.5" style={{ backgroundColor: `${starColor}20` }} />

      <div className="pb-6">
        <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between pt-1 pb-2">
          <div>
            <div className="text-sm font-bold text-white text-left">{gradeInfo?.fullLabel ?? year.gradeLabel}</div>
            <div className="text-[12px] text-gray-500 text-left">목표 {goalCount}개 · 계획 {itemCount}개</div>
          </div>
          {open
            ? <ChevronUp className="w-4 h-4 text-gray-600 flex-shrink-0" />
            : <ChevronDown className="w-4 h-4 text-gray-600 flex-shrink-0" />}
        </button>

        {open && (
          <div className="space-y-3">
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
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1 text-[12px] font-bold text-gray-500 uppercase tracking-wider">
                      <Target style={{ width: 10, height: 10 }} />목표
                    </div>
                    {year.goals.map((goal, gi) => (
                      <div key={gi} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
                        style={{ backgroundColor: `${starColor}10`, border: `1px solid ${starColor}1e` }}>
                        <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: starColor }} />
                        <span className="text-gray-200">{goal}</span>
                      </div>
                    ))}
                  </div>
                )}
                {year.items.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1 text-[12px] font-bold text-gray-500 uppercase tracking-wider">
                      <Calendar style={{ width: 10, height: 10 }} />활동·수상·자격증
                    </div>
                    {year.items.map(item => (
                      <div key={item.id} role="button" tabIndex={0}
                        className="w-full text-left transition-all active:scale-[0.98] cursor-pointer"
                        onClick={() => setSelectedItem(item)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedItem(item); } }}>
                        <PlanItemRowCard item={item} color={starColor} />
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
