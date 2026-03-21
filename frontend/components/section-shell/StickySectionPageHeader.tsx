'use client';

import type { ReactNode } from 'react';
import { SECTION_STICKY_HEADER_SURFACE_STYLE } from './section-shell-layout.constants';

type StickySectionPageHeaderProps = {
  readonly title: string;
  /** 메인 제목 아래 작은 pill 형태 부제 (한 줄 권장) */
  readonly subtitlePill: string;
  readonly rightSlot?: ReactNode;
};

/**
 * 드림 경험 / 커리어 패스 / 드림 실행 상단 제목 영역 — 동일 타이포·여백
 */
export function StickySectionPageHeader({
  title,
  subtitlePill,
  rightSlot,
}: StickySectionPageHeaderProps) {
  return (
    <div className="sticky top-0 z-20 px-4" style={SECTION_STICKY_HEADER_SURFACE_STYLE}>
      <div className="web-container py-4">
        {/* 모바일: 제목·부제 위 → 우측 슬롯 아래 | md+: 가로 정렬 */}
        <div className="flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
          <div className="min-w-0 w-full">
            <h1 className="text-2xl font-black tracking-tight text-transparent drop-shadow-[0_0_18px_rgba(139,92,246,0.35)] md:text-[30px] bg-gradient-to-r from-white via-purple-200 to-indigo-300 bg-clip-text">
              {title}
            </h1>
            <p className="mt-1 inline-flex max-w-full items-center rounded-full border border-indigo-400/30 bg-indigo-500/10 px-2.5 py-1 text-[11px] font-semibold text-indigo-200">
              <span className="line-clamp-2">{subtitlePill}</span>
            </p>
          </div>
          {rightSlot ? (
            <div className="w-full md:w-auto md:flex-shrink-0 md:self-center">{rightSlot}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
