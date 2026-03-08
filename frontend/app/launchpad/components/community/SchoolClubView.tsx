'use client';

import { useState, useEffect } from 'react';
import { School, Users, Calendar, ChevronRight, Plus, Search, MessageCircle } from 'lucide-react';
import { LAUNCHPAD_LABELS } from '../../config';
import type { LaunchpadSession, SchoolClub } from '../../types';
import communityData from '@/data/launchpad-community.json';

const STORAGE_KEY_JOINED_CLUBS = 'launchpad_joined_clubs';

function loadJoinedClubs(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_JOINED_CLUBS);
    if (raw) return new Set(JSON.parse(raw));
  } catch {}
  return new Set();
}

function saveJoinedClubs(set: Set<string>) {
  localStorage.setItem(STORAGE_KEY_JOINED_CLUBS, JSON.stringify([...set]));
}

type Props = {
  sessions: LaunchpadSession[];
  onDetailSession: (session: LaunchpadSession) => void;
  onCreateSession: () => void;
};

export function SchoolClubView({ sessions, onDetailSession, onCreateSession }: Props) {
  const [clubs] = useState<SchoolClub[]>(communityData.schoolClubs as SchoolClub[]);
  const [joinedClubs, setJoinedClubs] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);

  useEffect(() => {
    setJoinedClubs(loadJoinedClubs());
  }, []);

  const handleJoinClub = (clubId: string) => {
    setJoinedClubs(prev => {
      const next = new Set(prev);
      if (next.has(clubId)) {
        next.delete(clubId);
      } else {
        next.add(clubId);
      }
      saveJoinedClubs(next);
      return next;
    });
  };

  const filteredClubs = clubs.filter(club =>
    !searchQuery ||
    club.schoolName.includes(searchQuery) ||
    club.clubName.includes(searchQuery) ||
    club.tags.some(t => t.includes(searchQuery))
  );

  const selectedClub = selectedClubId ? clubs.find(c => c.id === selectedClubId) : null;
  const clubSessions = selectedClub
    ? sessions.filter(s => selectedClub.sessionIds.includes(s.id))
    : [];

  if (selectedClub) {
    return (
      <ClubDetailView
        club={selectedClub}
        sessions={clubSessions}
        isJoined={joinedClubs.has(selectedClub.id)}
        onJoinClub={() => handleJoinClub(selectedClub.id)}
        onBack={() => setSelectedClubId(null)}
        onDetailSession={onDetailSession}
        onCreateSession={onCreateSession}
      />
    );
  }

  return (
    <div className="space-y-3">
      {/* 검색 */}
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

      {/* 동아리 목록 */}
      {filteredClubs.length === 0 ? (
        <EmptyClubState onCreateSession={onCreateSession} />
      ) : (
        filteredClubs.map(club => (
          <ClubCard
            key={club.id}
            club={club}
            isJoined={joinedClubs.has(club.id)}
            sessionCount={sessions.filter(s => club.sessionIds.includes(s.id)).length}
            onSelect={() => setSelectedClubId(club.id)}
          />
        ))
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
        backgroundColor: 'rgba(34,197,94,0.04)',
        border: '1px solid rgba(34,197,94,0.15)',
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
  onJoinClub,
  onBack,
  onDetailSession,
  onCreateSession,
}: {
  club: SchoolClub;
  sessions: LaunchpadSession[];
  isJoined: boolean;
  onJoinClub: () => void;
  onBack: () => void;
  onDetailSession: (session: LaunchpadSession) => void;
  onCreateSession: () => void;
}) {
  return (
    <div className="space-y-4">
      {/* 뒤로가기 */}
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-xs text-gray-400 active:text-white transition-colors"
      >
        ← 동아리 목록
      </button>

      {/* 동아리 헤더 */}
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
            <div className="text-base font-bold text-white">{club.clubName}</div>
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

        <button
          onClick={onJoinClub}
          className="w-full h-10 rounded-xl text-sm font-bold transition-all active:scale-[0.98]"
          style={isJoined
            ? { backgroundColor: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.25)' }
            : { background: 'linear-gradient(135deg, #22C55E, #16A34A)', color: '#fff', boxShadow: '0 4px 16px rgba(34,197,94,0.35)' }}
        >
          {isJoined ? '동아리 탈퇴' : '동아리 참여하기'}
        </button>
      </div>

      {/* 동아리 모임 목록 */}
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
