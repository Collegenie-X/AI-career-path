'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  DreamResource,
  DreamResourceComment,
  DreamResourceReportRecord,
  DreamSpace,
  RoadmapItem,
  RoadmapReportRecord,
  RoadmapShareChannel,
  RoadmapTodoItem,
  SharedRoadmap,
  SpaceParticipationApplication,
} from '../types';
import {
  joinSpace,
  leaveSpace,
  loadDreamReactions,
  loadJoinedSpaceIds,
  saveDreamReactions,
  type DreamReactions,
} from '@/lib/dreammateCommunity';
import {
  loadDreamMateWorkspaceState,
  saveDreamMateWorkspaceState,
} from '@/lib/dreammateWorkspace';
import { hasCareerPathBackendAuth } from '@/lib/career-path/sharedPlanApi';
import { toggleDreamMateRoadmapTodoApi } from '@/lib/dreammate/dreamRoadmapApi';
import { useDreamMateRoadmapBackend } from './useDreamMateRoadmapBackend';
import type { RoadmapEditorPayload } from '../components/RoadmapEditorDialog';
import type { CareerGroupFormSubmitPayload } from '@/app/career/config/communityGroupForm';
import { getCategoryColorForCareerGroup } from '@/app/career/config/communityGroupForm';
import officialFeedExecutionTemplates from '@/data/dreammate/seed/feedExecutionTemplates.json';

const CURRENT_USER = {
  id: 'me-user',
  name: '나의 로드맵',
  emoji: '🧑‍🚀',
  grade: 'self',
};

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createDefaultRoadmapSubItems(itemId: string, itemTitle: string) {
  return [1, 2, 3, 4].map(weekNumber => ({
    id: `${itemId}-default-week-${weekNumber}`,
    weekNumber,
    weekLabel: undefined,
    entryType: 'task' as const,
    title: itemTitle.trim().length > 0 ? `${itemTitle} ${weekNumber}주차` : `${weekNumber}주차 실행`,
    isDone: false,
  }));
}

function buildMonthWeekLabel(month: number, week: number): string {
  return `${month}월 ${week}주차`;
}

function parseMonthWeekFromLabel(weekLabel?: string): { month?: number; week?: number } {
  const trimmedWeekLabel = weekLabel?.trim();
  if (!trimmedWeekLabel) return {};

  const matchedMonthWeek = trimmedWeekLabel.match(/(\d+)\s*월\s*(\d+)\s*주차/);
  if (matchedMonthWeek) {
    const parsedMonth = Number(matchedMonthWeek[1]);
    const parsedWeek = Number(matchedMonthWeek[2]);
    return {
      month: Number.isFinite(parsedMonth) ? parsedMonth : undefined,
      week: Number.isFinite(parsedWeek) ? parsedWeek : undefined,
    };
  }

  const numberMatches = trimmedWeekLabel.match(/\d+/g);
  if (!numberMatches || numberMatches.length === 0) return {};
  const lastNumber = Number(numberMatches[numberMatches.length - 1]);
  return { week: Number.isFinite(lastNumber) ? lastNumber : undefined };
}

function parseWeekNumberFromWeekLabel(weekLabel?: string): number | undefined {
  const trimmedWeekLabel = weekLabel?.trim();
  if (!trimmedWeekLabel) return undefined;

  const matchedMonthWeek = trimmedWeekLabel.match(/(\d+)\s*월\s*(\d+)\s*주차/);
  if (matchedMonthWeek) {
    const week = Number(matchedMonthWeek[2]);
    if (Number.isFinite(week) && week > 0) return week;
  }

  const numberMatches = trimmedWeekLabel.match(/\d+/g);
  if (!numberMatches || numberMatches.length === 0) return undefined;
  const lastNumber = Number(numberMatches[numberMatches.length - 1]);
  return Number.isFinite(lastNumber) && lastNumber > 0 ? lastNumber : undefined;
}

function normalizeTodoMonthWeekByItemMonths(
  itemMonths: number[],
  subItem: RoadmapTodoItem | Record<string, unknown>,
): RoadmapTodoItem {
  const s = subItem as RoadmapTodoItem;
  const normalizedMonths = itemMonths.length > 0 ? [...itemMonths].sort((a, b) => a - b) : [3];
  const fallbackMonth = normalizedMonths[0] ?? 3;
  const parsedFromLabel = parseMonthWeekFromLabel(s.weekLabel);

  // 1) weekLabel이 "N월 M주차" 형태면 우선 사용 (단, item months 범위/주차 1~5로 보정)
  if (
    typeof parsedFromLabel.month === 'number'
    && parsedFromLabel.month >= 1
    && parsedFromLabel.month <= 12
    && typeof parsedFromLabel.week === 'number'
    && parsedFromLabel.week >= 1
  ) {
    const normalizedMonth = normalizedMonths.includes(parsedFromLabel.month) ? parsedFromLabel.month : fallbackMonth;
    const normalizedWeek = Math.min(parsedFromLabel.week, 5);
    return {
      ...s,
      weekNumber: normalizedWeek,
      weekLabel: buildMonthWeekLabel(normalizedMonth, normalizedWeek),
      entryType: s.entryType ?? 'task',
    };
  }

  // 2) 기존 데이터가 6,7,8주차처럼 전역 주차면 item.months 기준으로 월/주차 분해
  const rawWeekNumber = (() => {
    if (typeof s.weekNumber === 'number' && s.weekNumber > 0) return s.weekNumber;
    if (typeof parsedFromLabel.week === 'number' && parsedFromLabel.week > 0) return parsedFromLabel.week;
    const parsedFromWeekLabel = parseWeekNumberFromWeekLabel(s.weekLabel);
    return parsedFromWeekLabel && parsedFromWeekLabel > 0 ? parsedFromWeekLabel : 1;
  })();

  const monthOffset = Math.floor((rawWeekNumber - 1) / 5);
  const normalizedMonth = normalizedMonths[Math.min(monthOffset, normalizedMonths.length - 1)] ?? fallbackMonth;
  const normalizedWeek = ((rawWeekNumber - 1) % 5) + 1;

  return {
    ...s,
    weekNumber: normalizedWeek,
    weekLabel: buildMonthWeekLabel(normalizedMonth, normalizedWeek),
    entryType: s.entryType ?? 'task',
  };
}

