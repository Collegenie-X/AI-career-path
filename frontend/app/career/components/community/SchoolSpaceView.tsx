'use client';

import { useState, useMemo } from 'react';
import {
  School as SchoolIcon, Users, Filter, Search,
  Heart, TrendingUp, Bookmark, Clock,
} from 'lucide-react';
import { GRADE_YEARS } from '../../config';
import type { SharedPlan, School } from './types';
import communityData from '@/data/share-community.json';
import { SharedPlanCardWithReactions } from './SharedPlanCardWithReactions';
import { formatTimeAgo } from './formatTime';

const GRADE_FILTER_OPTIONS = [
  { id: 'all', label: '전체' },
  ...GRADE_YEARS.map(g => ({ id: g.id, label: g.label })),
];

const SHARE_TYPE_FILTERS = [
  { id: 'all', label: '전체', emoji: '✨' },
  { id: 'public', label: '전체 공유', emoji: '🌐' },
  { id: 'operator', label: '운영자 공유', emoji: '🛡️' },
];

type SortOption = 'recent' | 'updated' | 'likes' | 'bookmarks';

const SORT_OPTION_IDS: { id: SortOption; key: string; icon: typeof Heart }[] = [
  { id: 'recent', key: 'sortRecent', icon: TrendingUp },
  { id: 'updated', key: 'sortUpdated', icon: Clock },
  { id: 'likes', key: 'sortLikes', icon: Heart },
  { id: 'bookmarks', key: 'sortBookmarks', icon: Bookmark },
];

type Props = {
  school: School | null;
  sharedPlans: SharedPlan[];
  likedPlanIds: string[];
  bookmarkedPlanIds: string[];
  likeCounts: Record<string, number>;
  bookmarkCounts: Record<string, number>;
  checkedPlans: Record<string, string>;
  onToggleLike: (planId: string) => void;
  onToggleBookmark: (planId: string) => void;
  onViewPlanDetail: (plan: SharedPlan) => void;
  onJoinSchool: () => void;
};

