'use client';

import { CAREER_PAGE_TABS, type CareerPageTabId } from '../config';

type CareerTabBarProps = {
  readonly activeTab: CareerPageTabId;
  readonly onTabChange: (tabId: CareerPageTabId) => void;
  /**
   * true: 셸 카드 안에 붙여 넣기 — 바깥 이중 테두리 없이 탭만 표시 (아래 히어로와 한 덩어리)
   */
  readonly embeddedInCareerShell?: boolean;
};

export function CareerTabBar({
  activeTab,
  onTabChange,
  embeddedInCareerShell = false,
}: CareerTabBarProps) {
  const tabListShellClassName = embeddedInCareerShell
    ? 'grid grid-cols-3 gap-1.5 p-1 rounded-none'
    : 'grid grid-cols-3 gap-2 p-1.5 rounded-none border border-white/10';

  const tabListShellStyle = embeddedInCareerShell
    ? { backgroundColor: 'rgba(255,255,255,0.06)' }
    : { backgroundColor: 'rgba(255,255,255,0.03)' };

  return (
    <div
      className={tabListShellClassName}
      style={tabListShellStyle}
      role="tablist"
      aria-label="커리어 탭 전환"
    >
      {CAREER_PAGE_TABS.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-none text-xs font-bold transition-all"
            style={
              isActive
                ? {
                    background: 'linear-gradient(135deg, #6C5CE7, #a855f7)',
                    color: '#fff',
                    boxShadow: '0 4px 16px rgba(108,92,231,0.35)',
                  }
                : {
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    color: 'rgba(255,255,255,0.65)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }
            }
            role="tab"
            aria-selected={isActive}
            aria-current={isActive ? 'page' : undefined}
          >
            <span>{tab.emoji}</span>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
