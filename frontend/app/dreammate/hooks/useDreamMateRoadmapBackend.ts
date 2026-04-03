'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { SharedRoadmap } from '../types';
import {
  createDreamMateRoadmapApi,
  deleteDreamMateRoadmapApi,
  deleteSharedDreamRoadmapComment,
  isDreamMateCareerPlanApiFetchEnabled,
  fetchDreamMateAuthMe,
  fetchDreamMateRoadmapsList,
  fetchSharedDreamRoadmapsFeed,
  patchSharedDreamRoadmapApi,
  postSharedDreamRoadmapComment,
  toggleSharedDreamRoadmapBookmark,
  toggleSharedDreamRoadmapLike,
  updateDreamMateRoadmapApi,
  upsertSharedDreamRoadmapApi,
  type SharedDreamRoadmapUpsertPayload,
} from '@/lib/dreammate/dreamRoadmapApi';
import { hasCareerPathBackendAuth } from '@/lib/career-path/sharedPlanApi';
import {
  mapApiRoadmapDetailToSharedRoadmap,
  mapEditorPayloadToRoadmapCreateBody,
  mapEditorPayloadToRoadmapUpdateBody,
  mapSharedFeedRowToSharedRoadmap,
  mergeRoadmapListsUnique,
} from '@/lib/dreammate/mapDreamRoadmapApiToUi';
import type { RoadmapEditorPayload } from '../components/RoadmapEditorDialog';
import type { RoadmapShareChannel } from '../types';
import { CAREER_QUERY_GC_TIME_MS } from '@/app/career/hooks/careerPathQueryCache';
import { DREAM_MATE_QUERY_KEYS, DREAM_MATE_QUERY_STALE_MS } from './dreamMateQueryKeys';

function shareChannelsToApiPayload(
  roadmapId: string,
  shareChannels: RoadmapShareChannel[],
  selectedSpaceGroupIds: string[],
): SharedDreamRoadmapUpsertPayload {
  const isPrivate = shareChannels.length === 0;
  const shareType = isPrivate
    ? 'private'
    : shareChannels.includes('public')
      ? 'public'
      : 'space';
  return {
    roadmap: roadmapId,
    share_type: shareType,
    description: '',
    tags: [],
    group_ids: shareType === 'space' ? selectedSpaceGroupIds : [],
  };
}

