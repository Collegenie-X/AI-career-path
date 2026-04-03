'use client';

import { useCallback, useEffect, useState } from 'react';
import { DetailPanelScrollContainer } from '@/components/TwoColumnPanelLayout';
import { hasCommunityAccess } from '@/lib/communityAccess';
import { leaveGroup, loadJoinedGroupIds } from '@/lib/careerCommunity';
import { useSharedPlansQuery } from '../../hooks/useSharedPlansQuery';
import { useCareerPathGroupsQuery } from '../../hooks/useCareerPathCommunityData';
import { useSharedPlanReactions } from '../../hooks/useSharedPlanReactions';
import type { CommunityGroup, SharedPlan } from './types';
import { GroupDetailView } from './GroupDetailPanel';
import { CommunityAccessGate } from './CommunityAccessGate';

const CHECKED_PLANS_STORAGE_KEY = 'community_checked_plans_v1';

type CommunityGroupSplitRightPanelProps = {
  readonly groupId: string;
  readonly onClose: () => void;
  /** 공유 패스 카드 클릭 → 상위에서 다이얼로그로 표시 */
  readonly onViewPlanDetail: (plan: SharedPlan) => void;
  /** 그룹 탈퇴 후 왼쪽 목록 참여 상태 갱신용 */
  readonly onJoinedGroupsChanged?: () => void;
};

/**
 * 커뮤니티 2열 레이아웃 오른쪽: 선택한 그룹의 상세(공유 패스 목록 등).
 * 공유 패스 클릭은 onViewPlanDetail로 넘겨 부모가 SharedPlanDetailDialog를 띄웁니다.
 */
export function CommunityGroupSplitRightPanel({
  groupId,
  onClose,
  onViewPlanDetail,
  onJoinedGroupsChanged,
}: CommunityGroupSplitRightPanelProps) {
  const { data: groups = [] } = useCareerPathGroupsQuery();
  const { data: sharedPlans = [] } = useSharedPlansQuery();
  const { reactions, toggleLike, toggleBookmark } = useSharedPlanReactions();

  const [hasAccess, setHasAccess] = useState(() => hasCommunityAccess());
  const [joinedGroupIds, setJoinedGroupIds] = useState<string[]>(() => loadJoinedGroupIds());
  const [checkedPlans, setCheckedPlans] = useState<Record<string, string>>(() => {
    try {
      const raw = localStorage.getItem(CHECKED_PLANS_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Record<string, string>) : {};
    } catch {
      return {};
    }
  });

  const [likeCounts, setLikeCounts] = useState<Record<string, number>>(() => {
    const counts: Record<string, number> = {};
    sharedPlans.forEach((p) => {
      counts[p.id] = p.likes;
    });
    return counts;
  });
  const [bookmarkCounts, setBookmarkCounts] = useState<Record<string, number>>(() => {
    const counts: Record<string, number> = {};
    sharedPlans.forEach((p) => {
      counts[p.id] = p.bookmarks;
    });
    return counts;
  });

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

  const refreshAccess = useCallback(() => setHasAccess(hasCommunityAccess()), []);

  const group = groups.find((g) => g.id === groupId) as CommunityGroup | undefined;
  const groupPlans = group ? sharedPlans.filter((p) => p.groupIds.includes(group.id)) : [];
  const isJoined = group ? joinedGroupIds.includes(group.id) : false;

  const handleViewPlanDetail = useCallback(
    (plan: SharedPlan) => {
      const checkedAt = new Date().toISOString();
      setCheckedPlans((prev) => {
        const next = { ...prev, [plan.id]: checkedAt };
        localStorage.setItem(CHECKED_PLANS_STORAGE_KEY, JSON.stringify(next));
        return next;
      });
      onViewPlanDetail(plan);
    },
    [onViewPlanDetail],
  );

  if (!group) {
    return null;
  }

  if (!hasAccess) {
    return (
      <CommunityAccessGate
        onAccessGranted={refreshAccess}
        onBack={onClose}
      />
    );
  }

  /* 참여 중인 그룹만 오른쪽 패스 상세 표시 (목록과 동일 규칙) */
  if (!isJoined) {
    return null;
  }

  const handleLeaveGroup = () => {
    leaveGroup(group.id);
    setJoinedGroupIds(loadJoinedGroupIds());
    onJoinedGroupsChanged?.();
    onClose();
  };

  return (
    <DetailPanelScrollContainer scrollKey={groupId}>
      <div className="rounded-none border-0 p-0 md:p-0">
        <GroupDetailView
          group={group}
          sharedPlans={groupPlans}
          isJoined={isJoined}
          onLeave={handleLeaveGroup}
          onBack={onClose}
          onViewPlanDetail={handleViewPlanDetail}
          likedPlanIds={reactions.likedPlanIds}
          bookmarkedPlanIds={reactions.bookmarkedPlanIds}
          likeCounts={likeCounts}
          bookmarkCounts={bookmarkCounts}
          checkedPlans={checkedPlans}
          onToggleLike={toggleLike}
          onToggleBookmark={toggleBookmark}
        />
      </div>
    </DetailPanelScrollContainer>
  );
}
