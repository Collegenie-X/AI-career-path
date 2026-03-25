'use client';

import Link from 'next/link';
import { FileText, Zap } from 'lucide-react';
import { LABELS, ROUTES } from '../config';

/**
 * localStorage에 RIASEC 결과가 있을 때 인트로 상단에 표시:
 * 결과 리포트로 이동 vs 퀘스트(모드 선택·문항) 시작.
 */
export function SavedResultChoiceBanner() {
  return (
    <div
      className="mb-8 md:mb-10 rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.12] px-4 py-4 md:px-5 md:py-5"
      role="region"
      aria-label="저장된 적성 검사 결과"
    >
      <p className="text-sm md:text-base text-emerald-50/95 leading-relaxed mb-4">
        {LABELS.saved_result_notice}
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href={ROUTES.quizResults}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/[0.08] border border-white/15 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/[0.12]"
        >
          <FileText className="w-4 h-4 shrink-0 text-emerald-300" />
          {LABELS.view_result_report}
        </Link>
        <Link
          href={ROUTES.quizPlay}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6C5CE7] to-[#a29bfe] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition hover:opacity-95"
        >
          <Zap className="w-4 h-4 shrink-0" />
          {LABELS.start_quest_alt}
        </Link>
      </div>
    </div>
  );
}
