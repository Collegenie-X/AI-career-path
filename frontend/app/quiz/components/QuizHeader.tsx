import { ChevronLeft, Zap } from 'lucide-react';
import { getZoneColor } from '../config';
import type { QuizQuestion } from '../types';

interface QuizHeaderProps {
  question: QuizQuestion;
  currentIndex: number;
  totalQuestions: number;
  questions: QuizQuestion[];
  answers: Record<number, number>;
  onBack: () => void;
}

export function QuizHeader({
  question,
  currentIndex,
  totalQuestions,
  questions,
  answers,
  onBack,
}: QuizHeaderProps) {
  const color = getZoneColor(question.zone);

  return (
    <div className="relative z-10 pb-4 md:pb-6">
      <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-5">
        <button
          onClick={onBack}
          className="w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center transition-all hover:bg-white/10"
          style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" style={{ color: 'rgba(255,255,255,0.5)' }} />
        </button>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <span className="text-xl md:text-2xl">{question.zoneIcon}</span>
              <span className="text-xs md:text-sm font-extrabold uppercase tracking-widest" style={{ color }}>
                {question.zone} · Q{currentIndex + 1}
              </span>
            </div>
            <span className="flex items-center gap-1.5 text-xs md:text-sm font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>
              <Zap className="w-4 h-4 md:w-4.5 md:h-4.5" style={{ color }} />
              {currentIndex + 1} / {totalQuestions}
            </span>
          </div>

          <div className="flex gap-[3px] md:gap-1">
            {questions.map((_, i) => {
              const done = answers[i] !== undefined;
              const active = i === currentIndex;
              const c = getZoneColor(questions[i].zone);
              return (
                <div
                  key={i}
                  className="h-[6px] md:h-2 rounded-full flex-1 transition-all duration-300"
                  style={{
                    backgroundColor: done ? c : active ? `${c}55` : 'rgba(255,255,255,0.06)',
                    boxShadow: done ? `0 0 8px ${c}50` : 'none',
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
