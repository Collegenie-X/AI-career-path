'use client';

import { Star, Play } from 'lucide-react';
import { JOB_ILLUSTRATIONS } from '../constants/jobIllustrations';
import type { Job } from '../types';

interface JobCardProps {
  job: Job;
  color: string;
  onClick: () => void;
}

export function JobCard({ job, color, onClick }: JobCardProps) {
  const illus = JOB_ILLUSTRATIONS[job.id];

  return (
    <button
      className="w-full rounded-2xl p-3 flex items-center gap-2.5 text-left transition-all active:scale-[0.98] group overflow-hidden relative"
      style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(255,255,255,0.08)` }}
      onClick={onClick}
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(135deg, ${color}11, transparent)` }}
      />

      {/* Illustration / Icon */}
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform overflow-hidden relative"
        style={{ background: `linear-gradient(135deg, ${color}44, ${color}22)`, border: `1px solid ${color}55` }}
      >
        {illus ? (
          <div className="w-full h-full p-1">{illus}</div>
        ) : (
          <span className="text-2xl">{job.icon}</span>
        )}
      </div>

      <div className="flex-1 min-w-0 relative">
        <div className="font-bold text-white text-sm mb-0.5">{job.name}</div>
        <div className="text-xs text-gray-400 line-clamp-1 mb-1.5">{job.shortDesc}</div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] px-1.5 py-0.5 rounded-full font-semibold" style={{ backgroundColor: `${color}22`, color }}>
            {job.holland}
          </span>
          <span className="text-[12px] text-gray-500">💰 {job.salaryRange.split('~')[0]}~</span>
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-2.5 h-2.5" style={{ color: i < job.futureGrowth ? '#FBBF24' : '#333', fill: i < job.futureGrowth ? '#FBBF24' : 'none' }} />
            ))}
          </div>
        </div>
      </div>

      <div
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 relative group-hover:scale-110 transition-transform"
        style={{ background: `linear-gradient(135deg, ${color}, ${color}88)`, boxShadow: `0 0 12px ${color}66` }}
      >
        <Play className="w-3.5 h-3.5 text-white fill-white" />
      </div>
    </button>
  );
}
