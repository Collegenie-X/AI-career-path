'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { HighSchoolDetail } from '../../types';
import { SchoolDetailPanel } from './SchoolDetailPanel';

type SchoolDetailDialogProps = {
  readonly school: HighSchoolDetail;
  readonly categoryColor: string;
  readonly categoryBgColor: string;
  readonly onClose: () => void;
};

/** 학교 상세 다이얼로그 — 디테일 패널에서 "자세히 보기" 클릭 시 전체 화면 모달 */
export function SchoolDetailDialog({
  school,
  categoryColor,
  categoryBgColor,
  onClose,
}: SchoolDetailDialogProps) {
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

  const panelInner = (
    <div
      className="w-full max-w-[32rem] md:max-w-[36rem] h-[94dvh] md:max-h-[92vh] overflow-hidden rounded-2xl flex flex-col"
      style={{
        background: 'linear-gradient(180deg, rgba(15,23,42,0.98), rgba(17,24,39,0.98))',
        border: `1px solid ${categoryColor}55`,
        boxShadow: '0 12px 56px rgba(15,23,42,0.45)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <SchoolDetailPanel
        school={school}
        categoryColor={categoryColor}
        categoryBgColor={categoryBgColor}
        onClose={onClose}
        variant="dialog"
      />
    </div>
  );

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center p-2 md:p-4"
      style={{ background: 'rgba(2,6,23,0.86)' }}
      onClick={onClose}
    >
      {panelInner}
    </div>,
    document.body
  );
}
