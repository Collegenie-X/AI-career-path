'use client';

import { usePathname } from 'next/navigation';
import { WebLayout } from './WebLayout';

const HIDE_HEADER_FOOTER_PATHS = ['/', '/onboarding'];
const HIDE_HEADER_FOOTER_PREFIXES: string[] = [];

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '';
  const hideHeaderFooter =
    HIDE_HEADER_FOOTER_PATHS.includes(pathname) ||
    HIDE_HEADER_FOOTER_PREFIXES.some((p) => pathname.startsWith(p));

  return (
    <WebLayout hideHeaderFooter={hideHeaderFooter}>
      {children}
    </WebLayout>
  );
}
