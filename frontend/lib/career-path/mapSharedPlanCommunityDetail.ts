/**
 * 공유 패스 상세 API(JSON) → 커뮤니티 UI SharedPlan 매핑
 */

import type { SharedPlan, SharedPlanYear, SharedPlanGoalGroup, SharedPlanItem, OperatorComment } from '@/app/career/components/community/types';
import type { ApiPlanYear, ApiPlanItem } from '@/lib/career-path/mapCareerPlanApi';
import type { ApiSharedPlanDetail, ApiSharedPlanCommentRow } from '@/lib/career-path/sharedPlanApi';

type ApiCareerPlanNested = {
  id: string;
  title: string;
  job_emoji?: string;
  job_name?: string;
  star_name?: string;
  star_emoji?: string;
  star_color?: string;
  years?: ApiPlanYear[];
};

function mapApiCommentToOperatorComment(c: ApiSharedPlanCommentRow, planOwnerId: string): OperatorComment {
  const isOwnerAuthor = c.author.id === planOwnerId;
  return {
    id: c.id,
    parentId: c.parent ?? undefined,
    authorId: c.author.id,
    authorName: c.author.name,
    authorEmoji: c.author.emoji || '🧑',
    authorRole: isOwnerAuthor ? 'operator' : 'peer',
    content: c.content,
    createdAt: c.created_at,
  };
}

function mapApiPlanItemToSharedItem(item: ApiPlanItem): SharedPlanItem {
  const months = Array.isArray(item.months) ? item.months : [];
  return {
    id: item.id,
    type: item.type as SharedPlanItem['type'],
    title: item.title,
    month: months[0] ?? 1,
    difficulty: item.difficulty ?? 1,
    cost: item.cost ?? undefined,
    organizer: item.organizer ?? undefined,
    url: item.url ?? undefined,
    description: item.description ?? undefined,
    categoryTags: (item.category_tags ?? []) as SharedPlanItem['categoryTags'],
    activitySubtype: item.activity_subtype as SharedPlanItem['activitySubtype'],
    subItems: (item.sub_items ?? []).map((s) => ({
      id: s.id,
      title: s.title,
      done: s.is_done,
      url: s.url ?? undefined,
      description: s.description ?? undefined,
    })),
    links: (item.links ?? []).map((l) => ({
      title: l.title,
      url: l.url,
      kind: l.kind ?? undefined,
    })),
  };
}

function mapApiYearToSharedYear(y: ApiPlanYear): SharedPlanYear {
  const goalGroups: SharedPlanGoalGroup[] = (y.goal_groups ?? []).map((gg) => ({
    goal: gg.goal,
    items: (gg.items ?? []).map(mapApiPlanItemToSharedItem),
  }));
  const goals = goalGroups.map((g) => g.goal);
  const rootItems = (y.items ?? []).map(mapApiPlanItemToSharedItem);
  return {
    gradeId: y.grade_id,
    gradeLabel: y.grade_label,
    goalGroups: goalGroups.length ? goalGroups : undefined,
    goals,
    items: rootItems,
  };
}

function countItemsInYears(years: SharedPlanYear[]): number {
  let n = 0;
  for (const y of years) {
    if (y.goalGroups?.length) {
      for (const g of y.goalGroups) n += g.items.length;
    }
    n += y.items.length;
  }
  return n;
}

/** 백엔드 상세 응답 → 커뮤니티 SharedPlan (타임라인·댓글 포함) */
export function mapApiSharedPlanDetailToCommunitySharedPlan(detail: ApiSharedPlanDetail): SharedPlan {
  const cp = detail.career_plan as ApiCareerPlanNested;
  const years: SharedPlanYear[] = (cp?.years ?? []).map(mapApiYearToSharedYear);
  const comments = (detail.comments ?? []).map((c) =>
    mapApiCommentToOperatorComment(c, detail.user.id),
  );

  return {
    id: detail.id,
    planId: cp?.id ?? String(detail.career_plan),
    ownerId: detail.user.id,
    ownerName: detail.user.name,
    ownerEmoji: detail.user.emoji || '🧑',
    ownerGrade: detail.user.grade || '',
    schoolId: detail.school?.id ?? '',
    shareType: detail.share_type as SharedPlan['shareType'],
    title: cp?.title ?? detail.career_plan_title ?? '',
    description: detail.description ?? undefined,
    jobEmoji: cp?.job_emoji ?? detail.job_emoji ?? '',
    jobName: cp?.job_name ?? detail.job_name ?? '',
    starName: cp?.star_name ?? detail.star_name ?? '',
    starEmoji: cp?.star_emoji ?? '',
    starColor: cp?.star_color ?? detail.star_color ?? '#6C5CE7',
    yearCount: years.length,
    itemCount: countItemsInYears(years),
    sharedAt: detail.shared_at,
    updatedAt: detail.updated_at,
    likes: detail.like_count,
    bookmarks: detail.bookmark_count,
    years,
    operatorComments: comments,
    groupIds: (detail.groups ?? []).map((g) => g.id),
    tags: detail.tags,
    commentCount: detail.comment_count,
  };
}
