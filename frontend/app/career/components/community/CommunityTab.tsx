'use client';

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { School as SchoolIcon, Users } from 'lucide-react';
import type { SharedPlan, CommunityGroup, School, OperatorComment } from './types';
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
import { CareerPathListColumnDashboardHeader } from '../CareerPathListColumnDashboardHeader';
import { useSharedPlansQuery } from '../../hooks/useSharedPlansQuery';
import { useSharedPlanCommunityDetailQuery } from '../../hooks/useSharedPlanCommunityDetailQuery';
import { useSharedPlanReactions } from '../../hooks/useSharedPlanReactions';
import {
  useCareerPathGroupsQuery,
  useCareerPathSchoolsQuery,
  useCreateCareerPathGroupMutation,
} from '../../hooks/useCareerPathCommunityData';
import type { CareerGroupFormSubmitPayload } from '../../config/communityGroupForm';
import {
  COMMUNITY_SUB_TAB_CONTENT_TRANSITION,
  COMMUNITY_SUB_TAB_HIGHLIGHT_SPRING,
  communitySubTabContentVariants,
  getCommunitySubTabSlideDirection,
} from './communitySubTabMotion';

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
  /**
   * true: 그룹 탭은 왼쪽 목록만 두고, 그룹 상세는 부모 2열 레이아웃 오른쪽 슬롯에서 표시
   * (공유 패스 클릭은 부모에서 다이얼로그로 처리)
   */
  groupListSplitMode?: boolean;
  selectedCommunityGroupId?: string | null;
  onSelectCommunityGroup?: (groupId: string | null) => void;
  /** 그룹 ↔ 학교 서브탭 전환 시 부모가 선택 상태를 동기화할 때 사용 */
  onCommunityExplorerSubTabChange?: (sub: 'school' | 'groups') => void;
  /** 부모(예: 오른쪽 패널에서 그룹 탈퇴)가 올리면 참여 그룹 id 목록을 다시 읽음 */
  communityJoinSyncKey?: number;
};

