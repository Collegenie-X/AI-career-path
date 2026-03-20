'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { DREAM_TABS, LABELS } from './config';
import type { DreamTabId, PeriodType, SharedRoadmap } from './types';
import { RoadmapFeedTab } from './components/RoadmapFeedTab';
import { DreamLibraryTab } from './components/DreamLibraryTab';
import { DreamSpaceTab } from './components/DreamSpaceTab';
import { MyDreamMateTab } from './components/MyDreamMateTab';
import { RoadmapEditorDialog } from './components/RoadmapEditorDialog';
import { RoadmapDetailDialog } from './components/RoadmapDetailDialog';
import { RoadmapShareDialog } from './components/RoadmapShareDialog';
import { DreamMateHeroBanner } from './components/DreamMateHeroBanner';
import { useDreamMateWorkspaceContext } from './DreamMateWorkspaceProvider';
import { GroupedTabSelector } from './components/GroupedTabSelector';
import { getShareChannelsFromRoadmap } from './types';

/* ─── Star background ─── */
function StarField() {
  const stars = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: ((i * 149.3) % 100),
    y: ((i * 79.7) % 100),
    size: (i % 3) + 1,
    delay: (i * 0.35) % 3,
    dur: 2 + (i % 3),
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {stars.map(s => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.x}%`, top: `${s.y}%`,
            width: s.size, height: s.size, opacity: 0.15,
            animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Main page content ─── */
function DreamMatePageContent() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<DreamTabId>('feed');
  const [selectedRoadmapOpenedFromTab, setSelectedRoadmapOpenedFromTab] = useState<DreamTabId | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);

  const workspace = useDreamMateWorkspaceContext();

  useEffect(() => {
    setMounted(true);
    const tabParam = searchParams.get('tab') as DreamTabId | null;
    const editParam = searchParams.get('edit');
    if (tabParam && DREAM_TABS.some(t => t.id === tabParam)) {
      setActiveTab(tabParam);
    }
    if (editParam && typeof editParam === 'string' && editParam.trim()) {
      workspace.setEditingRoadmapId(editParam.trim());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- workspace.setEditingRoadmapId is stable
  }, [searchParams]);

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden w-full" style={{ backgroundColor: '#0a0a1e' }}>
      <StarField />

      {/* Page header — career와 동일 web-container */}
      <div
        className="sticky top-0 z-20"
        style={{ backgroundColor: 'rgba(10,10,30,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="web-container py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-black bg-gradient-to-r from-white via-purple-200 to-indigo-300 bg-clip-text text-transparent">
                {LABELS.pageTitle}
              </h1>
              <p className="text-sm text-gray-500">{LABELS.pageSubtitle}</p>
            </div>
          </div>

          <GroupedTabSelector
            groupLabel={LABELS.pageTitle}
            value={activeTab}
            options={DREAM_TABS}
            onChange={setActiveTab}
            containerClassName="pb-0 mb-3"
          />
        </div>
      </div>

      {/* Tab content — career와 동일 web-container + border 프레임 */}
      <div className="web-container relative z-10 py-4 md:py-6">
        <div
          className="rounded-none border border-t-0 border-x border-b overflow-hidden"
          style={{
            borderColor: 'rgba(255,255,255,0.12)',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
            boxShadow: '0 18px 50px rgba(0,0,0,0.4)',
          }}
        >
          <DreamMateHeroBanner
            activeTab={activeTab}
            onCreateRoadmap={() => workspace.setShowCreateRoadmapDialog(true)}
            onCreateSpace={() => {}}
            onUploadResource={() => {}}
            totalRoadmaps={workspace.visibleRoadmaps.length}
            totalMyRoadmaps={workspace.myRoadmaps.length}
            totalMySharedRoadmaps={workspace.myRoadmaps.filter((rm) => (rm.shareChannels ?? []).length > 0).length}
            totalBookmarkedRoadmaps={workspace.visibleRoadmaps.filter((rm) => workspace.reactions.bookmarkedRoadmapIds.includes(rm.id)).length}
            totalSpaces={workspace.spaces.length}
            totalJoinedSpaces={workspace.joinedSpaces.length}
            totalResources={workspace.resources.length}
          />
          <div className="px-4 pb-4 md:px-5 md:pb-5">
            {!mounted ? null : activeTab === 'feed' ? (
              <RoadmapFeedTab
                roadmaps={workspace.visibleRoadmaps}
                currentUserId={workspace.currentUserId}
                bookmarkedIds={workspace.reactions.bookmarkedRoadmapIds}
                onCreateRoadmap={() => workspace.setShowCreateRoadmapDialog(true)}
                availableSpaces={workspace.joinedSpaces}
                detailCallbacks={{
                  onUseRoadmap: (roadmap) => {
                    workspace.handleUseRoadmap(roadmap);
                    setActiveTab('my');
                  },
                  onEdit: (roadmap) => {
                    workspace.setEditingRoadmapId(roadmap.id);
                  },
                  onShare: (roadmap) => {
                    workspace.setSelectedRoadmapId(roadmap.id);
                    setShowShareDialog(true);
                  },
                  onDelete: (roadmap) => {
                    workspace.handleDeleteRoadmap(roadmap.id);
                  },
                  onShareRoadmap: (roadmap, channels, spaceIds) => {
                    workspace.handleShareRoadmap(roadmap.id, channels, spaceIds);
                  },
                  onReportRoadmap: (roadmap, reasonId, detail) => {
                    workspace.handleReportRoadmap(roadmap.id, reasonId, detail);
                  },
                  onCreateComment: (roadmap, comment, parentId) => {
                    workspace.handleCreateRoadmapComment(roadmap.id, comment, parentId);
                  },
                  onToggleTodoItem: (roadmap, itemId, todoId) => {
                    workspace.handleToggleTodoItem(roadmap.id, itemId, todoId);
                  },
                }}
                onTabChange={(tabId) => setActiveTab(tabId as DreamTabId)}
              />
            ) : activeTab === 'library' ? (
              <DreamLibraryTab
                currentUserId={workspace.currentUserId}
                resources={workspace.resources}
                resourceCommentsByResourceId={workspace.resourceCommentsByResourceId}
                likedResourceIds={workspace.reactions.likedResourceIds}
                bookmarkedResourceIds={workspace.reactions.bookmarkedResourceIds}
                onToggleLikeResource={workspace.handleToggleLikeResource}
                onToggleBookmarkResource={workspace.handleToggleBookmarkResource}
                onCreateResource={workspace.handleCreateResource}
                onUpdateResource={workspace.handleUpdateResource}
                onDeleteResource={workspace.handleDeleteResource}
                onCreateResourceComment={workspace.handleCreateResourceComment}
                onReportResource={workspace.handleReportResource}
              />
            ) : activeTab === 'space' ? (
              <DreamSpaceTab
                currentUserId={workspace.currentUserId}
                spaces={workspace.spaces}
                roadmaps={workspace.roadmaps}
                joinedSpaceIds={workspace.joinedSpaceIds}
                initialSelectedSpaceId={workspace.pendingSpaceIdFromMyTab}
                likedIds={workspace.reactions.likedRoadmapIds}
                bookmarkedIds={workspace.reactions.bookmarkedRoadmapIds}
                likeCounts={workspace.roadmapLikeCounts}
                bookmarkCounts={workspace.roadmapBookmarkCounts}
                onToggleLike={workspace.handleToggleRoadmapLike}
                onToggleBookmark={workspace.handleToggleRoadmapBookmark}
                onViewRoadmapDetail={(roadmap) => {
                  setSelectedRoadmapOpenedFromTab('space');
                  workspace.setSelectedRoadmapId(roadmap.id);
                }}
                onJoinSpace={workspace.handleJoinSpace}
                onLeaveSpace={workspace.handleLeaveSpace}
                onCreateSpace={workspace.handleCreateSpace}
                onToggleSpaceRecruitmentStatus={workspace.handleToggleSpaceRecruitmentStatus}
                onCreateSpaceNotice={workspace.handleCreateSpaceNotice}
              />
            ) : activeTab === 'my' ? (
              <MyDreamMateTab
                myRoadmaps={workspace.myRoadmaps}
                allRoadmaps={workspace.roadmaps}
                joinedSpaces={workspace.joinedSpaces}
                currentUserId={workspace.currentUserId}
                availableSpaces={workspace.joinedSpaces}
                likedIds={workspace.reactions.likedRoadmapIds}
                bookmarkedIds={workspace.reactions.bookmarkedRoadmapIds}
                likeCounts={workspace.roadmapLikeCounts}
                bookmarkCounts={workspace.roadmapBookmarkCounts}
                onToggleLike={workspace.handleToggleRoadmapLike}
                onToggleBookmark={workspace.handleToggleRoadmapBookmark}
                onCreateRoadmap={() => workspace.setShowCreateRoadmapDialog(true)}
                onEditRoadmap={(roadmapId) => workspace.setEditingRoadmapId(roadmapId)}
                onDeleteRoadmap={(roadmapId) => workspace.handleDeleteRoadmap(roadmapId)}
                onRequestShareRoadmap={(roadmap) => {
                  setSelectedRoadmapOpenedFromTab('my');
                  workspace.setSelectedRoadmapId(roadmap.id);
                  setShowShareDialog(true);
                }}
                onShareRoadmap={(roadmapId, channels, spaceIds) =>
                  workspace.handleShareRoadmap(roadmapId, channels, spaceIds)
                }
                onReportRoadmap={(roadmapId, reasonId, detail) =>
                  workspace.handleReportRoadmap(roadmapId, reasonId, detail)
                }
                onCreateRoadmapComment={(roadmapId, comment, parentId) =>
                  workspace.handleCreateRoadmapComment(roadmapId, comment, parentId)
                }
                onToggleTodoItem={(roadmapId, itemId, todoId) =>
                  workspace.handleToggleTodoItem(roadmapId, itemId, todoId)
                }
                onLeaveSpace={workspace.handleLeaveSpace}
                onToggleSpaceRecruitmentStatus={workspace.handleToggleSpaceRecruitmentStatus}
                onCreateSpaceNotice={workspace.handleCreateSpaceNotice}
              />
            ) : null}
          </div>
        </div>
      </div>

      {workspace.showCreateRoadmapDialog && (
        <RoadmapEditorDialog
          title={LABELS.createRoadmapButton}
          submitLabel={LABELS.createRoadmapButton}
          initialValues={{
            title: '',
            description: '',
            period: 'semester' as PeriodType,
            starColor: '#6C5CE7',
            focusItemTypes: ['award', 'activity', 'project', 'paper'],
            milestoneResults: [],
            finalResultTitle: '',
            finalResultDescription: '',
            finalResultUrl: '',
            finalResultImageUrl: '',
            groupIds: [],
            items: [],
          }}
          onClose={() => workspace.setShowCreateRoadmapDialog(false)}
          onSubmit={workspace.handleCreateRoadmap}
        />
      )}

      {workspace.editingRoadmap && (
        <RoadmapEditorDialog
          title="실행계획 수정하기"
          submitLabel="수정 완료"
          initialValues={{
            title: workspace.editingRoadmap.title,
            description: workspace.editingRoadmap.description,
            period: workspace.editingRoadmap.period,
            starColor: workspace.editingRoadmap.starColor,
            focusItemTypes: workspace.editingRoadmap.focusItemTypes ?? ['award', 'activity', 'project', 'paper'],
            milestoneResults: workspace.editingRoadmap.milestoneResults ?? [],
            finalResultTitle: workspace.editingRoadmap.finalResultTitle ?? '',
            finalResultDescription: workspace.editingRoadmap.finalResultDescription ?? '',
            finalResultUrl: workspace.editingRoadmap.finalResultUrl ?? '',
            finalResultImageUrl: workspace.editingRoadmap.finalResultImageUrl ?? '',
            groupIds: workspace.editingRoadmap.groupIds,
            items: workspace.editingRoadmap.items,
          }}
          onClose={() => workspace.setEditingRoadmapId(null)}
          onSubmit={(payload) => workspace.handleUpdateRoadmap(workspace.editingRoadmap!.id, payload)}
        />
      )}

      {workspace.selectedRoadmap && !showShareDialog && selectedRoadmapOpenedFromTab !== 'feed' && selectedRoadmapOpenedFromTab !== 'my' && (
        <RoadmapDetailDialog
          roadmap={workspace.selectedRoadmap}
          isOwnedByCurrentUser={workspace.selectedRoadmap.ownerId === workspace.currentUserId}
          isReferenceViewOnlyMode={selectedRoadmapOpenedFromTab === 'space'}
          isFeedDetailView={selectedRoadmapOpenedFromTab === 'feed'}
          availableSpaces={workspace.joinedSpaces}
          onClose={() => {
            workspace.setSelectedRoadmapId(null);
            setSelectedRoadmapOpenedFromTab(null);
          }}
          onUseRoadmap={() => {
            setSelectedRoadmapOpenedFromTab('my');
            workspace.handleUseRoadmap(workspace.selectedRoadmap!);
            setActiveTab('my');
          }}
          onEdit={() => {
            workspace.setEditingRoadmapId(workspace.selectedRoadmap!.id);
            workspace.setSelectedRoadmapId(null);
            setSelectedRoadmapOpenedFromTab(null);
          }}
          onShare={() => {
            setShowShareDialog(true);
          }}
          onDelete={() => {
            workspace.handleDeleteRoadmap(workspace.selectedRoadmap!.id);
            setSelectedRoadmapOpenedFromTab(null);
          }}
          onShareRoadmap={(shareChannels, selectedSpaceIds) => {
            workspace.handleShareRoadmap(workspace.selectedRoadmap!.id, shareChannels, selectedSpaceIds);
          }}
          onReportRoadmap={(reasonId, detail) => {
            workspace.handleReportRoadmap(workspace.selectedRoadmap!.id, reasonId, detail);
          }}
          onCreateComment={(comment, parentId) => workspace.handleCreateRoadmapComment(workspace.selectedRoadmap!.id, comment, parentId)}
          showTimelineProgressBars={selectedRoadmapOpenedFromTab !== 'feed'}
          onToggleTodoItem={(itemId, todoId) => workspace.handleToggleTodoItem(workspace.selectedRoadmap!.id, itemId, todoId)}
        />
      )}

      {showShareDialog && workspace.selectedRoadmap && (
        <RoadmapShareDialog
          currentShareChannels={getShareChannelsFromRoadmap(workspace.selectedRoadmap)}
          currentSpaceIds={workspace.selectedRoadmap.groupIds ?? []}
          spaces={workspace.joinedSpaces}
          canSharePublicly={(() => {
            const roadmap = workspace.selectedRoadmap;
            const hasFinalResultAsset = Boolean(roadmap.finalResultUrl?.trim() || roadmap.finalResultImageUrl?.trim());
            const hasMilestoneAsset = (roadmap.milestoneResults ?? []).some(result =>
              Boolean(result.resultUrl?.trim() || result.imageUrl?.trim()),
            );
            return hasFinalResultAsset || hasMilestoneAsset;
          })()}
          onClose={() => {
            setShowShareDialog(false);
            if (selectedRoadmapOpenedFromTab === 'my') {
              workspace.setSelectedRoadmapId(null);
              setSelectedRoadmapOpenedFromTab(null);
            }
          }}
          onSave={(shareChannels, selectedSpaceIds) => {
            workspace.handleShareRoadmap(workspace.selectedRoadmap!.id, shareChannels, selectedSpaceIds);
            setShowShareDialog(false);
            if (selectedRoadmapOpenedFromTab === 'my') {
              workspace.setSelectedRoadmapId(null);
              setSelectedRoadmapOpenedFromTab(null);
            }
          }}
        />
      )}

    </div>
  );
}

export default function DreamMatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center" style={{ backgroundColor: '#0a0a1e' }}>
          <Sparkles className="w-6 h-6 animate-pulse" style={{ color: '#6C5CE7' }} />
        </div>
      }
    >
      <DreamMatePageContent />
    </Suspense>
  );
}
