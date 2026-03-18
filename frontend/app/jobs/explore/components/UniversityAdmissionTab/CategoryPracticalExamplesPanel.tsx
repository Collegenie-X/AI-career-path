'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, FlaskConical } from 'lucide-react';

type CategoryPracticalExamplesPanelProps = {
  category: {
    color: string;
    cautions: string[];
  };
  playbook: {
    practicalExamples: {
      setakSentenceTemplates: string[];
      interviewQuestions: string[];
      makerAndResearchExamples: string[];
    };
    deepQaByEvidenceArea?: Array<{
      areaId: string;
      areaTitle: string;
      areaSummary: string;
      qaItems: Array<{
        question: string;
        answer: string;
      }>;
    }>;
  };
};

export function CategoryPracticalExamplesPanel({
  category,
  playbook,
}: CategoryPracticalExamplesPanelProps) {
  const initialAccordionOpenState = useMemo(
    () =>
      (playbook.deepQaByEvidenceArea ?? []).reduce<Record<string, boolean>>((stateByAreaId, area) => {
        stateByAreaId[area.areaId] = false;
        return stateByAreaId;
      }, {}),
    [playbook.deepQaByEvidenceArea]
  );
  const [isAreaAccordionOpenById, setIsAreaAccordionOpenById] = useState<Record<string, boolean>>(
    initialAccordionOpenState
  );

  const handleToggleAreaAccordion = (areaId: string) => {
    setIsAreaAccordionOpenById((previousState) => ({
      ...previousState,
      [areaId]: !previousState[areaId],
    }));
  };

  return (
    <div className="space-y-3">
      <div
        className="rounded-xl p-3"
        style={{
          background: 'linear-gradient(135deg, rgba(139,92,246,0.22) 0%, rgba(45,212,191,0.18) 100%)',
          border: '1px solid rgba(139,92,246,0.4)',
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <FlaskConical className="w-4 h-4 text-violet-300" />
          <h3 className="text-sm font-bold text-white">세특 문장 템플릿</h3>
        </div>
        {playbook.practicalExamples.setakSentenceTemplates.map((template, index) => (
          <p key={index} className="text-xs text-white/90 mb-1.5">
            {index + 1}. {template}
          </p>
        ))}
      </div>

      <div className="rounded-xl p-3 bg-white/5 border border-white/10">
        <h3 className="text-sm font-bold text-white mb-2">면접 질문 실전</h3>
        {playbook.practicalExamples.interviewQuestions.map((question, index) => (
          <p key={index} className="text-xs text-white/85 mb-1.5">
            Q{index + 1}. {question}
          </p>
        ))}
      </div>

      <div className="rounded-xl p-3 bg-white/5 border border-white/10">
        <h3 className="text-sm font-bold text-white mb-2">AI 시대 논문·메이커 활동 예시</h3>
        {playbook.practicalExamples.makerAndResearchExamples.map((example, index) => (
          <p key={index} className="text-xs text-white/85 mb-1.5">
            • {example}
          </p>
        ))}
      </div>

      {playbook.deepQaByEvidenceArea && playbook.deepQaByEvidenceArea.length > 0 && (
        <div
          className="rounded-xl p-3"
          style={{
            background: 'linear-gradient(135deg, rgba(56,189,248,0.18) 0%, rgba(14,165,233,0.1) 100%)',
            border: '1px solid rgba(56,189,248,0.35)',
          }}
        >
          <h3 className="text-sm font-bold text-white mb-2">영역별 심화 Q&A (각 4문항)</h3>
          <div className="space-y-2">
            {playbook.deepQaByEvidenceArea.map((area) => {
              const isOpen = Boolean(isAreaAccordionOpenById[area.areaId]);
              return (
                <div
                  key={area.areaId}
                  className="rounded-lg p-2"
                  style={{
                    background: 'rgba(15,23,42,0.58)',
                    border: '1px solid rgba(125,211,252,0.28)',
                  }}
                >
                  <button
                    onClick={() => handleToggleAreaAccordion(area.areaId)}
                    className="w-full flex items-center justify-between text-left"
                    aria-label={`${area.areaTitle} 심화 질문 ${isOpen ? '접기' : '펼치기'}`}
                  >
                    <div>
                      <p className="text-xs font-semibold text-sky-100">{area.areaTitle}</p>
                      <p className="text-[11px] text-sky-200/90">{area.areaSummary}</p>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-sky-100 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="mt-2 space-y-2">
                      {area.qaItems.map((qaItem, qaIndex) => (
                        <div
                          key={`${area.areaId}-qa-${qaIndex}`}
                          className="rounded-md p-2"
                          style={{
                            background: 'rgba(30,41,59,0.62)',
                            border: '1px solid rgba(125,211,252,0.22)',
                          }}
                        >
                          <p className="text-[11px] font-semibold text-sky-100 mb-1">
                            Q{qaIndex + 1}. {qaItem.question}
                          </p>
                          <p className="text-[11px] text-slate-100">{qaItem.answer}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="rounded-xl p-3 bg-red-500/10 border border-red-500/30">
        <h3 className="text-sm font-bold text-white mb-2">실수 방지 체크</h3>
        {category.cautions.map((caution, index) => (
          <p key={index} className="text-xs text-red-200 mb-1">
            - {caution}
          </p>
        ))}
      </div>
    </div>
  );
}
