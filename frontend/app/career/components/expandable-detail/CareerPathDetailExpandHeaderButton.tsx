'use client';

import { Maximize2 } from 'lucide-react';
import { LABELS } from '../../config';

type CareerPathDetailExpandHeaderButtonProps = {
  readonly onExpand: () => void;
  readonly className?: string;
};

/**
 * 오른쪽 디테일 패널 상단 우측 — 확대 아이콘 (라벨은 career-content.json).
 */
export function CareerPathDetailExpandHeaderButton({
  onExpand,
  className = '',
}: CareerPathDetailExpandHeaderButtonProps) {
  return (
    <button
      type="button"
      onClick={onExpand}
      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shrink-0 transition-all active:scale-90 ${className}`}
      style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
      aria-label={String(LABELS.explore_detail_expand_aria ?? LABELS.explore_detail_expand_label ?? '확대 보기')}
      title={String(LABELS.explore_detail_expand_label ?? '확대 보기')}
    >
      <Maximize2 className="w-4 h-4 text-gray-300" />
    </button>
  );
}
