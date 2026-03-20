'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, X, Zap, Rocket, FlaskConical, Calendar, Target, Lightbulb, CheckCircle2 } from 'lucide-react';

import { TOP_STRATEGY_HUB_CONFIG } from './topStrategyHubConfig';
import { TopStrategyHubCard } from './TopStrategyHubCard';
import { TopStrategyHubInfoBlock } from './TopStrategyHubInfoBlock';
import { TopStrategyHubQAItem } from './TopStrategyHubQAItem';
import type { StrategyHubSection } from './TopStrategyHubTypes';

type TopStrategyHubDetailDialogProps = {
  sections: StrategyHubSection[];
  initialSectionId: string;
  initialGradeId: string;
  onClose: () => void;
  /** inline: jobs/explore 대입 탐색 오른쪽 패널용 (모달 없이 스크롤 영역만) */
  variant?: 'modal' | 'inline';
};

type DetailContentTabId = 'core' | 'actionCards' | 'deepQa';

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

export function TopStrategyHubDetailDialog({
  sections,
  initialSectionId,
  initialGradeId,
  onClose,
  variant = 'modal',
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

  const inlineWrapperClass =
    'w-full max-w-none md:max-w-none h-[min(92dvh,900px)] md:h-auto md:max-h-[min(92dvh,900px)] overflow-y-auto rounded-2xl';

  const panelInner = (
      <div
        className={
          variant === 'inline'
            ? inlineWrapperClass
            : 'w-full max-w-[28rem] md:max-w-[34rem] h-[94dvh] md:h-auto md:max-h-[92vh] overflow-y-auto rounded-2xl'
        }
        style={{
          background: 'linear-gradient(180deg, rgba(15,23,42,0.98), rgba(17,24,39,0.98))',
          border: '1px solid rgba(129,140,248,0.35)',
          boxShadow: '0 12px 56px rgba(15,23,42,0.45)',
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 p-3 sm:p-4 space-y-3 bg-gradient-to-b from-slate-950/98 to-slate-900/95 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <span className="text-base">📖</span>
              </div>
              <div>
                <p className="text-sm font-bold text-white">{TOP_STRATEGY_HUB_CONFIG.detailDialogTitle}</p>
                <p className="text-xs text-slate-300">{TOP_STRATEGY_HUB_CONFIG.detailDialogDescription}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/5 border border-white/20 hover:bg-white/10 transition-all"
              aria-label="상세 다이얼로그 닫기"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {sections.map((section) => {
              const isActive = section.id === activeSection.id;
              return (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveSectionId(section.id);
                    setActiveGradeId(section.grades[0]?.id ?? '');
                  }}
                  className="shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                  style={{
                    background: isActive 
                      ? 'linear-gradient(135deg, rgba(99,102,241,0.3) 0%, rgba(139,92,246,0.3) 100%)'
                      : 'rgba(255,255,255,0.06)',
                    border: `2px solid ${isActive ? 'rgba(129,140,248,0.8)' : 'rgba(148,163,184,0.25)'}`,
                    color: isActive ? '#e0e7ff' : '#cbd5e1',
                    boxShadow: isActive ? '0 4px 12px rgba(99,102,241,0.4)' : 'none',
                  }}
                >
                  <div className={`${isActive ? 'text-indigo-300' : 'text-slate-400'}`}>
                    {SECTION_ICON_MAP[section.id]}
                  </div>
                  <span>{section.emoji} {section.label}</span>
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
                  className="px-2 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5"
                  style={{
                    background: isActive 
                      ? 'linear-gradient(135deg, rgba(34,197,94,0.3) 0%, rgba(16,185,129,0.3) 100%)'
                      : 'rgba(255,255,255,0.05)',
                    border: `2px solid ${isActive ? 'rgba(74,222,128,0.8)' : 'rgba(148,163,184,0.25)'}`,
                    color: isActive ? '#d1fae5' : '#cbd5e1',
                    boxShadow: isActive ? '0 4px 12px rgba(34,197,94,0.4)' : 'none',
                  }}
                >
                  <span className="text-base">{GRADE_ICON_MAP[grade.id]}</span>
                  <span>{grade.label}</span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setActiveDetailContentTabId('core')}
              className="px-3 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5"
              style={{
                background:
                  activeDetailContentTabId === 'core' 
                    ? 'linear-gradient(135deg, rgba(99,102,241,0.3) 0%, rgba(139,92,246,0.3) 100%)'
                    : 'rgba(255,255,255,0.05)',
                border: `2px solid ${
                  activeDetailContentTabId === 'core'
                    ? 'rgba(129,140,248,0.8)'
                    : 'rgba(148,163,184,0.25)'
                }`,
                color: activeDetailContentTabId === 'core' ? '#e0e7ff' : '#cbd5e1',
                boxShadow: activeDetailContentTabId === 'core' ? '0 4px 12px rgba(99,102,241,0.4)' : 'none',
              }}
            >
              <Target className="w-3.5 h-3.5" />
              <span>핵심 가이드</span>
            </button>
            <button
              onClick={() => setActiveDetailContentTabId('actionCards')}
              className="px-3 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5"
              style={{
                background:
                  activeDetailContentTabId === 'actionCards'
                    ? 'linear-gradient(135deg, rgba(99,102,241,0.3) 0%, rgba(139,92,246,0.3) 100%)'
                    : 'rgba(255,255,255,0.05)',
                border: `2px solid ${
                  activeDetailContentTabId === 'actionCards'
                    ? 'rgba(129,140,248,0.8)'
                    : 'rgba(148,163,184,0.25)'
                }`,
                color: activeDetailContentTabId === 'actionCards' ? '#e0e7ff' : '#cbd5e1',
                boxShadow: activeDetailContentTabId === 'actionCards' ? '0 4px 12px rgba(99,102,241,0.4)' : 'none',
              }}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>실행 카드</span>
            </button>
            <button
              onClick={() => setActiveDetailContentTabId('deepQa')}
              className="px-3 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5"
              style={{
                background:
                  activeDetailContentTabId === 'deepQa'
                    ? 'linear-gradient(135deg, rgba(99,102,241,0.3) 0%, rgba(139,92,246,0.3) 100%)'
                    : 'rgba(255,255,255,0.05)',
                border: `2px solid ${
                  activeDetailContentTabId === 'deepQa'
                    ? 'rgba(129,140,248,0.8)'
                    : 'rgba(148,163,184,0.25)'
                }`,
                color: activeDetailContentTabId === 'deepQa' ? '#e0e7ff' : '#cbd5e1',
                boxShadow: activeDetailContentTabId === 'deepQa' ? '0 4px 12px rgba(99,102,241,0.4)' : 'none',
              }}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>심화 Q&A</span>
            </button>
          </div>
        </div>

        <div className="p-3 sm:p-4 space-y-3">
          <div 
            className="rounded-2xl p-4 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.2) 100%)',
              border: '2px solid rgba(129,140,248,0.4)',
              boxShadow: '0 4px 16px rgba(99,102,241,0.2)',
            }}
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-2xl" />
            <div className="relative flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/40 to-purple-600/40 flex items-center justify-center border-2 border-indigo-400/50 shadow-lg shrink-0">
                <span className="text-2xl">{activeSection.emoji}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white mb-1.5">
                  {activeSection.title}
                </p>
                <p className="text-xs text-indigo-100 mb-2 leading-relaxed">{activeSection.summary}</p>
                <div className="flex items-center gap-2">
                  <span className="text-base">{GRADE_ICON_MAP[activeGrade.id]}</span>
                  <p className="text-xs text-indigo-200 leading-relaxed">{activeGrade.objective}</p>
                </div>
              </div>
            </div>
          </div>

          {activeDetailContentTabId === 'core' && (
            <>
              <TopStrategyHubInfoBlock
                title={TOP_STRATEGY_HUB_CONFIG.detailSections.necessity}
                items={activeSection.necessity}
                icon="💡"
                toneClassName="bg-amber-400/10 border-amber-300/40 text-amber-100"
                accentColor="rgba(251,191,36,0.5)"
              />
              <TopStrategyHubInfoBlock
                title={TOP_STRATEGY_HUB_CONFIG.detailSections.advantage}
                items={activeSection.admissionsOfficerAdvantageTips}
                icon="✨"
                toneClassName="bg-pink-500/10 border-pink-300/40 text-pink-100"
                accentColor="rgba(236,72,153,0.5)"
              />
              <TopStrategyHubInfoBlock
                title={TOP_STRATEGY_HUB_CONFIG.detailSections.evidence}
                items={activeSection.evidencePlacementGuide}
                icon="📝"
                toneClassName="bg-sky-500/10 border-sky-300/40 text-sky-100"
                accentColor="rgba(14,165,233,0.5)"
              />
              <TopStrategyHubInfoBlock
                title={TOP_STRATEGY_HUB_CONFIG.detailSections.checklist}
                items={activeGrade.detailChecklist}
                icon="✅"
                toneClassName="bg-blue-500/10 border-blue-300/40 text-blue-100"
                accentColor="rgba(59,130,246,0.5)"
              />
            </>
          )}

          {activeDetailContentTabId === 'actionCards' && (
            <div 
              className="rounded-2xl p-4 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(30,41,59,0.8) 0%, rgba(15,23,42,0.8) 100%)',
                border: '2px solid rgba(148,163,184,0.3)',
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500/40 to-green-600/40 flex items-center justify-center border border-emerald-400/50">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                </div>
                <p className="text-sm font-bold text-white">
                  {TOP_STRATEGY_HUB_CONFIG.detailSections.cards}
                </p>
              </div>
              <div className="space-y-3">
                {activeGrade.cards.map((card, index) => (
                  <TopStrategyHubCard
                    key={`${activeSection.id}-${activeGrade.id}-card-${index}`}
                    card={card}
                    index={index}
                    sectionId={activeSection.id}
                    gradeId={activeGrade.id}
                  />
                ))}
              </div>
            </div>
          )}

          {activeDetailContentTabId === 'deepQa' && (
            <div 
              className="rounded-2xl p-4 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(168,85,247,0.15) 100%)',
                border: '2px solid rgba(168,85,247,0.35)',
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500/40 to-violet-600/40 flex items-center justify-center border border-purple-400/50">
                  <Lightbulb className="w-4 h-4 text-purple-300" />
                </div>
                <p className="text-sm font-bold text-white">
                  {TOP_STRATEGY_HUB_CONFIG.detailSections.qa}
                </p>
                <div className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-400/40">
                  <span className="text-xs font-bold text-purple-200">{activeGrade.label}</span>
                </div>
              </div>

              {filteredDeepQaItems.length > 0 && (
                <div className="space-y-2">
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
                      <TopStrategyHubQAItem
                        key={`${activeSection.id}-qa-${index}`}
                        qaItem={qaItem}
                        index={index}
                        isOpened={isOpenedQuestion}
                        onToggle={() => setOpenedDeepQaIndex(index)}
                        mappedCard={mappedCard}
                        mappedChecklist={mappedChecklist}
                        mappedEvidence={mappedEvidence}
                        sectionId={activeSection.id}
                        gradeId={activeGrade.id}
                      />
                    );
                  })}
                </div>
              )}

              {filteredDeepQaItems.length === 0 && (
                <div 
                  className="rounded-xl p-3"
                  style={{
                    background: 'rgba(15,23,42,0.9)',
                    border: '2px solid rgba(148,163,184,0.25)',
                  }}
                >
                  <p className="text-xs text-violet-100">
                    선택한 학년에 해당하는 심화 Q&A가 아직 없습니다.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
  );

  if (variant === 'inline') {
    return panelInner;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center p-2 md:p-4"
      style={{ background: 'rgba(2,6,23,0.86)' }}
      onClick={onClose}
    >
      {panelInner}
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
