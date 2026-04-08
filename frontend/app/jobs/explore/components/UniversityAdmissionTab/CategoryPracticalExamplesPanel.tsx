'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Crosshair,
  ListChecks,
  MessageSquareQuote,
} from 'lucide-react';

type AppealStep = {
  step: number;
  title: string;
  action: string;
  tip: string;
};

type CategoryPracticalExamplesPanelProps = {
  category: {
    color: string;
    bgColor: string;
    cautions: string[];
  };
  playbook: {
    appealStrategy?: {
      steps: AppealStep[];
      doList: string[];
      dontList: string[];
    };
    // legacy fallback
    practicalExamples?: {
      setakSentenceTemplates: string[];
      interviewQuestions: string[];
      makerAndResearchExamples: string[];
    };
  };
};

export function CategoryPracticalExamplesPanel({
  category,
  playbook,
}: CategoryPracticalExamplesPanelProps) {
  const [openStep, setOpenStep] = useState<number | null>(1);
  const appeal = playbook.appealStrategy;

  return (
    <div className="space-y-3">
      {/* 헤더 배너 */}
      <div
        className="rounded-xl p-3"
        style={{
          background: `linear-gradient(135deg, ${category.color}28 0%, ${category.color}10 100%)`,
          border: `1px solid ${category.color}55`,
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Crosshair className="w-4 h-4" style={{ color: category.color }} />
          <h3 className="text-sm font-bold text-white">입학사정관 설득 어필 전략</h3>
        </div>
        <p className="text-[11px] text-white/65">단계별 행동 플랜으로 합격을 설계하세요</p>
      </div>

      {/* 어필 단계 아코디언 */}
      {appeal && (
        <div className="rounded-xl p-3 bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 mb-2.5">
            <ListChecks className="w-4 h-4" style={{ color: category.color }} />
            <h3 className="text-sm font-bold text-white">전략적 어필 4단계</h3>
          </div>
          <div className="space-y-2">
            {appeal.steps.map((s) => {
              const isOpen = openStep === s.step;
              return (
                <div
                  key={s.step}
                  className="rounded-xl overflow-hidden"
                  style={{ border: `1px solid ${isOpen ? category.color : 'rgba(255,255,255,0.1)'}` }}
                >
                  <button
                    onClick={() => setOpenStep(isOpen ? null : s.step)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left"
                    style={{ background: isOpen ? category.bgColor : 'rgba(255,255,255,0.03)' }}
                  >
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{
                        background: isOpen ? category.color : 'rgba(255,255,255,0.1)',
                        color: isOpen ? 'white' : 'rgba(255,255,255,0.5)',
                      }}
                    >
                      {s.step}
                    </span>
                    <span className="text-sm font-semibold text-white flex-1">{s.title}</span>
                    <ChevronDown
                      className={`w-4 h-4 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      style={{ color: category.color }}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-3 pt-2" style={{ background: 'rgba(15,23,42,0.55)' }}>
                      <p className="text-xs text-white/85 leading-relaxed mb-2">{s.action}</p>
                      <div
                        className="rounded-lg px-3 py-2"
                        style={{ background: `${category.color}18`, border: `1px solid ${category.color}35` }}
                      >
                        <div className="flex items-start gap-1.5">
                          <MessageSquareQuote className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: category.color }} />
                          <p className="text-[11px] text-white/75 leading-relaxed">{s.tip}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DO 리스트 */}
      {appeal && (
        <div className="rounded-xl p-3 bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">반드시 해야 할 것 (DO)</h3>
          </div>
          <div className="space-y-1.5">
            {appeal.doList.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 text-xs text-white/85 px-2.5 py-2 rounded-lg"
                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}
              >
                <span className="flex-1 leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DON'T 리스트 */}
      {appeal && (
        <div className="rounded-xl p-3 bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-4 h-4 text-red-400" />
            <h3 className="text-sm font-bold text-white">절대 하지 말 것 (DON&apos;T)</h3>
          </div>
          <div className="space-y-1.5">
            {appeal.dontList.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 text-xs text-white/85 px-2.5 py-2 rounded-lg"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}
              >
                <span className="flex-1 leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 주의사항 */}
      <div className="rounded-xl p-3 bg-red-500/10 border border-red-500/30">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-red-300" />
          <h3 className="text-sm font-bold text-white">⚠️ 실수 방지 체크</h3>
        </div>
        {category.cautions.map((caution, index) => (
          <p key={index} className="text-xs text-red-200 mb-1 leading-relaxed">
            — {caution}
          </p>
        ))}
      </div>
    </div>
  );
}
