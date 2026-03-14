'use client';

import { useState } from 'react';
import {
  ChevronRight, Crown, MoreVertical,
  LogOut, Copy, Lock, Unlock,
} from 'lucide-react';
import type { DreamSpace, SharedRoadmap } from '../types';
import { RoadmapCard } from './RoadmapCard';
import { SpaceNoticePanel } from './SpaceParticipationPanels';
import { LABELS } from '../config';

interface SpaceDetailViewProps {
  currentUserId: string;
  space: DreamSpace;
  roadmaps: SharedRoadmap[];
  isJoined: boolean;
  likedIds: string[];
  bookmarkedIds: string[];
  likeCounts: Record<string, number>;
  bookmarkCounts: Record<string, number>;
  onToggleLike: (id: string) => void;
  onToggleBookmark: (id: string) => void;
  onViewRoadmapDetail: (rm: SharedRoadmap) => void;
  onLeave: () => void;
  onToggleRecruitmentStatus: (spaceId: string) => void;
  onCreateNotice: (spaceId: string, title: string, content: string) => void;
  onBack: () => void;
}

export function SpaceDetailView({
  currentUserId,
  space,
  roadmaps,
  isJoined,
  likedIds,
  bookmarkedIds,
  likeCounts,
  bookmarkCounts,
  onToggleLike,
  onToggleBookmark,
  onViewRoadmapDetail,
  onLeave,
  onToggleRecruitmentStatus,
  onCreateNotice,
  onBack,
}: SpaceDetailViewProps) {
  const [showMore, setShowMore] = useState(false);
  const [noticeTitleInput, setNoticeTitleInput] = useState('');
  const [noticeContentInput, setNoticeContentInput] = useState('');
  const inviteCode = space.inviteCode ?? space.id;
  const isSpaceOperator = currentUserId === space.creatorId;
  const recruitmentStatus = space.recruitmentStatus ?? 'open';
  const handleLeaveGroupWithConfirmation = () => {
    const isLeaveConfirmed = window.confirm(
      `${LABELS.spaceLeaveConfirmTitle}\n\n${LABELS.spaceLeaveConfirmDescription}`,
    );
    if (!isLeaveConfirmed) return;
    onLeave();
    setShowMore(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-gray-300 transition-all active:scale-95">
          <ChevronRight className="w-4 h-4 rotate-180" />목록
        </button>
        <button
          onClick={() => setShowMore(!showMore)}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-95"
          style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
        >
          <MoreVertical className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {showMore && (
        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={() => { navigator.clipboard?.writeText(inviteCode); setShowMore(false); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white transition-all active:scale-[0.98]"
          >
            <Copy className="w-4 h-4 text-gray-400" /> 초대 코드 복사
          </button>
          {isJoined && (
            <button
              onClick={handleLeaveGroupWithConfirmation}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all active:scale-[0.98]"
              style={{ color: '#EF4444' }}
            >
              <LogOut className="w-4 h-4" /> 그룹 탈퇴하기
            </button>
          )}
          {isSpaceOperator && (
            <button
              onClick={() => {
                onToggleRecruitmentStatus(space.id);
                setShowMore(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all active:scale-[0.98]"
              style={{ color: recruitmentStatus === 'open' ? '#FCA5A5' : '#86EFAC' }}
            >
              {recruitmentStatus === 'open' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              {recruitmentStatus === 'open' ? '모집 마감으로 변경' : '모집중으로 변경'}
            </button>
          )}
        </div>
      )}

      {/* Space header */}
      <div
        className="rounded-2xl p-5"
        style={{ background: `linear-gradient(135deg, ${space.color}18, ${space.color}08)`, border: `1.5px solid ${space.color}30` }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
            style={{ backgroundColor: `${space.color}20`, border: `1px solid ${space.color}35` }}
          >
            {space.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-black text-white">{space.name}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{space.description}</p>
          </div>
        </div>
      </div>

      <SpaceNoticePanel
        notices={space.notices ?? []}
        canManage={isSpaceOperator}
        noticeTitle={noticeTitleInput}
        noticeContent={noticeContentInput}
        onNoticeTitleChange={setNoticeTitleInput}
        onNoticeContentChange={setNoticeContentInput}
        onCreateNotice={() => {
          onCreateNotice(space.id, noticeTitleInput.trim(), noticeContentInput.trim());
          setNoticeTitleInput('');
          setNoticeContentInput('');
        }}
      />

      {/* Members */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-gray-400">멤버 ({space.members.length})</span>
        <div className="grid grid-cols-2 gap-2">
          {space.members.map(member => {
            const isCreator = member.id === space.creatorId;
            return (
              <div
                key={member.id}
                className="flex items-center gap-2.5 p-3 rounded-xl"
                style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg" style={{ backgroundColor: `${space.color}15` }}>
                  {member.emoji}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-white truncate">{member.name}</span>
                    {isCreator && <Crown className="w-3 h-3 flex-shrink-0" style={{ color: '#FBBF24' }} />}
                  </div>
                  <span className="text-xs text-gray-500">{member.grade}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Shared roadmaps */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-gray-400">공유된 로드맵 ({roadmaps.length})</span>
        {roadmaps.length === 0 ? (
          <div className="py-8 text-center rounded-xl" style={{ border: '1px dashed rgba(255,255,255,0.1)' }}>
            <p className="text-xs text-gray-500">아직 공유된 로드맵이 없어요</p>
          </div>
        ) : (
          roadmaps.map(rm => (
            <RoadmapCard
              key={rm.id}
              roadmap={rm}
              isLiked={likedIds.includes(rm.id)}
              isBookmarked={bookmarkedIds.includes(rm.id)}
              likeCount={likeCounts[rm.id] ?? rm.likes}
              bookmarkCount={bookmarkCounts[rm.id] ?? rm.bookmarks}
              onToggleLike={() => onToggleLike(rm.id)}
              onToggleBookmark={() => onToggleBookmark(rm.id)}
              onViewDetail={() => onViewRoadmapDetail(rm)}
            />
          ))
        )}
      </div>
    </div>
  );
}
