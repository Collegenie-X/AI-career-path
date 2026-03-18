'use client';

import { useMemo, useState } from 'react';
import { ExternalLink } from 'lucide-react';

import { TOP_STRATEGY_HUB_CONFIG } from './topStrategyHubConfig';
import { TopStrategyHubDetailDialog } from './TopStrategyHubDetailDialog';
import type { StrategyHubSection } from './TopStrategyHubTypes';

type TopStrategyHubSectionProps = {
  sections: StrategyHubSection[];
};

export function TopStrategyHubSection({ sections }: TopStrategyHubSectionProps) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? '');
  const [activeGradeId, setActiveGradeId] = useState(sections[0]?.grades[0]?.id ?? '');
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const activeSection = useMemo(
    () => sections.find((section) => section.id === activeId) ?? sections[0],
    [activeId, sections]
  );
  const activeGrade = useMemo(
    () => activeSection?.grades.find((grade) => grade.id === activeGradeId) ?? activeSection?.grades[0],
    [activeGradeId, activeSection]
  );

  if (!activeSection || !activeGrade) return null;

  return (
    <>
      <div
        className="w-full max-w-full min-w-0 rounded-2xl p-3 space-y-3"
        style={{
          background: 'linear-gradient(135deg, rgba(15,23,42,0.9) 0%, rgba(30,41,59,0.86) 100%)',
          border: '1px solid rgba(148,163,184,0.28)',
        }}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">{TOP_STRATEGY_HUB_CONFIG.title}</h3>
          <span className="text-xs text-slate-300">{TOP_STRATEGY_HUB_CONFIG.badgeLabel}</span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {sections.map((section) => {
            const isActive = section.id === activeSection.id;
            return (
              <button
                key={section.id}
                onClick={() => {
                  setActiveId(section.id);
                  setActiveGradeId(section.grades[0]?.id ?? '');
                }}
                className="shrink-0 px-2.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all"
                style={{
                  background: isActive ? 'rgba(99,102,241,0.22)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${isActive ? 'rgba(129,140,248,0.7)' : 'rgba(148,163,184,0.24)'}`,
                  color: isActive ? '#c7d2fe' : '#cbd5e1',
                }}
              >
                <span className="mr-1">{section.emoji}</span>
                <span>{section.label}</span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {activeSection.grades.map((grade) => {
            const isActiveGrade = grade.id === activeGrade.id;
            return (
              <button
                key={`${activeSection.id}-${grade.id}`}
                onClick={() => setActiveGradeId(grade.id)}
                className="px-2 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: isActiveGrade ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${isActiveGrade ? 'rgba(74,222,128,0.7)' : 'rgba(148,163,184,0.22)'}`,
                  color: isActiveGrade ? '#bbf7d0' : '#cbd5e1',
                }}
              >
                {grade.label}
              </button>
            );
          })}
        </div>

        <div className="rounded-xl p-3 bg-slate-900/70 border border-indigo-300/30 space-y-2">
          <p className="text-sm font-bold text-white">
            {activeSection.emoji} {activeSection.title}
          </p>
          <p className="text-xs text-slate-300">{activeSection.summary}</p>

          <div className="rounded-lg p-2.5 bg-indigo-500/10 border border-indigo-400/35">
            <p className="text-[11px] font-semibold text-indigo-100">
              {TOP_STRATEGY_HUB_CONFIG.objectiveTitle}
            </p>
            <p className="text-[11px] text-indigo-200 mt-0.5">{activeGrade.objective}</p>
          </div>

          <div className="rounded-lg p-2.5 bg-emerald-500/10 border border-emerald-400/35">
            <p className="text-[11px] font-semibold text-emerald-100 mb-1">
              {TOP_STRATEGY_HUB_CONFIG.examplesTitle}
            </p>
            {activeGrade.practicalExamples.slice(0, 2).map((example, index) => (
              <p key={`${activeSection.id}-${activeGrade.id}-quick-example-${index}`} className="text-[11px] text-emerald-100 mb-1 last:mb-0">
                • {example}
              </p>
            ))}
          </div>

          <button
            onClick={() => setIsDetailDialogOpen(true)}
            className="w-full rounded-lg px-3 py-2 flex items-center justify-center gap-1.5 text-xs font-semibold transition-all hover:opacity-95"
            style={{
              background: 'rgba(99,102,241,0.2)',
              border: '1px solid rgba(129,140,248,0.55)',
              color: '#c7d2fe',
            }}
          >
            <span>{TOP_STRATEGY_HUB_CONFIG.detailButtonLabel}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {isDetailDialogOpen && (
        <TopStrategyHubDetailDialog
          sections={sections}
          initialSectionId={activeSection.id}
          initialGradeId={activeGrade.id}
          onClose={() => setIsDetailDialogOpen(false)}
        />
      )}
    </>
  );
}
