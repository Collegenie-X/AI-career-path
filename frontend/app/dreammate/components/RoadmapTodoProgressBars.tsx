'use client';

interface RoadmapTodoProgressBarCardProps {
  title: string;
  doneCount: number;
  totalCount: number;
  accentColor: string;
}

interface RoadmapTodoInlineProgressBarProps {
  doneCount: number;
  totalCount: number;
  accentColor: string;
}

function toProgressPercent(doneCount: number, totalCount: number): number {
  if (totalCount <= 0) return 0;
  const rawPercent = (doneCount / totalCount) * 100;
  return Math.max(0, Math.min(100, Math.round(rawPercent)));
}

export function RoadmapTodoProgressBarCard({
  title,
  doneCount,
  totalCount,
  accentColor,
}: RoadmapTodoProgressBarCardProps) {
  const progressPercent = toProgressPercent(doneCount, totalCount);

  return (
    <div
      className="rounded-lg px-2.5 py-2"
      style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="flex items-center justify-between gap-2 text-[10px]">
        <span className="text-gray-300 font-semibold">{title}</span>
        <div className="flex items-center gap-1.5 text-gray-400">
          <span>{doneCount}/{totalCount}</span>
          <span className="text-gray-500">·</span>
          <span className="font-semibold text-gray-300">{progressPercent}%</span>
        </div>
      </div>
      <div className="mt-1.5 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.14)' }}>
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${progressPercent}%`,
            background: `linear-gradient(90deg, ${accentColor}, ${accentColor}cc)`,
          }}
        />
      </div>
    </div>
  );
}

export function RoadmapTodoInlineProgressBar({
  doneCount,
  totalCount,
  accentColor,
}: RoadmapTodoInlineProgressBarProps) {
  const progressPercent = toProgressPercent(doneCount, totalCount);

  return (
    <div className="min-w-[110px]">
      <div className="flex items-center justify-between gap-1 text-[9px] text-gray-400">
        <span>{doneCount}/{totalCount}</span>
        <span>{progressPercent}%</span>
      </div>
      <div className="mt-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.16)' }}>
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${progressPercent}%`,
            background: `linear-gradient(90deg, ${accentColor}, ${accentColor}cc)`,
          }}
        />
      </div>
    </div>
  );
}
