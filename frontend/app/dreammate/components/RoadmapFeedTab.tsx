'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { PERIOD_FILTERS, DREAM_ITEM_TYPES, LABELS } from '../config';
import type { SharedRoadmap, DreamItemType } from '../types';
import { RoadmapCard } from './RoadmapCard';

type FilterOption = {
  id: string;
  label: string;
  emoji: string;
};

const TYPE_FILTERS: FilterOption[] = [
  { id: 'all', label: '전체', emoji: '✨' },
  ...DREAM_ITEM_TYPES.map(t => ({ id: t.value, label: t.label, emoji: t.emoji })),
];

const PERIOD_FILTER_OPTIONS: FilterOption[] = PERIOD_FILTERS as FilterOption[];

interface FilterSelectProps {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (nextValue: string) => void;
}

function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
  return (
    <label className="flex items-center gap-2 px-3 h-9 rounded-xl text-xs"
      style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <span className="text-gray-400 whitespace-nowrap">{label}</span>
      <select
        value={value}
        onChange={event => onChange(event.target.value)}
        className="w-full bg-transparent text-white text-xs font-semibold outline-none"
      >
        {options.map(option => (
          <option key={option.id} value={option.id} className="bg-[#111827]">
            {option.emoji} {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

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
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();

  const filtered = useMemo(
    () =>
      roadmaps.filter(roadmap => {
        if (periodFilter !== 'all' && roadmap.period !== periodFilter) return false;
        if (typeFilter !== 'all' && !roadmap.items.some(item => item.type === typeFilter)) return false;
        if (!normalizedSearchQuery) return true;

        const matchesTitle = roadmap.title.toLowerCase().includes(normalizedSearchQuery);
        const matchesOwner = roadmap.ownerName.toLowerCase().includes(normalizedSearchQuery);
        const matchesItem = roadmap.items.some(item => item.title.toLowerCase().includes(normalizedSearchQuery));
        const matchesExecutionField = roadmap.items.some(item => {
          const matchesItemOutput = item.targetOutput?.toLowerCase().includes(normalizedSearchQuery);
          const matchesSuccessCriteria = item.successCriteria?.toLowerCase().includes(normalizedSearchQuery);
          const matchesTodoRecord = (item.subItems ?? []).some(todoItem =>
            todoItem.note?.toLowerCase().includes(normalizedSearchQuery)
            || todoItem.outputRef?.toLowerCase().includes(normalizedSearchQuery)
            || todoItem.reviewNote?.toLowerCase().includes(normalizedSearchQuery),
          );
          return Boolean(matchesItemOutput || matchesSuccessCriteria || matchesTodoRecord);
        });

        return matchesTitle || matchesOwner || matchesItem || matchesExecutionField;
      }),
    [roadmaps, periodFilter, typeFilter, normalizedSearchQuery],
  );

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
        <p className="text-xs text-gray-500 mt-0.5">{LABELS.feedSubtitle}</p>
        <button
          onClick={onCreateRoadmap}
          className="h-8 px-3 rounded-lg text-[11px] font-bold"
          style={{ background: 'linear-gradient(135deg, #6C5CE7, #a855f7)', color: '#fff' }}
        >
          + {LABELS.createRoadmapButton}
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder={LABELS.feedSearchPlaceholder}
          className="w-full h-10 pl-10 pr-4 rounded-xl text-sm text-white placeholder-gray-600 outline-none"
          style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
        />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 gap-2">
        <FilterSelect label="기간" value={periodFilter} options={PERIOD_FILTER_OPTIONS} onChange={setPeriodFilter} />
        <FilterSelect label="유형" value={typeFilter} options={TYPE_FILTERS} onChange={setTypeFilter} />
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
