import { Sparkles } from 'lucide-react';
import { getZoneColor, LABELS, QUIZ_CONFIG } from '../config';

interface QuizStatusProps {
  answeredCount: number;
  totalQuestions: number;
  currentZoneColor: string;
}

export function QuizStatus({ answeredCount, totalQuestions, currentZoneColor }: QuizStatusProps) {
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  return (
    <div className="relative z-10 px-4 pb-5 pt-2">
      <div
        className="flex items-center justify-between px-4 py-2.5 rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(108,92,231,0.06) 100%)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
          <Sparkles className="w-3 h-3" style={{ color: '#FBBF24' }} />
          <span className="font-semibold">
            {answeredCount * QUIZ_CONFIG.xpPerQuestion} {LABELS.quiz_xp_earned}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPercent}%`,
                background: `linear-gradient(90deg, ${currentZoneColor}, ${currentZoneColor}AA)`,
                boxShadow: `0 0 8px ${currentZoneColor}40`,
              }}
            />
          </div>
          <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {progressPercent}%
          </span>
        </div>
      </div>
    </div>
  );
}
