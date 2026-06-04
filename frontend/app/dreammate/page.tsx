'use client';

import { useCallback, useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { DREAM_TABS, LABELS } from './config';
import type { DreamTabId, PeriodType, SharedRoadmap } from './types';
import { RoadmapFeedTab } from './components/RoadmapFeedTab';
import { DreamLibraryTab } from './components/DreamLibraryTab';
import { DreamSpaceTab } from './components/DreamSpaceTab';
import { MyDreamMateTab } from './components/MyDreamMateTab';
import { PortfolioTab } from './components/PortfolioTab';
import { PortfolioReportDialog } from './components/PortfolioReportDialog';
import { RoadmapEditorDialog } from './components/RoadmapEditorDialog';
import { ExecutionWizardDialog } from './components/ExecutionWizardDialog';
import { ProjectBuilderDialog } from './build/ProjectBuilderDialog';
import { getTrackForRoadmap, type TrackId } from './build/tracks';
import { RoadmapDetailDialog } from './components/RoadmapDetailDialog';
import { RoadmapShareDialog } from './components/RoadmapShareDialog';
import { DreamMateHeroBanner } from './components/DreamMateHeroBanner';
import { useDreamMateWorkspaceContext } from './DreamMateWorkspaceProvider';
import { getShareChannelsFromRoadmap } from './types';
import { getCanSelectPublicShareForRoadmap } from './utils/roadmapPublicShareEligibility';
import { GradientSegmentedTabBar } from '@/components/section-shell/GradientSegmentedTabBar';
import {
  SECTION_SHELL_FRAME_STYLE,
  SECTION_SHELL_TAB_NAVIGATION_AREA_CLASS_NAME_FLUSH_RIGHT,
  SECTION_SHELL_TAB_NAVIGATION_AREA_STYLE,
} from '@/components/section-shell/section-shell-layout.constants';

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
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<DreamTabId>('feed');
  const [selectedRoadmapOpenedFromTab, setSelectedRoadmapOpenedFromTab] = useState<DreamTabId | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showLibraryCreateDialog, setShowLibraryCreateDialog] = useState(false);
  const [showSpaceCreateDialog, setShowSpaceCreateDialog] = useState(false);
  const [portfolioReportRoadmapId, setPortfolioReportRoadmapId] = useState<string | null>(null);
  /** 빌더 다이얼로그 — null이면 닫힘. 트랙(project/paper)·모드·수정 대상 id */
  const [builderState, setBuilderState] = useState<{ mode: 'create' | 'edit'; trackId: TrackId; roadmapId: string | null } | null>(null);
  /** "처음부터 직접 만들기" — 저장 전 에디터 표시 (제출 시에만 생성) */
  const [showBlankCreateDialog, setShowBlankCreateDialog] = useState(false);

  const workspace = useDreamMateWorkspaceContext();

  /** localStorage 모드: 로그인 없이 누구나 생성·수정·삭제 가능 */
  const canMutate = mounted;

  const requireAuthForMutation = useCallback((): boolean => {
    return true;
  }, []);

  /** URL 쿼리 동기화 — 새로고침·공유 시 같은 화면이 복원되도록 */
  const updateUrlParams = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === '') params.delete(key);
      else params.set(key, value);
    }
    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  }, [router, pathname, searchParams]);

  /** 탭 전환 + URL 반영 */
  const changeTab = useCallback((tabId: DreamTabId) => {
    setActiveTab(tabId);
    updateUrlParams({ tab: tabId });
  }, [updateUrlParams]);

  /** 포트폴리오 결과 리포트 열기/닫기 + URL 반영 (공유용) */
  const openPortfolioReport = useCallback((roadmapId: string) => {
    setPortfolioReportRoadmapId(roadmapId);
    updateUrlParams({ report: roadmapId });
  }, [updateUrlParams]);

  const closePortfolioReport = useCallback(() => {
    setPortfolioReportRoadmapId(null);
    updateUrlParams({ report: null });
  }, [updateUrlParams]);

  useEffect(() => {
    setMounted(true);
    const tabParam = searchParams.get('tab') as DreamTabId | null;
    const editParam = searchParams.get('edit');
    const reportParam = searchParams.get('report');
    if (tabParam && DREAM_TABS.some(t => t.id === tabParam)) {
      setActiveTab(tabParam);
    }
    if (editParam && typeof editParam === 'string' && editParam.trim()) {
      workspace.setEditingRoadmapId(editParam.trim());
    }
    if (reportParam && reportParam.trim()) {
      setPortfolioReportRoadmapId(reportParam.trim());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- workspace.setEditingRoadmapId is stable
  }, [searchParams]);

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden w-full" style={{ backgroundColor: 'rgb(var(--background))' }}>
      <StarField />

      {/* Tab + 히어로 + 본문 — 경험·패스와 동일 셸 */}
      <div className="web-container relative z-10 py-4 md:py-6">
        <div className="rounded-none border border-t-0 border-x border-b overflow-hidden" style={SECTION_SHELL_FRAME_STYLE}>
          <div
            className={SECTION_SHELL_TAB_NAVIGATION_AREA_CLASS_NAME_FLUSH_RIGHT}
            style={SECTION_SHELL_TAB_NAVIGATION_AREA_STYLE}
          >
            <GradientSegmentedTabBar
              tabs={DREAM_TABS.map((tab) => ({ id: tab.id, label: tab.label, emoji: tab.emoji }))}
              activeTab={activeTab}
              onTabChange={changeTab}
              embeddedInSectionShell
              compact
              ariaLabel="커리어 실행 탭 전환"
            />
          </div>
          <DreamMateHeroBanner
            activeTab={activeTab}
            statsReady={mounted}
            allowMutations={canMutate}
            onCreateRoadmap={() => {
              if (!requireAuthForMutation()) return;
              workspace.setShowCreateRoadmapDialog(true);
            }}
            onCreateSpace={() => {
              if (!requireAuthForMutation()) return;
              setShowSpaceCreateDialog(true);
            }}
            onUploadResource={() => {
              if (!requireAuthForMutation()) return;
              setShowLibraryCreateDialog(true);
            }}
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
                allowMutations={canMutate}
                onCreateRoadmap={() => {
                  if (!requireAuthForMutation()) return;
                  workspace.setShowCreateRoadmapDialog(true);
                }}
                availableSpaces={workspace.joinedSpaces}
                detailCallbacks={{
                  onUseRoadmap: (roadmap) => {
                    if (!requireAuthForMutation()) return;
                    workspace.handleUseRoadmap(roadmap);
                    changeTab('my');
                  },
                  onEdit: (roadmap) => {
                    if (!requireAuthForMutation()) return;
                    workspace.setEditingRoadmapId(roadmap.id);
                  },
                  onShare: (roadmap) => {
                    if (!requireAuthForMutation()) return;
                    workspace.setSelectedRoadmapId(roadmap.id);
                    setShowShareDialog(true);
                  },
                  onDelete: (roadmap) => {
                    if (!requireAuthForMutation()) return;
                    workspace.handleDeleteRoadmap(roadmap.id);
                  },
                  onShareRoadmap: (roadmap, channels, spaceIds) => {
                    if (!requireAuthForMutation()) return;
                    workspace.handleShareRoadmap(roadmap.id, channels, spaceIds);
                  },
                  onReportRoadmap: (roadmap, reasonId, detail) => {
                    workspace.handleReportRoadmap(roadmap.id, reasonId, detail);
                  },
                  onCreateComment: (roadmap, comment, parentId) => {
                    workspace.handleCreateRoadmapComment(roadmap.id, comment, parentId);
                  },
                }}
                onTabChange={(tabId) => changeTab(tabId as DreamTabId)}
              />
            ) : activeTab === 'library' ? (
              <DreamLibraryTab
                allowMutations={canMutate}
                currentUserId={workspace.currentUserId}
                resources={workspace.resources}
                resourceCommentsByResourceId={workspace.resourceCommentsByResourceId}
                likedResourceIds={workspace.reactions.likedResourceIds}
                bookmarkedResourceIds={workspace.reactions.bookmarkedResourceIds}
                onToggleLikeResource={workspace.handleToggleLikeResource}
                onToggleBookmarkResource={workspace.handleToggleBookmarkResource}
                onCreateResource={(payload) => {
                  if (!requireAuthForMutation()) return;
                  workspace.handleCreateResource(payload);
                }}
                onUpdateResource={(resourceId, payload) => {
                  if (!requireAuthForMutation()) return;
                  workspace.handleUpdateResource(resourceId, payload);
                }}
                onDeleteResource={(resourceId) => {
                  if (!requireAuthForMutation()) return;
                  workspace.handleDeleteResource(resourceId);
                }}
                onCreateResourceComment={workspace.handleCreateResourceComment}
                onReportResource={workspace.handleReportResource}
                openCreateDialog={showLibraryCreateDialog}
                onOpenCreateDialogDismiss={() => setShowLibraryCreateDialog(false)}
              />
            ) : activeTab === 'space' ? (
              <DreamSpaceTab
                allowMutations={canMutate}
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
                onCreateSpace={(payload) => {
                  if (!requireAuthForMutation()) return;
                  workspace.handleCreateSpace(payload);
                }}
                onToggleSpaceRecruitmentStatus={workspace.handleToggleSpaceRecruitmentStatus}
                onCreateSpaceNotice={workspace.handleCreateSpaceNotice}
                openCreateDialog={showSpaceCreateDialog}
                onOpenCreateDialogDismiss={() => setShowSpaceCreateDialog(false)}
              />
            ) : activeTab === 'my' ? (
              <MyDreamMateTab
                allowMutations={canMutate}
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
                onCreateRoadmap={() => {
                  if (!requireAuthForMutation()) return;
                  workspace.setShowCreateRoadmapDialog(true);
                }}
                onEditRoadmap={(roadmapId) => {
                  if (!requireAuthForMutation()) return;
                  workspace.setEditingRoadmapId(roadmapId);
                }}
                onDeleteRoadmap={(roadmapId) => {
                  if (!requireAuthForMutation()) return;
                  workspace.handleDeleteRoadmap(roadmapId);
                }}
                onRequestShareRoadmap={(roadmap) => {
                  if (!requireAuthForMutation()) return;
                  setSelectedRoadmapOpenedFromTab('my');
                  workspace.setSelectedRoadmapId(roadmap.id);
                  setShowShareDialog(true);
                }}
                onShareRoadmap={(roadmapId, channels, spaceIds) => {
                  if (!requireAuthForMutation()) return;
                  workspace.handleShareRoadmap(roadmapId, channels, spaceIds);
                }}
                onReportRoadmap={(roadmapId, reasonId, detail) =>
                  workspace.handleReportRoadmap(roadmapId, reasonId, detail)
                }
                onCreateRoadmapComment={(roadmapId, comment, parentId) =>
                  workspace.handleCreateRoadmapComment(roadmapId, comment, parentId)
                }
                onLeaveSpace={workspace.handleLeaveSpace}
                onToggleSpaceRecruitmentStatus={workspace.handleToggleSpaceRecruitmentStatus}
                onCreateSpaceNotice={workspace.handleCreateSpaceNotice}
                onToggleRoadmapTodoItem={(roadmapId, itemId, todoId) => {
                  if (!requireAuthForMutation()) return;
                  workspace.handleToggleTodoItem(roadmapId, itemId, todoId);
                }}
              />
            ) : activeTab === 'portfolio' ? (
              <PortfolioTab
                myRoadmaps={workspace.myRoadmaps}
                allowMutations={canMutate}
                onOpenReport={(roadmap) => openPortfolioReport(roadmap.id)}
                onCreateRoadmap={() => {
                  if (!requireAuthForMutation()) return;
                  workspace.setShowCreateRoadmapDialog(true);
                }}
              />
            ) : null}
          </div>
        </div>
      </div>

      {canMutate && workspace.showCreateRoadmapDialog && (
        <ExecutionWizardDialog
          onClose={() => workspace.setShowCreateRoadmapDialog(false)}
          onSubmit={(payload) => {
            if (!requireAuthForMutation()) return;
            workspace.handleCreateRoadmap(payload);
          }}
          onStartBlank={() => {
            if (!requireAuthForMutation()) return;
            workspace.setShowCreateRoadmapDialog(false);
            setShowBlankCreateDialog(true);
          }}
          onOpenBuilder={(trackId) => {
            if (!requireAuthForMutation()) return;
            workspace.setShowCreateRoadmapDialog(false);
            setBuilderState({ mode: 'create', trackId, roadmapId: null });
          }}
        />
      )}

      {canMutate && showBlankCreateDialog && (
        <RoadmapEditorDialog
          title="실행계획 만들기"
          submitLabel="만들기 완료"
          initialValues={{
            title: '',
            description: '',
            period: 'semester',
            starColor: '#6C5CE7',
            focusItemTypes: ['project'],
            milestoneResults: [],
            finalResultTitle: '',
            finalResultDescription: '',
            finalResultUrl: '',
            finalResultImageUrl: '',
            groupIds: [],
            items: [],
          }}
          onClose={() => setShowBlankCreateDialog(false)}
          onBack={() => {
            setShowBlankCreateDialog(false);
            workspace.setShowCreateRoadmapDialog(true);
          }}
          onSubmit={(payload) => {
            if (!requireAuthForMutation()) return;
            workspace.handleCreateRoadmap(payload);
            setShowBlankCreateDialog(false);
            changeTab('my');
          }}
        />
      )}

      {canMutate && workspace.editingRoadmap && (
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
          onBack={() => {
            workspace.setEditingRoadmapId(null);
            workspace.setShowCreateRoadmapDialog(true);
          }}
          onSubmit={(payload) => {
            if (!requireAuthForMutation()) return;
            workspace.handleUpdateRoadmap(workspace.editingRoadmap!.id, payload);
          }}
          onOpenBuilder={() => {
            if (!requireAuthForMutation()) return;
            const roadmap = workspace.editingRoadmap!;
            workspace.setEditingRoadmapId(null);
            setBuilderState({ mode: 'edit', trackId: getTrackForRoadmap(roadmap).id, roadmapId: roadmap.id });
          }}
        />
      )}

      {canMutate && builderState && (
        <ProjectBuilderDialog
          mode={builderState.mode}
          trackId={builderState.trackId}
          initialRoadmap={builderState.roadmapId ? workspace.roadmaps.find((r) => r.id === builderState.roadmapId) ?? null : null}
          onClose={() => setBuilderState(null)}
          onBack={() => {
            if (builderState.mode === 'edit' && builderState.roadmapId) {
              workspace.setEditingRoadmapId(builderState.roadmapId);
            } else {
              workspace.setShowCreateRoadmapDialog(true);
            }
            setBuilderState(null);
          }}
          onCreate={(payload) => {
            if (!requireAuthForMutation()) return;
            workspace.handleCreateRoadmap(payload);
            changeTab('my');
          }}
          onUpdate={(payload) => {
            if (!requireAuthForMutation()) return;
            if (builderState.roadmapId) workspace.handleUpdateRoadmap(builderState.roadmapId, payload);
            changeTab('my');
          }}
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
            if (!requireAuthForMutation()) return;
            setSelectedRoadmapOpenedFromTab('my');
            workspace.handleUseRoadmap(workspace.selectedRoadmap!);
            changeTab('my');
          }}
          onEdit={() => {
            if (!requireAuthForMutation()) return;
            workspace.setEditingRoadmapId(workspace.selectedRoadmap!.id);
            workspace.setSelectedRoadmapId(null);
            setSelectedRoadmapOpenedFromTab(null);
          }}
          onShare={() => {
            if (!requireAuthForMutation()) return;
            setShowShareDialog(true);
          }}
          onDelete={() => {
            if (!requireAuthForMutation()) return;
            workspace.handleDeleteRoadmap(workspace.selectedRoadmap!.id);
            setSelectedRoadmapOpenedFromTab(null);
          }}
          onShareRoadmap={(shareChannels, selectedSpaceIds) => {
            if (!requireAuthForMutation()) return;
            workspace.handleShareRoadmap(workspace.selectedRoadmap!.id, shareChannels, selectedSpaceIds);
          }}
          onReportRoadmap={(reasonId, detail) => {
            workspace.handleReportRoadmap(workspace.selectedRoadmap!.id, reasonId, detail);
          }}
          onCreateComment={(comment, parentId) => workspace.handleCreateRoadmapComment(workspace.selectedRoadmap!.id, comment, parentId)}
        />
      )}

      {canMutate && showShareDialog && workspace.selectedRoadmap && (
        <RoadmapShareDialog
          currentShareChannels={getShareChannelsFromRoadmap(workspace.selectedRoadmap)}
          currentSpaceIds={workspace.selectedRoadmap.groupIds ?? []}
          spaces={workspace.joinedSpaces}
          canSharePublicly={getCanSelectPublicShareForRoadmap(workspace.selectedRoadmap)}
          onClose={() => {
            setShowShareDialog(false);
            if (selectedRoadmapOpenedFromTab === 'my') {
              workspace.setSelectedRoadmapId(null);
              setSelectedRoadmapOpenedFromTab(null);
            }
          }}
          onSave={(shareChannels, selectedSpaceIds) => {
            if (!requireAuthForMutation()) return;
            workspace.handleShareRoadmap(workspace.selectedRoadmap!.id, shareChannels, selectedSpaceIds);
            setShowShareDialog(false);
            if (selectedRoadmapOpenedFromTab === 'my') {
              workspace.setSelectedRoadmapId(null);
              setSelectedRoadmapOpenedFromTab(null);
            }
          }}
        />
      )}

      {portfolioReportRoadmapId && (() => {
        const reportRoadmap = workspace.myRoadmaps.find((rm) => rm.id === portfolioReportRoadmapId);
        if (!reportRoadmap) return null;
        return (
          <PortfolioReportDialog
            roadmap={reportRoadmap}
            onClose={closePortfolioReport}
            onEdit={() => {
              if (!requireAuthForMutation()) return;
              closePortfolioReport();
              workspace.setEditingRoadmapId(reportRoadmap.id);
            }}
            onUpdateTodoOutput={(itemId, todoId, patch) => {
              if (!requireAuthForMutation()) return;
              workspace.handleUpdateTodoOutput(reportRoadmap.id, itemId, todoId, patch);
            }}
            onUpdateFinalResult={(patch) => {
              if (!requireAuthForMutation()) return;
              workspace.handleUpdateFinalResult(reportRoadmap.id, patch);
            }}
          />
        );
      })()}

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
