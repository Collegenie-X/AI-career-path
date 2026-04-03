'use client';

import type { ExecutionPlanAiPlanDepthId } from '@/lib/dreammate/executionPlanAiTypes';

type DepthOption = { id: string; label: string; hint: string; emoji?: string };

interface ExecutionPlanAiDepthPickerProps {
  options: readonly DepthOption[];
  value: ExecutionPlanAiPlanDepthId;
  onChange: (id: ExecutionPlanAiPlanDepthId) => void;
  label: string;
  hint: string;
}

export function ExecutionPlanAiDepthPicker({
  options,
  value,
  onChange,
  label,
  hint,
}: ExecutionPlanAiDepthPickerProps) {
  return (
    <div
      className="space-y-2 rounded-2xl border border-fuchsia-500/20 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
      style={{ background: 'linear-gradient(165deg, rgba(88,28,135,0.12) 0%, rgba(15,23,42,0.4) 100%)' }}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-black tracking-wide text-fuchsia-100/95">{label}</span>
        <span className="text-[11px] text-gray-500 text-right leading-snug">{hint}</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {options.map(option => {
          const active = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id as ExecutionPlanAiPlanDepthId)}
              className="flex flex-col items-center justify-center gap-1 rounded-xl border py-2.5 px-2 transition-all active:scale-[0.98]"
              style={active
                ? {
                  borderColor: 'rgba(232,121,249,0.65)',
                  backgroundColor: 'rgba(126,34,206,0.45)',
                  boxShadow: '0 0 20px rgba(168,85,247,0.25), inset 0 1px 0 rgba(255,255,255,0.08)',
                }
                : {
                  borderColor: 'rgba(255,255,255,0.08)',
                  backgroundColor: 'rgba(255,255,255,0.04)',
                }}
            >
              {option.emoji ? (
                <span className="text-xl leading-none drop-shadow-[0_0_8px_rgba(232,121,249,0.35)]" aria-hidden>
                  {option.emoji}
                </span>
              ) : null}
              <span className="text-sm font-black text-white">{option.label}</span>
              <span className="text-[10px] text-gray-400">{option.hint}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
