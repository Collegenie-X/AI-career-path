'use client';

import { Calendar, Target, Trophy } from 'lucide-react';
import { LABELS } from '../../config';
import type { Job, StarData } from '../../types';

interface TimelineTabProps {
  job: Job;
  star: StarData;
}

export function TimelineTab({ job, star }: TimelineTabProps) {
  const milestones = job.careerTimeline.milestones;

  return (
    <div className="px-4 pt-3 pb-6">
      {/* Header */}
      <div
        className="rounded-2xl p-4 mb-5 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${star.color}33, ${star.color}11)`, border: `1.5px solid ${star.color}44` }}
      >
        <div className="absolute -right-4 -top-4 text-8xl opacity-10">{job.icon}</div>
        <div className="text-white font-bold text-lg mb-1">{job.careerTimeline.title}</div>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{job.careerTimeline.totalYears}</span>
          <span className="flex items-center gap-1">{LABELS.timeline_cost_prefix} {job.careerTimeline.totalCost}</span>
        </div>
      </div>

      {/* Milestones */}
      <div className="relative">
        {/* Vertical line */}
        <div
          className="absolute left-[22px] top-0 bottom-0 w-0.5"
          style={{ background: `linear-gradient(to bottom, ${star.color}88, ${star.color}11)` }}
        />

        <div className="space-y-1">
          {milestones.map((m, i) => {
            const isHighSchool = m.period.startsWith('고');
            const isMiddle = m.period.startsWith('중');
            const isGrad = m.awards && m.awards.some(a => a.includes('합격'));
            return (
              <div key={i} className="flex gap-3 relative">
                {/* Node */}
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 z-10 relative"
                  style={{
                    background: isGrad
                      ? 'linear-gradient(135deg, #FBBF24, #F59E0B)'
                      : isHighSchool
                        ? `linear-gradient(135deg, ${star.color}, ${star.color}88)`
                        : isMiddle
                          ? 'linear-gradient(135deg, #8B5CF6, #6D28D9)'
                          : 'linear-gradient(135deg, #10B981, #059669)',
                    boxShadow: isGrad ? '0 0 16px #FBBF2466' : `0 0 8px ${star.color}44`,
                  }}
                >
                  {m.icon}
                </div>

                {/* Content */}
                <div
                  className="flex-1 rounded-2xl p-3 mb-2"
                  style={{
                    background: isGrad
                      ? 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(251,191,36,0.05))'
                      : 'rgba(255,255,255,0.03)',
                    border: isGrad
                      ? '1.5px solid rgba(251,191,36,0.4)'
                      : '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: isHighSchool ? `${star.color}33` : isMiddle ? '#8B5CF633' : '#10B98133',
                        color: isHighSchool ? star.color : isMiddle ? '#A78BFA' : '#34D399',
                      }}
                    >
                      {m.period} {m.semester}
                    </span>
                    {m.cost && <span className="text-[10px] text-gray-600">{LABELS.timeline_cost_inline} {m.cost}</span>}
                  </div>

                  <div className="font-bold text-white text-sm mb-1">{m.title}</div>
                  <div className="text-xs text-gray-400 leading-relaxed mb-1.5">
                    {m.activities.join(' · ')}
                  </div>

                  {m.awards && m.awards.length > 0 && (
                    <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                      {m.awards.map((a, ai) => (
                        <span key={ai} className="flex items-center gap-1 text-xs font-bold text-yellow-400">
                          <Trophy className="w-3 h-3" /> {a}
                        </span>
                      ))}
                    </div>
                  )}

                  {m.setak && (
                    <div
                      className="mt-2 p-2.5 rounded-xl"
                      style={{ background: 'rgba(108,92,231,0.1)', border: '1px solid rgba(108,92,231,0.25)' }}
                    >
                      <div className="text-[9px] font-bold text-purple-400 mb-0.5 uppercase tracking-wider">{LABELS.timeline_setak_label}</div>
                      <div className="text-xs text-gray-300 leading-relaxed">{m.setak}</div>
                    </div>
                  )}

                  <div className="mt-2 text-xs font-bold flex items-center gap-1" style={{ color: star.color }}>
                    <span>✓</span> {m.achievement}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Key success */}
      <div
        className="mt-4 rounded-2xl p-4"
        style={{ background: `linear-gradient(135deg, ${star.color}22, ${star.color}11)`, border: `1.5px solid ${star.color}44` }}
      >
        <div className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Target className="w-4 h-4" style={{ color: star.color }} />
          {LABELS.modal_key_success}
        </div>
        <div className="space-y-2">
          {job.careerTimeline.keySuccess.map((k, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: `${star.color}33` }}>
                <span className="text-[10px]">✓</span>
              </div>
              <span className="text-sm text-gray-300">{k}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-white/10 text-xs text-gray-500 flex items-center justify-between">
          <span>{LABELS.modal_total_cost}</span>
          <span className="font-bold text-white">{job.careerTimeline.totalCost}</span>
        </div>
      </div>
    </div>
  );
}
