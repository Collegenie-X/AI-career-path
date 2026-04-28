'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Info, Menu, X } from 'lucide-react';
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    setAuthProfile(storage.auth.get());
  }, []);

  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isDrawerOpen]);

  useEffect(() => {
    setIsDrawerOpen(false);
  }, [pathname]);

  const refreshAuthFromStorage = useCallback(() => {
    setAuthProfile(storage.auth.get());
  }, []);

  const getIsActive = (path: string) => {
    if (path === '/') return pathname === '/';
    if (path === '/quiz') return pathname?.startsWith('/quiz');
    return pathname?.startsWith(path);
  };

  return (
    <>
    <header className="sticky top-0 z-50 w-full border-b border-white/8 bg-black/95 backdrop-blur-xl">
      <div className="web-container">
        <nav className="flex items-center justify-between gap-2 sm:gap-3 min-h-16 md:min-h-[4.5rem] py-1 md:py-0">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 shrink-0 min-w-0 group">
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

            {/* 모바일 ~ lg: 햄버거 버튼 */}
            <button
              className="flex lg:hidden items-center justify-center p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all"
              onClick={() => setIsDrawerOpen(true)}
              aria-label="메뉴 열기"
            >
              <Menu className="w-5 h-5" />
            </button>

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

    {/* 모바일 드로어 오버레이 */}
    {isDrawerOpen && (
      <div
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm lg:hidden"
        onClick={() => setIsDrawerOpen(false)}
      />
    )}

    {/* 왼쪽 슬라이드 드로어 */}
    <div
      className={`fixed top-0 left-0 z-[70] h-full w-72 lg:hidden flex flex-col transition-transform duration-300 ease-in-out ${
        isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      style={{ backgroundColor: 'rgba(13,13,30,0.98)', borderRight: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* 드로어 헤더 */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setIsDrawerOpen(false)}>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6C5CE7 0%, #a29bfe 100%)', boxShadow: '0 0 16px rgba(108,92,231,0.5)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l1.912 5.813a2 2 0 001.272 1.272L21 12l-5.813 1.912a2 2 0 00-1.272 1.272L12 21l-1.912-5.813a2 2 0 00-1.272-1.272L3 12l5.813-1.912a2 2 0 001.272-1.272L12 3z" />
            </svg>
          </div>
          <span className="text-base font-bold text-white">AI CareerPath</span>
        </Link>
        <button
          className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all"
          onClick={() => setIsDrawerOpen(false)}
          aria-label="메뉴 닫기"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 메뉴 목록 */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="flex flex-col gap-1">
          {HEADER_NAVIGATION_ITEMS.map((item) => {
            const active = getIsActive(item.href);
            const Icon = item.icon;
            const glowColor = item.color ?? '#6C5CE7';
            const isQuizNav = item.href === '/quiz';
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  if (isQuizNav) {
                    e.preventDefault();
                    router.push(getQuizLandingPath());
                  }
                  setIsDrawerOpen(false);
                }}
                className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${
                  active ? 'text-white' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
                style={
                  active
                    ? {
                        color: '#ffffff',
                        backgroundColor: `${glowColor}28`,
                        boxShadow: `0 0 14px ${glowColor}40, inset 0 0 12px ${glowColor}15`,
                        border: `1px solid ${glowColor}60`,
                      }
                    : undefined
                }
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={active ? { backgroundColor: `${glowColor}40` } : { backgroundColor: 'rgba(255,255,255,0.05)' }}
                >
                  <Icon className="w-4 h-4" style={active ? { color: glowColor } : undefined} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="leading-tight">{item.label}</span>
                  {item.step && (
                    <span className="text-xs mt-0.5" style={{ color: glowColor, opacity: 0.8 }}>
                      STEP {item.step}
                    </span>
                  )}
                </div>
                {active && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: glowColor }} />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  </>
  );
}
