'use client';

import { WebHeader } from './WebHeader';
import { WebFooter } from './WebFooter';

type WebLayoutProps = {
  children: React.ReactNode;
  /** 헤더/푸터를 숨길 경로 (예: 온보딩, 스플래시) */
  hideHeaderFooter?: boolean;
};

export function WebLayout({ children, hideHeaderFooter = false }: WebLayoutProps) {
  if (hideHeaderFooter) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <WebHeader />
      <main className="flex-1">
        {children}
      </main>
      <WebFooter />
    </div>
  );
}
