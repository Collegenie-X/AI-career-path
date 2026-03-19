'use client';

import { GRADE_YEARS } from '../config';
import { LABELS } from '../config';
import type { CareerPlan, YearPlan } from './CareerPathBuilder';

type PlanSummaryViewProps = {
  plan: CareerPlan;
  sortedYears: YearPlan[];
  totalItems: number;
  checkedItems: number;
  calculateYearStatistics: (year: YearPlan) => { total: number; checked: number };
};

export function PlanSummaryView({
  plan,
  sortedYears,
  totalItems,
  checkedItems,
  calculateYearStatistics,
}: PlanSummaryViewProps) {
  return (
    <div className="px-4 pb-4 space-y-3">
      <div className="rounded-xl p-4 space-y-3"
        style={{
          background: `linear-gradient(135deg, ${plan.starColor}0a 0%, ${plan.starColor}05 100%)`,
          border: `1px solid ${plan.starColor}22`,
        }}>
        <div className="flex items-center justify-between">
          <div className="text-sm font-bold text-white">
            {LABELS.timeline_summary_progress_title as string ?? '진행 현황'}
          </div>
          <div className="text-xs font-bold" style={{ color: plan.starColor }}>
            {totalItems > 0 ? `${Math.round((checkedItems / totalItems) * 100)}%` : '0%'}
          </div>
        </div>
        {totalItems > 0 && (
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(checkedItems / totalItems) * 100}%`, backgroundColor: plan.starColor }} />
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg p-2.5" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
            <div className="text-[12px] text-gray-400">
              {LABELS.timeline_summary_total_label as string ?? '전체 항목'}
            </div>
            <div className="text-lg font-bold text-white mt-0.5">{totalItems}</div>
          </div>
          <div className="rounded-lg p-2.5" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
            <div className="text-[12px] text-gray-400">
              {LABELS.timeline_summary_completed_label as string ?? '완료'}
            </div>
            <div className="text-lg font-bold mt-0.5" style={{ color: plan.starColor }}>{checkedItems}</div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {sortedYears.map((year) => {
          const grade = GRADE_YEARS.find((g) => g.id === year.gradeId);
          const { total: yearTotal, checked: yearChecked } = calculateYearStatistics(year);

          if (yearTotal === 0) return null;

          return (
            <div key={year.gradeId}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl"
              style={{
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: `1px solid ${plan.starColor}18`,
              }}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: `${plan.starColor}22`, color: plan.starColor }}>
                  {year.gradeLabel}
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">{grade?.fullLabel ?? year.gradeLabel}</div>
                  <div className="text-[12px] text-gray-500">{yearChecked}/{yearTotal} 완료</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-12 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${yearTotal > 0 ? (yearChecked / yearTotal) * 100 : 0}%`, backgroundColor: plan.starColor }} />
                </div>
                <span className="text-xs font-bold" style={{ color: plan.starColor }}>
                  {yearTotal > 0 ? `${Math.round((yearChecked / yearTotal) * 100)}%` : '0%'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
