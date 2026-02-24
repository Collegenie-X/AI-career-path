'use client';

import type { StarData } from '../types';

interface StarInfoBannerProps {
  star: StarData;
}

export function StarInfoBanner({ star }: StarInfoBannerProps) {
  return (
    <div
      className="rounded-2xl p-3 flex items-center gap-3 relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${star.bgColor}ee, ${star.bgColor}88)`, border: `2px solid ${star.color}55` }}
    >
      <div className="absolute -right-3 -top-3 text-6xl opacity-10">{star.emoji}</div>
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
        style={{ background: `${star.color}33`, border: `2px solid ${star.color}66` }}
      >
        {star.emoji}
      </div>
      <div className="flex-1">
        <div className="font-bold text-white text-base">{star.name}</div>
        <div className="text-xs leading-relaxed mt-0.5" style={{ color: `${star.color}cc` }}>
          {star.description}
        </div>
      </div>
    </div>
  );
}
