'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { TabBar } from '@/components/tab-bar';
import seedRoadmapsData from '@/data/dreammate/seed/roadmaps.json';
import seedResourcesData from '@/data/dreammate/seed/resources.json';
import seedSpacesData    from '@/data/dreammate/seed/spaces.json';
import { DREAM_TABS, LABELS } from './config';
import type { DreamResource, DreamSpace, DreamTabId, PeriodType, SharedRoadmap } from './types';
import { RoadmapFeedTab } from './components/RoadmapFeedTab';
import { DreamLibraryTab } from './components/DreamLibraryTab';
import { DreamSpaceTab } from './components/DreamSpaceTab';
import { MyDreamMateTab } from './components/MyDreamMateTab';
import { RoadmapEditorDialog } from './components/RoadmapEditorDialog';
import { RoadmapDetailDialog } from './components/RoadmapDetailDialog';
import { useDreamMateWorkspace } from './hooks/useDreamMateWorkspace';
import { GroupedTabSelector } from './components/GroupedTabSelector';

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

  const seedRoadmaps = seedRoadmapsData as SharedRoadmap[];
  const resources    = seedResourcesData as DreamResource[];
  const seedSpaces   = seedSpacesData as DreamSpace[];
  const workspace = useDreamMateWorkspace({ seedRoadmaps, seedSpaces, resources });

  useEffect(() => {
    setMounted(true);
    const tabParam = searchParams.get('tab') as DreamTabId | null;
    if (tabParam && DREAM_TABS.some(t => t.id === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden w-full max-w-[430px] mx-auto" style={{ backgroundColor: '#0a0a1e' }}>
      <StarField />

      {/* Page header */}
      <div
        className="sticky top-0 z-20 px-4"
        style={{ backgroundColor: 'rgba(10,10,30,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center justify-between py-3">
          <div>
            <h1 className="text-xl font-black bg-gradient-to-r from-white via-purple-200 to-indigo-300 bg-clip-text text-transparent">
              {LABELS.pageTitle}
            </h1>
            <p className="text-xs text-gray-500">{LABELS.pageSubtitle}</p>
          </div>
        </div>

        {/* Tab group */}
        <GroupedTabSelector
          groupLabel={LABELS.pageTitle}
          value={activeTab}
          options={DREAM_TABS}
          onChange={setActiveTab}
          containerClassName="pb-0 mb-3"
        />
      </div>

      {/* Tab content */}
      <div className="relative z-10 px-4 pt-4">
        {!mounted ? null : activeTab === 'feed' ? (
          <RoadmapFeedTab
            roadmaps={workspace.visibleRoadmaps}
            likedIds={workspace.reactions.likedRoadmapIds}
            bookmarkedIds={workspace.reactions.bookmarkedRoadmapIds}
            likeCounts={workspace.roadmapLikeCounts}
            bookmarkCounts={workspace.roadmapBookmarkCounts}
            onToggleLike={workspace.handleToggleRoadmapLike}
            onToggleBookmark={workspace.handleToggleRoadmapBookmark}
            onViewDetail={(roadmap) => {
              setSelectedRoadmapOpenedFromTab('feed');
              workspace.setSelectedRoadmapId(roadmap.id);
            }}
            onCreateRoadmap={() => workspace.setShowCreateRoadmapDialog(true)}
          />
        ) : activeTab === 'library' ? (
          <DreamLibraryTab
            resources={resources}
            likedResourceIds={workspace.reactions.likedResourceIds}
            bookmarkedResourceIds={workspace.reactions.bookmarkedResourceIds}
            onToggleLikeResource={workspace.handleToggleLikeResource}
            onToggleBookmarkResource={workspace.handleToggleBookmarkResource}
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
            joinedSpaces={workspace.joinedSpaces}
            bookmarkedRoadmaps={workspace.bookmarkedRoadmaps}
            bookmarkedResources={workspace.bookmarkedResources}
            likedIds={workspace.reactions.likedRoadmapIds}
            bookmarkedIds={workspace.reactions.bookmarkedRoadmapIds}
            likeCounts={workspace.roadmapLikeCounts}
            bookmarkCounts={workspace.roadmapBookmarkCounts}
            onToggleLike={workspace.handleToggleRoadmapLike}
            onToggleBookmark={workspace.handleToggleRoadmapBookmark}
            onViewRoadmapDetail={(roadmap) => {
              setSelectedRoadmapOpenedFromTab('my');
              workspace.setSelectedRoadmapId(roadmap.id);
            }}
            onGoToSpace={(spaceId) => {
              workspace.setPendingSpaceIdFromMyTab(spaceId);
              setActiveTab('space');
            }}
            onCreateRoadmap={() => workspace.setShowCreateRoadmapDialog(true)}
          />
        ) : null}
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

      {workspace.selectedRoadmap && (
        <RoadmapDetailDialog
          roadmap={workspace.selectedRoadmap}
          isOwnedByCurrentUser={workspace.selectedRoadmap.ownerId === workspace.currentUserId}
          isReferenceViewOnlyMode={selectedRoadmapOpenedFromTab === 'space'}
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
          onDelete={() => {
            workspace.handleDeleteRoadmap(workspace.selectedRoadmap!.id);
            setSelectedRoadmapOpenedFromTab(null);
          }}
          onShareRoadmap={(shareScope, selectedSpaceIds) => {
            workspace.handleShareRoadmap(workspace.selectedRoadmap!.id, shareScope, selectedSpaceIds);
          }}
          onReportRoadmap={(reasonId, detail) => {
            workspace.handleReportRoadmap(workspace.selectedRoadmap!.id, reasonId, detail);
          }}
          onCreateComment={(comment, parentId) => workspace.handleCreateRoadmapComment(workspace.selectedRoadmap!.id, comment, parentId)}
          showTimelineProgressBars={selectedRoadmapOpenedFromTab !== 'feed'}
          onToggleTodoItem={(itemId, todoId) => workspace.handleToggleTodoItem(workspace.selectedRoadmap!.id, itemId, todoId)}
        />
      )}

      <TabBar />
    </div>
  );
}

export default function DreamMatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full max-w-[430px] mx-auto flex items-center justify-center" style={{ backgroundColor: '#0a0a1e' }}>
          <Sparkles className="w-6 h-6 animate-pulse" style={{ color: '#6C5CE7' }} />
        </div>
      }
    >
      <DreamMatePageContent />
    </Suspense>
  );
}
