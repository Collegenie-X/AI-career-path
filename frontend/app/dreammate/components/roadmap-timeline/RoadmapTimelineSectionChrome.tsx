'use client';

import type { ReactNode } from 'react';
import { ROADMAP_TIMELINE_DISPLAY } from '../../config/roadmap-timeline-display.config';

const CHROME = ROADMAP_TIMELINE_DISPLAY.chrome;
const SPINE = ROADMAP_TIMELINE_DISPLAY.treeSpine;

type AccentProps = {
  accentColor: string;
  children: ReactNode;
  className?: string;
};

export type PlanFolderVariant = 'box' | 'spine';

/** 계획 항목 래퍼 — `spine`: 좌측 강조선만(상세 플로우 트리), `box`: 기존 헤어라인 테두리 */
export function RoadmapTimelinePlanItemFolderFrame({
  accentColor,
  children,
  className = '',
  variant = 'box',
}: AccentProps & { variant?: PlanFolderVariant }) {
  if (variant === 'spine') {
    return (
      <div
        className={`${CHROME.planItemFolder.radiusClass} ${CHROME.planItemFolder.paddingClass} ${className}`}
        style={{
          borderLeft: `3px solid ${accentColor}55`,
          backgroundColor: 'rgba(255,255,255,0.02)',
        }}
      >
        {children}
      </div>
    );
  }
  return (
    <div
      className={`${CHROME.planItemFolder.radiusClass} ${CHROME.planItemFolder.paddingClass} ${className}`}
      style={{
        border: '1px solid rgba(255,255,255,0.05)',
        boxShadow: `inset 0 0 0 1px ${accentColor}0a`,
      }}
    >
      {children}
    </div>
  );
}

type WeekProps = AccentProps & {
  weekLabel: string;
};

/** 주차 블록 — 테두리·배경 없이 트리 스파인으로만 구분 */
export function RoadmapTimelineWeekSectionFrame({ accentColor, weekLabel, children, className = '' }: WeekProps) {
  const regionLabel = `${weekLabel} ${ROADMAP_TIMELINE_DISPLAY.labels.weekSectionRegionSuffix}`;
  return (
    <section
      aria-label={regionLabel}
      className={`${CHROME.weekSection.radiusClass} ${CHROME.weekSection.paddingClass} ${className}`}
    >
      {children}
    </section>
  );
}

type GoalProps = AccentProps & {
  blockLabel?: string;
};

/** 목표·할 일 묶음 — 배경·테두리 없이 들여쓰기만 (상위 트리 스파인에 연결) */
export function RoadmapTimelineGoalBlockFrame({ accentColor, blockLabel, children, className = '' }: GoalProps) {
  const regionLabel = blockLabel
    ? `${blockLabel} · ${ROADMAP_TIMELINE_DISPLAY.labels.goalBlockRegionSuffix}`
    : ROADMAP_TIMELINE_DISPLAY.labels.goalBlockRegionSuffix;
  return (
    <div
      aria-label={regionLabel}
      className={`${CHROME.goalBlock.radiusClass} ${CHROME.goalBlock.paddingClass} space-y-0.5 ${className}`}
    >
      {children}
    </div>
  );
}

type WeekTreeStackProps = {
  accentColor: string;
  children: ReactNode;
};

/**
 * 주차들을 상하로 잇는 세로 트리(스파인).
 * 자식으로 `RoadmapTimelineWeekTreeNode`를 주차 개수만큼 둡니다.
 */
export function RoadmapTimelineWeekTreeStack({ accentColor, children }: WeekTreeStackProps) {
  return (
    <div className="relative pl-6 pt-1">
      <div
        className="absolute left-[10px] top-3 bottom-3 w-px rounded-full pointer-events-none"
        style={{ backgroundColor: `${accentColor}${SPINE.lineOpacityHex}` }}
        aria-hidden
      />
      {children}
    </div>
  );
}

type WeekTreeNodeProps = {
  accentColor: string;
  children: ReactNode;
};

/** 주차 하나 — 스파인 세로선만 유지, 노드 점 없음 */
export function RoadmapTimelineWeekTreeNode({ accentColor, children }: WeekTreeNodeProps) {
  return (
    <div className="relative pb-3 last:pb-0">
      <div className="pl-1.5">{children}</div>
    </div>
  );
}
