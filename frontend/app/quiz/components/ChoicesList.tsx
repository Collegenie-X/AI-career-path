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
    <div className="flex-1 flex flex-col gap-3 md:gap-4">
      {choicesVisible && question.choices.map((choice, idx) => {
        const selected = answers[currentIndex] === idx;
        return (
          <button
            key={choice.id}
            onClick={() => onPickAnswer(choice.id, idx)}
            disabled={animating || pendingFeedback}
            className="w-full text-left rounded-2xl md:rounded-3xl flex items-start gap-3 md:gap-4 transition-all duration-200 hover:scale-[1.01] active:scale-[0.98]"
            style={{
              padding: '16px 18px',
              backgroundColor: selected ? `${color}18` : 'rgba(255,255,255,0.03)',
              border: selected ? `2px solid ${color}` : '1px solid rgba(255,255,255,0.07)',
              boxShadow: selected ? `0 0 30px ${color}20, inset 0 1px 0 ${color}10` : 'none',
              animation: `choice-enter 0.35s ease-out ${idx * 0.07}s both`,
            }}
          >
            <div
              className="w-10 h-10 md:w-11 md:h-11 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-200"
              style={{
                backgroundColor: selected ? color : `${color}12`,
                color: selected ? '#fff' : color,
                boxShadow: selected ? `0 0 16px ${color}40` : 'none',
              }}
            >
              <span className="text-sm md:text-base font-bold">{letters[idx]}</span>
            </div>
            <span
              className="text-sm md:text-base lg:text-lg leading-relaxed pt-1.5 md:pt-2 transition-colors duration-200"
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
