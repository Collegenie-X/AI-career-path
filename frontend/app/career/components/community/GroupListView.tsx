'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Users, Plus, ChevronRight, Crown, MessageSquare,
  X, UserPlus, Clock, Star, MoreVertical,
  LogOut, Copy,
} from 'lucide-react';
import { GRADE_YEARS, LABELS } from '../../config';
import type { CommunityGroup, SharedPlan } from './types';
import { CommunitySpaceDetailLayout } from './CommunitySpaceDetailLayout';
import { JoinRequestDialog } from './JoinRequestDialog';
import { formatTimeAgo, isRecentlyUpdated } from './formatTime';
import { CommunityAccessGate } from './CommunityAccessGate';
import { hasCommunityAccess } from '@/lib/communityAccess';
import { leaveGroup } from '@/lib/careerCommunity';

/* ─── 그룹 카드 ─── */
function GroupCard({
  group,
  sharedPlansInGroup,
  isJoined,
  onOpen,
}: {
  group: CommunityGroup;
  sharedPlansInGroup: SharedPlan[];
  isJoined: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      onClick={onOpen}
      className="group w-full rounded-2xl text-left transition-all duration-200 active:scale-[0.99] hover:brightness-110"
      style={{
        border: `2px solid ${isJoined ? `${group.color}35` : `${group.color}25`}`,
        background: `linear-gradient(135deg, ${group.color}12, rgba(255,255,255,0.04))`,
        boxShadow: `0 4px 16px ${group.color}15, inset 0 1px 0 rgba(255,255,255,0.04)`,
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
            <span className="text-[12px] text-gray-500">{group.memberCount}명</span>
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

/* ─── 더보기 메뉴 ─── */
function GroupMoreMenu({
  group,
  isJoined,
  onLeave,
  onCopyCode,
  onClose,
}: {
  group: CommunityGroup;
  isJoined: boolean;
  onLeave: () => void;
  onCopyCode: () => void;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const menuContent = (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-[430px] rounded-t-3xl"
        style={{ backgroundColor: '#12122a', border: '1px solid rgba(255,255,255,0.1)', paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ backgroundColor: `${group.color}20` }}
            >
              {group.emoji}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">{group.name}</p>
              <p className="text-[12px] text-gray-500 mt-0.5">{group.memberCount}명 참여 중</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-95"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-4 py-3 flex flex-col gap-1">
          <button
            onClick={onCopyCode}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white transition-all active:scale-[0.98]"
            style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
          >
            <Copy className="w-4 h-4 text-gray-400 flex-shrink-0" />
            초대 코드 복사
          </button>

          {isJoined && (
            <button
              onClick={onLeave}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all active:scale-[0.98]"
              style={{ backgroundColor: 'rgba(239,68,68,0.08)', color: '#EF4444' }}
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              그룹 탈퇴하기
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(menuContent, document.body);
}

/* ─── 그룹 상세 뷰 ─── */
function GroupDetailView({
  group,
  sharedPlans,
  isJoined,
  onJoinClick,
  onLeave,
  onBack,
  onViewPlanDetail,
  likedPlanIds,
  bookmarkedPlanIds,
  likeCounts,
  bookmarkCounts,
  checkedPlans,
  onToggleLike,
  onToggleBookmark,
}: {
  group: CommunityGroup;
  sharedPlans: SharedPlan[];
  isJoined: boolean;
  onJoinClick?: () => void;
  onLeave: () => void;
  onBack: () => void;
  onViewPlanDetail: (plan: SharedPlan) => void;
  likedPlanIds: string[];
  bookmarkedPlanIds: string[];
  likeCounts: Record<string, number>;
  bookmarkCounts: Record<string, number>;
  checkedPlans: Record<string, string>;
  onToggleLike: (planId: string) => void;
  onToggleBookmark: (planId: string) => void;
}) {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const inviteCode = group.inviteCode ?? group.id;

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(inviteCode);
    setShowMoreMenu(false);
  };

  return (
    <CommunitySpaceDetailLayout
      backLabel="목록"
      onBack={onBack}
      onMoreClick={() => setShowMoreMenu(true)}
      headerContent={
        <div
          className="rounded-2xl p-5"
          style={{
            background: `linear-gradient(135deg, ${group.color}18, ${group.color}08)`,
            border: `1.5px solid ${group.color}30`,
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
              style={{ backgroundColor: `${group.color}20`, border: `1px solid ${group.color}35` }}
            >
              {group.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">{group.name}</h3>
                {isJoined && (
                  <span
                    className="flex items-center gap-0.5 text-[12px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: 'rgba(34,197,94,0.15)', color: '#22C55E' }}
                  >
                    <Star className="w-2 h-2" />참여 중
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{group.description}</p>
            </div>
          </div>
          {!isJoined && onJoinClick && (
            <button
              onClick={onJoinClick}
              className="w-full flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-bold transition-all active:scale-[0.98]"
              style={{ background: `linear-gradient(135deg, ${group.color}, ${group.color}cc)`, color: '#fff' }}
            >
              <UserPlus className="w-4 h-4" />
              참여하기
            </button>
          )}
        </div>
      }
      middleContent={
        <div className="space-y-2">
          <span className="text-xs font-bold text-gray-400">멤버 ({group.members.length})</span>
          <div className="grid grid-cols-2 gap-2">
            {group.members.map((member) => {
              const gradeInfo = GRADE_YEARS.find((g) => g.id === member.grade);
              const isCreator = member.id === group.creatorId;
              return (
                <div
                  key={member.id}
                  className="flex items-center gap-2.5 p-3 rounded-xl"
                  style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-lg"
                    style={{ backgroundColor: `${group.color}15` }}
                  >
                    {member.emoji}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-white truncate">{member.name}</span>
                      {isCreator && <Crown className="w-3 h-3 flex-shrink-0" style={{ color: '#FBBF24' }} />}
                    </div>
                    <span className="text-[12px] text-gray-500">{gradeInfo?.label ?? member.grade}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      }
      planListLabel={`공유된 패스 (${sharedPlans.length})`}
      planListProps={{
        plans: sharedPlans,
        emptyMessage: '아직 공유된 패스가 없어요',
        likedPlanIds,
        bookmarkedPlanIds,
        likeCounts,
        bookmarkCounts,
        checkedPlans,
        onToggleLike,
        onToggleBookmark,
        onViewDetail: onViewPlanDetail,
      }}
      moreMenuContent={
        showMoreMenu ? (
          <GroupMoreMenu
            group={group}
            isJoined={isJoined}
            onLeave={() => {
              setShowMoreMenu(false);
              onLeave();
            }}
            onCopyCode={handleCopyCode}
            onClose={() => setShowMoreMenu(false)}
          />
        ) : null
      }
    />
  );
}

/* ─── 그룹 만들기 다이얼로그 ─── */
function CreateGroupDialog({ onClose, onCreate }: {
  onClose: () => void;
  onCreate: (name: string, description: string, emoji: string) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('👥');
  const EMOJI_OPTIONS = ['👥', '💻', '🎨', '🔬', '🏥', '⚖️', '🚀', '🎵', '📚', '🌱', '🎮', '🏆'];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-[430px] rounded-t-3xl overflow-y-auto flex flex-col"
        style={{
          backgroundColor: '#12122a',
          border: '1px solid rgba(255,255,255,0.08)',
          maxHeight: 'calc(100vh - 80px)',
          marginBottom: 80,
        }}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h3 className="text-lg font-black text-white">새 그룹 만들기</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="px-5 space-y-4 pb-10">
          <div>
            <label className="text-xs font-bold text-gray-400 mb-2 block">그룹 아이콘</label>
            <div className="flex gap-2 flex-wrap">
              {EMOJI_OPTIONS.map(e => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all"
                  style={emoji === e
                    ? { backgroundColor: 'rgba(108,92,231,0.2)', border: '2px solid #6C5CE7' }
                    : { backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 mb-1.5 block">{String(LABELS.community_group_name_label ?? '그룹 이름')}</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={String(LABELS.community_group_name_placeholder ?? '예: IT 개발자 꿈나무들')}
              className="w-full h-11 px-4 rounded-xl text-sm text-white placeholder-gray-600 outline-none"
              style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 mb-1.5 block">{String(LABELS.community_group_desc_label ?? '설명')}</label>
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={String(LABELS.community_group_desc_placeholder ?? '어떤 그룹인지 간단히 설명해 주세요')}
              className="w-full h-11 px-4 rounded-xl text-sm text-white placeholder-gray-600 outline-none"
              style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>

          <button
            onClick={() => { if (name.trim()) onCreate(name.trim(), description.trim(), emoji); }}
            disabled={!name.trim()}
            className="w-full h-12 rounded-2xl font-bold text-white text-sm transition-all active:scale-[0.98] disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #6C5CE7, #a855f7)' }}
          >
            {String(LABELS.community_group_create_button ?? '그룹 만들기')}
          </button>
        </div>
      </div>
    </div>
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
}: Props) {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [joinTargetGroupId, setJoinTargetGroupId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinByCodeDialog, setShowJoinByCodeDialog] = useState(false);
  const [hasAccess, setHasAccess] = useState(() => hasCommunityAccess());

  const refreshAccess = () => setHasAccess(hasCommunityAccess());

  const selectedGroup = groups.find(g => g.id === selectedGroupId) ?? null;
  const joinTargetGroup = groups.find(g => g.id === joinTargetGroupId) ?? null;

  /* 그룹 카드 클릭: 가입 여부에 따라 분기 */
  const handleGroupCardClick = (group: CommunityGroup) => {
    if (joinedGroupIds.includes(group.id)) {
      setSelectedGroupId(group.id);
    } else {
      setJoinTargetGroupId(group.id);
    }
  };

  const handleJoinSuccess = (groupId: string) => {
    onJoinGroup(groupId);
    onRefreshJoined();
    setJoinTargetGroupId(null);
    setShowJoinByCodeDialog(false);
    setSelectedGroupId(groupId);
  };

  const handleLeave = (groupId: string) => {
    leaveGroup(groupId);
    onLeaveGroup(groupId);
    onRefreshJoined();
    setSelectedGroupId(null);
  };

  /* 상세 뷰 */
  if (selectedGroup) {
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
        <CreateGroupDialog
          onClose={() => setShowCreateDialog(false)}
          onCreate={(_name, _description, _emoji) => {
            setShowCreateDialog(false);
          }}
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
    <div className="fixed inset-0 z-50 flex items-end justify-center">
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
