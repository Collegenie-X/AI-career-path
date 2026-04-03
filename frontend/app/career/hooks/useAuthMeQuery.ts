'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchAuthMe } from '@/lib/auth/authApi';
import { getAccessToken } from '@/lib/auth/jwtStorage';
import { CAREER_QUERY_GC_TIME_MS, CAREER_QUERY_STALE_TIME_MS } from './careerPathQueryCache';

const authMeKey = ['auth', 'me'] as const;

export function useAuthMeQuery() {
  const hasToken = typeof window !== 'undefined' && Boolean(getAccessToken());
  return useQuery({
    queryKey: authMeKey,
    queryFn: fetchAuthMe,
    enabled: hasToken,
    staleTime: CAREER_QUERY_STALE_TIME_MS.communityGroups,
    gcTime: CAREER_QUERY_GC_TIME_MS,
  });
}
