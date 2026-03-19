'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Rocket, Home, Info, Briefcase, Map, Users } from 'lucide-react';

const NAV_ITEMS = [
  { label: '소개', href: '/home', icon: Home },
  { label: '드림 경험', href: '/jobs/explore', icon: Briefcase },
  { label: '드림 패스', href: '/career', icon: Map },
  { label: '드림 실행', href: '/dreammate', icon: Users },
  { label: 'About', href: '/about', icon: Info },
] as const;

export function WebHeader() {
  const pathname = usePathname();

  const getIsActive = (path: string) => {
    if (path === '/home') return pathname === '/home';
    return pathname?.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/8 bg-black/95 backdrop-blur-xl">
      <div className="web-container">
        <nav className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link href="/home" className="flex items-center gap-2.5 shrink-0 group">
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
            <span className="text-lg md:text-xl font-bold text-white tracking-tight">
              DreamPath
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const active = getIsActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? 'text-white bg-white/10'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile Nav - 아이콘만 */}
          <div className="flex md:hidden items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const active = getIsActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  className={`p-2 rounded-lg transition-all ${
                    active ? 'text-white bg-white/10' : 'text-white/50 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </Link>
              );
            })}
          </div>

          {/* CTA */}
          <Link
            href="/quiz/intro"
            className="flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-lg font-bold text-sm text-white transition-all hover:scale-105 active:scale-95 shrink-0"
            style={{
              background: 'linear-gradient(135deg, #6C5CE7 0%, #a29bfe 100%)',
              boxShadow: '0 0 20px rgba(108,92,231,0.4)',
            }}
          >
            <Rocket className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">시작하기</span>
            <span className="sm:hidden">시작</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
