'use client';

import type { ReactNode } from 'react';

type FlowDotTone = 'star' | 'violet' | 'sky' | 'emerald' | 'amber';

const DOT_RING = 'ring-2 ring-[#12122a]';

function flowDotClass(tone: FlowDotTone): string {
  switch (tone) {
    case 'violet':
      return `border border-violet-400/50 bg-violet-500/25 ${DOT_RING}`;
    case 'sky':
      return `border border-sky-400/50 bg-sky-500/20 ${DOT_RING}`;
    case 'emerald':
      return `border border-emerald-400/50 bg-emerald-500/20 ${DOT_RING}`;
    case 'amber':
      return `border border-amber-400/45 bg-amber-500/15 ${DOT_RING}`;
    default:
      return '';
  }
}

function FlowDot({ tone, starColor }: { tone: FlowDotTone; starColor: string }) {
  if (tone === 'star') {
    return (
      <span
        className={`absolute left-0 top-2.5 h-2.5 w-2.5 shrink-0 rounded-full ${DOT_RING}`}
        style={{ backgroundColor: starColor, boxShadow: `0 0 0 1px ${starColor}66` }}
        aria-hidden
      />
    );
  }
  return (
    <span
      className={`absolute left-0 top-2.5 h-2.5 w-2.5 shrink-0 rounded-full ${flowDotClass(tone)}`}
      aria-hidden
    />
  );
}

/**
 * 로드맵 상세 본문 — 개요 → 검증 → 중간·최종 결과 → WBS 를 한 줄의 세로 스파인으로 연결
 */
export function RoadmapDetailVerticalFlow({
  starColor,
  children,
}: {
  starColor: string;
  children: ReactNode;
}) {
  return (
    <div className="relative pl-6">
      <div
        className="pointer-events-none absolute bottom-2 left-[9px] top-2 w-px rounded-full"
        style={{
          background: `linear-gradient(180deg, ${starColor}55, rgba(148,163,184,0.35), ${starColor}45, rgba(52,211,153,0.35))`,
        }}
        aria-hidden
      />
      <div className="space-y-0">{children}</div>
    </div>
  );
}

export function RoadmapDetailVerticalFlowStep({
  starColor,
  dotTone,
  children,
  className = '',
}: {
  starColor: string;
  dotTone: FlowDotTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative pb-5 last:pb-1 ${className}`}>
      <FlowDot tone={dotTone} starColor={starColor} />
      <div className="pl-4">{children}</div>
    </div>
  );
}
