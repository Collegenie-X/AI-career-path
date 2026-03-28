/**
 * 커리어 패스 백엔드 연동 시 React Query 캐시 정책 (staleTime / gcTime).
 * - staleTime이 길수록 동일 데이터 재요청이 줄어 체감 속도가 좋아집니다.
 * - mutation 후에는 invalidate 또는 setQueryData로 일관성을 맞춥니다.
 */
export const CAREER_QUERY_STALE_TIME_MS = {
  /** 공유 패스 목록 피드 */
  sharedPlansList: 120_000,
  /** 내가 공유한 패스 목록 */
  mySharedPlans: 120_000,
  /** 내 커리어 플랜(빌더/타임라인) */
  careerPlansMine: 90_000,
  /** 커뮤니티 그룹·학교 목록 */
  communityGroups: 120_000,
  communitySchools: 120_000,
  /** 공유 패스 상세(타임라인·댓글) */
  sharedPlanDetail: 120_000,
} as const;

/** 메모리에 유지 시간 — 탭 이동 후 돌아와도 즉시 표시 */
export const CAREER_QUERY_GC_TIME_MS = 45 * 60_000;
