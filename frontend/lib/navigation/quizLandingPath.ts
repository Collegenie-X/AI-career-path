import { storage } from '@/lib/storage';
import { ROUTES } from '@/app/quiz/config';

/**
 * 적성 검사 진입 목적지 (동기 전용 — 탭·헤더 등)
 * - 서버에 저장된 결과 id 가 있으면 `/quiz` 로 보내 비동기로 GET 복원 후 분기
 * - 로컬 RIASEC 만 있으면 → 결과 리포트
 * - 없음 → 인트로
 *
 * 서버 우선 분기는 `resolveQuizLandingPath` (`/quiz` 페이지) 에서 처리합니다.
 */
export function getQuizLandingPath(): string {
  if (typeof window === 'undefined') {
    return ROUTES.quiz;
  }
  try {
    if (storage.quiz.getLastResultId()) {
      return ROUTES.quiz;
    }
    return storage.riasec.get() ? ROUTES.quizResults : ROUTES.quizIntro;
  } catch {
    return ROUTES.quizIntro;
  }
}
