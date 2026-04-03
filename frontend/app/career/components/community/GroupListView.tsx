'use client';

import { useState } from 'react';
import {
  Users, Plus, ChevronRight, MessageSquare,
  Clock, Star, UserPlus,
} from 'lucide-react';
import { LABELS } from '../../config';
import type { CommunityGroup, SharedPlan } from './types';
import { GroupDetailView } from './GroupDetailPanel';
import { JoinRequestDialog } from './JoinRequestDialog';
import { formatTimeAgo, isRecentlyUpdated } from './formatTime';
import { CommunityAccessGate } from './CommunityAccessGate';
import { CareerCreateGroupDialog } from './CareerCreateGroupDialog';
import type { CareerGroupFormSubmitPayload } from '../../config/communityGroupForm';
import { hasCommunityAccess } from '@/lib/communityAccess';
import { leaveGroup } from '@/lib/careerCommunity';

/* ─── 그룹 카드 ─── */
function GroupCard({
  group,
  sharedPlansInGroup,
  isJoined,
  isSelected,
  onOpen,
}: {
  group: CommunityGroup;
  sharedPlansInGroup: SharedPlan[];
  isJoined: boolean;
  isSelected?: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      onClick={onOpen}
      className="group w-full rounded-2xl text-left transition-all duration-200 active:scale-[0.99] hover:brightness-110"
      style={{
        border: isSelected
          ? `2px solid ${group.color}88`
          : `2px solid ${isJoined ? `${group.color}35` : `${group.color}25`}`,
        background: isSelected
          ? `linear-gradient(135deg, ${group.color}22, rgba(255,255,255,0.06))`
          : `linear-gradient(135deg, ${group.color}12, rgba(255,255,255,0.04))`,
        boxShadow: isSelected
          ? `inset 3px 0 0 0 ${group.color}, 0 4px 16px ${group.color}22`
          : `0 4px 16px ${group.color}15, inset 0 1px 0 rgba(255,255,255,0.04)`,
      }}
    >
      <div className="flex items-center gap-4 px-5 py-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, ${group.color}35, ${group.color}12)`,
            border: `2px solid ${group.color}40`,
            boxShadow: `0 0 20px ${group.color}25`,
          }}
        >
          {group.emoji}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-bold text-white">{group.name}</span>
            {isJoined && (
              <span className="flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: 'rgba(34,197,94,0.15)', color: '#22C55E' }}>
                <Star className="w-2 h-2" />참여 중
              </span>
            )}
          </div>
          <p className="text-[12px] text-gray-400 line-clamp-1 mb-1">{group.description}</p>
          {(group.updatedAt ?? group.createdAt) && (
            <div className="flex items-center gap-1 mb-1">
              <Clock className="w-2.5 h-2.5 text-gray-500" />
              <span className="text-[12px] text-gray-500">{formatTimeAgo(group.updatedAt ?? group.createdAt)}</span>
              {isRecentlyUpdated(group.updatedAt ?? group.createdAt) && (
                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(34,197,94,0.15)', color: '#22C55E' }}>NEW</span>
              )}
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5">
              {group.members.slice(0, 4).map(m => (
                <div key={m.id} className="w-6 h-6 rounded-full flex items-center justify-center text-xs border-2" style={{ borderColor: '#12122a', backgroundColor: `${group.color}20` }}>
                  {m.emoji}
                </div>
              ))}
              {group.members.length > 4 && (
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold border-2" style={{ borderColor: '#12122a', backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
                  +{group.members.length - 4}
                </div>
              )}
            </div>
            <span className="text-[12px] text-gray-500">
              {group.memberCount}
              {group.maxMembers != null ? ` / ${group.maxMembers}` : ''}명
            </span>
            <span className="text-[12px] text-gray-600">·</span>
            <span className="flex items-center gap-0.5 text-[12px] text-gray-500"><MessageSquare className="w-2.5 h-2.5" />{sharedPlansInGroup.length}개 패스</span>
          </div>
        </div>

        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 active:scale-95 group-hover:scale-110"
          style={{
            background: `linear-gradient(135deg, ${group.color}60, ${group.color}35)`,
            border: `2px solid ${group.color}70`,
            boxShadow: `0 0 20px ${group.color}40, inset 0 1px 0 rgba(255,255,255,0.2)`,
          }}
        >
          <ChevronRight className="w-5 h-5 text-white drop-shadow-md" strokeWidth={2.5} />
        </div>
      </div>
    </button>
  );
}


