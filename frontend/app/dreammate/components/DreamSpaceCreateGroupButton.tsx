'use client';

import { Plus } from 'lucide-react';

type DreamSpaceCreateGroupButtonVariant = 'inlineListHeader' | 'heroPill';

type DreamSpaceCreateGroupButtonProps = {
  readonly onClick: () => void;
  readonly label: string;
  readonly variant: DreamSpaceCreateGroupButtonVariant;
  readonly ariaLabel?: string;
};

/**
 * 커리어 패스 커뮤니티 `GroupListView`의 「새 그룹」 버튼과 동일 그라데이션·토큰을 사용합니다.
 * `heroPill`은 `ExploreHeroBanner` CTA와 유사한 알약형·그림자입니다.
 */
export function DreamSpaceCreateGroupButton({
  onClick,
  label,
  variant,
  ariaLabel,
}: DreamSpaceCreateGroupButtonProps) {
  if (variant === 'heroPill') {
    return (
      <button
        type="button"
        onClick={onClick}
        className="inline-flex w-full items-center justify-center gap-2 px-4 py-2.5 text-[13px] font-bold text-white transition-all active:scale-[0.99] sm:w-auto"
        style={{
          background: 'linear-gradient(135deg, #6C5CE7, #a855f7)',
          boxShadow: '0 4px 16px rgba(108,92,231,0.55)',
          borderRadius: '9999px',
        }}
        aria-label={ariaLabel ?? label}
      >
        <Plus className="h-4 w-4 shrink-0" />
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all active:scale-95"
      style={{
        background: 'linear-gradient(135deg, #6C5CE7, #a855f7)',
        color: '#fff',
      }}
      aria-label={ariaLabel ?? label}
    >
      <Plus className="h-3.5 w-3.5 shrink-0" />
      {label}
    </button>
  );
}
