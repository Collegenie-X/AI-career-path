'use client';

import { Sparkles } from 'lucide-react';
import { CAREER_PAGE_HEADER_CONTENT, CAREER_PAGE_TABS, type CareerPageTabId } from '../config';

type CareerPageHeaderProps = {
  readonly activeTab: CareerPageTabId;
  readonly onTabChange: (tabId: CareerPageTabId) => void;
  readonly selectedJobBadge:
    | {
        readonly jobEmoji: string;
        readonly jobName: string;
        readonly starColor: string;
      }
    | null;
};

export function CareerPageHeader({
  activeTab,
  onTabChange,
  selectedJobBadge,
}: CareerPageHeaderProps) {
  return (
    <div
      className="sticky top-0 z-20 px-4"
      style={{
        backgroundColor: 'rgba(10,10,30,0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="web-container py-4">
        <div className="mx-auto" style={{ maxWidth: '720px' }}>
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <h1 className="text-2xl md:text-[30px] font-black tracking-tight bg-gradient-to-r from-white via-purple-200 to-indigo-300 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(139,92,246,0.35)]">
                {CAREER_PAGE_HEADER_CONTENT.title}
              </h1>
              <p className="mt-1 inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold text-indigo-200 border border-indigo-400/30 bg-indigo-500/10">
                {CAREER_PAGE_HEADER_CONTENT.subtitle}
              </p>
            </div>
            {selectedJobBadge && (
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-2xl border shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
                style={{
                  background: `linear-gradient(135deg, ${selectedJobBadge.starColor}28, rgba(15,23,42,0.75))`,
                  borderColor: `${selectedJobBadge.starColor}70`,
                  boxShadow: `0 8px 24px ${selectedJobBadge.starColor}33`,
                }}
              >
                <span className="text-lg">{selectedJobBadge.jobEmoji}</span>
                <div className="leading-tight">
                  <div className="text-[10px] uppercase tracking-wide text-white/60">Current Track</div>
                  <div className="text-[13px] font-black" style={{ color: selectedJobBadge.starColor }}>
                    {selectedJobBadge.jobName}
                  </div>
                </div>
                <Sparkles className="w-3.5 h-3.5" style={{ color: selectedJobBadge.starColor }} />
              </div>
            )}
          </div>

          <div
            className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl border"
            style={{
              backgroundColor: 'rgba(255,255,255,0.03)',
              borderColor: 'rgba(255,255,255,0.1)',
            }}
            role="tablist"
            aria-label="커리어 탭 전환"
          >
            {CAREER_PAGE_TABS.map((tab) => {
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all"
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
        </div>
      </div>
    </div>
  );
}
