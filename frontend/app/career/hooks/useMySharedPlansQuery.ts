'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchSharedPlans, hasCareerPathBackendAuth } from '@/lib/career-path/sharedPlanApi';
import type { CareerPlan } from '@/app/career/components/CareerPathBuilder';

const mySharedPlansQueryKey = ['mySharedPlans', 'career'] as const;

function mapApiSharedPlanToCareerPlan(api: Awaited<ReturnType<typeof fetchSharedPlans>>[0]): CareerPlan {
  return {
    id: api.career_plan,
    starId: '',
    starName: api.star_name,
    starEmoji: '',
    starColor: api.star_color,
    jobId: '',
    jobName: api.job_name,
    jobEmoji: api.job_emoji,
    title: api.career_plan_title,
    description: api.description ?? undefined,
    createdAt: api.shared_at,
    isPublic: true,
    shareType: api.share_type as CareerPlan['shareType'],
    sharedAt: api.shared_at,
    years: [],
  };
}

export function useMySharedPlansQuery() {
  const useBackend = hasCareerPathBackendAuth();

  const query = useQuery({
    queryKey: mySharedPlansQueryKey,
    queryFn: async () => {
      const apiPlans = await fetchSharedPlans();
      const myUserId = '';
      return apiPlans
        .filter(p => p.user.id === myUserId)
        .map(mapApiSharedPlanToCareerPlan);
    },
    enabled: useBackend,
    staleTime: 30_000,
  });

  if (!useBackend) {
    return {
      data: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: async () => ({ data: [] as CareerPlan[] }),
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
