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
    <div className="relative z-10 px-4 pt-4 pb-2">
      <div className="flex items-center gap-3 mb-3">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
          style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
        >
          <ChevronLeft className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.5)' }} />
        </button>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">{question.zoneIcon}</span>
              <span className="text-xs font-extrabold uppercase tracking-widest" style={{ color }}>
                {question.zone} · Q{currentIndex + 1}
              </span>
            </div>
            <span className="flex items-center gap-1 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              <Zap className="w-3.5 h-3.5" style={{ color }} />
              {currentIndex + 1} / {totalQuestions}
            </span>
          </div>

          <div className="flex gap-[3px]">
            {questions.map((_, i) => {
              const done = answers[i] !== undefined;
              const active = i === currentIndex;
              const c = getZoneColor(questions[i].zone);
              return (
                <div
                  key={i}
                  className="h-[5px] rounded-full flex-1 transition-all duration-300"
                  style={{
                    backgroundColor: done ? c : active ? `${c}55` : 'rgba(255,255,255,0.06)',
                    boxShadow: done ? `0 0 6px ${c}50` : 'none',
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
