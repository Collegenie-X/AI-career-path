'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, Globe, Bookmark } from 'lucide-react';
import { AccordionSection } from '@/components/accordion';
import { TwoColumnPanelLayout, DetailPanelScrollContainer } from '@/components/TwoColumnPanelLayout';
import { PERIOD_FILTERS, DREAM_ITEM_TYPES, DREAM_LIST_ITEMS_PER_PAGE, LABELS } from '../config';
import { ListPagination } from './ListPagination';
import type { SharedRoadmap, DreamSpace, RoadmapShareChannel } from '../types';
import { RoadmapListRow } from './RoadmapListRow';
import { RoadmapDetailDialog } from './RoadmapDetailDialog';

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
    <label
      className="flex h-9 items-center gap-2 rounded-xl px-3 text-sm"
      style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <span className="whitespace-nowrap text-gray-400">{label}</span>
      <select
        value={value}
        onChange={event => onChange(event.target.value)}
        className="w-full bg-transparent text-sm font-semibold text-white outline-none"
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

export type RoadmapFeedDetailCallbacks = {
  onUseRoadmap: (roadmap: SharedRoadmap) => void;
  onEdit: (roadmap: SharedRoadmap) => void;
  onShare: (roadmap: SharedRoadmap) => void;
  onDelete: (roadmap: SharedRoadmap) => void;
  onShareRoadmap: (roadmap: SharedRoadmap, shareChannels: RoadmapShareChannel[], spaceIds: string[]) => void;
  onReportRoadmap: (roadmap: SharedRoadmap, reasonId: string, detail: string) => void;
  onCreateComment: (roadmap: SharedRoadmap, comment: string, parentId?: string) => void;
};

interface RoadmapFeedTabProps {
  roadmaps: SharedRoadmap[];
  currentUserId: string;
  bookmarkedIds: string[];
  onCreateRoadmap: () => void;
  availableSpaces: DreamSpace[];
  detailCallbacks: RoadmapFeedDetailCallbacks;
  onTabChange?: (tabId: string) => void;
}

