/**
 * career_plan API 응답 → DreamMate `SharedRoadmap` UI 모델 매핑
 */

import type {
  DreamItemType,
  PeriodType,
  RoadmapComment,
  RoadmapItem,
  RoadmapMilestoneResult,
  RoadmapShareChannel,
  RoadmapShareScope,
  RoadmapTodoItem,
  SharedRoadmap,
} from '@/app/dreammate/types';
import type { RoadmapEditorPayload } from '@/app/dreammate/components/RoadmapEditorDialog';
import type {
  ApiAuthMeUser,
  ApiRoadmapDetail,
  ApiRoadmapItem,
  ApiRoadmapMilestone,
  ApiRoadmapTodo,
  ApiSharedDreamRoadmapCommentRow,
  ApiSharedDreamRoadmapRow,
} from '@/lib/dreammate/dreamRoadmapApi';

function shareTypeToScopeAndChannels(
  shareType: string,
): { shareScope: RoadmapShareScope; shareChannels: RoadmapShareChannel[] } {
  if (shareType === 'public') return { shareScope: 'public', shareChannels: ['public'] };
  if (shareType === 'space') return { shareScope: 'space', shareChannels: ['space'] };
  return { shareScope: 'private', shareChannels: [] };
}

function mapApiTodoToSubItem(todo: ApiRoadmapTodo): RoadmapTodoItem {
  const entry = todo.entry_type === 'goal' ? 'goal' : 'task';
  return {
    id: todo.id,
    weekLabel: todo.week_label ?? undefined,
    weekNumber: todo.week_number ?? undefined,
    entryType: entry,
    title: todo.title,
    isDone: todo.is_done,
    note: todo.note ?? undefined,
    outputRef: todo.output_ref ?? undefined,
  };
}

function mapApiItemToRoadmapItem(item: ApiRoadmapItem): RoadmapItem {
  return {
    id: item.id,
    type: item.type as DreamItemType,
    title: item.title,
    months: Array.isArray(item.months) && item.months.length > 0 ? item.months : [3],
    difficulty: item.difficulty,
    targetOutput: item.target_output ?? undefined,
    successCriteria: item.success_criteria ?? undefined,
    subItems: (item.todos ?? []).map(mapApiTodoToSubItem),
  };
}

function mapApiMilestoneToResult(m: ApiRoadmapMilestone): RoadmapMilestoneResult {
  return {
    id: m.id,
    title: m.title,
    description: m.description ?? undefined,
    monthWeekLabel: m.month_week_label ?? undefined,
    timeLog: m.time_log ?? undefined,
    resultUrl: m.result_url ?? undefined,
    imageUrl: m.image_url ?? undefined,
    recordedAt: m.recorded_at ?? undefined,
  };
}

function mapApiCommentsToUi(
  rows: ApiSharedDreamRoadmapCommentRow[] | undefined,
): RoadmapComment[] {
  if (!rows?.length) return [];
  return rows.map(row => ({
    id: row.id,
    parentId: row.parent ?? undefined,
    authorId: row.author.id,
    authorName: row.author.name,
    authorEmoji: row.author.emoji ?? '🙂',
    content: row.content,
    createdAt: row.created_at,
  }));
}

export function mapApiRoadmapDetailToSharedRoadmap(params: {
  roadmap: ApiRoadmapDetail;
  me: ApiAuthMeUser | null | undefined;
  sharedRow?: ApiSharedDreamRoadmapRow | null;
  feedMeta?: {
    likes: number;
    bookmarks: number;
    viewCount?: number;
    commentCount?: number;
    reportCount?: number;
    sharedAt: string;
    likedByMe?: boolean;
    bookmarkedByMe?: boolean;
  };
}): SharedRoadmap {
  const { roadmap, me, sharedRow, feedMeta } = params;
  const ownerUserId = sharedRow?.user ?? roadmap.user;
  const isMine = Boolean(me && String(ownerUserId) === String(me.id));
  const ownerName = isMine && me ? me.name : roadmap.user_name;
  const ownerEmoji = isMine && me ? (me.emoji ?? '🧑‍🚀') : '🙂';
  const ownerGrade = isMine && me ? (me.grade ?? 'self') : 'peer';

  const shareFromRow = sharedRow
    ? shareTypeToScopeAndChannels(sharedRow.share_type)
    : { shareScope: 'private' as const, shareChannels: [] as RoadmapShareChannel[] };

  const groupIds = sharedRow?.group_ids ?? [];

  return {
    id: roadmap.id,
    sharedDreamRoadmapId: sharedRow?.id,
    ownerId: String(ownerUserId),
    ownerName,
    ownerEmoji,
    ownerGrade,
    title: roadmap.title,
    description: roadmap.description ?? '',
    period: roadmap.period as PeriodType,
    starColor: roadmap.star_color,
    focusItemTypes: (roadmap.focus_item_types ?? []) as DreamItemType[],
    shareScope: shareFromRow.shareScope,
    shareChannels: shareFromRow.shareChannels,
    items: (roadmap.items ?? []).map(mapApiItemToRoadmapItem),
    finalResultTitle: roadmap.final_result_title ?? undefined,
    finalResultDescription: roadmap.final_result_description ?? undefined,
    finalResultUrl: roadmap.final_result_url ?? undefined,
    finalResultImageUrl: roadmap.final_result_image_url ?? undefined,
    milestoneResults: (roadmap.milestones ?? []).map(mapApiMilestoneToResult),
    groupIds: Array.isArray(groupIds) ? groupIds.map(String) : [],
    likes: feedMeta?.likes ?? sharedRow?.like_count ?? 0,
    bookmarks: feedMeta?.bookmarks ?? sharedRow?.bookmark_count ?? 0,
    likedByMe: feedMeta?.likedByMe ?? sharedRow?.liked_by_me,
    bookmarkedByMe: feedMeta?.bookmarkedByMe ?? sharedRow?.bookmarked_by_me,
    viewCount: feedMeta?.viewCount ?? sharedRow?.view_count,
    commentCount: feedMeta?.commentCount ?? sharedRow?.comment_count,
    reportCount: feedMeta?.reportCount ?? sharedRow?.report_count,
    sharedAt: feedMeta?.sharedAt ?? sharedRow?.shared_at ?? roadmap.created_at,
    comments: mapApiCommentsToUi(
      (sharedRow as ApiSharedDreamRoadmapRow & { comments?: ApiSharedDreamRoadmapCommentRow[] })
        ?.comments,
    ),
  };
}

