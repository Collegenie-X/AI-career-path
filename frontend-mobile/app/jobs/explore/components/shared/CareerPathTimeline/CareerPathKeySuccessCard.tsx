'use client';

import { Target } from 'lucide-react';
import type { CareerPathTimelineTheme } from './types';

type CareerPathKeySuccessCardProps = {
  keySuccess: string[];
  totalCost: string;
  theme: CareerPathTimelineTheme;
  labels?: {
    title?: string;
    totalCost?: string;
  };
};

export function CareerPathKeySuccessCard({
  keySuccess,
  totalCost,
  theme,
  labels = {},
}: CareerPathKeySuccessCardProps) {
  const { accentColor, successColor } = theme;
  const titleLabel = labels.title ?? '핵심 성공 지표';
  const totalCostLabel = labels.totalCost ?? '총 예상 비용';

  return (
    <div
      className="rounded-2xl p-4 border mt-2"
      style={{
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderColor: 'rgba(255,255,255,0.08)',
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Target
          className="w-4 h-4 flex-shrink-0"
          style={{ color: accentColor }}
        />
        <span className="text-sm font-extrabold text-white">{titleLabel}</span>
      </div>
      <div className="space-y-2 mb-3">
        {keySuccess.map((item) => (
          <div key={item} className="flex items-start gap-2">
            <span className="text-sm flex-shrink-0" style={{ color: successColor }}>
              ✅
            </span>
            <span className="text-sm text-gray-200 flex-1 leading-relaxed">{item}</span>
          </div>
        ))}
      </div>
      <div className="pt-3 border-t border-white/10 flex items-center justify-between text-sm">
        <span className="text-gray-400">{totalCostLabel}</span>
        <span className="font-extrabold text-white">{totalCost}</span>
      </div>
    </div>
  );
}
