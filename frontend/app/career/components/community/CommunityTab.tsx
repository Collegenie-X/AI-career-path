'use client';

import { useState, useEffect, useCallback } from 'react';
import { School as SchoolIcon, Users } from 'lucide-react';
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
import { LABELS } from '../../config';
import { useSharedPlansQuery } from '../../hooks/useSharedPlansQuery';
import { useSharedPlanReactions } from '../../hooks/useSharedPlanReactions';

type SubTab = 'school' | 'groups';

/** 그룹 | 학교 공간 — 순서: 그룹 먼저, 학교 공간 나중 (위치 스왑 유지) */
const SUB_TABS: { id: SubTab; label: string; icon: typeof SchoolIcon }[] = [
  { id: 'groups', label: String(LABELS.community_groups_tab ?? '그룹'), icon: Users },
  { id: 'school', label: String(LABELS.community_school_tab ?? '학교 공간'), icon: SchoolIcon },
];

const REACTIONS_STORAGE_KEY = 'community_reactions_v1';
const CHECKED_PLANS_STORAGE_KEY = 'community_checked_plans_v1';

type CommunityTabProps = {
  /** 현재 선택된 플랜 ID (controlled — 부모에서 관리) */
  selectedPlanId?: string | null;
  /** 플랜 선택 콜백 (controlled — 부모에서 관리) */
  onSelectPlan?: (plan: SharedPlan | null) => void;
};

/* ─── Main export ─── */
export function CommunityTab({ selectedPlanId, onSelectPlan }: CommunityTabProps) {
  const [subTab, setSubTab] = useState<SubTab>('groups');
  const [selectedPlan, setSelectedPlan] = useState<SharedPlan | null>(null);
  const [hasAccess, setHasAccess] = useState(() => hasCommunityAccess());
  const [joinedSchoolIds, setJoinedSchoolIds] = useState<string[]>(() => loadJoinedSchoolIds());
  const [joinedGroupIds, setJoinedGroupIds] = useState<string[]>(() => loadJoinedGroupIds());

  const refreshJoinedIds = useCallback(() => {
    setJoinedSchoolIds(loadJoinedSchoolIds());
    setJoinedGroupIds(loadJoinedGroupIds());
  }, []);

  const { data: sharedPlansFromApi } = useSharedPlansQuery();
  const sharedPlans = sharedPlansFromApi.length > 0 ? sharedPlansFromApi : (communityData.sharedPlans as SharedPlan[]);
  const groups = communityData.groups as CommunityGroup[];

  const { reactions, toggleLike, toggleBookmark } = useSharedPlanReactions();

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

  const isControlled = onSelectPlan !== undefined;

  /* 상세 조회 시 해당 패스를 '확인함'으로 기록 */
  const handleViewPlanDetail = useCallback((plan: SharedPlan | null) => {
    if (isControlled) {
      onSelectPlan?.(plan);
    } else {
      setSelectedPlan(plan);
    }
    if (plan) {
      const checkedAt = new Date().toISOString();
      setCheckedPlans(prev => {
        const next = { ...prev, [plan.id]: checkedAt };
        localStorage.setItem(CHECKED_PLANS_STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isControlled, onSelectPlan]);

  /* Load persisted checked plans once on mount */
  useEffect(() => {
    try {
      const rawChecked = localStorage.getItem(CHECKED_PLANS_STORAGE_KEY);
      if (rawChecked) {
        setCheckedPlans(JSON.parse(rawChecked) as Record<string, string>);
      }
    } catch {}
  }, []);

  useEffect(() => {
    setLikeCounts(() => {
      const counts: Record<string, number> = {};
      sharedPlans.forEach(p => {
        counts[p.id] = p.likes + (reactions.likedPlanIds.includes(p.id) ? 1 : 0);
      });
      return counts;
    });
    setBookmarkCounts(() => {
      const counts: Record<string, number> = {};
      sharedPlans.forEach(p => {
        counts[p.id] = p.bookmarks + (reactions.bookmarkedPlanIds.includes(p.id) ? 1 : 0);
      });
      return counts;
    });
  }, [sharedPlans, reactions]);

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
          onToggleLike={toggleLike}
          onToggleBookmark={toggleBookmark}
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
          onToggleLike={toggleLike}
          onToggleBookmark={toggleBookmark}
          onViewPlanDetail={handleViewPlanDetail}
          onJoinGroup={handleJoinGroup}
          onLeaveGroup={handleLeaveGroup}
          onRefreshJoined={refreshJoinedIds}
        />
      )}

      {/* Dialogs — controlled 모드에서는 부모가 패널로 렌더링하므로 Dialog 숨김 */}
      {!isControlled && selectedPlan && (
        <SharedPlanDetailDialog
          plan={selectedPlan}
          isLiked={reactions.likedPlanIds.includes(selectedPlan.id)}
          isBookmarked={reactions.bookmarkedPlanIds.includes(selectedPlan.id)}
          likeCount={likeCounts[selectedPlan.id] ?? selectedPlan.likes}
          bookmarkCount={bookmarkCounts[selectedPlan.id] ?? selectedPlan.bookmarks}
          onToggleLike={() => toggleLike(selectedPlan.id)}
          onToggleBookmark={() => toggleBookmark(selectedPlan.id)}
          onClose={() => setSelectedPlan(null)}
          onAddComment={handleAddComment}
        />
      )}
    </div>
  );
}
