'use client';

import { ChevronLeft, ChevronRight, Trophy } from 'lucide-react';
import { LABELS } from '../../config';
import type { StarData } from '../../types';

interface ModalControlsProps {
  processStep: number;
  isLastPhase: boolean;
  star: StarData;
  onPrev: () => void;
  onNext: () => void;
}

export function ModalControls({ processStep, isLastPhase, star, onPrev, onNext }: ModalControlsProps) {
  return (
    <div
      className="flex-shrink-0 px-4 pt-3 flex gap-3 border-t border-white/10"
      style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom, 16px))', background: 'rgba(13,13,26,0.98)' }}
    >
      {processStep > 0 && (
        <button
          className="h-12 px-5 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-white flex-shrink-0"
          style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
          onClick={onPrev}
        >
          <ChevronLeft className="w-4 h-4" />
          {LABELS.modal_prev}
        </button>
      )}
      {!isLastPhase ? (
        <button
          className="flex-1 h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-white"
          style={{ background: `linear-gradient(135deg, ${star.color}, ${star.color}bb)`, boxShadow: `0 4px 16px ${star.color}55` }}
          onClick={onNext}
        >
          {LABELS.modal_next}
          <ChevronRight className="w-4 h-4" />
        </button>
      ) : (
        <button
          className="flex-1 h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #FBBF24, #F59E0B)', boxShadow: '0 4px 16px rgba(251,191,36,0.4)' }}
          onClick={onNext}
        >
          <Trophy className="w-4 h-4" />
          {LABELS.modal_view_timeline}
        </button>
      )}
    </div>
  );
}
