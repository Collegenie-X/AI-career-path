/**
 * - 프로덕션·배포: 기본은 빈 origin → 브라우저가 `/api/v1/...` 로 요청하고 Next.js rewrites 가 백엔드로 넘깁니다.
 * - 로컬 개발: `next dev` 에서는 rewrite 없이도 되도록 기본값으로 `http://127.0.0.1:8000` 을 씁니다
 *   (Next 프록시가 백엔드에 붙지 않을 때 `ECONNREFUSED` 방지). 백엔드 포트가 다르면 `.env.local` 로 덮어씁니다.
 *
 * 예: NEXT_PUBLIC_API_ORIGIN=http://127.0.0.1:8000
 */
function trimTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

/**
 * 동일 출처(상대 경로)만 쓸 때는 빈 문자열.
 * 백엔드 절대 URL 을 쓸 때는 `http://host:port` 형태(끝 슬래시 없음).
 */
export function getApiOrigin(): string {
  if (process.env.NEXT_PUBLIC_API_USE_RELATIVE === '1') {
    return '';
  }
  const fromEnv = process.env.NEXT_PUBLIC_API_ORIGIN?.trim();
  if (fromEnv) {
    return trimTrailingSlash(fromEnv);
  }
  if (process.env.NODE_ENV === 'development') {
    return 'http://127.0.0.1:8000';
  }
  return '';
}

/**
 * @deprecated 동일 의미로 `getApiOrigin` 사용 권장
 */
export const API_BASE_PATH = '';

export const API_PATHS = {
  quizQuestions: '/api/v1/quiz/questions/',
  /** 8개 왕국(직업군) — backend `apps/quiz/data/kingdoms.json` */
  careerKingdoms: '/api/v1/explore/career-kingdoms/',
  /** 직업 설명 콘텐츠 — `jobs.json` (쿼리 `kingdom_id` 선택) */
  careerJobs: '/api/v1/explore/career-jobs/',
  /** 커리어 패스 CRUD — `apps.career_path` */
  careerPlans: '/api/v1/career-path/career-plans/',
  careerPathSchools: '/api/v1/career-path/schools/',
  careerPathGroups: '/api/v1/career-path/groups/',
  careerPathSharedPlans: '/api/v1/career-path/shared-plans/',
  /** DreamMate 커리어 실행 — `apps.career_plan` */
  dreamMateRoadmaps: '/api/v1/career-plan/roadmaps/',
  dreamMateSharedDreamRoadmaps: '/api/v1/career-plan/shared-dream-roadmaps/',
  /** DreamMate 실행계획 AI (주간 WBS 초안) — `apps.career_plan` */
  executionPlanAiGenerate: '/api/v1/career-plan/execution-plan-ai/generate/',
  /** 인증 API — `apps.accounts` */
  auth: {
    emailSignup: '/api/v1/auth/email-signup/',
    emailLogin: '/api/v1/auth/email-login/',
    socialLogin: '/api/v1/auth/social-login/',
    tokenRefresh: '/api/v1/auth/token/refresh/',
    me: '/api/v1/auth/me/',
  },
} as const;

/**
 * Django APPEND_SLASH: 쿼리 앞 경로 끝에 슬래시를 두어 301 리다이렉트를 피합니다.
 */
export function buildApiUrl(path: string): string {
  let normalized = path.startsWith('/') ? path : `/${path}`;
  const qIndex = normalized.indexOf('?');
  const pathPart = qIndex === -1 ? normalized : normalized.slice(0, qIndex);
  const queryPart = qIndex === -1 ? '' : normalized.slice(qIndex);
  const withSlash = pathPart.endsWith('/') ? pathPart : `${pathPart}/`;
  normalized = `${withSlash}${queryPart}`;

  const origin = getApiOrigin();
  return origin ? `${origin}${normalized}` : normalized;
}