/* ─── Main export ─── */
export function CommunityTab({
  selectedPlanId,
  onSelectPlan,
  groupListSplitMode = false,
  selectedCommunityGroupId = null,
  onSelectCommunityGroup,
  onCommunityExplorerSubTabChange,
  communityJoinSyncKey = 0,
}: CommunityTabProps) {
  const [subTab, setSubTab] = useState<SubTab>('groups');
  /** 탭 전환 시 슬라이드 방향 (1: 그룹→학교, -1: 학교→그룹) */
  const [subTabSlideDirection, setSubTabSlideDirection] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<SharedPlan | null>(null);
  const [hasAccess, setHasAccess] = useState(() => hasCommunityAccess());
  const [joinedSchoolIds, setJoinedSchoolIds] = useState<string[]>(() => loadJoinedSchoolIds());
  const [joinedGroupIds, setJoinedGroupIds] = useState<string[]>(() => loadJoinedGroupIds());

  const refreshJoinedIds = useCallback(() => {
    setJoinedSchoolIds(loadJoinedSchoolIds());
    setJoinedGroupIds(loadJoinedGroupIds());
  }, []);

  useEffect(() => {
    refreshJoinedIds();
  }, [communityJoinSyncKey, refreshJoinedIds]);

  const { data: sharedPlansFromApi } = useSharedPlansQuery();
  const sharedPlans = sharedPlansFromApi;
  const { data: groups = [] } = useCareerPathGroupsQuery();
  const { data: schools = [] } = useCareerPathSchoolsQuery();
  const createGroupMutation = useCreateCareerPathGroupMutation();

  const handleCreateGroup = useCallback(
    async (payload: CareerGroupFormSubmitPayload) => {
      await createGroupMutation.mutateAsync({
        name: payload.name,
        description: payload.description,
        emoji: payload.emoji,
        max_members: payload.maxMembers,
        category: payload.category,
        mode: payload.mode,
        tags: payload.tags,
        is_public: payload.isPublic,
      });
      refreshJoinedIds();
    },
    [createGroupMutation, refreshJoinedIds],
  );

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
      sharedPlans.forEach((p) => {
        counts[p.id] = p.likes;
      });
      return counts;
    });
    setBookmarkCounts(() => {
      const counts: Record<string, number> = {};
      sharedPlans.forEach((p) => {
        counts[p.id] = p.bookmarks;
      });
      return counts;
    });
  }, [sharedPlans]);

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
    // 서버 댓글은 SharedPlanDetailContent mutation에서 처리
  };

  const sharedPlanDialogDetail = useSharedPlanCommunityDetailQuery(
    !isControlled ? selectedPlan?.id ?? null : null,
  );
  const dialogPlanMerged = selectedPlan
    ? sharedPlanDialogDetail.data ?? selectedPlan
    : null;

  const handleCommunitySubTabChange = useCallback(
    (next: SubTab) => {
      if (next === subTab) return;
      setSubTabSlideDirection(getCommunitySubTabSlideDirection(subTab, next));
      setSubTab(next);
      onCommunityExplorerSubTabChange?.(next);
    },
    [onCommunityExplorerSubTabChange, subTab],
  );

  const joinedGroupCount = joinedGroupIds.length;

  return (
    <div className="space-y-4 pb-28">
      <CareerPathListColumnDashboardHeader
        variant="community"
        statPrimaryValue={sharedPlans.length}
        statSecondaryValue={joinedGroupCount}
      />
      {hasAccess && (
        <CommunityAdminPanel onApprove={() => setHasAccess(hasCommunityAccess())} />
      )}
      {/* Sub-tab switcher — 슬라이딩 하이라이트 (layoutId) */}
      <LayoutGroup id="community-sub-tabs">
      <div
        className="flex gap-2 p-1 rounded-xl"
        style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        {SUB_TABS.map((tab) => {
          const isActive = subTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleCommunitySubTabChange(tab.id)}
              className="relative z-10 flex flex-1 items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold"
              style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.4)' }}
            >
              {isActive && (
                <motion.div
                  layoutId="communitySubTabHighlight"
                  className="absolute inset-0 rounded-lg"
                  style={{
                    background: 'linear-gradient(135deg, #6C5CE7, #a855f7)',
                    boxShadow: '0 2px 12px rgba(108,92,231,0.3)',
                  }}
                  transition={COMMUNITY_SUB_TAB_HIGHLIGHT_SPRING}
                />
              )}
              <span className="relative z-10 flex items-center justify-center gap-1.5">
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
      </LayoutGroup>

      {/* Content — 가로 슬라이드 + 페이드 */}
      <div className="relative overflow-x-hidden">
        <AnimatePresence mode="wait" initial={false} custom={subTabSlideDirection}>
          <motion.div
            key={subTab}
            role="tabpanel"
            custom={subTabSlideDirection}
            variants={communitySubTabContentVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={COMMUNITY_SUB_TAB_CONTENT_TRANSITION}
          >
            {subTab === 'school' ? (
              <SchoolSpaceView
                schools={schools as School[]}
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
                groups={groups as CommunityGroup[]}
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
                isCreateGroupPending={createGroupMutation.isPending}
                onCreateGroup={handleCreateGroup}
                listOnlyMode={Boolean(groupListSplitMode && subTab === 'groups')}
                externalSelectedGroupId={selectedCommunityGroupId}
                onSelectGroup={onSelectCommunityGroup}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dialogs — controlled 모드에서는 부모가 패널로 렌더링하므로 Dialog 숨김 */}
      {!isControlled && dialogPlanMerged && (
        <SharedPlanDetailDialog
          plan={dialogPlanMerged}
          isLiked={reactions.likedPlanIds.includes(dialogPlanMerged.id)}
          isBookmarked={reactions.bookmarkedPlanIds.includes(dialogPlanMerged.id)}
          likeCount={likeCounts[dialogPlanMerged.id] ?? dialogPlanMerged.likes}
          bookmarkCount={bookmarkCounts[dialogPlanMerged.id] ?? dialogPlanMerged.bookmarks}
          onToggleLike={() => toggleLike(dialogPlanMerged.id)}
          onToggleBookmark={() => toggleBookmark(dialogPlanMerged.id)}
          onClose={() => setSelectedPlan(null)}
          onAddComment={handleAddComment}
        />
      )}
    </div>
  );
}
