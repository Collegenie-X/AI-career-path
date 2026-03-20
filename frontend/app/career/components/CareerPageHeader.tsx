'use client';

import { Sparkles } from 'lucide-react';
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
    <div
      className="sticky top-0 z-20 px-4"
      style={{
        backgroundColor: 'rgba(10,10,30,0.92)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div className="web-container py-4">
        <div className="flex items-center justify-between gap-4 mb-3 w-full">
          <div>
            <h1 className="text-2xl md:text-[30px] font-black tracking-tight bg-gradient-to-r from-white via-purple-200 to-indigo-300 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(139,92,246,0.35)]">
              {CAREER_PAGE_HEADER_CONTENT.title}
            </h1>
            <p className="mt-1 inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold text-indigo-200 border border-indigo-400/30 bg-indigo-500/10">
              {CAREER_PAGE_HEADER_CONTENT.subtitle}
            </p>
          </div>
          {selectedJobBadge && (
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-2xl border shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
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
              <Sparkles className="w-3.5 h-3.5" style={{ color: selectedJobBadge.starColor }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
