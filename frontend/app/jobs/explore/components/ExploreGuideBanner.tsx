'use client';

/**
 * 탐색 탭 공통 가이드 띠 — 기본은 한 줄(제목 · 숫자 칩)만, 설명은 "자세히"를 눌러 펼친다.
 * 고입 · 대입 · 직업 탭이 같은 모양을 쓴다.
 */

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export type ExploreGuideStat = { readonly emoji: string; readonly value: string | number; readonly label: string };

type ExploreGuideBannerProps = {
  readonly emoji: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly highlight: string;
  readonly description: string;
  readonly stats: readonly ExploreGuideStat[];
  readonly accent: string;
  readonly background: string;
};

export function ExploreGuideBanner({
  emoji,
  eyebrow,
  title,
  highlight,
  description,
  stats,
  accent,
  background,
}: ExploreGuideBannerProps) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="relative mb-3 overflow-hidden border-t-0 md:mb-4"
      style={{ background, border: '1.5px solid rgba(108,92,231,0.35)' }}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="group relative flex w-full flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2.5 text-left md:px-4"
      >
        <motion.span
          aria-hidden
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center text-[22px]"
          style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${accent}55`, borderRadius: '0.75rem' }}
          animate={{ y: [0, -3, 0], rotate: [0, -6, 6, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          {emoji}
        </motion.span>
        <span className="min-w-0 flex-1 basis-[220px]">
          <span className="block text-[11px] font-bold tracking-wider" style={{ color: accent }} suppressHydrationWarning>
            {eyebrow}
          </span>
          <span className="block text-[15px] font-black leading-snug text-white md:text-[17px]">
            {title}{' '}
            <span
              className="bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent"
              suppressHydrationWarning
            >
              {highlight}
            </span>
          </span>
        </span>
        <span className="flex flex-shrink-0 items-center gap-1.5">
          {stats.map((s) => (
            <span
              key={s.label}
              className="flex items-center gap-1 px-2 py-1 text-[12px] font-semibold text-gray-300"
              style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${accent}40` }}
              suppressHydrationWarning
            >
              {s.emoji}
              <b className="text-[14px] font-black" style={{ color: accent }}>
                {s.value}
              </b>
              {s.label}
            </span>
          ))}
        </span>
        <span
          className="flex-shrink-0 px-2 py-1 text-[12px] font-bold transition group-hover:text-white"
          style={{ color: accent, background: 'rgba(0,0,0,0.3)', border: `1px solid ${accent}40` }}
        >
          {open ? '🙈 접기 🔼' : '💡 자세히 🔽'}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="overflow-hidden"
          >
            <p
              className="border-t border-white/10 px-3 py-2.5 text-[13px] leading-relaxed text-gray-300 md:px-4"
              suppressHydrationWarning
            >
              📖 {description}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ExploreGuideBanner;
