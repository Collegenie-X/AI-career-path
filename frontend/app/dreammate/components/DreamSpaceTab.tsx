'use client';

import { useEffect, useMemo, useState } from 'react';
import { DREAM_LIST_ITEMS_PER_PAGE } from '../config';
import { ListPagination } from './ListPagination';
import {
  Users, ChevronRight, MessageSquare,
  X, Clock, Star,
} from 'lucide-react';
import { TwoColumnPanelLayout, DetailPanelScrollContainer } from '@/components/TwoColumnPanelLayout';
import { LABELS } from '../config';
import type { DreamSpace, SharedRoadmap } from '../types';
import { SpaceDetailView } from './SpaceDetailView';
import { SpaceJoinRequestDialog } from './SpaceJoinRequestDialog';

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return `${Math.floor(days / 7)}주 전`;
}

function isRecentlyUpdated(dateStr: string): boolean {
  return Date.now() - new Date(dateStr).getTime() < 7 * 24 * 60 * 60 * 1000;
}

/* ─── Space Card (내 기록 등 마스터-디테일에서도 재사용) ─── */
export function SpaceCard({
  space, roadmapCount, isJoined, isSelected, onOpen,
}: {
  space: DreamSpace;
  roadmapCount: number;
  isJoined: boolean;
  isSelected?: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full rounded-none border p-4 text-left transition-all active:scale-[0.99]"
      style={{
        backgroundColor: isSelected
          ? `${space.color}18`
          : isJoined
            ? `${space.color}10`
            : `${space.color}06`,
        border: `1px solid ${isSelected ? `${space.color}55` : `${space.color}22`}`,
        boxShadow: isSelected ? `inset 3px 0 0 0 ${space.color}` : undefined,
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${space.color}28, ${space.color}10)`, border: `1px solid ${space.color}30` }}
        >
          {space.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-bold text-white">{space.name}</span>
            {isJoined && (
              <span className="flex items-center gap-0.5 text-sm font-bold px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: 'rgba(34,197,94,0.15)', color: '#22C55E' }}>
                <Star className="w-2 h-2" /> 참여 중
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400 line-clamp-1 mb-2">{space.description}</p>
          {(space.updatedAt ?? space.createdAt) && (
            <div className="flex items-center gap-1 mb-2">
              <Clock className="w-2.5 h-2.5 text-gray-500" />
              <span className="text-sm text-gray-500">{formatTimeAgo(space.updatedAt ?? space.createdAt)}</span>
              {isRecentlyUpdated(space.updatedAt ?? space.createdAt) && (
                <span className="text-sm font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(34,197,94,0.15)', color: '#22C55E' }}>NEW</span>
              )}
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5">
              {space.members.slice(0, 4).map(m => (
                <div key={m.id} className="w-6 h-6 rounded-full flex items-center justify-center text-sm border-2" style={{ borderColor: '#0a0a1e', backgroundColor: `${space.color}20` }}>
                  {m.emoji}
                </div>
              ))}
            </div>
            <span className="text-sm text-gray-500">{space.memberCount}명</span>
            <span className="text-sm text-gray-600">·</span>
            <span className="flex items-center gap-0.5 text-sm text-gray-500">
              <MessageSquare className="w-2.5 h-2.5" />{roadmapCount}개 로드맵
            </span>
          </div>
        </div>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${space.color}25`, border: `1px solid ${space.color}45` }}
        >
          <ChevronRight className="w-4 h-4" style={{ color: space.color }} />
        </div>
      </div>
    </button>
  );
}

