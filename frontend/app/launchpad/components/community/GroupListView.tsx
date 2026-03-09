'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Users, Plus, Search, ChevronRight, Video, School, Shuffle, MessageCircle,
  MoreVertical, LogOut, Copy, X,
} from 'lucide-react';
import { LAUNCHPAD_LABELS, GROUP_CATEGORIES, COMMUNITY_RESTRICTED } from '../../config';
import type { LaunchpadSession, LaunchpadGroup } from '../../types';
import { CreateGroupDialog } from './CreateGroupDialog';
import { CommunityAccessGate } from './CommunityAccessGate';
import { JoinRequestDialog } from '@/components/community/JoinRequestDialog';
import {
  loadJoinedGroupIds,
  joinGroup,
  leaveGroup,
} from '@/lib/launchpadCommunity';

const STORAGE_KEY_ACCESS = 'launchpad_community_access';

function hasCommunityAccess(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY_ACCESS) === 'true';
  } catch {
    return false;
  }
}

import communityData from '@/data/launchpad-community.json';

const STORAGE_KEY_CUSTOM_GROUPS = 'launchpad_custom_groups';

function loadCustomGroups(): LaunchpadGroup[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_GROUPS);
    return raw ? JSON.parse(raw) : [];
  } catch {}
  return [];
}

function saveCustomGroups(groups: LaunchpadGroup[]) {
  localStorage.setItem(STORAGE_KEY_CUSTOM_GROUPS, JSON.stringify(groups));
}

const MODE_ICONS = {
  online: Video,
  offline: School,
  hybrid: Shuffle,
} as const;

const MODE_LABELS_SHORT = {
  online: '온라인',
  offline: '오프라인',
  hybrid: '온·오프',
} as const;

