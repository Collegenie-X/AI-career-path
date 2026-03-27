'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchSharedPlans, hasCareerPathBackendAuth } from '@/lib/career-path/sharedPlanApi';
import type { SharedPlan } from '@/app/career/components/community/types';
import communityData from '@/data/share-community.json';

const sharedPlansQueryKey = ['sharedPlans', 'career'] as const;

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
    groupIds: [],
    tags: api.tags,
  };
}

export function useSharedPlansQuery() {
  const useBackend = hasCareerPathBackendAuth();

  const query = useQuery({
    queryKey: sharedPlansQueryKey,
    queryFn: async () => {
      const apiPlans = await fetchSharedPlans();
      return apiPlans.map(mapApiSharedPlanToUi);
    },
    enabled: useBackend,
    staleTime: 30_000,
  });

  if (!useBackend) {
    return {
      data: (communityData.sharedPlans ?? []) as SharedPlan[],
      isLoading: false,
      isError: false,
      error: null,
      refetch: async () => ({ data: [] as SharedPlan[] }),
    };
  }

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