/* ─── 메인 export ─── */
type Props = {
  groups: CommunityGroup[];
  joinedGroupIds: string[];
  sharedPlans: SharedPlan[];
  likedPlanIds: string[];
  bookmarkedPlanIds: string[];
  likeCounts: Record<string, number>;
  bookmarkCounts: Record<string, number>;
  checkedPlans: Record<string, string>;
  onToggleLike: (planId: string) => void;
  onToggleBookmark: (planId: string) => void;
  onViewPlanDetail: (plan: SharedPlan) => void;
  onJoinGroup: (groupId: string) => void;
  onLeaveGroup: (groupId: string) => void;
  onRefreshJoined: () => void;
  /** 그룹 생성 API — 성공 시 목록이 갱신되도록 부모에서 연결 */
  onCreateGroup?: (payload: CareerGroupFormSubmitPayload) => Promise<void>;
  isCreateGroupPending?: boolean;
  /**
   * true: 왼쪽은 그룹 목록만 표시하고, 상세는 부모 2열 레이아웃 오른쪽 슬롯에서 렌더링 (커리어 패스 커뮤니티 3단계 UX)
   */
  listOnlyMode?: boolean;
  /** listOnlyMode일 때 선택된 그룹(부모 controlled) */
  externalSelectedGroupId?: string | null;
  /** listOnlyMode일 때 그룹 선택/해제 */
  onSelectGroup?: (groupId: string | null) => void;
};

export function GroupListView({
  groups,
  joinedGroupIds,
  sharedPlans,
  likedPlanIds,
  bookmarkedPlanIds,
  likeCounts,
  bookmarkCounts,
  checkedPlans,
  onToggleLike,
  onToggleBookmark,
  onViewPlanDetail,
  onJoinGroup,
  onLeaveGroup,
  onRefreshJoined,
  onCreateGroup,
  isCreateGroupPending = false,
  listOnlyMode = false,
  externalSelectedGroupId = null,
  onSelectGroup,
}: Props) {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [joinTargetGroupId, setJoinTargetGroupId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createGroupError, setCreateGroupError] = useState<string | null>(null);
  const [showJoinByCodeDialog, setShowJoinByCodeDialog] = useState(false);
  const [hasAccess, setHasAccess] = useState(() => hasCommunityAccess());

  const refreshAccess = () => setHasAccess(hasCommunityAccess());

  const selectedGroup = groups.find(g => g.id === selectedGroupId) ?? null;
  const joinTargetGroup = groups.find(g => g.id === joinTargetGroupId) ?? null;

  /* 그룹 카드 클릭: 가입 여부에 따라 분기 */
  const handleGroupCardClick = (group: CommunityGroup) => {
    if (joinedGroupIds.includes(group.id)) {
      if (listOnlyMode) {
        onSelectGroup?.(group.id);
      } else {
        setSelectedGroupId(group.id);
      }
    } else {
      setJoinTargetGroupId(group.id);
    }
  };

  const handleJoinSuccess = (groupId: string) => {
    onJoinGroup(groupId);
    onRefreshJoined();
    setJoinTargetGroupId(null);
    setShowJoinByCodeDialog(false);
    if (listOnlyMode) {
      onSelectGroup?.(groupId);
    } else {
      setSelectedGroupId(groupId);
    }
  };

  const handleLeave = (groupId: string) => {
    leaveGroup(groupId);
    onLeaveGroup(groupId);
    onRefreshJoined();
    if (listOnlyMode) {
      onSelectGroup?.(null);
    } else {
      setSelectedGroupId(null);
    }
  };

  /* 상세 뷰 — listOnlyMode면 부모 오른쪽 패널에서 표시 */
  if (!listOnlyMode && selectedGroup) {
    if (!hasAccess) {
      return (
        <CommunityAccessGate
          onAccessGranted={refreshAccess}
          onBack={() => setSelectedGroupId(null)}
        />
      );
    }
    const groupPlans = sharedPlans.filter(p => p.groupIds.includes(selectedGroup.id));
    const isJoined = joinedGroupIds.includes(selectedGroup.id);
    return (
      <>
        <GroupDetailView
          group={selectedGroup}
          sharedPlans={groupPlans}
          isJoined={isJoined}
          onJoinClick={!isJoined ? () => setJoinTargetGroupId(selectedGroup.id) : undefined}
          onLeave={() => handleLeave(selectedGroup.id)}
          onBack={() => setSelectedGroupId(null)}
          onViewPlanDetail={onViewPlanDetail}
          likedPlanIds={likedPlanIds}
          bookmarkedPlanIds={bookmarkedPlanIds}
          likeCounts={likeCounts}
          bookmarkCounts={bookmarkCounts}
          checkedPlans={checkedPlans}
          onToggleLike={onToggleLike}
          onToggleBookmark={onToggleBookmark}
        />
        {joinTargetGroup && (
          <JoinRequestDialog
            target="group"
            targetName={joinTargetGroup.name}
            validCode={joinTargetGroup.inviteCode ?? joinTargetGroup.id}
            onClose={() => setJoinTargetGroupId(null)}
            onJoin={() => handleJoinSuccess(joinTargetGroup.id)}
          />
        )}
      </>
    );
  }

  /* 목록 뷰 */
  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white">{String(LABELS.community_groups_tab ?? '그룹')}</h3>
          <p className="text-xs text-gray-500 mt-0.5">친구들과 커리어 패스를 공유하세요</p>
        </div>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, #6C5CE7, #a855f7)', color: '#fff' }}
        >
          <Plus className="w-3.5 h-3.5" />{String(LABELS.community_group_create_short ?? '새 그룹')}
        </button>
      </div>

      {/* 그룹 목록 */}
      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6C5CE722, #6C5CE708)', border: '1px solid #6C5CE733' }}
          >
            <Users className="w-7 h-7" style={{ color: '#6C5CE7' }} />
          </div>
          <div>
            <div className="text-sm font-bold text-white">{String(LABELS.community_group_empty ?? '아직 참여한 그룹이 없어요')}</div>
            <div className="text-xs text-gray-400 mt-1">{String(LABELS.community_group_empty_desc ?? '새 그룹을 만들거나 초대 코드로 참여하세요')}</div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map(group => {
            const groupPlans = sharedPlans.filter(p => p.groupIds.includes(group.id));
            return (
              <GroupCard
                key={group.id}
                group={group}
                sharedPlansInGroup={groupPlans}
                isJoined={joinedGroupIds.includes(group.id)}
                isSelected={
                  listOnlyMode
                    ? externalSelectedGroupId === group.id
                    : selectedGroupId === group.id
                }
                onOpen={() => handleGroupCardClick(group)}
              />
            );
          })}
        </div>
      )}

      {/* 코드로 참여하기 */}
      <button
        onClick={() => setShowJoinByCodeDialog(true)}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all active:scale-[0.98]"
        style={{
          backgroundColor: 'rgba(255,255,255,0.04)',
          color: 'rgba(255,255,255,0.5)',
          border: '1px dashed rgba(255,255,255,0.12)',
        }}
      >
        <UserPlus className="w-3.5 h-3.5" />
        {String(LABELS.community_group_join_by_code ?? '그룹 코드로 참여하기')}
      </button>

      {/* 미가입 그룹 클릭 → JoinRequestDialog */}
      {joinTargetGroup && (
        <JoinRequestDialog
          target="group"
          targetName={joinTargetGroup.name}
          validCode={joinTargetGroup.inviteCode ?? joinTargetGroup.id}
          onClose={() => setJoinTargetGroupId(null)}
          onJoin={() => handleJoinSuccess(joinTargetGroup.id)}
        />
      )}

      {/* 코드 직접 입력 다이얼로그 */}
      {showJoinByCodeDialog && (
        <JoinGroupByCodeDialog
          groups={groups}
          onClose={() => setShowJoinByCodeDialog(false)}
          onJoinSuccess={(group) => handleJoinSuccess(group.id)}
        />
      )}

      {showCreateDialog && (
        <CareerCreateGroupDialog
          onClose={() => {
            if (isCreateGroupPending) return;
            setShowCreateDialog(false);
            setCreateGroupError(null);
          }}
          onSubmit={async (payload) => {
            if (!onCreateGroup) {
              setShowCreateDialog(false);
              return;
            }
            setCreateGroupError(null);
            try {
              await onCreateGroup(payload);
              setShowCreateDialog(false);
            } catch (err) {
              const raw = err instanceof Error ? err.message : '';
              const needLogin = raw.includes(':401') || raw.includes('401');
              setCreateGroupError(
                needLogin
                  ? String(LABELS.community_group_create_need_login ?? '로그인이 필요합니다.')
                  : String(LABELS.community_group_create_error ?? '그룹을 만들 수 없습니다.'),
              );
            }
          }}
          isSubmitting={isCreateGroupPending}
          errorMessage={createGroupError}
        />
      )}
    </div>
  );
}

