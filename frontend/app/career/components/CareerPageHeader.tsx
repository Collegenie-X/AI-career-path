'use client';

import { Sparkles } from 'lucide-react';
import { StickySectionPageHeader } from '@/components/section-shell/StickySectionPageHeader';
import { CAREER_PAGE_HEADER_CONTENT } from '../config';

type CareerPageHeaderProps = {
  readonly selectedJobBadge:
    | {
        readonly jobEmoji: string;
        readonly jobName: string;
        readonly starColor: string;
      }
    | null;
};

export function CareerPageHeader({ selectedJobBadge }: CareerPageHeaderProps) {
  return (
    <StickySectionPageHeader
      title={CAREER_PAGE_HEADER_CONTENT.title}
      subtitlePill={CAREER_PAGE_HEADER_CONTENT.subtitle}
      rightSlot={
        selectedJobBadge ? (
          <div
            className="flex items-center gap-2 rounded-2xl border px-4 py-2 shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
            style={{
              background: `linear-gradient(135deg, ${selectedJobBadge.starColor}28, rgba(15,23,42,0.75))`,
              borderColor: `${selectedJobBadge.starColor}70`,
              boxShadow: `0 8px 24px ${selectedJobBadge.starColor}33`,
            }}
          >
            <span className="text-lg">{selectedJobBadge.jobEmoji}</span>
            <div className="leading-tight">
              <div className="text-[10px] uppercase tracking-wide text-white/60">Current Track</div>
              <div className="text-[13px] font-black" style={{ color: selectedJobBadge.starColor }}>
                {selectedJobBadge.jobName}
              </div>
            </div>
            <Sparkles className="h-3.5 w-3.5" style={{ color: selectedJobBadge.starColor }} />
          </div>
        ) : null
      }
    />
  );
}
