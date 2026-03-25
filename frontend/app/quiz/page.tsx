'use client';

import { useLayoutEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getQuizLandingPath } from '@/lib/navigation/quizLandingPath';
import { StarfieldCanvas } from '@/components/shared/StarfieldCanvas';
import { LABELS } from './config';

/**
 * 적성 검사 단일 진입점(/quiz) — 북마크·직접 URL용
 * 저장 결과 여부는 `getQuizLandingPath`와 동일 (상단 탭과 일치)
 */
export default function QuizEntryPage() {
  const router = useRouter();

  useLayoutEffect(() => {
    router.replace(getQuizLandingPath());
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
      <StarfieldCanvas count={80} />
      <p className="relative z-10 text-sm text-white/45">{LABELS.quiz_entry_redirecting}</p>
    </div>
  );
}
