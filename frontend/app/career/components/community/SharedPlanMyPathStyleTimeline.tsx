'use client';

/**
 * 커뮤니티 공유 패스 상세 — 내 패스(TimelineDetailPanel)와 동일한 타임라인 UI 재사용
 */

import { useMemo, useState } from 'react';
import { GRADE_YEARS } from '../../config';
import type { PlanItem, YearPlan } from '../CareerPathBuilder';
import { YearTimelineNode } from '../YearTimelineNode';
import { ItemDetailDialog } from '../ItemDetailDialog';
import type { PlanItemWithCheck } from '../TimelineItemComponents';
import type { SharedPlan } from './types';
import { mapSharedPlanToCareerPlanForMyPathStyleView } from '@/lib/career-path/mapSharedPlanToCareerPlanForMyPathStyleView';

type SharedPlanMyPathStyleTimelineProps = {
  readonly sharedPlan: SharedPlan;
};

export function SharedPlanMyPathStyleTimeline({ sharedPlan }: SharedPlanMyPathStyleTimelineProps) {
  const careerPlan = useMemo(
    () => mapSharedPlanToCareerPlanForMyPathStyleView(sharedPlan),
    [sharedPlan],
  );
  const [detailItem, setDetailItem] = useState<{ item: PlanItem; gradeLabel: string } | null>(null);

  const gradeOrder = GRADE_YEARS.reduce(
    (acc, g, i) => {
      acc[g.id] = i;
      return acc;
    },
    {} as Record<string, number>,
  );
  const sortedYears = [...careerPlan.years].sort(
    (a, b) => (gradeOrder[a.gradeId] ?? 0) - (gradeOrder[b.gradeId] ?? 0),
  );

  const handleReadOnlyYearUpdate = (_y: YearPlan) => {};

  const findPlanColorForItem = (itemId: string): string => {
    const found = careerPlan.years.some((y) => {
      if (y.items.some((it) => it.id === itemId)) return true;
      if ((y.groups ?? []).some((g) => g.items.some((it) => it.id === itemId))) return true;
      if (y.semester === 'split') {
        return (y.semesterPlans ?? []).some((sp) =>
          sp.goalGroups.some((g) => g.items.some((it) => it.id === itemId)),
        );
      }
      return (y.goalGroups ?? []).some((g) => g.items.some((it) => it.id === itemId));
    });
    return found ? careerPlan.starColor : '#6C5CE7';
  };

  if (sortedYears.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="text-4xl mb-3">📭</div>
        <p className="text-sm text-gray-500">상세 계획 정보가 없어요</p>
      </div>
    );
  }

  return (
    <>
      <div className="relative px-4 py-4">
        <div
          className="absolute left-[38px] top-0 bottom-4 w-0.5"
          style={{ backgroundColor: `${careerPlan.starColor}28` }}
        />
        <div className="space-y-0">
          {sortedYears.map((year, idx) => (
            <YearTimelineNode
              key={year.gradeId}
              year={year as YearPlan & { items: PlanItemWithCheck[] }}
              color={careerPlan.starColor}
              isLast={idx === sortedYears.length - 1}
              isEditMode={false}
              showCheckboxes={false}
              onUpdateYear={handleReadOnlyYearUpdate}
              onItemInfoClick={(item, gradeLabel) => setDetailItem({ item, gradeLabel })}
            />
          ))}
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
    </>
  );
}
