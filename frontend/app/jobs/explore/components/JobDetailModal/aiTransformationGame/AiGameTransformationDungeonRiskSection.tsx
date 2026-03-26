'use client';

import { Castle, Swords } from 'lucide-react';
import type { AiTransformation } from '../../../types';

interface AiGameTransformationDungeonRiskSectionProps {
  replacementRisk: AiTransformation['replacementRisk'];
  starColor: string;
  title: string;
  hint: string;
  riskBadgeLabel: string;
  riskBodyLow: string;
  riskBodyMedium: string;
  riskBodyHigh: string;
}

export function AiGameTransformationDungeonRiskSection({
  replacementRisk,
  starColor,
  title,
  hint,
  riskBadgeLabel,
  riskBodyLow,
  riskBodyMedium,
  riskBodyHigh,
}: AiGameTransformationDungeonRiskSectionProps) {
  const riskColors = {
    low: {
      bg: 'rgba(34, 197, 94, 0.12)',
      border: 'rgba(34, 197, 94, 0.35)',
      text: '#22c55e',
      glow: 'rgba(34, 197, 94, 0.25)',
    },
    medium: {
      bg: 'rgba(251, 191, 36, 0.12)',
      border: 'rgba(251, 191, 36, 0.35)',
      text: '#fbbf24',
      glow: 'rgba(251, 191, 36, 0.2)',
    },
    high: {
      bg: 'rgba(239, 68, 68, 0.12)',
      border: 'rgba(239, 68, 68, 0.35)',
      text: '#ef4444',
      glow: 'rgba(239, 68, 68, 0.22)',
    },
  };

  const rs = riskColors[replacementRisk];
  const body =
    replacementRisk === 'low' ? riskBodyLow : replacementRisk === 'medium' ? riskBodyMedium : riskBodyHigh;

  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{
            background: `${starColor}22`,
            border: `1px solid ${starColor}40`,
            boxShadow: `0 0 20px ${starColor}22`,
          }}
        >
          <Castle className="h-4 w-4" style={{ color: starColor }} />
        </div>
        <div>
          <h3 className="text-sm font-black tracking-tight text-white">{title}</h3>
          <p className="text-[10px] text-gray-500">{hint}</p>
        </div>
      </div>
      <div
        className="relative overflow-hidden rounded-2xl p-4"
        style={{
          background: rs.bg,
          border: `1px solid ${rs.border}`,
          boxShadow: `0 8px 32px ${rs.glow}`,
        }}
      >
        <div className="pointer-events-none absolute -right-6 -top-6 opacity-20">
          <Swords className="h-24 w-24" style={{ color: rs.text }} />
        </div>
        <div className="relative flex flex-wrap items-center gap-2">
          <span
            className="rounded-full px-3 py-1 text-[11px] font-black"
            style={{
              background: rs.text,
              color: '#0a0a0a',
              boxShadow: `0 0 12px ${rs.text}66`,
            }}
          >
            {riskBadgeLabel}
          </span>
        </div>
        <p className="relative mt-3 text-sm leading-relaxed text-gray-200">{body}</p>
      </div>
    </section>
  );
}
