'use client';

/**
 * 직업 탐색(별) 탭 본문.
 *
 * 8개 별 JSON(수 MB)은 이 파일에서만 import 한다. page.tsx 가 이 컴포넌트를
 * dynamic import 하므로, 기본 탭(고입)만 보는 사용자는 별 데이터 번들을
 * 내려받지 않는다 → 초기 로딩 지연 감소.
 */

import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
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
import { StarCard, StarGridGroupedPanel, StarDetailPanel, IntroBanner, JobDetailModal } from './index';
import { useExploreUrlState } from '../utils/useExploreUrlState';
import { LABELS, EXPLORE_PAGE_LAYOUT_CLASS } from '../config';
import type { StarData, Job } from '../types';

const ALL_STARS = [
  exploreStar,
  createStar,
  techStar,
  connectStar,
  natureStar,
  orderStar,
  communicateStar,
  challengeStar,
] as unknown as StarData[];

const TOTAL_JOB_COUNT = ALL_STARS.reduce((sum, s) => sum + (s.jobs?.length ?? 0), 0);

export function StarTabContent() {
  const { searchParams, patchUrl } = useExploreUrlState();
  const [selectedStar, setSelectedStar] = useState<StarData | null>(createStar as StarData);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showStarProfile, setShowStarProfile] = useState(false);

  const stars = ALL_STARS;

  // URL → 상태: starId/jobId 동기화
  useEffect(() => {
    if (!searchParams) return;
    const starId = searchParams.get('starId');
    const jobId = searchParams.get('jobId');
    if (starId) {
      const star = stars.find((s) => s.id === starId);
      if (star && selectedStar?.id !== star.id) setSelectedStar(star);
      if (star && jobId) {
        const job = star.jobs.find((j: Job) => j.id === jobId);
        if (job && selectedJob?.id !== job.id) setSelectedJob(job);
      } else if (!jobId && selectedJob) {
        setSelectedJob(null);
      }
    }
    // starId가 없을 때는 기본 선택(창작의 별)을 유지한다.
    // 선택 해제는 handleSelectStar(null)에서 직접 처리한다.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleSelectStar = (star: StarData | null) => {
    setSelectedStar(star);
    if (!star) {
      setSelectedJob(null);
      patchUrl({ starId: null, jobId: null });
    } else {
      patchUrl({ starId: star.id, jobId: null });
    }
  };

  const handleSelectJob = (job: Job | null) => {
    setSelectedJob(job);
    patchUrl({ jobId: job?.id ?? null });
  };

  return (
    <>
      <TwoColumnPanelLayout
        hasSelection={selectedStar !== null}
        onClearSelection={() => handleSelectStar(null)}
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
                    onClick={() => handleSelectStar(selectedStar?.id === s.id ? null : s)}
                  />
                ))}
                {[...Array(Math.max(0, 8 - stars.length))].map((_, i) => (
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
              onClose={() => handleSelectStar(null)}
              onOpenJob={(job) => handleSelectJob(job)}
            />
          ) : null
        }
      />

      {selectedJob && selectedStar && (
        <JobDetailModal job={selectedJob} star={selectedStar} onClose={() => handleSelectJob(null)} />
      )}

      {showStarProfile && selectedStar && 'starProfile' in selectedStar && selectedStar.starProfile && (
        <StarProfilePanel
          star={selectedStar as Parameters<typeof StarProfilePanel>[0]['star']}
          onClose={() => setShowStarProfile(false)}
        />
      )}
    </>
  );
}

export { ALL_STARS, TOTAL_JOB_COUNT };
export default StarTabContent;