/* ─── 그룹 더보기 메뉴 ─── */
function GroupMoreMenu({
  group,
  isJoined,
  onLeave,
  onCopyCode,
  onClose,
}: {
  group: LaunchpadGroup;
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
              style={{ background: `linear-gradient(135deg, ${group.color}30, ${group.color}15)` }}
            >
              {group.emoji}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">{group.name}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{group.memberCount}명 참여 중</p>
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

type Props = {
  sessions: LaunchpadSession[];
  onDetailSession: (session: LaunchpadSession) => void;
  onCreateSession: (groupId?: string) => void;
};

export function GroupListView({ sessions, onDetailSession, onCreateSession }: Props) {
  const [seedGroups] = useState<LaunchpadGroup[]>(communityData.groups as LaunchpadGroup[]);
  const [customGroups, setCustomGroups] = useState<LaunchpadGroup[]>([]);
  const [joinedGroupIds, setJoinedGroupIds] = useState<string[]>(() => loadJoinedGroupIds());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [joinTargetGroupId, setJoinTargetGroupId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinByCodeDialog, setShowJoinByCodeDialog] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [accessKey, setAccessKey] = useState(0);

  useEffect(() => {
    setJoinedGroupIds(loadJoinedGroupIds());
    setCustomGroups(loadCustomGroups());
  }, []);

  const allGroups = [...seedGroups, ...customGroups];

  const handleCreateGroup = (group: LaunchpadGroup) => {
    const updated = [...customGroups, group];
    setCustomGroups(updated);
    saveCustomGroups(updated);
    joinGroup(group.id);
    setJoinedGroupIds(loadJoinedGroupIds());
    setShowCreateDialog(false);
  };

  const handleGroupCardClick = (group: LaunchpadGroup) => {
    if (joinedGroupIds.includes(group.id)) {
      setSelectedGroupId(group.id);
    } else {
      setJoinTargetGroupId(group.id);
    }
  };

  const handleJoinSuccess = (groupId: string) => {
    joinGroup(groupId);
    setJoinedGroupIds(loadJoinedGroupIds());
    setJoinTargetGroupId(null);
    setShowJoinByCodeDialog(false);
    setSelectedGroupId(groupId);
  };

  const handleLeave = (groupId: string) => {
    leaveGroup(groupId);
    setJoinedGroupIds(loadJoinedGroupIds());
    setSelectedGroupId(null);
    setShowMoreMenu(false);
  };

  const filteredGroups = allGroups.filter(group =>
    !searchQuery ||
    group.name.includes(searchQuery) ||
    group.description.includes(searchQuery) ||
    group.tags.some(t => t.includes(searchQuery))
  );

  const selectedGroup = selectedGroupId ? allGroups.find(g => g.id === selectedGroupId) : null;
  const joinTargetGroup = joinTargetGroupId ? allGroups.find(g => g.id === joinTargetGroupId) : null;
  const groupSessions = selectedGroup
    ? sessions.filter(s => s.groupId === selectedGroup.id || selectedGroup.sessionIds.includes(s.id))
    : [];

  if (selectedGroup) {
    const hasAccess = hasCommunityAccess();
    if (COMMUNITY_RESTRICTED && !hasAccess) {
      return (
        <CommunityAccessGate
          onAccessGranted={() => setAccessKey(k => k + 1)}
          onBack={() => setSelectedGroupId(null)}
        />
      );
    }
    const isJoined = joinedGroupIds.includes(selectedGroup.id);
    const inviteCode = selectedGroup.inviteCode ?? selectedGroup.id;

    return (
      <>
        <GroupDetailView
          group={selectedGroup}
          sessions={groupSessions}
          isJoined={isJoined}
          onJoinClick={!isJoined ? () => setJoinTargetGroupId(selectedGroup.id) : undefined}
          onLeave={() => handleLeave(selectedGroup.id)}
          onBack={() => setSelectedGroupId(null)}
          onDetailSession={onDetailSession}
          onCreateSession={onCreateSession}
          onShowMoreMenu={() => setShowMoreMenu(true)}
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
        {showMoreMenu && (
          <GroupMoreMenu
            group={selectedGroup}
            isJoined={isJoined}
            onLeave={() => handleLeave(selectedGroup.id)}
            onCopyCode={() => {
              navigator.clipboard?.writeText(selectedGroup.inviteCode ?? selectedGroup.id);
              setShowMoreMenu(false);
            }}
            onClose={() => setShowMoreMenu(false)}
          />
        )}
      </>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div
          className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl"
          style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <Search className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <input
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-600"
            placeholder="그룹 검색..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center gap-1 px-3 rounded-xl text-xs font-bold transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, #6C5CE7, #5B4ED4)', color: '#fff' }}
        >
          <Plus className="w-3.5 h-3.5" />
          만들기
        </button>
      </div>

      {filteredGroups.length === 0 ? (
        <EmptyGroupState onCreateGroup={() => setShowCreateDialog(true)} />
      ) : (
        filteredGroups.map(group => (
          <GroupCard
            key={group.id}
            group={group}
            isJoined={joinedGroupIds.includes(group.id)}
            sessionCount={sessions.filter(s => s.groupId === group.id || group.sessionIds.includes(s.id)).length}
            onSelect={() => handleGroupCardClick(group)}
          />
        ))
      )}

      <button
        onClick={() => setShowJoinByCodeDialog(true)}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all active:scale-[0.98]"
        style={{
          backgroundColor: 'rgba(255,255,255,0.04)',
          color: 'rgba(255,255,255,0.5)',
          border: '1px dashed rgba(255,255,255,0.12)',
        }}
      >
        <Users className="w-3.5 h-3.5" />
        그룹 코드로 참여하기
      </button>

      {joinTargetGroup && (
        <JoinRequestDialog
          target="group"
          targetName={joinTargetGroup.name}
          validCode={joinTargetGroup.inviteCode ?? joinTargetGroup.id}
          onClose={() => setJoinTargetGroupId(null)}
          onJoin={() => handleJoinSuccess(joinTargetGroup.id)}
        />
      )}

      {showJoinByCodeDialog && (
        <JoinGroupByCodeDialog
          groups={allGroups}
          onClose={() => setShowJoinByCodeDialog(false)}
          onJoinSuccess={(group) => handleJoinSuccess(group.id)}
        />
      )}

      {showCreateDialog && (
        <CreateGroupDialog
          onSubmit={handleCreateGroup}
          onClose={() => setShowCreateDialog(false)}
        />
      )}
    </div>
  );
}

/* ─── 그룹 카드 ─── */
function GroupCard({
  group,
  isJoined,
  sessionCount,
  onSelect,
}: {
  group: LaunchpadGroup;
  isJoined: boolean;
  sessionCount: number;
  onSelect: () => void;
}) {
  const category = GROUP_CATEGORIES[group.category];
  const ModeIcon = MODE_ICONS[group.mode];

  return (
    <button
      onClick={onSelect}
      className="w-full text-left rounded-2xl p-4 transition-all active:scale-[0.98]"
      style={{
        backgroundColor: isJoined ? `${group.color}12` : `${group.color}08`,
        border: `1px solid ${isJoined ? `${group.color}35` : `${group.color}20`}`,
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${group.color}30, ${group.color}15)` }}
        >
          {group.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-bold text-white">{group.name}</span>
            {isJoined && (
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: `${group.color}25`, color: group.color }}
              >
                참여 중
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 line-clamp-1 mb-2">{group.description}</p>

          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: `${category.color}18`, color: category.color }}
            >
              {category.emoji} {category.label}
            </span>
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5"
              style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}
            >
              <ModeIcon className="w-2.5 h-2.5" />
              {MODE_LABELS_SHORT[group.mode]}
            </span>
            <span className="text-[10px] text-gray-500 flex items-center gap-0.5">
              <Users className="w-3 h-3" />
              {group.memberCount}/{group.maxMembers}
            </span>
            {sessionCount > 0 && (
              <span className="text-[10px] text-gray-500 flex items-center gap-0.5">
                <MessageCircle className="w-3 h-3" />
                모임 {sessionCount}
              </span>
            )}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0 mt-1" />
      </div>
    </button>
  );
}

/* ─── 그룹 상세 ─── */
function GroupDetailView({
  group,
  sessions: groupSessions,
  isJoined,
  onJoinClick,
  onLeave,
  onBack,
  onDetailSession,
  onCreateSession,
  onShowMoreMenu,
}: {
  group: LaunchpadGroup;
  sessions: LaunchpadSession[];
  isJoined: boolean;
  onJoinClick?: () => void;
  onLeave: () => void;
  onBack: () => void;
  onDetailSession: (session: LaunchpadSession) => void;
  onCreateSession: (groupId?: string) => void;
  onShowMoreMenu: () => void;
}) {
  const category = GROUP_CATEGORIES[group.category];
  const ModeIcon = MODE_ICONS[group.mode];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-bold text-gray-300 transition-all active:scale-95"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />목록
        </button>
        <button
          onClick={onShowMoreMenu}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-95"
          style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
        >
          <MoreVertical className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <div
        className="rounded-2xl p-5"
        style={{
          background: `linear-gradient(135deg, ${group.color}15, ${group.color}05)`,
          border: `1px solid ${group.color}30`,
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
            style={{ background: `linear-gradient(135deg, ${group.color}40, ${group.color}20)` }}
          >
            {group.emoji}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white">{group.name}</span>
              {isJoined && (
                <span
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: `${group.color}25`, color: group.color }}
                >
                  참여 중
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${category.color}20`, color: category.color }}
              >
                {category.emoji} {category.label}
              </span>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}
              >
                <ModeIcon className="w-3 h-3" />
                {MODE_LABELS_SHORT[group.mode]}
              </span>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-300 leading-relaxed mb-3">{group.description}</p>

        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Users className="w-3.5 h-3.5" />
            <span>{group.memberCount}/{group.maxMembers}명</span>
          </div>
          <div className="text-xs text-gray-500">만든 사람: {group.creatorName}</div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {group.tags.map(tag => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${group.color}18`, color: group.color }}
            >
              #{tag}
            </span>
          ))}
        </div>

        {!isJoined && onJoinClick && (
          <button
            onClick={onJoinClick}
            className="w-full h-10 rounded-xl text-sm font-bold transition-all active:scale-[0.98]"
            style={{ background: `linear-gradient(135deg, ${group.color}, ${group.color}cc)`, color: '#fff', boxShadow: `0 4px 16px ${group.color}40` }}
          >
            참여하기
          </button>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 rounded-full" style={{ backgroundColor: group.color }} />
            <span className="text-sm font-bold text-white">그룹 모임</span>
            {groupSessions.length > 0 && (
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: `${group.color}25`, color: group.color }}
              >
                {groupSessions.length}
              </span>
            )}
          </div>
          <button
            onClick={() => onCreateSession(group.id)}
            className="flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all active:scale-95"
            style={{ backgroundColor: `${group.color}18`, color: group.color, border: `1px solid ${group.color}30` }}
          >
            <Plus className="w-3 h-3" />
            모임 만들기
          </button>
        </div>

        {groupSessions.length === 0 ? (
          <div className="py-8 text-center">
            <div className="text-2xl mb-2">📅</div>
            <p className="text-xs text-gray-600">아직 등록된 모임이 없어요</p>
          </div>
        ) : (
          <div className="space-y-2">
            {groupSessions.map(session => (
              <button
                key={session.id}
                onClick={() => onDetailSession(session)}
                className="w-full text-left p-3 rounded-xl transition-all active:scale-[0.98]"
                style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="text-sm font-semibold text-white mb-1">{session.title}</div>
                <div className="flex items-center gap-2 text-[10px] text-gray-500">
                  <span>{new Date(session.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}</span>
                  <span>·</span>
                  <span>{session.time}</span>
                  <span>·</span>
                  <span>{session.currentParticipants}/{session.maxParticipants}명</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── 그룹 코드로 참여 다이얼로그 ─── */
function JoinGroupByCodeDialog({
  groups,
  onClose,
  onJoinSuccess,
}: {
  groups: LaunchpadGroup[];
  onClose: () => void;
  onJoinSuccess: (group: LaunchpadGroup) => void;
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
        <h3 className="text-base font-black text-white mb-1">그룹 코드로 참여</h3>
        <p className="text-xs text-gray-400 mb-4">친구에게 받은 그룹 초대 코드를 입력하세요.</p>
        <div className="flex gap-2">
          <input
            value={code}
            onChange={e => { setCode(e.target.value); setError(null); }}
            placeholder="예: LP-AI-001"
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

/* ─── 빈 상태 ─── */
function EmptyGroupState({ onCreateGroup }: { onCreateGroup: () => void }) {
  return (
    <div className="py-10 flex flex-col items-center gap-3">
      <div
        className="w-16 h-16 rounded-3xl flex items-center justify-center text-3xl"
        style={{ backgroundColor: 'rgba(108,92,231,0.12)', border: '1px dashed rgba(108,92,231,0.3)' }}
      >
        👥
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-gray-300">아직 그룹이 없어요</p>
        <p className="text-xs text-gray-600 mt-1">관심사가 같은 사람들과 그룹을 만들어보세요</p>
      </div>
      <button
        className="px-6 py-2.5 rounded-2xl text-sm font-bold transition-all active:scale-95 flex items-center gap-2"
        style={{ background: 'linear-gradient(135deg, #6C5CE7, #5B4ED4)', color: '#fff' }}
        onClick={onCreateGroup}
      >
        <Plus className="w-4 h-4" />
        {LAUNCHPAD_LABELS.groupCreateButton}
      </button>
    </div>
  );
}
