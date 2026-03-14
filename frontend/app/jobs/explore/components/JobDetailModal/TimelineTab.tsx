'use client';

import { Target, Trophy } from 'lucide-react';
import { LABELS } from '../../config';
import type { Job, StarData, Milestone } from '../../types';

interface TimelineTabProps {
  job: Job;
  star: StarData;
}

function CareerPathHeader({
  title,
  totalYears,
  totalCost,
  starColor,
}: {
  title: string;
  totalYears: string;
  totalCost: string;
  starColor: string;
}) {
  return (
    <div
      className="rounded-2xl p-4 mb-5 border"
      style={{
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderColor: `${starColor}25`,
      }}
    >
      <h3 className="font-extrabold text-white text-base mb-3">{title}</h3>
      <div className="flex flex-wrap gap-2">
        <div
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
          style={{ backgroundColor: `${starColor}15` }}
        >
          <span className="text-sm">📅</span>
          <span className="text-sm font-extrabold" style={{ color: starColor }}>
            {totalYears}
          </span>
        </div>
        <div
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
          style={{ backgroundColor: `${starColor}15` }}
        >
          <span className="text-sm">💰</span>
          <span className="text-sm font-extrabold" style={{ color: starColor }}>
            총 {totalCost}
          </span>
        </div>
      </div>
    </div>
  );
}

function TimelineStepRow({
  milestone,
  isLast,
  starColor,
}: {
  milestone: Milestone;
  isLast: boolean;
  starColor: string;
}) {
  const { period, semester, icon, title, activities, awards, achievement, cost } = milestone;
  const hasAwards = awards && awards.length > 0;

  return (
    <div
      className={`pb-5 ${!isLast ? 'border-b border-white/6 mb-5' : ''}`}
    >
      <div className="flex gap-3">
        <div className="flex flex-col items-center">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 z-10"
            style={{
              backgroundColor: `${starColor}25`,
              borderColor: `${starColor}50`,
            }}
          >
            <span className="text-lg">{icon}</span>
          </div>
          {!isLast && (
            <div
              className="flex-1 w-0.5 min-h-6 mt-1"
              style={{ backgroundColor: `${starColor}20` }}
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
            <span
              className="px-3 py-1.5 rounded-full text-xs font-extrabold"
              style={{ backgroundColor: `${starColor}20`, color: starColor }}
            >
              {period} {semester}
            </span>
            <div className="flex items-center gap-1">
              <span className="text-xs">💰</span>
              <span className="text-xs font-semibold text-gray-400">{cost ?? '무료'}</span>
            </div>
          </div>

          <h4 className="font-extrabold text-white text-sm mb-2">{title}</h4>

          <div className="space-y-0.5 mb-2">
            {activities.map((a) => (
              <p key={a} className="text-xs text-gray-400 leading-relaxed">
                • {a}
              </p>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {hasAwards &&
              awards!.map((award) => (
                <div key={award} className="flex items-center gap-1.5">
                  <Trophy
                    className="w-3 h-3 flex-shrink-0"
                    style={{
                      color: award.includes('합격') ? '#22C55E' : '#FBBF24',
                    }}
                  />
                  <span
                    className="text-xs font-semibold"
                    style={{
                      color: award.includes('합격') ? '#22C55E' : '#FBBF24',
                    }}
                  >
                    {award}
                  </span>
                </div>
              ))}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-green-500">✅</span>
              <span className="text-xs font-semibold text-green-500">{achievement}</span>
            </div>
          </div>

          {milestone.setak && (
            <div
              className="mt-2 p-2.5 rounded-xl"
              style={{
                backgroundColor: 'rgba(108,92,231,0.1)',
                border: '1px solid rgba(108,92,231,0.25)',
              }}
            >
              <div className="text-[11px] font-bold text-purple-400 mb-0.5 uppercase tracking-wider">
                {LABELS.timeline_setak_label}
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">{milestone.setak}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function KeySuccessSection({
  keySuccess,
  totalCost,
}: {
  keySuccess: string[];
  totalCost: string;
}) {
  return (
    <div
      className="rounded-2xl p-4 border mt-2"
      style={{
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderColor: 'rgba(255,255,255,0.08)',
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Target className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-extrabold text-white">
          {LABELS.timeline_key_success}
        </span>
      </div>
      <div className="space-y-2 mb-3">
        {keySuccess.map((item) => (
          <div key={item} className="flex items-start gap-2">
            <span className="text-xs">✅</span>
            <span className="text-sm text-gray-300 flex-1">{item}</span>
          </div>
        ))}
      </div>
      <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
        <span className="text-gray-500">{LABELS.timeline_total_cost}</span>
        <span className="font-extrabold text-white">{totalCost}</span>
      </div>
    </div>
  );
}

export function TimelineTab({ job, star }: TimelineTabProps) {
  const timeline = job.careerTimeline;
  const milestones = timeline.milestones ?? [];

  return (
    <div className="px-4 pt-3 pb-6">
      <CareerPathHeader
        title={timeline.title}
        totalYears={timeline.totalYears}
        totalCost={timeline.totalCost}
        starColor={star.color}
      />

      <div className="space-y-0">
        {milestones.map((milestone, index) => (
          <TimelineStepRow
            key={`${milestone.period}-${milestone.semester}-${index}`}
            milestone={milestone}
            isLast={index === milestones.length - 1}
            starColor={star.color}
          />
        ))}
      </div>

      <KeySuccessSection
        keySuccess={timeline.keySuccess ?? []}
        totalCost={timeline.totalCost}
      />
    </div>
  );
}
