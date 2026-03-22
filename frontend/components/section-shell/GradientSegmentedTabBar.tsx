'use client';

import type { ReactNode } from 'react';

export type GradientSegmentedTabItem<TId extends string> = {
  readonly id: TId;
  readonly label: string;
  /** career / dreammate 스타일 이모지 탭 */
  readonly emoji?: string;
  /** 경험 페이지처럼 Lucide 아이콘을 쓸 때 */
  readonly icon?: ReactNode;
};

type GradientSegmentedTabBarProps<TId extends string> = {
  readonly tabs: readonly GradientSegmentedTabItem<TId>[];
  readonly activeTab: TId;
  readonly onTabChange: (tabId: TId) => void;
  /**
   * true: 통합 셸 안 — 바깥 이중 테두리 없이 탭 그리드만 (히어로와 한 덩어리)
   */
  readonly embeddedInSectionShell?: boolean;
  /**
   * true: 탭을 콘텐츠 크기만큼만 표시하고 오른쪽 정렬 (전체 너비 사용 안 함)
   */
  readonly compact?: boolean;
  readonly ariaLabel: string;
};

/**
 * 경험·패스·실행 공통 세그먼트 탭 — 활성: 보라 그라데이션, 비활성: 반투명 + 테두리
 */
export function GradientSegmentedTabBar<TId extends string>({
  tabs,
  activeTab,
  onTabChange,
  embeddedInSectionShell = false,
  compact = false,
  ariaLabel,
}: GradientSegmentedTabBarProps<TId>) {
  const shellClassName = embeddedInSectionShell
    ? compact
      ? 'grid gap-2.5 pl-1 pt-1 pb-1 pr-0 rounded-none'
      : 'grid gap-1.5 p-1 rounded-none'
    : 'grid gap-2 p-1.5 rounded-none border border-white/10';

  const shellStyle = embeddedInSectionShell
    ? { backgroundColor: 'rgba(255,255,255,0.06)' }
    : { backgroundColor: 'rgba(255,255,255,0.03)' };

  const gridCols = compact
    ? `repeat(${tabs.length}, auto)`
    : `repeat(${tabs.length}, minmax(0, 1fr))`;

  return (
    <div
      className={compact ? `${shellClassName} w-fit ml-auto` : shellClassName}
      style={{
        ...shellStyle,
        gridTemplateColumns: gridCols,
      }}
      role="tablist"
      aria-label={ariaLabel}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const leading = tab.icon ?? (tab.emoji ? <span>{tab.emoji}</span> : null);

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center justify-center gap-2 rounded-none py-3 text-[13px] font-bold transition-all ${compact ? 'px-6 md:px-8 min-w-0' : ''}`}
            style={
              isActive
                ? {
                    background: 'linear-gradient(135deg, #6C5CE7, #a855f7)',
                    color: '#fff',
                    boxShadow: '0 4px 16px rgba(108,92,231,0.35)',
                  }
                : {
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    color: 'rgba(255,255,255,0.65)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }
            }
            role="tab"
            aria-selected={isActive}
            aria-current={isActive ? 'page' : undefined}
          >
            {leading}
            <span className="truncate">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
