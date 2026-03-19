'use client';

import { Trophy } from 'lucide-react';
import type { CareerPathTimelineMilestone, CareerPathTimelineTheme } from './types';

type CareerPathTimelineNodeProps = {
  milestone: CareerPathTimelineMilestone;
  isLast: boolean;
  theme: CareerPathTimelineTheme;
  setakLabel?: string;
};

export function CareerPathTimelineNode({
  milestone,
  isLast,
  theme,
  setakLabel = '세특 포인트',
}: CareerPathTimelineNodeProps) {
  const { period, semester, icon, title, activities, awards, achievement, cost, setak } = milestone;
  const { accentColor, costColor, successColor, setakBgColor, setakBorderColor, setakLabelColor } =
    theme;
  const hasAwards = awards && awards.length > 0;

  return (
    <div className="relative flex gap-4">
      {/* Left: icon on timeline (connects to line) */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center border-2 z-10"
          style={{
            backgroundColor: `${accentColor}20`,
            borderColor: accentColor,
            boxShadow: `0 0 12px ${accentColor}50`,
          }}
        >
          <span className="text-xl">{icon}</span>
        </div>
        {!isLast && (
          <div
            className="flex-1 w-0.5 min-h-8 mt-1"
            style={{ backgroundColor: accentColor, opacity: 0.4 }}
          />
        )}
      </div>

      {/* Right: content */}
      <div className="flex-1 min-w-0 pb-8">
        <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
          <span
            className="px-3 py-1.5 rounded-full text-xs font-extrabold"
            style={{
              backgroundColor: 'rgba(56,189,248,0.15)',
              color: accentColor,
              border: `1px solid ${accentColor}40`,
            }}
          >
            {period} {semester}
          </span>
          <span
            className="text-xs font-semibold flex items-center gap-1"
            style={{ color: costColor }}
          >
            <span>💰</span>
            {cost ?? '무료'}
          </span>
        </div>

        <h4 className="font-extrabold text-white text-base mb-2 leading-snug">{title}</h4>

        <ul className="space-y-1 mb-3">
          {activities.map((a) => (
            <li
              key={a}
              className="text-sm text-gray-300 leading-relaxed flex items-start gap-2"
            >
              <span className="text-gray-500 flex-shrink-0 mt-0.5">•</span>
              <span>{a}</span>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap items-center gap-3">
          {hasAwards &&
            awards!.map((award) => (
              <div key={award} className="flex items-center gap-1.5">
                <Trophy
                  className="w-3.5 h-3.5 flex-shrink-0"
                  style={{
                    color: award.includes('합격') ? successColor : costColor,
                  }}
                />
                <span
                  className="text-xs font-semibold"
                  style={{
                    color: award.includes('합격') ? successColor : costColor,
                  }}
                >
                  {award}
                </span>
              </div>
            ))}
          <div className="flex items-center gap-1.5">
            <span className="text-sm" style={{ color: successColor }}>
              ✅
            </span>
            <span className="text-sm font-semibold" style={{ color: successColor }}>
              {achievement}
            </span>
          </div>
        </div>

        {setak && (
          <div
            className="mt-3 p-3 rounded-xl"
            style={{
              backgroundColor: setakBgColor,
              border: `1px solid ${setakBorderColor}`,
            }}
          >
            <div
              className="text-[11px] font-bold mb-1 uppercase tracking-wider"
              style={{ color: setakLabelColor }}
            >
              {setakLabel}
            </div>
            <p className="text-sm text-gray-200 leading-relaxed">{setak}</p>
          </div>
        )}
      </div>
    </div>
  );
}