export function mapSharedFeedRowToSharedRoadmap(
  row: ApiSharedDreamRoadmapRow,
  me: ApiAuthMeUser | null | undefined,
): SharedRoadmap {
  return mapApiRoadmapDetailToSharedRoadmap({
    roadmap: row.roadmap,
    me,
    sharedRow: row,
    feedMeta: {
      likes: row.like_count,
      bookmarks: row.bookmark_count,
      viewCount: row.view_count,
      commentCount: row.comment_count,
      reportCount: row.report_count,
      sharedAt: row.shared_at,
      likedByMe: row.liked_by_me,
      bookmarkedByMe: row.bookmarked_by_me,
    },
  });
}

export function mergeSharedRoadmapByRoadmapId(
  primary: SharedRoadmap,
  secondary: SharedRoadmap,
): SharedRoadmap {
  return {
    ...primary,
    ...secondary,
    sharedDreamRoadmapId: secondary.sharedDreamRoadmapId ?? primary.sharedDreamRoadmapId,
    likes: secondary.likes ?? primary.likes,
    bookmarks: secondary.bookmarks ?? primary.bookmarks,
    likedByMe: secondary.likedByMe ?? primary.likedByMe,
    bookmarkedByMe: secondary.bookmarkedByMe ?? primary.bookmarkedByMe,
    comments: secondary.comments?.length ? secondary.comments : primary.comments,
    groupIds: secondary.groupIds?.length ? secondary.groupIds : primary.groupIds,
    shareChannels:
      (secondary.shareChannels?.length ?? 0) > 0 ? secondary.shareChannels : primary.shareChannels,
    shareScope: secondary.shareScope ?? primary.shareScope,
  };
}

export function mergeRoadmapListsUnique(
  mine: SharedRoadmap[],
  feed: SharedRoadmap[],
): SharedRoadmap[] {
  const map = new Map<string, SharedRoadmap>();
  for (const r of mine) map.set(r.id, r);
  for (const r of feed) {
    const existing = map.get(r.id);
    map.set(r.id, existing ? mergeSharedRoadmapByRoadmapId(existing, r) : r);
  }
  return Array.from(map.values());
}

export function mapEditorPayloadToRoadmapCreateBody(
  payload: RoadmapEditorPayload,
): Record<string, unknown> {
  return {
    title: payload.title,
    description: payload.description,
    period: payload.period,
    star_color: payload.starColor,
    focus_item_types: payload.focusItemTypes,
    final_result_title: payload.finalResultTitle ?? '',
    final_result_description: payload.finalResultDescription ?? '',
    final_result_url: payload.finalResultUrl ?? '',
    final_result_image_url: payload.finalResultImageUrl ?? '',
    items: payload.items.map((item, itemIdx) => ({
      type: item.type,
      title: item.title,
      months: item.months,
      difficulty: item.difficulty,
      target_output: item.targetOutput ?? '',
      success_criteria: item.successCriteria ?? '',
      sort_order: itemIdx,
      todos: (item.subItems ?? []).map((sub, idx) => ({
        week_label: sub.weekLabel ?? '',
        week_number: sub.weekNumber ?? null,
        entry_type: sub.entryType ?? 'task',
        title: sub.title,
        is_done: sub.isDone ?? false,
        note: sub.note ?? '',
        output_ref: sub.outputRef ?? '',
        sort_order: idx,
      })),
    })),
    milestones: (payload.milestoneResults ?? []).map((m, idx) => ({
      title: m.title,
      description: m.description ?? '',
      month_week_label: m.monthWeekLabel ?? '',
      time_log: m.timeLog ?? '',
      result_url: m.resultUrl ?? '',
      image_url: m.imageUrl ?? '',
      recorded_at: m.recordedAt ?? null,
      sort_order: idx,
    })),
  };
}

export function mapEditorPayloadToRoadmapUpdateBody(
  payload: RoadmapEditorPayload,
): Record<string, unknown> {
  return mapEditorPayloadToRoadmapCreateBody(payload);
}
