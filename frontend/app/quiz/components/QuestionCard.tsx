import { Star } from 'lucide-react';
import { getZoneColor } from '../config';
import type { QuizQuestion } from '../types';

interface QuestionCardProps {
  question: QuizQuestion;
}

export function QuestionCard({ question }: QuestionCardProps) {
  const color = getZoneColor(question.zone);

  return (
    <div className="relative z-10 flex flex-col mb-3 md:mb-4">
      <div
        className="inline-flex items-center gap-2 self-start px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-bold mb-3 md:mb-4"
        style={{
          backgroundColor: `${color}12`,
          color,
          border: `1px solid ${color}30`,
        }}
      >
        <Star className="w-4 h-4 md:w-4.5 md:h-4.5" />
        {question.situation}
      </div>

      <div
        className="relative p-4 md:p-5 rounded-2xl md:rounded-3xl mb-3 md:mb-4 overflow-hidden transition-all hover:scale-[1.01]"
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
        <div 
          className="absolute -top-6 -right-6 md:-top-8 md:-right-8 w-24 h-24 md:w-32 md:h-32 rounded-full blur-2xl pointer-events-none"
          style={{ backgroundColor: `${color}15` }} 
        />

        <p className="relative z-10 text-base md:text-lg lg:text-xl font-bold leading-relaxed text-white">
          {question.description}
        </p>
      </div>
    </div>
  );
}
