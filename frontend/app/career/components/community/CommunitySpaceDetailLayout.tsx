'use client';

/**
 * 학교 공간·그룹 디테일 공통 레이아웃
 * - 상단 바(뒤로가기 + 더보기)
 * - 헤더 카드 슬롯
 * - 중간 섹션 슬롯 (검색/필터 또는 멤버)
 * - 공유 패스 목록
 */

import { ChevronRight, MoreVertical } from 'lucide-react';
import type { SharedPlan } from './types';
import { SharedPlanListSection } from './SharedPlanListSection';

export type CommunitySpaceDetailLayoutProps = {
  readonly backLabel: string;
  readonly onBack: () => void;
  readonly onMoreClick: () => void;
  /** 커스텀 상단 바 (미제공 시 기본 뒤로+더보기 사용) */
  readonly topBarContent?: React.ReactNode;
  readonly headerContent: React.ReactNode;
  readonly middleContent?: React.ReactNode;
  readonly planListLabel: string;
  readonly planListProps: {
    plans: SharedPlan[];
    emptyMessage?: string;
    likedPlanIds: string[];
    bookmarkedPlanIds: string[];
    likeCounts: Record<string, number>;
    bookmarkCounts: Record<string, number>;
    checkedPlans: Record<string, string>;
    onToggleLike: (planId: string) => void;
    onToggleBookmark: (planId: string) => void;
    onViewDetail: (plan: SharedPlan) => void;
  };
  readonly moreMenuContent: React.ReactNode | null;
};

export function CommunitySpaceDetailLayout({
  backLabel,
  onBack,
  onMoreClick,
  topBarContent,
  headerContent,
  middleContent,
  planListLabel,
  planListProps,
  moreMenuContent,
}: CommunitySpaceDetailLayoutProps) {
  const defaultTopBar = (
    <div className="flex items-center justify-between">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-bold text-gray-300 transition-all active:scale-95"
      >
        <ChevronRight className="w-4 h-4 rotate-180" />
        {backLabel}
      </button>
      <button
        onClick={onMoreClick}
        className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-95"
        style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
      >
        <MoreVertical className="w-4 h-4 text-gray-400" />
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* 상단 바 */}
      {topBarContent ?? defaultTopBar}

      {/* 헤더 카드 */}
      {headerContent}

      {/* 중간 섹션 (검색/필터 또는 멤버) */}
      {middleContent}

      {/* 공유 패스 목록 */}
      <div className="space-y-3">
        <span className="text-xs font-bold text-gray-400">{planListLabel}</span>
        <SharedPlanListSection {...planListProps} />
      </div>

      {/* 더보기 메뉴 */}
      {moreMenuContent}
    </div>
  );
}
