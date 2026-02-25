'use client';

import { Clock, TrendingUp, Briefcase, Zap, Star } from 'lucide-react';
import { PhaseIllustration } from '../PhaseIllustration';
import { LABELS } from '../../config';
import type { Job, StarData, WorkPhase } from '../../types';

interface ProcessTabProps {
  job: Job;
  star: StarData;
  currentPhase: WorkPhase;
  processStep: number;
  phases: WorkPhase[];
  isLastPhase: boolean;
}

export function ProcessTab({ job, star, currentPhase, processStep, phases, isLastPhase }: ProcessTabProps) {
  return (
    <div className="px-4 pt-2 pb-4">
      {/* Progress bar */}
      <div className="flex gap-1.5 mb-1">
        {phases.map((_, i) => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full transition-all duration-500"
            style={{ backgroundColor: i <= processStep ? star.color : 'rgba(255,255,255,0.1)' }}
          />
        ))}
      </div>
      <div className="text-[11px] text-gray-500 mb-3">
        {processStep + 1} / {phases.length} {LABELS.process_step_counter}
      </div>

      {/* Big illustration */}
      <PhaseIllustration phase={currentPhase} jobId={job.id} color={star.color} />

      {/* Title + desc */}
      <div className="mb-4">
        <h3 className="text-white font-bold text-2xl mb-2 leading-tight">{currentPhase.title}</h3>
        <p className="text-gray-300 text-sm leading-relaxed">{currentPhase.description}</p>
      </div>

      {/* Duration */}
      <div
        className="flex items-center gap-2 px-4 py-3 rounded-2xl mb-4"
        style={{ background: `${star.color}15`, border: `1px solid ${star.color}33` }}
      >
        <Clock className="w-4 h-4 flex-shrink-0" style={{ color: star.color }} />
        <span className="text-sm font-semibold text-white">{LABELS.modal_duration}</span>
        <span className="ml-auto text-sm font-bold" style={{ color: star.color }}>{currentPhase.duration}</span>
      </div>

      {/* Example */}
      {currentPhase.example && (
        <div
          className="rounded-2xl p-4 mb-4 relative overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <div className="absolute top-3 right-3 text-2xl opacity-20">💡</div>
          <div className="text-xs font-bold text-yellow-400 mb-2 flex items-center gap-1.5">
            <span className="text-base">💡</span> {LABELS.modal_example}
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">{currentPhase.example}</p>
        </div>
      )}

      {/* Tools */}
      <div className="mb-4">
        <div className="text-xs font-bold text-gray-400 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
          <Briefcase className="w-3.5 h-3.5" /> {LABELS.modal_tools}
        </div>
        <div className="flex flex-wrap gap-2">
          {currentPhase.tools.map((tool, i) => (
            <span
              key={i}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold"
              style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.12)' }}
            >
              {tool}
            </span>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="mb-4">
        <div className="text-xs font-bold text-gray-400 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
          <Zap className="w-3.5 h-3.5" /> {LABELS.modal_skills}
        </div>
        <div className="flex flex-wrap gap-2">
          {currentPhase.skills.map((skill, i) => (
            <span
              key={i}
              className="px-3 py-1.5 rounded-xl text-xs font-bold"
              style={{ background: `${star.color}22`, color: star.color, border: `1px solid ${star.color}44` }}
            >
              ⚡ {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Last step summary */}
      {isLastPhase && (
        <div
          className="rounded-2xl p-4 mt-2"
          style={{ background: `linear-gradient(135deg, ${star.color}22, ${star.color}11)`, border: `1.5px solid ${star.color}44` }}
        >
          <div className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" style={{ color: star.color }} />
            {LABELS.modal_summary}
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">{LABELS.modal_salary}</span>
              <span className="text-white font-semibold">{job.salaryRange}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">{LABELS.modal_ai_risk}</span>
              <span className="font-semibold" style={{ color: star.color }}>{job.aiRisk}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">{LABELS.modal_future_growth}</span>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5" style={{ color: i < job.futureGrowth ? '#FBBF24' : '#333', fill: i < job.futureGrowth ? '#FBBF24' : 'none' }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
