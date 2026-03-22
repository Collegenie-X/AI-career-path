'use client';

/**
 * 공유 패스 상세 모달
 * - document.body 로 포털 → 2열 레이아웃(transform 등)에 가두이지 않고 전체 화면 fixed
 * - 일반 다이얼로그: 전역 오버레이 + 가운데 정렬(560px max)
 */

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { SharedPlan, OperatorComment } from './types';
import { SharedPlanDetailContent } from './SharedPlanDetailContent';
import { CAREER_PATH_EXPAND_DIALOG_MAX_WIDTH_CLASS } from '../expandable-detail';

/** career 페이지 셸·다른 모달 위에 표시 */
const SHARED_PLAN_DIALOG_Z_INDEX = 10050;

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center p-4 sm:p-6"
      style={{ zIndex: SHARED_PLAN_DIALOG_Z_INDEX }}
      role="dialog"
      aria-modal="true"
    >
      {/* 전체 화면 백드롭 */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      {/* 본문 패널 — 뷰포트 기준 가운데 (margin/flex) */}
      <div
        className={`relative flex flex-col min-h-0 w-full ${CAREER_PATH_EXPAND_DIALOG_MAX_WIDTH_CLASS} max-h-[min(92dvh,900px)] rounded-3xl overflow-hidden shadow-2xl mx-auto my-auto`}
        style={{
          backgroundColor: '#0e0e24',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
        onClick={(e) => e.stopPropagation()}
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
    </div>,
    document.body
  );
}
