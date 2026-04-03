'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { Map, Users } from 'lucide-react';
import { TwoColumnPanelLayout, DetailPanelScrollContainer } from '@/components/TwoColumnPanelLayout';
import { DREAM_LIST_ITEMS_PER_PAGE, LABELS } from '../config';
import { ListPagination } from './ListPagination';
import type { DreamSpace, RoadmapShareChannel, SharedRoadmap } from '../types';
import { RoadmapListRow } from './RoadmapListRow';
import { RoadmapDetailDialog } from './RoadmapDetailDialog';
import { SpaceDetailView } from './SpaceDetailView';
import { SpaceCard } from './DreamSpaceTab';
import { DreamMateMyExecutionDashboardFilterBar } from './DreamMateMyExecutionDashboardFilterBar';
import {
  countMyRoadmapsShared,
  countMyRoadmapsWithSpaceLink,
  filterMyRoadmapsByExecutionDashboardFilters,
  type MyExecutionDashboardFilterState,
} from '../utils/filterMyRoadmapsByExecutionDashboardFilters';

type MySubTab = 'roadmaps' | 'spaces';

const MY_SUB_TABS: { id: MySubTab; labelKey: string; icon: typeof Map }[] = [
  { id: 'roadmaps', labelKey: 'mySubTabPlansLabel', icon: Map },
  { id: 'spaces', labelKey: 'mySubTabSpacesLabel', icon: Users },
];

interface MyDreamMateTabProps {
  myRoadmaps: SharedRoadmap[];
  /** 스페이스별 공유 로드맵 집계용 */
  allRoadmaps: SharedRoadmap[];
  joinedSpaces: DreamSpace[];
  currentUserId: string;
  availableSpaces: DreamSpace[];
  likedIds: string[];
  bookmarkedIds: string[];
  likeCounts: Record<string, number>;
  bookmarkCounts: Record<string, number>;
  onToggleLike: (id: string) => void;
  onToggleBookmark: (id: string) => void;
  onCreateRoadmap: () => void;
  onEditRoadmap: (roadmapId: string) => void;
  onDeleteRoadmap: (roadmapId: string) => void;
  onRequestShareRoadmap: (roadmap: SharedRoadmap) => void;
  onShareRoadmap: (roadmapId: string, channels: RoadmapShareChannel[], spaceIds: string[]) => void;
  onReportRoadmap: (roadmapId: string, reasonId: string, detail: string) => void;
  onCreateRoadmapComment: (roadmapId: string, comment: string, parentId?: string) => void;
  onLeaveSpace: (spaceId: string) => void;
  onToggleSpaceRecruitmentStatus: (spaceId: string) => void;
  onCreateSpaceNotice: (spaceId: string, title: string, content: string) => void;
  /** 내 기록 상세: 주간 체크 토글 시 로드맵 항목 완료 반영 */
  onToggleRoadmapTodoItem: (roadmapId: string, itemId: string, todoId: string) => void;
  /** JWT 로그인 시에만 상세에서 수정·삭제·공유·댓글·체크리스트 토글 등 */
  allowMutations?: boolean;
}

const listColumnShellClass =
  'rounded-none border px-4 py-4 md:px-5 md:py-5';
const listColumnShellStyle: CSSProperties = {
  borderColor: 'rgba(255,255,255,0.12)',
  background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
  boxShadow: '0 20px 55px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.05)',
};

