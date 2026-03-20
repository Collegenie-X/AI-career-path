'use client';

import { useMemo } from 'react';
import { Heart, Bookmark, MessageSquare } from 'lucide-react';
import { DREAM_ITEM_TYPES, LABELS, PERIOD_FILTERS } from '../config';
import type { SharedRoadmap } from '../types';
import { getRoadmapEffectiveTodoCounts } from '../utils/roadmapTodoCounts';

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

interface RoadmapCardProps {
  roadmap: SharedRoadmap;
  isLiked: boolean;
  isBookmarked: boolean;
  likeCount: number;
  bookmarkCount: number;
  onToggleLike: () => void;
  onToggleBookmark: () => void;
  onViewDetail: () => void;
}

function formatRoadmapMonthsLabel(roadmap: SharedRoadmap): string {
  const uniqueMonths = Array.from(
    new Set(
      roadmap.items
        .flatMap(roadmapItem => roadmapItem.months)
        .filter(month => Number.isInteger(month) && month >= 1 && month <= 12)
    )
  ).sort((firstMonth, secondMonth) => firstMonth - secondMonth);

  if (!uniqueMonths.length) {
    return LABELS.roadmapCardNoMonthLabel ?? '월 정보 없음';
  }

  if (uniqueMonths.length === 1) {
    return `${uniqueMonths[0]}월`;
  }

  return `${uniqueMonths[0]}월 ~ ${uniqueMonths[uniqueMonths.length - 1]}월`;
}

