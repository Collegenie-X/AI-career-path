'use client';

import { ChevronLeft, Sparkles } from 'lucide-react';
import { LABELS } from '../config';
import type { StarData } from '../types';

interface PageHeaderProps {
  selectedStar: StarData | null;
  onBack: () => void;
}

export function PageHeader({ selectedStar, onBack }: PageHeaderProps) {
  return (
    <div
      className="sticky top-0 z-20 backdrop-blur-xl border-b border-white/10 px-4 py-3"
      style={{ backgroundColor: 'rgba(18,18,42,0.97)' }}
    >
      <div className="flex items-center gap-3">
        {selectedStar && (
          <button
            className="w-8 h-8 rounded-full bg-white/10 active:bg-white/20 flex items-center justify-center flex-shrink-0"
            onClick={onBack}
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
        )}
        <div className="flex-1">
          <h1 className="text-xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
            {selectedStar ? `${selectedStar.emoji} ${selectedStar.name}` : LABELS.page_title}
          </h1>
          <p className="text-xs text-gray-400">
            {selectedStar
              ? `${selectedStar.jobCount}${LABELS.star_selected_subtitle}`
              : LABELS.page_subtitle}
          </p>
        </div>
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
      </div>
    </div>
  );
}
