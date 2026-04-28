import { TwemojiImg } from '@/components/shared/TwemojiImg';
import { getZoneColor } from '../config';
import type { QuizQuestion } from '../types';

interface QuestionCardProps {
  question: QuizQuestion;
}

export function QuestionCard({ question }: QuestionCardProps) {
  const color = getZoneColor(question.zone);

  return (
    <div className="relative z-10 flex flex-col mb-3 md:mb-4">
      {/* Zone pill */}
      <div
        className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full text-xs font-bold mb-3 tracking-wider uppercase"
        style={{
          backgroundColor: `${color}15`,
          color,
          border: `1px solid ${color}35`,
        }}
      >
        <TwemojiImg emoji={question.zoneIcon} size={14} />
        {question.zone}
      </div>

      {/* Question card */}
      <div
        className="relative p-4 md:p-5 rounded-2xl md:rounded-3xl overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${color}10 0%, rgba(255,255,255,0.02) 100%)`,
          border: `1px solid ${color}22`,
        }}
      >
        {/* Shimmer */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 3s ease-in-out infinite',
          }}
        />
        {/* Corner glow */}
        <div
          className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-2xl pointer-events-none"
          style={{ backgroundColor: `${color}18` }}
        />

        <div className="relative z-10 flex items-start gap-4">
          {/* Big Twemoji illustration */}
          {question.situationEmoji && (
            <div
              className="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${color}22, ${color}0a)`,
                border: `1px solid ${color}30`,
                boxShadow: `0 0 24px ${color}20`,
                animation: 'icon-float 4s ease-in-out infinite',
              }}
            >
              <TwemojiImg emoji={question.situationEmoji} size={34} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold mb-1.5 tracking-wide"
               style={{ color: `${color}bb` }}>
              {question.situation}
            </p>
            <p className="text-sm md:text-base lg:text-lg font-bold leading-snug text-white">
              {question.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
