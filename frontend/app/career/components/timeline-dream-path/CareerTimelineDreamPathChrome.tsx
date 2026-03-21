'use client';

import type { ReactNode } from 'react';
import { Target, ChevronDown, ChevronUp } from 'lucide-react';
import { CAREER_TIMELINE_DREAM_PATH_CHROME } from '../../config/timeline-dream-path-chrome.config';

const CHROME = CAREER_TIMELINE_DREAM_PATH_CHROME;

type DreamPathGoalHeaderButtonProps = {
  accentColor: string;
  title: string;
  itemCount: number;
  isExpanded?: boolean;
  showChevron?: boolean;
  onToggle?: () => void;
  /** 접기 없이 제목만 (단일 목표 등) */
  variant?: 'accordion' | 'static';
};

/**
 * 드림 패스 상세(CareerPathDetailPanelTimeline)와 동일 톤: 굵은 카드 테두리 없이 배경만.
 */
export function DreamPathGoalHeaderButton({
  accentColor,
  title,
  itemCount,
  isExpanded = true,
  showChevron = true,
  onToggle,
  variant = 'accordion',
}: DreamPathGoalHeaderButtonProps) {
  const inner = (
    <>
      <div className="flex items-center gap-2 min-w-0">
        <Target className="w-3.5 h-3.5 flex-shrink-0 opacity-80" style={{ color: accentColor }} />
        <span className="text-sm font-semibold text-white truncate">{title}</span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-[11px] font-bold text-gray-500">{itemCount}개</span>
        {variant === 'accordion' && showChevron ? (
          isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-gray-500" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
          )
        ) : null}
      </div>
    </>
  );

  if (variant === 'static' || !onToggle) {
    return (
      <div
        className={CHROME.goalHeaderButton.className}
        style={{ backgroundColor: `${accentColor}08` }}
      >
        {inner}
      </div>
    );
  }

  return (
    <button
      type="button"
      className={CHROME.goalHeaderButton.className}
      style={{ backgroundColor: `${accentColor}08` }}
      onClick={onToggle}
    >
      {inner}
    </button>
  );
}

type DreamPathNestedRailProps = {
  accentColor: string;
  children: ReactNode;
  className?: string;
};

/** 목표·그룹 아래 활동들 — 왼쪽 세로선으로만 하위 구분 (박스 테두리 최소화) */
export function DreamPathNestedRail({ accentColor, children, className = '' }: DreamPathNestedRailProps) {
  return (
    <div
      className={`${CHROME.nestedRail.className} ${className}`}
      style={{ borderColor: `${accentColor}14` }}
    >
      {children}
    </div>
  );
}

type DreamPathSubItemNestProps = {
  children: ReactNode;
};

/** 활동 카드 안 하위 할 일 — 한 단 더 들여쓰기 + 연한 세로선 */
export function DreamPathSubItemNest({ children }: DreamPathSubItemNestProps) {
  return <div className={`${CHROME.subItemNest.className} space-y-1.5`}>{children}</div>;
}

export function dreamPathSubActivitiesLabel(): string {
  return CHROME.labels.subActivitiesSection;
}

/** 계획 그룹(하위 폴더) — 목표 아이콘 대신 점·라벨로 구분 */
export function DreamPathPlanGroupHeader({
  accentColor,
  label,
  itemCount,
}: {
  accentColor: string;
  label: string;
  itemCount: number;
}) {
  return (
    <div
      className="flex items-center gap-2 px-2.5 py-2 rounded-lg"
      style={{ backgroundColor: `${accentColor}08` }}
    >
      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: accentColor }} />
      <span className="flex-1 text-xs font-bold truncate" style={{ color: accentColor }}>
        {label}
      </span>
      <span className="text-[12px] text-gray-600 flex-shrink-0">{itemCount}개</span>
    </div>
  );
}
