'use client';

import { useState, useEffect } from 'react';
import { Users, Plus, Search, ChevronRight, Video, School, Shuffle, MessageCircle } from 'lucide-react';
import { LAUNCHPAD_LABELS } from '../../config';
import type { LaunchpadSession, LaunchpadGroup } from '../../types';
import { GROUP_CATEGORIES } from '../../types';
import { CreateGroupDialog } from './CreateGroupDialog';
import communityData from '@/data/launchpad-community.json';

const STORAGE_KEY_JOINED_GROUPS = 'launchpad_joined_groups';
const STORAGE_KEY_CUSTOM_GROUPS = 'launchpad_custom_groups';

function loadJoinedGroups(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_JOINED_GROUPS);
    if (raw) return new Set(JSON.parse(raw));
  } catch {}
  return new Set();
}

function saveJoinedGroups(set: Set<string>) {
  localStorage.setItem(STORAGE_KEY_JOINED_GROUPS, JSON.stringify([...set]));
}

function loadCustomGroups(): LaunchpadGroup[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_GROUPS);
    if (raw) return JSON.parse(raw);
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

type Props = {
  sessions: LaunchpadSession[];
  onDetailSession: (session: LaunchpadSession) => void;
  onCreateSession: () => void;
};

export function GroupListView({ sessions, onDetailSession, onCreateSession }: Props) {
  const [seedGroups] = useState<LaunchpadGroup[]>(communityData.groups as LaunchpadGroup[]);
  const [customGroups, setCustomGroups] = useState<LaunchpadGroup[]>([]);
  const [joinedGroups, setJoinedGroups] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    setJoinedGroups(loadJoinedGroups());
    setCustomGroups(loadCustomGroups());
  }, []);

  const allGroups = [...seedGroups, ...customGroups];

  const handleJoinGroup = (groupId: string) => {
    setJoinedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      saveJoinedGroups(next);
      return next;
    });
  };

  const handleCreateGroup = (group: LaunchpadGroup) => {
    const updated = [...customGroups, group];
    setCustomGroups(updated);
    saveCustomGroups(updated);
    setJoinedGroups(prev => {
      const next = new Set(prev).add(group.id);
      saveJoinedGroups(next);
      return next;
    });
    setShowCreateDialog(false);
  };

  const filteredGroups = allGroups.filter(group =>
    !searchQuery ||
    group.name.includes(searchQuery) ||
    group.description.includes(searchQuery) ||
    group.tags.some(t => t.includes(searchQuery))
  );

  const selectedGroup = selectedGroupId ? allGroups.find(g => g.id === selectedGroupId) : null;
  const groupSessions = selectedGroup
    ? sessions.filter(s => selectedGroup.sessionIds.includes(s.id))
    : [];

  if (selectedGroup) {
    return (
      <GroupDetailView
        group={selectedGroup}
        sessions={groupSessions}
        isJoined={joinedGroups.has(selectedGroup.id)}
        onJoinGroup={() => handleJoinGroup(selectedGroup.id)}
        onBack={() => setSelectedGroupId(null)}
        onDetailSession={onDetailSession}
        onCreateSession={onCreateSession}
      />
    );
  }

  return (
    <div className="space-y-3">
      {/* 검색 + 만들기 */}
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

      {/* 그룹 목록 */}
      {filteredGroups.length === 0 ? (
        <EmptyGroupState onCreateGroup={() => setShowCreateDialog(true)} />
      ) : (
        filteredGroups.map(group => (
          <GroupCard
            key={group.id}
            group={group}
            isJoined={joinedGroups.has(group.id)}
            sessionCount={sessions.filter(s => group.sessionIds.includes(s.id)).length}
            onSelect={() => setSelectedGroupId(group.id)}
          />
        ))
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
        backgroundColor: `${group.color}08`,
        border: `1px solid ${group.color}20`,
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
  onJoinGroup,
  onBack,
  onDetailSession,
  onCreateSession,
}: {
  group: LaunchpadGroup;
  sessions: LaunchpadSession[];
  isJoined: boolean;
  onJoinGroup: () => void;
  onBack: () => void;
  onDetailSession: (session: LaunchpadSession) => void;
  onCreateSession: () => void;
}) {
  const category = GROUP_CATEGORIES[group.category];
  const ModeIcon = MODE_ICONS[group.mode];

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-xs text-gray-400 active:text-white transition-colors"
      >
        ← 그룹 목록
      </button>

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
            <div className="text-lg font-bold text-white">{group.name}</div>
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

        <button
          onClick={onJoinGroup}
          className="w-full h-10 rounded-xl text-sm font-bold transition-all active:scale-[0.98]"
          style={isJoined
            ? { backgroundColor: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.25)' }
            : { background: `linear-gradient(135deg, ${group.color}, ${group.color}cc)`, color: '#fff', boxShadow: `0 4px 16px ${group.color}40` }}
        >
          {isJoined ? '그룹 탈퇴' : '그룹 참여하기'}
        </button>
      </div>

      {/* 그룹 모임 */}
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
            onClick={onCreateSession}
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
