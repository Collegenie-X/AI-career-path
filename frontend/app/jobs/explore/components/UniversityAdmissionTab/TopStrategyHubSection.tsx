'use client';

import { useMemo, useState } from 'react';
import { ExternalLink, Zap, Rocket, FlaskConical, Calendar } from 'lucide-react';

import { TOP_STRATEGY_HUB_CONFIG } from './topStrategyHubConfig';
import { TopStrategyHubDetailDialog } from './TopStrategyHubDetailDialog';
import type { StrategyHubSection } from './TopStrategyHubTypes';

type TopStrategyHubSectionProps = {
  sections: StrategyHubSection[];
};

const SECTION_ICON_MAP: Record<string, React.ReactNode> = {
  strategy2028: <Zap className="w-4 h-4" />,
  aiProject: <Rocket className="w-4 h-4" />,
  paperMaker: <FlaskConical className="w-4 h-4" />,
  gradeRoadmap: <Calendar className="w-4 h-4" />,
};

const GRADE_ICON_MAP: Record<string, string> = {
  grade1: '🌱',
  grade2: '🌿',
  grade3: '🌳',
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
        className="w-full max-w-full min-w-0 rounded-2xl p-4 space-y-4 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.9) 100%)',
          border: '2px solid rgba(148,163,184,0.3)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-emerald-500/20 to-transparent rounded-full blur-3xl" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <span className="text-lg">🎯</span>
            </div>
            <h3 className="text-base font-bold text-white">{TOP_STRATEGY_HUB_CONFIG.title}</h3>
          </div>
       
        </div>

        <div className="relative z-10 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {sections.map((section) => {
            const isActive = section.id === activeSection.id;
            return (
              <button
                key={section.id}
                onClick={() => {
                  setActiveId(section.id);
                  setActiveGradeId(section.grades[0]?.id ?? '');
                }}
                className="shrink-0 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                style={{
                  background: isActive 
                    ? 'linear-gradient(135deg, rgba(99,102,241,0.35) 0%, rgba(139,92,246,0.35) 100%)'
                    : 'rgba(255,255,255,0.06)',
                  border: `2px solid ${isActive ? 'rgba(129,140,248,0.8)' : 'rgba(148,163,184,0.25)'}`,
                  color: isActive ? '#e0e7ff' : '#cbd5e1',
                  boxShadow: isActive ? '0 4px 12px rgba(99,102,241,0.4)' : 'none',
                }}
              >
                <div className={`${isActive ? 'text-indigo-300' : 'text-slate-400'}`}>
                  {SECTION_ICON_MAP[section.id]}
                </div>
                <span className="mr-1">{section.emoji}</span>
                <span>{section.label}</span>
              </button>
            );
          })}
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-2">
          {activeSection.grades.map((grade) => {
            const isActiveGrade = grade.id === activeGrade.id;
            return (
              <button
                key={`${activeSection.id}-${grade.id}`}
                onClick={() => setActiveGradeId(grade.id)}
                className="px-3 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5"
                style={{
                  background: isActiveGrade 
                    ? 'linear-gradient(135deg, rgba(34,197,94,0.3) 0%, rgba(16,185,129,0.3) 100%)'
                    : 'rgba(255,255,255,0.05)',
                  border: `2px solid ${isActiveGrade ? 'rgba(74,222,128,0.8)' : 'rgba(148,163,184,0.25)'}`,
                  color: isActiveGrade ? '#d1fae5' : '#cbd5e1',
                  boxShadow: isActiveGrade ? '0 4px 12px rgba(34,197,94,0.4)' : 'none',
                }}
              >
                <span className="text-base">{GRADE_ICON_MAP[grade.id]}</span>
                <span>{grade.label}</span>
              </button>
            );
          })}
        </div>

        <div 
          className="relative z-10 rounded-2xl p-4 space-y-3 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(15,23,42,0.8) 0%, rgba(30,41,59,0.7) 100%)',
            border: '2px solid rgba(129,140,248,0.35)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          }}
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full blur-2xl" />
          
          <div className="relative flex items-start gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/40 to-purple-600/40 flex items-center justify-center border-2 border-indigo-400/50 shadow-lg">
              <span className="text-xl">{activeSection.emoji}</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white mb-1">
                {activeSection.title}
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">{activeSection.summary}</p>
            </div>
          </div>

          <div 
            className="rounded-xl p-3 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.15) 100%)',
              border: '1.5px solid rgba(129,140,248,0.4)',
            }}
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-400 to-purple-500" />
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-500/30 flex items-center justify-center border border-indigo-400/50">
                <span className="text-xs">🎯</span>
              </div>
              <p className="text-xs font-bold text-indigo-100">
                {TOP_STRATEGY_HUB_CONFIG.objectiveTitle}
              </p>
            </div>
            <p className="text-xs text-indigo-200 leading-relaxed pl-8">{activeGrade.objective}</p>
          </div>

          <div 
            className="rounded-xl p-3 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(16,185,129,0.15) 100%)',
              border: '1.5px solid rgba(74,222,128,0.4)',
            }}
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-400 to-green-500" />
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/30 flex items-center justify-center border border-emerald-400/50">
                <span className="text-xs">⚡</span>
              </div>
              <p className="text-xs font-bold text-emerald-100">
                {TOP_STRATEGY_HUB_CONFIG.examplesTitle}
              </p>
            </div>
            <div className="space-y-1.5 pl-8">
              {activeGrade.practicalExamples.slice(0, 2).map((example, index) => (
                <div key={`${activeSection.id}-${activeGrade.id}-quick-example-${index}`} className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-md bg-emerald-500/20 flex items-center justify-center border border-emerald-400/40 mt-0.5 shrink-0">
                    <span className="text-[10px] font-bold text-emerald-300">{index + 1}</span>
                  </div>
                  <p className="text-xs text-emerald-100 leading-relaxed flex-1">
                    {example}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setIsDetailDialogOpen(true)}
            className="relative w-full rounded-xl px-4 py-3 flex items-center justify-center gap-2 text-sm font-bold transition-all hover:scale-[1.02] active:scale-[0.98] overflow-hidden group"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.3) 0%, rgba(139,92,246,0.3) 100%)',
              border: '2px solid rgba(129,140,248,0.6)',
              color: '#e0e7ff',
              boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <ExternalLink className="w-4 h-4 relative z-10" />
            <span className="relative z-10">{TOP_STRATEGY_HUB_CONFIG.detailButtonLabel}</span>
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
