'use client';

import { useMemo } from 'react';
import { CareerPathTimeline } from '../shared/CareerPathTimeline';
import { LABELS } from '../../config';
import { buildFallbackCareerTimelineMilestones } from '@/lib/jobs/buildFallbackCareerTimelineMilestones';
import type { Job, StarData } from '../../types';

interface TimelineTabProps {
  job: Job;
  star: StarData;
}

export function TimelineTab({ job, star }: TimelineTabProps) {
  const timeline = job.careerTimeline ?? {
    title: `${job.name} 준비 경로`,
    totalYears: '—',
    totalCost: '—',
    milestones: [],
    keySuccess: [],
  };

  const rawLen = (job.careerTimeline?.milestones ?? []).length;
  const usedDataFallback = rawLen === 0;

  const milestones = useMemo(() => {
    const raw = job.careerTimeline?.milestones ?? [];
    if (raw.length > 0) return raw;
    return buildFallbackCareerTimelineMilestones(job);
  }, [job]);

  const keySuccess = useMemo(() => {
    const ks = timeline.keySuccess ?? [];
    if (ks.length > 0) return ks;
    const survival = job.aiTransformation?.survivalStrategy;
    if (survival && survival.length > 0) return survival.slice(0, 6);
    return [`${job.name}에 필요한 기초·전공·실무 경험을 단계적으로 쌓기`];
  }, [job, timeline.keySuccess]);

  const timelineTheme = useMemo(
    () => ({
      accentColor: star.color,
      costColor: '#fbbf24',
      successColor: '#22c55e',
      setakBgColor: `${star.color}1f`,
      setakBorderColor: `${star.color}66`,
      setakLabelColor: star.color,
    }),
    [star.color],
  );

  return (
    <div className="px-4 pt-3 pb-6">
      {usedDataFallback && milestones.length > 0 ? (
        <p className="text-xs text-gray-400 leading-relaxed mb-3 px-0.5">
          {LABELS.timeline_fallback_caption}
        </p>
      ) : null}
      <CareerPathTimeline
        summary={{
          title: timeline.title,
          totalYears: timeline.totalYears,
          totalCost: timeline.totalCost,
        }}
        milestones={milestones}
        keySuccess={keySuccess}
        theme={timelineTheme}
        labels={{
          setak: LABELS.timeline_setak_label,
          keySuccessTitle: LABELS.timeline_key_success,
          totalCost: LABELS.timeline_total_cost,
        }}
      />
    </div>
  );
}
