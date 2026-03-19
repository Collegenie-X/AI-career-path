'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import type { CareerPlan } from './CareerPathBuilder';

/* ─── Types ─── */
type Props = {
  allPlans: CareerPlan[];
  onNewPlan: () => void;
  preferredOpenPlanId?: string | null;
  /** 현재 선택(펼쳐진) 플랜 ID (controlled — 부모에서 관리) */
  selectedPlanId?: string | null;
  /** 플랜 선택 콜백 (controlled — 부모에서 관리) */
  onSelectPlan?: (planId: string | null) => void;
};

/* ─── Single plan select card ─── */
function PlanSelectCard({
  plan,
  isSelected,
  onSelect,
}: {
  plan: CareerPlan;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const totalItems = plan.years.reduce((sum, year) => {
    const baseItemsCount = year.items.length;
    const groupedItemsCount = (year.groups ?? []).reduce((groupSum, group) => groupSum + group.items.length, 0);
    const goalGroupItemsCount = (year.goalGroups ?? []).reduce((groupSum, group) => groupSum + group.items.length, 0);
    const splitSemesterItemsCount = (year.semesterPlans ?? []).reduce((semesterSum, semesterPlan) => {
      const semesterGoalItemsCount = semesterPlan.goalGroups.reduce(
        (goalSum, goalGroup) => goalSum + goalGroup.items.length,
        0
      );
      return semesterSum + semesterGoalItemsCount;
    }, 0);

    return sum + baseItemsCount + groupedItemsCount + goalGroupItemsCount + splitSemesterItemsCount;
  }, 0);
  const checkedItems = plan.years.reduce((sum, year) => {
    const baseCheckedCount = year.items.filter((item) => item.checked).length;
    const groupedCheckedCount = (year.groups ?? []).reduce(
      (groupSum, group) => groupSum + group.items.filter((item) => item.checked).length,
      0
    );
    const goalGroupCheckedCount = (year.goalGroups ?? []).reduce(
      (groupSum, group) => groupSum + group.items.filter((item) => item.checked).length,
      0
    );
    const splitSemesterCheckedCount = (year.semesterPlans ?? []).reduce((semesterSum, semesterPlan) => {
      const semesterGoalCheckedCount = semesterPlan.goalGroups.reduce(
        (goalSum, goalGroup) => goalSum + goalGroup.items.filter((item) => item.checked).length,
        0
      );
      return semesterSum + semesterGoalCheckedCount;
    }, 0);

    return sum + baseCheckedCount + groupedCheckedCount + goalGroupCheckedCount + splitSemesterCheckedCount;
  }, 0);
  const completionPercent = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect();
        }
      }}
      className="rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer"
      style={{
        border: `1.5px solid ${isSelected ? `${plan.starColor}66` : 'rgba(255,255,255,0.08)'}`,
        background: isSelected
          ? `linear-gradient(180deg, ${plan.starColor}14 0%, ${plan.starColor}06 100%)`
          : 'rgba(255,255,255,0.03)',
      }}
    >
      <div className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{
            background: isSelected
              ? `linear-gradient(135deg, ${plan.starColor}33, ${plan.starColor}18)`
              : 'rgba(255,255,255,0.06)',
            border: isSelected ? `1.5px solid ${plan.starColor}55` : '1.5px solid rgba(255,255,255,0.1)',
          }}
        >
          {plan.jobEmoji}
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-bold text-white text-sm leading-snug truncate">{plan.title}</div>
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
                style={{ width: `${completionPercent}%`, backgroundColor: plan.starColor }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main export ─── */
export function VerticalTimelineList({
  allPlans,
  onNewPlan,
  preferredOpenPlanId,
  selectedPlanId: controlledSelectedPlanId,
  onSelectPlan,
}: Props) {
  const [internalOpenPlanId, setInternalOpenPlanId] = useState<string | null>(allPlans[0]?.id ?? null);

  const isControlled = onSelectPlan !== undefined;
  const openPlanId = isControlled ? (controlledSelectedPlanId ?? null) : internalOpenPlanId;

  useEffect(() => {
    if (!preferredOpenPlanId) return;
    const hasPreferredPlan = allPlans.some(plan => plan.id === preferredOpenPlanId);
    if (!hasPreferredPlan) return;
    if (isControlled) {
      onSelectPlan?.(preferredOpenPlanId);
    } else {
      setInternalOpenPlanId(preferredOpenPlanId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allPlans, preferredOpenPlanId]);

  const selectPlan = (planId: string) => {
    if (isControlled) {
      onSelectPlan?.(planId);
    } else {
      setInternalOpenPlanId(planId);
    }
  };

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
        <PlanSelectCard
          key={plan.id}
          plan={plan}
          isSelected={openPlanId === plan.id}
          onSelect={() => selectPlan(plan.id)}
        />
      ))}
    </div>
  );
}