function toRoadmapItems(items: RoadmapItem[]): RoadmapItem[] {
  return items.map(item => ({
    ...item,
    id: createId('roadmap-item'),
    months: item.months.length > 0 ? [...item.months].sort((a, b) => a - b) : [3],
    subItems: ((item.subItems ?? []).length > 0 ? (item.subItems ?? []) : createDefaultRoadmapSubItems(item.id, item.title)).map(subItem => {
      const normalized = normalizeTodoMonthWeekByItemMonths(item.months, subItem);
      return {
        ...normalized,
        id: createId('roadmap-sub-item'),
      } satisfies RoadmapTodoItem;
    }),
  }));
}

function normalizeRoadmapStructure(roadmap: SharedRoadmap): SharedRoadmap {
  return {
    ...roadmap,
    shareScope: roadmap.shareScope ?? 'private',
    shareChannels: roadmap.shareChannels ?? (roadmap.shareScope === 'public' ? ['public'] : roadmap.shareScope === 'space' ? ['space'] : []),
    focusItemTypes: roadmap.focusItemTypes ?? ['award', 'activity', 'project', 'paper'],
    groupIds: roadmap.groupIds ?? [],
    items: (roadmap.items ?? []).map(item => ({
      ...item,
      subItems: (() => {
        const itemMonths = item.months?.length ? item.months : [3];
        const normalizedSubItems = (item.subItems ?? []).map(subItem =>
          normalizeTodoMonthWeekByItemMonths(itemMonths, subItem),
        );
        return normalizedSubItems.length > 0
          ? normalizedSubItems
          : createDefaultRoadmapSubItems(item.id, item.title);
      })(),
    })),
    finalResultTitle: roadmap.finalResultTitle ?? undefined,
    finalResultDescription: roadmap.finalResultDescription ?? undefined,
    finalResultUrl: roadmap.finalResultUrl ?? undefined,
    finalResultImageUrl: roadmap.finalResultImageUrl ?? undefined,
    milestoneResults: (roadmap.milestoneResults ?? []).map(result => ({
      ...result,
      description: result.description ?? undefined,
      monthWeekLabel: result.monthWeekLabel ?? undefined,
      timeLog: result.timeLog ?? undefined,
      resultUrl: result.resultUrl ?? undefined,
      imageUrl: result.imageUrl ?? undefined,
      recordedAt: result.recordedAt ?? undefined,
    })),
  };
}

const OFFICIAL_FEED_ROADMAPS: SharedRoadmap[] = (
  officialFeedExecutionTemplates as SharedRoadmap[]
).map(normalizeRoadmapStructure);

const OFFICIAL_FEED_IDS = new Set(OFFICIAL_FEED_ROADMAPS.map(r => r.id));

/** 공식 실행 템플릿을 피드 상단에 두고, 동일 id는 목록 쪽(사용자·API 데이터)을 우선합니다. */
function mergeOfficialFeedWithPublicList(list: SharedRoadmap[]): SharedRoadmap[] {
  const byId = new Map<string, SharedRoadmap>();
  for (const r of list) byId.set(r.id, r);
  const result: SharedRoadmap[] = [];
  for (const official of OFFICIAL_FEED_ROADMAPS) {
    result.push(byId.get(official.id) ?? official);
  }
  for (const r of list) {
    if (!OFFICIAL_FEED_IDS.has(r.id)) result.push(r);
  }
  return result;
}

interface UseDreamMateWorkspaceOptions {
  seedRoadmaps: SharedRoadmap[];
  seedSpaces: DreamSpace[];
  resources: DreamResource[];
}

interface CreateDreamResourcePayload {
  category: DreamResource['category'];
  title: string;
  description: string;
  resourceUrl?: string;
  tags: string[];
  attachmentFileName?: string;
  attachmentFileType?: 'md' | 'pdf';
  attachmentMarkdownContent?: string;
  attachmentDataUrl?: string;
}

interface UpdateDreamResourcePayload {
  category: DreamResource['category'];
  title: string;
  description: string;
  resourceUrl?: string;
  tags: string[];
  attachmentFileName?: string;
  attachmentFileType?: 'md' | 'pdf';
  attachmentMarkdownContent?: string;
  attachmentDataUrl?: string;
}

