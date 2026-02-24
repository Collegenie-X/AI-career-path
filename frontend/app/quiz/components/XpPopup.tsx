import { Sparkles } from 'lucide-react';
import { QUIZ_CONFIG } from '../config';

interface XpPopupProps {
  visible: boolean;
}

export function XpPopup({ visible }: XpPopupProps) {
  if (!visible) return null;

  return (
    <div
      className="absolute top-32 right-8 flex items-center gap-1 text-sm font-extrabold pointer-events-none z-20"
      style={{
        color: '#FBBF24',
        animation: 'xp-pop 0.9s ease-out forwards',
      }}
    >
      <Sparkles className="w-4 h-4" /> +{QUIZ_CONFIG.xpPerQuestion} XP
    </div>
  );
}
