'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

type StrategyActionCard = {
  title: string;
  description: string;
  actionSteps: string[];
  recommendedTiming: string;
  relatedCategoryIds?: string[];
};

type StrategyHubGradeSection = {
  id: string;
  label: string;
  objective: string;
  practicalExamples: string[];
  detailChecklist: string[];
  cards: StrategyActionCard[];
};

type StrategyHubSection = {
  id: string;
  label: string;
  emoji: string;
  title: string;
  summary: string;
  grades: StrategyHubGradeSection[];
};

type TopStrategyHubSectionProps = {
  sections: StrategyHubSection[];
};

export function TopStrategyHubSection({ sections }: TopStrategyHubSectionProps) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? '');
  const [activeGradeId, setActiveGradeId] = useState(sections[0]?.grades[0]?.id ?? '');
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const activeSection = sections.find((section) => section.id === activeId) ?? sections[0];
  const activeGrade =
    activeSection?.grades.find((grade) => grade.id === activeGradeId) ?? activeSection?.grades[0];
  const selectedCard = selectedCardIndex !== null ? activeGrade?.cards[selectedCardIndex] : null;

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!activeSection || !activeGrade) return null;

  const strategyModalContent = selectedCard && (
    <div
      className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center p-0 md:p-4"
      style={{
        background: 'rgba(2,6,23,0.78)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
      onClick={() => setSelectedCardIndex(null)}
    >
      <div
        className="w-full min-w-0 max-w-full md:max-w-[28rem] h-[94dvh] md:h-auto md:max-h-[85vh] overflow-y-auto overflow-x-hidden overscroll-contain rounded-t-2xl md:rounded-2xl p-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:pb-4 space-y-3 md:mx-auto touch-pan-y"
        style={{
          background: 'linear-gradient(180deg, rgba(15,23,42,0.98), rgba(17,24,39,0.98))',
          border: '1px solid rgba(129,140,248,0.5)',
          WebkitOverflowScrolling: 'touch',
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="md:hidden flex justify-center -mt-1 mb-1">
          <div
            className="w-12 h-1 rounded-full"
            style={{ background: 'rgba(148,163,184,0.4)' }}
            aria-hidden
          />
        </div>
        <div className="flex items-start justify-between gap-3 min-w-0">
          <div className="min-w-0 flex-1 break-words">
            <p className="text-xs text-slate-300 mb-1">
              {activeSection.emoji} {activeSection.label} · {activeGrade.label}
            </p>
            <h4 className="text-sm font-bold text-white">{selectedCard.title}</h4>
            <p className="text-xs text-slate-200 mt-1">{selectedCard.description}</p>
          </div>
          <button
            onClick={() => setSelectedCardIndex(null)}
            className="w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center touch-manipulation active:opacity-70 transition-opacity"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)' }}
            aria-label="상세 닫기"
          >
            <X className="w-5 h-5 text-slate-300" />
          </button>
        </div>

        <div className="rounded-lg p-3" style={{ background: 'rgba(30,41,59,0.62)', border: '1px solid rgba(148,163,184,0.24)' }}>
          <p className="text-xs font-semibold text-white mb-1">실행 단계</p>
          {selectedCard.actionSteps.map((step, stepIndex) => (
            <p key={`${activeSection.id}-${activeGrade.id}-detail-step-${stepIndex}`} className="text-xs text-slate-200 mb-1">
              - {step}
            </p>
          ))}
          <p className="text-[11px] text-indigo-200 mt-2">권장 시점: {selectedCard.recommendedTiming}</p>
        </div>

        <div className="rounded-lg p-3" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.35)' }}>
          <p className="text-xs font-semibold text-emerald-200 mb-1">실전 예시</p>
          {activeGrade.practicalExamples.map((example, exampleIndex) => (
            <p key={`${activeSection.id}-${activeGrade.id}-example-${exampleIndex}`} className="text-xs text-emerald-100 mb-1">
              • {example}
            </p>
          ))}
        </div>

        <div className="rounded-lg p-3" style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.35)' }}>
          <p className="text-xs font-semibold text-blue-200 mb-1">상세 체크리스트</p>
          {activeGrade.detailChecklist.map((checkItem, checkIndex) => (
            <p key={`${activeSection.id}-${activeGrade.id}-check-${checkIndex}`} className="text-xs text-blue-100 mb-1">
              - {checkItem}
            </p>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="w-full max-w-full min-w-0 rounded-2xl p-3 space-y-3"
      style={{
        background: 'linear-gradient(135deg, rgba(15,23,42,0.9) 0%, rgba(30,41,59,0.86) 100%)',
        border: '1px solid rgba(148,163,184,0.28)',
      }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">대입 전략 허브</h3>
        <span className="text-xs text-slate-300">핵심 4탭</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {sections.map((section) => {
          const isActive = section.id === activeSection.id;
          return (
            <button
              key={section.id}
              onClick={() => {
                setActiveId(section.id);
                setActiveGradeId(section.grades[0]?.id ?? '');
                setSelectedCardIndex(null);
              }}
              className="px-2.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all"
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

      <div
        className="rounded-xl p-3"
        style={{
          background: 'rgba(15,23,42,0.65)',
          border: '1px solid rgba(99,102,241,0.35)',
        }}
      >
        <p className="text-sm font-bold text-white mb-1">
          {activeSection.emoji} {activeSection.title}
        </p>
        <p className="text-xs text-slate-300 mb-3">{activeSection.summary}</p>

        <div className="grid grid-cols-3 gap-2 mb-3">
          {activeSection.grades.map((grade) => {
            const isActiveGrade = grade.id === activeGrade.id;
            return (
              <button
                key={`${activeSection.id}-${grade.id}`}
                onClick={() => {
                  setActiveGradeId(grade.id);
                  setSelectedCardIndex(null);
                }}
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

        <p className="text-xs text-emerald-200 mb-2">{activeGrade.objective}</p>
        <p className="text-[11px] text-slate-300 mb-2">
          첫 화면은 핵심만 요약합니다. 카드별 상세 실행안은 `상세 다이얼로그`에서 확인하세요.
        </p>

        <div className="space-y-2">
          {activeGrade.cards.map((card, index) => (
            <div
              key={`${activeSection.id}-${activeGrade.id}-${index}`}
              className="rounded-lg p-2.5"
              style={{ background: 'rgba(30,41,59,0.62)', border: '1px solid rgba(148,163,184,0.24)' }}
            >
              <p className="text-xs font-semibold text-white mb-0.5">{card.title}</p>
              <p className="text-xs text-slate-300 leading-relaxed mb-2">{card.description}</p>
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-indigo-200">권장 시점: {card.recommendedTiming}</p>
                <button
                  onClick={() => setSelectedCardIndex(index)}
                  className="text-[11px] px-2 py-1 rounded-md font-semibold transition-all"
                  style={{
                    background: 'rgba(99,102,241,0.18)',
                    border: '1px solid rgba(129,140,248,0.45)',
                    color: '#c7d2fe',
                  }}
                >
                  상세 보기
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {mounted && strategyModalContent && createPortal(strategyModalContent, document.body)}
    </div>
  );
}
