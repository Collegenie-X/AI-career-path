'use client';

import { X } from 'lucide-react';
import { JOB_ILLUSTRATIONS } from '../../constants/jobIllustrations';
import type { Job, StarData } from '../../types';

interface ModalHeaderProps {
  job: Job;
  star: StarData;
  onClose: () => void;
}

export function ModalHeader({ job, star, onClose }: ModalHeaderProps) {
  return (
    <div
      className="flex-shrink-0 flex items-center justify-between px-4 pb-3 border-b border-white/10"
      style={{ paddingTop: 'max(16px, env(safe-area-inset-top, 16px))', background: 'rgba(18,18,42,0.98)' }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${star.color}55, ${star.color}22)`, border: `1.5px solid ${star.color}66` }}
        >
          {JOB_ILLUSTRATIONS[job.id] ? (
            <div className="w-full h-full p-1">{JOB_ILLUSTRATIONS[job.id]}</div>
          ) : (
            <span>{job.icon}</span>
          )}
        </div>
        <div>
          <div className="font-bold text-white text-base leading-tight">{job.name}</div>
          <div className="text-xs flex items-center gap-1.5 mt-0.5">
            <span style={{ color: star.color }}>{star.name}</span>
            <span className="text-gray-600">·</span>
            <span className="text-gray-400">{job.holland}</span>
          </div>
        </div>
      </div>
      <button
        onClick={onClose}
        className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
        style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
      >
        <X className="w-4 h-4 text-white" />
      </button>
    </div>
  );
}
