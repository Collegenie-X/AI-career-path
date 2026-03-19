'use client';

import { useEffect, useState } from 'react';
import { Plus, ChevronDown } from 'lucide-react';
import { GRADE_YEARS, LABELS } from '../config';
import type { CareerPlan, PlanItem, YearPlan } from './CareerPathBuilder';
import { ItemDetailDialog } from './ItemDetailDialog';
import type { ShareType } from './community/types';
import { YearTimelineNode } from './YearTimelineNode';
import type { PlanItemWithCheck } from './TimelineItemComponents';
import { PlanActionBar } from './PlanActionBar';
import { calculateYearStatistics } from '../utils/planStatisticsCalculator';

/* ─── Types ─── */
type Props = {
  allPlans: CareerPlan[];
  onEdit: (plan: CareerPlan) => void;
  onUpdatePlan: (plan: CareerPlan) => void;
  onDeletePlan: (planId: string) => void;
  onNewPlan: () => void;
  preferredOpenPlanId?: string | null;
  onSharePlan?: (plan: CareerPlan, isPublic: boolean, shareType?: ShareType) => void;
  onOpenShareDialog?: (plan: CareerPlan) => void;
};

/* ─── Single plan accordion card ─── */
function PlanAccordionCard({
  plan, isOpen, onToggle, onEdit, onDelete, onUpdatePlan, onItemInfoClick, onOpenShareDialog,
}: {
  plan: CareerPlan; isOpen: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onUpdatePlan: (p: CareerPlan) => void;
  onItemInfoClick: (item: PlanItem, gradeLabel: string) => void;
  onOpenShareDialog: () => void;
}) {
  const gradeOrder = GRADE_YEARS.reduce((acc, g, i) => { acc[g.id] = i; return acc; }, {} as Record<string, number>);
  const sortedYears = [...plan.years].sort((a, b) => (gradeOrder[a.gradeId] ?? 0) - (gradeOrder[b.gradeId] ?? 0));

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
    onUpdatePlan({ ...plan, years: plan.years.map((y) => y.gradeId === updatedYear.gradeId ? updatedYear : y) });

  const [editablePlanTitle, setEditablePlanTitle] = useState(plan.title);
  const [showChecklistView, setShowChecklistView] = useState(false);

  useEffect(() => {
    setEditablePlanTitle(plan.title);
  }, [plan.title]);

  const savePlanTitle = () => {
    const trimmedTitle = editablePlanTitle.trim();
    if (!trimmedTitle) {
      setEditablePlanTitle(plan.title);
      return;
    }
    if (trimmedTitle === plan.title) return;
    onUpdatePlan({ ...plan, title: trimmedTitle });
  };

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-200"
      style={{
        border: `1.5px solid ${isOpen ? plan.starColor + '55' : 'rgba(255,255,255,0.08)'}`,
        background: isOpen
          ? `linear-gradient(180deg, ${plan.starColor}14 0%, ${plan.starColor}06 100%)`
          : 'rgba(255,255,255,0.03)',
      }}
    >
      {/* Header row */}
      <div
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all cursor-pointer"
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('input')) return;
          onToggle();
        }}
      >
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{
            background: isOpen
              ? `linear-gradient(135deg, ${plan.starColor}33, ${plan.starColor}18)`
              : 'rgba(255,255,255,0.06)',
            border: isOpen ? `1.5px solid ${plan.starColor}55` : '1.5px solid rgba(255,255,255,0.1)',
          }}
        >
          {plan.jobEmoji}
        </div>

        <div className="flex-1 min-w-0">
          {isOpen ? (
            <input
              value={editablePlanTitle}
              onChange={(event) => setEditablePlanTitle(event.target.value)}
              onBlur={savePlanTitle}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  savePlanTitle();
                  (event.target as HTMLInputElement).blur();
                }
                if (event.key === 'Escape') {
                  setEditablePlanTitle(plan.title);
                  (event.target as HTMLInputElement).blur();
                }
              }}
              placeholder={(LABELS.explore_use_path_dialog_title_placeholder as string) ?? '나만의 패스 제목 입력'}
              className="w-full h-8 px-2 rounded-lg font-bold text-white text-sm leading-snug outline-none"
              style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: `1px solid ${plan.starColor}55` }}
            />
          ) : (
            <div className="font-bold text-white text-sm leading-snug truncate">
              {plan.title}
            </div>
          )}
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-[12px] font-semibold" style={{ color: `${plan.starColor}cc` }}>
              {plan.starEmoji} {plan.starName}
            </span>
            <span className="text-[12px] text-gray-600">·</span>
            <span className="text-[12px] text-gray-500">{plan.years.length}개 학년</span>
            {totalItems > 0 && (
              <>
                <span className="text-[12px] text-gray-600">·</span>
                <span className="text-[12px] text-gray-500">{checkedItems}/{totalItems} 완료</span>
              </>
            )}
          </div>
          {totalItems > 0 && (
            <div className="mt-1.5 w-full h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${(checkedItems / totalItems) * 100}%`, backgroundColor: plan.starColor }} />
            </div>
          )}
        </div>

        <ChevronDown
          className="flex-shrink-0 transition-transform duration-200"
          style={{
            width: 18, height: 18,
            color: isOpen ? plan.starColor : 'rgba(255,255,255,0.3)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </div>

      {/* Expanded body */}
      {isOpen && (
        <div style={{ borderTop: `1px solid ${plan.starColor}22` }}>
          <PlanActionBar
            plan={plan}
            showChecklistView={showChecklistView}
            onEdit={onEdit}
            onDelete={onDelete}
            onOpenShareDialog={onOpenShareDialog}
            onToggleChecklistView={() => setShowChecklistView(!showChecklistView)}
          />

          <div className="relative px-4 pb-4">
            <div className="absolute left-[38px] top-0 bottom-4 w-0.5"
              style={{ backgroundColor: `${plan.starColor}28` }} />
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
                  onItemInfoClick={onItemInfoClick}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main export ─── */
export function VerticalTimelineList({
  allPlans,
  onEdit,
  onUpdatePlan,
  onDeletePlan,
  onNewPlan,
  preferredOpenPlanId,
  onOpenShareDialog,
}: Props) {
  const [openPlanId, setOpenPlanId] = useState<string | null>(allPlans[0]?.id ?? null);
  const [detailItem, setDetailItem] = useState<{ item: PlanItem; gradeLabel: string } | null>(null);

  useEffect(() => {
    if (!preferredOpenPlanId) return;
    const hasPreferredPlan = allPlans.some(plan => plan.id === preferredOpenPlanId);
    if (hasPreferredPlan) {
      setOpenPlanId(preferredOpenPlanId);
    }
  }, [allPlans, preferredOpenPlanId]);

  const toggle = (planId: string) =>
    setOpenPlanId((prev) => (prev === planId ? null : planId));

  if (allPlans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
        <div className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #6C5CE722, #6C5CE708)', border: '1px solid #6C5CE733' }}>
          <span className="text-4xl">🗺️</span>
        </div>
        <div>
          <div className="text-base font-bold text-white">아직 커리어 패스가 없어요</div>
          <div className="text-sm text-gray-400 mt-1">빌더에서 나만의 로드맵을 만들어보세요</div>
        </div>
        <button onClick={onNewPlan}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all"
          style={{ background: 'linear-gradient(135deg, #6C5CE7, #a855f7)', boxShadow: '0 4px 20px rgba(108,92,231,0.4)' }}>
          <Plus style={{ width: 16, height: 16 }} />커리어 패스 만들기
        </button>
      </div>
    );
  }

  const findPlanColorForItem = (itemId: string): string => {
    const found = allPlans.find((p) => p.years.some((y) => {
      if (y.items.some((it) => it.id === itemId)) return true;
      if ((y.groups ?? []).some(g => g.items.some(it => it.id === itemId))) return true;
      if (y.semester === 'split') {
        return (y.semesterPlans ?? []).some(sp => sp.goalGroups.some(g => g.items.some(it => it.id === itemId)));
      }
      return (y.goalGroups ?? []).some(g => g.items.some(it => it.id === itemId));
    }));
    return found?.starColor ?? '#6C5CE7';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          내 커리어 패스 ({allPlans.length})
        </div>
        <button onClick={onNewPlan}
          className="flex items-center gap-1.5 px-1.5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, #6C5CE7, #a855f7)', color: '#fff' }}>
          <Plus style={{ width: 18, height: 18 }} />
        </button>
      </div>

      {allPlans.map((plan) => (
        <PlanAccordionCard
          key={plan.id}
          plan={plan}
          isOpen={openPlanId === plan.id}
          onToggle={() => toggle(plan.id)}
          onEdit={() => onEdit(plan)}
          onDelete={() => { onDeletePlan(plan.id); if (openPlanId === plan.id) setOpenPlanId(null); }}
          onUpdatePlan={onUpdatePlan}
          onItemInfoClick={(item, gradeLabel) => setDetailItem({ item, gradeLabel })}
          onOpenShareDialog={() => onOpenShareDialog?.(plan)}
        />
      ))}

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
