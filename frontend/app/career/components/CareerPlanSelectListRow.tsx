'use client';

import { ChevronRight } from 'lucide-react';
import type { CareerPlan } from './CareerPathBuilder';
import { LABELS } from '../config';
import { calculateCareerPlanStatistics } from '../utils/planStatisticsCalculator';
import { formatRelativeTimeAgoKo } from '@/lib/career-path/formatRelativeTimeAgoKo';

type CareerPlanSelectListRowProps = {
  plan: CareerPlan;
  isSelected: boolean;
  onSelect: () => void;
};

export function CareerPlanSelectListRow({ plan, isSelected, onSelect }: CareerPlanSelectListRowProps) {
  const { totalItems, checkedItems, completionPercent } = calculateCareerPlanStatistics(plan);
  const descriptionPreview = (plan.description ?? '').trim().slice(0, 72);
  const rowBadge = String(LABELS.my_path_list_row_badge ?? '나의 로드맵');
  const openAria = String(LABELS.my_path_list_row_open_aria ?? '상세 보기');

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`${plan.title} — ${openAria}`}
      className="w-full rounded-none border px-3 py-3 text-left transition-all active:scale-[0.995] md:px-3.5 md:py-3.5"
      style={{
        background: isSelected
          ? 'linear-gradient(90deg, rgba(108,92,231,0.18) 0%, rgba(99,102,241,0.08) 100%)'
          : 'rgba(255,255,255,0.03)',
        borderColor: isSelected ? 'rgba(129,140,248,0.55)' : 'rgba(255,255,255,0.1)',
        boxShadow: isSelected ? 'inset 3px 0 0 0 rgba(167,139,250,0.85)' : undefined,
      }}
    >
      <div className="flex items-stretch gap-3">
        <div className="flex flex-shrink-0 flex-col items-center gap-1.5 pt-0.5">
          <div
            className="flex h-11 w-11 items-center justify-center text-xl leading-none"
            style={{
              backgroundColor: `${plan.starColor}22`,
              border: `1px solid ${plan.starColor}44`,
              borderRadius: '2px',
            }}
          >
            {plan.jobEmoji}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="truncate text-sm font-bold text-white">{rowBadge}</span>
            <span
              className="flex-shrink-0 px-1.5 py-0.5 text-[13px] font-bold"
              style={{
                borderRadius: '2px',
                backgroundColor: `${plan.starColor}18`,
                color: plan.starColor,
              }}
            >
              {plan.starEmoji} {plan.starName}
            </span>
            <span className="text-[13px] text-gray-500">{formatRelativeTimeAgoKo(plan.createdAt)}</span>
          </div>

          <h4 className="mb-1 line-clamp-2 text-[15px] font-black leading-snug text-white">{plan.title}</h4>

          {descriptionPreview.length > 0 && (
            <p className="mb-2 line-clamp-1 text-[13px] leading-relaxed text-gray-500">{descriptionPreview}</p>
          )}

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-gray-400">
            <span>
              <span className="text-gray-500">{LABELS.my_path_list_row_items_label ?? '항목'}</span>{' '}
              <span className="font-semibold text-gray-300">{totalItems}</span>
            </span>
            <span className="text-white/20">|</span>
            <span>
              <span className="text-gray-500">{plan.years.length}</span>
              <span className="text-gray-500"> {LABELS.my_path_list_row_years_suffix ?? '학년'}</span>
            </span>
            {totalItems > 0 && (
              <>
                <span className="text-white/20">|</span>
                <span className="font-semibold text-gray-300">
                  {checkedItems}/{totalItems} {LABELS.timeline_summary_completed_label ?? '완료'}
                </span>
              </>
            )}
          </div>

          {totalItems > 0 && (
            <div
              className="mt-2 h-1 w-full max-w-full overflow-hidden rounded-full"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${completionPercent}%`, backgroundColor: plan.starColor }}
              />
            </div>
          )}
        </div>

        <div className="flex flex-shrink-0 items-center self-center">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full border transition-colors"
            style={{
              borderColor: isSelected ? 'rgba(167,139,250,0.45)' : 'rgba(255,255,255,0.12)',
              backgroundColor: isSelected ? 'rgba(108,92,231,0.2)' : 'rgba(255,255,255,0.04)',
            }}
            aria-hidden
          >
            <ChevronRight className="h-4 w-4 text-violet-200/90" />
          </span>
        </div>
      </div>
    </button>
  );
}
