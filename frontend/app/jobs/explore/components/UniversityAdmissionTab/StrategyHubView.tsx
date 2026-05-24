'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, X } from 'lucide-react';
import { TwoColumnPanelLayout } from '@/components/TwoColumnPanelLayout';
import { EXPLORE_PAGE_LAYOUT_CLASS } from '../../config';
import { TopStrategyHubDetailDialog } from './TopStrategyHubDetailDialog';
import type { StrategyHubSection } from './TopStrategyHubTypes';

/** ==text== 마커를 형광펜 강조로 렌더링 */
function HL({ text }: { text: string }) {
  const parts = text.split(/==(.+?)==/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark
            key={i}
            className="rounded-sm px-0.5 font-medium not-italic"
            style={{
              background: 'rgba(250,204,21,0.10)',
              color: 'inherit',
            }}
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

export type StrategyHubMasterDetailLabels = {
  readonly emptyDetailTitle: string;
  readonly emptyDetailSubText: string;
  readonly backToMainLabel: string;
  readonly backToMainAriaLabel: string;
  readonly listIntroEmoji: string;
  readonly listIntroTitle: string;
  readonly listIntroDescription: string;
};

type StrategyHubViewProps = {
  readonly sections: StrategyHubSection[];
  readonly onBackToAdmissionExploreMain?: () => void;
  readonly masterDetailLabels: StrategyHubMasterDetailLabels;
  /** right-panel: 부모 TwoColumnPanel의 detailSlot 안에 컴팩트 목록으로 렌더링 */
  readonly mode?: 'standalone' | 'right-panel';
  readonly onClose?: () => void;
};

function AdmissionSubscreenBackToMainButton({
  label,
  ariaLabel,
  onBack,
}: {
  readonly label: string;
  readonly ariaLabel: string;
  readonly onBack: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onBack}
      className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-1"
      aria-label={ariaLabel}
    >
      <span aria-hidden>←</span>
      <span className="text-sm font-semibold">{label}</span>
    </button>
  );
}

function StrategyHubListIntroBlock({
  emoji,
  title,
  description,
}: {
  readonly emoji: string;
  readonly title: string;
  readonly description: string;
}) {
  return (
    <div
      className="rounded-xl p-3"
      style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.2) 100%)',
        border: '1px solid rgba(129,140,248,0.35)',
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl" aria-hidden>
          {emoji}
        </span>
        <h3 className="text-sm font-bold text-white">{title}</h3>
      </div>
      <p className="text-xs text-white/70 leading-relaxed">{description}</p>
    </div>
  );
}

