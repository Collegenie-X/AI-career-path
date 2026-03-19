'use client';

import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ChevronDown,
  CheckCircle2,
  FlaskConical,
  HelpCircle,
  MessageSquareText,
  Sparkles,
  Swords,
  Trophy,
} from 'lucide-react';

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
  const [openDeepQuestionId, setOpenDeepQuestionId] = useState<string | null>(null);

  const deepQuestionItems = useMemo(() => {
    const flattenedDeepQaItems = (playbook.deepQaByEvidenceArea ?? []).flatMap((area) =>
      area.qaItems.map((qaItem, qaIndex) => ({
        id: `${area.areaId}-${qaIndex}`,
        question: qaItem.question,
        answer: qaItem.answer,
      }))
    );

    const interviewQuestionDerivedItems = playbook.practicalExamples.interviewQuestions.map((question, index) => ({
      id: `interview-${index}`,
      question: `${question} (심층형으로 답변해보세요)`,
      answer:
        '답변 구조는 "상황-문제-행동-결과-배운점"으로 60초 버전과 2분 버전을 모두 준비하세요. 결과는 수치로, 배운점은 다음 실행으로 연결하면 합격 답변이 됩니다.',
    }));

    const cautionDerivedItems = category.cautions.map((caution, index) => ({
      id: `caution-${index}`,
      question: `실전에서 "${caution}" 리스크를 어떻게 방지하나요?`,
      answer:
        '원서 4주 전부터 "서류 검수 2회 + 제출 리허설 1회 + 입학처 확인 1회"를 고정 루틴으로 돌리세요. 리스크는 계획보다 체크리스트로 줄이는 것이 가장 확실합니다.',
    }));

    const fallbackDeepQuestions = [
      {
        id: 'fallback-1',
        question: '합격생은 같은 전형에서 무엇을 다르게 했나요?',
        answer:
          '합격생은 활동 개수를 늘리기보다 전공과 직접 연결되는 핵심 활동 2~3개를 끝까지 깊게 밀어붙입니다. "왜 했는지"와 "무엇이 달라졌는지"가 명확합니다.',
      },
      {
        id: 'fallback-2',
        question: '상위권 대학에서 가장 많이 보는 탈락 사유는 무엇인가요?',
        answer:
          '서류 간 메시지 불일치가 가장 큽니다. 학생부·자소서·면접 답변이 다른 방향이면 신뢰가 떨어집니다. 한 문장 핵심 스토리를 먼저 고정하세요.',
      },
      {
        id: 'fallback-3',
        question: '면접에서 압박 질문이 나왔을 때 어떻게 복구하나요?',
        answer:
          '정답을 찾으려 하지 말고, 근거 중심 사고 과정을 보여주세요. "제가 아는 범위에서 먼저 말씀드리면..."으로 시작해 논리 순서를 지키면 평가가 회복됩니다.',
      },
      {
        id: 'fallback-4',
        question: '활동이 적은 학생도 합격 가능한가요?',
        answer:
          '가능합니다. 활동 1개라도 문제 정의-실행-결과-회고가 완성되면 강한 서류가 됩니다. 양보다 밀도가 중요합니다.',
      },
      {
        id: 'fallback-5',
        question: '자기소개서에서 가장 위험한 문장은 무엇인가요?',
        answer:
          '근거 없는 추상 표현입니다. "열심히 했다" 대신 "무엇을 얼마나 바꿨는지"를 수치와 산출물로 제시해야 합니다.',
      },
      {
        id: 'fallback-6',
        question: '원서 시즌에 일정이 무너질 때 우선순위는 어떻게 잡나요?',
        answer:
          '우선순위는 "마감 임박 + 가중치 높은 제출물"입니다. 매일 3개 핵심 태스크만 확정하고, 나머지는 버리는 선택이 필요합니다.',
      },
      {
        id: 'fallback-7',
        question: '세특 문장을 합격형으로 바꾸는 핵심은 무엇인가요?',
        answer:
          '"행동 동사 + 근거 + 결과 + 확장" 4요소를 넣으세요. 문장 하나가 짧아도 평가자는 성장 곡선을 읽을 수 있습니다.',
      },
      {
        id: 'fallback-8',
        question: '실패 경험은 어떻게 써야 감점이 없나요?',
        answer:
          '실패 자체보다 재설계 과정이 중요합니다. 실패 원인, 수정 전략, 재실행 결과를 명확히 쓰면 오히려 학습 민첩성으로 가산됩니다.',
      },
      {
        id: 'fallback-9',
        question: '지원 대학이 많을수록 합격 확률이 올라가나요?',
        answer:
          '무작정 늘리면 오히려 품질이 떨어집니다. 상향·적정·안정을 전략적으로 나누고 대학별 맞춤 서류 완성도를 확보해야 실제 합격률이 올라갑니다.',
      },
      {
        id: 'fallback-10',
        question: '최종 합격 직전 단계에서 점수를 올리는 마지막 한 수는?',
        answer:
          '면접 답변을 키워드 암기가 아닌 사례 중심으로 바꾸는 것입니다. "내가 실제로 무엇을 바꿨는지"를 말하면 진정성과 실행력이 동시에 전달됩니다.',
      },
    ];

    const mergedQuestionItems = [
      ...flattenedDeepQaItems,
      ...interviewQuestionDerivedItems,
      ...cautionDerivedItems,
      ...fallbackDeepQuestions,
    ];

    const deduplicatedQuestionItems = mergedQuestionItems.filter(
      (questionItem, index, sourceList) =>
        sourceList.findIndex((compareItem) => compareItem.question === questionItem.question) === index
    );

    return deduplicatedQuestionItems.slice(0, 10);
  }, [category.cautions, playbook.deepQaByEvidenceArea, playbook.practicalExamples.interviewQuestions]);

  const handleToggleDeepQuestion = (questionId: string) => {
    setOpenDeepQuestionId((previousQuestionId) =>
      previousQuestionId === questionId ? null : questionId
    );
  };

  return (
    <div className="space-y-3">
      <div
        className="rounded-xl p-3"
        style={{
          background: 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(59,130,246,0.18) 100%)',
          border: '1px solid rgba(16,185,129,0.45)',
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-emerald-300" />
            <h3 className="text-sm font-bold text-white">합격 실전 아레나</h3>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-300/40">
            HARD MODE
          </span>
        </div>
        <p className="text-[11px] text-white/80 leading-relaxed">
          실제 합격생 관점으로 바로 쓰는 문장, 질문, 리스크 대응을 한 번에 훈련합니다.
        </p>
      </div>

      <div
        className="rounded-xl p-3"
        style={{
          background: 'linear-gradient(135deg, rgba(139,92,246,0.22) 0%, rgba(45,212,191,0.18) 100%)',
          border: '1px solid rgba(139,92,246,0.4)',
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <FlaskConical className="w-4 h-4 text-violet-300" />
          <h3 className="text-sm font-bold text-white">세특 문장 템플릿 (즉시 사용)</h3>
        </div>
        {playbook.practicalExamples.setakSentenceTemplates.map((template, index) => (
          <div
            key={index}
            className="rounded-lg p-2 mb-1.5 last:mb-0"
            style={{ background: 'rgba(15,23,42,0.45)', border: '1px solid rgba(196,181,253,0.35)' }}
          >
            <p className="text-[11px] font-semibold text-violet-100 mb-0.5">템플릿 #{index + 1}</p>
            <p className="text-xs text-white/90">{template}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl p-3 bg-white/5 border border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquareText className="w-4 h-4 text-cyan-300" />
          <h3 className="text-sm font-bold text-white">면접 질문 실전</h3>
        </div>
        {playbook.practicalExamples.interviewQuestions.map((question, index) => (
          <div
            key={index}
            className="rounded-lg p-2 mb-1.5 last:mb-0"
            style={{ background: 'rgba(15,23,42,0.42)', border: '1px solid rgba(56,189,248,0.32)' }}
          >
            <p className="text-[11px] font-semibold text-cyan-100 mb-0.5">Q{index + 1}</p>
            <p className="text-xs text-white/85">{question}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl p-3 bg-white/5 border border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <h3 className="text-sm font-bold text-white">AI 시대 논문·메이커 활동 예시</h3>
        </div>
        {playbook.practicalExamples.makerAndResearchExamples.map((example, index) => (
          <div
            key={index}
            className="rounded-lg p-2 mb-1.5 last:mb-0 flex items-start gap-2"
            style={{ background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(252,211,77,0.35)' }}
          >
            <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-amber-300 flex-shrink-0" />
            <p className="text-xs text-white/85">{example}</p>
          </div>
        ))}
      </div>

      <div
        className="rounded-xl p-3"
        style={{
          background: 'linear-gradient(135deg, rgba(56,189,248,0.2) 0%, rgba(99,102,241,0.12) 100%)',
          border: '1px solid rgba(125,211,252,0.45)',
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Swords className="w-4 h-4 text-sky-200" />
            <h3 className="text-sm font-bold text-white">심층 합격 Q&A 10 (아코디언)</h3>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-400/20 text-sky-100 border border-sky-300/40">
            TOP 10
          </span>
        </div>

        <div className="space-y-2">
          {deepQuestionItems.map((questionItem, questionIndex) => {
            const isOpen = openDeepQuestionId === questionItem.id;
            return (
              <div
                key={questionItem.id}
                className="rounded-lg p-2"
                style={{
                  background: 'rgba(15,23,42,0.58)',
                  border: '1px solid rgba(125,211,252,0.32)',
                }}
              >
                <button
                  onClick={() => handleToggleDeepQuestion(questionItem.id)}
                  className="w-full flex items-center justify-between gap-2 text-left"
                  aria-label={`심층 질문 ${questionIndex + 1} ${isOpen ? '접기' : '펼치기'}`}
                >
                  <div className="flex items-start gap-2 min-w-0">
                    <HelpCircle className="w-4 h-4 mt-0.5 text-sky-200 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[11px] text-sky-100 font-semibold">심층 Q{questionIndex + 1}</p>
                      <p className="text-[11px] text-slate-100 leading-relaxed">{questionItem.question}</p>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-sky-100 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {isOpen ? (
                  <div
                    className="mt-2 ml-6 rounded-md p-2"
                    style={{ background: 'rgba(30,41,59,0.64)', border: '1px solid rgba(125,211,252,0.2)' }}
                  >
                    <p className="text-[11px] text-slate-100 leading-relaxed">{questionItem.answer}</p>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl p-3 bg-red-500/10 border border-red-500/30">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-red-300" />
          <h3 className="text-sm font-bold text-white">실수 방지 체크</h3>
        </div>
        {category.cautions.map((caution, index) => (
          <p key={index} className="text-xs text-red-200 mb-1">
            - {caution}
          </p>
        ))}
      </div>
    </div>
  );
}