/* ─── Create Space Dialog ─── */
function CreateSpaceDialog({ onClose, onCreate }: {
  onClose: () => void;
  onCreate: (name: string, description: string, emoji: string) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('🤝');
  const EMOJI_OPTIONS = ['🤝', '💻', '🎨', '🔬', '🏥', '⚖️', '🚀', '🎵', '📚', '🌱', '🎮', '🏆'];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-[430px] rounded-t-3xl overflow-y-auto"
        style={{ backgroundColor: '#12122a', border: '1px solid rgba(255,255,255,0.08)', maxHeight: 'calc(100vh - 80px)', marginBottom: 80 }}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h3 className="text-lg font-black text-white">{LABELS.createSpaceButton}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        <div className="px-5 space-y-4 pb-10">
          <div>
            <label className="text-sm font-bold text-gray-400 mb-2 block">아이콘</label>
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
            <label className="text-sm font-bold text-gray-400 mb-1.5 block">스페이스 이름</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="예: 과학고 준비반"
              className="w-full h-11 px-4 rounded-xl text-sm text-white placeholder-gray-600 outline-none"
              style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-400 mb-1.5 block">설명</label>
            <input value={description} onChange={e => setDescription(e.target.value)} placeholder="어떤 스페이스인지 간단히 설명해 주세요"
              className="w-full h-11 px-4 rounded-xl text-sm text-white placeholder-gray-600 outline-none"
              style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
          </div>
          <button
            onClick={() => { if (name.trim()) onCreate(name.trim(), description.trim(), emoji); }}
            disabled={!name.trim()}
            className="w-full h-12 rounded-2xl font-bold text-white text-sm transition-all active:scale-[0.98] disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #6C5CE7, #a855f7)' }}
          >
            스페이스 만들기
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main export ─── */
interface DreamSpaceTabProps {
  currentUserId: string;
  spaces: DreamSpace[];
  roadmaps: SharedRoadmap[];
  joinedSpaceIds: string[];
  initialSelectedSpaceId?: string | null;
  likedIds: string[];
  bookmarkedIds: string[];
  likeCounts: Record<string, number>;
  bookmarkCounts: Record<string, number>;
  onToggleLike: (id: string) => void;
  onToggleBookmark: (id: string) => void;
  onViewRoadmapDetail: (rm: SharedRoadmap) => void;
  onJoinSpace: (id: string) => void;
  onLeaveSpace: (id: string) => void;
  onCreateSpace: (name: string, description: string, emoji: string) => void;
  onToggleSpaceRecruitmentStatus: (spaceId: string) => void;
  onCreateSpaceNotice: (spaceId: string, title: string, content: string) => void;
}

export function DreamSpaceTab({
  currentUserId,
  spaces, roadmaps, joinedSpaceIds,
  initialSelectedSpaceId,
  likedIds, bookmarkedIds, likeCounts, bookmarkCounts,
  onToggleLike, onToggleBookmark, onViewRoadmapDetail,
  onJoinSpace,
  onLeaveSpace, onCreateSpace,
  onToggleSpaceRecruitmentStatus,
  onCreateSpaceNotice,
}: DreamSpaceTabProps) {
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);
  const [joinTargetSpaceId, setJoinTargetSpaceId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [inviteCodeError, setInviteCodeError] = useState<string | null>(null);
  const [spacesPage, setSpacesPage] = useState(1);

  useEffect(() => {
    if (initialSelectedSpaceId) {
      setSelectedSpaceId(initialSelectedSpaceId);
    }
  }, [initialSelectedSpaceId]);

  const selectedSpace = useMemo(
    () => spaces.find(s => s.id === selectedSpaceId) ?? null,
    [spaces, selectedSpaceId],
  );
  const joinTargetSpace = spaces.find(space => space.id === joinTargetSpaceId) ?? null;

  const hasDetailSelection = Boolean(
    selectedSpaceId && selectedSpace && joinedSpaceIds.includes(selectedSpaceId),
  );

  const spaceRoadmapsForSelected = useMemo(() => {
    if (!selectedSpace) return [];
    return roadmaps.filter(rm => rm.groupIds.includes(selectedSpace.id));
  }, [roadmaps, selectedSpace]);

  const handleOpenSpace = (space: DreamSpace) => {
    if (joinedSpaceIds.includes(space.id)) {
      setSelectedSpaceId(space.id);
      return;
    }
    setJoinTargetSpaceId(space.id);
  };

  const listColumn = (
    <div className="space-y-4 pb-2">
      <div>
        <p className="text-sm text-gray-500 mt-0.5">{LABELS.spaceSubtitle}</p>
      </div>

      <div className="rounded-2xl p-3 space-y-2" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <p className="text-sm font-bold text-gray-300">{LABELS.joinByCodeButton}</p>
        <div className="flex items-center gap-2">
          <input
            value={inviteCodeInput}
            onChange={event => {
              setInviteCodeInput(event.target.value.toUpperCase());
              setInviteCodeError(null);
            }}
            placeholder="예: SCI-2026"
            className="flex-1 h-10 px-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none"
            style={{
              backgroundColor: 'rgba(255,255,255,0.06)',
              border: inviteCodeError ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.1)',
            }}
          />
          <button
            onClick={() => {
              const matchedSpace = spaces.find(space => (space.inviteCode ?? space.id).toUpperCase() === inviteCodeInput.trim().toUpperCase());
              if (!matchedSpace) {
                setInviteCodeError(LABELS.spaceJoinCodeInvalidError);
                return;
              }
              setInviteCodeError(null);
              setJoinTargetSpaceId(matchedSpace.id);
              setInviteCodeInput('');
            }}
            className="h-10 px-4 rounded-xl text-sm font-bold"
            style={{ backgroundColor: 'rgba(108,92,231,0.25)', color: '#ddd6fe' }}
          >
            참여
          </button>
        </div>
        {inviteCodeError && <p className="text-sm text-red-400">{inviteCodeError}</p>}
      </div>

      {spaces.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6C5CE722, #6C5CE708)', border: '1px solid #6C5CE733' }}>
            <Users className="w-7 h-7" style={{ color: '#6C5CE7' }} />
          </div>
          <div>
            <p className="text-sm font-bold text-white">{LABELS.spaceEmpty}</p>
            <p className="text-sm text-gray-400 mt-1">{LABELS.spaceEmptyDesc}</p>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {spaces
              .slice(
                (spacesPage - 1) * DREAM_LIST_ITEMS_PER_PAGE,
                spacesPage * DREAM_LIST_ITEMS_PER_PAGE,
              )
              .map(space => (
                <SpaceCard
                  key={space.id}
                  space={space}
                  roadmapCount={roadmaps.filter(rm => rm.groupIds.includes(space.id)).length}
                  isJoined={joinedSpaceIds.includes(space.id)}
                  isSelected={hasDetailSelection && selectedSpaceId === space.id}
                  onOpen={() => handleOpenSpace(space)}
                />
              ))}
          </div>
          <ListPagination
            totalItems={spaces.length}
            currentPage={spacesPage}
            onPageChange={setSpacesPage}
          />
        </>
      )}
    </div>
  );

  const emptyDetailTitle = String(LABELS.spaceDetailEmptyTitle ?? '그룹을 선택하세요');
  const emptyDetailSub = String(
    LABELS.spaceDetailEmptySub ?? '왼쪽 목록에서 참여 중인 그룹을 클릭하면 상세가 여기에 표시됩니다',
  );

  return (
    <div className="pb-24 md:pb-8">
      <TwoColumnPanelLayout
        hasSelection={hasDetailSelection}
        onClearSelection={() => setSelectedSpaceId(null)}
        emptyPlaceholderText={emptyDetailTitle}
        emptyPlaceholderSubText={emptyDetailSub}
        emptyPlaceholderIllustration="sparkles"
        detailPanelClassName="rounded-none"
        listSlot={
          <div
            className="rounded-none border px-4 py-4 md:px-5 md:py-5"
            style={{
              borderColor: 'rgba(255,255,255,0.12)',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
              boxShadow: '0 20px 55px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            {listColumn}
          </div>
        }
        detailSlot={
          hasDetailSelection && selectedSpace ? (
            <DetailPanelScrollContainer scrollKey={selectedSpaceId}>
              <SpaceDetailView
                layoutVariant="sidePanel"
                currentUserId={currentUserId}
                space={selectedSpace}
                roadmaps={spaceRoadmapsForSelected}
                isJoined={joinedSpaceIds.includes(selectedSpace.id)}
                likedIds={likedIds}
                bookmarkedIds={bookmarkedIds}
                likeCounts={likeCounts}
                bookmarkCounts={bookmarkCounts}
                onToggleLike={onToggleLike}
                onToggleBookmark={onToggleBookmark}
                onViewRoadmapDetail={onViewRoadmapDetail}
                onLeave={() => {
                  onLeaveSpace(selectedSpace.id);
                  setSelectedSpaceId(null);
                }}
                onToggleRecruitmentStatus={onToggleSpaceRecruitmentStatus}
                onCreateNotice={onCreateSpaceNotice}
                onBack={() => setSelectedSpaceId(null)}
              />
            </DetailPanelScrollContainer>
          ) : null
        }
      />

      {showCreateDialog && (
        <CreateSpaceDialog
          onClose={() => setShowCreateDialog(false)}
          onCreate={(name, description, emoji) => {
            onCreateSpace(name, description, emoji);
            setShowCreateDialog(false);
          }}
        />
      )}

      {joinTargetSpace && (
        <SpaceJoinRequestDialog
          space={joinTargetSpace}
          onClose={() => setJoinTargetSpaceId(null)}
          onJoin={() => {
            onJoinSpace(joinTargetSpace.id);
            setSelectedSpaceId(joinTargetSpace.id);
            setJoinTargetSpaceId(null);
          }}
        />
      )}
    </div>
  );
}