export function StrategyHubView({
  sections,
  onBackToAdmissionExploreMain,
  masterDetailLabels,
  mode = 'standalone',
  onClose,
}: StrategyHubViewProps) {
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedGradeId, setSelectedGradeId] = useState<string | null>(null);

  const selectedSection = sections.find((s) => s.id === selectedSectionId) ?? null;
  const selectedGrade = selectedSection?.grades.find((g) => g.id === selectedGradeId) ?? selectedSection?.grades[0] ?? null;
  const hasSelection = selectedSectionId !== null && selectedGradeId !== null;

  const handleSelectSection = (sectionId: string) => {
    const section = sections.find((s) => s.id === sectionId);
    const defaultGradeId = section?.grades[0]?.id ?? null;
    setSelectedSectionId(sectionId);
    setSelectedGradeId(defaultGradeId);
  };

  const handleClearSelection = () => {
    setSelectedSectionId(null);
    setSelectedGradeId(null);
  };

  const handleBack = () => {
    handleClearSelection();
    onBackToAdmissionExploreMain?.();
  };

  // ── right-panel 모드: 학년 탭 + 전체 내용 인라인 표시 (다이얼로그 없음) ──
  const [openSectionIds, setOpenSectionIds] = useState<Set<string>>(
    () => new Set(sections.slice(0, 1).map((s) => s.id))
  );

  const toggleSection = (id: string) =>
    setOpenSectionIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  if (mode === 'right-panel') {
    // 전체 학년 목록은 첫 번째 섹션에서 추출
    const allGrades = sections[0]?.grades ?? [];
    const activeGradeId = selectedGradeId ?? allGrades[0]?.id ?? 'grade1';

    const GRADE_COLORS: Record<string, { bg: string; border: string; text: string; accent: string }> = {
      grade1: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.4)', text: '#10B981', accent: 'rgba(16,185,129,0.2)' },
      grade2: { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.4)', text: '#3B82F6', accent: 'rgba(59,130,246,0.2)' },
      grade3: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.4)', text: '#F59E0B', accent: 'rgba(245,158,11,0.2)' },
    };
    const gradeColor = GRADE_COLORS[activeGradeId] ?? GRADE_COLORS.grade1;

    return (
      <>
        {/* 헤더 */}
        <div
          className="flex-shrink-0 flex items-center justify-between px-4 py-3"
          style={{
            background: 'linear-gradient(135deg, #1e1b4b, #1a1040)',
            borderBottom: '1px solid rgba(129,140,248,0.35)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-2xl" aria-hidden>{masterDetailLabels.listIntroEmoji}</span>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">{masterDetailLabels.listIntroTitle}</h2>
              <p className="text-sm text-indigo-300/80 mt-0.5">{masterDetailLabels.listIntroDescription}</p>
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:bg-white/15 hover:rotate-90"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(129,140,248,0.4)' }}
              aria-label="닫기"
            >
              <X className="w-3.5 h-3.5 text-white" />
            </button>
          )}
        </div>

        {/* 학년 탭 */}
        <div className="flex-shrink-0 flex gap-2 px-4 pt-3 pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {allGrades.map((grade) => {
            const isActive = grade.id === activeGradeId;
            const gc = GRADE_COLORS[grade.id] ?? GRADE_COLORS.grade1;
            return (
              <button
                key={grade.id}
                type="button"
                onClick={() => setSelectedGradeId(grade.id)}
                className="flex-1 py-2.5 rounded-xl text-base font-bold transition-all"
                style={{
                  background: isActive ? gc.accent : 'rgba(255,255,255,0.04)',
                  border: `2px solid ${isActive ? gc.border : 'rgba(255,255,255,0.1)'}`,
                  color: isActive ? gc.text : 'rgba(255,255,255,0.5)',
                  boxShadow: isActive ? `0 0 12px ${gc.text}40` : undefined,
                }}
              >
                {grade.label}
              </button>
            );
          })}
        </div>

        {/* 학년별 전체 내용 인라인 */}
        <div key={activeGradeId} className="panel-pop-stagger p-4 space-y-4">
          {sections.map((section) => {
            const grade = section.grades.find((g) => g.id === activeGradeId);
            if (!grade) return null;
            return (
              <div
                key={section.id}
                className="rounded-2xl overflow-hidden"
                style={{ border: `1px solid ${gradeColor.border}`, background: gradeColor.bg }}
              >
                {/* 섹션 헤더 (아코디언 토글) */}
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="w-full px-4 py-3 flex items-center gap-2 text-left transition-opacity hover:opacity-90 active:opacity-75"
                  style={{
                    background: gradeColor.accent,
                    borderBottom: openSectionIds.has(section.id) ? `1px solid ${gradeColor.border}` : 'none',
                  }}
                  aria-expanded={openSectionIds.has(section.id)}
                >
                  <span className="text-2xl shrink-0" aria-hidden>{section.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-white">{section.label}</h3>
                    <p className="text-sm mt-1 leading-relaxed" style={{ color: gradeColor.text }}><HL text={section.summary} /></p>
                  </div>
                  <ChevronDown
                    className="shrink-0 w-5 h-5 transition-transform duration-200"
                    style={{
                      color: gradeColor.text,
                      transform: openSectionIds.has(section.id) ? 'rotate(0deg)' : 'rotate(-90deg)',
                    }}
                  />
                </button>

                {openSectionIds.has(section.id) && (
                  <div className="p-4 space-y-3">
                    {/* 학년 목표 */}
                    <div
                      className="rounded-xl px-3 py-3"
                      style={{ background: `${gradeColor.accent}`, border: `1px solid ${gradeColor.border}` }}
                    >
                      <p className="text-sm font-bold mb-2" style={{ color: gradeColor.text }}>
                        🎯 {grade.label} 핵심 목표
                      </p>
                      <p className="text-sm text-white/90 leading-relaxed"><HL text={grade.objective} /></p>
                    </div>

                    {/* 액션 카드 */}
                    <div className="space-y-2.5">
                      {grade.cards.map((card, ci) => (
                        <div
                          key={ci}
                          className="rounded-xl p-3.5"
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' }}
                        >
                          <div className="flex items-start gap-2.5 mb-2.5">
                            <span
                              className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold mt-0.5"
                              style={{ background: gradeColor.accent, color: gradeColor.text, border: `1.5px solid ${gradeColor.border}` }}
                            >
                              {ci + 1}
                            </span>
                            <div>
                              <h4 className="text-base font-bold text-white leading-tight"><HL text={card.title} /></h4>
                              <p className="text-sm text-white/65 mt-1.5 leading-relaxed"><HL text={card.description} /></p>
                            </div>
                          </div>
                          <ul className="space-y-2 ml-9">
                            {card.actionSteps.map((step, si) => (
                              <li key={si} className="flex items-start gap-2 text-sm text-white/80 leading-relaxed">
                                <span className="flex-shrink-0 font-bold mt-0.5" style={{ color: gradeColor.text }}>✓</span>
                                <span><HL text={step} /></span>
                              </li>
                            ))}
                          </ul>
                          <p className="text-sm mt-3 ml-9 font-medium" style={{ color: `${gradeColor.text}cc` }}>{card.recommendedTiming}</p>
                        </div>
                      ))}
                    </div>

                    {/* 실전 예시 */}
                    {grade.practicalExamples.length > 0 && (
                      <div
                        className="rounded-xl p-3.5"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                      >
                        <p className="text-sm font-bold mb-2.5 text-white/60">💡 이렇게 해봐!</p>
                        <ul className="space-y-2">
                          {grade.practicalExamples.map((ex, ei) => (
                            <li key={ei} className="text-sm text-white/70 leading-relaxed">
                              <HL text={ex} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 체크리스트 */}
                    {grade.detailChecklist.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-sm font-bold text-white/60 mb-2">✅ 나 잘 하고 있나?</p>
                        {grade.detailChecklist.map((item, di) => (
                          <div key={di} className="flex items-start gap-2">
                            <span className="flex-shrink-0 text-base mt-0.5" style={{ color: gradeColor.text }}>□</span>
                            <p className="text-sm text-white/70 leading-relaxed"><HL text={item} /></p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </>
    );
  }

  // ── standalone 모드: 기존 TwoColumnPanelLayout ──
  return (
    <TwoColumnPanelLayout
      hasSelection={hasSelection}
      onClearSelection={handleClearSelection}
      emptyPlaceholderText={masterDetailLabels.emptyDetailTitle}
      emptyPlaceholderSubText={masterDetailLabels.emptyDetailSubText}
      listSlot={
        <div
          className={EXPLORE_PAGE_LAYOUT_CLASS.starGridListPanel}
          style={EXPLORE_PAGE_LAYOUT_CLASS.starGridListPanelStyle}
        >
          <div className="space-y-3">
            <AdmissionSubscreenBackToMainButton
              label={masterDetailLabels.backToMainLabel}
              ariaLabel={masterDetailLabels.backToMainAriaLabel}
              onBack={handleBack}
            />
            <StrategyHubListIntroBlock
              emoji={masterDetailLabels.listIntroEmoji}
              title={masterDetailLabels.listIntroTitle}
              description={masterDetailLabels.listIntroDescription}
            />

            <div className="space-y-2">
              {sections.map((section) => {
                const isSelected = selectedSectionId === section.id;
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => handleSelectSection(section.id)}
                    className="w-full text-left rounded-xl p-3 transition-all hover:scale-[1.01] active:scale-[0.99]"
                    style={{
                      background: isSelected
                        ? 'linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(139,92,246,0.2) 100%)'
                        : 'rgba(255,255,255,0.04)',
                      border: `2px solid ${isSelected ? 'rgba(129,140,248,0.7)' : 'rgba(148,163,184,0.25)'}`,
                      boxShadow: isSelected ? '0 4px 12px rgba(99,102,241,0.3)' : undefined,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xl leading-none"
                        style={{
                          background: 'rgba(99,102,241,0.2)',
                          border: '1px solid rgba(129,140,248,0.4)',
                        }}
                        aria-hidden
                      >
                        {section.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-white mb-0.5">{section.label}</h4>
                        <p className="text-xs text-white/60 line-clamp-2">{section.summary}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      }
      detailSlot={
        hasSelection && selectedSection && selectedGrade ? (
          <TopStrategyHubDetailDialog
            variant="inline"
            sections={sections}
            initialSectionId={selectedSection.id}
            initialGradeId={selectedGrade.id}
            onClose={handleClearSelection}
          />
        ) : null
      }
    />
  );
}
