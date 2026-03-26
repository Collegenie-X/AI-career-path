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
      <div className="mb-2">
        <div className="flex items-start gap-2">
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
        </div>
      </div>
      <div className="flex items-center justify-between gap-1 mb-2">
        {levels.map((lv) => {
          const active = lv <= value;
          return (
            <div key={lv} className="flex-1 flex flex-col items-center gap-1 min-w-0">
              <div
                className="w-full h-2 rounded-full transition-all"
                style={{
                  background: active
                    ? `linear-gradient(90deg, ${accentColor}aa, ${accentColor})`
                    : 'rgba(255,255,255,0.08)',
                  boxShadow: active ? `0 0 10px ${accentColor}55` : 'none',
                }}
                title={`${lv}점`}
              />
              <span
                className="text-[10px] font-bold tabular-nums"
                style={{ color: active ? accentColor : 'rgba(255,255,255,0.25)' }}
              >
                {lv}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] text-gray-500 mb-2">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
      <p
        className="text-xs text-gray-300 leading-relaxed border-t border-white/10 pt-2"
        style={{ borderColor: `${accentColor}22` }}
      >
        <span className="font-bold text-white mr-1">{value}점:</span>
        {anchorForValue}
      </p>
    </div>
  );
}
