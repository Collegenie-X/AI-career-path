'use client';

import { splitCompetition, parseCompetitionDetail } from './competitionLevel';

/** 목록·지도 카드에 붙는 경쟁률 뱃지 — 비율이면 강조색 + 전년 대비 ▲▼, 미공개 등은 회색 */
export function CompetitionBadge({ raw, color, size = 11 }: { raw?: string | null; color: string; size?: number }) {
  const competition = raw ? splitCompetition(raw) : null;
  if (!competition?.headline) return null;
  const isRatio = competition.headline.includes(':');
  const trend = isRatio ? parseCompetitionDetail(competition.detail).trend : [];
  const delta = trend.length > 1 ? trend[trend.length - 1].value - trend[trend.length - 2].value : null;

  return (
    <span
      className="font-bold px-1.5 py-0.5 rounded-md leading-none inline-flex items-center gap-1 flex-shrink-0 whitespace-nowrap"
      style={{
        fontSize: size,
        ...(isRatio
          ? { background: `${color}22`, border: `1px solid ${color}55`, color: '#f9fafb' }
          : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#9ca3af' }),
      }}
      title={competition.detail || undefined}
    >
      📊 경쟁률 {competition.headline}
      {delta !== null && delta !== 0 && (
        <span style={{ color: delta > 0 ? '#fb923c' : '#38bdf8' }}>{delta > 0 ? '▲' : '▼'}</span>
      )}
    </span>
  );
}
