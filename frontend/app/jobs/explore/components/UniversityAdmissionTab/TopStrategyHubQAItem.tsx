import { ChevronDown } from 'lucide-react';

import type { StrategyActionCard, StrategyDeepQuestionAnswer } from './TopStrategyHubTypes';

type TopStrategyHubQAItemProps = {
  qaItem: StrategyDeepQuestionAnswer;
  index: number;
  isOpened: boolean;
  onToggle: () => void;
  mappedCard: StrategyActionCard | null;
  mappedChecklist: string[];
  mappedEvidence: string | null;
  sectionId: string;
  gradeId: string;
};

export function TopStrategyHubQAItem({
  qaItem,
  index,
  isOpened,
  onToggle,
  mappedCard,
  mappedChecklist,
  mappedEvidence,
  sectionId,
  gradeId,
}: TopStrategyHubQAItemProps) {
  return (
    <div
      className="rounded-xl p-3 relative overflow-hidden transition-all"
      style={{
        background: 'linear-gradient(135deg, rgba(15,23,42,0.9) 0%, rgba(30,41,59,0.8) 100%)',
        border: `2px solid ${isOpened ? 'rgba(168,85,247,0.6)' : 'rgba(148,163,184,0.25)'}`,
        boxShadow: isOpened ? '0 4px 16px rgba(168,85,247,0.3)' : 'none',
      }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between gap-2 text-left group"
        aria-label={`심화 질문 ${index + 1} ${isOpened ? '열림' : '열기'}`}
      >
        <div className="flex items-start gap-2 flex-1">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500/30 to-violet-600/30 flex items-center justify-center border border-purple-400/40 shrink-0">
            <span className="text-xs font-bold text-purple-200">Q{index + 1}</span>
          </div>
          <p className="text-xs font-semibold text-violet-100 leading-relaxed group-hover:text-violet-50 transition-colors">
            {qaItem.question}
          </p>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-violet-300 transition-transform shrink-0 ${
            isOpened ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpened && (
        <div className="mt-3 space-y-2.5 pl-9">
          <div 
            className="rounded-xl p-3 relative overflow-hidden"
            style={{
              background: 'rgba(139,92,246,0.15)',
              border: '1.5px solid rgba(168,85,247,0.35)',
            }}
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-400 to-violet-500" />
            <p className="text-xs text-violet-50 leading-relaxed pl-2">{qaItem.answer}</p>
          </div>

          {mappedCard && (
            <div 
              className="rounded-xl p-3 relative overflow-hidden"
              style={{
                background: 'rgba(99,102,241,0.15)',
                border: '1.5px solid rgba(129,140,248,0.4)',
              }}
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-400 to-blue-500" />
              <div className="flex items-center gap-2 mb-2 pl-2">
                <div className="w-5 h-5 rounded-md bg-indigo-500/30 flex items-center justify-center border border-indigo-400/40">
                  <span className="text-xs">🎯</span>
                </div>
                <p className="text-xs font-bold text-indigo-100">
                  전략 실행 순서
                </p>
              </div>
              <p className="text-xs text-indigo-50 mb-2 font-semibold pl-2">
                추천 카드: {mappedCard.title}
              </p>
              <div className="space-y-1.5 pl-2">
                {mappedCard.actionSteps.slice(0, 3).map((step, stepIndex) => (
                  <div
                    key={`${sectionId}-${gradeId}-${index}-mapped-step-${stepIndex}`}
                    className="flex items-start gap-2"
                  >
                    <div className="w-5 h-5 rounded-md bg-indigo-500/25 flex items-center justify-center border border-indigo-400/40 mt-0.5 shrink-0">
                      <span className="text-[10px] font-bold text-indigo-200">{stepIndex + 1}</span>
                    </div>
                    <p className="text-xs text-indigo-100 leading-relaxed flex-1">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
              <div 
                className="mt-2 rounded-lg p-2 pl-2"
                style={{
                  background: 'rgba(99,102,241,0.1)',
                  border: '1px solid rgba(129,140,248,0.3)',
                }}
              >
                <p className="text-xs text-indigo-200 flex items-center gap-1.5">
                  <span>⏰</span>
                  <span className="font-semibold">권장 시점:</span>
                  <span>{mappedCard.recommendedTiming}</span>
                </p>
              </div>
            </div>
          )}

          {mappedChecklist.length > 0 && (
            <div 
              className="rounded-xl p-3 relative overflow-hidden"
              style={{
                background: 'rgba(59,130,246,0.15)',
                border: '1.5px solid rgba(96,165,250,0.4)',
              }}
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-sky-500" />
              <div className="flex items-center gap-2 mb-2 pl-2">
                <div className="w-5 h-5 rounded-md bg-blue-500/30 flex items-center justify-center border border-blue-400/40">
                  <span className="text-xs">✅</span>
                </div>
                <p className="text-xs font-bold text-blue-100">
                  리스크 점검 포인트
                </p>
              </div>
              <div className="space-y-1 pl-2">
                {mappedChecklist.map((checkItem, checkIndex) => (
                  <div
                    key={`${sectionId}-${gradeId}-${index}-mapped-check-${checkIndex}`}
                    className="flex items-start gap-2"
                  >
                    <div className="w-4 h-4 rounded bg-blue-500/25 flex items-center justify-center border border-blue-400/40 mt-0.5 shrink-0">
                      <span className="text-[9px]">✓</span>
                    </div>
                    <p className="text-xs text-blue-100 leading-relaxed flex-1">
                      {checkItem}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {mappedEvidence && (
            <div 
              className="rounded-xl p-3 relative overflow-hidden"
              style={{
                background: 'rgba(16,185,129,0.15)',
                border: '1.5px solid rgba(52,211,153,0.4)',
              }}
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-400 to-green-500" />
              <div className="flex items-center gap-2 mb-1.5 pl-2">
                <div className="w-5 h-5 rounded-md bg-emerald-500/30 flex items-center justify-center border border-emerald-400/40">
                  <span className="text-xs">📝</span>
                </div>
                <p className="text-xs font-bold text-emerald-100">
                  서류·면접 증빙 연결
                </p>
              </div>
              <p className="text-xs text-emerald-100 leading-relaxed pl-2">{mappedEvidence}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
