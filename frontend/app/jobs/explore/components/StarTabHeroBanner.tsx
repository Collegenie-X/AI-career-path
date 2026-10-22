'use client';

/**
 * 직업 탐색 탭 전용 히어로 배너 — 패스·실행 히어로와 동일 레이아웃.
 * 별 개수/직업 수를 위해 별 JSON을 참조하므로 page.tsx 에서 dynamic import 한다.
 */

import { ExploreGuideBanner } from './ExploreGuideBanner';
import { ALL_STARS, TOTAL_JOB_COUNT } from './StarTabContent';
import { LABELS } from '../config';

export function StarTabHeroBanner() {
  return (
    <ExploreGuideBanner
      emoji="🌌"
      eyebrow={LABELS.intro_banner_title}
      title={LABELS.intro_banner_subtitle}
      highlight={LABELS.intro_banner_highlight}
      description={LABELS.intro_banner_description}
      stats={[
        { emoji: '⭐', value: ALL_STARS.length, label: '모험 별' },
        { emoji: '🎯', value: TOTAL_JOB_COUNT, label: '직업 퀘스트' },
      ]}
      accent="#c4b5fd"
      background="linear-gradient(135deg, rgba(108,92,231,0.28) 0%, rgba(168,85,247,0.18) 50%, rgba(59,130,246,0.12) 100%)"
    />
  );
}

export default StarTabHeroBanner;