export function RoadmapFeedTab({
  roadmaps,
  currentUserId,
  bookmarkedIds,
  onCreateRoadmap,
  availableSpaces,
  detailCallbacks,
  onTabChange,
}: RoadmapFeedTabProps) {
  const [periodFilter, setPeriodFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string | null>(null);
  const [bookmarkedPage, setBookmarkedPage] = useState(1);
  const [mySharedPage, setMySharedPage] = useState(1);
  const [feedListPage, setFeedListPage] = useState(1);
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();

  useEffect(() => {
    setFeedListPage(1);
  }, [periodFilter, typeFilter, searchQuery]);

  const selectedRoadmap = useMemo(
    () => roadmaps.find(rm => rm.id === selectedRoadmapId) ?? null,
    [roadmaps, selectedRoadmapId],
  );

  const mySharedRoadmaps = useMemo(
    () => roadmaps.filter(rm => rm.ownerId === currentUserId),
    [roadmaps, currentUserId],
  );

  const bookmarkedRoadmaps = useMemo(
    () => roadmaps.filter(rm => bookmarkedIds.includes(rm.id)),
    [roadmaps, bookmarkedIds],
  );

  const filtered = useMemo(
    () =>
      roadmaps.filter(roadmap => {
        if (periodFilter !== 'all' && roadmap.period !== periodFilter) return false;
        if (typeFilter !== 'all' && !roadmap.items.some(item => item.type === typeFilter)) return false;
        if (!normalizedSearchQuery) return true;

        const matchesTitle = roadmap.title.toLowerCase().includes(normalizedSearchQuery);
        const matchesOwner = roadmap.ownerName.toLowerCase().includes(normalizedSearchQuery);
        const matchesItem = roadmap.items.some(item => item.title.toLowerCase().includes(normalizedSearchQuery));
        const matchesRoadmapFinalResult = Boolean(
          roadmap.finalResultTitle?.toLowerCase().includes(normalizedSearchQuery)
          || roadmap.finalResultDescription?.toLowerCase().includes(normalizedSearchQuery)
          || roadmap.finalResultUrl?.toLowerCase().includes(normalizedSearchQuery),
        );
        const matchesRoadmapMilestoneResult = (roadmap.milestoneResults ?? []).some(result =>
          result.title.toLowerCase().includes(normalizedSearchQuery)
          || result.description?.toLowerCase().includes(normalizedSearchQuery)
          || result.monthWeekLabel?.toLowerCase().includes(normalizedSearchQuery)
          || result.resultUrl?.toLowerCase().includes(normalizedSearchQuery),
        );
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

        return matchesTitle || matchesOwner || matchesItem || matchesRoadmapFinalResult || matchesRoadmapMilestoneResult || matchesExecutionField;
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

  const paginatedBookmarked = useMemo(() => {
    const start = (bookmarkedPage - 1) * DREAM_LIST_ITEMS_PER_PAGE;
    return bookmarkedRoadmaps.slice(start, start + DREAM_LIST_ITEMS_PER_PAGE);
  }, [bookmarkedRoadmaps, bookmarkedPage]);

  const paginatedMyShared = useMemo(() => {
    const start = (mySharedPage - 1) * DREAM_LIST_ITEMS_PER_PAGE;
    return mySharedRoadmaps.slice(start, start + DREAM_LIST_ITEMS_PER_PAGE);
  }, [mySharedRoadmaps, mySharedPage]);

  const paginatedFeedList = useMemo(() => {
    const start = (feedListPage - 1) * DREAM_LIST_ITEMS_PER_PAGE;
    return sortedRoadmaps.slice(start, start + DREAM_LIST_ITEMS_PER_PAGE);
  }, [sortedRoadmaps, feedListPage]);

  const listColumnInner = (
    <div className="space-y-4 pb-4">
      <div>
        <p className="mt-0.5 text-sm text-gray-500">{LABELS.feedSubtitle}</p>
      </div>

      {bookmarkedRoadmaps.length > 0 && (
        <AccordionSection
          defaultOpen={true}
          header={
            <div className="flex items-center gap-2">
              <Bookmark className="w-3.5 h-3.5" style={{ color: '#FBBF24' }} />
              <span className="text-sm font-bold text-white">{LABELS.feedFilterBookmarkLabel ?? '북마크'}</span>
              <span className="text-[13px] text-gray-500">{bookmarkedRoadmaps.length}개 저장됨</span>
            </div>
          }
        >
          <div className="space-y-2">
            {paginatedBookmarked.map(rm => (
              <RoadmapListRow
                key={rm.id}
                roadmap={rm}
                isSelected={selectedRoadmapId === rm.id}
                onSelect={() => setSelectedRoadmapId(rm.id)}
              />
            ))}
          </div>
          <ListPagination
            totalItems={bookmarkedRoadmaps.length}
            currentPage={bookmarkedPage}
            onPageChange={setBookmarkedPage}
          />
          <div className="mt-3 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
        </AccordionSection>
      )}

      {mySharedRoadmaps.length > 0 && (
        <AccordionSection
          defaultOpen={true}
          header={
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5" style={{ color: '#22C55E' }} />
              <span className="text-sm font-bold text-white">{LABELS.feedFilterMySharedLabel ?? '내 공유'}</span>
              <span className="text-[13px] text-gray-500">{mySharedRoadmaps.length}개 공개중</span>
            </div>
          }
        >
          <div className="space-y-2">
            {paginatedMyShared.map(rm => (
              <RoadmapListRow
                key={rm.id}
                roadmap={rm}
                isSelected={selectedRoadmapId === rm.id}
                onSelect={() => setSelectedRoadmapId(rm.id)}
              />
            ))}
          </div>
          <ListPagination
            totalItems={mySharedRoadmaps.length}
            currentPage={mySharedPage}
            onPageChange={setMySharedPage}
          />
          <div className="mt-3 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
        </AccordionSection>
      )}

      <AccordionSection
        defaultOpen={true}
        header={
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">{LABELS.feedListLabel ?? '피드 목록'}</span>
            <span className="text-[13px] text-gray-500">
              {sortedRoadmaps.length}
              {LABELS.feedListCountSuffix ?? '개'}
            </span>
          </div>
        }
      >
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={LABELS.feedSearchPlaceholder}
              className="h-10 w-full rounded-xl pl-10 pr-4 text-sm text-white placeholder-gray-600 outline-none"
              style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <FilterSelect label="기간" value={periodFilter} options={PERIOD_FILTER_OPTIONS} onChange={setPeriodFilter} />
            <FilterSelect label="유형" value={typeFilter} options={TYPE_FILTERS} onChange={setTypeFilter} />
          </div>
          {sortedRoadmaps.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <span className="text-4xl">🗺️</span>
              <div>
                <p className="text-sm font-bold text-white">{LABELS.feedEmpty}</p>
                <p className="mt-1 text-sm text-gray-400">{LABELS.feedEmptyDesc}</p>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {paginatedFeedList.map(rm => (
                  <RoadmapListRow
                    key={rm.id}
                    roadmap={rm}
                    isSelected={selectedRoadmapId === rm.id}
                    onSelect={() => setSelectedRoadmapId(rm.id)}
                  />
                ))}
              </div>
              <ListPagination
                totalItems={sortedRoadmaps.length}
                currentPage={feedListPage}
                onPageChange={setFeedListPage}
              />
            </>
          )}
        </div>
      </AccordionSection>
    </div>
  );

  const emptyDetailTitle = String(LABELS.feedDetailEmptyTitle ?? '실행계획을 선택하세요');
  const emptyDetailSub = String(
    LABELS.feedDetailEmptySub ?? '왼쪽 목록에서 실행계획을 클릭하면 상세 내용이 여기에 표시됩니다',
  );

  return (
    <TwoColumnPanelLayout
      hasSelection={selectedRoadmap !== null}
      onClearSelection={() => setSelectedRoadmapId(null)}
      emptyPlaceholderText={emptyDetailTitle}
      emptyPlaceholderSubText={emptyDetailSub}
      emptyPlaceholderIllustration="sparkles"
      detailPanelClassName="rounded-none"
      listSlot={
        <div
          className="rounded-none border px-4 py-4 md:px-5 md:py-5"
          style={{
            borderColor: 'rgba(255,255,255,0.12)',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
            boxShadow: '0 20px 55px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          {listColumnInner}
        </div>
      }
      detailSlot={
        selectedRoadmap ? (
          <DetailPanelScrollContainer scrollKey={selectedRoadmapId}>
            <RoadmapDetailDialog
              variant="inline"
              roadmap={selectedRoadmap}
              isOwnedByCurrentUser={selectedRoadmap.ownerId === currentUserId}
              timelineDetailMode="feed_view_only"
              isReferenceViewOnlyMode={false}
              availableSpaces={availableSpaces}
              onClose={() => setSelectedRoadmapId(null)}
              onUseRoadmap={() => {
                detailCallbacks.onUseRoadmap(selectedRoadmap);
                onTabChange?.('my');
              }}
              onShare={() => detailCallbacks.onShare(selectedRoadmap)}
              onEdit={() => {
                detailCallbacks.onEdit(selectedRoadmap);
                setSelectedRoadmapId(null);
              }}
              onDelete={() => {
                detailCallbacks.onDelete(selectedRoadmap);
                setSelectedRoadmapId(null);
              }}
              onShareRoadmap={(channels, spaceIds) => detailCallbacks.onShareRoadmap(selectedRoadmap, channels, spaceIds)}
              onReportRoadmap={(reasonId, detail) => detailCallbacks.onReportRoadmap(selectedRoadmap, reasonId, detail)}
              onCreateComment={(comment, parentId) => detailCallbacks.onCreateComment(selectedRoadmap, comment, parentId)}
            />
          </DetailPanelScrollContainer>
        ) : null
      }
    />
  );
}
