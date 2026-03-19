'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { GRADE_YEARS } from '../config';
import type { CareerPlan, PlanItem, YearPlan } from './CareerPathBuilder';
import { ItemDetailDialog } from './ItemDetailDialog';
import type { ShareType } from './community/types';
import { YearTimelineNode } from './YearTimelineNode';
import type { PlanItemWithCheck } from './TimelineItemComponents';
import { PlanActionBar } from './PlanActionBar';
import { calculateYearStatistics } from '../utils/planStatisticsCalculator';

type TimelineDetailPanelProps = {
  readonly plan: CareerPlan;
  readonly onClose: () => void;
  readonly onEdit: (plan: CareerPlan) => void;
  readonly onUpdatePlan: (plan: CareerPlan) => void;
  readonly onDeletePlan: (planId: string) => void;
  readonly onSharePlan?: (plan: CareerPlan, isPublic: boolean, shareType?: ShareType) => void;
  readonly onOpenShareDialog?: (plan: CareerPlan) => void;
};

export function TimelineDetailPanel({
  plan,
  onClose,
  onEdit,
  onUpdatePlan,
  onDeletePlan,
  onOpenShareDialog,
}: TimelineDetailPanelProps) {
  const [detailItem, setDetailItem] = useState<{ item: PlanItem; gradeLabel: string } | null>(null);
  const [showChecklistView, setShowChecklistView] = useState(false);

  const gradeOrder = GRADE_YEARS.reduce(
    (acc, g, i) => { acc[g.id] = i; return acc; },
    {} as Record<string, number>
  );
  const sortedYears = [...plan.years].sort(
    (a, b) => (gradeOrder[a.gradeId] ?? 0) - (gradeOrder[b.gradeId] ?? 0)
  );

  const { totalItems, checkedItems } = plan.years.reduce(
    (acc, year) => {
      const stats = calculateYearStatistics(year);
      return {
        totalItems: acc.totalItems + stats.total,
        checkedItems: acc.checkedItems + stats.checked,
      };
    },
    { totalItems: 0, checkedItems: 0 }
  );

  const updateYear = (updatedYear: YearPlan) =>
    onUpdatePlan({ ...plan, years: plan.years.map(y => y.gradeId === updatedYear.gradeId ? updatedYear : y) });

  const findPlanColorForItem = (itemId: string): string => {
    const found = plan.years.some(y => {
      if (y.items.some(it => it.id === itemId)) return true;
      if ((y.groups ?? []).some(g => g.items.some(it => it.id === itemId))) return true;
      if (y.semester === 'split') {
        return (y.semesterPlans ?? []).some(sp => sp.goalGroups.some(g => g.items.some(it => it.id === itemId)));
      }
      return (y.goalGroups ?? []).some(g => g.items.some(it => it.id === itemId));
    });
    return found ? plan.starColor : '#6C5CE7';
  };

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ── */}
      <div
        className="flex-shrink-0 px-5 py-4"
        style={{
          background: `linear-gradient(135deg, ${plan.starColor}28, ${plan.starColor}0a)`,
          borderBottom: `1px solid ${plan.starColor}30`,
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className="rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
            style={{
              width: 52, height: 52,
              background: `linear-gradient(135deg, ${plan.starColor}40, ${plan.starColor}18)`,
              border: `1.5px solid ${plan.starColor}44`,
            }}
          >
            {plan.jobEmoji}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-white leading-snug">{plan.title}</h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs font-semibold" style={{ color: `${plan.starColor}cc` }}>
                {plan.starEmoji} {plan.starName}
              </span>
              <span className="text-xs text-gray-600">·</span>
              <span className="text-xs text-gray-500">{plan.years.length}개 학년</span>
              {totalItems > 0 && (
                <>
                  <span className="text-xs text-gray-600">·</span>
                  <span className="text-xs text-gray-500">{checkedItems}/{totalItems} 완료</span>
                </>
              )}
            </div>
            {totalItems > 0 && (
              <div className="mt-2 w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${(checkedItems / totalItems) * 100}%`, backgroundColor: plan.starColor }}
                />
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 md:hidden"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
            title="닫기"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* ── Action bar ── */}
      <div style={{ borderBottom: `1px solid ${plan.starColor}22` }}>
        <PlanActionBar
          plan={plan}
          showChecklistView={showChecklistView}
          onEdit={() => onEdit(plan)}
          onDelete={() => onDeletePlan(plan.id)}
          onOpenShareDialog={() => onOpenShareDialog?.(plan)}
          onToggleChecklistView={() => setShowChecklistView(!showChecklistView)}
        />
      </div>

      {/* ── Scrollable timeline body ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="relative px-4 py-4">
          <div
            className="absolute left-[38px] top-0 bottom-4 w-0.5"
            style={{ backgroundColor: `${plan.starColor}28` }}
          />
          <div className="space-y-0">
            {sortedYears.map((year, idx) => (
              <YearTimelineNode
                key={year.gradeId}
                year={year as YearPlan & { items: PlanItemWithCheck[] }}
                color={plan.starColor}
                isLast={idx === sortedYears.length - 1}
                isEditMode={false}
                showCheckboxes={showChecklistView}
                onUpdateYear={updateYear}
                onItemInfoClick={(item, gradeLabel) => setDetailItem({ item, gradeLabel })}
              />
            ))}
          </div>
        </div>
      </div>

      {detailItem && (
        <ItemDetailDialog
          item={detailItem.item}
          gradeLabel={detailItem.gradeLabel}
          color={findPlanColorForItem(detailItem.item.id)}
          onClose={() => setDetailItem(null)}
        />
      )}
    </div>
  );
}
