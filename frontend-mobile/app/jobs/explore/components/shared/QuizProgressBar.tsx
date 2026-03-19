'use client';

type QuizProgressBarProps = {
  current: number;
  total: number;
  accentColor?: string;
};

export function QuizProgressBar({ current, total, accentColor = '#845ef7' }: QuizProgressBarProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 flex gap-[3px]">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className="h-[5px] rounded-full flex-1 transition-all duration-300"
            style={{
              backgroundColor:
                i < current
                  ? accentColor
                  : i === current
                    ? `${accentColor}55`
                    : 'rgba(255,255,255,0.06)',
              boxShadow: i < current ? `0 0 6px ${accentColor}50` : 'none',
            }}
          />
        ))}
      </div>
      <span className="text-[12px] font-bold flex-shrink-0" style={{ color: accentColor }}>
        {current + 1}/{total}
      </span>
    </div>
  );
}
