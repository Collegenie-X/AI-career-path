'use client';

import { CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

type QuizFeedbackSheetProps = {
  theme: string;
  themeIcon: string;
  feedback: string;
  isLast: boolean;
  accentColor?: string;
  onNext: () => void;
};

export function QuizFeedbackSheet({
  theme,
  themeIcon,
  feedback,
  isLast,
  accentColor = '#845ef7',
  onNext,
}: QuizFeedbackSheetProps) {
  const content = (
    <div
      data-quiz-feedback-sheet=""
      className="fixed inset-0 flex items-end justify-center p-4"
      style={{
        zIndex: 99999,
        backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(6px)',
      }}
    >
      <div
        className="w-full max-w-[430px] rounded-3xl p-6 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, #1A1A2E 0%, ${accentColor}22 100%)`,
          border: `1.5px solid ${accentColor}55`,
          boxShadow: `0 0 40px ${accentColor}33`,
          animation: 'quiz-slide-up 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        {/* 배경 글로우 */}
        <div
          className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-3xl pointer-events-none"
          style={{ backgroundColor: `${accentColor}33` }}
        />

        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
              style={{ backgroundColor: `${accentColor}22`, border: `1px solid ${accentColor}44` }}
            >
              {themeIcon}
            </div>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: accentColor }}>
              {theme} 분석 완료
            </span>
            <CheckCircle2 className="w-4 h-4 ml-auto" style={{ color: accentColor }} />
          </div>

          <p className="text-base font-semibold text-white leading-relaxed mb-5">
            {feedback}
          </p>

          <button
            onClick={onNext}
            className="w-full h-12 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-opacity active:opacity-80"
            style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}99)` }}
          >
            {isLast ? (
              <>
                결과 보기 🏆
                <Sparkles className="w-4 h-4" />
              </>
            ) : (
              <>
                다음 문제로
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes quiz-slide-up {
          from { transform: translateY(100px); opacity: 0; }
          to   { transform: translateY(0);     opacity: 1; }
        }
      `}      </style>
    </div>
  );

  /**
   * 포털을 body에 붙이면 Radix Dialog의 disableOutsidePointerEvents가
   * 피드백 시트에도 pointer-events: none을 주입해 클릭 불가.
   * React 트리 안에 두면 Dialog 내부로 인식되어 클릭 가능.
   */
  return content;
}
