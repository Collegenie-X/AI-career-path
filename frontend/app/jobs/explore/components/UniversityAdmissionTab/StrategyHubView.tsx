'use client';

import { useState } from 'react';
import { TwoColumnPanelLayout } from '@/components/TwoColumnPanelLayout';
import { EXPLORE_PAGE_LAYOUT_CLASS } from '../../config';
import { TopStrategyHubDetailDialog } from './TopStrategyHubDetailDialog';
import type { StrategyHubSection } from './TopStrategyHubTypes';

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
  readonly onBackToAdmissionExploreMain: () => void;
  readonly masterDetailLabels: StrategyHubMasterDetailLabels;
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
    onBackToAdmissionExploreMain();
  };

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
