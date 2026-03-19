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
      className="fixed inset-0 z-50 flex items-end justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className="w-full max-w-[430px] rounded-3xl p-6 relative overflow-hidden"
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
