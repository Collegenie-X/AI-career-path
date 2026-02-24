import { Sparkles } from 'lucide-react';
import { LABELS } from '../config';

interface RewardPreviewProps {
  show: boolean;
}

export function RewardPreview({ show }: RewardPreviewProps) {
  return (
    <div
      className="p-4 rounded-2xl mb-4 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(108,92,231,0.15) 0%, rgba(59,130,246,0.1) 100%)',
        border: '1px solid rgba(108,92,231,0.2)',
        opacity: show ? 1 : 0,
        transform: show ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.6s ease-out 0.25s',
      }}
    >
      <div className="absolute inset-0 animate-shimmer" />
      <div className="relative flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(251,191,36,0.15)' }}>
          <Sparkles className="w-5 h-5 text-[#FBBF24]" />
        </div>
        <div className="flex-1">
          <div className="font-bold text-sm">{LABELS.reward_title}</div>
          <div className="text-xs text-white/40">{LABELS.reward_desc}</div>
        </div>
        <div className="px-2.5 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: '#FBBF2420', color: '#FBBF24' }}>
          {LABELS.reward_badge}
        </div>
      </div>
    </div>
  );
}
