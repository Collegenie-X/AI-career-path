'use client';

import { useState } from 'react';
import {
  Users, Plus, ChevronRight, Crown, MessageSquare,
  Copy, Check, X, UserPlus, Heart, Bookmark,
} from 'lucide-react';
import { GRADE_YEARS } from '../../config';
import type { CommunityGroup, SharedPlan } from './types';
import { SharedPlanCardWithReactions } from './SharedPlanCardWithReactions';

function GroupCard({
  group, sharedPlansInGroup, onOpen,
}: {
  group: CommunityGroup;
  sharedPlansInGroup: SharedPlan[];
  onOpen: () => void;
}) {
  return (
    <button
      onClick={onOpen}
      className="w-full rounded-2xl p-4 text-left transition-all active:scale-[0.99]"
      style={{
        backgroundColor: `${group.color}08`,
        border: `1px solid ${group.color}22`,
      }}
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, ${group.color}28, ${group.color}10)`,
            border: `1px solid ${group.color}30`,
          }}>
          {group.emoji}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-bold text-white">{group.name}</span>
          </div>
          <p className="text-[11px] text-gray-400 line-clamp-1 mb-2">{group.description}</p>

          {/* Members preview */}
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5">
              {group.members.slice(0, 4).map(m => (
                <div key={m.id}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs border-2"
                  style={{ borderColor: '#12122a', backgroundColor: `${group.color}20` }}>
                  {m.emoji}
                </div>
              ))}
              {group.members.length > 4 && (
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold border-2"
                  style={{ borderColor: '#12122a', backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
                  +{group.members.length - 4}
                </div>
              )}
            </div>
            <span className="text-[10px] text-gray-500">{group.memberCount}명</span>
            <span className="text-[10px] text-gray-600">·</span>
            <span className="flex items-center gap-0.5 text-[10px] text-gray-500">
              <MessageSquare className="w-2.5 h-2.5" />{sharedPlansInGroup.length}개 패스
            </span>
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0 mt-3" />
      </div>
    </button>
  );
}

/* ─── Group detail view ─── */
function GroupDetailView({
  group, sharedPlans, onBack, onViewPlanDetail,
  likedPlanIds, bookmarkedPlanIds, likeCounts, bookmarkCounts,
  onToggleLike, onToggleBookmark,
}: {
  group: CommunityGroup;
  sharedPlans: SharedPlan[];
  onBack: () => void;
  onViewPlanDetail: (plan: SharedPlan) => void;
  likedPlanIds: string[];
  bookmarkedPlanIds: string[];
  likeCounts: Record<string, number>;
  bookmarkCounts: Record<string, number>;
  onToggleLike: (planId: string) => void;
  onToggleBookmark: (planId: string) => void;
}) {
  const [inviteCopied, setInviteCopied] = useState(false);

  const handleCopyInvite = () => {
    navigator.clipboard?.writeText(`DreamPath 그룹 초대: ${group.name} (코드: ${group.id})`);
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Back + header */}
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 transition-all active:scale-95">
        <ChevronRight className="w-3.5 h-3.5 rotate-180" />뒤로
      </button>

      {/* Group hero */}
      <div className="rounded-2xl p-5"
        style={{
          background: `linear-gradient(135deg, ${group.color}18, ${group.color}08)`,
          border: `1.5px solid ${group.color}30`,
        }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
            style={{ backgroundColor: `${group.color}20`, border: `1px solid ${group.color}35` }}>
            {group.emoji}
          </div>
          <div>
            <h3 className="text-lg font-black text-white">{group.name}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{group.description}</p>
          </div>
        </div>

        {/* Invite button */}
        <button
          onClick={handleCopyInvite}
          className="w-full flex items-center justify-center gap-2 h-10 rounded-xl text-xs font-bold transition-all active:scale-[0.98]"
          style={{
            backgroundColor: inviteCopied ? 'rgba(34,197,94,0.15)' : `${group.color}20`,
            color: inviteCopied ? '#22C55E' : group.color,
            border: `1px solid ${inviteCopied ? 'rgba(34,197,94,0.3)' : group.color + '40'}`,
          }}
        >
          {inviteCopied ? <><Check className="w-3.5 h-3.5" />초대 링크 복사됨!</> : <><UserPlus className="w-3.5 h-3.5" />친구 초대하기</>}
        </button>
      </div>

      {/* Members */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-400">멤버 ({group.members.length})</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {group.members.map(member => {
            const gradeInfo = GRADE_YEARS.find(g => g.id === member.grade);
            const isCreator = member.id === group.creatorId;
            return (
              <div key={member.id}
                className="flex items-center gap-2.5 p-3 rounded-xl"
                style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg"
                  style={{ backgroundColor: `${group.color}15` }}>
                  {member.emoji}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-white truncate">{member.name}</span>
                    {isCreator && <Crown className="w-3 h-3 flex-shrink-0" style={{ color: '#FBBF24' }} />}
                  </div>
                  <span className="text-[10px] text-gray-500">{gradeInfo?.label ?? member.grade}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Shared plans in group */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-gray-400">공유된 패스 ({sharedPlans.length})</span>
        {sharedPlans.length === 0 ? (
          <div className="py-8 text-center rounded-xl"
            style={{ border: '1px dashed rgba(255,255,255,0.1)' }}>
            <p className="text-xs text-gray-500">아직 공유된 패스가 없어요</p>
          </div>
        ) : (
          sharedPlans.map(plan => (
            <SharedPlanCardWithReactions
              key={plan.id}
              plan={plan}
              isLiked={likedPlanIds.includes(plan.id)}
              isBookmarked={bookmarkedPlanIds.includes(plan.id)}
              likeCount={likeCounts[plan.id] ?? plan.likes}
              bookmarkCount={bookmarkCounts[plan.id] ?? plan.bookmarks}
              onToggleLike={() => onToggleLike(plan.id)}
              onToggleBookmark={() => onToggleBookmark(plan.id)}
              onViewDetail={() => onViewPlanDetail(plan)}
            />
          ))
        )}
      </div>
    </div>
  );
}

/* ─── Create group dialog ─── */
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
        className="relative w-full max-w-[430px] rounded-t-3xl overflow-y-auto animate-slide-up flex flex-col"
        style={{
          backgroundColor: '#12122a',
          border: '1px solid rgba(255,255,255,0.08)',
          maxHeight: 'calc(100vh - 80px)',
          marginBottom: 80,
        }}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h3 className="text-lg font-black text-white">새 그룹 만들기</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="px-5 space-y-4 pb-10">
          {/* Emoji picker */}
          <div>
            <label className="text-xs font-bold text-gray-400 mb-2 block">그룹 아이콘</label>
            <div className="flex gap-2 flex-wrap">
              {EMOJI_OPTIONS.map(e => (
                <button key={e} onClick={() => setEmoji(e)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all"
                  style={emoji === e
                    ? { backgroundColor: 'rgba(108,92,231,0.2)', border: '2px solid #6C5CE7' }
                    : { backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-xs font-bold text-gray-400 mb-1.5 block">그룹 이름</label>
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="예: IT 개발자 꿈나무들"
              className="w-full h-11 px-4 rounded-xl text-sm text-white placeholder-gray-600 outline-none"
              style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-gray-400 mb-1.5 block">설명</label>
            <input value={description} onChange={e => setDescription(e.target.value)}
              placeholder="어떤 그룹인지 간단히 설명해 주세요"
              className="w-full h-11 px-4 rounded-xl text-sm text-white placeholder-gray-600 outline-none"
              style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
          </div>

          <button
            onClick={() => { if (name.trim()) onCreate(name.trim(), description.trim(), emoji); }}
            disabled={!name.trim()}
            className="w-full h-12 rounded-2xl font-bold text-white text-sm transition-all active:scale-[0.98] disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #6C5CE7, #a855f7)' }}>
            그룹 만들기
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main export ─── */
type Props = {
  groups: CommunityGroup[];
  sharedPlans: SharedPlan[];
  likedPlanIds: string[];
  bookmarkedPlanIds: string[];
  likeCounts: Record<string, number>;
  bookmarkCounts: Record<string, number>;
  onToggleLike: (planId: string) => void;
  onToggleBookmark: (planId: string) => void;
  onViewPlanDetail: (plan: SharedPlan) => void;
};

export function GroupListView({
  groups, sharedPlans,
  likedPlanIds, bookmarkedPlanIds, likeCounts, bookmarkCounts,
  onToggleLike, onToggleBookmark,
  onViewPlanDetail,
}: Props) {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const selectedGroup = groups.find(g => g.id === selectedGroupId);

  if (selectedGroup) {
    const groupPlans = sharedPlans.filter(p => p.groupIds.includes(selectedGroup.id));
    return (
      <GroupDetailView
        group={selectedGroup}
        sharedPlans={groupPlans}
        onBack={() => setSelectedGroupId(null)}
        onViewPlanDetail={onViewPlanDetail}
        likedPlanIds={likedPlanIds}
        bookmarkedPlanIds={bookmarkedPlanIds}
        likeCounts={likeCounts}
        bookmarkCounts={bookmarkCounts}
        onToggleLike={onToggleLike}
        onToggleBookmark={onToggleBookmark}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white">내 그룹</h3>
          <p className="text-xs text-gray-500 mt-0.5">친구들과 커리어 패스를 공유하세요</p>
        </div>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, #6C5CE7, #a855f7)', color: '#fff' }}
        >
          <Plus className="w-3.5 h-3.5" />새 그룹
        </button>
      </div>

      {/* Group list */}
      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
          <div className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6C5CE722, #6C5CE708)', border: '1px solid #6C5CE733' }}>
            <Users className="w-7 h-7" style={{ color: '#6C5CE7' }} />
          </div>
          <div>
            <div className="text-sm font-bold text-white">아직 참여한 그룹이 없어요</div>
            <div className="text-xs text-gray-400 mt-1">새 그룹을 만들거나 초대 코드로 참여하세요</div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {groups.map(group => {
            const groupPlans = sharedPlans.filter(p => p.groupIds.includes(group.id));
            return (
              <GroupCard
                key={group.id}
                group={group}
                sharedPlansInGroup={groupPlans}
                onOpen={() => setSelectedGroupId(group.id)}
              />
            );
          })}
        </div>
      )}

      {showCreateDialog && (
        <CreateGroupDialog
          onClose={() => setShowCreateDialog(false)}
          onCreate={(name, description, emoji) => {
            setShowCreateDialog(false);
          }}
        />
      )}
    </div>
  );
}
