'use client';

import { useEffect, useRef, useState } from 'react';
import { Heart, Bookmark, MessageSquare, MoreVertical, Flag } from 'lucide-react';
import { DREAM_ITEM_TYPES, LABELS, PERIOD_FILTERS } from '../config';
import type { SharedRoadmap } from '../types';
import { RoadmapReportDialog } from './RoadmapReportDialog';

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
  onReportRoadmap: (roadmapId: string, reasonId: string, detail: string) => void;
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
  onReportRoadmap,
}: RoadmapCardProps) {
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const actionMenuRef = useRef<HTMLDivElement | null>(null);
  const periodInfo = PERIOD_FILTERS
    .filter(periodFilter => periodFilter.id !== 'all')
    .find(periodFilter => periodFilter.id === roadmap.period);
  const periodColor = PERIOD_LABEL_COLORS[roadmap.period] ?? '#6B7280';

  useEffect(() => {
    if (!showActionMenu) return;
    const closeActionMenuWhenClickedOutside = (event: MouseEvent) => {
      if (!actionMenuRef.current) return;
      if (!actionMenuRef.current.contains(event.target as Node)) {
        setShowActionMenu(false);
      }
    };
    document.addEventListener('mousedown', closeActionMenuWhenClickedOutside);
    return () => {
      document.removeEventListener('mousedown', closeActionMenuWhenClickedOutside);
    };
  }, [showActionMenu]);

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
                className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: `${periodColor}18`, color: periodColor }}
              >
                {periodInfo.label}
              </span>
            )}
          </div>
          <p className="text-[10px] text-gray-500">{formatTimeAgo(roadmap.sharedAt)}</p>
        </div>
        <div ref={actionMenuRef} className="relative flex-shrink-0">
          <button
            onClick={event => {
              event.stopPropagation();
              setShowActionMenu(prev => !prev);
            }}
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
            aria-label={LABELS.roadmapMoreActionLabel}
          >
            <MoreVertical className="w-3.5 h-3.5 text-gray-400" />
          </button>
          {showActionMenu && (
            <div
              className="absolute right-0 top-9 min-w-[112px] rounded-xl p-1 z-20"
              style={{ backgroundColor: '#101026', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <button
                onClick={event => {
                  event.stopPropagation();
                  setShowActionMenu(false);
                  setShowReportDialog(true);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold text-red-300"
                style={{ backgroundColor: 'rgba(239,68,68,0.08)' }}
              >
                <Flag className="w-3.5 h-3.5" />
                {LABELS.roadmapReportMenuLabel}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Title & Description */}
      <h4 className="text-sm font-bold text-white mb-1">{roadmap.title}</h4>
      <p className="text-xs text-gray-400 line-clamp-2 mb-3">{roadmap.description}</p>

      {/* Items preview */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {roadmap.items.slice(0, 4).map(item => {
          const typeInfo = DREAM_ITEM_TYPES.find(t => t.value === item.type);
          return (
            <span
              key={item.id}
              className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg"
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
          <span className="text-[10px] text-gray-500 px-2 py-1">+{roadmap.items.length - 4}</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-2 border-t border-white/5">
        <button
          onClick={e => { e.stopPropagation(); onToggleLike(); }}
          className="flex items-center gap-1 text-[11px] transition-all"
          style={{ color: isLiked ? '#EF4444' : '#6B7280' }}
        >
          <Heart className="w-3.5 h-3.5" fill={isLiked ? '#EF4444' : 'none'} />
          {likeCount}
        </button>
        <button
          onClick={e => { e.stopPropagation(); onToggleBookmark(); }}
          className="flex items-center gap-1 text-[11px] transition-all"
          style={{ color: isBookmarked ? '#FBBF24' : '#6B7280' }}
        >
          <Bookmark className="w-3.5 h-3.5" fill={isBookmarked ? '#FBBF24' : 'none'} />
          {bookmarkCount}
        </button>
        <span className="flex items-center gap-1 text-[11px] text-gray-500">
          <MessageSquare className="w-3.5 h-3.5" />
          {roadmap.comments.length}
        </span>
        <span className="ml-auto text-[10px] text-gray-500">
          {roadmap.items.length}개 항목
        </span>
      </div>

      {showReportDialog && (
        <RoadmapReportDialog
          roadmapTitle={roadmap.title}
          onClose={() => setShowReportDialog(false)}
          onSubmit={(reasonId, detail) => onReportRoadmap(roadmap.id, reasonId, detail)}
        />
      )}
    </div>
  );
}
