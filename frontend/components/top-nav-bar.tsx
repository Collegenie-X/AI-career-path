'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Briefcase, Map, Users } from 'lucide-react';
import { BOTTOM_NAVIGATION_TABS } from './tab-bar.config';

const ICON_MAP = {
  home: Home,
  jobs: Briefcase,
  career: Map,
  dreammate: Users,
} as const;

export function TopNavBar() {
  const pathname = usePathname();

  const getIsActive = (path: string) => {
    if (path === '/home') return pathname === '/home';
    return pathname?.startsWith(path);
  };

  return (
    <header
      className="sticky top-0 z-40 w-full border-b border-white/10"
      style={{ backgroundColor: 'rgba(26,26,46,0.95)', backdropFilter: 'blur(20px)' }}
    >
      <nav className="web-container flex items-center justify-between h-14 min-[720px]:h-16 px-4 min-[720px]:px-6">
        {/* Logo */}
        <Link
          href="/home"
          className="flex items-center gap-2 shrink-0"
        >
          <div
            className="w-8 h-8 min-[720px]:w-9 min-[720px]:h-9 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6C5CE7 0%, #a29bfe 100%)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l1.912 5.813a2 2 0 001.272 1.272L21 12l-5.813 1.912a2 2 0 00-1.272 1.272L12 21l-1.912-5.813a2 2 0 00-1.272-1.272L3 12l5.813-1.912a2 2 0 001.272-1.272L12 3z" />
            </svg>
          </div>
          <span
            className="text-base min-[720px]:text-lg font-bold hidden min-[720px]:inline"
            style={{ background: 'linear-gradient(135deg, #fff 30%, #a29bfe 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            CareerPath
          </span>
        </Link>

        {/* Nav items */}
        <div className="flex items-center gap-1 min-[720px]:gap-2">
          {BOTTOM_NAVIGATION_TABS.map(tab => {
            const active = getIsActive(tab.path);
            const Icon = ICON_MAP[tab.id as keyof typeof ICON_MAP] ?? tab.icon;
            return (
              <Link
                key={tab.id}
                href={tab.path}
                className={`
                  flex items-center gap-1.5 min-[720px]:gap-2 px-3 py-2 min-[720px]:px-4 rounded-lg
                  transition-all font-medium text-sm min-[720px]:text-base
                  ${active
                    ? 'text-white'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                  }
                `}
                style={active ? {
                  backgroundColor: 'rgba(108,92,231,0.2)',
                  color: '#a29bfe',
                } : undefined}
              >
                <Icon className="w-4 h-4 min-[720px]:w-5 min-[720px]:h-5 shrink-0" />
                <span className="hidden min-[720px]:inline">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
