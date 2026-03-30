'use client';

import type { ReactNode } from 'react';

interface RoadmapEditorWbsMonthTreeNodeProps {
  children: ReactNode;
}

/** 월 노드: 트리 점 + 본문 (세로 트리 상단). */
export function RoadmapEditorWbsMonthTreeNode({ children }: RoadmapEditorWbsMonthTreeNodeProps) {
  return (
    <div className="relative flex gap-0">
      <div className="flex w-5 flex-shrink-0 flex-col items-center pt-1">
        <div
          className="z-[1] h-2.5 w-2.5 flex-shrink-0 rounded-full bg-sky-400/90 shadow-[0_0_10px_rgba(56,189,248,0.45)] ring-2 ring-sky-400/25"
          aria-hidden
        />
      </div>
      <div className="min-w-0 flex-1 pb-1">{children}</div>
    </div>
  );
}

interface RoadmapEditorWbsWeekBranchStackProps {
  children: ReactNode;
}

/** 월 아래 주차들 — 왼쪽 가지선으로 상하 계층. */
export function RoadmapEditorWbsWeekBranchStack({ children }: RoadmapEditorWbsWeekBranchStackProps) {
  return (
    <div className="relative ml-2 mt-1 border-l border-white/[0.09] pl-3">
      {children}
    </div>
  );
}

interface RoadmapEditorWbsWeekTreeNodeProps {
  children: ReactNode;
}

/** 주차 노드: 보라 점 + 주차 카드. */
export function RoadmapEditorWbsWeekTreeNode({ children }: RoadmapEditorWbsWeekTreeNodeProps) {
  return (
    <div className="relative flex gap-2 pb-3 last:pb-0">
      <div className="flex w-4 flex-shrink-0 flex-col items-center pt-2">
        <div
          className="z-[1] h-2 w-2 flex-shrink-0 rounded-full bg-violet-400/80 ring-2 ring-violet-500/25"
          aria-hidden
        />
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

/** 목표·산출물·하위 항목을 한 덩어리로 이어 보이게 하는 세로 스택. */
export function RoadmapEditorWbsWeekDetailStack({ children }: { children: ReactNode }) {
  return (
    <div className="mt-2 space-y-2 border-l border-white/[0.06] pl-3 ml-0.5">
      {children}
    </div>
  );
}

/** 하위 항목 한 줄 — 트리 잎 노드. */
export function RoadmapEditorWbsSubItemLeafRow({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex items-center gap-2 pl-2">
      <span
        className="absolute left-0 top-1/2 h-px w-2 -translate-y-1/2 bg-gradient-to-r from-emerald-400/25 to-white/10"
        aria-hidden
      />
      <div className="min-w-0 flex-1 pl-2">{children}</div>
    </div>
  );
}