function normalizeSpaceStructure(space: DreamSpace): DreamSpace {
  return {
    ...space,
    recruitmentStatus: space.recruitmentStatus ?? 'open',
    notices: space.notices ?? [],
    programProposals: space.programProposals ?? [],
    participationApplications: space.participationApplications ?? [],
  };
}

function updateSpaceById(
  spaces: DreamSpace[],
  spaceId: string,
  updater: (space: DreamSpace) => DreamSpace,
): DreamSpace[] {
  return spaces.map(space => {
    if (space.id !== spaceId) return space;
    const updated = updater(normalizeSpaceStructure(space));
    return { ...updated, updatedAt: new Date().toISOString() };
  });
}

export function useDreamMateWorkspace({
  seedRoadmaps,
  seedSpaces,
  resources: seedResources,
}: UseDreamMateWorkspaceOptions) {
  const roadmapBackend = useDreamMateRoadmapBackend();
  /** 로그인 시 로드맵 CRUD·병합은 백엔드 (커리어 패스와 동일). 피드 목록은 비로그인도 API 사용 */
  const useRoadmapBackend = roadmapBackend.authEnabled;

  const [isWorkspaceLoaded, setIsWorkspaceLoaded] = useState(false);
  const [localRoadmaps, setLocalRoadmaps] = useState<SharedRoadmap[]>(
    seedRoadmaps.map(normalizeRoadmapStructure),
  );
  const [resources, setResources] = useState<DreamResource[]>(seedResources);
  const [resourceComments, setResourceComments] = useState<DreamResourceComment[]>([]);
  const [resourceReports, setResourceReports] = useState<DreamResourceReportRecord[]>([]);
  const [spaces, setSpaces] = useState<DreamSpace[]>(seedSpaces);
  const [joinedSpaceIds, setJoinedSpaceIds] = useState<string[]>([]);
  const [reactions, setReactions] = useState<DreamReactions>({
    likedRoadmapIds: [],
    bookmarkedRoadmapIds: [],
    likedResourceIds: [],
    bookmarkedResourceIds: [],
  });
  const [roadmapReports, setRoadmapReports] = useState<RoadmapReportRecord[]>([]);

  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string | null>(null);
  const [showCreateRoadmapDialog, setShowCreateRoadmapDialog] = useState(false);
  const [editingRoadmapId, setEditingRoadmapId] = useState<string | null>(null);
  const [pendingSpaceIdFromMyTab, setPendingSpaceIdFromMyTab] = useState<string | null>(null);

  useEffect(() => {
    if (hasCareerPathBackendAuth()) {
      setLocalRoadmaps([]);
      setResources(seedResources);
      setResourceComments([]);
      setResourceReports([]);
      setSpaces(seedSpaces.map(normalizeSpaceStructure));
      setRoadmapReports([]);
      setIsWorkspaceLoaded(true);
      setJoinedSpaceIds(loadJoinedSpaceIds());
      setReactions(loadDreamReactions());
      return;
    }
    const loadedWorkspace = loadDreamMateWorkspaceState({
      roadmaps: seedRoadmaps,
      resources: seedResources,
      resourceComments: [],
      resourceReports: [],
      spaces: seedSpaces,
      roadmapReports: [],
    });
    setLocalRoadmaps(loadedWorkspace.roadmaps.map(normalizeRoadmapStructure));
    setResources(loadedWorkspace.resources);
    setResourceComments(loadedWorkspace.resourceComments ?? []);
    setResourceReports(loadedWorkspace.resourceReports ?? []);
    setSpaces(loadedWorkspace.spaces.map(normalizeSpaceStructure));
    setRoadmapReports(loadedWorkspace.roadmapReports ?? []);
    setIsWorkspaceLoaded(true);
    setJoinedSpaceIds(loadJoinedSpaceIds());
    setReactions(loadDreamReactions());
  }, [seedRoadmaps, seedResources, seedSpaces]);

  const roadmaps = useRoadmapBackend ? roadmapBackend.mergedRoadmaps : localRoadmaps;

  useEffect(() => {
    if (!isWorkspaceLoaded) return;
    if (useRoadmapBackend) {
      saveDreamMateWorkspaceState({
        roadmaps: [],
        resources,
        resourceComments,
        resourceReports,
        spaces,
        roadmapReports,
      });
      return;
    }
    saveDreamMateWorkspaceState({
      roadmaps: localRoadmaps,
      resources,
      resourceComments,
      resourceReports,
      spaces,
      roadmapReports,
    });
  }, [
    isWorkspaceLoaded,
    useRoadmapBackend,
    localRoadmaps,
    resources,
    resourceComments,
    resourceReports,
    spaces,
    roadmapReports,
  ]);

  const roadmapLikeCounts = useMemo(() => {
    if (useRoadmapBackend) return roadmapBackend.roadmapLikeCounts;
    const counts: Record<string, number> = {};
    localRoadmaps.forEach(roadmap => {
      counts[roadmap.id] = roadmap.likes + (reactions.likedRoadmapIds.includes(roadmap.id) ? 1 : 0);
    });
    return counts;
  }, [useRoadmapBackend, roadmapBackend.roadmapLikeCounts, localRoadmaps, reactions.likedRoadmapIds]);

  const roadmapBookmarkCounts = useMemo(() => {
    if (useRoadmapBackend) return roadmapBackend.roadmapBookmarkCounts;
    const counts: Record<string, number> = {};
    localRoadmaps.forEach(roadmap => {
      counts[roadmap.id] =
        roadmap.bookmarks + (reactions.bookmarkedRoadmapIds.includes(roadmap.id) ? 1 : 0);
    });
    return counts;
  }, [useRoadmapBackend, roadmapBackend.roadmapBookmarkCounts, localRoadmaps, reactions.bookmarkedRoadmapIds]);

  const selectedRoadmap = useMemo(
    () => roadmaps.find(roadmap => roadmap.id === selectedRoadmapId) ?? null,
    [roadmaps, selectedRoadmapId],
  );

  const editingRoadmap = useMemo(
    () => roadmaps.find(roadmap => roadmap.id === editingRoadmapId) ?? null,
    [roadmaps, editingRoadmapId],
  );

  const joinedSpaces = useMemo(
    () => spaces.filter(space => joinedSpaceIds.includes(space.id)),
    [spaces, joinedSpaceIds],
  );

  const myRoadmaps = useMemo(() => {
    if (useRoadmapBackend) return roadmapBackend.myRoadmaps;
    return localRoadmaps.filter(roadmap => roadmap.ownerId === CURRENT_USER.id);
  }, [useRoadmapBackend, roadmapBackend.myRoadmaps, localRoadmaps]);

  const visibleRoadmaps = useMemo(() => {
    const apiFeed = roadmapBackend.visibleRoadmaps;
    if (useRoadmapBackend) {
      return mergeOfficialFeedWithPublicList(apiFeed);
    }
    if (apiFeed.length > 0) {
      return mergeOfficialFeedWithPublicList(apiFeed);
    }
    const localPublicOnly = localRoadmaps.filter(roadmap => {
      const channels =
        roadmap.shareChannels ??
        (roadmap.shareScope === 'public'
          ? ['public']
          : roadmap.shareScope === 'space'
            ? ['space']
            : []);
      return channels.includes('public');
    });
    return mergeOfficialFeedWithPublicList(localPublicOnly);
  }, [useRoadmapBackend, roadmapBackend.visibleRoadmaps, localRoadmaps]);

  const bookmarkedRoadmaps = useMemo(() => {
    if (useRoadmapBackend) {
      return roadmaps.filter(r => r.bookmarkedByMe === true);
    }
    return localRoadmaps.filter(roadmap => reactions.bookmarkedRoadmapIds.includes(roadmap.id));
  }, [useRoadmapBackend, roadmaps, localRoadmaps, reactions.bookmarkedRoadmapIds]);

  const bookmarkedResources = useMemo(
    () => resources.filter(resource => reactions.bookmarkedResourceIds.includes(resource.id)),
    [resources, reactions.bookmarkedResourceIds],
  );

  const resourceCommentsByResourceId = useMemo(() => {
    const groupedComments: Record<string, DreamResourceComment[]> = {};
    resourceComments.forEach(comment => {
      if (!groupedComments[comment.resourceId]) {
        groupedComments[comment.resourceId] = [];
      }
      groupedComments[comment.resourceId].push(comment);
    });
    return groupedComments;
  }, [resourceComments]);

  const handleToggleRoadmapLike = useCallback(
    (roadmapId: string) => {
      if (useRoadmapBackend) {
        const target = roadmaps.find(r => r.id === roadmapId);
        if (target?.sharedDreamRoadmapId) {
          roadmapBackend.toggleLikeMutation.mutate(target.sharedDreamRoadmapId);
        }
        return;
      }
      setReactions(prev => {
        const wasLiked = prev.likedRoadmapIds.includes(roadmapId);
        const updated: DreamReactions = {
          ...prev,
          likedRoadmapIds: wasLiked
            ? prev.likedRoadmapIds.filter(id => id !== roadmapId)
            : [...prev.likedRoadmapIds, roadmapId],
        };
        saveDreamReactions(updated);
        return updated;
      });
    },
    [useRoadmapBackend, roadmaps, roadmapBackend.toggleLikeMutation],
  );

  const handleToggleRoadmapBookmark = useCallback(
    (roadmapId: string) => {
      if (useRoadmapBackend) {
        const target = roadmaps.find(r => r.id === roadmapId);
        if (target?.sharedDreamRoadmapId) {
          roadmapBackend.toggleBookmarkMutation.mutate(target.sharedDreamRoadmapId);
        }
        return;
      }
      setReactions(prev => {
        const wasBookmarked = prev.bookmarkedRoadmapIds.includes(roadmapId);
        const updated: DreamReactions = {
          ...prev,
          bookmarkedRoadmapIds: wasBookmarked
            ? prev.bookmarkedRoadmapIds.filter(id => id !== roadmapId)
            : [...prev.bookmarkedRoadmapIds, roadmapId],
        };
        saveDreamReactions(updated);
        return updated;
      });
    },
    [useRoadmapBackend, roadmaps, roadmapBackend.toggleBookmarkMutation],
  );

  const handleToggleLikeResource = useCallback((resourceId: string) => {
    setReactions(prev => {
      const wasLiked = prev.likedResourceIds.includes(resourceId);
      const updated: DreamReactions = {
        ...prev,
        likedResourceIds: wasLiked
          ? prev.likedResourceIds.filter(id => id !== resourceId)
          : [...prev.likedResourceIds, resourceId],
      };
      saveDreamReactions(updated);
      return updated;
    });
  }, []);

  const handleToggleBookmarkResource = useCallback((resourceId: string) => {
    setReactions(prev => {
      const wasBookmarked = prev.bookmarkedResourceIds.includes(resourceId);
      const updated: DreamReactions = {
        ...prev,
        bookmarkedResourceIds: wasBookmarked
          ? prev.bookmarkedResourceIds.filter(id => id !== resourceId)
          : [...prev.bookmarkedResourceIds, resourceId],
      };
      saveDreamReactions(updated);
      return updated;
    });
  }, []);

  const handleCreateResource = useCallback((payload: CreateDreamResourcePayload) => {
    const normalizedUrl = payload.resourceUrl?.trim() ?? '';
    const newResource: DreamResource = {
      id: createId('resource'),
      category: payload.category,
      title: payload.title.trim(),
      description: payload.description.trim(),
      authorId: CURRENT_USER.id,
      resourceUrl: normalizedUrl.length > 0 ? normalizedUrl : undefined,
      attachmentFileName: payload.attachmentFileName,
      attachmentFileType: payload.attachmentFileType,
      attachmentMarkdownContent: payload.attachmentMarkdownContent,
      attachmentDataUrl: payload.attachmentDataUrl,
      authorName: CURRENT_USER.name,
      authorEmoji: CURRENT_USER.emoji,
      authorGrade: CURRENT_USER.grade,
      tags: payload.tags.filter(tag => tag.trim().length > 0).map(tag => tag.trim()),
      likes: 0,
      bookmarks: 0,
      createdAt: new Date().toISOString(),
    };
    setResources(prev => [newResource, ...prev]);
  }, []);

  const handleUpdateResource = useCallback((resourceId: string, payload: UpdateDreamResourcePayload) => {
    const normalizedUrl = payload.resourceUrl?.trim() ?? '';
    setResources(prev => prev.map(resource => {
      if (resource.id !== resourceId) return resource;
      return {
        ...resource,
        category: payload.category,
        title: payload.title.trim(),
        description: payload.description.trim(),
        resourceUrl: normalizedUrl.length > 0 ? normalizedUrl : undefined,
        tags: payload.tags.filter(tag => tag.trim().length > 0).map(tag => tag.trim()),
        attachmentFileName: payload.attachmentFileName,
        attachmentFileType: payload.attachmentFileType,
        attachmentMarkdownContent: payload.attachmentMarkdownContent,
        attachmentDataUrl: payload.attachmentDataUrl,
      };
    }));
  }, []);

  const handleDeleteResource = useCallback((resourceId: string) => {
    setResources(prev => prev.filter(resource => resource.id !== resourceId));
    setReactions(prev => {
      const updated: DreamReactions = {
        ...prev,
        likedResourceIds: prev.likedResourceIds.filter(id => id !== resourceId),
        bookmarkedResourceIds: prev.bookmarkedResourceIds.filter(id => id !== resourceId),
      };
      saveDreamReactions(updated);
      return updated;
    });
    setResourceComments(prev => prev.filter(comment => comment.resourceId !== resourceId));
    setResourceReports(prev => prev.filter(report => report.resourceId !== resourceId));
  }, []);

  const handleCreateResourceComment = useCallback((resourceId: string, content: string) => {
    const trimmedContent = content.trim();
    if (!trimmedContent) return;
    setResourceComments(prev => [{
      id: createId('resource-comment'),
      resourceId,
      authorId: CURRENT_USER.id,
      authorName: CURRENT_USER.name,
      authorEmoji: CURRENT_USER.emoji,
      content: trimmedContent,
      createdAt: new Date().toISOString(),
    }, ...prev]);
  }, []);

  const handleReportResource = useCallback((resourceId: string, reasonId: string, detail: string) => {
    setResourceReports(prev => [{
      id: createId('resource-report'),
      resourceId,
      reasonId,
      detail: detail.trim(),
      reportedByUserId: CURRENT_USER.id,
      createdAt: new Date().toISOString(),
    }, ...prev]);
  }, []);

  const handleJoinSpace = useCallback((spaceId: string) => {
    joinSpace(spaceId);
    setJoinedSpaceIds(loadJoinedSpaceIds());
  }, []);

  const handleLeaveSpace = useCallback((spaceId: string) => {
    leaveSpace(spaceId);
    setJoinedSpaceIds(loadJoinedSpaceIds());
  }, []);

  const handleCreateRoadmap = useCallback(
    (payload: RoadmapEditorPayload) => {
      if (useRoadmapBackend) {
        roadmapBackend.createRoadmapMutation.mutate(payload, {
          onSuccess: created => {
            setShowCreateRoadmapDialog(false);
            setSelectedRoadmapId(created.id);
          },
        });
        return;
      }
      const newRoadmap: SharedRoadmap = {
        id: createId('roadmap'),
        ownerId: CURRENT_USER.id,
        ownerName: CURRENT_USER.name,
        ownerEmoji: CURRENT_USER.emoji,
        ownerGrade: CURRENT_USER.grade,
        title: payload.title,
        description: payload.description,
        period: payload.period,
        starColor: payload.starColor,
        focusItemTypes: payload.focusItemTypes,
        milestoneResults: payload.milestoneResults ?? [],
        finalResultTitle: payload.finalResultTitle,
        finalResultDescription: payload.finalResultDescription,
        finalResultUrl: payload.finalResultUrl,
        finalResultImageUrl: payload.finalResultImageUrl,
        shareScope: 'private',
        shareChannels: [],
        items: toRoadmapItems(payload.items),
        groupIds: [],
        likes: 0,
        bookmarks: 0,
        sharedAt: new Date().toISOString(),
        comments: [],
      };
      setLocalRoadmaps(prev => [newRoadmap, ...prev]);
      setShowCreateRoadmapDialog(false);
      setSelectedRoadmapId(newRoadmap.id);
    },
    [useRoadmapBackend, roadmapBackend.createRoadmapMutation],
  );

  const handleUpdateRoadmap = useCallback(
    (roadmapId: string, payload: RoadmapEditorPayload) => {
      if (useRoadmapBackend) {
        roadmapBackend.updateRoadmapMutation.mutate(
          { roadmapId, payload },
          { onSuccess: () => setEditingRoadmapId(null) },
        );
        return;
      }
      setLocalRoadmaps(prev =>
        prev.map(roadmap => {
          if (roadmap.id !== roadmapId) return roadmap;
          return {
            ...roadmap,
            title: payload.title,
            description: payload.description,
            period: payload.period,
            starColor: payload.starColor,
            focusItemTypes: payload.focusItemTypes,
            milestoneResults: payload.milestoneResults ?? [],
            finalResultTitle: payload.finalResultTitle,
            finalResultDescription: payload.finalResultDescription,
            finalResultUrl: payload.finalResultUrl,
            finalResultImageUrl: payload.finalResultImageUrl,
            groupIds: roadmap.groupIds ?? [],
            shareScope: roadmap.shareScope ?? 'private',
            items: payload.items.map(item => {
              const itemMonths = [...item.months].sort((a, b) => a - b);
              const cleanedSubItems = (item.subItems ?? [])
                .map(subItem => ({
                  ...normalizeTodoMonthWeekByItemMonths(itemMonths, subItem),
                  title: String(subItem.title ?? '').trim(),
                }))
                .filter(subItem => subItem.title.length > 0);

              return {
                ...item,
                months: itemMonths,
                subItems:
                  cleanedSubItems.length > 0
                    ? cleanedSubItems
                    : createDefaultRoadmapSubItems(item.id, item.title),
              };
            }),
          } as SharedRoadmap;
        }),
      );
      setEditingRoadmapId(null);
    },
    [useRoadmapBackend, roadmapBackend.updateRoadmapMutation],
  );

  const handleDeleteRoadmap = useCallback(
    (roadmapId: string) => {
      if (useRoadmapBackend) {
        roadmapBackend.deleteRoadmapMutation.mutate(roadmapId, {
          onSuccess: () => {
            setSelectedRoadmapId(null);
            setEditingRoadmapId(null);
          },
        });
        return;
      }
      setLocalRoadmaps(prev => prev.filter(roadmap => roadmap.id !== roadmapId));
      setReactions(prev => {
        const updated = {
          ...prev,
          likedRoadmapIds: prev.likedRoadmapIds.filter(id => id !== roadmapId),
          bookmarkedRoadmapIds: prev.bookmarkedRoadmapIds.filter(id => id !== roadmapId),
        };
        saveDreamReactions(updated);
        return updated;
      });
      setSelectedRoadmapId(null);
      setEditingRoadmapId(null);
    },
    [useRoadmapBackend, roadmapBackend.deleteRoadmapMutation],
  );

  const handleUseRoadmap = useCallback(
    (roadmap: SharedRoadmap) => {
      if (useRoadmapBackend) {
        roadmapBackend.useFromSharedMutation.mutate(roadmap, {
          onSuccess: created => {
            setSelectedRoadmapId(created.id);
          },
        });
        return;
      }
      const clonedRoadmap: SharedRoadmap = {
        ...roadmap,
        id: createId('roadmap'),
        ownerId: CURRENT_USER.id,
        ownerName: CURRENT_USER.name,
        ownerEmoji: CURRENT_USER.emoji,
        ownerGrade: CURRENT_USER.grade,
        title: `[카피] ${roadmap.title}`,
        items: toRoadmapItems(roadmap.items),
        milestoneResults: [],
        finalResultTitle: undefined,
        finalResultDescription: undefined,
        finalResultUrl: undefined,
        finalResultImageUrl: undefined,
        shareScope: 'private',
        shareChannels: [],
        groupIds: [],
        likes: 0,
        bookmarks: 0,
        comments: [],
        sharedAt: new Date().toISOString(),
      };
      setLocalRoadmaps(prev => [clonedRoadmap, ...prev]);
      setSelectedRoadmapId(clonedRoadmap.id);
    },
    [useRoadmapBackend, roadmapBackend.useFromSharedMutation],
  );

  const handleCreateRoadmapComment = useCallback(
    (roadmapId: string, content: string, parentId?: string) => {
      if (useRoadmapBackend) {
        const target = roadmaps.find(r => r.id === roadmapId);
        if (target?.sharedDreamRoadmapId) {
          roadmapBackend.postCommentMutation.mutate({
            sharedId: target.sharedDreamRoadmapId,
            content,
            parentId,
          });
        }
        return;
      }
      setLocalRoadmaps(prev =>
        prev.map(roadmap => {
          if (roadmap.id !== roadmapId) return roadmap;
          return {
            ...roadmap,
            comments: [
              ...roadmap.comments,
              {
                id: createId('comment'),
                parentId,
                authorId: CURRENT_USER.id,
                authorName: CURRENT_USER.name,
                authorEmoji: CURRENT_USER.emoji,
                content,
                createdAt: new Date().toISOString(),
              },
            ],
          };
        }),
      );
    },
    [useRoadmapBackend, roadmaps, roadmapBackend.postCommentMutation],
  );

  const handleShareRoadmap = useCallback(
    (roadmapId: string, shareChannels: RoadmapShareChannel[], selectedSpaceIds: string[]) => {
      if (useRoadmapBackend) {
        const target = roadmaps.find(r => r.id === roadmapId);
        if (target?.sharedDreamRoadmapId) {
          roadmapBackend.patchShareMutation.mutate({
            sharedDreamRoadmapId: target.sharedDreamRoadmapId,
            shareChannels,
            selectedSpaceIds,
          });
        } else {
          roadmapBackend.shareRoadmapMutation.mutate({
            roadmapId,
            shareChannels,
            selectedSpaceIds,
          });
        }
        return;
      }
      setLocalRoadmaps(previousRoadmaps =>
        previousRoadmaps.map(roadmap => {
          if (roadmap.id !== roadmapId) return roadmap;
          const isPrivate = shareChannels.length === 0;
          const shareScope = isPrivate ? 'private' : shareChannels.includes('public') ? 'public' : 'space';
          return {
            ...roadmap,
            shareChannels,
            shareScope,
            groupIds: shareChannels.includes('space') ? selectedSpaceIds : [],
          };
        }),
      );
    },
    [useRoadmapBackend, roadmaps, roadmapBackend.patchShareMutation, roadmapBackend.shareRoadmapMutation],
  );

  const handleToggleTodoItem = useCallback(
    (roadmapId: string, itemId: string, todoId: string) => {
      if (useRoadmapBackend) {
        void toggleDreamMateRoadmapTodoApi(todoId).then(() => {
          roadmapBackend.refetchAll();
        });
        return;
      }
      setLocalRoadmaps(previousRoadmaps =>
        previousRoadmaps.map(roadmap => {
          if (roadmap.id !== roadmapId) return roadmap;
          return {
            ...roadmap,
            items: roadmap.items.map(item => {
              if (item.id !== itemId) return item;
              return {
                ...item,
                subItems: (item.subItems ?? []).map(subItem => {
                  if (subItem.id !== todoId) return subItem;
                  return {
                    ...subItem,
                    isDone: !subItem.isDone,
                  };
                }),
              };
            }),
          };
        }),
      );
    },
    [useRoadmapBackend, roadmapBackend],
  );

  const handleCreateSpace = useCallback((payload: CareerGroupFormSubmitPayload) => {
    const { name, description, emoji, category, mode, maxMembers, tags, isPublic } = payload;
    const color = getCategoryColorForCareerGroup(category);
    const newSpace: DreamSpace = {
      id: createId('space'),
      name,
      emoji,
      description: description || `${name} 스페이스`,
      color,
      creatorId: CURRENT_USER.id,
      creatorName: CURRENT_USER.name,
      memberCount: 1,
      members: [{
        id: CURRENT_USER.id,
        name: CURRENT_USER.name,
        emoji: CURRENT_USER.emoji,
        grade: CURRENT_USER.grade,
        joinedAt: new Date().toISOString(),
        role: 'creator',
      }],
      sharedRoadmapCount: 0,
      recruitmentStatus: 'open',
      notices: [],
      programProposals: [],
      participationApplications: [],
      inviteCode: `${name.replace(/\s+/g, '').slice(0, 3).toUpperCase()}-${Math.floor(Math.random() * 9000 + 1000)}`,
      tags: tags.length > 0 ? tags : [],
      maxMembers,
      groupCategory: category,
      groupMode: mode,
      isPublic,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSpaces(prev => [newSpace, ...prev]);
    joinSpace(newSpace.id);
    setJoinedSpaceIds(loadJoinedSpaceIds());
    setPendingSpaceIdFromMyTab(newSpace.id);
  }, []);

  const handleToggleSpaceRecruitmentStatus = useCallback((spaceId: string) => {
    setSpaces(prev => updateSpaceById(prev, spaceId, (space) => ({
      ...space,
      recruitmentStatus: space.recruitmentStatus === 'closed' ? 'open' : 'closed',
    })));
  }, []);

  const handleCreateSpaceNotice = useCallback((spaceId: string, title: string, content: string) => {
    if (!title.trim() || !content.trim()) return;
    setSpaces(prev => updateSpaceById(prev, spaceId, (space) => ({
      ...space,
      notices: [{
        id: createId('space-notice'),
        title,
        content,
        createdAt: new Date().toISOString(),
        createdByUserId: CURRENT_USER.id,
        createdByName: CURRENT_USER.name,
      }, ...(space.notices ?? [])],
    })));
  }, []);

  const handleApplyToSpace = useCallback((spaceId: string, message: string) => {
    if (!message.trim()) return;
    setSpaces(prev => updateSpaceById(prev, spaceId, (space) => {
      if (space.recruitmentStatus === 'closed') return space;
      const existing = (space.participationApplications ?? [])
        .find(application => application.applicantUserId === CURRENT_USER.id);
      if (existing) return space;
      const newApplication: SpaceParticipationApplication = {
        id: createId('space-application'),
        applicantUserId: CURRENT_USER.id,
        applicantName: CURRENT_USER.name,
        applicantEmoji: CURRENT_USER.emoji,
        applicantGrade: CURRENT_USER.grade,
        message,
        appliedAt: new Date().toISOString(),
        status: 'applied',
      };
      return {
        ...space,
        participationApplications: [newApplication, ...(space.participationApplications ?? [])],
      };
    }));
  }, []);

  const handleApproveSpaceApplication = useCallback((spaceId: string, applicationId: string) => {
    setSpaces(prev => updateSpaceById(prev, spaceId, (space) => ({
      ...space,
      participationApplications: (space.participationApplications ?? []).map(application => {
        if (application.id !== applicationId || application.status !== 'applied') return application;
        return {
          ...application,
          status: 'approved',
          approvedAt: new Date().toISOString(),
          handledByUserId: CURRENT_USER.id,
        };
      }),
    })));
  }, []);

  const handleAdvanceSpaceApplicationStatus = useCallback((spaceId: string, applicationId: string) => {
    let shouldJoinSpace = false;
    setSpaces(prev => updateSpaceById(prev, spaceId, (space) => {
      const updatedApplications: SpaceParticipationApplication[] = (space.participationApplications ?? []).map(application => {
        if (application.id !== applicationId) return application;
        if (application.status === 'approved') {
          shouldJoinSpace = true;
          return {
            ...application,
            status: 'confirmed' as const,
            confirmedAt: new Date().toISOString(),
          };
        }
        if (application.status === 'confirmed') {
          return {
            ...application,
            status: 'inProgress' as const,
            inProgressAt: new Date().toISOString(),
          };
        }
        return application;
      });

      if (!shouldJoinSpace) {
        return { ...space, participationApplications: updatedApplications };
      }

      const alreadyMember = space.members.some(member => member.id === CURRENT_USER.id);
      const nextMembers = alreadyMember
        ? space.members
        : [...space.members, {
          id: CURRENT_USER.id,
          name: CURRENT_USER.name,
          emoji: CURRENT_USER.emoji,
          grade: CURRENT_USER.grade,
          joinedAt: new Date().toISOString(),
          role: 'member' as const,
        }];
      return {
        ...space,
        memberCount: nextMembers.length,
        members: nextMembers,
        participationApplications: updatedApplications,
      };
    }));
    if (shouldJoinSpace) {
      joinSpace(spaceId);
      setJoinedSpaceIds(loadJoinedSpaceIds());
    }
  }, []);

  const handleReportRoadmap = useCallback((roadmapId: string, reasonId: string, detail: string) => {
    setRoadmapReports(prev => [{
      id: createId('roadmap-report'),
      roadmapId,
      reasonId,
      detail: detail.trim(),
      reportedByUserId: CURRENT_USER.id,
      createdAt: new Date().toISOString(),
    }, ...prev]);
  }, []);

  const effectiveReactions = useMemo((): DreamReactions => {
    if (!useRoadmapBackend) return reactions;
    return {
      ...reactions,
      likedRoadmapIds: roadmaps.filter(r => r.likedByMe).map(r => r.id),
      bookmarkedRoadmapIds: roadmaps.filter(r => r.bookmarkedByMe).map(r => r.id),
    };
  }, [useRoadmapBackend, reactions, roadmaps]);

  return {
    currentUserId: useRoadmapBackend ? roadmapBackend.currentUserId : CURRENT_USER.id,
    resources,
    roadmaps,
    visibleRoadmaps,
    spaces,
    joinedSpaceIds,
    reactions: effectiveReactions,
    resourceComments,
    resourceCommentsByResourceId,
    resourceReports,
    roadmapLikeCounts,
    roadmapBookmarkCounts,
    selectedRoadmap,
    editingRoadmap,
    showCreateRoadmapDialog,
    pendingSpaceIdFromMyTab,
    joinedSpaces,
    myRoadmaps,
    bookmarkedRoadmaps,
    bookmarkedResources,
    setSelectedRoadmapId,
    setShowCreateRoadmapDialog,
    setEditingRoadmapId,
    setPendingSpaceIdFromMyTab,
    roadmapReports,
    handleToggleRoadmapLike,
    handleToggleRoadmapBookmark,
    handleToggleLikeResource,
    handleToggleBookmarkResource,
    handleCreateResource,
    handleUpdateResource,
    handleDeleteResource,
    handleCreateResourceComment,
    handleReportResource,
    handleJoinSpace,
    handleLeaveSpace,
    handleCreateRoadmap,
    handleUpdateRoadmap,
    handleDeleteRoadmap,
    handleUseRoadmap,
    handleCreateRoadmapComment,
    handleShareRoadmap,
    handleToggleTodoItem,
    handleCreateSpace,
    handleToggleSpaceRecruitmentStatus,
    handleCreateSpaceNotice,
    handleApplyToSpace,
    handleApproveSpaceApplication,
    handleAdvanceSpaceApplicationStatus,
    handleReportRoadmap,
  };
}

