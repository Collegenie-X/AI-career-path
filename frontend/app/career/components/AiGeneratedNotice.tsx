'use client';

import { Sparkles, AlertTriangle } from 'lucide-react';

/**
 * AI 생성 커리어 패스 경고 — 카드용 (한 줄 칩).
 * isAiGenerated=true 템플릿의 리스트 카드 상단에 노출.
 */
export function AiGeneratedNoticeChip() {
  return (
    <div
      className="flex items-center gap-1 px-2 py-0.5 rounded-full flex-shrink-0"
      style={{
        backgroundColor: 'rgba(168,85,247,0.14)',
        border: '1px solid rgba(168,85,247,0.45)',
      }}
      title="AI가 가상으로 생성한 참조용 패스입니다"
    >
      <Sparkles style={{ width: 9, height: 9, color: '#c4b5fd' }} />
      <span className="text-[10.5px] font-bold" style={{ color: '#c4b5fd' }}>
        AI 생성 · 참조용
      </span>
    </div>
  );
}

/**
 * AI 생성 커리어 패스 경고 — 상세 패널/다이얼로그 본문 상단용 (전체 폭 배너).
 */
export function AiGeneratedNoticeBanner({ note }: { readonly note?: string }) {
  return (
    <div
      className="rounded-2xl px-4 py-3 flex items-start gap-2.5"
      style={{
        backgroundColor: 'rgba(168,85,247,0.10)',
        border: '1px solid rgba(168,85,247,0.40)',
      }}
      role="note"
      aria-label="AI 생성 안내"
    >
      <div
        className="rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          width: 26,
          height: 26,
          backgroundColor: 'rgba(168,85,247,0.20)',
          border: '1px solid rgba(168,85,247,0.45)',
        }}
      >
        <AlertTriangle style={{ width: 14, height: 14, color: '#c4b5fd' }} />
      </div>
      <div className="flex-1 min-w-0 space-y-0.5">
        <div className="flex items-center gap-1.5">
          <Sparkles style={{ width: 11, height: 11, color: '#c4b5fd' }} />
          <span className="text-[12px] font-bold" style={{ color: '#c4b5fd' }}>
            AI 생성 패스 — 참조용으로만 활용하세요
          </span>
        </div>
        <p className="text-[12px] text-gray-300 leading-relaxed">
          {note ??
            'AI가 미래 지향적 가설로 작성한 가상 템플릿입니다. 실제 입시·활동 참여 전 학교·전문가와 반드시 상의하세요.'}
        </p>
      </div>
    </div>
  );
}
