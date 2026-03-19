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
      className="flex-shrink-0 px-5 py-4"
      style={{
        background: `linear-gradient(135deg, ${star.color}28, ${star.color}0a)`,
        borderBottom: `1px solid ${star.color}30`,
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 overflow-hidden"
          style={{
            width: 52,
            height: 52,
            background: `linear-gradient(135deg, ${star.color}40, ${star.color}18)`,
            border: `1.5px solid ${star.color}44`,
          }}
        >
          {JOB_ILLUSTRATIONS[job.id] ? (
            <div className="w-full h-full p-1">{JOB_ILLUSTRATIONS[job.id]}</div>
          ) : (
            <span>{job.icon}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold text-white leading-snug">{job.name}</h2>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs text-gray-400">{star.emoji} {star.name}</span>
            <span className="text-xs text-gray-600">·</span>
            <span className="text-xs text-gray-500">{job.holland}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </div>
  );
}
