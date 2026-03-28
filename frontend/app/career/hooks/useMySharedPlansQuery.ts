'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchMySharedPlans, hasCareerPathBackendAuth } from '@/lib/career-path/sharedPlanApi';
import type { CareerPlan } from '@/app/career/components/CareerPathBuilder';

const mySharedPlansQueryKey = ['mySharedPlans', 'career'] as const;

const EMPTY_MY_SHARED_PLANS: CareerPlan[] = [];

function mapApiSharedPlanToCareerPlan(api: Awaited<ReturnType<typeof fetchMySharedPlans>>[0]): CareerPlan {
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

/** 내가 공유한 패스 — GET .../shared-plans/mine/ */
export function useMySharedPlansQuery() {
  const useBackend = hasCareerPathBackendAuth();

  const query = useQuery({
    queryKey: mySharedPlansQueryKey,
    queryFn: async () => {
      const apiPlans = await fetchMySharedPlans();
      return apiPlans.map(mapApiSharedPlanToCareerPlan);
    },
    enabled: useBackend,
    staleTime: 30_000,
  });

  if (!useBackend) {
    return {
      data: EMPTY_MY_SHARED_PLANS,
      isLoading: false,
      isError: false,
      error: null,
      refetch: async () => ({ data: EMPTY_MY_SHARED_PLANS }),
    };
  }

  return {
    data: query.data ?? EMPTY_MY_SHARED_PLANS,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
