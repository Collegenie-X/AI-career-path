'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { getQuizLandingPath } from '@/lib/navigation/quizLandingPath';
import { resolveQuizLandingPath } from '@/lib/navigation/resolveQuizLandingPath';
import { StarfieldCanvas } from '@/components/shared/StarfieldCanvas';
import { LABELS } from './config';

/**
 * 적성 검사 단일 진입점(/quiz) — 북마크·직접 URL·서버 결과 id 복원용
 * 서버에 저장된 `lastQuizResultId` 가 있으면 GET 후 리포트, 없으면 로컬·인트로 분기
 */
export default function QuizEntryPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const path = await resolveQuizLandingPath(queryClient);
        if (!cancelled) router.replace(path);
      } catch {
        if (!cancelled) router.replace(getQuizLandingPath());
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router, queryClient]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
      <StarfieldCanvas count={80} />
      <p className="relative z-10 text-sm text-white/45">{LABELS.quiz_entry_redirecting}</p>
    </div>
  );
}
