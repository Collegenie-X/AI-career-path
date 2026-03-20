'use client';

import { ChevronRight, Heart, MessageSquare } from 'lucide-react';
import { PERIOD_FILTERS, LABELS } from '../config';
import type { SharedRoadmap } from '../types';

const PERIOD_LABEL_COLORS: Record<string, string> = {
  afterschool: '#F59E0B',
  vacation: '#22C55E',
  semester: '#3B82F6',
};

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return `${Math.floor(days / 7)}주 전`;
}

interface RoadmapListRowProps {
  roadmap: SharedRoadmap;
  isSelected: boolean;
  onSelect: () => void;
}

/** 리스트-디테일 왼쪽 열: 좌측 정보 / 우측 원형 화살표 */
export function RoadmapListRow({ roadmap, isSelected, onSelect }: RoadmapListRowProps) {
  const periodInfo = PERIOD_FILTERS
    .filter((p) => p.id !== 'all')
    .find((p) => p.id === roadmap.period);
  const periodColor = PERIOD_LABEL_COLORS[roadmap.period] ?? '#6B7280';

  const accent = roadmap.starColor ?? '#8b5cf6';
  const descriptionPreview = (roadmap.description ?? '').trim().slice(0, 72);

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={`${roadmap.title} — ${LABELS.feedListRowOpenDetailAria ?? '상세 보기'}`}
      className="w-full rounded-none border px-3 py-3 text-left transition-all active:scale-[0.995] md:px-3.5 md:py-3.5"
      style={{
        background: isSelected
          ? `linear-gradient(90deg, rgba(108,92,231,0.18) 0%, rgba(99,102,241,0.08) 100%)`
          : 'rgba(255,255,255,0.03)',
        borderColor: isSelected ? 'rgba(129,140,248,0.55)' : 'rgba(255,255,255,0.1)',
        boxShadow: isSelected ? 'inset 3px 0 0 0 rgba(167,139,250,0.85)' : undefined,
      }}
    >
      <div className="flex items-stretch gap-3">
        {/* ── 좌측: 아바타 ── */}
        <div className="flex flex-shrink-0 flex-col items-center gap-1.5 pt-0.5">
          <div
            className="flex h-11 w-11 items-center justify-center text-xl leading-none"
            style={{
              backgroundColor: `${accent}22`,
              border: `1px solid ${accent}44`,
              borderRadius: '2px',
            }}
          >
            {roadmap.ownerEmoji}
          </div>
        </div>

        {/* ── 중앙: 텍스트·메타 ── */}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="truncate text-sm font-bold text-white">{roadmap.ownerName}</span>
            {periodInfo && (
              <span
                className="flex-shrink-0 px-1.5 py-0.5 text-[13px] font-bold"
                style={{ borderRadius: '2px', backgroundColor: `${periodColor}18`, color: periodColor }}
              >
                {periodInfo.emoji} {periodInfo.label}
              </span>
            )}
            <span className="text-[13px] text-gray-500">{formatTimeAgo(roadmap.sharedAt)}</span>
          </div>

          <h4 className="mb-1 line-clamp-2 text-[15px] font-black leading-snug text-white">{roadmap.title}</h4>

          {descriptionPreview.length > 0 && (
            <p className="mb-2 line-clamp-1 text-[13px] leading-relaxed text-gray-500">{descriptionPreview}</p>
          )}

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-gray-400">
            <span>
              <span className="text-gray-500">{LABELS.feedListRowItemsLabel ?? '항목'}</span>{' '}
              <span className="font-semibold text-gray-300">{roadmap.items.length}</span>
            </span>
            <span className="text-white/20">|</span>
            <span className="inline-flex items-center gap-0.5">
              <MessageSquare className="h-3 w-3 text-sky-400/90" aria-hidden />
              <span className="text-gray-500">{LABELS.feedListRowCommentsLabel ?? '댓글'}</span>{' '}
              <span className="font-semibold text-gray-300">{roadmap.comments.length}</span>
            </span>
            <span className="text-white/20">|</span>
            <span className="inline-flex items-center gap-0.5">
              <Heart className="h-3 w-3 text-rose-400/90" aria-hidden />
              <span className="text-gray-500">{LABELS.feedListRowLikesLabel ?? '좋아요'}</span>{' '}
              <span className="font-semibold text-gray-300">{roadmap.likes}</span>
            </span>
          </div>
        </div>

        {/* ── 우측: 원형 화살표 ── */}
        <div className="flex flex-shrink-0 flex-col items-center justify-center border-l border-white/[0.08] pl-3 md:pl-3.5">
          <div
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center md:h-11 md:w-11"
            style={{
              border: `2px solid ${isSelected ? 'rgba(196,181,253,0.65)' : 'rgba(255,255,255,0.14)'}`,
              backgroundColor: isSelected ? 'rgba(108,92,231,0.2)' : 'rgba(0,0,0,0.25)',
              borderRadius: '9999px',
            }}
            aria-hidden
          >
            <ChevronRight
              className="h-5 w-5 translate-x-px text-white/80 md:h-[22px] md:w-[22px]"
              strokeWidth={2.25}
            />
          </div>
        </div>
      </div>
    </button>
  );
}
