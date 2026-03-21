'use client';

import type { ReactNode } from 'react';
import { EXPLORE_PAGE_LAYOUT_CLASS, LABELS } from '../config';

type StarGridGroupedPanelProps = {
  headerSlot: ReactNode;
  children: ReactNode;
};

/**
 * 커리어 경험 직업 탐색 — 8개 별 카드를 패스/커리어와 같은 glass + primary 테두리로 묶어
 * 한 여정처럼 보이게 합니다.
 */
export function StarGridGroupedPanel({ headerSlot, children }: StarGridGroupedPanelProps) {
  return (
    <div className={EXPLORE_PAGE_LAYOUT_CLASS.starGridPanelRoot}>
      <div className={EXPLORE_PAGE_LAYOUT_CLASS.starGridPanelGlow} aria-hidden />
      <div className={EXPLORE_PAGE_LAYOUT_CLASS.starGridPanelHeader}>
        {headerSlot}
        <p className="mt-1.5 text-[11px] leading-snug text-white/45 md:text-xs">
          {LABELS.star_grid_panel_caption}
        </p>
      </div>
      <div className={EXPLORE_PAGE_LAYOUT_CLASS.starGridPanelBody}>{children}</div>
    </div>
  );
}
