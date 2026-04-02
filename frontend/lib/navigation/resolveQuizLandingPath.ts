import type { QueryClient } from '@tanstack/react-query';
import { storage } from '@/lib/storage';
import { ROUTES } from '@/app/quiz/config';
import { fetchQuizResultById } from '@/lib/queries/fetchQuizResultById';
import { mapQuizResultApiToRiasec } from '@/lib/queries/mapQuizResultApiToRiasec';
import { quizRiasecResultQueryKey } from '@/lib/queries/quizRiasecQuery';

/**
 * 1) localStorage 에 저장된 서버 결과 UUID 가 있으면 GET 으로 복원 → 리포트
 * 2) 없으면 로컬 RIASEC → 리포트
 * 3) 둘 다 없으면 인트로(퀴즈)
 */
export async function resolveQuizLandingPath(queryClient: QueryClient): Promise<string> {
  const serverId = storage.quiz.getLastResultId();
  if (serverId) {
    try {
      const row = await fetchQuizResultById(serverId);
      if (row) {
        const riasec = mapQuizResultApiToRiasec(row);
        storage.riasec.set(riasec);
        queryClient.setQueryData(quizRiasecResultQueryKey, riasec);
        return ROUTES.quizResults;
      }
      storage.quiz.clearLastResultId();
    } catch {
      // 서버 접속 불가: 로컬에 이미 계산·저장된 RIASEC 가 있으면 그 트랙으로 결과 화면
      const localRiasec = storage.riasec.get();
      if (localRiasec) {
        queryClient.setQueryData(quizRiasecResultQueryKey, localRiasec);
        return ROUTES.quizResults;
      }
    }
  }

  if (storage.riasec.get()) {
    return ROUTES.quizResults;
  }

  return ROUTES.quizIntro;
}
