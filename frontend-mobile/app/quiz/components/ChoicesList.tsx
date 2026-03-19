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

export function ChoicesList({
  question,
  currentIndex,
  answers,
  choicesVisible,
  animating,
  pendingFeedback,
  onPickAnswer,
}: ChoicesListProps) {
  const color = getZoneColor(question.zone);
  const letters = [
    LABELS.choice_letter_a,
    LABELS.choice_letter_b,
    LABELS.choice_letter_c,
    LABELS.choice_letter_d,
  ];

  return (
    <div className="flex-1 flex flex-col gap-3 px-4">
      {choicesVisible && question.choices.map((choice, idx) => {
        const selected = answers[currentIndex] === idx;
        return (
          <button
            key={choice.id}
            onClick={() => onPickAnswer(choice.id, idx)}
            disabled={animating || pendingFeedback}
            className="w-full text-left rounded-2xl flex items-start gap-3 transition-all duration-200 active:scale-[0.97]"
            style={{
              padding: '14px 16px',
              backgroundColor: selected ? `${color}18` : 'rgba(255,255,255,0.03)',
              border: selected ? `2px solid ${color}` : '1px solid rgba(255,255,255,0.07)',
              boxShadow: selected ? `0 0 24px ${color}20, inset 0 1px 0 ${color}10` : 'none',
              animation: `choice-enter 0.35s ease-out ${idx * 0.07}s both`,
            }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200"
              style={{
                backgroundColor: selected ? color : `${color}12`,
                color: selected ? '#fff' : color,
                boxShadow: selected ? `0 0 12px ${color}40` : 'none',
              }}
            >
              <span className="text-sm font-bold">{letters[idx]}</span>
            </div>
            <span
              className="text-[14px] leading-relaxed pt-1.5 transition-colors duration-200"
              style={{ color: selected ? '#fff' : 'rgba(255,255,255,0.65)' }}
            >
              {choice.text}
            </span>
          </button>
        );
      })}
    </div>
  );
}
