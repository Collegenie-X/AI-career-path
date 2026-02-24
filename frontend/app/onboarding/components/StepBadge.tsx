'use client';

import { LABELS } from '../config';

interface StepBadgeProps {
  current: number;
  total: number;
  color: string;
  colorLight: string;
}

export function StepBadge({ current, total, color, colorLight }: StepBadgeProps) {
  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 animate-slide-up"
      key={`badge-${current}`}
      style={{
        backgroundColor: `${color}20`,
        color: colorLight,
        border: `1px solid ${color}30`,
      }}
    >
      {LABELS.step_indicator} {current + 1} {LABELS.step_separator} {total}
    </div>
  );
}