/* ─── 코드로 그룹 찾기 다이얼로그 ─── */
function JoinGroupByCodeDialog({
  groups,
  onClose,
  onJoinSuccess,
}: {
  groups: CommunityGroup[];
  onClose: () => void;
  onJoinSuccess: (group: CommunityGroup) => void;
}) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    setError(null);
    const entered = code.trim().toUpperCase();
    if (!entered) { setError('코드를 입력해주세요'); return; }
    const group = groups.find(g => (g.inviteCode ?? g.id).toUpperCase() === entered);
    if (group) {
      onJoinSuccess(group);
    } else {
      setError('유효하지 않은 코드예요');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-[430px] rounded-t-3xl p-5"
        style={{ backgroundColor: '#12122a', border: '1px solid rgba(255,255,255,0.1)' }}
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-base font-black text-white mb-1">{String(LABELS.community_group_join_dialog_title ?? '그룹 코드로 참여')}</h3>
        <p className="text-xs text-gray-400 mb-4">{String(LABELS.community_group_join_dialog_desc ?? '친구에게 받은 그룹 초대 코드를 입력하세요.')}</p>
        <div className="flex gap-2">
          <input
            value={code}
            onChange={e => { setCode(e.target.value); setError(null); }}
            placeholder="예: GRP-IT-001"
            className="flex-1 h-12 px-4 rounded-xl text-sm text-white placeholder-gray-600 outline-none tracking-widest font-mono"
            style={{
              backgroundColor: 'rgba(255,255,255,0.06)',
              border: error ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.12)',
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={!code.trim()}
            className="px-5 h-12 rounded-xl text-sm font-bold disabled:opacity-40 transition-all active:scale-[0.97]"
            style={{ background: 'linear-gradient(135deg, #6C5CE7, #a855f7)', color: '#fff' }}
          >
            참여
          </button>
        </div>
        {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
      </div>
    </div>
  );
}
