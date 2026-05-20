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
  prefixEmoji?: string;
  trailingBadge?: { label: string; color: string };
};

export function QuizChoiceButton({
  index,
  text,
  hint,
  selected,
  disabled,
  accentColor = '#845ef7',
  onSelect,
  prefixEmoji,
  trailingBadge,
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
        <span className="text-base font-bold">{LETTERS[index] ?? String(index + 1)}</span>
      </div>
      <div className="flex-1 pt-1.5 min-w-0">
        <span
          className="text-[16px] leading-relaxed transition-colors duration-200 inline-flex items-start gap-1.5"
          style={{ color: selected ? '#fff' : 'rgba(255,255,255,0.65)' }}
        >
          {prefixEmoji ? (
            <span
              className="text-base leading-none flex-shrink-0"
              style={{ filter: selected ? 'drop-shadow(0 0 4px rgba(255,255,255,0.5))' : 'none' }}
              aria-hidden
            >
              {prefixEmoji}
            </span>
          ) : null}
          <span className="flex-1">{text}</span>
        </span>
        {hint && (
          <p className="text-[14px] mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {hint}
          </p>
        )}
      </div>
      {trailingBadge ? (
        <span
          className="text-[10px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0 self-center"
          style={{ background: `${trailingBadge.color}20`, color: trailingBadge.color, border: `1px solid ${trailingBadge.color}50` }}
        >
          {trailingBadge.label}
        </span>
      ) : null}
    </button>
  );
}
