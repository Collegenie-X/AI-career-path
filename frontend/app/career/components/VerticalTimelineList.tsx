'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import type { CareerPlan } from './CareerPathBuilder';
import { LABELS } from '../config';
import { CareerPathListColumnDashboardHeader } from './CareerPathListColumnDashboardHeader';
import { CareerPlanSelectListRow } from './CareerPlanSelectListRow';

type Props = {
  allPlans: CareerPlan[];
  onNewPlan: () => void;
  preferredOpenPlanId?: string | null;
  /** 현재 선택(펼쳐진) 플랜 ID (controlled — 부모에서 관리) */
  selectedPlanId?: string | null;
  /** 플랜 선택 콜백 (controlled — 부모에서 관리) */
  onSelectPlan?: (planId: string | null) => void;
  /** 서버에 공개 등록된 내 패스 수 (대시보드 우측 카드) */
  myPublicSharedCount?: number;
};

export function VerticalTimelineList({
  allPlans,
  onNewPlan,
  preferredOpenPlanId,
  selectedPlanId: controlledSelectedPlanId,
  onSelectPlan,
  myPublicSharedCount = 0,
}: Props) {
  const [internalOpenPlanId, setInternalOpenPlanId] = useState<string | null>(allPlans[0]?.id ?? null);

  const isControlled = onSelectPlan !== undefined;
  const openPlanId = isControlled ? (controlledSelectedPlanId ?? null) : internalOpenPlanId;

  useEffect(() => {
    if (!preferredOpenPlanId) return;
    const hasPreferredPlan = allPlans.some((plan) => plan.id === preferredOpenPlanId);
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

  const emptyTitle = String(LABELS.timeline_empty ?? '아직 커리어 계획이 없어요');
  const emptyCta = String(LABELS.timeline_empty_cta ?? '빌더에서 시작하기');

  if (allPlans.length === 0) {
    return (
      <div className="space-y-4">
        <CareerPathListColumnDashboardHeader
          variant="my-path"
          statPrimaryValue={0}
          statSecondaryValue={myPublicSharedCount}
        />
        <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #6C5CE722, #6C5CE708)',
              border: '1px solid #6C5CE733',
            }}
          >
            <span className="text-4xl">🗺️</span>
          </div>
          <div>
            <div className="text-base font-bold text-white">{emptyTitle}</div>
            <div className="text-sm text-gray-400 mt-1">{emptyCta}</div>
          </div>
          <button
            type="button"
            onClick={onNewPlan}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all"
            style={{
              background: 'linear-gradient(135deg, #6C5CE7, #a855f7)',
              boxShadow: '0 4px 20px rgba(108,92,231,0.4)',
            }}
          >
            <Plus style={{ width: 16, height: 16 }} />
            {LABELS.explore_new ?? '새 패스 만들기'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <CareerPathListColumnDashboardHeader
        variant="my-path"
        statPrimaryValue={allPlans.length}
        statSecondaryValue={myPublicSharedCount}
      />

      <div className="space-y-2">
        {allPlans.map((plan) => (
          <CareerPlanSelectListRow
            key={plan.id}
            plan={plan}
            isSelected={openPlanId === plan.id}
            onSelect={() => selectPlan(plan.id)}
          />
        ))}
      </div>
    </div>
  );
}
