'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  DreamResource,
  DreamSpace,
  RoadmapItem,
  RoadmapReportRecord,
  RoadmapShareScope,
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
import type { RoadmapEditorPayload } from '../components/RoadmapEditorDialog';

const CURRENT_USER = {
  id: 'me-user',
  name: '나의 로드맵',
  emoji: '🧑‍🚀',
  grade: 'self',
};

const SPACE_COLOR_PALETTE = ['#6C5CE7', '#3B82F6', '#EC4899', '#22C55E', '#F97316', '#EAB308'];

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
  subItem: {
    weekNumber?: number;
    weekLabel?: string;
    entryType?: 'goal' | 'task';
  } & Record<string, unknown>,
) {
  const normalizedMonths = itemMonths.length > 0 ? [...itemMonths].sort((a, b) => a - b) : [3];
  const fallbackMonth = normalizedMonths[0] ?? 3;
  const parsedFromLabel = parseMonthWeekFromLabel(subItem.weekLabel);

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
      ...subItem,
      weekNumber: normalizedWeek,
      weekLabel: buildMonthWeekLabel(normalizedMonth, normalizedWeek),
      entryType: subItem.entryType ?? 'task',
    };
  }

  // 2) 기존 데이터가 6,7,8주차처럼 전역 주차면 item.months 기준으로 월/주차 분해
  const rawWeekNumber = (() => {
    if (typeof subItem.weekNumber === 'number' && subItem.weekNumber > 0) return subItem.weekNumber;
    if (typeof parsedFromLabel.week === 'number' && parsedFromLabel.week > 0) return parsedFromLabel.week;
    const parsedFromWeekLabel = parseWeekNumberFromWeekLabel(subItem.weekLabel);
    return parsedFromWeekLabel && parsedFromWeekLabel > 0 ? parsedFromWeekLabel : 1;
  })();

  const monthOffset = Math.floor((rawWeekNumber - 1) / 5);
  const normalizedMonth = normalizedMonths[Math.min(monthOffset, normalizedMonths.length - 1)] ?? fallbackMonth;
  const normalizedWeek = ((rawWeekNumber - 1) % 5) + 1;

  return {
    ...subItem,
    weekNumber: normalizedWeek,
    weekLabel: buildMonthWeekLabel(normalizedMonth, normalizedWeek),
    entryType: subItem.entryType ?? 'task',
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
      };
    }),
  }));
}

function normalizeRoadmapStructure(roadmap: SharedRoadmap): SharedRoadmap {
  return {
    ...roadmap,
    shareScope: roadmap.shareScope ?? 'private',
    focusItemTypes: roadmap.focusItemTypes ?? ['award', 'activity', 'project', 'paper'],
    groupIds: roadmap.groupIds ?? [],
    items: (roadmap.items ?? []).map(item => ({
      ...item,
      subItems: (() => {
        const itemMonths = item.months?.length ? item.months : [3];
        const normalizedSubItems = (item.subItems ?? []).map(subItem => ({
          ...normalizeTodoMonthWeekByItemMonths(itemMonths, subItem),
        }));
        return normalizedSubItems.length > 0
          ? normalizedSubItems
          : createDefaultRoadmapSubItems(item.id, item.title);
      })(),
    })),
  };
}

