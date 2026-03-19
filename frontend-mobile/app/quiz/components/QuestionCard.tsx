import { Star } from 'lucide-react';
import { getZoneColor } from '../config';
import type { QuizQuestion } from '../types';

interface QuestionCardProps {
  question: QuizQuestion;
}

export function QuestionCard({ question }: QuestionCardProps) {
  const color = getZoneColor(question.zone);

  return (
    <div className="relative z-10 px-4 flex flex-col">
      <div
        className="inline-flex items-center gap-1.5 self-start px-3.5 py-1.5 rounded-full text-xs font-bold mb-3"
        style={{
          backgroundColor: `${color}12`,
          color,
          border: `1px solid ${color}30`,
        }}
      >
        <Star className="w-3.5 h-3.5" />
        {question.situation}
      </div>

      <div
        className="relative p-5 rounded-2xl mb-4 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${color}12 0%, rgba(255,255,255,0.03) 100%)`,
          border: `1px solid ${color}25`,
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)`,
            backgroundSize: '200% 100%',
            animation: 'shimmer 3s ease-in-out infinite',
          }}
        />
        <div className="absolute -top-3 -right-3 w-16 h-16 rounded-full blur-xl pointer-events-none"
          style={{ backgroundColor: `${color}15` }} />

        <p className="relative z-10 text-lg font-bold leading-relaxed">
          {question.description}
        </p>
      </div>
    </div>
  );
}
