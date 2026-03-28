'use client';

import type { QueryClient } from '@tanstack/react-query';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { SharedPlan } from '@/app/career/components/community/types';
import { fetchSharedPlanDetailById } from '@/lib/career-path/sharedPlanApi';
import { mapApiSharedPlanDetailToCommunitySharedPlan } from '@/lib/career-path/mapSharedPlanCommunityDetail';
import { isUuidString } from '@/lib/career-path/isUuidString';
import { CAREER_QUERY_GC_TIME_MS, CAREER_QUERY_STALE_TIME_MS } from './careerPathQueryCache';
import { CAREER_SHARED_PLANS_QUERY_KEY } from './useSharedPlansQuery';

export function sharedPlanCommunityDetailQueryKey(sharedPlanId: string) {
  return ['sharedPlanCommunityDetail', sharedPlanId] as const;
}

async function fetchSharedPlanCommunityDetail(sharedPlanId: string): Promise<SharedPlan> {
  const raw = await fetchSharedPlanDetailById(sharedPlanId);
  return mapApiSharedPlanDetailToCommunitySharedPlan(raw);
}

const detailCacheOptions = {
  staleTime: CAREER_QUERY_STALE_TIME_MS.sharedPlanDetail,
  gcTime: CAREER_QUERY_GC_TIME_MS,
} as const;

/**
 * 상세 데이터를 미리 가져와 선택 시 네트워크 대기를 줄입니다.
 * (목록 호버, 탭 선택 직후 등)
 */
export async function prefetchSharedPlanCommunityDetail(
  queryClient: QueryClient,
  sharedPlanId: string,
): Promise<void> {
  if (!isUuidString(sharedPlanId)) return;
  await queryClient.prefetchQuery({
    queryKey: sharedPlanCommunityDetailQueryKey(sharedPlanId),
    queryFn: () => fetchSharedPlanCommunityDetail(sharedPlanId),
    ...detailCacheOptions,
  });
}

/**
 * 커뮤니티에서 카드 선택 시 타임라인·댓글을 채우기 위한 상세 조회 (비로그인도 public 패스 조회 가능)
 * - 목록 캐시에 동일 id가 있으면 placeholder로 즉시 표시
 */
export function useSharedPlanCommunityDetailQuery(sharedPlanId: string | null) {
  const queryClient = useQueryClient();
  const enabled = Boolean(sharedPlanId) && isUuidString(String(sharedPlanId));

  const listPlaceholder =
    enabled && sharedPlanId
      ? queryClient
          .getQueryData<SharedPlan[]>(CAREER_SHARED_PLANS_QUERY_KEY)
          ?.find((p) => p.id === sharedPlanId)
      : undefined;

  return useQuery({
    queryKey: sharedPlanId ? sharedPlanCommunityDetailQueryKey(sharedPlanId) : ['sharedPlanCommunityDetail', 'none'],
    queryFn: () => fetchSharedPlanCommunityDetail(sharedPlanId!),
    enabled,
    ...detailCacheOptions,
    placeholderData: listPlaceholder,
  });
}
