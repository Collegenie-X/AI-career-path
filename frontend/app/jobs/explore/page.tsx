'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Star, GraduationCap, School, Sparkles } from 'lucide-react';
import { StarProfilePanel } from '@/components/star-profile-panel';
import { TwoColumnPanelLayout } from '@/components/TwoColumnPanelLayout';
import { StickySectionPageHeader } from '@/components/section-shell/StickySectionPageHeader';
import { GradientSegmentedTabBar } from '@/components/section-shell/GradientSegmentedTabBar';
import type { GradientSegmentedTabItem } from '@/components/section-shell/GradientSegmentedTabBar';
import exploreStar from '@/data/stars/explore-star.json';
import createStar from '@/data/stars/create-star.json';
import techStar from '@/data/stars/tech-star.json';
import connectStar from '@/data/stars/connect-star.json';
import natureStar from '@/data/stars/nature-star.json';
import orderStar from '@/data/stars/order-star.json';
import communicateStar from '@/data/stars/communicate-star.json';
import challengeStar from '@/data/stars/challenge-star.json';
import {
  StarField,
  StarCard,
  StarGridGroupedPanel,
  StarDetailPanel,
  IntroBanner,
  JobDetailModal,
} from './components';
import { AdmissionExploreHeroBanner } from './components/AdmissionExploreHeroBanner';
import { HighSchoolAdmissionTab } from './components/HighSchoolAdmissionTab';
import { UniversityAdmissionTab } from './components/UniversityAdmissionTab';
import { LABELS, EXPLORE_PAGE_LAYOUT_CLASS } from './config';
import type { StarData, Job } from './types';

type ExploreTabId = 'star' | 'admission' | 'university';

const EXPLORE_SEGMENT_TABS: readonly GradientSegmentedTabItem<ExploreTabId>[] = [
  { id: 'star', label: LABELS.explore_tab_star, icon: <Star className="h-3.5 w-3.5" /> },
  { id: 'admission', label: LABELS.explore_tab_admission, icon: <GraduationCap className="h-3.5 w-3.5" /> },
  { id: 'university', label: LABELS.explore_tab_university, icon: <School className="h-3.5 w-3.5" /> },
];

