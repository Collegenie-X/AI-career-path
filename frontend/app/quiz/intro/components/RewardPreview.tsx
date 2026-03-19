import { Sparkles } from 'lucide-react';
import { LABELS } from '../config';

interface RewardPreviewProps {
  show: boolean;
}

export function RewardPreview({ show }: RewardPreviewProps) {
  return (
    <div
      className="p-5 md:p-6 rounded-2xl relative overflow-hidden transition-all hover:scale-[1.02] cursor-default"
      style={{
        background: 'linear-gradient(135deg, rgba(108,92,231,0.15) 0%, rgba(59,130,246,0.1) 100%)',
        border: '1px solid rgba(108,92,231,0.25)',
      }}
    >
      <div className="absolute inset-0 animate-shimmer" />
      <div
        className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ boxShadow: '0 0 40px rgba(108,92,231,0.3)' }}
      />
      <div className="relative flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div 
            className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center shrink-0" 
            style={{ backgroundColor: 'rgba(251,191,36,0.18)' }}
          >
            <Sparkles className="w-6 h-6 md:w-7 md:h-7 text-[#FBBF24]" />
          </div>
          <div className="flex-1">
            <div className="font-bold text-base md:text-lg text-white mb-0.5">
              {LABELS.reward_title}
            </div>
            <div className="text-xs md:text-sm text-white/45">
              {LABELS.reward_desc}
            </div>
          </div>
        </div>
        <div 
          className="px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-bold shrink-0" 
          style={{ backgroundColor: '#FBBF2420', color: '#FBBF24' }}
        >
          {LABELS.reward_badge}
        </div>
      </div>
    </div>
  );
}
