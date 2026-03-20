'use client';

import { useState } from 'react';
import { Briefcase } from 'lucide-react';

import { TwoColumnPanelLayout } from '@/components/TwoColumnPanelLayout';

import { EXPLORE_PAGE_LAYOUT_CLASS } from '../../config';
import { CareerDetailPanel, type CareerMajorCareer } from './CareerDetailPanel';
import type { DevEducationMasterDetailLabels } from './DevEducationInstitutionsView';

type CareerMajorConnectionViewProps = {
  readonly careers: CareerMajorCareer[];
  readonly onBackToAdmissionExploreMain: () => void;
  readonly masterDetailLabels: DevEducationMasterDetailLabels;
};

function CareerListBackToMainButton({
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

export function CareerMajorConnectionView({
  careers,
  onBackToAdmissionExploreMain,
  masterDetailLabels,
}: CareerMajorConnectionViewProps) {
  const [selectedCareer, setSelectedCareer] = useState<CareerMajorCareer | null>(null);
  const [selectedKingdom, setSelectedKingdom] = useState<string | null>(null);

  const kingdoms = Array.from(new Set(careers.map((c) => c.kingdom)));
  const filteredCareers = selectedKingdom ? careers.filter((c) => c.kingdom === selectedKingdom) : careers;

  return (
    <TwoColumnPanelLayout
      hasSelection={selectedCareer !== null}
      onClearSelection={() => setSelectedCareer(null)}
      emptyPlaceholderText={masterDetailLabels.emptyDetailTitle}
      emptyPlaceholderSubText={masterDetailLabels.emptyDetailSubText}
      listSlot={
        <div
          className={EXPLORE_PAGE_LAYOUT_CLASS.starGridListPanel}
          style={EXPLORE_PAGE_LAYOUT_CLASS.starGridListPanelStyle}
        >
          <div className="space-y-3">
            <CareerListBackToMainButton
              label={masterDetailLabels.backToMainLabel}
              ariaLabel={masterDetailLabels.backToMainAriaLabel}
              onBack={() => {
                setSelectedCareer(null);
                onBackToAdmissionExploreMain();
              }}
            />

            <div
              className="rounded-xl p-3"
              style={{
                background: 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(5,150,105,0.2) 100%)',
                border: '1px solid rgba(16,185,129,0.3)',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">직업(과)별 대입 준비 전략</h3>
              </div>
              <p className="text-xs text-white/70">
                32개 직업별로 어떤 학과에 진학해야 하고, 세특에 무엇을 써야 하는지 알려드립니다.
              </p>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button
                type="button"
                onClick={() => setSelectedKingdom(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all"
                style={{
                  background: selectedKingdom === null ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${selectedKingdom === null ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.1)'}`,
                  color: selectedKingdom === null ? 'white' : 'rgba(255,255,255,0.6)',
                }}
              >
                전체
              </button>
              {kingdoms.map((kingdom) => (
                <button
                  key={kingdom}
                  type="button"
                  onClick={() => setSelectedKingdom(kingdom)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all"
                  style={{
                    background: selectedKingdom === kingdom ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${selectedKingdom === kingdom ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.1)'}`,
                    color: selectedKingdom === kingdom ? 'white' : 'rgba(255,255,255,0.6)',
                  }}
                >
                  {kingdom}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {filteredCareers.map((career) => {
                const isSelected = selectedCareer?.id === career.id;
                return (
                  <button
                    key={career.id}
                    type="button"
                    onClick={() => setSelectedCareer(career)}
                    className={`w-full text-left rounded-xl p-3 transition-all hover:scale-[1.01] active:scale-[0.99] bg-white/5 border-2 ${
                      isSelected
                        ? 'border-emerald-500/50 shadow-[0_0_0_1px_rgba(16,185,129,0.35)]'
                        : 'border-white/10 hover:border-emerald-500/30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform hover:scale-110"
                        style={{
                          background: 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(5,150,105,0.3) 100%)',
                          border: '2px solid rgba(16,185,129,0.4)',
                          boxShadow: '0 0 20px rgba(16,185,129,0.2)',
                        }}
                      >
                        {career.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h4 className="text-sm font-bold text-white">{career.name}</h4>
                          <span className="text-[10px] text-white/50">{career.kingdom}</span>
                          {career.successStories && career.successStories.length > 0 && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-yellow-400/20 text-yellow-300 border border-yellow-400/30">
                              실전사례
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-emerald-400 mb-1.5">{career.targetMajor}</p>
                        <div className="flex flex-wrap gap-1.5">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {career.admissionType}
                          </span>
                          {career.keySubjects.slice(0, 2).map((subject, idx) => (
                            <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                              {subject}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex-shrink-0 flex flex-col items-center gap-1">
                        <span className="text-white/40" aria-hidden>
                          →
                        </span>
                        {career.universityDetails && career.universityDetails.length > 0 && (
                          <span className="text-[9px] text-blue-400">{career.universityDetails.length}개교</span>
                        )}
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
        selectedCareer ? (
          <CareerDetailPanel career={selectedCareer} onClose={() => setSelectedCareer(null)} />
        ) : null
      }
    />
  );
}