export function useDreamMateRoadmapBackend() {
  const apiFetchEnabled = isDreamMateCareerPlanApiFetchEnabled();
  /** 로그인 시에만 내 로드맵 CRUD·공유 설정 등 (커리어 패스와 동일) */
  const authEnabled = hasCareerPathBackendAuth();
  const queryClient = useQueryClient();

  const meQuery = useQuery({
    queryKey: DREAM_MATE_QUERY_KEYS.authMe,
    queryFn: fetchDreamMateAuthMe,
    enabled: apiFetchEnabled && authEnabled,
    staleTime: DREAM_MATE_QUERY_STALE_MS.authMe,
    gcTime: CAREER_QUERY_GC_TIME_MS,
  });

  const roadmapsQuery = useQuery({
    queryKey: DREAM_MATE_QUERY_KEYS.roadmapsMine,
    queryFn: fetchDreamMateRoadmapsList,
    enabled: apiFetchEnabled && authEnabled && Boolean(meQuery.data?.id),
    staleTime: DREAM_MATE_QUERY_STALE_MS.roadmaps,
    gcTime: CAREER_QUERY_GC_TIME_MS,
  });

  /** 비로그인도 호출 — 백엔드가 public 만 반환 (`SharedDreamRoadmapViewSet.get_queryset`) */
  const feedQuery = useQuery({
    queryKey: DREAM_MATE_QUERY_KEYS.sharedDreamFeed,
    queryFn: fetchSharedDreamRoadmapsFeed,
    enabled: apiFetchEnabled,
    staleTime: DREAM_MATE_QUERY_STALE_MS.sharedFeed,
    gcTime: CAREER_QUERY_GC_TIME_MS,
  });

  const me = meQuery.data;

  const myRoadmapsUi = useMemo((): SharedRoadmap[] => {
    if (!me || !roadmapsQuery.data?.length) return [];
    return roadmapsQuery.data.map(r =>
      mapApiRoadmapDetailToSharedRoadmap({ roadmap: r, me, sharedRow: null }),
    );
  }, [me, roadmapsQuery.data]);

  const feedRoadmapsUi = useMemo((): SharedRoadmap[] => {
    if (!feedQuery.data?.length) return [];
    return feedQuery.data.map(row => mapSharedFeedRowToSharedRoadmap(row, me ?? null));
  }, [me, feedQuery.data]);

  const mergedRoadmaps = useMemo(
    () => mergeRoadmapListsUnique(myRoadmapsUi, feedRoadmapsUi),
    [myRoadmapsUi, feedRoadmapsUi],
  );

  /** 목록은 백엔드 가시성과 동일 (비로그인=public, 로그인=public+그룹+본인 비공개 행 등) — 추가 클라이언트 필터 없음 */
  const visibleRoadmaps = useMemo(() => feedRoadmapsUi, [feedRoadmapsUi]);

  const myRoadmaps = useMemo(() => {
    if (!me) return [];
    return mergedRoadmaps.filter(r => r.ownerId === me.id);
  }, [mergedRoadmaps, me]);

  const roadmapLikeCounts = useMemo(() => {
    const m: Record<string, number> = {};
    mergedRoadmaps.forEach(r => {
      m[r.id] = r.likes;
    });
    return m;
  }, [mergedRoadmaps]);

  const roadmapBookmarkCounts = useMemo(() => {
    const m: Record<string, number> = {};
    mergedRoadmaps.forEach(r => {
      m[r.id] = r.bookmarks;
    });
    return m;
  }, [mergedRoadmaps]);

  const invalidateRoadmaps = () => {
    void queryClient.invalidateQueries({ queryKey: DREAM_MATE_QUERY_KEYS.roadmapsMine });
    void queryClient.invalidateQueries({ queryKey: DREAM_MATE_QUERY_KEYS.sharedDreamFeed });
  };

  const createRoadmapMutation = useMutation({
    mutationFn: (payload: RoadmapEditorPayload) =>
      createDreamMateRoadmapApi(mapEditorPayloadToRoadmapCreateBody(payload)),
    onSuccess: () => invalidateRoadmaps(),
  });

  const updateRoadmapMutation = useMutation({
    mutationFn: (args: { roadmapId: string; payload: RoadmapEditorPayload }) =>
      updateDreamMateRoadmapApi(args.roadmapId, mapEditorPayloadToRoadmapUpdateBody(args.payload)),
    onSuccess: () => invalidateRoadmaps(),
  });

  const deleteRoadmapMutation = useMutation({
    mutationFn: (roadmapId: string) => deleteDreamMateRoadmapApi(roadmapId),
    onSuccess: () => invalidateRoadmaps(),
  });

  const useFromSharedMutation = useMutation({
    mutationFn: (sourceRoadmap: SharedRoadmap) =>
      createDreamMateRoadmapApi(
        mapEditorPayloadToRoadmapCreateBody({
          title: `[카피] ${sourceRoadmap.title}`,
          description: sourceRoadmap.description,
          period: sourceRoadmap.period,
          starColor: sourceRoadmap.starColor,
          focusItemTypes: sourceRoadmap.focusItemTypes ?? ['activity', 'award', 'project', 'paper'],
          milestoneResults: [],
          finalResultTitle: undefined,
          finalResultDescription: undefined,
          finalResultUrl: undefined,
          finalResultImageUrl: undefined,
          groupIds: [],
          items: sourceRoadmap.items.map(it => ({
            ...it,
            subItems: (it.subItems ?? []).map(si => ({ ...si, isDone: false })),
          })),
        }),
      ),
    onSuccess: () => invalidateRoadmaps(),
  });

  const shareRoadmapMutation = useMutation({
    mutationFn: (args: {
      roadmapId: string;
      shareChannels: RoadmapShareChannel[];
      selectedSpaceIds: string[];
    }) =>
      upsertSharedDreamRoadmapApi(
        shareChannelsToApiPayload(args.roadmapId, args.shareChannels, args.selectedSpaceIds),
      ),
    onSuccess: () => invalidateRoadmaps(),
  });

  const patchShareMutation = useMutation({
    mutationFn: (args: {
      sharedDreamRoadmapId: string;
      shareChannels: RoadmapShareChannel[];
      selectedSpaceIds: string[];
    }) => {
      const isPrivate = args.shareChannels.length === 0;
      const share_type = isPrivate
        ? 'private'
        : args.shareChannels.includes('public')
          ? 'public'
          : 'space';
      return patchSharedDreamRoadmapApi(args.sharedDreamRoadmapId, {
        share_type,
        group_ids: share_type === 'space' ? args.selectedSpaceIds : [],
      });
    },
    onSuccess: () => invalidateRoadmaps(),
  });

  const toggleLikeMutation = useMutation({
    mutationFn: (sharedDreamRoadmapId: string) =>
      toggleSharedDreamRoadmapLike(sharedDreamRoadmapId),
    onSuccess: () => invalidateRoadmaps(),
  });

  const toggleBookmarkMutation = useMutation({
    mutationFn: (sharedDreamRoadmapId: string) =>
      toggleSharedDreamRoadmapBookmark(sharedDreamRoadmapId),
    onSuccess: () => invalidateRoadmaps(),
  });

  const postCommentMutation = useMutation({
    mutationFn: (args: { sharedId: string; content: string; parentId?: string }) =>
      postSharedDreamRoadmapComment(args.sharedId, {
        content: args.content,
        parent: args.parentId,
      }),
    onSuccess: () => invalidateRoadmaps(),
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (args: { sharedId: string; commentId: string }) =>
      deleteSharedDreamRoadmapComment(args.sharedId, args.commentId),
    onSuccess: () => invalidateRoadmaps(),
  });

  const isLoading =
    apiFetchEnabled &&
    (feedQuery.isLoading ||
      (authEnabled && (meQuery.isLoading || roadmapsQuery.isLoading)));

  return {
    /** 피드 API 호출 여부 (항상 true) */
    enabled: apiFetchEnabled,
    /** 로그인 후 내 로드맵·변이 백엔드로 갈 때 true */
    authEnabled,
    isLoading,
    isError: meQuery.isError || roadmapsQuery.isError || feedQuery.isError,
    currentUserId: me?.id ?? 'guest',
    mergedRoadmaps,
    visibleRoadmaps,
    myRoadmaps,
    roadmapLikeCounts,
    roadmapBookmarkCounts,
    refetchAll: invalidateRoadmaps,
    createRoadmapMutation,
    updateRoadmapMutation,
    deleteRoadmapMutation,
    useFromSharedMutation,
    shareRoadmapMutation,
    patchShareMutation,
    toggleLikeMutation,
    toggleBookmarkMutation,
    postCommentMutation,
    deleteCommentMutation,
  };
}
