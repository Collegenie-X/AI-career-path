'use client';

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

type QuizChoiceButtonProps = {
  index: number;
  text: string;
  hint?: string;
  selected: boolean;
  disabled: boolean;
  accentColor?: string;
  onSelect: () => void;
};

export function QuizChoiceButton({
  index,
  text,
  hint,
  selected,
  disabled,
  accentColor = '#845ef7',
  onSelect,
}: QuizChoiceButtonProps) {
  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className="w-full text-left rounded-2xl flex items-start gap-3 transition-all duration-200 active:scale-[0.97]"
      style={{
        padding: '14px 16px',
        backgroundColor: selected ? `${accentColor}18` : 'rgba(255,255,255,0.03)',
        border: selected ? `2px solid ${accentColor}` : '1px solid rgba(255,255,255,0.07)',
        boxShadow: selected ? `0 0 24px ${accentColor}20, inset 0 1px 0 ${accentColor}10` : 'none',
        animation: `choice-enter 0.35s ease-out ${index * 0.07}s both`,
      }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200"
        style={{
          backgroundColor: selected ? accentColor : `${accentColor}12`,
          color: selected ? '#fff' : accentColor,
          boxShadow: selected ? `0 0 12px ${accentColor}40` : 'none',
        }}
      >
        <span className="text-sm font-bold">{LETTERS[index] ?? String(index + 1)}</span>
      </div>
      <div className="flex-1 pt-1.5">
        <span
          className="text-[14px] leading-relaxed transition-colors duration-200"
          style={{ color: selected ? '#fff' : 'rgba(255,255,255,0.65)' }}
        >
          {text}
        </span>
        {hint && (
          <p className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {hint}
          </p>
        )}
      </div>
    </button>
  );
}
