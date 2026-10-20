'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Maximize2, X } from 'lucide-react';
import { EXPLORE_PAGE_LAYOUT_CLASS } from '../../config';

type ExpandableDetailPanelProps = {
  readonly children: React.ReactNode;
  /** 패널 테두리·버튼 강조색 */
  readonly accentColor: string;
  /** 팝업 상단 제목 */
  readonly title: string;
  /** 인라인 패널 안쪽 여백 등 */
  readonly className?: string;
};

/**
 * 오른쪽 상세 패널 래퍼 — 우상단 확대 버튼을 누르면 같은 내용을 큰 팝업으로 연다.
 * 학교 상세 다이얼로그(z-[9999])가 이 팝업 위에 뜨도록 z-index 는 그보다 낮게 둔다.
 */
export function ExpandableDetailPanel({ children, accentColor, title, className = '' }: ExpandableDetailPanelProps) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!expanded) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false);
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [expanded]);

  return (
    <>
      <div
        className="relative rounded-2xl"
        style={{ background: 'rgba(15,23,42,0.6)', border: `1px solid ${accentColor}40` }}
      >
        {/*
          상단 제목 바 — 오른쪽 상세를 길게 스크롤해도 "지금 어떤 유형을 보는지"와 확대 버튼이 보이도록
          WebHeader + sticky 탭 바 아래에 고정한다 (top 값은 EXPLORE_PAGE_LAYOUT_CLASS.stickyDetailHeader).
        */}
        <div
          className={`${EXPLORE_PAGE_LAYOUT_CLASS.stickyDetailHeader} flex items-center justify-between gap-3 rounded-t-2xl border-b px-4 py-2.5`}
          style={{
            borderColor: `${accentColor}33`,
            background: 'rgba(15,23,42,0.94)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <span className="truncate text-sm font-black text-white">{title}</span>
          <button
            type="button"
            onClick={() => setExpanded(true)}
            aria-label="크게 보기"
            title="크게 보기"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-all hover:scale-105 active:scale-95"
            style={{ background: `${accentColor}1f`, border: `1px solid ${accentColor}55`, color: accentColor }}
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
        <div className={className}>{children}</div>
      </div>

      {expanded &&
        createPortal(
          <div
            className="fixed inset-0 z-[9000] flex items-end md:items-center justify-center p-2 md:p-4"
            style={{ background: 'rgba(2,6,23,0.86)' }}
            onClick={() => setExpanded(false)}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <div
              className="w-full max-w-[1100px] h-[94dvh] md:max-h-[92vh] overflow-hidden rounded-2xl flex flex-col"
              style={{
                background: 'linear-gradient(180deg, rgba(15,23,42,0.98), rgba(17,24,39,0.98))',
                border: `1px solid ${accentColor}55`,
                boxShadow: '0 12px 56px rgba(15,23,42,0.45)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="flex items-center justify-between gap-3 px-4 py-3 md:px-5 border-b"
                style={{ borderColor: `${accentColor}33` }}
              >
                <span className="text-sm font-black text-white truncate">{title}</span>
                <button
                  type="button"
                  onClick={() => setExpanded(false)}
                  aria-label="닫기"
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto overscroll-contain p-4 md:p-6">{children}</div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
