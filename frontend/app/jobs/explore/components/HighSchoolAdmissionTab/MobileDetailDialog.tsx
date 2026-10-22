'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const MOBILE_QUERY = '(max-width: 767px)';

function subscribeMobile(onChange: () => void) {
  const mql = window.matchMedia(MOBILE_QUERY);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}

/** md 미만(모바일) 뷰포트 여부 — SSR 에서는 false */
export function useIsMobileViewport() {
  return useSyncExternalStore(
    subscribeMobile,
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false
  );
}

type MobileDetailDialogProps = {
  readonly children: React.ReactNode;
  readonly accentColor: string;
  readonly title: string;
  readonly onClose: () => void;
  /** 본문 여백 등 */
  readonly className?: string;
};

/**
 * 모바일 전용 상세 팝업 — 목록 아래로 쌓지 않고 바텀시트형 팝업으로 연다.
 * 학교 상세 다이얼로그(z-[9999])가 이 팝업 위에 뜨도록 z-index 는 그보다 낮게 둔다.
 */
export function MobileDetailDialog({ children, accentColor, title, onClose, className = 'p-4' }: MobileDetailDialogProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[9000] flex items-end justify-center p-2"
      style={{ background: 'rgba(2,6,23,0.86)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="w-full h-[94dvh] overflow-hidden rounded-2xl flex flex-col"
        style={{
          background: 'linear-gradient(180deg, rgba(15,23,42,0.98), rgba(17,24,39,0.98))',
          border: `1px solid ${accentColor}55`,
          boxShadow: '0 12px 56px rgba(15,23,42,0.45)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between gap-3 px-4 py-3 border-b"
          style={{ borderColor: `${accentColor}33` }}
        >
          <span className="text-sm font-black text-white truncate">{title}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className={`flex-1 overflow-y-auto overscroll-contain ${className}`}>{children}</div>
      </div>
    </div>,
    document.body
  );
}
