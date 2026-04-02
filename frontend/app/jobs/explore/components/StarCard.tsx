'use client';

import { Star, ChevronRight } from 'lucide-react';
import type { StarData } from '../types';

interface StarCardProps {
  star: StarData;
  onClick: () => void;
  index: number;
  /** 현재 선택된 별인지 (웹 2컬럼 레이아웃에서 우측 패널과 연결) */
  isSelected?: boolean;
}

export function StarCard({ star, onClick, index, isSelected = false }: StarCardProps) {
  const displayedJobCount = star.jobs?.length ?? star.jobCount;
  return (
    <button
      className="relative rounded-3xl overflow-hidden text-left w-full transition-all duration-300 active:scale-95 hover:scale-[1.02] group"
      style={{
        background: `linear-gradient(135deg, ${star.bgColor}ee 0%, ${star.bgColor}aa 100%)`,
        border: isSelected ? `2px solid ${star.color}cc` : `2px solid ${star.color}44`,
        boxShadow: isSelected
          ? `0 0 0 3px ${star.color}44, 0 8px 32px ${star.color}55`
          : `0 8px 32px ${star.color}33`,
        animation: `slide-up 0.5s ease-out ${index * 0.08}s both`,
      }}
      onClick={onClick}
    >
      {/* 호버 글로우 확산 */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${star.color}44, transparent 70%)`,
          animation: 'hover-glow-expand 0.6s ease-out forwards',
        }}
      />
      {/* 반짝이는 파티클 효과 */}
      <div
        className="absolute top-2 right-2 w-1 h-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          backgroundColor: star.color,
          boxShadow: `0 0 8px ${star.color}`,
          animation: 'twinkle 1.5s ease-in-out infinite',
        }}
      />
      <div
        className="absolute bottom-3 left-3 w-1 h-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          backgroundColor: star.color,
          boxShadow: `0 0 8px ${star.color}`,
          animation: 'twinkle 1.8s ease-in-out 0.3s infinite',
        }}
      />
      <div className="relative p-2 h-48 flex flex-col">
        <div className="flex items-start justify-between mb-auto">
          <div
            className="px-2 py-1 rounded-xl text-xs font-bold flex items-center gap-1"
            style={{ backgroundColor: `${star.color}33`, color: star.color, border: `1px solid ${star.color}66` }}
          >
            <Star className="w-3 h-3 fill-current" />
            <span>직업 {displayedJobCount}개</span>
          </div>
          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
            <ChevronRight className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
        <div className="flex flex-col items-center my-2">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl mb-1.5 group-hover:scale-110 transition-transform"
            style={{ background: `${star.color}22`, boxShadow: `0 0 20px ${star.color}44` }}
          >
            {star.emoji}
          </div>
        </div>
        <div className="text-center">
          <h3 className="font-bold text-white text-base mb-0.5">{star.name}</h3>
          <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: `${star.color}dd` }}>
            {star.description}
          </p>
        </div>
      </div>
    </button>
  );
}
