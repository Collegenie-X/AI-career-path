'use client';

import { usePathname, useRouter } from 'next/navigation';
import { BOTTOM_NAVIGATION_TABS } from './tab-bar.config';

export function TabBar() {
  const pathname = usePathname();
  const router = useRouter();

  const getIsActive = (path: string) => {
    if (path === '/home') return pathname === '/home';
    return pathname?.startsWith(path);
  };

  return (
    <div
      className="fixed bottom-0 left-1/2 -translate-x-1/2 z-30 w-full max-w-[430px] border-t border-white/10"
      style={{ backgroundColor: 'rgba(26,26,46,0.95)', backdropFilter: 'blur(20px)' }}
    >
      <div className="flex items-center justify-around py-1.5 px-2">
        {BOTTOM_NAVIGATION_TABS.map(tab => {
          const active = getIsActive(tab.path);
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => router.push(tab.path)}
              className="flex flex-col items-center justify-center gap-0.5 py-2 px-3 rounded-xl transition-all relative"
              style={active ? { color: '#6C5CE7' } : { color: '#666680' }}
            >
              {active && (
                <div
                  className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-1 rounded-full"
                  style={{ background: '#6C5CE7', boxShadow: '0 0 8px #6C5CE744' }}
                />
              )}
              <div className="relative">
                <Icon className="w-6 h-6" />
                {active && (
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: 'radial-gradient(circle, rgba(108,92,231,0.2) 0%, transparent 70%)',
                      filter: 'blur(4px)',
                      transform: 'scale(2)',
                    }}
                  />
                )}
              </div>
              <span className="text-[14px] font-semibold">{tab.label}</span>
            </button>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </div>
  );
}
