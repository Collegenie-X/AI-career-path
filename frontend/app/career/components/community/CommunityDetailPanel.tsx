'use client';

import { useEffect, useState } from 'react';
import type { SharedPlan, OperatorComment } from './types';
import { SharedPlanDetailContent } from './SharedPlanDetailContent';
import { SharedPlanDetailDialog } from './SharedPlanDetailDialog';

type CommunityDetailPanelProps = {
  readonly plan: SharedPlan;
  readonly isLiked: boolean;
  readonly isBookmarked: boolean;
  readonly likeCount: number;
  readonly bookmarkCount: number;
  readonly onToggleLike: () => void;
  readonly onToggleBookmark: () => void;
  readonly onClose: () => void;
  readonly onAddComment: (planId: string, comment: OperatorComment) => void;
};

export function CommunityDetailPanel({
  plan,
  isLiked,
  isBookmarked,
  likeCount,
  bookmarkCount,
  onToggleLike,
  onToggleBookmark,
  onClose,
  onAddComment,
}: CommunityDetailPanelProps) {
  const [showExpandDialog, setShowExpandDialog] = useState(false);

  useEffect(() => {
    setShowExpandDialog(false);
  }, [plan.id]);

  return (
    <>
    <div className="flex flex-col h-full">
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
        variant="panel"
        showCloseButton={true}
        onExpand={() => setShowExpandDialog(true)}
      />
    </div>
    {showExpandDialog && (
      <SharedPlanDetailDialog
        plan={plan}
        isLiked={isLiked}
        isBookmarked={isBookmarked}
        likeCount={likeCount}
        bookmarkCount={bookmarkCount}
        onToggleLike={onToggleLike}
        onToggleBookmark={onToggleBookmark}
        onClose={() => setShowExpandDialog(false)}
        onAddComment={onAddComment}
      />
    )}
    </>
  );
}