export function MyDreamMateTab({
  myRoadmaps,
  allRoadmaps,
  joinedSpaces,
  currentUserId,
  availableSpaces,
  likedIds,
  bookmarkedIds,
  likeCounts,
  bookmarkCounts,
  onToggleLike,
  onToggleBookmark,
  onCreateRoadmap,
  onEditRoadmap,
  onDeleteRoadmap,
  onRequestShareRoadmap,
  onShareRoadmap,
  onReportRoadmap,
  onCreateRoadmapComment,
  onLeaveSpace,
  onToggleSpaceRecruitmentStatus,
  onCreateSpaceNotice,
  onToggleRoadmapTodoItem,
  allowMutations = true,
}: MyDreamMateTabProps) {
  const router = useRouter();
  const [subTab, setSubTab] = useState<MySubTab>('roadmaps');
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string | null>(null);
  const [showRoadmapExpandDialog, setShowRoadmapExpandDialog] = useState(false);
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);
  const [roadmapsPage, setRoadmapsPage] = useState(1);
  const [spacesPage, setSpacesPage] = useState(1);
  const [myExecutionFilters, setMyExecutionFilters] = useState<MyExecutionDashboardFilterState>({
    filterSharedOnly: false,
    filterSpaceLinkedOnly: false,
  });

  useEffect(() => {
    setSelectedRoadmapId(null);
    setSelectedSpaceId(null);
    setShowRoadmapExpandDialog(false);
    setRoadmapsPage(1);
    setSpacesPage(1);
  }, [subTab]);

  const filteredMyRoadmaps = useMemo(
    () => filterMyRoadmapsByExecutionDashboardFilters(myRoadmaps, myExecutionFilters),
    [myRoadmaps, myExecutionFilters],
  );

  const sharedRoadmapCount = useMemo(() => countMyRoadmapsShared(myRoadmaps), [myRoadmaps]);
  const spaceLinkedRoadmapCount = useMemo(() => countMyRoadmapsWithSpaceLink(myRoadmaps), [myRoadmaps]);

  useEffect(() => {
    setRoadmapsPage(1);
  }, [myExecutionFilters]);

  const selectedRoadmap = useMemo(
    () => myRoadmaps.find((rm) => rm.id === selectedRoadmapId) ?? null,
    [myRoadmaps, selectedRoadmapId],
  );

  useEffect(() => {
    if (!selectedRoadmapId) return;
    if (!filteredMyRoadmaps.some(rm => rm.id === selectedRoadmapId)) {
      setSelectedRoadmapId(null);
    }
  }, [filteredMyRoadmaps, selectedRoadmapId]);

  const selectedSpace = useMemo(
    () => joinedSpaces.find((s) => s.id === selectedSpaceId) ?? null,
    [joinedSpaces, selectedSpaceId],
  );

  const spaceRoadmapsForSelected = useMemo(() => {
    if (!selectedSpace) return [];
    return allRoadmaps.filter((rm) => (rm.groupIds ?? []).includes(selectedSpace.id));
  }, [allRoadmaps, selectedSpace]);

  const roadmapEmptyTitle = String(LABELS.myRoadmapDetailEmptyTitle ?? LABELS.feedDetailEmptyTitle ?? '실행계획을 선택하세요');
  const roadmapEmptySub = String(
    LABELS.myRoadmapDetailEmptySub ?? LABELS.feedDetailEmptySub ?? '왼쪽 목록에서 항목을 선택하세요',
  );
  const spaceEmptyTitle = String(LABELS.mySpaceDetailEmptyTitle ?? LABELS.spaceDetailEmptyTitle ?? '그룹을 선택하세요');
  const spaceEmptySub = String(
    LABELS.mySpaceDetailEmptySub ?? LABELS.spaceDetailEmptySub ?? '왼쪽 목록에서 항목을 선택하세요',
  );

  const myHeaderTitleBlock = (
    <div>
      <h3 className="text-base font-bold text-white">{LABELS.myTitle}</h3>
      <p className="text-sm text-gray-500 mt-0.5">{LABELS.mySubtitle}</p>
    </div>
  );

  const mySubTabBar = (
    <div
      className="flex gap-2 p-1 rounded-xl"
      style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      {MY_SUB_TABS.map((tab) => {
        const isActive = subTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSubTab(tab.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-bold transition-all"
            style={
              isActive
                ? {
                    background: 'linear-gradient(135deg, #6C5CE7, #a855f7)',
                    color: '#fff',
                    boxShadow: '0 2px 12px rgba(108,92,231,0.3)',
                  }
                : { color: 'rgba(255,255,255,0.4)' }
            }
          >
            <Icon className="w-3.5 h-3.5" />
            {LABELS[tab.labelKey]}
          </button>
        );
      })}
    </div>
  );

  const spacesSummaryCardsBlock = (
    <div className="grid grid-cols-2 gap-2">
      {[
        { label: LABELS.myRoadmapsLabel, count: myRoadmaps.length, emoji: '🗺️', color: '#6C5CE7' },
        { label: LABELS.myGroupsLabel, count: joinedSpaces.length, emoji: '🤝', color: '#3B82F6' },
      ].map((card) => (
        <div
          key={card.label}
          className="flex flex-col items-center gap-1 py-4 rounded-xl"
          style={{ backgroundColor: `${card.color}08`, border: `1px solid ${card.color}20` }}
        >
          <span className="text-2xl">{card.emoji}</span>
          <span className="text-lg font-black text-white">{card.count}</span>
          <span className="text-sm text-gray-400">{card.label}</span>
        </div>
      ))}
    </div>
  );

  const roadmapsExecutionFilterBlock = (
    <DreamMateMyExecutionDashboardFilterBar
      totalMyRoadmaps={myRoadmaps.length}
      totalSharedRoadmaps={sharedRoadmapCount}
      totalRoadmapsLinkedToSpace={spaceLinkedRoadmapCount}
      totalJoinedSpaces={joinedSpaces.length}
      filters={myExecutionFilters}
      onChangeFilters={setMyExecutionFilters}
      labelAll={String(LABELS.myExecutionFilterAllLabel ?? LABELS.myRoadmapsLabel ?? '내 실행')}
      labelShared={String(LABELS.myExecutionFilterSharedLabel ?? '공개중')}
      labelSpace={String(LABELS.myExecutionFilterSpaceLinkedLabel ?? '실행팀 연결')}
      joinedSpacesNote={String(LABELS.myExecutionFilterJoinedSpacesNote ?? LABELS.myGroupsLabel ?? '참여 그룹')}
      helperApplyHint={String(LABELS.myExecutionFilterApplyHint ?? '')}
    />
  );

  const paginatedMyRoadmaps = useMemo(
    () =>
      filteredMyRoadmaps.slice(
        (roadmapsPage - 1) * DREAM_LIST_ITEMS_PER_PAGE,
        roadmapsPage * DREAM_LIST_ITEMS_PER_PAGE,
      ),
    [filteredMyRoadmaps, roadmapsPage],
  );

  const paginatedJoinedSpaces = useMemo(
    () =>
      joinedSpaces.slice(
        (spacesPage - 1) * DREAM_LIST_ITEMS_PER_PAGE,
        spacesPage * DREAM_LIST_ITEMS_PER_PAGE,
      ),
    [joinedSpaces, spacesPage],
  );

  const roadmapsListInner = (
    <div className="space-y-4 pb-4">
      {myHeaderTitleBlock}
      {roadmapsExecutionFilterBlock}
      {mySubTabBar}
      {myRoadmaps.length === 0 ? (
        <EmptyState emoji="🗺️" title={LABELS.myPlanEmptyTitle} desc={LABELS.myPlanEmptyDesc} />
      ) : filteredMyRoadmaps.length === 0 ? (
        <EmptyState
          emoji="🔎"
          title={String(LABELS.myExecutionFilterEmptyTitle ?? '조건에 맞는 실행계획이 없어요')}
          desc={String(LABELS.myExecutionFilterEmptyDesc ?? '필터를 바꿔 보세요')}
        />
      ) : (
        <>
          <div className="space-y-2">
            {paginatedMyRoadmaps.map((rm) => (
              <RoadmapListRow
                key={rm.id}
                roadmap={rm}
                isSelected={selectedRoadmapId === rm.id}
                onSelect={() => setSelectedRoadmapId(rm.id)}
              />
            ))}
          </div>
          <ListPagination
            totalItems={filteredMyRoadmaps.length}
            currentPage={roadmapsPage}
            onPageChange={setRoadmapsPage}
          />
        </>
      )}
    </div>
  );

  const spacesListInner = (
    <div className="space-y-4 pb-4">
      {myHeaderTitleBlock}
      {spacesSummaryCardsBlock}
      {mySubTabBar}
      {joinedSpaces.length === 0 ? (
        <EmptyState emoji="🤝" title="참여 중인 스페이스가 없어요" desc="스페이스 탭에서 참여해 보세요" />
      ) : (
        <>
          <div className="space-y-2">
            {paginatedJoinedSpaces.map((space) => (
              <SpaceCard
                key={space.id}
                space={space}
                roadmapCount={allRoadmaps.filter((rm) => (rm.groupIds ?? []).includes(space.id)).length}
                isJoined
                isSelected={selectedSpaceId === space.id}
                onOpen={() => setSelectedSpaceId(space.id)}
              />
            ))}
          </div>
          <ListPagination
            totalItems={joinedSpaces.length}
            currentPage={spacesPage}
            onPageChange={setSpacesPage}
          />
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-0 pb-28">
      {subTab === 'roadmaps' ? (
        <>
        <TwoColumnPanelLayout
          hasSelection={selectedRoadmap !== null}
          onClearSelection={() => setSelectedRoadmapId(null)}
          emptyPlaceholderText={roadmapEmptyTitle}
          emptyPlaceholderSubText={roadmapEmptySub}
          emptyPlaceholderIllustration="sparkles"
          detailPanelClassName="rounded-none"
          listSlot={<div className={listColumnShellClass} style={listColumnShellStyle}>{roadmapsListInner}</div>}
          detailSlot={
            selectedRoadmap ? (
              <DetailPanelScrollContainer scrollKey={selectedRoadmapId}>
                <RoadmapDetailDialog
                  variant="inline"
                  roadmap={selectedRoadmap}
                  isOwnedByCurrentUser
                  timelineDetailMode="status_readonly"
                  isReferenceViewOnlyMode={false}
                  availableSpaces={availableSpaces}
                  allowMutations={allowMutations}
                  allowProgressChecklistToggle={allowMutations}
                  onToggleTodoItem={(itemId, todoId) =>
                    onToggleRoadmapTodoItem(selectedRoadmap.id, itemId, todoId)
                  }
                  onClose={() => setSelectedRoadmapId(null)}
                  onExpand={() => setShowRoadmapExpandDialog(true)}
                  onUseRoadmap={() => {}}
                  onShare={() => onRequestShareRoadmap(selectedRoadmap)}
                  onEdit={() => {
                    onEditRoadmap(selectedRoadmap.id);
                    setSelectedRoadmapId(null);
                  }}
                  onDelete={() => {
                    onDeleteRoadmap(selectedRoadmap.id);
                    setSelectedRoadmapId(null);
                  }}
                  onShareRoadmap={(channels, spaceIds) => onShareRoadmap(selectedRoadmap.id, channels, spaceIds)}
                  onReportRoadmap={(reasonId, detail) => onReportRoadmap(selectedRoadmap.id, reasonId, detail)}
                  onCreateComment={(comment, parentId) =>
                    onCreateRoadmapComment(selectedRoadmap.id, comment, parentId)
                  }
                />
              </DetailPanelScrollContainer>
            ) : null
          }
        />

        {showRoadmapExpandDialog && selectedRoadmap && (
          <RoadmapDetailDialog
            variant="dialog"
            roadmap={selectedRoadmap}
            isOwnedByCurrentUser
            timelineDetailMode="status_readonly"
            isReferenceViewOnlyMode={false}
            availableSpaces={availableSpaces}
            allowMutations={allowMutations}
            allowProgressChecklistToggle={allowMutations}
            onToggleTodoItem={(itemId, todoId) =>
              onToggleRoadmapTodoItem(selectedRoadmap.id, itemId, todoId)
            }
            onClose={() => setShowRoadmapExpandDialog(false)}
            onUseRoadmap={() => {}}
            onShare={() => {
              onRequestShareRoadmap(selectedRoadmap);
              setShowRoadmapExpandDialog(false);
            }}
            onEdit={() => {
              onEditRoadmap(selectedRoadmap.id);
              setShowRoadmapExpandDialog(false);
              setSelectedRoadmapId(null);
            }}
            onDelete={() => {
              onDeleteRoadmap(selectedRoadmap.id);
              setShowRoadmapExpandDialog(false);
              setSelectedRoadmapId(null);
            }}
            onShareRoadmap={(channels, spaceIds) => onShareRoadmap(selectedRoadmap.id, channels, spaceIds)}
            onReportRoadmap={(reasonId, detail) => onReportRoadmap(selectedRoadmap.id, reasonId, detail)}
            onCreateComment={(comment, parentId) =>
              onCreateRoadmapComment(selectedRoadmap.id, comment, parentId)
            }
          />
        )}
        </>
      ) : (
        <TwoColumnPanelLayout
          hasSelection={selectedSpace !== null}
          onClearSelection={() => setSelectedSpaceId(null)}
          emptyPlaceholderText={spaceEmptyTitle}
          emptyPlaceholderSubText={spaceEmptySub}
          emptyPlaceholderIllustration="sparkles"
          detailPanelClassName="rounded-none"
          listSlot={<div className={listColumnShellClass} style={listColumnShellStyle}>{spacesListInner}</div>}
          detailSlot={
            selectedSpace ? (
              <DetailPanelScrollContainer scrollKey={selectedSpaceId}>
                <SpaceDetailView
                  layoutVariant="sidePanel"
                  currentUserId={currentUserId}
                  space={selectedSpace}
                  roadmaps={spaceRoadmapsForSelected}
                  isJoined
                  likedIds={likedIds}
                  bookmarkedIds={bookmarkedIds}
                  likeCounts={likeCounts}
                  bookmarkCounts={bookmarkCounts}
                  onToggleLike={onToggleLike}
                  onToggleBookmark={onToggleBookmark}
                  onViewRoadmapDetail={(rm) => {
                    const isMine = myRoadmaps.some((r) => r.id === rm.id);
                    if (isMine) {
                      setSubTab('roadmaps');
                      setSelectedSpaceId(null);
                      setSelectedRoadmapId(rm.id);
                      return;
                    }
                    router.push(`/dreammate/roadmap/${rm.id}`);
                  }}
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
      )}
    </div>
  );
}

function EmptyState({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
      <span className="text-4xl">{emoji}</span>
      <div>
        <p className="text-sm font-bold text-white">{title}</p>
        <p className="text-sm text-gray-400 mt-1">{desc}</p>
      </div>
    </div>
  );
}
