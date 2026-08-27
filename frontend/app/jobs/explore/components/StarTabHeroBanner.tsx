'use client';

/**
 * 직업 탐색 탭 전용 히어로 배너 — 패스·실행 히어로와 동일 레이아웃.
 * 별 개수/직업 수를 위해 별 JSON을 참조하므로 page.tsx 에서 dynamic import 한다.
 */

import { Sparkles } from 'lucide-react';
import { ALL_STARS, TOTAL_JOB_COUNT } from './StarTabContent';
import { LABELS } from '../config';

export function StarTabHeroBanner() {
  const accent = '#c4b5fd';
  const glowTop = '#a855f7';
  const glowBottom = '#3b82f6';
  return (
    <div
      className="relative mb-4 overflow-hidden border-t-0 px-4 py-5 md:mb-5 md:px-5 md:py-6"
      style={{
        background: 'linear-gradient(135deg, rgba(108,92,231,0.28) 0%, rgba(168,85,247,0.18) 50%, rgba(59,130,246,0.12) 100%)',
        border: '1.5px solid rgba(108,92,231,0.35)',
      }}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 opacity-20"
        style={{ background: `radial-gradient(circle, ${glowTop}, transparent)` }}
      />
      <div
        className="pointer-events-none absolute -bottom-6 -left-6 h-28 w-28 opacity-15"
        style={{ background: `radial-gradient(circle, ${glowBottom}, transparent)` }}
      />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-1 gap-4">
          <div
            className="flex h-14 w-14 flex-shrink-0 items-center justify-center md:h-16 md:w-16"
            style={{
              background: 'rgba(0,0,0,0.25)',
              border: `1px solid ${accent}55`,
              borderRadius: '0.75rem',
            }}
            aria-hidden
          >
            <Sparkles className="h-7 w-7 md:h-8 md:w-8" style={{ color: accent }} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="mb-1.5 text-[13px] font-bold uppercase tracking-wider" style={{ color: accent }} suppressHydrationWarning>
              {LABELS.intro_banner_title}
            </p>
            <h2 className="mb-2 text-xl font-black leading-tight text-white md:text-2xl">
              {LABELS.intro_banner_subtitle}{' '}
              <span className="bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent" suppressHydrationWarning>
                {LABELS.intro_banner_highlight}
              </span>
            </h2>
            <p className="max-w-2xl text-[13px] leading-relaxed text-gray-300" suppressHydrationWarning>{LABELS.intro_banner_description}</p>
          </div>
        </div>
        <div className="flex flex-shrink-0 flex-wrap items-center gap-3 self-end sm:gap-4 lg:justify-end">
          <div className="text-center">
            <div className="text-[15px] font-black text-white">{ALL_STARS.length}</div>
            <div className="-mt-0.5 text-[13px] text-gray-500" suppressHydrationWarning>모험 별 ⭐</div>
          </div>
          <div className="hidden h-7 w-px bg-white/10 sm:block" />
          <div className="text-center">
            <div className="text-[15px] font-black text-white">{TOTAL_JOB_COUNT}</div>
            <div className="-mt-0.5 text-[13px] text-gray-500" suppressHydrationWarning>직업 퀘스트 🎯</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StarTabHeroBanner;
