'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  School, Users, Calendar, ChevronRight, Plus, Search, MessageCircle,
  MoreVertical, LogOut, Copy, X,
} from 'lucide-react';
import { LAUNCHPAD_LABELS, COMMUNITY_RESTRICTED } from '../../config';
import type { LaunchpadSession, SchoolClub } from '../../types';
import communityData from '@/data/launchpad-community.json';
import { CommunityAccessGate } from './CommunityAccessGate';
import { JoinRequestDialog } from '@/components/community/JoinRequestDialog';
import {
  loadJoinedClubIds,
  joinClub,
  leaveClub,
} from '@/lib/launchpadCommunity';

const STORAGE_KEY_ACCESS = 'launchpad_community_access';

function hasCommunityAccess(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY_ACCESS) === 'true';
  } catch {
    return false;
  }
}

type Props = {
  sessions: LaunchpadSession[];
  onDetailSession: (session: LaunchpadSession) => void;
  onCreateSession: (groupId?: string) => void;
};

/* ─── 동아리 더보기 메뉴 ─── */
function ClubMoreMenu({
  club,
  isJoined,
  onLeave,
  onCopyCode,
  onClose,
}: {
  club: SchoolClub;
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
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.25), rgba(34,197,94,0.1))' }}
            >
              <School className="w-5 h-5 text-green-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">{club.clubName}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{club.schoolName}</p>
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
            동아리 코드 복사
          </button>

          {isJoined && (
            <button
              onClick={onLeave}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all active:scale-[0.98]"
              style={{ backgroundColor: 'rgba(239,68,68,0.08)', color: '#EF4444' }}
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              동아리 탈퇴하기
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(menuContent, document.body);
}

export function SchoolClubView({ sessions, onDetailSession, onCreateSession }: Props) {
  const [clubs] = useState<SchoolClub[]>(communityData.schoolClubs as SchoolClub[]);
  const [joinedClubIds, setJoinedClubIds] = useState<string[]>(() => loadJoinedClubIds());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  const [joinTargetClubId, setJoinTargetClubId] = useState<string | null>(null);
  const [showJoinByCodeDialog, setShowJoinByCodeDialog] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [accessKey, setAccessKey] = useState(0);

  useEffect(() => {
    setJoinedClubIds(loadJoinedClubIds());
  }, []);

  const refreshJoined = () => setJoinedClubIds(loadJoinedClubIds());

  const handleClubCardClick = (club: SchoolClub) => {
    if (joinedClubIds.includes(club.id)) {
      setSelectedClubId(club.id);
    } else {
      setJoinTargetClubId(club.id);
    }
  };

  const handleJoinSuccess = (clubId: string) => {
    joinClub(clubId);
    refreshJoined();
    setJoinTargetClubId(null);
    setShowJoinByCodeDialog(false);
    setSelectedClubId(clubId);
  };

  const handleLeave = (clubId: string) => {
    leaveClub(clubId);
    refreshJoined();
    setSelectedClubId(null);
    setShowMoreMenu(false);
  };

  const filteredClubs = clubs.filter(club =>
    !searchQuery ||
    club.schoolName.includes(searchQuery) ||
    club.clubName.includes(searchQuery) ||
    club.tags.some(t => t.includes(searchQuery))
  );

  const selectedClub = selectedClubId ? clubs.find(c => c.id === selectedClubId) : null;
  const joinTargetClub = joinTargetClubId ? clubs.find(c => c.id === joinTargetClubId) : null;
  const clubSessions = selectedClub
    ? sessions.filter(s => selectedClub.sessionIds.includes(s.id))
    : [];

  if (selectedClub) {
    const hasAccess = hasCommunityAccess();
    if (COMMUNITY_RESTRICTED && !hasAccess) {
      return (
        <CommunityAccessGate
          onAccessGranted={() => setAccessKey(k => k + 1)}
          onBack={() => setSelectedClubId(null)}
        />
      );
    }
    const isJoined = joinedClubIds.includes(selectedClub.id);
    const clubCode = selectedClub.code ?? selectedClub.id;

    return (
      <>
        <ClubDetailView
          club={selectedClub}
          sessions={clubSessions}
          isJoined={isJoined}
          onJoinClick={!isJoined ? () => setJoinTargetClubId(selectedClub.id) : undefined}
          onLeave={() => handleLeave(selectedClub.id)}
          onBack={() => setSelectedClubId(null)}
          onDetailSession={onDetailSession}
          onCreateSession={onCreateSession}
          onShowMoreMenu={() => setShowMoreMenu(true)}
        />
        {joinTargetClub && (
          <JoinRequestDialog
            target="club"
            targetName={joinTargetClub.clubName}
            validCode={joinTargetClub.code ?? joinTargetClub.id}
            onClose={() => setJoinTargetClubId(null)}
            onJoin={() => handleJoinSuccess(joinTargetClub.id)}
          />
        )}
        {showMoreMenu && (
          <ClubMoreMenu
            club={selectedClub}
            isJoined={isJoined}
            onLeave={() => handleLeave(selectedClub.id)}
            onCopyCode={() => {
              navigator.clipboard?.writeText(selectedClub.code ?? selectedClub.id);
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
      <div
        className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
        style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <Search className="w-4 h-4 text-gray-500 flex-shrink-0" />
        <input
          className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-600"
          placeholder="학교명 또는 동아리 검색..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredClubs.length === 0 ? (
        <EmptyClubState onCreateSession={onCreateSession} />
      ) : (
        filteredClubs.map(club => (
          <ClubCard
            key={club.id}
            club={club}
            isJoined={joinedClubIds.includes(club.id)}
            sessionCount={sessions.filter(s => club.sessionIds.includes(s.id)).length}
            onSelect={() => handleClubCardClick(club)}
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
        <School className="w-3.5 h-3.5" />
        동아리 코드로 참여하기
      </button>

      {joinTargetClub && (
        <JoinRequestDialog
          target="club"
          targetName={joinTargetClub.clubName}
          validCode={joinTargetClub.code ?? joinTargetClub.id}
          onClose={() => setJoinTargetClubId(null)}
          onJoin={() => handleJoinSuccess(joinTargetClub.id)}
        />
      )}

      {showJoinByCodeDialog && (
        <JoinClubByCodeDialog
          clubs={clubs}
          onClose={() => setShowJoinByCodeDialog(false)}
          onJoinSuccess={(club) => handleJoinSuccess(club.id)}
        />
      )}
    </div>
  );
}

/* ─── 동아리 카드 ─── */
function ClubCard({
  club,
  isJoined,
  sessionCount,
  onSelect,
}: {
  club: SchoolClub;
  isJoined: boolean;
  sessionCount: number;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className="w-full text-left rounded-2xl p-4 transition-all active:scale-[0.98]"
      style={{
        backgroundColor: isJoined ? 'rgba(34,197,94,0.08)' : 'rgba(34,197,94,0.04)',
        border: `1px solid ${isJoined ? 'rgba(34,197,94,0.25)' : 'rgba(34,197,94,0.15)'}`,
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.25), rgba(34,197,94,0.1))' }}
        >
          <School className="w-5 h-5 text-green-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-bold text-white">{club.clubName}</span>
            {isJoined && (
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: 'rgba(34,197,94,0.2)', color: '#22C55E' }}
              >
                참여 중
              </span>
            )}
          </div>
          <div className="text-[11px] text-green-400/70 mb-1">{club.schoolName}</div>
          <p className="text-xs text-gray-400 line-clamp-1">{club.description}</p>

          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1 text-[10px] text-gray-500">
              <Users className="w-3 h-3" />
              <span>{club.memberCount}/{club.maxMembers}명</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-gray-500">
              <Calendar className="w-3 h-3" />
              <span>{club.meetingSchedule}</span>
            </div>
            {sessionCount > 0 && (
              <div className="flex items-center gap-1 text-[10px] text-gray-500">
                <MessageCircle className="w-3 h-3" />
                <span>모임 {sessionCount}개</span>
              </div>
            )}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0 mt-1" />
      </div>
    </button>
  );
}

/* ─── 동아리 상세 ─── */
function ClubDetailView({
  club,
  sessions: clubSessions,
  isJoined,
  onJoinClick,
  onLeave,
  onBack,
  onDetailSession,
  onCreateSession,
  onShowMoreMenu,
}: {
  club: SchoolClub;
  sessions: LaunchpadSession[];
  isJoined: boolean;
  onJoinClick?: () => void;
  onLeave: () => void;
  onBack: () => void;
  onDetailSession: (session: LaunchpadSession) => void;
  onCreateSession: () => void;
  onShowMoreMenu: () => void;
}) {
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
          background: 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(34,197,94,0.04))',
          border: '1px solid rgba(34,197,94,0.25)',
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)' }}
          >
            <School className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white">{club.clubName}</span>
              {isJoined && (
                <span
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: 'rgba(34,197,94,0.2)', color: '#22C55E' }}
                >
                  참여 중
                </span>
              )}
            </div>
            <div className="text-xs text-green-400/70">{club.schoolName}</div>
          </div>
        </div>
        <p className="text-sm text-gray-300 leading-relaxed mb-3">{club.description}</p>

        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Users className="w-3.5 h-3.5" />
            <span>{club.memberCount}/{club.maxMembers}명</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>{club.meetingSchedule}</span>
          </div>
        </div>

        {club.teacherName && (
          <div className="text-[11px] text-yellow-400/80 mb-3">
            👨‍🏫 담당: {club.teacherName}
          </div>
        )}

        <div className="flex flex-wrap gap-1.5 mb-4">
          {club.tags.map(tag => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 rounded-full"
              style={{ backgroundColor: 'rgba(34,197,94,0.15)', color: '#22C55E' }}
            >
              #{tag}
            </span>
          ))}
        </div>

        {!isJoined && onJoinClick && (
          <button
            onClick={onJoinClick}
            className="w-full h-10 rounded-xl text-sm font-bold transition-all active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)', color: '#fff', boxShadow: '0 4px 16px rgba(34,197,94,0.35)' }}
          >
            참여하기
          </button>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 rounded-full bg-green-500" />
            <span className="text-sm font-bold text-white">동아리 모임</span>
            {clubSessions.length > 0 && (
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: 'rgba(34,197,94,0.2)', color: '#22C55E' }}
              >
                {clubSessions.length}
              </span>
            )}
          </div>
          <button
            onClick={onCreateSession}
            className="flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all active:scale-95"
            style={{ backgroundColor: 'rgba(34,197,94,0.15)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.3)' }}
          >
            <Plus className="w-3 h-3" />
            모임 만들기
          </button>
        </div>

        {clubSessions.length === 0 ? (
          <div className="py-8 text-center">
            <div className="text-2xl mb-2">📅</div>
            <p className="text-xs text-gray-600">아직 등록된 모임이 없어요</p>
          </div>
        ) : (
          <div className="space-y-2">
            {clubSessions.map(session => (
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

/* ─── 동아리 코드로 참여 다이얼로그 ─── */
function JoinClubByCodeDialog({
  clubs,
  onClose,
  onJoinSuccess,
}: {
  clubs: SchoolClub[];
  onClose: () => void;
  onJoinSuccess: (club: SchoolClub) => void;
}) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    setError(null);
    const entered = code.trim().toUpperCase();
    if (!entered) { setError('코드를 입력해주세요'); return; }
    const club = clubs.find(c => (c.code ?? c.id).toUpperCase() === entered);
    if (club) {
      onJoinSuccess(club);
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
        <h3 className="text-base font-black text-white mb-1">동아리 코드로 참여</h3>
        <p className="text-xs text-gray-400 mb-4">선생님이 알려준 동아리 코드를 입력하세요.</p>
        <div className="flex gap-2">
          <input
            value={code}
            onChange={e => { setCode(e.target.value); setError(null); }}
            placeholder="예: CLUB-SH-001"
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
            style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)', color: '#fff' }}
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
function EmptyClubState({ onCreateSession }: { onCreateSession: () => void }) {
  return (
    <div className="py-10 flex flex-col items-center gap-3">
      <div
        className="w-16 h-16 rounded-3xl flex items-center justify-center text-3xl"
        style={{ backgroundColor: 'rgba(34,197,94,0.12)', border: '1px dashed rgba(34,197,94,0.3)' }}
      >
        🏫
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-gray-300">{LAUNCHPAD_LABELS.communityEmpty}</p>
        <p className="text-xs text-gray-600 mt-1">{LAUNCHPAD_LABELS.communityEmptyDesc}</p>
      </div>
      <button
        className="px-6 py-2.5 rounded-2xl text-sm font-bold transition-all active:scale-95 flex items-center gap-2"
        style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)', color: '#fff' }}
        onClick={onCreateSession}
      >
        <Plus className="w-4 h-4" />
        동아리 모임 만들기
      </button>
    </div>
  );
}
