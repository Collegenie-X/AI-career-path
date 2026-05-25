'use client';

import { Gauge } from 'lucide-react';

interface AiFivePointScaleProps {
  title: string;
  hint: string;
  value: 1 | 2 | 3 | 4 | 5;
  anchorForValue: string;
  accentColor: string;
  lowLabel: string;
  highLabel: string;
  /** 게임 UI: 게이지 아이콘과 강조 타이틀 */
  visualVariant?: 'default' | 'game';
}

const LEVEL_LABEL: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: '매우 낮음',
  2: '낮음',
  3: '보통',
  4: '높음',
  5: '매우 높음',
};

const LEVEL_TONE: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: '#22c55e',
  2: '#84cc16',
  3: '#eab308',
  4: '#f97316',
  5: '#ef4444',
};

export function AiFivePointScale({
  title,
  hint,
  value,
  anchorForValue,
  accentColor,
  lowLabel,
  highLabel,
  visualVariant = 'default',
}: AiFivePointScaleProps) {
  const levels = [1, 2, 3, 4, 5] as const;
  const isGame = visualVariant === 'game';
  const fillPercent = (value / 5) * 100;
  const levelLabel = LEVEL_LABEL[value];
  const levelTone = LEVEL_TONE[value];

  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: isGame
          ? `linear-gradient(145deg, ${accentColor}10, rgba(0,0,0,0.35))`
          : 'rgba(255,255,255,0.03)',
        border: isGame ? `1px solid ${accentColor}28` : '1px solid rgba(255,255,255,0.08)',
        boxShadow: isGame ? `0 6px 24px ${accentColor}12` : undefined,
      }}
    >
      {/* 헤더: 제목 + 큰 점수 배지 */}
      <div className="mb-3 flex items-start gap-2">
        {isGame && (
          <div
            className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg"
            style={{
              background: `${accentColor}22`,
              border: `1px solid ${accentColor}40`,
            }}
          >
            <Gauge className="h-3.5 w-3.5" style={{ color: accentColor }} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h4 className={`text-sm text-white ${isGame ? 'font-black tracking-tight' : 'font-bold'}`}>{title}</h4>
          <p className="mt-1 text-[11px] leading-relaxed text-gray-500">{hint}</p>
        </div>
        {/* 점수 배지: 한눈에 "X/5" */}
        <div
          className="flex flex-shrink-0 flex-col items-center justify-center rounded-xl px-3 py-1.5"
          style={{
            background: `linear-gradient(135deg, ${levelTone}, ${levelTone}cc)`,
            boxShadow: `0 4px 14px ${levelTone}55`,
          }}
        >
          <div className="flex items-baseline gap-0.5 leading-none">
            <span className="text-xl font-black text-white tabular-nums">{value}</span>
            <span className="text-[10px] font-bold text-white/80">/5</span>
          </div>
          <span className="mt-0.5 text-[9px] font-black tracking-wider text-white/95">{levelLabel}</span>
        </div>
      </div>

      {/* 단일 게이지 바 + 현재 위치 포인터 */}
      <div className="relative mt-4 mb-1.5">
        {/* 트랙 */}
        <div
          className="h-3 w-full overflow-hidden rounded-full"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {/* 채워진 부분 */}
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${fillPercent}%`,
              background: `linear-gradient(90deg, ${accentColor}aa, ${levelTone})`,
              boxShadow: `0 0 12px ${levelTone}66`,
            }}
          />
        </div>
        {/* 현재 위치 포인터 (▼) */}
        <div
          className="absolute -top-3 -translate-x-1/2"
          style={{ left: `${fillPercent}%` }}
        >
          <div
            className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black tabular-nums"
            style={{
              background: levelTone,
              color: '#0a0a0a',
              boxShadow: `0 0 0 2px rgba(0,0,0,0.6), 0 4px 10px ${levelTone}aa`,
            }}
          >
            {value}
          </div>
        </div>
      </div>

      {/* 1~5 눈금 + 양끝 라벨 */}
      <div className="mt-2 flex items-center justify-between px-0.5">
        {levels.map((lv) => {
          const isCurrent = lv === value;
          return (
            <div key={lv} className="flex flex-col items-center gap-0.5">
              <div
                className="h-1.5 w-px"
                style={{ background: isCurrent ? levelTone : 'rgba(255,255,255,0.15)' }}
              />
              <span
                className="text-[10px] font-bold tabular-nums"
                style={{
                  color: isCurrent ? levelTone : 'rgba(255,255,255,0.28)',
                }}
              >
                {lv}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-gray-500">
        <span>← {lowLabel}</span>
        <span>{highLabel} →</span>
      </div>

      {/* 점수 의미 설명 */}
      <div
        className="mt-3 rounded-lg p-2.5"
        style={{
          background: `${levelTone}12`,
          border: `1px solid ${levelTone}30`,
        }}
      >
        <p className="text-xs leading-relaxed text-gray-200">
          <span className="font-black" style={{ color: levelTone }}>
            {value}점 · {levelLabel}
          </span>
          <span className="mx-1.5 text-gray-500">—</span>
          {anchorForValue}
        </p>
      </div>
    </div>
  );
}