/* ── 히어로 배너 (직업 탐색 탭 전용) — 패스·실행 히어로와 동일 레이아웃 ── */
function StarTabHeroBanner() {
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
            <p className="mb-1.5 text-[13px] font-bold uppercase tracking-wider" style={{ color: accent }}>
              {LABELS.intro_banner_title}
            </p>
            <h2 className="mb-2 text-xl font-black leading-tight text-white md:text-2xl">
              {LABELS.intro_banner_subtitle}{' '}
              <span className="bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
                {LABELS.intro_banner_highlight}
              </span>
            </h2>
            <p className="max-w-2xl text-[13px] leading-relaxed text-gray-300">{LABELS.intro_banner_description}</p>
          </div>
        </div>
        <div className="flex flex-shrink-0 flex-wrap items-center gap-3 self-end sm:gap-4 lg:justify-end">
          <div className="text-center">
            <div className="text-[15px] font-black text-white">8</div>
            <div className="-mt-0.5 text-[13px] text-gray-500">직업 세계</div>
          </div>
          <div className="hidden h-7 w-px bg-white/10 sm:block" />
          <div className="text-center">
            <div className="text-[15px] font-black text-white">25+</div>
            <div className="-mt-0.5 text-[13px] text-gray-500">직업 체험</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function JobsExploreContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<ExploreTabId>('star');
  const [selectedStar, setSelectedStar] = useState<StarData | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showStarProfile, setShowStarProfile] = useState(false);

  const stars = [
    exploreStar,
    createStar,
    techStar,
    connectStar,
    natureStar,
    orderStar,
    communicateStar,
    challengeStar,
  ] as StarData[];

  useEffect(() => {
    const starId = searchParams.get('starId');
    const jobId  = searchParams.get('jobId');
    if (starId && jobId) {
      const star = stars.find(s => s.id === starId);
      if (star) {
        setSelectedStar(star);
        const job = star.jobs.find((j: Job) => j.id === jobId);
        if (job) setSelectedJob(job);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleTabChange = (tabId: ExploreTabId) => {
    setActiveTab(tabId);
    if (tabId !== 'star') {
      setSelectedStar(null);
      setSelectedJob(null);
    }
  };

  return (
    <div className={EXPLORE_PAGE_LAYOUT_CLASS.pageRoot} style={{ backgroundColor: 'rgb(var(--background))' }}>
      <StarField />

      <StickySectionPageHeader
        title={LABELS.page_title}
        subtitlePill={LABELS.page_subtitle}
        rightSlot={
          <div
            className="hidden items-center gap-2 rounded-2xl border px-4 py-2 md:flex"
            style={{
              background: 'linear-gradient(135deg, rgba(108,92,231,0.2), rgba(15,23,42,0.6))',
              borderColor: 'rgba(108,92,231,0.4)',
            }}
          >
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span className="text-[13px] font-bold text-purple-300">{LABELS.page_header_trailing_badge}</span>
          </div>
        }
      />

      {/* ── Tab + Content 통합 border 컨테이너 (career·실행과 동일) ── */}
      <div className={EXPLORE_PAGE_LAYOUT_CLASS.contentShell}>
        <div
          className={EXPLORE_PAGE_LAYOUT_CLASS.contentFrame}
          style={EXPLORE_PAGE_LAYOUT_CLASS.contentFrameStyle}
        >
          <div
            className={EXPLORE_PAGE_LAYOUT_CLASS.tabNavigationArea}
            style={EXPLORE_PAGE_LAYOUT_CLASS.tabNavigationAreaStyle}
          >
            <GradientSegmentedTabBar
              tabs={EXPLORE_SEGMENT_TABS}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              embeddedInSectionShell
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
            {activeTab === 'star' && (
              <TwoColumnPanelLayout
                hasSelection={selectedStar !== null}
                onClearSelection={() => setSelectedStar(null)}
                emptyPlaceholderText="별을 선택하세요"
                emptyPlaceholderSubText="왼쪽에서 별을 클릭하면 직업 목록이 여기에 표시됩니다"
                listSlot={
                  <div
                    className={EXPLORE_PAGE_LAYOUT_CLASS.starGridListPanel}
                    style={EXPLORE_PAGE_LAYOUT_CLASS.starGridListPanelStyle}
                  >
                    <IntroBanner />
                    <StarGridGroupedPanel
                      headerSlot={
                        <h2 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-400">
                          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                          {LABELS.star_grid_title}
                        </h2>
                      }
                    >
                      <div className={EXPLORE_PAGE_LAYOUT_CLASS.starGrid}>
                        {stars.map((s, i) => (
                          <StarCard
                            key={s.id}
                            star={s}
                            index={i}
                            isSelected={selectedStar?.id === s.id}
                            onClick={() => setSelectedStar(prev => prev?.id === s.id ? null : s)}
                          />
                        ))}
                        {[...Array(8 - stars.length)].map((_, i) => (
                          <div
                            key={`ph-${i}`}
                            className="flex h-32 flex-col items-center justify-center gap-1 rounded-3xl"
                            style={{ background: 'rgba(255,255,255,0.02)', border: '2px dashed rgba(255,255,255,0.08)' }}
                          >
                            <div className="text-xl opacity-20">🌟</div>
                            <div className="text-[11px] font-semibold text-gray-700">{LABELS.coming_soon}</div>
                          </div>
                        ))}
                      </div>
                    </StarGridGroupedPanel>
                  </div>
                }
                detailSlot={
                  selectedStar ? (
                    <StarDetailPanel
                      star={selectedStar}
                      onClose={() => setSelectedStar(null)}
                      onOpenJob={(job) => setSelectedJob(job)}
                    />
                  ) : null
                }
              />
            )}

            {/* 고입 탐색 탭 */}
            {activeTab === 'admission' && <HighSchoolAdmissionTab />}

            {/* 대입 탐색 탭 */}
            {activeTab === 'university' && <UniversityAdmissionTab />}
          </motion.div>
        </div>
      </div>

      {/* 직업 상세 모달 (2컬럼 위에 오버레이) */}
      {selectedJob && selectedStar && (
        <JobDetailModal
          job={selectedJob}
          star={selectedStar}
          onClose={() => setSelectedJob(null)}
        />
      )}

      {showStarProfile && selectedStar && 'starProfile' in selectedStar && selectedStar.starProfile && (
        <StarProfilePanel
          star={selectedStar as Parameters<typeof StarProfilePanel>[0]['star']}
          onClose={() => setShowStarProfile(false)}
        />
      )}
    </div>
  );
}

export default function JobsExplorePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center" style={{ backgroundColor: 'rgb(var(--background))' }}>
        <Sparkles className="w-6 h-6 animate-pulse text-purple-400" />
      </div>
    }>
      <JobsExploreContent />
    </Suspense>
  );
}
