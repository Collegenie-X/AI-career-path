'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchMySharedPlans, hasCareerPathBackendAuth } from '@/lib/career-path/sharedPlanApi';
import type { CareerPlan } from '@/app/career/components/CareerPathBuilder';
import { CAREER_QUERY_GC_TIME_MS, CAREER_QUERY_STALE_TIME_MS } from './careerPathQueryCache';

export const MY_SHARED_PLANS_QUERY_KEY = ['mySharedPlans', 'career'] as const;

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
    queryKey: MY_SHARED_PLANS_QUERY_KEY,
    queryFn: async () => {
      const apiPlans = await fetchMySharedPlans();
      return apiPlans.map(mapApiSharedPlanToCareerPlan);
    },
    enabled: useBackend,
    staleTime: CAREER_QUERY_STALE_TIME_MS.mySharedPlans,
    gcTime: CAREER_QUERY_GC_TIME_MS,
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
