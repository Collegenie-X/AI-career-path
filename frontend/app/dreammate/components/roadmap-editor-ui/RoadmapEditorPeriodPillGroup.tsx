'use client';

import type { PeriodType } from '../../types';

interface PeriodOption {
  id: PeriodType;
  label: string;
  emoji: string;
}

interface RoadmapEditorPeriodPillGroupProps {
  options: readonly PeriodOption[];
  value: PeriodType;
  onChange: (next: PeriodType) => void;
}

export function RoadmapEditorPeriodPillGroup({
  options,
  value,
  onChange,
}: RoadmapEditorPeriodPillGroupProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map(option => {
        const selected = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`h-11 rounded-xl text-sm font-bold transition-all ${
              selected
                ? 'text-white shadow-lg shadow-violet-900/40 bg-gradient-to-br from-[#6C5CE7] to-[#a855f7]'
                : 'text-white/60 bg-white/[0.05] hover:bg-white/[0.09] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
            }`}
          >
            {option.emoji} {option.label}
          </button>
        );
      })}
    </div>
  );
}
