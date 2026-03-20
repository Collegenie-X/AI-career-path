'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Star, GraduationCap, School, Sparkles } from 'lucide-react';
import { StarProfilePanel } from '@/components/star-profile-panel';
import { TwoColumnPanelLayout } from '@/components/TwoColumnPanelLayout';
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
import { HighSchoolAdmissionTab } from './components/HighSchoolAdmissionTab';
import { UniversityAdmissionTab } from './components/UniversityAdmissionTab';
import { LABELS, EXPLORE_PAGE_LAYOUT_CLASS } from './config';
import type { StarData, Job } from './types';

type ExploreTabId = 'star' | 'admission' | 'university';

const EXPLORE_TABS: { id: ExploreTabId; label: string; icon: React.ReactNode }[] = [
  { id: 'star',       label: LABELS.explore_tab_star,        icon: <Star className="w-3.5 h-3.5" /> },
  { id: 'admission',  label: LABELS.explore_tab_admission,   icon: <GraduationCap className="w-3.5 h-3.5" /> },
  { id: 'university', label: LABELS.explore_tab_university,  icon: <School className="w-3.5 h-3.5" /> },
];

/* ── 상단 헤더 (career 페이지의 CareerPageHeader 와 동일 패턴) ── */
function ExplorePageHeader() {
  return (
    <div
      className="sticky top-0 z-20 px-4"
      style={{ backgroundColor: 'rgba(10,10,30,0.92)', backdropFilter: 'blur(20px)' }}
    >
      <div className="web-container py-4">
        <div className="flex items-center justify-between gap-4 mb-3 w-full">
          <div>
            <h1 className="text-2xl md:text-[30px] font-black tracking-tight bg-gradient-to-r from-white via-purple-200 to-indigo-300 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(139,92,246,0.35)]">
              {LABELS.page_title}
            </h1>
            <p className="mt-1 inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold text-indigo-200 border border-indigo-400/30 bg-indigo-500/10">
              {LABELS.page_subtitle}
            </p>
          </div>
          <div
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-2xl border"
            style={{
              background: 'linear-gradient(135deg, rgba(108,92,231,0.2), rgba(15,23,42,0.6))',
              borderColor: 'rgba(108,92,231,0.4)',
            }}
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-[13px] font-bold text-purple-300">8개 별의 직업 세계</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── 탭 네비게이션 (career 셸 내부 탭바와 동일 패턴) ── */
function ExploreTabBar({
  activeTab,
  onTabChange,
}: {
  activeTab: ExploreTabId;
  onTabChange: (id: ExploreTabId) => void;
}) {
  return (
    <div
      className="grid gap-1.5 p-1"
      style={{
        gridTemplateColumns: `repeat(${EXPLORE_TABS.length}, 1fr)`,
        backgroundColor: 'rgba(255,255,255,0.06)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      {EXPLORE_TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className="relative flex items-center justify-center gap-1.5 overflow-hidden py-2.5 rounded-md text-xs font-bold"
            style={{
              backgroundColor: isActive ? 'transparent' : 'rgba(255,255,255,0.04)',
              color: isActive ? '#fff' : 'rgba(255,255,255,0.65)',
              border: isActive ? '1px solid transparent' : '1px solid rgba(255,255,255,0.08)',
            }}
            role="tab"
            aria-selected={isActive}
          >
            {isActive && (
              <motion.div
                layoutId="jobs-explore-tab-active-pill"
                className="absolute inset-0 rounded-md"
                style={{
                  background: 'linear-gradient(135deg, #6C5CE7, #a855f7)',
                  boxShadow: '0 4px 20px rgba(108,92,231,0.45), inset 0 1px 0 rgba(255,255,255,0.15)',
                }}
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              />
            )}
            <span className="relative z-[1] flex items-center justify-center gap-1.5">
              {tab.icon}
              <span>{tab.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ── 히어로 배너 (직업 탐색 탭 전용) ── */
function StarTabHeroBanner() {
  return (
    <div
      className="relative overflow-hidden px-4 py-5 md:px-5 md:py-6 mb-4 md:mb-5"
      style={{
        background: 'linear-gradient(135deg, rgba(108,92,231,0.28) 0%, rgba(168,85,247,0.18) 50%, rgba(59,130,246,0.12) 100%)',
      }}
    >
      <div
        className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #a855f7, transparent)' }}
      />
      <div
        className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }}
      />
      <div className="relative flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 flex-shrink-0 text-purple-300" />
            <span className="text-[13px] font-bold text-purple-300">{LABELS.intro_banner_title}</span>
          </div>
          <h2 className="text-2xl font-black text-white leading-tight mb-1.5">
            {LABELS.intro_banner_subtitle}{' '}
            <span className="bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
              직업 체험
            </span>
          </h2>
          <p className="text-[13px] text-gray-400 leading-relaxed">
            {LABELS.intro_banner_description}
          </p>
        </div>
        <div className="hidden md:flex items-center gap-3 flex-shrink-0">
          <div className="text-center">
            <div className="text-2xl font-black text-white">8</div>
            <div className="text-[11px] text-gray-500">직업 세계</div>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="text-center">
            <div className="text-2xl font-black text-white">25+</div>
            <div className="text-[11px] text-gray-500">직업 체험</div>
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
    <div className={EXPLORE_PAGE_LAYOUT_CLASS.pageRoot} style={{ backgroundColor: '#0a0a1e' }}>
      <StarField />

      {/* ── 상단 헤더 ── */}
      <ExplorePageHeader />

      {/* ── Tab + Content 통합 border 컨테이너 (career 셸과 동일) ── */}
      <div className={EXPLORE_PAGE_LAYOUT_CLASS.contentShell}>
        <div
          className={EXPLORE_PAGE_LAYOUT_CLASS.contentFrame}
          style={EXPLORE_PAGE_LAYOUT_CLASS.contentFrameStyle}
        >
          {/* 탭 바 */}
          <div
            className={EXPLORE_PAGE_LAYOUT_CLASS.tabNavigationArea}
            style={EXPLORE_PAGE_LAYOUT_CLASS.tabNavigationAreaStyle}
          >
            <ExploreTabBar activeTab={activeTab} onTabChange={handleTabChange} />
          </div>

          {/* 히어로 배너 (직업 탐색 탭만) */}
          {activeTab === 'star' && <StarTabHeroBanner />}

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
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center" style={{ backgroundColor: '#0a0a1e' }}>
        <Sparkles className="w-6 h-6 animate-pulse text-purple-400" />
      </div>
    }>
      <JobsExploreContent />
    </Suspense>
  );
}
