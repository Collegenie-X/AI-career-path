'use client';

import type { ReactNode } from 'react';
import { Target, ChevronDown, ChevronUp } from 'lucide-react';
import { CAREER_TIMELINE_DREAM_PATH_CHROME } from '../../config/timeline-dream-path-chrome.config';

const CHROME = CAREER_TIMELINE_DREAM_PATH_CHROME;

type CareerPathGoalHeaderButtonProps = {
  accentColor: string;
  title: string;
  itemCount: number;
  isExpanded?: boolean;
  showChevron?: boolean;
  onToggle?: () => void;
  /** 접기 없이 제목만 (단일 목표 등) */
  variant?: 'accordion' | 'static';
  /** 내 패스만 — 목표별 체크 진행(숫자 + 막대), 탐색 템플릿에서는 false */
  showProgressBar?: boolean;
  checkedCount?: number;
  totalCount?: number;
  completedSuffixLabel?: string;
};

/**
 * 커리어 패스 상세(CareerPathDetailPanelTimeline)와 동일 톤: 굵은 카드 테두리 없이 배경만.
 */
export function CareerPathGoalHeaderButton({
  accentColor,
  title,
  itemCount,
  isExpanded = true,
  showChevron = true,
  onToggle,
  variant = 'accordion',
  showProgressBar = false,
  checkedCount = 0,
  totalCount = 0,
  completedSuffixLabel = '완료',
}: CareerPathGoalHeaderButtonProps) {
  const showProgress =
    showProgressBar && typeof totalCount === 'number' && totalCount > 0;
  const progressRatio = showProgress ? checkedCount / totalCount : 0;

  const inner = (
    <div className="flex items-start justify-between gap-2 w-full">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <Target className="w-3.5 h-3.5 flex-shrink-0 opacity-80" style={{ color: accentColor }} />
        <span className="text-sm font-semibold text-white truncate">{title}</span>
      </div>
      <div className="flex items-start gap-2 flex-shrink-0">
        <div className="flex flex-col items-end gap-1 min-w-[72px]">
          {showProgress ? (
            <>
              <span className="text-[11px] font-bold text-gray-500 tabular-nums">
                {checkedCount}/{totalCount} {completedSuffixLabel}
              </span>
              <div
                className="w-[120px] max-w-[28vw] h-1.5 rounded-full overflow-hidden"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressRatio * 100}%`, backgroundColor: accentColor }}
                />
              </div>
            </>
          ) : (
            <span className="text-[11px] font-bold text-gray-500">{itemCount}개</span>
          )}
        </div>
        {variant === 'accordion' && showChevron ? (
          isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-gray-500 mt-0.5 flex-shrink-0" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-gray-500 mt-0.5 flex-shrink-0" />
          )
        ) : null}
      </div>
    </div>
  );

  if (variant === 'static' || !onToggle) {
    return (
      <div
        className={CHROME.goalHeaderButton.className}
        style={{ backgroundColor: `${accentColor}05` }}
      >
        {inner}
      </div>
    );
  }

  return (
    <button
      type="button"
      className={CHROME.goalHeaderButton.className}
      style={{ backgroundColor: `${accentColor}05` }}
      onClick={onToggle}
    >
      {inner}
    </button>
  );
}

type CareerPathNestedRailProps = {
  accentColor: string;
  children: ReactNode;
  className?: string;
};

/** 목표·그룹 아래 활동들 — 왼쪽 세로선으로만 하위 구분 (박스 테두리 최소화) */
export function CareerPathNestedRail({ accentColor, children, className = '' }: CareerPathNestedRailProps) {
  return (
    <div
      className={`${CHROME.nestedRail.className} ${className}`}
      style={{ borderLeftColor: `${accentColor}0c` }}
    >
      {children}
    </div>
  );
}

type CareerPathSubItemNestProps = {
  children: ReactNode;
  /** 활동 유형 색 — 세로·가지 연결선 톤 */
  accentColor?: string;
};

/** 활동 카드 안 하위 할 일 — 세로 스파인 (행별 가로 가지는 TimelineItemComponents에서 처리) */
export function CareerPathSubItemNest({ children, accentColor }: CareerPathSubItemNestProps) {
  const spine = accentColor ? `${accentColor}22` : 'rgba(255,255,255,0.08)';
  return (
    <div className={CHROME.subItemNest.className} style={{ borderLeftColor: spine }}>
      {children}
    </div>
  );
}

/** 하위 항목 한 줄 — 세로선에서 본문으로 잇는 가로 가지 */
export function CareerPathSubItemBranchRow({
  accentColor,
  children,
}: {
  accentColor: string;
  children: ReactNode;
}) {
  return (
    <div className="relative flex items-start gap-2">
      <span
        className="pointer-events-none absolute left-[-12px] top-[13px] h-px w-3"
        style={{ backgroundColor: `${accentColor}38` }}
        aria-hidden
      />
      {children}
    </div>
  );
}

export function careerPathSubActivitiesLabel(): string {
  return CHROME.labels.subActivitiesSection;
}

/** 계획 그룹(하위 폴더) — 목표 아이콘 대신 점·라벨로 구분 */
export function CareerPathPlanGroupHeader({
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
      className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
      style={{ backgroundColor: `${accentColor}05` }}
    >
      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: accentColor }} />
      <span className="flex-1 text-xs font-bold truncate" style={{ color: accentColor }}>
        {label}
      </span>
      <span className="text-[12px] text-gray-600 flex-shrink-0">{itemCount}개</span>
    </div>
  );
}