export function SchoolSpaceView({
  school, sharedPlans,
  likedPlanIds, bookmarkedPlanIds, likeCounts, bookmarkCounts,
  checkedPlans,
  onToggleLike, onToggleBookmark,
  onViewPlanDetail, onJoinSchool,
}: Props) {
  const [gradeFilter, setGradeFilter] = useState('all');
  const [shareTypeFilter, setShareTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  const filteredPlans = useMemo(() => {
    let result = sharedPlans;
    if (gradeFilter !== 'all') {
      result = result.filter(p => p.ownerGrade === gradeFilter);
    }
    if (shareTypeFilter !== 'all') {
      result = result.filter(p => p.shareType === shareTypeFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.ownerName.toLowerCase().includes(q) ||
        p.jobName.toLowerCase().includes(q)
      );
    }
    if (sortBy === 'likes') {
      result = [...result].sort((a, b) => (likeCounts[b.id] ?? b.likes) - (likeCounts[a.id] ?? a.likes));
    } else if (sortBy === 'bookmarks') {
      result = [...result].sort((a, b) => (bookmarkCounts[b.id] ?? b.bookmarks) - (bookmarkCounts[a.id] ?? a.bookmarks));
    } else if (sortBy === 'updated') {
      const getUpdated = (p: SharedPlan) => new Date(p.updatedAt ?? p.sharedAt).getTime();
      result = [...result].sort((a, b) => getUpdated(b) - getUpdated(a));
    } else {
      result = [...result].sort((a, b) => new Date(b.sharedAt).getTime() - new Date(a.sharedAt).getTime());
    }
    return result;
  }, [sharedPlans, gradeFilter, shareTypeFilter, searchQuery, sortBy, likeCounts, bookmarkCounts]);

  if (!school) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
        <div className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #6C5CE722, #6C5CE708)', border: '1px solid #6C5CE733' }}>
          <SchoolIcon className="w-9 h-9" style={{ color: '#6C5CE7' }} />
        </div>
        <div>
          <div className="text-base font-bold text-white">학교 공간에 참여하세요</div>
          <div className="text-sm text-gray-400 mt-1 leading-relaxed">
            선생님이 알려준 학교 코드를 입력하면<br />
            같은 학교 친구들의 커리어 패스를 볼 수 있어요
          </div>
        </div>
        <button
          onClick={onJoinSchool}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #6C5CE7, #a855f7)', boxShadow: '0 4px 20px rgba(108,92,231,0.4)' }}
        >
          <SchoolIcon className="w-4 h-4" />학교 참여하기
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* School header */}
      <div className="rounded-2xl p-4"
        style={{
          background: 'linear-gradient(135deg, rgba(108,92,231,0.15), rgba(168,85,247,0.08))',
          border: '1px solid rgba(108,92,231,0.25)',
        }}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ backgroundColor: 'rgba(108,92,231,0.2)', border: '1px solid rgba(108,92,231,0.3)' }}>
            🏫
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-base font-bold text-white">{school.name}</div>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-[10px] text-gray-400">{school.operatorEmoji} {school.operatorName} 선생님</span>
              <span className="text-[10px] text-gray-600">·</span>
              <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                <Users className="w-2.5 h-2.5" />{school.memberCount}명
              </span>
              {(school.updatedAt ?? school.createdAt) && (
                <>
                  <span className="text-[10px] text-gray-600">·</span>
                  <span className="flex items-center gap-0.5 text-[10px] text-gray-500">
                    <Clock className="w-2.5 h-2.5" />최근 활동 {formatTimeAgo(school.updatedAt ?? school.createdAt)}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="이름, 직업, 패스 검색..."
          className="w-full h-10 pl-9 pr-4 rounded-xl text-sm text-white placeholder-gray-600 outline-none"
          style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
        />
      </div>

      {/* Grade filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
        {GRADE_FILTER_OPTIONS.map(g => (
          <button
            key={g.id}
            onClick={() => setGradeFilter(g.id)}
            className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
            style={gradeFilter === g.id
              ? { backgroundColor: '#6C5CE7', color: '#fff', boxShadow: '0 0 10px #6C5CE755' }
              : { backgroundColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {g.label}
          </button>
        ))}
      </div>

      {/* Share type filter */}
      <div className="flex gap-1.5">
        {SHARE_TYPE_FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setShareTypeFilter(f.id)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
            style={shareTypeFilter === f.id
              ? { backgroundColor: 'rgba(108,92,231,0.2)', color: '#a78bfa', border: '1px solid rgba(108,92,231,0.35)' }
              : { backgroundColor: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            {f.emoji} {f.label}
          </button>
        ))}
      </div>

      {/* Sort + count (좌우 스크롤) */}
      <div className="flex items-center gap-2 overflow-x-auto overflow-y-hidden scrollbar-hide -mx-0.5 pb-0.5">
        <span className="text-xs font-semibold text-gray-400 flex-shrink-0 whitespace-nowrap">
          {String((communityData.meta?.ui as Record<string, string>)?.sharedPlansCountFormat ?? 'N개').replace('N', String(filteredPlans.length))}
        </span>
        <div className="flex gap-1.5 flex-shrink-0">
          {SORT_OPTION_IDS.map(opt => {
            const isActive = sortBy === opt.id;
            const Icon = opt.icon;
            const label = (communityData.meta?.ui as Record<string, string>)?.[opt.key] ?? opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setSortBy(opt.id)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all flex-shrink-0"
                style={isActive
                  ? { backgroundColor: 'rgba(108,92,231,0.15)', color: '#a78bfa', border: '1px solid rgba(108,92,231,0.3)' }
                  : { color: 'rgba(255,255,255,0.3)' }}
              >
                <Icon className="w-2.5 h-2.5" />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Plan list */}
      {filteredPlans.length === 0 ? (
        <div className="py-12 text-center">
          <Filter className="w-8 h-8 text-gray-700 mx-auto mb-3" />
          <p className="text-sm text-gray-500">조건에 맞는 공유 패스가 없어요</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredPlans.map(plan => (
            <SharedPlanCardWithReactions
              key={plan.id}
              plan={plan}
              isLiked={likedPlanIds.includes(plan.id)}
              isBookmarked={bookmarkedPlanIds.includes(plan.id)}
              likeCount={likeCounts[plan.id] ?? plan.likes}
              bookmarkCount={bookmarkCounts[plan.id] ?? plan.bookmarks}
              checkedAt={checkedPlans[plan.id]}
              onToggleLike={() => onToggleLike(plan.id)}
              onToggleBookmark={() => onToggleBookmark(plan.id)}
              onViewDetail={() => onViewPlanDetail(plan)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
