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
import { getShareChannelsFromRoadmap } from './types';
import { StickySectionPageHeader } from '@/components/section-shell/StickySectionPageHeader';
import { GradientSegmentedTabBar } from '@/components/section-shell/GradientSegmentedTabBar';
import { SECTION_SHELL_FRAME_STYLE, SECTION_SHELL_TAB_NAVIGATION_AREA_CLASS_NAME, SECTION_SHELL_TAB_NAVIGATION_AREA_STYLE } from '@/components/section-shell/section-shell-layout.constants';

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
  const [showLibraryCreateDialog, setShowLibraryCreateDialog] = useState(false);

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
    <div className="min-h-screen pb-24 relative overflow-hidden w-full" style={{ backgroundColor: 'rgb(var(--background))' }}>
      <StarField />

      <StickySectionPageHeader
        title={LABELS.pageTitle}
        subtitlePill={LABELS.pageSubtitle}
        rightSlot={
          <div
            className="hidden items-center gap-2 rounded-2xl border px-4 py-2 md:flex"
            style={{
              background: 'linear-gradient(135deg, rgba(108,92,231,0.2), rgba(15,23,42,0.6))',
              borderColor: 'rgba(108,92,231,0.4)',
            }}
          >
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span className="text-[13px] font-bold text-purple-300">{LABELS.pageHeaderTrailingBadge}</span>
          </div>
        }
      />

      {/* Tab + 히어로 + 본문 — 경험·패스와 동일 셸 */}
      <div className="web-container relative z-10 py-4 md:py-6">
        <div className="rounded-none border border-t-0 border-x border-b overflow-hidden" style={SECTION_SHELL_FRAME_STYLE}>
          <div
            className={SECTION_SHELL_TAB_NAVIGATION_AREA_CLASS_NAME}
            style={SECTION_SHELL_TAB_NAVIGATION_AREA_STYLE}
          >
            <GradientSegmentedTabBar
              tabs={DREAM_TABS.map((tab) => ({ id: tab.id, label: tab.label, emoji: tab.emoji }))}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              embeddedInSectionShell
              ariaLabel="드림 실행 탭 전환"
            />
          </div>
          <DreamMateHeroBanner
            activeTab={activeTab}
            onCreateRoadmap={() => workspace.setShowCreateRoadmapDialog(true)}
            onCreateSpace={() => {}}
            onUploadResource={() => setShowLibraryCreateDialog(true)}
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
                openCreateDialog={showLibraryCreateDialog}
                onOpenCreateDialogDismiss={() => setShowLibraryCreateDialog(false)}
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
          timelineDetailMode="status_readonly"
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
        <div className="min-h-screen w-full flex items-center justify-center" style={{ backgroundColor: 'rgb(var(--background))' }}>
          <Sparkles className="w-6 h-6 animate-pulse" style={{ color: '#6C5CE7' }} />
        </div>
      }
    >
      <DreamMatePageContent />
    </Suspense>
  );
}
