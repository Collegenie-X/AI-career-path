'use client';

import { useState } from 'react';
import { Map, Users, Bookmark, ChevronRight } from 'lucide-react';
import { LABELS, RESOURCE_CATEGORIES } from '../config';
import type { SharedRoadmap, DreamResource, DreamSpace } from '../types';
import { RoadmapCard } from './RoadmapCard';

type MySubTab = 'roadmaps' | 'spaces' | 'bookmarks';

const MY_SUB_TABS: { id: MySubTab; labelKey: string; icon: typeof Map }[] = [
  { id: 'roadmaps',  labelKey: 'mySubTabPlansLabel', icon: Map },
  { id: 'spaces',    labelKey: 'mySubTabSpacesLabel',  icon: Users },
  { id: 'bookmarks', labelKey: 'mySubTabBookmarksLabel',    icon: Bookmark },
];

interface MyDreamMateTabProps {
  myRoadmaps: SharedRoadmap[];
  joinedSpaces: DreamSpace[];
  bookmarkedRoadmaps: SharedRoadmap[];
  bookmarkedResources: DreamResource[];
  likedIds: string[];
  bookmarkedIds: string[];
  likeCounts: Record<string, number>;
  bookmarkCounts: Record<string, number>;
  onToggleLike: (id: string) => void;
  onToggleBookmark: (id: string) => void;
  onViewRoadmapDetail: (rm: SharedRoadmap) => void;
  onGoToSpace: (spaceId: string) => void;
  onCreateRoadmap: () => void;
}

