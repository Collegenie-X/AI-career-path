import { LABELS } from '../config';
import type { TipItem } from '../config';

interface TipsListProps {
  tips: TipItem[];
  show: boolean;
}

export function TipsList({ tips, show }: TipsListProps) {
  return (
    <div
      className="space-y-2.5"
      style={{ 
        opacity: show ? 1 : 0, 
        transform: show ? 'translateY(0)' : 'translateY(20px)', 
        transition: 'all 0.6s ease-out 0.35s' 
      }}
    >
      <div className="text-xs font-bold text-white/30 uppercase tracking-widest px-1 mb-2">
        {LABELS.tips_title}
      </div>
      {tips.map((tip, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 rounded-xl"
          style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <tip.icon className="w-4 h-4 text-[#6C5CE7] flex-shrink-0" />
          <span className="text-sm text-white/60">{tip.text}</span>
        </div>
      ))}
    </div>
  );
}
