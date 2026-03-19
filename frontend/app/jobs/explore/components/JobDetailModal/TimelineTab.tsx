'use client';

import { CareerPathTimeline } from '../shared/CareerPathTimeline';
import { LABELS } from '../../config';
import type { Job, StarData } from '../../types';

interface TimelineTabProps {
  job: Job;
  star: StarData;
}

export function TimelineTab({ job, star }: TimelineTabProps) {
  const timeline = job.careerTimeline;
  const milestones = timeline.milestones ?? [];

  return (
    <div className="px-4 pt-3 pb-6">
      <CareerPathTimeline
        summary={{
          title: timeline.title,
          totalYears: timeline.totalYears,
          totalCost: timeline.totalCost,
        }}
        milestones={milestones}
        keySuccess={timeline.keySuccess ?? []}
        labels={{
          setak: LABELS.timeline_setak_label,
          keySuccessTitle: LABELS.timeline_key_success,
          totalCost: LABELS.timeline_total_cost,
        }}
      />
    </div>
  );
}