export function MyDreamMateTab({
  myRoadmaps,
  joinedSpaces,
  bookmarkedRoadmaps,
  bookmarkedResources,
  likedIds,
  bookmarkedIds,
  likeCounts,
  bookmarkCounts,
  onToggleLike,
  onToggleBookmark,
  onViewRoadmapDetail,
  onGoToSpace,
  onCreateRoadmap,
}: MyDreamMateTabProps) {
  const [subTab, setSubTab] = useState<MySubTab>('roadmaps');

  return (
    <div className="space-y-4 pb-28">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-white">{LABELS.myTitle}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{LABELS.mySubtitle}</p>
        </div>
        <button
          onClick={onCreateRoadmap}
          className="h-8 px-3 rounded-lg text-sm font-bold flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #6C5CE7, #a855f7)', color: '#fff' }}
        >
          {LABELS.myCreateRoadmapButton}
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: LABELS.myRoadmapsLabel, count: myRoadmaps.length, emoji: '🗺️', color: '#6C5CE7' },
          { label: LABELS.myGroupsLabel, count: joinedSpaces.length, emoji: '🤝', color: '#3B82F6' },
          { label: LABELS.myBookmarksLabel, count: bookmarkedRoadmaps.length + bookmarkedResources.length, emoji: '⭐', color: '#FBBF24' },
        ].map(card => (
          <div
            key={card.label}
            className="flex flex-col items-center gap-1 py-4 rounded-xl"
            style={{ backgroundColor: `${card.color}08`, border: `1px solid ${card.color}20` }}
          >
            <span className="text-2xl">{card.emoji}</span>
            <span className="text-lg font-black text-white">{card.count}</span>
            <span className="text-xs text-gray-400">{card.label}</span>
          </div>
        ))}
      </div>

      {/* Sub-tab switcher */}
      <div
        className="flex gap-2 p-1 rounded-xl"
        style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        {MY_SUB_TABS.map(tab => {
          const isActive = subTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all"
              style={isActive
                ? { background: 'linear-gradient(135deg, #6C5CE7, #a855f7)', color: '#fff', boxShadow: '0 2px 12px rgba(108,92,231,0.3)' }
                : { color: 'rgba(255,255,255,0.4)' }}
            >
              <Icon className="w-3.5 h-3.5" />
              {LABELS[tab.labelKey]}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {subTab === 'roadmaps' && (
        <div className="space-y-3">
          {myRoadmaps.length === 0 ? (
            <EmptyState emoji="🗺️" title={LABELS.myPlanEmptyTitle} desc={LABELS.myPlanEmptyDesc} />
          ) : (
            myRoadmaps.map(rm => (
              <RoadmapCard
                key={rm.id}
                roadmap={rm}
                isLiked={likedIds.includes(rm.id)}
                isBookmarked={bookmarkedIds.includes(rm.id)}
                likeCount={likeCounts[rm.id] ?? rm.likes}
                bookmarkCount={bookmarkCounts[rm.id] ?? rm.bookmarks}
                onToggleLike={() => onToggleLike(rm.id)}
                onToggleBookmark={() => onToggleBookmark(rm.id)}
                onViewDetail={() => onViewRoadmapDetail(rm)}
              />
            ))
          )}
        </div>
      )}

      {subTab === 'spaces' && (
        <div className="space-y-2">
          {joinedSpaces.length === 0 ? (
            <EmptyState emoji="🤝" title="참여 중인 스페이스가 없어요" desc="스페이스 탭에서 참여해 보세요" />
          ) : (
            joinedSpaces.map(space => (
              <button
                key={space.id}
                onClick={() => onGoToSpace(space.id)}
                className="w-full flex items-center gap-3 p-4 rounded-2xl text-left transition-all active:scale-[0.99]"
                style={{ backgroundColor: `${space.color}08`, border: `1px solid ${space.color}20` }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ backgroundColor: `${space.color}18` }}
                >
                  {space.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-bold text-white">{space.name}</span>
                  <p className="text-sm text-gray-400 line-clamp-1">{space.description}</p>
                  <span className="text-xs text-gray-500">{space.memberCount}명 참여 중</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
              </button>
            ))
          )}
        </div>
      )}

      {subTab === 'bookmarks' && (
        <div className="space-y-3">
          {bookmarkedRoadmaps.length === 0 && bookmarkedResources.length === 0 ? (
            <EmptyState emoji="⭐" title={LABELS.myBookmarksEmptyTitle} desc={LABELS.myBookmarksEmptyDesc} />
          ) : (
            <>
              {bookmarkedRoadmaps.length > 0 && (
                <>
                  <span className="text-xs font-bold text-gray-400">{LABELS.myBookmarkedPlansSectionLabel} ({bookmarkedRoadmaps.length})</span>
                  {bookmarkedRoadmaps.map(rm => (
                    <RoadmapCard
                      key={rm.id}
                      roadmap={rm}
                      isLiked={likedIds.includes(rm.id)}
                      isBookmarked={true}
                      likeCount={likeCounts[rm.id] ?? rm.likes}
                      bookmarkCount={bookmarkCounts[rm.id] ?? rm.bookmarks}
                      onToggleLike={() => onToggleLike(rm.id)}
                      onToggleBookmark={() => onToggleBookmark(rm.id)}
                      onViewDetail={() => onViewRoadmapDetail(rm)}
                    />
                  ))}
                </>
              )}
              {bookmarkedResources.length > 0 && (
                <>
                  <span className="text-xs font-bold text-gray-400 mt-2 block">자료 ({bookmarkedResources.length})</span>
                  {bookmarkedResources.map(res => {
                    const cat = RESOURCE_CATEGORIES.find(c => c.id === res.category);
                    return (
                      <div
                        key={res.id}
                        className="flex items-center gap-3 p-3 rounded-xl"
                        style={{ backgroundColor: `${cat?.color ?? '#6C5CE7'}06`, border: `1px solid ${cat?.color ?? '#6C5CE7'}15` }}
                      >
                        <span className="text-lg">{cat?.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">{res.title}</p>
                          <p className="text-xs text-gray-500">{cat?.label} · {res.authorName}</p>
                        </div>
                        <Bookmark className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#FBBF24' }} fill="#FBBF24" />
                      </div>
                    );
                  })}
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
      <span className="text-4xl">{emoji}</span>
      <div>
        <p className="text-sm font-bold text-white">{title}</p>
        <p className="text-xs text-gray-400 mt-1">{desc}</p>
      </div>
    </div>
  );
}
