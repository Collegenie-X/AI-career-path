'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, X } from 'lucide-react';

import { TOP_STRATEGY_HUB_CONFIG } from './topStrategyHubConfig';
import type { StrategyHubSection } from './TopStrategyHubTypes';

type TopStrategyHubDetailDialogProps = {
  sections: StrategyHubSection[];
  initialSectionId: string;
  initialGradeId: string;
  onClose: () => void;
};

type DetailContentTabId = 'core' | 'actionCards' | 'deepQa';

export function TopStrategyHubDetailDialog({
  sections,
  initialSectionId,
  initialGradeId,
  onClose,
}: TopStrategyHubDetailDialogProps) {
  const [mounted, setMounted] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState(initialSectionId);
  const [activeGradeId, setActiveGradeId] = useState(initialGradeId);
  const [activeDetailContentTabId, setActiveDetailContentTabId] =
    useState<DetailContentTabId>('core');
  const [openedDeepQaIndex, setOpenedDeepQaIndex] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setActiveSectionId(initialSectionId);
    setActiveGradeId(initialGradeId);
  }, [initialSectionId, initialGradeId]);

  useEffect(() => {
    setOpenedDeepQaIndex(0);
  }, [activeSectionId, activeGradeId]);

  const activeSection = useMemo(
    () => sections.find((section) => section.id === activeSectionId) ?? sections[0],
    [activeSectionId, sections]
  );

  const activeGrade = useMemo(
    () => activeSection?.grades.find((grade) => grade.id === activeGradeId) ?? activeSection?.grades[0],
    [activeGradeId, activeSection]
  );
  const deepQaByGradeId = useMemo(
    () => groupDeepQaByGrade(activeSection?.deepQa ?? []),
    [activeSection?.deepQa]
  );
  const filteredDeepQaItems = deepQaByGradeId[normalizeGradeId(activeGradeId)];

  useEffect(() => {
    if (filteredDeepQaItems.length === 0) {
      setOpenedDeepQaIndex(null);
      return;
    }

    setOpenedDeepQaIndex((previousIndex) =>
      previousIndex === null || previousIndex >= filteredDeepQaItems.length ? 0 : previousIndex
    );
  }, [filteredDeepQaItems]);

  if (!mounted || !activeSection || !activeGrade) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center p-2 md:p-4"
      style={{ background: 'rgba(2,6,23,0.86)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[28rem] md:max-w-[34rem] h-[94dvh] md:h-auto md:max-h-[92vh] overflow-y-auto rounded-2xl"
        style={{
          background: 'linear-gradient(180deg, rgba(15,23,42,0.98), rgba(17,24,39,0.98))',
          border: '1px solid rgba(129,140,248,0.35)',
          boxShadow: '0 12px 56px rgba(15,23,42,0.45)',
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 p-3 sm:p-4 space-y-3 bg-slate-950/95 backdrop-blur border-b border-white/10">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-white">{TOP_STRATEGY_HUB_CONFIG.detailDialogTitle}</p>
              <p className="text-xs text-slate-300">{TOP_STRATEGY_HUB_CONFIG.detailDialogDescription}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 border border-white/20"
              aria-label="상세 다이얼로그 닫기"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {sections.map((section) => {
              const isActive = section.id === activeSection.id;
              return (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveSectionId(section.id);
                    setActiveGradeId(section.grades[0]?.id ?? '');
                  }}
                  className="shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
                  style={{
                    background: isActive ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${isActive ? 'rgba(129,140,248,0.75)' : 'rgba(148,163,184,0.25)'}`,
                    color: isActive ? '#c7d2fe' : '#cbd5e1',
                  }}
                >
                  {section.emoji} {section.label}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {activeSection.grades.map((grade) => {
              const isActive = grade.id === activeGrade.id;
              return (
                <button
                  key={`${activeSection.id}-${grade.id}`}
                  onClick={() => setActiveGradeId(grade.id)}
                  className="px-2 py-1.5 rounded-lg text-xs font-semibold"
                  style={{
                    background: isActive ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${isActive ? 'rgba(74,222,128,0.72)' : 'rgba(148,163,184,0.25)'}`,
                    color: isActive ? '#bbf7d0' : '#cbd5e1',
                  }}
                >
                  {grade.label}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setActiveDetailContentTabId('core')}
              className="px-2 py-1.5 rounded-lg text-xs font-semibold"
              style={{
                background:
                  activeDetailContentTabId === 'core' ? 'rgba(99,102,241,0.22)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${
                  activeDetailContentTabId === 'core'
                    ? 'rgba(129,140,248,0.72)'
                    : 'rgba(148,163,184,0.25)'
                }`,
                color: activeDetailContentTabId === 'core' ? '#c7d2fe' : '#cbd5e1',
              }}
            >
              핵심 가이드
            </button>
            <button
              onClick={() => setActiveDetailContentTabId('actionCards')}
              className="px-2 py-1.5 rounded-lg text-xs font-semibold"
              style={{
                background:
                  activeDetailContentTabId === 'actionCards'
                    ? 'rgba(99,102,241,0.22)'
                    : 'rgba(255,255,255,0.05)',
                border: `1px solid ${
                  activeDetailContentTabId === 'actionCards'
                    ? 'rgba(129,140,248,0.72)'
                    : 'rgba(148,163,184,0.25)'
                }`,
                color: activeDetailContentTabId === 'actionCards' ? '#c7d2fe' : '#cbd5e1',
              }}
            >
              실행 카드
            </button>
            <button
              onClick={() => setActiveDetailContentTabId('deepQa')}
              className="px-2 py-1.5 rounded-lg text-xs font-semibold"
              style={{
                background:
                  activeDetailContentTabId === 'deepQa'
                    ? 'rgba(99,102,241,0.22)'
                    : 'rgba(255,255,255,0.05)',
                border: `1px solid ${
                  activeDetailContentTabId === 'deepQa'
                    ? 'rgba(129,140,248,0.72)'
                    : 'rgba(148,163,184,0.25)'
                }`,
                color: activeDetailContentTabId === 'deepQa' ? '#c7d2fe' : '#cbd5e1',
              }}
            >
              심화 Q&A
            </button>
          </div>
        </div>

        <div className="p-3 sm:p-4 space-y-3">
          <div className="rounded-xl p-3 bg-indigo-500/10 border border-indigo-400/40">
            <p className="text-sm font-bold text-white mb-1">
              {activeSection.emoji} {activeSection.title}
            </p>
            <p className="text-xs text-indigo-100 mb-2">{activeSection.summary}</p>
            <p className="text-xs text-indigo-200">{activeGrade.objective}</p>
          </div>

          {activeDetailContentTabId === 'core' && (
            <>
              <ArrayInfoBlock
                title={TOP_STRATEGY_HUB_CONFIG.detailSections.necessity}
                items={activeSection.necessity}
                toneClassName="bg-amber-400/10 border-amber-300/40 text-amber-100"
              />
              <ArrayInfoBlock
                title={TOP_STRATEGY_HUB_CONFIG.detailSections.advantage}
                items={activeSection.admissionsOfficerAdvantageTips}
                toneClassName="bg-pink-500/10 border-pink-300/40 text-pink-100"
              />
              <ArrayInfoBlock
                title={TOP_STRATEGY_HUB_CONFIG.detailSections.evidence}
                items={activeSection.evidencePlacementGuide}
                toneClassName="bg-sky-500/10 border-sky-300/40 text-sky-100"
              />
              <ArrayInfoBlock
                title={TOP_STRATEGY_HUB_CONFIG.detailSections.checklist}
                items={activeGrade.detailChecklist}
                toneClassName="bg-blue-500/10 border-blue-300/40 text-blue-100"
              />
            </>
          )}

          {activeDetailContentTabId === 'actionCards' && (
            <div className="rounded-xl p-3 bg-slate-800/70 border border-slate-500/30">
              <p className="text-xs font-semibold text-white mb-2">
                {TOP_STRATEGY_HUB_CONFIG.detailSections.cards}
              </p>
              <div className="space-y-2">
                {activeGrade.cards.map((card, index) => (
                  <div
                    key={`${activeSection.id}-${activeGrade.id}-card-${index}`}
                    className="rounded-lg p-2.5 bg-slate-900/70 border border-slate-600/40"
                  >
                    <p className="text-xs font-semibold text-white">{card.title}</p>
                    <p className="text-xs text-slate-300 mt-0.5">{card.description}</p>
                    <p className="text-[11px] text-indigo-200 mt-1.5">권장 시점: {card.recommendedTiming}</p>
                    <div className="mt-2 space-y-1">
                      {card.actionSteps.map((step, stepIndex) => (
                        <p
                          key={`${activeSection.id}-${activeGrade.id}-${index}-step-${stepIndex}`}
                          className="text-xs text-slate-200"
                        >
                          - {step}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeDetailContentTabId === 'deepQa' && (
            <div className="rounded-xl p-3 bg-violet-500/10 border border-violet-300/35">
              <p className="text-xs font-semibold text-violet-100">
                {TOP_STRATEGY_HUB_CONFIG.detailSections.qa} · {activeGrade.label}
              </p>

              {filteredDeepQaItems.length > 0 && (
                <div className="space-y-2 mt-2">
                  {filteredDeepQaItems.map((qaItem, index) => {
                    const isOpenedQuestion = openedDeepQaIndex === index;
                    const mappedCard = mapQaItemToActionCard(activeGrade.cards, index);
                    const mappedChecklist = activeGrade.detailChecklist.slice(0, 2);
                    const mappedEvidence =
                      activeSection.evidencePlacementGuide &&
                      activeSection.evidencePlacementGuide.length > 0
                        ? activeSection.evidencePlacementGuide[0]
                        : null;

                    return (
                      <div
                        key={`${activeSection.id}-qa-${index}`}
                        className="rounded-lg p-2 bg-slate-900/65 border border-violet-200/25"
                      >
                        <button
                          onClick={() => setOpenedDeepQaIndex(index)}
                          className="w-full flex items-start justify-between gap-2 text-left"
                          aria-label={`심화 질문 ${index + 1} ${isOpenedQuestion ? '열림' : '열기'}`}
                        >
                          <p className="text-[11px] font-semibold text-violet-100">
                            Q{index + 1}. {qaItem.question}
                          </p>
                          <ChevronDown
                            className={`w-4 h-4 text-violet-100 transition-transform ${
                              isOpenedQuestion ? 'rotate-180' : ''
                            }`}
                          />
                        </button>

                        {isOpenedQuestion && (
                          <div className="mt-2 space-y-2">
                            <p className="text-[11px] text-violet-50 leading-relaxed">{qaItem.answer}</p>

                            {mappedCard && (
                              <div className="rounded-md p-2 bg-indigo-500/10 border border-indigo-300/35">
                                <p className="text-[11px] font-semibold text-indigo-100 mb-1">
                                  전략 실행 순서
                                </p>
                                <p className="text-[11px] text-indigo-50 mb-1.5">
                                  추천 카드: {mappedCard.title}
                                </p>
                                {mappedCard.actionSteps.slice(0, 3).map((step, stepIndex) => (
                                  <p
                                    key={`${activeSection.id}-${activeGrade.id}-${index}-mapped-step-${stepIndex}`}
                                    className="text-[11px] text-indigo-100 mb-1 last:mb-0"
                                  >
                                    {stepIndex + 1}. {step}
                                  </p>
                                ))}
                                <p className="text-[11px] text-indigo-200 mt-1.5">
                                  권장 시점: {mappedCard.recommendedTiming}
                                </p>
                              </div>
                            )}

                            {mappedChecklist.length > 0 && (
                              <div className="rounded-md p-2 bg-blue-500/10 border border-blue-300/35">
                                <p className="text-[11px] font-semibold text-blue-100 mb-1">
                                  리스크 점검 포인트
                                </p>
                                {mappedChecklist.map((checkItem, checkIndex) => (
                                  <p
                                    key={`${activeSection.id}-${activeGrade.id}-${index}-mapped-check-${checkIndex}`}
                                    className="text-[11px] text-blue-100 mb-1 last:mb-0"
                                  >
                                    - {checkItem}
                                  </p>
                                ))}
                              </div>
                            )}

                            {mappedEvidence && (
                              <div className="rounded-md p-2 bg-emerald-500/10 border border-emerald-300/35">
                                <p className="text-[11px] font-semibold text-emerald-100 mb-1">
                                  서류·면접 증빙 연결
                                </p>
                                <p className="text-[11px] text-emerald-100">{mappedEvidence}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {filteredDeepQaItems.length === 0 && (
                <div className="rounded-lg p-2 mt-2 bg-slate-900/65 border border-violet-200/25">
                  <p className="text-xs text-violet-100">
                    선택한 학년에 해당하는 심화 Q&A가 아직 없습니다.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

function normalizeGradeId(gradeId: string): 'grade1' | 'grade2' | 'grade3' {
  if (gradeId === 'grade2') return 'grade2';
  if (gradeId === 'grade3') return 'grade3';
  return 'grade1';
}

function groupDeepQaByGrade(
  deepQa: Array<{ question: string; answer: string }>
): Record<'grade1' | 'grade2' | 'grade3', Array<{ question: string; answer: string }>> {
  const groupedDeepQa: Record<
    'grade1' | 'grade2' | 'grade3',
    Array<{ question: string; answer: string }>
  > = {
    grade1: [],
    grade2: [],
    grade3: [],
  };

  deepQa.forEach((qaItem) => {
    const targetText = `${qaItem.question} ${qaItem.answer}`;
    const isGrade1Related = /고1|1학년|수강신청|기초|탐색/.test(targetText);
    const isGrade2Related = /고2|2학년|심화|확장|팀 프로젝트|중간/.test(targetText);
    const isGrade3Related = /고3|3학년|원서|면접|수시|정시|지원/.test(targetText);

    if (isGrade1Related) groupedDeepQa.grade1.push(qaItem);
    if (isGrade2Related) groupedDeepQa.grade2.push(qaItem);
    if (isGrade3Related) groupedDeepQa.grade3.push(qaItem);

    if (!isGrade1Related && !isGrade2Related && !isGrade3Related) {
      groupedDeepQa.grade1.push(qaItem);
      groupedDeepQa.grade2.push(qaItem);
      groupedDeepQa.grade3.push(qaItem);
    }
  });

  return groupedDeepQa;
}

function mapQaItemToActionCard(
  cards: Array<{
    title: string;
    description: string;
    actionSteps: string[];
    recommendedTiming: string;
  }>,
  qaIndex: number
) {
  if (!cards || cards.length === 0) return null;
  const mappedIndex = qaIndex % cards.length;
  return cards[mappedIndex];
}

function ArrayInfoBlock({
  title,
  items,
  toneClassName,
}: {
  title: string;
  items?: string[];
  toneClassName: string;
}) {
  if (!items || items.length === 0) return null;

  return (
    <div className={`rounded-xl p-3 border ${toneClassName}`}>
      <p className="text-xs font-semibold mb-1.5">{title}</p>
      <div className="space-y-1">
        {items.map((item, index) => (
          <p key={`${title}-${index}`} className="text-xs">
            • {item}
          </p>
        ))}
      </div>
    </div>
  );
}
