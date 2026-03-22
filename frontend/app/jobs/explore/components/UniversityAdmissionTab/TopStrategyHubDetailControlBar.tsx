'use client';

import type { LucideIcon } from 'lucide-react';
import { Target, CheckCircle2, Lightbulb } from 'lucide-react';

import { TOP_STRATEGY_HUB_CONFIG } from './topStrategyHubConfig';
import type { StrategyHubSection } from './TopStrategyHubTypes';

export type StrategyHubDetailContentTabId = 'core' | 'actionCards' | 'deepQa';

type TopStrategyHubDetailControlBarProps = {
  readonly sections: StrategyHubSection[];
  readonly activeSection: StrategyHubSection;
  readonly activeGradeId: string;
  readonly activeDetailContentTabId: StrategyHubDetailContentTabId;
  readonly onSelectSection: (sectionId: string) => void;
  readonly onSelectGrade: (gradeId: string) => void;
  readonly onSelectContentTab: (tabId: StrategyHubDetailContentTabId) => void;
};

const CONTENT_TAB_ITEMS: ReadonlyArray<{
  readonly id: StrategyHubDetailContentTabId;
  readonly Icon: LucideIcon;
}> = [
  { id: 'core', Icon: Target },
  { id: 'actionCards', Icon: CheckCircle2 },
  { id: 'deepQa', Icon: Lightbulb },
];

function ControlGroupLabel({ children }: { readonly children: string }) {
  return (
    <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-slate-500 w-9 sm:w-10">
      {children}
    </span>
  );
}

/** 상세 실행 가이드 상단: 전략(가로 스크롤 칩) + 한 줄에 학년·보기 세그먼트 */
export function TopStrategyHubDetailControlBar({
  sections,
  activeSection,
  activeGradeId,
  activeDetailContentTabId,
  onSelectSection,
  onSelectGrade,
  onSelectContentTab,
}: TopStrategyHubDetailControlBarProps) {
  const { strategy, grade, content } = TOP_STRATEGY_HUB_CONFIG.detailControlBarLabels;
  const shortLabels = TOP_STRATEGY_HUB_CONFIG.detailContentTabShortLabels;

  return (
    <div className="rounded-xl border border-white/[0.08] bg-slate-950/40 px-2.5 py-2 space-y-2">
      <div className="flex items-start gap-2 min-w-0">
        <ControlGroupLabel>{strategy}</ControlGroupLabel>
        <div className="flex gap-1 overflow-x-auto scrollbar-hide flex-1 min-w-0 pb-0.5">
          {sections.map((section) => {
            const isOn = section.id === activeSection.id;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => onSelectSection(section.id)}
                className={[
                  'shrink-0 px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-medium transition-colors border',
                  isOn
                    ? 'bg-violet-500/15 text-violet-100 border-violet-400/35'
                    : 'bg-transparent text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/[0.06]',
                ].join(' ')}
              >
                <span className="mr-1 opacity-90" aria-hidden>
                  {section.emoji}
                </span>
                {section.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 pt-1.5 border-t border-white/[0.06]">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <ControlGroupLabel>{grade}</ControlGroupLabel>
          <div
            className="inline-flex rounded-lg border border-white/[0.08] bg-black/25 p-0.5 gap-0.5 flex-1 min-w-0 justify-start"
            role="group"
            aria-label={grade}
          >
            {activeSection.grades.map((g) => {
              const isOn = g.id === activeGradeId;
              return (
                <button
                  key={`${activeSection.id}-${g.id}`}
                  type="button"
                  onClick={() => onSelectGrade(g.id)}
                  className={[
                    'flex-1 min-w-0 px-2 py-1 rounded-md text-[11px] sm:text-xs font-semibold transition-colors',
                    isOn
                      ? 'bg-emerald-500/20 text-emerald-100'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]',
                  ].join(' ')}
                >
                  {g.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 min-w-0 flex-1 sm:max-w-[min(100%,280px)]">
          <ControlGroupLabel>{content}</ControlGroupLabel>
          <div
            className="inline-flex rounded-lg border border-white/[0.08] bg-black/25 p-0.5 gap-0.5 flex-1 min-w-0"
            role="tablist"
            aria-label={content}
          >
            {CONTENT_TAB_ITEMS.map(({ id, Icon }) => {
              const isOn = activeDetailContentTabId === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={isOn}
                  onClick={() => onSelectContentTab(id)}
                  className={[
                    'flex-1 min-w-0 inline-flex items-center justify-center gap-0.5 px-1.5 py-1 rounded-md text-[11px] sm:text-xs font-semibold transition-colors',
                    isOn
                      ? 'bg-violet-500/20 text-violet-100'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]',
                  ].join(' ')}
                >
                  <Icon className="w-3 h-3 opacity-80 shrink-0 hidden sm:block" aria-hidden />
                  <span className="truncate">{shortLabels[id]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
