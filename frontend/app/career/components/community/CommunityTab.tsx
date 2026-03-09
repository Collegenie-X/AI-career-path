'use client';

import { useState, useEffect, useCallback } from 'react';
import { School as SchoolIcon, Users, Plus } from 'lucide-react';
import communityData from '@/data/share-community.json';
import type { SharedPlan, CommunityGroup, School, OperatorComment, UserReactionState } from './types';
import { SchoolSpaceView } from './SchoolSpaceView';
import { GroupListView } from './GroupListView';
import { SharedPlanDetailDialog } from './SharedPlanDetailDialog';
import { CommunityAdminPanel } from './CommunityAdminPanel';
import { hasCommunityAccess } from '@/lib/communityAccess';
import {
  loadJoinedSchoolIds,
  loadJoinedGroupIds,
  joinSchool,
  joinGroup,
  leaveGroup,
  leaveSchool,
} from '@/lib/careerCommunity';

type SubTab = 'school' | 'groups';

const SUB_TABS: { id: SubTab; label: string; icon: typeof SchoolIcon }[] = [
  { id: 'school', label: '학교 공간', icon: SchoolIcon },
  { id: 'groups', label: '그룹',     icon: Users },
];

const REACTIONS_STORAGE_KEY = 'community_reactions_v1';
const CHECKED_PLANS_STORAGE_KEY = 'community_checked_plans_v1';

