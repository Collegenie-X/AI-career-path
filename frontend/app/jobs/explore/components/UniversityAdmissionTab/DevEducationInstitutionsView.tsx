'use client';

import { useState, type ReactNode } from 'react';
import { Building2, ExternalLink } from 'lucide-react';

import { TwoColumnPanelLayout } from '@/components/TwoColumnPanelLayout';

import { EXPLORE_PAGE_LAYOUT_CLASS } from '../../config';
import {
  DevEducationInstitutionDetailPanel,
  type DevEducationInstitution,
} from './DevEducationInstitutionDetailPanel';

export type { DevEducationInstitution };

export type DevEducationMasterDetailLabels = {
  readonly emptyDetailTitle: string;
  readonly emptyDetailSubText: string;
  readonly backToMainLabel: string;
  readonly backToMainAriaLabel: string;
};

type DevEducationInstitutionsViewProps = {
  readonly institutions: DevEducationInstitution[];
  readonly onBackToAdmissionExploreMain: () => void;
  readonly masterDetailLabels: DevEducationMasterDetailLabels;
  /** 기본 개발자 트랙 인트로 대신 표시 (예: 혁신 교육기관 안내) */
  readonly listIntroSlotOverride?: ReactNode;
};

function DevEducationDefaultListIntro() {
  return (
    <div
      className="rounded-xl p-3"
      style={{
        background: 'linear-gradient(135deg, rgba(139,92,246,0.2) 0%, rgba(59,130,246,0.2) 100%)',
        border: '1px solid rgba(139,92,246,0.3)',
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Building2 className="w-5 h-5 text-purple-400" />
        <h3 className="text-sm font-bold text-white">개발자 교육기관</h3>
      </div>
      <p className="text-xs text-white/70">
        대학 졸업 후 또는 대학 대신 선택할 수 있는 실전 개발자 양성 교육기관입니다.
      </p>
    </div>
  );
}

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

export function DevEducationInstitutionsView({
  institutions,
  onBackToAdmissionExploreMain,
  masterDetailLabels,
  listIntroSlotOverride,
}: DevEducationInstitutionsViewProps) {
  const [selectedInstitution, setSelectedInstitution] = useState<DevEducationInstitution | null>(null);

  return (
    <TwoColumnPanelLayout
      hasSelection={selectedInstitution !== null}
      onClearSelection={() => setSelectedInstitution(null)}
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
              onBack={() => {
                setSelectedInstitution(null);
                onBackToAdmissionExploreMain();
              }}
            />
            {listIntroSlotOverride ?? <DevEducationDefaultListIntro />}

            <div className="space-y-2">
              {institutions.map((institution) => {
                const isSelected = selectedInstitution?.id === institution.id;
                return (
                  <button
                    key={institution.id}
                    type="button"
                    onClick={() => setSelectedInstitution(institution)}
                    className="w-full text-left rounded-xl p-3 transition-all hover:scale-[1.01] active:scale-[0.99]"
                    style={{
                      background: institution.bgColor,
                      border: `2px solid ${isSelected ? institution.color : `${institution.color}40`}`,
                      boxShadow: isSelected ? `0 0 0 1px ${institution.color}60` : undefined,
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                        style={{
                          background: institution.color + '20',
                          border: `2px solid ${institution.color}`,
                        }}
                      >
                        {institution.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-white mb-0.5">{institution.name}</h4>
                        {institution.fullName && (
                          <p className="text-xs text-white/60 mb-1">{institution.fullName}</p>
                        )}
                        <p className="text-xs text-white/70 mb-2">{institution.organizer}</p>
                        <div className="flex flex-wrap gap-1.5">
                          <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                              background: institution.color + '30',
                              color: 'white',
                            }}
                          >
                            {institution.type}
                          </span>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                              background: 'rgba(255,255,255,0.1)',
                              color: 'white',
                            }}
                          >
                            {institution.duration}
                          </span>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-white/40 flex-shrink-0 mt-1" aria-hidden />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      }
      detailSlot={
        selectedInstitution ? (
          <DevEducationInstitutionDetailPanel
            institution={selectedInstitution}
            onClose={() => setSelectedInstitution(null)}
          />
        ) : null
      }
    />
  );
}