interface UseDreamMateWorkspaceOptions {
  seedRoadmaps: SharedRoadmap[];
  seedSpaces: DreamSpace[];
  resources: DreamResource[];
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
  resources,
}: UseDreamMateWorkspaceOptions) {
  const [isWorkspaceLoaded, setIsWorkspaceLoaded] = useState(false);
  const [roadmaps, setRoadmaps] = useState<SharedRoadmap[]>(seedRoadmaps.map(normalizeRoadmapStructure));
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
    const loadedWorkspace = loadDreamMateWorkspaceState({
      roadmaps: seedRoadmaps,
      spaces: seedSpaces,
      roadmapReports: [],
    });
    setRoadmaps(loadedWorkspace.roadmaps.map(normalizeRoadmapStructure));
    setSpaces(loadedWorkspace.spaces.map(normalizeSpaceStructure));
    setRoadmapReports(loadedWorkspace.roadmapReports ?? []);
    setIsWorkspaceLoaded(true);
    setJoinedSpaceIds(loadJoinedSpaceIds());
    setReactions(loadDreamReactions());
  }, [seedRoadmaps, seedSpaces]);

  useEffect(() => {
    if (!isWorkspaceLoaded) return;
    saveDreamMateWorkspaceState({ roadmaps, spaces, roadmapReports });
  }, [isWorkspaceLoaded, roadmaps, spaces, roadmapReports]);

  const roadmapLikeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    roadmaps.forEach(roadmap => {
      counts[roadmap.id] = roadmap.likes + (reactions.likedRoadmapIds.includes(roadmap.id) ? 1 : 0);
    });
    return counts;
  }, [roadmaps, reactions.likedRoadmapIds]);

  const roadmapBookmarkCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    roadmaps.forEach(roadmap => {
      counts[roadmap.id] = roadmap.bookmarks + (reactions.bookmarkedRoadmapIds.includes(roadmap.id) ? 1 : 0);
    });
    return counts;
  }, [roadmaps, reactions.bookmarkedRoadmapIds]);

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

  const myRoadmaps = useMemo(
    () => roadmaps.filter(roadmap => roadmap.ownerId === CURRENT_USER.id),
    [roadmaps],
  );

  const bookmarkedRoadmaps = useMemo(
    () => roadmaps.filter(roadmap => reactions.bookmarkedRoadmapIds.includes(roadmap.id)),
    [roadmaps, reactions.bookmarkedRoadmapIds],
  );

  const bookmarkedResources = useMemo(
    () => resources.filter(resource => reactions.bookmarkedResourceIds.includes(resource.id)),
    [resources, reactions.bookmarkedResourceIds],
  );

  const handleToggleRoadmapLike = useCallback((roadmapId: string) => {
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
  }, []);

  const handleToggleRoadmapBookmark = useCallback((roadmapId: string) => {
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
  }, []);

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

  const handleJoinSpace = useCallback((spaceId: string) => {
    joinSpace(spaceId);
    setJoinedSpaceIds(loadJoinedSpaceIds());
  }, []);

  const handleLeaveSpace = useCallback((spaceId: string) => {
    leaveSpace(spaceId);
    setJoinedSpaceIds(loadJoinedSpaceIds());
  }, []);

  const handleCreateRoadmap = useCallback((payload: RoadmapEditorPayload) => {
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
      shareScope: 'private',
      items: toRoadmapItems(payload.items),
      groupIds: [],
      likes: 0,
      bookmarks: 0,
      sharedAt: new Date().toISOString(),
      comments: [],
    };
    setRoadmaps(prev => [newRoadmap, ...prev]);
    setShowCreateRoadmapDialog(false);
    setSelectedRoadmapId(newRoadmap.id);
  }, []);

  const handleUpdateRoadmap = useCallback((roadmapId: string, payload: RoadmapEditorPayload) => {
    setRoadmaps(prev => prev.map(roadmap => {
      if (roadmap.id !== roadmapId) return roadmap;
      return {
        ...roadmap,
        title: payload.title,
        description: payload.description,
        period: payload.period,
        starColor: payload.starColor,
        focusItemTypes: payload.focusItemTypes,
        groupIds: roadmap.groupIds ?? [],
        shareScope: roadmap.shareScope ?? 'private',
        items: payload.items.map(item => {
          const itemMonths = [...item.months].sort((a, b) => a - b);
          const cleanedSubItems = (item.subItems ?? []).map(subItem => ({
            ...normalizeTodoMonthWeekByItemMonths(itemMonths, subItem),
            title: String(subItem.title ?? '').trim(),
          })).filter(subItem => subItem.title.length > 0);

          return {
            ...item,
            months: itemMonths,
            subItems: cleanedSubItems.length > 0
              ? cleanedSubItems
              : createDefaultRoadmapSubItems(item.id, item.title),
          };
        }),
      };
    }));
    setEditingRoadmapId(null);
  }, []);

  const handleDeleteRoadmap = useCallback((roadmapId: string) => {
    setRoadmaps(prev => prev.filter(roadmap => roadmap.id !== roadmapId));
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
  }, []);

  const handleUseRoadmap = useCallback((roadmap: SharedRoadmap) => {
    const clonedRoadmap: SharedRoadmap = {
      ...roadmap,
      id: createId('roadmap'),
      ownerId: CURRENT_USER.id,
      ownerName: CURRENT_USER.name,
      ownerEmoji: CURRENT_USER.emoji,
      ownerGrade: CURRENT_USER.grade,
      title: roadmap.title,
      items: toRoadmapItems(roadmap.items),
      shareScope: 'private',
      groupIds: [],
      likes: 0,
      bookmarks: 0,
      comments: [],
      sharedAt: new Date().toISOString(),
    };
    setRoadmaps(prev => [clonedRoadmap, ...prev]);
    setSelectedRoadmapId(clonedRoadmap.id);
  }, []);

  const handleCreateRoadmapComment = useCallback((roadmapId: string, content: string, parentId?: string) => {
    setRoadmaps(prev => prev.map(roadmap => {
      if (roadmap.id !== roadmapId) return roadmap;
      return {
        ...roadmap,
        comments: [...roadmap.comments, {
          id: createId('comment'),
          parentId,
          authorId: CURRENT_USER.id,
          authorName: CURRENT_USER.name,
          authorEmoji: CURRENT_USER.emoji,
          content,
          createdAt: new Date().toISOString(),
        }],
      };
    }));
  }, []);

  const handleShareRoadmap = useCallback((roadmapId: string, shareScope: RoadmapShareScope, selectedSpaceIds: string[]) => {
    setRoadmaps(previousRoadmaps => previousRoadmaps.map(roadmap => {
      if (roadmap.id !== roadmapId) return roadmap;
      return {
        ...roadmap,
        shareScope,
        groupIds: shareScope === 'space' ? selectedSpaceIds : [],
      };
    }));
  }, []);

  const handleToggleTodoItem = useCallback((roadmapId: string, itemId: string, todoId: string) => {
    setRoadmaps(previousRoadmaps => previousRoadmaps.map(roadmap => {
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
    }));
  }, []);

  const visibleRoadmaps = useMemo(
    () => roadmaps.filter(roadmap => {
      const scope = roadmap.shareScope ?? 'private';
      return scope === 'public';
    }),
    [roadmaps],
  );

  const handleCreateSpace = useCallback((name: string, description: string, emoji: string) => {
    const newSpace: DreamSpace = {
      id: createId('space'),
      name,
      emoji,
      description: description || `${name} 스페이스`,
      color: SPACE_COLOR_PALETTE[Math.floor(Math.random() * SPACE_COLOR_PALETTE.length)],
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
      tags: [],
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

  return {
    currentUserId: CURRENT_USER.id,
    roadmaps,
    visibleRoadmaps,
    spaces,
    joinedSpaceIds,
    reactions,
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

