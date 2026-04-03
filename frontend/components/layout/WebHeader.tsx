'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Info } from 'lucide-react';
import { BOTTOM_NAVIGATION_TABS } from '@/components/tab-bar.config';
import { getQuizLandingPath } from '@/lib/navigation/quizLandingPath';
import { SocialLoginDialog } from '@/components/auth/SocialLoginDialog';
import { WebHeaderAccountArea } from '@/components/layout/WebHeaderAccountArea';
import { storage, type AuthProfile } from '@/lib/storage';

type HeaderNavigationItem = {
  readonly label: string;
  readonly href: string;
  readonly icon: (typeof BOTTOM_NAVIGATION_TABS)[number]['icon'];
  readonly step?: string;
  readonly color?: string;
};

const HEADER_NAVIGATION_ITEMS: readonly HeaderNavigationItem[] = [
  ...BOTTOM_NAVIGATION_TABS.map((tab) => ({
    label: tab.label,
    href: tab.path,
    icon: tab.icon,
    step: tab.step,
    color: tab.color,
  })),
  { label: 'About', href: '/about', icon: Info },
] as const;

export function WebHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [isSocialLoginOpen, setIsSocialLoginOpen] = useState(false);
  const [authProfile, setAuthProfile] = useState<AuthProfile | null>(null);

  useEffect(() => {
    setAuthProfile(storage.auth.get());
  }, []);

  const refreshAuthFromStorage = useCallback(() => {
    setAuthProfile(storage.auth.get());
  }, []);

  const getIsActive = (path: string) => {
    if (path === '/home') return pathname === '/home';
    if (path === '/quiz') return pathname?.startsWith('/quiz');
    return pathname?.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/8 bg-black/95 backdrop-blur-xl">
      <div className="web-container">
        <nav className="flex items-center justify-between gap-2 sm:gap-3 min-h-16 md:min-h-[4.5rem] py-1 md:py-0">
          {/* Logo */}
          <Link href="/home" className="flex items-center gap-2 sm:gap-2.5 shrink-0 min-w-0 group">
            <div
              className="w-8 h-8 md:w-9 md:h-9 rounded-lg flex items-center justify-center transition-all group-hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #6C5CE7 0%, #a29bfe 100%)',
                boxShadow: '0 0 16px rgba(108,92,231,0.5)',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3l1.912 5.813a2 2 0 001.272 1.272L21 12l-5.813 1.912a2 2 0 00-1.272 1.272L12 21l-1.912-5.813a2 2 0 00-1.272-1.272L3 12l5.813-1.912a2 2 0 001.272-1.272L12 3z" />
              </svg>
            </div>
            <span className="text-base sm:text-lg lg:text-xl font-bold text-white tracking-tight truncate max-w-[42vw] sm:max-w-none">
              AI CareerPath
            </span>
          </Link>

          <div className="flex flex-1 min-w-0 items-center justify-end gap-1.5 sm:gap-2 md:gap-3">
            {/* Wide screens: 아이콘 + 라벨 (공간 부족 시 md~lg 에서 겹침 방지 위해 lg 이상만) */}
          <div className="hidden lg:flex items-center gap-0.5 xl:gap-1 min-w-0 flex-wrap justify-end">
            {HEADER_NAVIGATION_ITEMS.map((item) => {
              const active = getIsActive(item.href);
              const Icon = item.icon;
              const glowColor = item.color ?? '#6C5CE7';
              const isQuizNav = item.href === '/quiz';
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={
                    isQuizNav
                      ? (e) => {
                          e.preventDefault();
                          router.push(getQuizLandingPath());
                        }
                      : undefined
                  }
                  className={`flex items-center gap-1 xl:gap-1.5 shrink-0 px-2 py-1.5 xl:px-3 xl:py-2 rounded-lg text-xs xl:text-sm font-medium transition-all whitespace-nowrap ${
                    active
                      ? 'text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                  style={
                    active
                      ? {
                          color: '#ffffff',
                          backgroundColor: `${glowColor}28`,
                          boxShadow: `0 0 14px ${glowColor}55, inset 0 0 12px ${glowColor}20`,
                          border: `1px solid ${glowColor}`,
                        }
                      : undefined
                  }
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
            </div>

            {/* md ~ lg 및 모바일: 아이콘만 (라벨은 title로 표시) — 좁은 폭에서는 가로 스크롤 */}
            <div className="flex lg:hidden items-center gap-0.5 sm:gap-1 min-w-0 flex-1 overflow-x-auto scrollbar-hide justify-end">
            {HEADER_NAVIGATION_ITEMS.map((item) => {
              const active = getIsActive(item.href);
              const Icon = item.icon;
              const glowColor = item.color ?? '#6C5CE7';
              const isQuizNav = item.href === '/quiz';
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  onClick={
                    isQuizNav
                      ? (e) => {
                          e.preventDefault();
                          router.push(getQuizLandingPath());
                        }
                      : undefined
                  }
                  className={`p-2 rounded-lg transition-all ${
                    active ? 'text-white' : 'text-white/50 hover:text-white'
                  }`}
                  style={
                    active
                      ? {
                          color: '#ffffff',
                          backgroundColor: `${glowColor}28`,
                          boxShadow: `0 0 12px ${glowColor}50, inset 0 0 10px ${glowColor}18`,
                          border: `1px solid ${glowColor}`,
                        }
                      : undefined
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                </Link>
              );
            })}
            </div>

            <WebHeaderAccountArea
              authProfile={authProfile}
              onOpenLoginDialog={() => setIsSocialLoginOpen(true)}
              onAuthSessionChange={refreshAuthFromStorage}
            />
          </div>
        </nav>
      </div>

      <SocialLoginDialog
        open={isSocialLoginOpen}
        onOpenChange={setIsSocialLoginOpen}
        onSignupSuccess={refreshAuthFromStorage}
      />
    </header>
  );
}
