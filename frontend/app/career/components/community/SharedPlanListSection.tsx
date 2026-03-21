'use client';

/**
 * 공유 패스 목록 섹션 (학교 공간·그룹 디테일 공통)
 */

import type { SharedPlan } from './types';
import { SharedPlanCardWithReactions } from './SharedPlanCardWithReactions';

export type SharedPlanListSectionProps = {
  readonly plans: SharedPlan[];
  readonly emptyMessage?: string;
  readonly likedPlanIds: string[];
  readonly bookmarkedPlanIds: string[];
  readonly likeCounts: Record<string, number>;
  readonly bookmarkCounts: Record<string, number>;
  readonly checkedPlans: Record<string, string>;
  readonly onToggleLike: (planId: string) => void;
  readonly onToggleBookmark: (planId: string) => void;
  readonly onViewDetail: (plan: SharedPlan) => void;
};

const DEFAULT_EMPTY_MESSAGE = '아직 공유된 패스가 없어요';

export function SharedPlanListSection({
  plans,
  emptyMessage = DEFAULT_EMPTY_MESSAGE,
  likedPlanIds,
  bookmarkedPlanIds,
  likeCounts,
  bookmarkCounts,
  checkedPlans,
  onToggleLike,
  onToggleBookmark,
  onViewDetail,
}: SharedPlanListSectionProps) {
  if (plans.length === 0) {
    return (
      <div
        className="py-8 text-center rounded-xl"
        style={{ border: '1px dashed rgba(255,255,255,0.1)' }}
      >
        <p className="text-xs text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {plans.map((plan) => (
        <SharedPlanCardWithReactions
          key={plan.id}
          plan={plan}
          isLiked={likedPlanIds.includes(plan.id)}
          isBookmarked={bookmarkedPlanIds.includes(plan.id)}
          likeCount={likeCounts[plan.id] ?? plan.likes}
          bookmarkCount={bookmarkCounts[plan.id] ?? plan.bookmarks}
          checkedAt={checkedPlans[plan.id]}
          onToggleLike={() => onToggleLike(plan.id)}
          onToggleBookmark={() => onToggleBookmark(plan.id)}
          onViewDetail={() => onViewDetail(plan)}
        />
      ))}
    </div>
  );
}
