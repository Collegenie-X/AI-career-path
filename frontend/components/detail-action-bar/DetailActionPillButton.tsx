'use client';

import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';

export const DETAIL_ACTION_PILL_BUTTON_CLASS_NAME =
  'inline-flex items-center justify-center gap-1.5 min-h-9 px-3 rounded-xl text-xs font-bold transition-all active:scale-95';

type DetailActionPillButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'style'> & {
  readonly icon?: ReactNode;
  readonly children: ReactNode;
  readonly style?: CSSProperties;
};

/**
 * 내 패스 타임라인 상단 액션과 동일한 필(pill) 버튼.
 * 스타일은 `detailActionPillStyles`에서 생성해 `style`로 전달.
 */
export function DetailActionPillButton({
  icon,
  children,
  className = '',
  type = 'button',
  ...rest
}: DetailActionPillButtonProps) {
  return (
    <button
      type={type}
      className={`${DETAIL_ACTION_PILL_BUTTON_CLASS_NAME} ${className}`.trim()}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
