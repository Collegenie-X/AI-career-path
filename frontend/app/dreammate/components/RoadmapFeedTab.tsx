'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { PERIOD_FILTERS, DREAM_ITEM_TYPES, LABELS } from '../config';
import type { SharedRoadmap, DreamItemType } from '../types';
import { RoadmapCard } from './RoadmapCard';

const TYPE_FILTERS: { id: string; label: string; emoji: string }[] = [
  { id: 'all', label: '전체', emoji: '✨' },
  ...DREAM_ITEM_TYPES.map(t => ({ id: t.value, label: t.label, emoji: t.emoji })),
];

interface RoadmapFeedTabProps {
  roadmaps: SharedRoadmap[];
  likedIds: string[];
  bookmarkedIds: string[];
  likeCounts: Record<string, number>;
  bookmarkCounts: Record<string, number>;
  onToggleLike: (id: string) => void;
  onToggleBookmark: (id: string) => void;
  onViewDetail: (roadmap: SharedRoadmap) => void;
  onCreateRoadmap: () => void;
}

export function RoadmapFeedTab({
  roadmaps,
  likedIds,
  bookmarkedIds,
  likeCounts,
  bookmarkCounts,
  onToggleLike,
  onToggleBookmark,
  onViewDetail,
  onCreateRoadmap,
}: RoadmapFeedTabProps) {
  const [periodFilter, setPeriodFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => roadmaps.filter(rm => {
    if (periodFilter !== 'all' && rm.period !== periodFilter) return false;
    if (typeFilter !== 'all' && !rm.items.some(it => it.type === typeFilter)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesTitle = rm.title.toLowerCase().includes(q);
      const matchesOwner = rm.ownerName.toLowerCase().includes(q);
      const matchesItem = rm.items.some(it => it.title.toLowerCase().includes(q));
      if (!matchesTitle && !matchesOwner && !matchesItem) return false;
    }
    return true;
  }), [roadmaps, periodFilter, typeFilter, searchQuery]);

  const sortedRoadmaps = useMemo(() => {
    const bookmarkedIdSet = new Set(bookmarkedIds);
    const bookmarkPriorityById: Record<string, number> = {};
    bookmarkedIds.forEach((roadmapId, index) => {
      bookmarkPriorityById[roadmapId] = index;
    });

    return [...filtered].sort((leftRoadmap, rightRoadmap) => {
      const leftIsBookmarked = bookmarkedIdSet.has(leftRoadmap.id);
      const rightIsBookmarked = bookmarkedIdSet.has(rightRoadmap.id);

      if (leftIsBookmarked !== rightIsBookmarked) {
        return leftIsBookmarked ? -1 : 1;
      }

      if (leftIsBookmarked && rightIsBookmarked) {
        return (bookmarkPriorityById[rightRoadmap.id] ?? -1) - (bookmarkPriorityById[leftRoadmap.id] ?? -1);
      }

      return 0;
    });
  }, [filtered, bookmarkedIds]);

  return (
    <div className="space-y-4 pb-28">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-white">{LABELS.feedTitle}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{LABELS.feedSubtitle}</p>
        </div>
        <button
          onClick={onCreateRoadmap}
          className="h-8 px-3 rounded-lg text-[11px] font-bold"
          style={{ background: 'linear-gradient(135deg, #6C5CE7, #a855f7)', color: '#fff' }}
        >
          {LABELS.createRoadmapButton}
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="로드맵 검색..."
          className="w-full h-10 pl-10 pr-4 rounded-xl text-sm text-white placeholder-gray-600 outline-none"
          style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
        />
      </div>

      {/* Period filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {PERIOD_FILTERS.map(f => {
          const isActive = periodFilter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setPeriodFilter(f.id)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all"
              style={isActive
                ? { background: 'linear-gradient(135deg, #6C5CE7, #a855f7)', color: '#fff' }
                : { backgroundColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              {f.emoji} {f.label}
            </button>
          );
        })}
      </div>

      {/* Type filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {TYPE_FILTERS.map(f => {
          const isActive = typeFilter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setTypeFilter(f.id)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all"
              style={isActive
                ? { background: 'linear-gradient(135deg, #6C5CE7, #a855f7)', color: '#fff' }
                : { backgroundColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              {f.emoji} {f.label}
            </button>
          );
        })}
      </div>

      {/* Roadmap list */}
      {sortedRoadmaps.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <span className="text-4xl">🗺️</span>
          <div>
            <p className="text-sm font-bold text-white">{LABELS.feedEmpty}</p>
            <p className="text-xs text-gray-400 mt-1">{LABELS.feedEmptyDesc}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedRoadmaps.map(rm => (
            <RoadmapCard
              key={rm.id}
              roadmap={rm}
              isLiked={likedIds.includes(rm.id)}
              isBookmarked={bookmarkedIds.includes(rm.id)}
              likeCount={likeCounts[rm.id] ?? rm.likes}
              bookmarkCount={bookmarkCounts[rm.id] ?? rm.bookmarks}
              onToggleLike={() => onToggleLike(rm.id)}
              onToggleBookmark={() => onToggleBookmark(rm.id)}
              onViewDetail={() => onViewDetail(rm)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
