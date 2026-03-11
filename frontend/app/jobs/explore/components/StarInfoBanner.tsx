'use client';

import { useMemo } from 'react';
import type { StarData } from '../types';
import { LABELS } from '../config';
import { ChevronRight, User, BarChart2, Clock } from 'lucide-react';
import { normalizeStarProfile } from '@/data/stars/normalizeProfile';

interface StarInfoBannerProps {
  star: StarData;
  onOpenDetail?: () => void;
  /** 모바일 한 화면 우선 시 여백 축소 */
  compact?: boolean;
}

function DifficultyDots({ level, color }: { level: number; color: string }) {
  return (
    <div className="flex gap-0.5 justify-center">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: i < level ? color : 'rgba(255,255,255,0.15)' }}
        />
      ))}
    </div>
  );
}

/**
 * 메인 페이지(jobs/explore)용 간단 카드
 * - 간단 설명, 직무 성향·난이도·준비 기간, 상세 보기 버튼
 * - 큰 아이콘/제목은 StarDetailDialog 헤더와 중복되므로 제외
 */
export function StarInfoBanner({ star, onOpenDetail, compact }: StarInfoBannerProps) {
  const rawProfile = star.starProfile;
  const profile = useMemo(
    () => (rawProfile ? normalizeStarProfile(rawProfile as Parameters<typeof normalizeStarProfile>[0]) : null),
    [rawProfile]
  );
  const hasDetail = rawProfile && onOpenDetail;

  const meta = profile?.meta;
  const hollandCode = meta?.hollandCode;
  const difficultyLevel = meta?.difficultyLevel ?? 0;
  const avgYears = meta?.avgPreparationYears ?? 0;
  const difficultyText =
    difficultyLevel > 0 ? LABELS.star_difficulty_levels[String(difficultyLevel)] ?? '' : '';

  return (
    <div className={compact ? 'mb-4' : 'mb-10'}>
      <div
        className={`rounded-2xl flex flex-col items-center text-center relative overflow-hidden ${compact ? 'p-4' : 'p-5'}`}
        style={{
          backgroundColor: `${star.color}08`,
          border: `1.5px solid ${star.color}25`,
        }}
      >
        <div className="absolute -right-4 -top-4 text-7xl opacity-10 select-none">{star.emoji}</div>

        {/* 간단 설명 */}
        <p className={`text-gray-400 leading-relaxed ${compact ? 'text-xs mb-3' : 'text-sm mb-4'}`}>
          {star.description}
        </p>

        {/* 직무 성향 · 난이도 · 준비 기간 (세로 배치 + 아이콘) */}
        {(hollandCode || difficultyLevel > 0 || avgYears > 0) && (
          <div
            className={`w-full flex flex-col gap-2 rounded-xl ${compact ? 'py-2 px-3 mb-3' : 'py-3 px-4 mb-4'}`}
            style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            {hollandCode && (
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${star.color}20` }}
                >
                  <User className="w-4 h-4" style={{ color: star.color }} />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <span className="text-[10px] text-gray-500 block">{LABELS.star_job_tendency_label}</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full inline-block"
                      style={{ backgroundColor: `${star.color}25`, color: star.color }}
                    >
                      {hollandCode}
                    </span>
                    <span className="text-[10px] text-gray-600">{LABELS.star_job_tendency_hint}</span>
                  </div>
                </div>
              </div>
            )}
            {difficultyLevel > 0 && (
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${star.color}20` }}
                >
                  <BarChart2 className="w-4 h-4" style={{ color: star.color }} />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <span className="text-[10px] text-gray-500 block">{LABELS.star_difficulty_label}</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <DifficultyDots level={difficultyLevel} color={star.color} />
                    <span className="text-xs font-bold" style={{ color: star.color }}>
                      {difficultyText}
                    </span>
                   
                  </div>
                </div>
              </div>
            )}
            {avgYears > 0 && (
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${star.color}20` }}
                >
                  <Clock className="w-4 h-4" style={{ color: star.color }} />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <span className="text-[10px] text-gray-500 block">{LABELS.star_preparation_label}</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold" style={{ color: star.color }}>
                      {LABELS.star_preparation_years_prefix} {avgYears}
                      {LABELS.star_preparation_unit}
                    </span>
                    <span className="text-[10px] text-gray-600">{LABELS.star_preparation_hint}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 상세 보기 버튼 */}
        {hasDetail && (
          <button
            type="button"
            onClick={onOpenDetail}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            style={{
              backgroundColor: `${star.color}30`,
              color: star.color,
              border: `2px solid ${star.color}55`,
            }}
          >
            {LABELS.star_view_detail_button}
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
