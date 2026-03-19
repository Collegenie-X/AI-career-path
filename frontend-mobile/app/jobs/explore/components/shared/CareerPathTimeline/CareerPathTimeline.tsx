'use client';

import { CareerPathSummaryCard } from './CareerPathSummaryCard';
import { CareerPathTimelineNode } from './CareerPathTimelineNode';
import { CareerPathKeySuccessCard } from './CareerPathKeySuccessCard';
import {
  CAREER_PATH_TIMELINE_DEFAULT_THEME,
  type CareerPathTimelineMilestone,
  type CareerPathTimelineSummary,
  type CareerPathTimelineTheme,
} from './types';

export type CareerPathTimelineProps = {
  summary: CareerPathTimelineSummary;
  milestones: CareerPathTimelineMilestone[];
  keySuccess: string[];
  theme?: Partial<CareerPathTimelineTheme>;
  labels?: {
    setak?: string;
    keySuccessTitle?: string;
    totalCost?: string;
  };
};

export function CareerPathTimeline({
  summary,
  milestones,
  keySuccess,
  theme: themeOverride,
  labels = {},
}: CareerPathTimelineProps) {
  const theme: CareerPathTimelineTheme = {
    ...CAREER_PATH_TIMELINE_DEFAULT_THEME,
    ...themeOverride,
  };

  return (
    <div className="w-full">
      <CareerPathSummaryCard summary={summary} theme={theme} />

      <div className="relative pl-0.5">
        {/* Glowing vertical line */}
        <div
          className="absolute left-[22px] top-5 bottom-0 w-0.5 -translate-x-1/2"
          style={{
            backgroundColor: theme.accentColor,
            opacity: 0.6,
            boxShadow: `0 0 8px ${theme.accentColor}60`,
          }}
          aria-hidden
        />
        <div className="relative space-y-0">
          {milestones.map((milestone, index) => (
            <CareerPathTimelineNode
              key={`${milestone.period}-${milestone.semester}-${index}`}
              milestone={milestone}
              isLast={index === milestones.length - 1}
              theme={theme}
              setakLabel={labels.setak}
            />
          ))}
        </div>
      </div>

      <CareerPathKeySuccessCard
        keySuccess={keySuccess}
        totalCost={summary.totalCost}
        theme={theme}
        labels={{
          title: labels.keySuccessTitle,
          totalCost: labels.totalCost,
        }}
      />
    </div>
  );
}
