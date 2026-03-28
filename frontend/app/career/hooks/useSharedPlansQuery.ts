'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchSharedPlans } from '@/lib/career-path/sharedPlanApi';
import type { SharedPlan } from '@/app/career/components/community/types';
import { CAREER_QUERY_GC_TIME_MS, CAREER_QUERY_STALE_TIME_MS } from './careerPathQueryCache';

export const CAREER_SHARED_PLANS_QUERY_KEY = ['sharedPlans', 'career'] as const;

/** React는 `[]` 리터럴마다 새 참조를 만들므로, 로딩 중 매 렌더마다 의존성이 바뀌어 무한 업데이트가 날 수 있음 */
const EMPTY_SHARED_PLANS: SharedPlan[] = [];

function mapApiSharedPlanToUi(api: Awaited<ReturnType<typeof fetchSharedPlans>>[0]): SharedPlan {
  return {
    id: api.id,
    planId: api.career_plan,
    ownerId: api.user.id,
    ownerName: api.user.name,
    ownerEmoji: api.user.emoji,
    ownerGrade: api.user.grade,
    schoolId: '',
    shareType: api.share_type as SharedPlan['shareType'],
    title: api.career_plan_title,
    description: api.description ?? undefined,
    jobEmoji: api.job_emoji,
    jobName: api.job_name,
    starName: api.star_name,
    starEmoji: '',
    starColor: api.star_color,
    yearCount: 0,
    itemCount: 0,
    sharedAt: api.shared_at,
    updatedAt: api.updated_at,
    likes: api.like_count,
    bookmarks: api.bookmark_count,
    years: [],
    operatorComments: [],
    groupIds: Array.isArray(api.group_ids) ? api.group_ids : [],
    tags: api.tags,
    commentCount: api.comment_count,
  };
}

/** 커뮤니티 피드 — 백엔드 공유 패스만 (비로그인은 public 목록) */
export function useSharedPlansQuery() {
  const query = useQuery({
    queryKey: CAREER_SHARED_PLANS_QUERY_KEY,
    queryFn: async () => {
      const apiPlans = await fetchSharedPlans();
      return apiPlans.map(mapApiSharedPlanToUi);
    },
    staleTime: CAREER_QUERY_STALE_TIME_MS.sharedPlansList,
    gcTime: CAREER_QUERY_GC_TIME_MS,
  });

  return {
    data: query.data ?? EMPTY_SHARED_PLANS,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
