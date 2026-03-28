'use client';

import { useQuery } from '@tanstack/react-query';
import type { SharedPlan } from '@/app/career/components/community/types';
import { fetchSharedPlanDetailById } from '@/lib/career-path/sharedPlanApi';
import { mapApiSharedPlanDetailToCommunitySharedPlan } from '@/lib/career-path/mapSharedPlanCommunityDetail';
import { isUuidString } from '@/lib/career-path/isUuidString';

export function sharedPlanCommunityDetailQueryKey(sharedPlanId: string) {
  return ['sharedPlanCommunityDetail', sharedPlanId] as const;
}

/**
 * 커뮤니티에서 카드 선택 시 타임라인·댓글을 채우기 위한 상세 조회 (비로그인도 public 패스 조회 가능)
 */
export function useSharedPlanCommunityDetailQuery(sharedPlanId: string | null) {
  const enabled = Boolean(sharedPlanId) && isUuidString(String(sharedPlanId));
  return useQuery({
    queryKey: sharedPlanId ? sharedPlanCommunityDetailQueryKey(sharedPlanId) : ['sharedPlanCommunityDetail', 'none'],
    queryFn: async (): Promise<SharedPlan> => {
      const raw = await fetchSharedPlanDetailById(sharedPlanId!);
      return mapApiSharedPlanDetailToCommunitySharedPlan(raw);
    },
    enabled,
    staleTime: 15_000,
  });
}
