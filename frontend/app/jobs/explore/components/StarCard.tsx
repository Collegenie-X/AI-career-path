'use client';

import { Star, ChevronRight } from 'lucide-react';
import type { StarData } from '../types';

interface StarCardProps {
  star: StarData;
  onClick: () => void;
  index: number;
}

export function StarCard({ star, onClick, index }: StarCardProps) {
  return (
    <button
      className="relative rounded-3xl overflow-hidden text-left w-full transition-all duration-300 active:scale-95 group"
      style={{
        background: `linear-gradient(135deg, ${star.bgColor}ee 0%, ${star.bgColor}aa 100%)`,
        border: `2px solid ${star.color}44`,
        boxShadow: `0 8px 32px ${star.color}33`,
        animation: `slide-up 0.5s ease-out ${index * 0.08}s both`,
      }}
      onClick={onClick}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(circle at 50% 50%, ${star.color}33, transparent 70%)` }}
      />
      <div className="relative p-2 h-48 flex flex-col">
        <div className="flex items-start justify-between mb-auto">
          <div
            className="px-2 py-1 rounded-xl text-xs font-bold flex items-center gap-1"
            style={{ backgroundColor: `${star.color}33`, color: star.color, border: `1px solid ${star.color}66` }}
          >
            <Star className="w-3 h-3 fill-current" />
            <span>직업 {star.jobCount}개</span>
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
