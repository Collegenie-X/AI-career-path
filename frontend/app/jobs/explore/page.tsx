'use client';

import { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { useExploreUrlState } from './utils/useExploreUrlState';
import { GradientSegmentedTabBar } from '@/components/section-shell/GradientSegmentedTabBar';
import type { GradientSegmentedTabItem } from '@/components/section-shell/GradientSegmentedTabBar';
import { StarField } from './components';
import { AdmissionExploreHeroBanner } from './components/AdmissionExploreHeroBanner';
import {
  ExplorePageSkeleton,
  ExploreHeroSkeleton,
  ExploreTabBodySkeleton,
} from './components/ExploreSkeletons';
import {
  SECTION_SHELL_TAB_NAVIGATION_AREA_CLASS_NAME_FLUSH_RIGHT,
  SECTION_SHELL_TAB_NAVIGATION_AREA_STYLE,
} from '@/components/section-shell/section-shell-layout.constants';
import { LABELS, EXPLORE_PAGE_LAYOUT_CLASS } from './config';

type ExploreTabId = 'star' | 'admission' | 'university';

/* ── 탭 본문 지연 로딩 ──────────────────────────────────────────────
 * 고입·대입·직업 탭은 각각 수 MB 규모의 JSON 데이터를 참조한다. 세 탭을 모두
 * 정적 import 하면 첫 진입 시 전부 내려받게 되어 로딩이 눈에 띄게 지연된다.
 * 탭 단위로 분할하고, 그 사이에는 실제 레이아웃과 같은 스켈레톤을 보여준다. */
const HighSchoolAdmissionTab = dynamic(
  () => import('./components/HighSchoolAdmissionTab').then((m) => m.HighSchoolAdmissionTab),
  { ssr: false, loading: () => <ExploreTabBodySkeleton gridCount={6} /> }
);

const UniversityAdmissionTab = dynamic(
  () => import('./components/UniversityAdmissionTab').then((m) => m.UniversityAdmissionTab),
  { ssr: false, loading: () => <ExploreTabBodySkeleton gridCount={6} /> }
);

const StarTabContent = dynamic(
  () => import('./components/StarTabContent').then((m) => m.StarTabContent),
  { ssr: false, loading: () => <ExploreTabBodySkeleton gridCount={8} /> }
);

const StarTabHeroBanner = dynamic(
  () => import('./components/StarTabHeroBanner').then((m) => m.StarTabHeroBanner),
  { ssr: false, loading: () => <ExploreHeroSkeleton /> }
);

const EXPLORE_SEGMENT_TABS: readonly GradientSegmentedTabItem<ExploreTabId>[] = [
  { id: 'admission', emoji: '🏫', label: LABELS.explore_tab_admission },
  { id: 'university', emoji: '🎓', label: LABELS.explore_tab_university },
  { id: 'star', emoji: '🌌', label: LABELS.explore_tab_star },
];

const VALID_EXPLORE_TABS: ExploreTabId[] = ['star', 'admission', 'university'];

function JobsExploreContent() {
  const { searchParams, patchUrl } = useExploreUrlState();

  // SSR-safe 초기값: useSearchParams는 서버 렌더 시 비어 있어, URL에서 읽은 값을
  // useState 초기값에 쓰면 서버('admission')와 클라이언트('?tab=…')의 첫 렌더가 어긋나
  // hydration 불일치가 발생한다. 항상 기본 탭 'admission'(고입)으로 통일하고,
  // 아래 useEffect가 마운트 직후 URL의 ?tab= 값으로 동기화한다.
  const [activeTab, setActiveTab] = useState<ExploreTabId>('admission');

  // URL → 상태: tab 동기화 (starId/jobId는 직업 탐색 탭 본문이 자체 처리)
  useEffect(() => {
    if (!searchParams) return;
    const nextTab = searchParams.get('tab') as ExploreTabId | null;
    if (nextTab && VALID_EXPLORE_TABS.includes(nextTab) && nextTab !== activeTab) {
      setActiveTab(nextTab);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleTabChange = (tabId: ExploreTabId) => {
    setActiveTab(tabId);
    const patch: Record<string, string | null> = {
      tab: tabId === 'star' ? null : tabId, // star가 기본이라 명시 안 함
    };
    if (tabId !== 'star') {
      patch.starId = null;
      patch.jobId = null;
    }
    // 탭 전환 시 다른 탭 전용 파라미터는 정리
    if (tabId !== 'admission') {
      patch.category = patch.category ?? null;
      patch.school = null;
    }
    if (tabId !== 'university') {
      patch.subView = null;
    }
    patchUrl(patch);
  };

  return (
    <div className={EXPLORE_PAGE_LAYOUT_CLASS.pageRoot} style={{ backgroundColor: 'rgb(var(--background))' }}>
      <StarField />

      {/* ── Tab + Content 통합 border 컨테이너 (career·실행과 동일) ── */}
      <div className={EXPLORE_PAGE_LAYOUT_CLASS.contentShell}>
        <div
          className={EXPLORE_PAGE_LAYOUT_CLASS.contentFrame}
          style={EXPLORE_PAGE_LAYOUT_CLASS.contentFrameStyle}
        >
          <div
            className={SECTION_SHELL_TAB_NAVIGATION_AREA_CLASS_NAME_FLUSH_RIGHT}
            style={SECTION_SHELL_TAB_NAVIGATION_AREA_STYLE}
          >
            <GradientSegmentedTabBar
              tabs={EXPLORE_SEGMENT_TABS}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              embeddedInSectionShell
              compact
              ariaLabel="커리어 경험 탭 전환"
            />
          </div>

          {/* 히어로 배너 — 탭별 표시 */}
          {activeTab === 'star' && <StarTabHeroBanner />}
          {activeTab === 'admission' && <AdmissionExploreHeroBanner variant="highSchool" />}
          {activeTab === 'university' && <AdmissionExploreHeroBanner variant="university" />}

          {/* ── 본문 — 탭 전환 시 가벼운 RPG 스테이지 전환 ── */}
          <motion.div
            key={activeTab}
            className={EXPLORE_PAGE_LAYOUT_CLASS.bodyContentArea}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          >
            {/* 직업 탐색 탭 — 2컬럼 마스터-디테일 */}
            {activeTab === 'star' && <StarTabContent />}

            {/* 고입 탐색 탭 */}
            {activeTab === 'admission' && <HighSchoolAdmissionTab />}

            {/* 대입 탐색 탭 */}
            {activeTab === 'university' && <UniversityAdmissionTab />}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function JobsExplorePage() {
  return (
    <Suspense fallback={<ExplorePageSkeleton />}>
      <JobsExploreContent />
    </Suspense>
  );
}
