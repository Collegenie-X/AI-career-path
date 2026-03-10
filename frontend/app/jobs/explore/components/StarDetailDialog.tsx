'use client';

import { useEffect } from 'react';
import { X, Briefcase } from 'lucide-react';
import { CareerPathStyleDialog } from './CareerPathStyleDialog';
import { StarInfoBanner } from './StarInfoBanner';
import { JobCard } from './JobCard';
import { CTABanner } from './CTABanner';
import { LABELS } from '../config';
import type { StarData, Job } from '../types';

interface StarDetailDialogProps {
  star: StarData;
  onClose: () => void;
  onOpenJob: (job: Job) => void;
  onOpenDetail?: () => void;
}

export function StarDetailDialog({
  star,
  onClose,
  onOpenJob,
  onOpenDetail,
}: StarDetailDialogProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <CareerPathStyleDialog onClose={onClose}>
      <div className="flex flex-col" style={{ maxHeight: 'calc(100vh - 56px)' }}>
        {/* 헤더: 별 이름 + 닫기 */}
        <div
          className="flex-shrink-0 flex items-center gap-3 px-4 py-4 border-b"
          style={{
            borderColor: 'rgba(255,255,255,0.08)',
            backgroundColor: `${star.color}08`,
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ backgroundColor: `${star.color}25` }}
          >
            {star.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-white">{star.name}</h2>
            <p className="text-xs text-gray-400">
              {star.jobCount}{LABELS.star_selected_subtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors active:bg-white/20"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* 스크롤 영역: StarInfoBanner + 직업 목록 + CTA */}
        <div
          className="flex-1 overflow-y-auto px-4 py-4"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <StarInfoBanner
            star={star}
            onOpenDetail={
              'starProfile' in star && star.starProfile ? onOpenDetail : undefined
            }
          />

          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" />
              {star.jobCount}{LABELS.jobs_title}
            </h3>
            <div className="space-y-2">
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

          <CTABanner star={star} />
        </div>
      </div>
    </CareerPathStyleDialog>
  );
}
