'use client';

import type { CareerPathTimelineSummary, CareerPathTimelineTheme } from './types';

type CareerPathSummaryCardProps = {
  summary: CareerPathTimelineSummary;
  theme: CareerPathTimelineTheme;
};

export function CareerPathSummaryCard({ summary, theme }: CareerPathSummaryCardProps) {
  const { title, totalYears, totalCost } = summary;
  const { accentColor } = theme;

  return (
    <div
      className="rounded-2xl p-4 mb-5 border"
      style={{
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderColor: `${accentColor}30`,
      }}
    >
      <h3 className="font-extrabold text-white text-base mb-3">{title}</h3>
      <div className="flex flex-wrap gap-2">
        <div
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
          style={{
            backgroundColor: `${accentColor}18`,
            border: `1px solid ${accentColor}35`,
          }}
        >
          <span className="text-sm">📅</span>
          <span className="text-sm font-extrabold" style={{ color: accentColor }}>
            {totalYears}
          </span>
        </div>
        <div
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
          style={{
            backgroundColor: `${accentColor}18`,
            border: `1px solid ${accentColor}35`,
          }}
        >
          <span className="text-sm">💰</span>
          <span className="text-sm font-extrabold" style={{ color: accentColor }}>
            총 {totalCost}
          </span>
        </div>
      </div>
    </div>
  );
}
