import { CheckCircle2, ArrowRight } from 'lucide-react';
import { getZoneColor, LABELS } from '../config';

interface FeedbackOverlayProps {
  feedback: string;
  zone: string;
  zoneIcon: string;
  onNext: () => void;
  isLast: boolean;
}

export function FeedbackOverlay({
  feedback,
  zone,
  zoneIcon,
  onNext,
  isLast,
}: FeedbackOverlayProps) {
  const color = getZoneColor(zone);
  
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 md:p-6"
      style={{ backgroundColor: 'rgba(3,6,18,0.26)' }}
    >
      <div
        className="absolute inset-x-0 bottom-0 h-40 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(5,8,24,0.55) 0%, rgba(5,8,24,0.08) 100%)' }}
      />
      <div
        className="w-[calc(100%-2rem)] md:w-[calc(100%-3rem)] max-w-5xl rounded-3xl p-5 md:p-6 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, #1A1A2E 0%, ${color}22 100%)`,
          border: `1.5px solid ${color}55`,
          boxShadow: `0 0 40px ${color}33`,
          animation: 'slide-up 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        <div
          className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-3xl pointer-events-none"
          style={{ backgroundColor: `${color}33` }}
        />

        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
              style={{ backgroundColor: `${color}22`, border: `1px solid ${color}44` }}
            >
              {zoneIcon}
            </div>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color }}>
              {zone} {LABELS.feedback_zone_complete}
            </span>
            <CheckCircle2 className="w-4 h-4 ml-auto" style={{ color }} />
          </div>

          <p className="text-base font-semibold text-white leading-relaxed mb-5">
            {feedback}
          </p>

          <button
            onClick={onNext}
            className="w-full h-12 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-opacity active:opacity-80"
            style={{ background: `linear-gradient(135deg, ${color}, ${color}99)` }}
          >
            {isLast ? LABELS.feedback_view_result : LABELS.feedback_next}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