/* ─── Main export ─── */
export function CommunityTab({ onNewPlan }: { onNewPlan: () => void }) {
  const [subTab, setSubTab] = useState<SubTab>('school');
  const [selectedPlan, setSelectedPlan] = useState<SharedPlan | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [joinedSchoolIds, setJoinedSchoolIds] = useState<string[]>(() => loadJoinedSchoolIds());
  const [joinedGroupIds, setJoinedGroupIds] = useState<string[]>(() => loadJoinedGroupIds());

  useEffect(() => {
    setHasAccess(hasCommunityAccess());
  }, []);

  const refreshJoinedIds = useCallback(() => {
    setJoinedSchoolIds(loadJoinedSchoolIds());
    setJoinedGroupIds(loadJoinedGroupIds());
  }, []);

  const sharedPlans = communityData.sharedPlans as SharedPlan[];
  const groups = communityData.groups as CommunityGroup[];

  /* ─── Reactions state ─── */
  const [reactions, setReactions] = useState<UserReactionState>({
    likedPlanIds: [],
    bookmarkedPlanIds: [],
  });

  /* likeCounts / bookmarkCounts: base value from JSON, adjusted by saved reactions */
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>(() => {
    const counts: Record<string, number> = {};
    sharedPlans.forEach(p => { counts[p.id] = p.likes; });
    return counts;
  });
  const [bookmarkCounts, setBookmarkCounts] = useState<Record<string, number>>(() => {
    const counts: Record<string, number> = {};
    sharedPlans.forEach(p => { counts[p.id] = p.bookmarks; });
    return counts;
  });

  /* 확인 필요 뱃지: 조회 시 사라짐 (localStorage) */
  const [checkedPlans, setCheckedPlans] = useState<Record<string, string>>(() => {
    try {
      const raw = localStorage.getItem(CHECKED_PLANS_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Record<string, string>) : {};
    } catch {
      return {};
    }
  });

  /* 상세 조회 시 해당 패스를 '확인함'으로 기록 */
  const handleViewPlanDetail = useCallback((plan: SharedPlan | null) => {
    setSelectedPlan(plan);
    if (plan) {
      const checkedAt = new Date().toISOString();
      setCheckedPlans(prev => {
        const next = { ...prev, [plan.id]: checkedAt };
        localStorage.setItem(CHECKED_PLANS_STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    }
  }, []);

  /* Load persisted reactions + checked plans once on mount */
  useEffect(() => {
    try {
      const rawChecked = localStorage.getItem(CHECKED_PLANS_STORAGE_KEY);
      if (rawChecked) {
        setCheckedPlans(JSON.parse(rawChecked) as Record<string, string>);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(REACTIONS_STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as UserReactionState;
      setReactions(saved);

      /* Adjust counts: base + 1 if user has reacted */
      setLikeCounts(() => {
        const counts: Record<string, number> = {};
        sharedPlans.forEach(p => {
          counts[p.id] = p.likes + (saved.likedPlanIds.includes(p.id) ? 1 : 0);
        });
        return counts;
      });
      setBookmarkCounts(() => {
        const counts: Record<string, number> = {};
        sharedPlans.forEach(p => {
          counts[p.id] = p.bookmarks + (saved.bookmarkedPlanIds.includes(p.id) ? 1 : 0);
        });
        return counts;
      });
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Toggle like — uses functional updater to avoid stale closure */
  const handleToggleLike = useCallback((planId: string) => {
    setReactions(prev => {
      const wasLiked = prev.likedPlanIds.includes(planId);
      const updated: UserReactionState = {
        ...prev,
        likedPlanIds: wasLiked
          ? prev.likedPlanIds.filter(id => id !== planId)
          : [...prev.likedPlanIds, planId],
      };
      localStorage.setItem(REACTIONS_STORAGE_KEY, JSON.stringify(updated));

      /* Sync count immediately */
      const base = (communityData.sharedPlans as SharedPlan[]).find(p => p.id === planId)?.likes ?? 0;
      setLikeCounts(prevCounts => ({ ...prevCounts, [planId]: base + (wasLiked ? 0 : 1) }));

      return updated;
    });
  }, []);

  /* Toggle bookmark — same pattern */
  const handleToggleBookmark = useCallback((planId: string) => {
    setReactions(prev => {
      const wasBookmarked = prev.bookmarkedPlanIds.includes(planId);
      const updated: UserReactionState = {
        ...prev,
        bookmarkedPlanIds: wasBookmarked
          ? prev.bookmarkedPlanIds.filter(id => id !== planId)
          : [...prev.bookmarkedPlanIds, planId],
      };
      localStorage.setItem(REACTIONS_STORAGE_KEY, JSON.stringify(updated));

      const base = (communityData.sharedPlans as SharedPlan[]).find(p => p.id === planId)?.bookmarks ?? 0;
      setBookmarkCounts(prevCounts => ({ ...prevCounts, [planId]: base + (wasBookmarked ? 0 : 1) }));

      return updated;
    });
  }, []);

  const handleJoinSchool = useCallback((schoolId: string) => {
    joinSchool(schoolId);
    refreshJoinedIds();
  }, [refreshJoinedIds]);

  const handleLeaveSchool = useCallback((schoolId: string) => {
    leaveSchool(schoolId);
    refreshJoinedIds();
  }, [refreshJoinedIds]);

  const handleJoinGroup = useCallback((groupId: string) => {
    joinGroup(groupId);
    refreshJoinedIds();
  }, [refreshJoinedIds]);

  const handleLeaveGroup = useCallback((groupId: string) => {
    leaveGroup(groupId);
    refreshJoinedIds();
  }, [refreshJoinedIds]);

  const handleAddComment = (_planId: string, _comment: OperatorComment) => {
    // 추후 백엔드 연동 시 API 호출
  };

  return (
    <div className="space-y-4 pb-28">
      {hasAccess && (
        <CommunityAdminPanel onApprove={() => setHasAccess(hasCommunityAccess())} />
      )}
      {/* Sub-tab switcher */}
      <div
        className="flex gap-2 p-1 rounded-xl"
        style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        {SUB_TABS.map(tab => {
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
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {subTab === 'school' ? (
        <SchoolSpaceView
          joinedSchoolIds={joinedSchoolIds}
          sharedPlans={sharedPlans}
          likedPlanIds={reactions.likedPlanIds}
          bookmarkedPlanIds={reactions.bookmarkedPlanIds}
          likeCounts={likeCounts}
          bookmarkCounts={bookmarkCounts}
          checkedPlans={checkedPlans}
          onToggleLike={handleToggleLike}
          onToggleBookmark={handleToggleBookmark}
          onViewPlanDetail={handleViewPlanDetail}
          onJoinSchool={handleJoinSchool}
          onLeaveSchool={handleLeaveSchool}
          onRefreshJoined={refreshJoinedIds}
        />
      ) : (
        <GroupListView
          groups={groups}
          joinedGroupIds={joinedGroupIds}
          sharedPlans={sharedPlans}
          likedPlanIds={reactions.likedPlanIds}
          bookmarkedPlanIds={reactions.bookmarkedPlanIds}
          likeCounts={likeCounts}
          bookmarkCounts={bookmarkCounts}
          checkedPlans={checkedPlans}
          onToggleLike={handleToggleLike}
          onToggleBookmark={handleToggleBookmark}
          onViewPlanDetail={handleViewPlanDetail}
          onJoinGroup={handleJoinGroup}
          onLeaveGroup={handleLeaveGroup}
          onRefreshJoined={refreshJoinedIds}
        />
      )}

      {/* 커리어 패스 만들기 fixed button */}
      <div className="fixed bottom-20 left-0 right-0 z-30 px-5 max-w-[430px] mx-auto">
        <button
          onClick={onNewPlan}
          className="w-full h-14 rounded-2xl font-black text-base text-white flex items-center justify-center gap-2.5 transition-all active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, #6C5CE7, #a855f7)',
            boxShadow: '0 8px 28px rgba(108,92,231,0.55)',
          }}
        >
          <Plus className="w-5 h-5" />
          커리어 패스 만들기
        </button>
      </div>

      {/* Dialogs */}
      {selectedPlan && (
        <SharedPlanDetailDialog
          plan={selectedPlan}
          isLiked={reactions.likedPlanIds.includes(selectedPlan.id)}
          isBookmarked={reactions.bookmarkedPlanIds.includes(selectedPlan.id)}
          likeCount={likeCounts[selectedPlan.id] ?? selectedPlan.likes}
          bookmarkCount={bookmarkCounts[selectedPlan.id] ?? selectedPlan.bookmarks}
          onToggleLike={() => handleToggleLike(selectedPlan.id)}
          onToggleBookmark={() => handleToggleBookmark(selectedPlan.id)}
          onClose={() => setSelectedPlan(null)}
          onAddComment={handleAddComment}
        />
      )}
    </div>
  );
}
