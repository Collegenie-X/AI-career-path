'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  CAREER_PATH_EXPAND_DIALOG_MAX_WIDTH_CLASS,
} from './careerPathExpandDialog.constants';

type CareerPathExpandBottomSheetDialogProps = {
  readonly onClose: () => void;
  /** 560px 패널 안에 들어갈 본문 */
  readonly panelContent: React.ReactNode;
  /** 같은 백드롭 위에 올리는 고정 오버레이(신고·중첩 확인 등) — 패널 밖 */
  readonly fixedOverlays?: React.ReactNode;
  /** 기본 9999 — 중첩 모달은 더 높게 */
  readonly zIndex?: number;
};

/**
 * 커리어 패스 디테일 확대용 공통 바텀시트 셸 (560px max, 포털).
 */
export function CareerPathExpandBottomSheetDialog({
  onClose,
  panelContent,
  fixedOverlays,
  zIndex = 9999,
}: CareerPathExpandBottomSheetDialogProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 flex flex-col justify-end"
      style={{ backgroundColor: 'rgba(0,0,0,0.82)', zIndex }}
      onClick={onClose}
    >
      <div
        className={`w-full ${CAREER_PATH_EXPAND_DIALOG_MAX_WIDTH_CLASS} mx-auto rounded-t-3xl overflow-hidden flex flex-col min-h-0`}
        style={{
          backgroundColor: '#0d0d24',
          border: '1px solid rgba(255,255,255,0.08)',
          borderBottom: 'none',
          maxHeight: 'calc(100vh - 56px)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {panelContent}
      </div>
      {fixedOverlays}
    </div>,
    document.body
  );
}
