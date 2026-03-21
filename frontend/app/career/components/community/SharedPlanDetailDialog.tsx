'use client';

/**
 * 공유 패스 상세 모달
 * - SharedPlanDetailContent를 모달 래퍼로 감싸서 표시
 */

import type { SharedPlan, OperatorComment } from './types';
import { SharedPlanDetailContent } from './SharedPlanDetailContent';

type Props = {
  plan: SharedPlan;
  isLiked: boolean;
  isBookmarked: boolean;
  likeCount: number;
  bookmarkCount: number;
  onToggleLike: () => void;
  onToggleBookmark: () => void;
  onClose: () => void;
  onAddComment: (planId: string, comment: OperatorComment) => void;
};

export function SharedPlanDetailDialog({
  plan,
  isLiked,
  isBookmarked,
  likeCount,
  bookmarkCount,
  onToggleLike,
  onToggleBookmark,
  onClose,
  onAddComment,
}: Props) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="relative flex flex-col w-full max-w-[430px] mx-auto mt-10 flex-1 rounded-t-3xl overflow-hidden"
        style={{
          backgroundColor: '#0e0e24',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <SharedPlanDetailContent
          plan={plan}
          isLiked={isLiked}
          isBookmarked={isBookmarked}
          likeCount={likeCount}
          bookmarkCount={bookmarkCount}
          onToggleLike={onToggleLike}
          onToggleBookmark={onToggleBookmark}
          onClose={onClose}
          onAddComment={onAddComment}
          variant="dialog"
          showCloseButton={true}
        />
      </div>
    </div>
  );
}
