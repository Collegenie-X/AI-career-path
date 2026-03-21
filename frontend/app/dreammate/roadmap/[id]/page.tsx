'use client';

import { useParams, useRouter } from 'next/navigation';
import { RoadmapDetailDialog } from '../../components/RoadmapDetailDialog';
import { RoadmapEditorDialog } from '../../components/RoadmapEditorDialog';
import { RoadmapShareDialog } from '../../components/RoadmapShareDialog';
import { useDreamMateWorkspaceContext } from '../../DreamMateWorkspaceProvider';
import { getShareChannelsFromRoadmap } from '../../types';
import { getCanSelectPublicShareForRoadmap } from '../../utils/roadmapPublicShareEligibility';
import { useState } from 'react';

export default function RoadmapDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workspace = useDreamMateWorkspaceContext();
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const roadmapId = typeof params.id === 'string' ? params.id : null;
  const roadmap = roadmapId
    ? workspace.myRoadmaps.find((r) => r.id === roadmapId) ?? workspace.roadmaps.find((r) => r.id === roadmapId)
    : null;

  if (!roadmapId || !roadmap) {
    return (
      <div
        className="min-h-screen w-full max-w-[645px] mx-auto flex flex-col items-center justify-center px-4"
        style={{ backgroundColor: 'rgb(var(--background))' }}
      >
        <p className="text-gray-400 text-sm">로드맵을 찾을 수 없어요</p>
        <button
          onClick={() => router.push('/dreammate?tab=my')}
          className="mt-4 px-6 py-2 rounded-xl text-sm font-bold text-white"
          style={{ backgroundColor: '#6C5CE7' }}
        >
          내 기록으로
        </button>
      </div>
    );
  }

  const isOwnedByCurrentUser = roadmap.ownerId === workspace.currentUserId;

  return (
    <div
      className="min-h-screen pb-24 w-full max-w-[645px] mx-auto"
      style={{ backgroundColor: 'rgb(var(--background))' }}
    >
      <RoadmapDetailDialog
        roadmap={roadmap}
        isOwnedByCurrentUser={isOwnedByCurrentUser}
        timelineDetailMode={isOwnedByCurrentUser ? 'interactive' : 'status_readonly'}
        isReferenceViewOnlyMode={false}
        availableSpaces={workspace.joinedSpaces}
        variant="page"
        onClose={() => router.push('/dreammate?tab=my')}
        onUseRoadmap={() => {
          workspace.handleUseRoadmap(roadmap);
          router.push('/dreammate?tab=my');
        }}
        onShareRoadmap={(shareChannels, selectedSpaceIds) => {
          workspace.handleShareRoadmap(roadmap.id, shareChannels, selectedSpaceIds);
        }}
        onReportRoadmap={(reasonId, detail) => {
          workspace.handleReportRoadmap(roadmap.id, reasonId, detail);
        }}
        onEdit={() => setShowEditDialog(true)}
        onShare={() => setShowShareDialog(true)}
        onDelete={() => {
          workspace.handleDeleteRoadmap(roadmap.id);
          router.push('/dreammate?tab=my');
        }}
        onCreateComment={(comment, parentId) =>
          workspace.handleCreateRoadmapComment(roadmap.id, comment, parentId)
        }
        onToggleTodoItem={(itemId, todoId) =>
          workspace.handleToggleTodoItem(roadmap.id, itemId, todoId)
        }
      />

      {showEditDialog && (
        <RoadmapEditorDialog
          title="실행계획 수정하기"
          submitLabel="수정 완료"
          initialValues={{
            title: roadmap.title,
            description: roadmap.description,
            period: roadmap.period,
            starColor: roadmap.starColor,
            focusItemTypes: roadmap.focusItemTypes ?? ['award', 'activity', 'project', 'paper'],
            milestoneResults: roadmap.milestoneResults ?? [],
            finalResultTitle: roadmap.finalResultTitle ?? '',
            finalResultDescription: roadmap.finalResultDescription ?? '',
            finalResultUrl: roadmap.finalResultUrl ?? '',
            finalResultImageUrl: roadmap.finalResultImageUrl ?? '',
            groupIds: roadmap.groupIds,
            items: roadmap.items,
          }}
          onClose={() => setShowEditDialog(false)}
          onSubmit={(payload) => {
            workspace.handleUpdateRoadmap(roadmap.id, payload);
            setShowEditDialog(false);
          }}
        />
      )}

      {showShareDialog && (
        <RoadmapShareDialog
          currentShareChannels={getShareChannelsFromRoadmap(roadmap)}
          currentSpaceIds={roadmap.groupIds ?? []}
          spaces={workspace.joinedSpaces}
          canSharePublicly={getCanSelectPublicShareForRoadmap(roadmap)}
          onClose={() => setShowShareDialog(false)}
          onSave={(shareChannels, selectedSpaceIds) => {
            workspace.handleShareRoadmap(roadmap.id, shareChannels, selectedSpaceIds);
            setShowShareDialog(false);
          }}
        />
      )}

    </div>
  );
}
