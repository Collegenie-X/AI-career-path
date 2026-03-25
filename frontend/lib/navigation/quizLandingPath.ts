import { storage } from '@/lib/storage';
import { ROUTES } from '@/app/quiz/config';

/**
 * 적성 검사 진입 목적지 (localStorage `dreampath_riasec_result` 기준)
 * - 결과 있음 → 결과 리포트
 * - 없음 → 퀘스트 인트로
 *
 * 상단/하단 탭 클릭·프로그램 내비게이션에서 동일하게 사용합니다.
 */
export function getQuizLandingPath(): string {
  if (typeof window === 'undefined') {
    return ROUTES.quiz;
  }
  try {
    return storage.riasec.get() ? ROUTES.quizResults : ROUTES.quizIntro;
  } catch {
    return ROUTES.quizIntro;
  }
}
