import type { QueryClient } from '@tanstack/react-query';

/** `useCareerPlansController` 목록 쿼리와 동일 키 — 로그인 후 무효화 시 사용 */
export const CAREER_PLANS_MINE_QUERY_KEY = ['careerPlans', 'mine'] as const;

/**
 * 로그인·회원가입 직후 JWT 가 바뀌면, 이전 게스트/무인증 캐시를 버리고 백엔드 데이터를 다시 불러오도록 합니다.
 * (DreamMate 로드맵, 커리어 패스 피드, 커뮤니티 그룹 등)
 */
export async function invalidateSessionQueries(queryClient: QueryClient): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['dreammate'] }),
    queryClient.invalidateQueries({ queryKey: ['sharedPlans', 'career'] }),
    queryClient.invalidateQueries({ queryKey: ['mySharedPlans', 'career'] }),
    queryClient.invalidateQueries({ queryKey: ['sharedPlanCommunityDetail'] }),
    queryClient.invalidateQueries({ queryKey: CAREER_PLANS_MINE_QUERY_KEY }),
    queryClient.invalidateQueries({ queryKey: ['careerPath'] }),
    queryClient.invalidateQueries({ queryKey: ['auth', 'me'] }),
  ]);
}
