'use client';

import { Sparkles } from 'lucide-react';
import { StickySectionPageHeader } from '@/components/section-shell/StickySectionPageHeader';
import { CAREER_PAGE_HEADER_CONTENT, CAREER_PAGE_HEADER_RIGHT_BADGE, COLORS } from '../config';

/** 선택 패스가 있을 때만 — 배지 색·이모지 액센트용 (문구는 항상 포괄형 JSON 라벨) */
type CareerPageHeaderAccent = {
  readonly jobEmoji: string;
  readonly starColor: string;
};

type CareerPageHeaderProps = {
  readonly selectedPlanAccent: CareerPageHeaderAccent | null;
};

export function CareerPageHeader({ selectedPlanAccent }: CareerPageHeaderProps) {
  const badge = CAREER_PAGE_HEADER_RIGHT_BADGE;
  const accentColor = selectedPlanAccent?.starColor ?? COLORS.primary;
  const displayEmoji = selectedPlanAccent?.jobEmoji ?? badge.defaultEmoji;

  return (
    <StickySectionPageHeader
      title={CAREER_PAGE_HEADER_CONTENT.title}
      subtitlePill={CAREER_PAGE_HEADER_CONTENT.subtitle}
      rightSlot={
        <div
          className="flex w-full max-w-full items-center gap-2 rounded-2xl border px-4 py-2 shadow-[0_10px_30px_rgba(0,0,0,0.35)] md:max-w-[min(100%,20rem)]"
          style={{
            background: `linear-gradient(135deg, ${accentColor}28, rgba(15,23,42,0.75))`,
            borderColor: `${accentColor}70`,
            boxShadow: `0 8px 24px ${accentColor}33`,
          }}
        >
          <span className="text-lg flex-shrink-0" aria-hidden>
            {displayEmoji}
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="text-[10px] uppercase tracking-wide text-white/60">{badge.eyebrow}</div>
            <div className="text-[12px] sm:text-[13px] font-black leading-snug" style={{ color: accentColor }}>
              {badge.title}
            </div>
          </div>
          <Sparkles className="h-3.5 w-3.5 flex-shrink-0" style={{ color: accentColor }} aria-hidden />
        </div>
      }
    />
  );
}
