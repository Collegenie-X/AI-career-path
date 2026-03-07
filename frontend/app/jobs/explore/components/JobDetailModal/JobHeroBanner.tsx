'use client';

import { useState } from 'react';
import { Brain, ChevronDown, ChevronUp } from 'lucide-react';
import { LABELS, HOLLAND_CODE_LABELS } from '../../config';
import type { Job, StarData } from '../../types';

interface JobHeroBannerProps {
  job: Job;
  star: StarData;
}

function parseHolland(code: string): string {
  return code
    .split('+')
    .map(c => HOLLAND_CODE_LABELS[c.trim()] ?? c.trim())
    .join(' + ');
}

export function JobHeroBanner({ job, star }: JobHeroBannerProps) {
  const competencies = job.coreCompetencies ?? [];
  const hollandLabel = parseHolland(job.holland);
  const hasIntroContent = !!(job.description || job.detailedIntroduction);
  const [isIntroExpanded, setIsIntroExpanded] = useState(true);

  return (
    <div
      className="flex-shrink-0 px-4 pt-3 pb-4 border-b border-white/10"
      style={{ background: 'rgba(18,18,42,0.97)' }}
    >
      {/* 직업 소개 아코디언 */}
      {hasIntroContent && (
        <div
          className="rounded-xl mb-3 overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <button
            type="button"
            onClick={() => setIsIntroExpanded(!isIntroExpanded)}
            className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left"
          >
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold text-white">{LABELS.hero_job_intro}</span>
              {!isIntroExpanded && job.description && (
                <p className="text-xs text-gray-500 truncate mt-0.5">{job.description}</p>
              )}
            </div>
            {isIntroExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
            )}
          </button>
          {isIntroExpanded && (
            <div className="px-3 pb-3 pt-0 border-t border-white/6">
              {job.description && (
                <p className="text-sm text-gray-300 leading-relaxed mb-2">
                  {job.description}
                </p>
              )}
              {job.detailedIntroduction && (
                <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">
                  {job.detailedIntroduction}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Suitable personality row */}
      <div
        className="rounded-2xl px-3 py-2.5 mb-2.5"
        style={{ background: `${star.color}12`, border: `1px solid ${star.color}30` }}
      >
        <div className="flex items-center gap-1.5 mb-1.5">
          <Brain className="w-3.5 h-3.5 flex-shrink-0" style={{ color: star.color }} />
          <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: star.color }}>
            {LABELS.hero_suitable_personality}
          </span>
          <span
            className="ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: `${star.color}25`, color: star.color }}
          >
            {hollandLabel}
          </span>
        </div>
        {competencies.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {competencies.map((c, i) => (
              <span
                key={i}
                className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                {c}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
