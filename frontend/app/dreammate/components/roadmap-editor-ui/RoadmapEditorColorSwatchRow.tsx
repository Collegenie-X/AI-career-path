'use client';

interface RoadmapEditorColorSwatchRowProps {
  colors: readonly string[];
  value: string;
  onChange: (hex: string) => void;
  /** 다이얼로그 배경과 맞춘 ring-offset 색 */
  ringOffsetClassName?: string;
}

export function RoadmapEditorColorSwatchRow({
  colors,
  value,
  onChange,
  ringOffsetClassName = 'ring-offset-[#12122a]',
}: RoadmapEditorColorSwatchRowProps) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {colors.map(color => {
        const selected = value === color;
        return (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className={`w-9 h-9 rounded-full transition-shadow ${
              selected
                ? `ring-2 ring-white ring-offset-2 ${ringOffsetClassName} shadow-lg`
                : 'ring-2 ring-transparent hover:ring-white/25'
            }`}
            style={{ backgroundColor: color }}
            aria-label={color}
            aria-pressed={selected}
          />
        );
      })}
    </div>
  );
}
