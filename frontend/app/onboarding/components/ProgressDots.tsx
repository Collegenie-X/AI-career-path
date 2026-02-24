'use client';

interface ProgressDotsProps {
  total: number;
  current: number;
  activeColor: string;
  onDotClick: (index: number) => void;
}

export function ProgressDots({
  total,
  current,
  activeColor,
  onDotClick,
}: ProgressDotsProps) {
  return (
    <div className="flex items-center justify-center gap-2.5">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => onDotClick(i)}
          className="relative h-2.5 rounded-full transition-all duration-500 ease-out"
          style={{
            width: i === current ? 32 : 10,
            backgroundColor:
              i === current ? activeColor : 'rgba(255,255,255,0.15)',
            boxShadow: i === current ? `0 0 12px ${activeColor}60` : 'none',
          }}
        >
          {i === current && (
            <div className="absolute inset-0 rounded-full animate-shimmer" />
          )}
        </button>
      ))}
    </div>
  );
}
