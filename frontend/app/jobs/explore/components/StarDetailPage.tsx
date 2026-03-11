'use client';

import { useEffect } from 'react';
import { Briefcase, ChevronLeft } from 'lucide-react';
import { StarInfoBanner } from './StarInfoBanner';
import { JobCard } from './JobCard';
import { CTABanner } from './CTABanner';
import { LABELS } from '../config';
import type { StarData, Job } from '../types';

interface StarDetailPageProps {
  star: StarData;
  onClose: () => void;
  onOpenJob: (job: Job) => void;
  onOpenDetail?: () => void;
}

/**
 * 별 상세 전체 페이지 - 전체 높이를 사용하며 하단에 CTA 고정
 */
export function StarDetailPage({
  star,
  onClose,
  onOpenJob,
  onOpenDetail,
}: StarDetailPageProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{
        backgroundColor: '#0d0d24',
      }}
    >
      <div
        className="w-full max-w-[430px] h-full flex flex-col"
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {/* 헤더: 뒤로가기 + 별 정보 강조 */}
        <div
          className="flex-shrink-0 flex items-center gap-4 px-4 py-4 border-b"
          style={{
            borderColor: 'rgba(255,255,255,0.12)',
            backgroundColor: `${star.color}15`,
            boxShadow: `0 0 24px ${star.color}15`,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors active:bg-white/20 hover:bg-white/10"
            style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
            aria-label="뒤로"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{
              backgroundColor: `${star.color}30`,
              border: `2px solid ${star.color}55`,
              boxShadow: `0 0 16px ${star.color}30`,
            }}
          >
            {star.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-white tracking-tight">{star.name}</h2>
            <p className="text-sm text-gray-300 mt-0.5">
              {star.jobCount}
              {LABELS.star_selected_subtitle}
            </p>
          </div>
        </div>

        {/* 스크롤 컨테이너: 별 소개 + 직업 목록 */}
        <div
          className="flex-1 overflow-y-auto overflow-x-hidden px-4 pt-4"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <StarInfoBanner
            star={star}
            compact
            onOpenDetail={
              'starProfile' in star && star.starProfile ? onOpenDetail : undefined
            }
          />

          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" />
              {star.jobCount}
              {LABELS.jobs_title}
            </h3>
            <div className="space-y-2 pb-4">
              {star.jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  color={star.color}
                  onClick={() => onOpenJob(job)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 하단 고정: CTA - 커리어 패스 만들기 */}
        <div
          className="flex-shrink-0 px-4 py-3 border-t"
          style={{
            borderColor: 'rgba(255,255,255,0.08)',
            backgroundColor: 'rgba(13,13,36,0.95)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <CTABanner star={star} />
        </div>
      </div>
    </div>
  );
}
