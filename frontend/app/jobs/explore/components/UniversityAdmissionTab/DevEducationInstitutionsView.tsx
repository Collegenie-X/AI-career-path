'use client';

import { useState, type ReactNode } from 'react';
import { Building2, ChevronRight, ExternalLink, X } from 'lucide-react';

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
  readonly onBackToAdmissionExploreMain?: () => void;
  readonly masterDetailLabels: DevEducationMasterDetailLabels;
  /** 기본 개발자 트랙 인트로 대신 표시 (예: 혁신 교육기관 안내) */
  readonly listIntroSlotOverride?: ReactNode;
  /** right-panel: 부모 TwoColumnPanel의 detailSlot 안에 컴팩트 목록으로 렌더링 */
  readonly mode?: 'standalone' | 'right-panel';
  readonly onClose?: () => void;
  /** right-panel 헤더 타이틀 (mode=right-panel 시 사용) */
  readonly rightPanelTitle?: string;
  readonly rightPanelSubtitle?: string;
  readonly rightPanelColor?: string;
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
  mode = 'standalone',
  onClose,
  rightPanelTitle = '개발자 교육기관',
  rightPanelSubtitle = '실전 개발자 양성 교육기관을 탐색하세요',
  rightPanelColor = '#8B5CF6',
}: DevEducationInstitutionsViewProps) {
  const [selectedInstitution, setSelectedInstitution] = useState<DevEducationInstitution | null>(null);
  const [showInstitutionDialog, setShowInstitutionDialog] = useState(false);

  // ── right-panel 모드: 컴팩트 목록 + 다이얼로그 직접 오픈 ──
  if (mode === 'right-panel') {
    return (
      <>
        {/* 헤더 */}
        <div
          className="flex-shrink-0 flex items-center justify-between px-4 py-3"
          style={{
            background: `linear-gradient(135deg, ${rightPanelColor}30, ${rightPanelColor}10)`,
            borderBottom: `1px solid ${rightPanelColor}35`,
          }}
        >
          <div className="flex items-center gap-2.5">
            <Building2 className="w-5 h-5 flex-shrink-0" style={{ color: rightPanelColor }} />
            <div>
              <h2 className="text-sm font-bold text-white leading-tight">{rightPanelTitle}</h2>
              <p className="text-[12px] mt-0.5" style={{ color: `${rightPanelColor}cc` }}>{rightPanelSubtitle}</p>
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:bg-white/15 hover:rotate-90"
              style={{ background: 'rgba(255,255,255,0.08)', border: `1px solid ${rightPanelColor}50` }}
              aria-label="닫기"
            >
              <X className="w-3.5 h-3.5 text-white" />
            </button>
          )}
        </div>

        {/* 인트로 오버라이드 */}
        {listIntroSlotOverride && (
          <div className="px-4 pt-3">{listIntroSlotOverride}</div>
        )}

        {/* 기관 목록 */}
        <div className="panel-pop-stagger p-4 pt-3 space-y-2 overflow-y-auto max-h-[68vh]">
          {institutions.map((institution) => (
            <button
              key={institution.id}
              type="button"
              onClick={() => {
                setSelectedInstitution(institution);
                setShowInstitutionDialog(true);
              }}
              className="w-full text-left rounded-xl p-3 transition-all hover:scale-[1.01] active:scale-[0.99] group"
              style={{
                background: institution.bgColor,
                border: `1px solid ${institution.color}40`,
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: `${institution.color}20`, border: `2px solid ${institution.color}` }}
                >
                  {institution.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white mb-0.5">{institution.name}</h4>
                  {institution.fullName && (
                    <p className="text-xs text-white/50 mb-0.5">{institution.fullName}</p>
                  )}
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    <span className="text-[12px] px-2 py-0.5 rounded-full" style={{ background: `${institution.color}30`, color: 'white' }}>
                      {institution.type}
                    </span>
                    <span className="text-[12px] px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                      {institution.duration}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white/70 transition-colors flex-shrink-0 mt-1" />
              </div>
            </button>
          ))}
        </div>

        {/* 기관 다이얼로그 */}
        {showInstitutionDialog && selectedInstitution && (
          <DevEducationInstitutionDetailPanel
            institution={selectedInstitution}
            onClose={() => { setSelectedInstitution(null); setShowInstitutionDialog(false); }}
            variant="dialog"
          />
        )}
      </>
    );
  }

  // ── standalone 모드: 기존 TwoColumnPanelLayout ──
  return (
    <>
    <TwoColumnPanelLayout
      hasSelection={selectedInstitution !== null}
      onClearSelection={() => {
        setSelectedInstitution(null);
        setShowInstitutionDialog(false);
      }}
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
                onBackToAdmissionExploreMain?.();
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
                    onClick={() => {
                      setSelectedInstitution(institution);
                      setShowInstitutionDialog(false);
                    }}
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
            variant="inline"
            onOpenDetailDialog={() => setShowInstitutionDialog(true)}
          />
        ) : null
      }
    />
    {showInstitutionDialog && selectedInstitution && (
      <DevEducationInstitutionDetailPanel
        institution={selectedInstitution}
        onClose={() => setShowInstitutionDialog(false)}
        variant="dialog"
      />
    )}
    </>
  );
}
