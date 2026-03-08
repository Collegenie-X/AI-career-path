'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Star, Briefcase, Map, GraduationCap } from 'lucide-react';
import { TabBar } from '@/components/tab-bar';
import { StarProfilePanel } from '@/components/star-profile-panel';
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
  JobCard,
  IntroBanner,
  StarInfoBanner,
  CTABanner,
  PageHeader,
  JobDetailModal,
} from './components';
import { HighSchoolAdmissionTab } from './components/HighSchoolAdmissionTab';
import { JobCareerRouteTab } from './components/JobCareerRouteTab';
import { LABELS } from './config';
import type { StarData, Job } from './types';

type ExploreTabId = 'star' | 'route' | 'admission';

const EXPLORE_TABS: { id: ExploreTabId; label: string; icon: React.ReactNode }[] = [
  { id: 'star', label: LABELS.explore_tab_star, icon: <Star className="w-3.5 h-3.5" /> },
  { id: 'route', label: LABELS.explore_tab_route, icon: <Map className="w-3.5 h-3.5" /> },
  { id: 'admission', label: LABELS.explore_tab_admission, icon: <GraduationCap className="w-3.5 h-3.5" /> },
];

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
    const jobId = searchParams.get('jobId');
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
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ paddingBottom: 'calc(65px + env(safe-area-inset-bottom, 0px))' }}
    >
      <StarField />

      <PageHeader selectedStar={selectedStar} onBack={() => setSelectedStar(null)} />

      {/* Top Tab Navigation */}
      {!selectedStar && (
        <div className="relative z-10 px-3 pt-3">
          <div
            className="flex rounded-2xl p-1"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {EXPLORE_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                style={{
                  background: activeTab === tab.id
                    ? 'rgba(132,94,247,0.35)'
                    : 'transparent',
                  color: activeTab === tab.id ? '#c084fc' : '#9ca3af',
                  boxShadow: activeTab === tab.id ? '0 2px 8px rgba(132,94,247,0.3)' : 'none',
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="relative z-10 px-3 py-3 space-y-3">
        {/* ── 직업탐색 탭 ── */}
        {activeTab === 'star' && (
          <>
            {!selectedStar ? (
              <>
                <IntroBanner />
                <div>
                  <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" /> {LABELS.star_grid_title}
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    {stars.map((s, i) => (
                      <StarCard key={s.id} star={s} index={i} onClick={() => setSelectedStar(s)} />
                    ))}
                    {[...Array(8 - stars.length)].map((_, i) => (
                      <div
                        key={`ph-${i}`}
                        className="rounded-3xl h-32 flex flex-col items-center justify-center gap-1"
                        style={{ background: 'rgba(255,255,255,0.02)', border: '2px dashed rgba(255,255,255,0.08)' }}
                      >
                        <div className="text-xl opacity-20">🌟</div>
                        <div className="text-[10px] text-gray-700 font-semibold">{LABELS.coming_soon}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <StarInfoBanner
                  star={selectedStar}
                  onOpenDetail={
                    'starProfile' in selectedStar && selectedStar.starProfile
                      ? () => setShowStarProfile(true)
                      : undefined
                  }
                />
                <div>
                  <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" /> {selectedStar.jobCount}{LABELS.jobs_title}
                  </h2>
                  <div className="space-y-2">
                    {selectedStar.jobs.map(job => (
                      <JobCard key={job.id} job={job} color={selectedStar.color} onClick={() => setSelectedJob(job)} />
                    ))}
                  </div>
                </div>
                <CTABanner star={selectedStar} />
              </>
            )}
          </>
        )}

        {/* ── 직업별 루트 탭 ── */}
        {activeTab === 'route' && <JobCareerRouteTab />}

        {/* ── 고입전략 탭 ── */}
        {activeTab === 'admission' && <HighSchoolAdmissionTab />}
      </div>

      {!selectedJob && <TabBar />}

      {selectedJob && selectedStar && (
        <JobDetailModal job={selectedJob} star={selectedStar} onClose={() => setSelectedJob(null)} />
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
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    }>
      <JobsExploreContent />
    </Suspense>
  );
}
