'use client';

import { createPortal } from 'react-dom';

/**
 * 커리어 패스 다이얼로그와 동일한 스타일의 바텀시트 다이얼로그 래퍼.
 * 직업 체험 섹션의 모든 다이얼로그에서 일관된 UX를 제공합니다.
 *
 * - 하단에서 올라오는 바텀시트 형태
 * - rounded-t-3xl, max-w-[560px] (기존 430px의 1.3배), 다크 테마
 * - 배경 클릭 시 닫기
 * - 게임스러운 등장 애니메이션
 */

export interface CareerPathStyleDialogProps {
  onClose: () => void;
  children: React.ReactNode;
}

export function CareerPathStyleDialog({ onClose, children }: CareerPathStyleDialogProps) {
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex flex-col justify-end animate-fade-in"
      style={{ backgroundColor: 'rgba(0,0,0,0.82)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[560px] mx-auto rounded-t-3xl overflow-hidden flex flex-col"
        style={{
          backgroundColor: '#0d0d24',
          border: '1px solid rgba(255,255,255,0.08)',
          borderBottom: 'none',
          maxHeight: 'calc(100vh - 56px)',
          animation: 'slide-up-bounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
