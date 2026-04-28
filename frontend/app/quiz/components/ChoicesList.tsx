'use client';

import { TwemojiImg } from '@/components/shared/TwemojiImg';
import { getZoneColor, LABELS } from '../config';
import type { QuizQuestion } from '../types';

interface ChoicesListProps {
  question: QuizQuestion;
  currentIndex: number;
  answers: Record<number, number>;
  choicesVisible: boolean;
  animating: boolean;
  pendingFeedback: boolean;
  onPickAnswer: (choiceId: string, choiceIdx: number) => void;
}

const LETTER_COLORS = ['#6C5CE7', '#E84393', '#00B894', '#FDCB6E'];

export function ChoicesList({
  question,
  currentIndex,
  answers,
  choicesVisible,
  animating,
  pendingFeedback,
  onPickAnswer,
}: ChoicesListProps) {
  const zoneColor = getZoneColor(question.zone);
  const letters = [
    LABELS.choice_letter_a,
    LABELS.choice_letter_b,
    LABELS.choice_letter_c,
    LABELS.choice_letter_d,
  ];

  return (
    <div className="flex-1 flex flex-col gap-3 md:gap-3.5">
      {choicesVisible && question.choices.map((choice, idx) => {
        const selected = answers[currentIndex] === idx;
        const accentColor = selected ? zoneColor : LETTER_COLORS[idx % LETTER_COLORS.length];

        return (
          <button
            key={choice.id}
            onClick={() => onPickAnswer(choice.id, idx)}
            disabled={animating || pendingFeedback}
            className="w-full text-left rounded-2xl md:rounded-2xl flex items-center gap-3 md:gap-4 group relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.01] active:scale-[0.98]"
            style={{
              padding: '12px 14px',
              backgroundColor: selected ? `${zoneColor}18` : 'rgba(255,255,255,0.03)',
              border: selected
                ? `2px solid ${zoneColor}`
                : `1px solid rgba(255,255,255,0.07)`,
              boxShadow: selected
                ? `0 0 28px ${zoneColor}25, inset 0 1px 0 ${zoneColor}15`
                : 'none',
              animation: `choice-enter 0.35s ease-out ${idx * 0.07}s both`,
            }}
          >
            {/* Hover glow overlay */}
            <div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{ background: `linear-gradient(90deg, ${accentColor}06, transparent)` }}
            />

            {/* Twemoji tile */}
            <div
              className="relative flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
              style={{
                background: selected
                  ? `linear-gradient(135deg, ${zoneColor}35, ${zoneColor}18)`
                  : `rgba(255,255,255,0.05)`,
                border: selected
                  ? `1px solid ${zoneColor}50`
                  : '1px solid rgba(255,255,255,0.06)',
                boxShadow: selected ? `0 0 20px ${zoneColor}35` : 'none',
              }}
            >
              {choice.emoji ? (
                <TwemojiImg
                  emoji={choice.emoji}
                  size={26}
                  style={{
                    filter: selected ? `drop-shadow(0 0 6px ${zoneColor}90)` : 'none',
                    transition: 'filter 0.2s ease, transform 0.2s ease',
                  }}
                />
              ) : (
                <span
                  className="text-sm font-black"
                  style={{ color: selected ? '#fff' : accentColor }}
                >
                  {letters[idx]}
                </span>
              )}

              {/* Letter badge */}
              <div
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black border border-black/30"
                style={{
                  backgroundColor: selected ? zoneColor : accentColor,
                  color: '#fff',
                  boxShadow: selected ? `0 0 8px ${zoneColor}60` : 'none',
                }}
              >
                {letters[idx]}
              </div>
            </div>

            {/* Text */}
            <span
              className="text-sm md:text-[15px] leading-snug transition-colors duration-200 flex-1"
              style={{ color: selected ? '#fff' : 'rgba(255,255,255,0.70)' }}
            >
              {choice.text}
            </span>

            {/* Selected check */}
            {selected && (
              <div
                className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-black"
                style={{
                  background: zoneColor,
                  boxShadow: `0 0 12px ${zoneColor}60`,
                  animation: 'scale-bounce 0.3s ease-out',
                }}
              >
                ✓
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