export function RoadmapCard({
  roadmap,
  isLiked,
  isBookmarked,
  likeCount,
  bookmarkCount,
  onToggleLike,
  onToggleBookmark,
  onViewDetail,
}: RoadmapCardProps) {
  const periodInfo = PERIOD_FILTERS
    .filter(periodFilter => periodFilter.id !== 'all')
    .find(periodFilter => periodFilter.id === roadmap.period);
  const periodColor = PERIOD_LABEL_COLORS[roadmap.period] ?? '#6B7280';
  const roadmapMonthSummaryLabel = useMemo(() => formatRoadmapMonthsLabel(roadmap), [roadmap]);
  const roadmapExecutionSummary = useMemo(() => {
    const allTodoItems = roadmap.items.flatMap(item => item.subItems ?? []);
    const { total: totalActionableTodoCount, done: doneActionableTodoCount } = getRoadmapEffectiveTodoCounts(roadmap.items);
    const evidenceCount = allTodoItems.filter(todoItem => Boolean(todoItem.outputRef?.trim())).length;
    const outputCriteriaCount = roadmap.items.filter(item => item.targetOutput || item.successCriteria).length;
    return {
      totalActionableTodoCount,
      doneActionableTodoCount,
      evidenceCount,
      outputCriteriaCount,
    };
  }, [roadmap.items]);
  const milestoneResultCount = roadmap.milestoneResults?.length ?? 0;
  const latestMilestoneResult = useMemo(
    () => (roadmap.milestoneResults ?? []).slice().sort((left, right) => {
      const leftTime = new Date(left.recordedAt ?? 0).getTime();
      const rightTime = new Date(right.recordedAt ?? 0).getTime();
      return rightTime - leftTime;
    })[0],
    [roadmap.milestoneResults],
  );
  const hasSharedResultAsset = Boolean(
    roadmap.finalResultUrl?.trim()
    || roadmap.finalResultImageUrl?.trim()
    || (roadmap.milestoneResults ?? []).some(result => Boolean(result.resultUrl?.trim() || result.imageUrl?.trim())),
  );

  return (
    <div
      onClick={onViewDetail}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onViewDetail();
        }
      }}
      role="button"
      tabIndex={0}
      className="w-full rounded-2xl p-4 text-left transition-all active:scale-[0.99] cursor-pointer"
      style={{
        backgroundColor: `${roadmap.starColor}08`,
        border: `1px solid ${roadmap.starColor}20`,
      }}
    >
      {/* Header */}
      <div className="relative flex items-start gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
          style={{ backgroundColor: `${roadmap.starColor}18` }}
        >
          {roadmap.ownerEmoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-bold text-white truncate">{roadmap.ownerName}</span>
            {periodInfo && (
              <span
                className="text-sm font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: `${periodColor}18`, color: periodColor }}
              >
                {periodInfo.label}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">{formatTimeAgo(roadmap.sharedAt)}</p>
        </div>
      </div>

      {/* Title & month summary */}
      <h4 className="text-sm font-bold text-white mb-0.5">{roadmap.title}</h4>
      <p className="text-sm text-cyan-300 mb-2">{roadmapMonthSummaryLabel}</p>
      <p className="text-sm text-gray-400 line-clamp-2 mb-3">{roadmap.description}</p>
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        <span className="text-sm px-2 py-1 rounded-lg text-violet-200" style={{ backgroundColor: 'rgba(139,92,246,0.16)' }}>
          산출물 기준 {roadmapExecutionSummary.outputCriteriaCount}개
        </span>
        <span className="text-sm px-2 py-1 rounded-lg text-emerald-200" style={{ backgroundColor: 'rgba(16,185,129,0.16)' }}>
          증빙 {roadmapExecutionSummary.evidenceCount}건
        </span>
        <span className="text-sm px-2 py-1 rounded-lg text-cyan-200" style={{ backgroundColor: 'rgba(6,182,212,0.16)' }}>
          진행 {roadmapExecutionSummary.doneActionableTodoCount}/{roadmapExecutionSummary.totalActionableTodoCount}
        </span>
        {milestoneResultCount > 0 && (
          <span className="text-sm px-2 py-1 rounded-lg text-sky-200" style={{ backgroundColor: 'rgba(56,189,248,0.18)' }}>
            중간 결과물 {milestoneResultCount}개
          </span>
        )}
        {hasSharedResultAsset && (
          <span className="text-sm px-2 py-1 rounded-lg text-amber-200" style={{ backgroundColor: 'rgba(245,158,11,0.18)' }}>
            결과물 공유됨
          </span>
        )}
      </div>

      {(latestMilestoneResult || roadmap.finalResultTitle || roadmap.finalResultUrl || roadmap.finalResultImageUrl) && (
        <div className="space-y-2 mb-3">
          {latestMilestoneResult && (
            <div className="rounded-lg px-2.5 py-2" style={{ backgroundColor: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.25)' }}>
              <p className="text-sm font-bold text-sky-200">중간 결과물</p>
              <p className="text-sm text-white truncate mt-0.5">{latestMilestoneResult.title}</p>
              {(latestMilestoneResult.monthWeekLabel || latestMilestoneResult.timeLog) && (
                <p className="text-sm text-sky-300/90 mt-0.5 truncate">
                  {latestMilestoneResult.monthWeekLabel ?? '-'} {latestMilestoneResult.timeLog ? `· ${latestMilestoneResult.timeLog}` : ''}
                </p>
              )}
            </div>
          )}
          {(roadmap.finalResultTitle || roadmap.finalResultUrl || roadmap.finalResultImageUrl) && (
            <div className="rounded-lg px-2.5 py-2" style={{ backgroundColor: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }}>
              <p className="text-sm font-bold text-emerald-200">최종 결과물</p>
              {roadmap.finalResultTitle && <p className="text-sm text-white truncate mt-0.5">{roadmap.finalResultTitle}</p>}
            </div>
          )}
        </div>
      )}

      {/* Items preview */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {roadmap.items.slice(0, 4).map(item => {
          const typeInfo = DREAM_ITEM_TYPES.find(t => t.value === item.type);
          return (
            <span
              key={item.id}
              className="flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-lg"
              style={{
                backgroundColor: `${typeInfo?.color ?? '#6B7280'}12`,
                color: typeInfo?.color ?? '#6B7280',
              }}
            >
              {typeInfo?.emoji} {item.title.length > 12 ? item.title.slice(0, 12) + '…' : item.title}
            </span>
          );
        })}
        {roadmap.items.length > 4 && (
          <span className="text-sm text-gray-500 px-2 py-1">+{roadmap.items.length - 4}</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-2 border-t border-white/5">
        <button
          onClick={e => { e.stopPropagation(); onToggleLike(); }}
          className="flex items-center gap-1 text-sm transition-all"
          style={{ color: isLiked ? '#EF4444' : '#6B7280' }}
        >
          <Heart className="w-3.5 h-3.5" fill={isLiked ? '#EF4444' : 'none'} />
          {likeCount}
        </button>
        <button
          onClick={e => { e.stopPropagation(); onToggleBookmark(); }}
          className="flex items-center gap-1 text-sm transition-all"
          style={{ color: isBookmarked ? '#FBBF24' : '#6B7280' }}
        >
          <Bookmark className="w-3.5 h-3.5" fill={isBookmarked ? '#FBBF24' : 'none'} />
          {bookmarkCount}
        </button>
        <span className="flex items-center gap-1 text-sm text-gray-500">
          <MessageSquare className="w-3.5 h-3.5" />
          {roadmap.comments.length}
        </span>
        <span className="ml-auto text-sm text-gray-500">
          {roadmap.items.length}개 항목
        </span>
      </div>

    </div>
  );
}
