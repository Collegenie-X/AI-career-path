'use client';

import { useState } from 'react';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Info,
  Rocket,
  Target,
  Trophy,
  XCircle,
} from 'lucide-react';

export type DevEducationInstitution = {
  id: string;
  name: string;
  fullName?: string;
  emoji: string;
  color: string;
  bgColor: string;
  organizer: string;
  type: string;
  duration: string;
  admissionProcess: string;
  features: string[];
  curriculum: string[];
  targetStudents: string[];
  careerPath: string[];
  website: string;
  pros: string[];
  cons: string[];
  successExamples?: Array<{
    profile: string;
    timeline: string;
    keyFactors: string[];
  }>;
  gradePreparationStrategy?: {
    [key: string]: {
      grade: string;
      goal: string;
      monthlyActions: string[];
      criticalMilestones: string[];
    };
  };
};

type DevEducationInstitutionDetailPanelProps = {
  readonly institution: DevEducationInstitution;
  readonly onClose: () => void;
};

function InstitutionInfoRow({ label, value, link }: { label: string; value: string; link?: boolean }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-xs text-white/60 min-w-[60px]">{label}</span>
      {link ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-400 hover:text-blue-300 underline break-all"
        >
          {value}
        </a>
      ) : (
        <span className="text-xs text-white/90">{value}</span>
      )}
    </div>
  );
}

/** 개발자·혁신 교육기관 상세 — 마스터-디테일 오른쪽 패널용 (모달 없음) */
export function DevEducationInstitutionDetailPanel({
  institution,
  onClose,
}: DevEducationInstitutionDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'success' | 'strategy' | 'career'>('info');
  const [expandedSuccess, setExpandedSuccess] = useState<number | null>(null);
  const [expandedStrategy, setExpandedStrategy] = useState<string | null>(null);

  return (
    <div
      className="w-full min-w-0 max-w-full max-h-[min(78vh,720px)] md:max-h-none overflow-y-auto overflow-x-hidden rounded-2xl"
      style={{
        background: 'linear-gradient(135deg, rgba(17,24,39,0.95) 0%, rgba(31,41,55,0.95) 100%)',
        border: `2px solid ${institution.color}40`,
      }}
    >
      <div
        className="sticky top-0 z-10 p-3 sm:p-4"
        style={{
          background: institution.bgColor,
          borderBottom: `1px solid ${institution.color}40`,
        }}
      >
        <div className="flex items-start gap-3 mb-3">
          <div
            className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-2xl sm:text-3xl"
            style={{
              background: institution.color + '20',
              border: `2px solid ${institution.color}`,
            }}
          >
            {institution.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-white mb-1">{institution.name}</h2>
            {institution.fullName && <p className="text-xs text-white/60 mb-1">{institution.fullName}</p>}
            <p className="text-xs text-white/70">{institution.organizer}</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
          {(
            [
              { id: 'info' as const, label: '정보', icon: Info },
              { id: 'success' as const, label: '합격예시', icon: Trophy },
              { id: 'strategy' as const, label: '준비전략', icon: Target },
              { id: 'career' as const, label: '진로', icon: Rocket },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className="flex flex-col items-center justify-center gap-1 px-1.5 py-2 rounded-lg text-xs font-medium transition-all hover:scale-105 active:scale-95"
                style={{
                  background: activeTab === tab.id ? institution.color + '30' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${activeTab === tab.id ? institution.color : 'rgba(255,255,255,0.1)'}`,
                  color: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.6)',
                }}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px]">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-3 sm:p-4 space-y-3">
        {activeTab === 'info' && (
          <>
            <div className="rounded-lg p-3 bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4" style={{ color: institution.color }} />
                <h4 className="text-sm font-bold text-white">기본 정보</h4>
              </div>
              <div className="space-y-2">
                <InstitutionInfoRow label="유형" value={institution.type} />
                <InstitutionInfoRow label="교육 기간" value={institution.duration} />
                <InstitutionInfoRow label="선발 과정" value={institution.admissionProcess} />
                <InstitutionInfoRow label="웹사이트" value={institution.website} link />
              </div>
            </div>

            <div className="rounded-lg p-3 bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Rocket className="w-4 h-4" style={{ color: institution.color }} />
                <h4 className="text-sm font-bold text-white">주요 특징</h4>
              </div>
              <div className="space-y-1.5">
                {institution.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2 text-xs text-white/80">
                    <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: institution.color }} />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg p-3 bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4" style={{ color: institution.color }} />
                <h4 className="text-sm font-bold text-white">커리큘럼</h4>
              </div>
              <div className="space-y-1.5">
                {institution.curriculum.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 text-xs text-white/80 p-2 rounded-lg"
                    style={{ background: institution.bgColor }}
                  >
                    <span style={{ color: institution.color }}>→</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="rounded-lg p-3 bg-green-500/10 border border-green-500/30">
                <h4 className="text-xs font-bold text-green-400 mb-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  장점
                </h4>
                <div className="space-y-1">
                  {institution.pros.map((pro, index) => (
                    <p key={index} className="text-xs text-white/80">
                      ✓ {pro}
                    </p>
                  ))}
                </div>
              </div>
              <div className="rounded-lg p-3 bg-red-500/10 border border-red-500/30">
                <h4 className="text-xs font-bold text-red-400 mb-2 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  단점
                </h4>
                <div className="space-y-1">
                  {institution.cons.map((con, index) => (
                    <p key={index} className="text-xs text-white/80">
                      • {con}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'success' && (
          <div className="space-y-3">
            {institution.successExamples && institution.successExamples.length > 0 ? (
              <>
                <div
                  className="rounded-lg p-3"
                  style={{
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(5,150,105,0.2) 100%)',
                    border: '1px solid rgba(16,185,129,0.35)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Trophy className="w-4 h-4 text-emerald-300" />
                    <h4 className="text-sm font-bold text-white">실전 합격 사례</h4>
                  </div>
                  <p className="text-xs text-white/70">실제 합격생들의 구체적인 준비 과정과 핵심 전략</p>
                </div>

                {institution.successExamples.map((example, index) => {
                  const isOpen = expandedSuccess === index;
                  return (
                    <div
                      key={index}
                      className="rounded-lg overflow-hidden"
                      style={{ border: `1px solid ${institution.color}40` }}
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedSuccess(isOpen ? null : index)}
                        className="w-full flex items-center justify-between gap-2 p-3 text-left transition-all"
                        style={{ background: institution.bgColor }}
                      >
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          <Trophy className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: institution.color }} />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-white">사례 #{index + 1}</p>
                            <p className="text-xs text-white/80">{example.profile}</p>
                          </div>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 text-white/60 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                        />
                      </button>

                      {isOpen && (
                        <div className="p-3 space-y-2" style={{ background: 'rgba(15,23,42,0.5)' }}>
                          <div>
                            <p
                              className="text-[10px] font-bold uppercase tracking-wider mb-1"
                              style={{ color: institution.color }}
                            >
                              타임라인
                            </p>
                            <p className="text-xs text-white/85">{example.timeline}</p>
                          </div>
                          <div>
                            <p
                              className="text-[10px] font-bold uppercase tracking-wider mb-1.5"
                              style={{ color: institution.color }}
                            >
                              핵심 성공 요인
                            </p>
                            <div className="space-y-1">
                              {example.keyFactors.map((factor, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-xs text-white/85">
                                  <CheckCircle2 className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: institution.color }} />
                                  <span>{factor}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            ) : (
              <div className="rounded-lg p-4 bg-white/5 border border-white/10 text-center">
                <p className="text-sm text-white/60">합격 사례 준비 중입니다.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'strategy' && (
          <div className="space-y-3">
            {institution.gradePreparationStrategy ? (
              <>
                <div
                  className="rounded-lg p-3"
                  style={{
                    background: 'linear-gradient(135deg, rgba(59,130,246,0.2) 0%, rgba(147,51,234,0.2) 100%)',
                    border: '1px solid rgba(59,130,246,0.35)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-blue-300" />
                    <h4 className="text-sm font-bold text-white">학년별 준비 전략</h4>
                  </div>
                  <p className="text-xs text-white/70">단계별 구체적 액션 플랜과 마일스톤</p>
                </div>

                {Object.entries(institution.gradePreparationStrategy).map(([key, strategy]) => {
                  const isOpen = expandedStrategy === key;
                  return (
                    <div
                      key={key}
                      className="rounded-lg overflow-hidden"
                      style={{ border: `1px solid ${institution.color}40` }}
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedStrategy(isOpen ? null : key)}
                        className="w-full flex items-center justify-between gap-2 p-3 text-left transition-all"
                        style={{ background: institution.bgColor }}
                      >
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: institution.color }} />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-white">{strategy.grade}</p>
                            <p className="text-xs text-white/80">{strategy.goal}</p>
                          </div>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 text-white/60 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                        />
                      </button>

                      {isOpen && (
                        <div className="p-3 space-y-2" style={{ background: 'rgba(15,23,42,0.5)' }}>
                          <div>
                            <p
                              className="text-[10px] font-bold uppercase tracking-wider mb-1.5"
                              style={{ color: institution.color }}
                            >
                              매월 실행 액션
                            </p>
                            <div className="space-y-1">
                              {strategy.monthlyActions.map((action, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-xs text-white/85">
                                  <span
                                    className="inline-block w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                                    style={{ background: institution.color }}
                                  />
                                  <span>{action}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p
                              className="text-[10px] font-bold uppercase tracking-wider mb-1.5"
                              style={{ color: institution.color }}
                            >
                              핵심 마일스톤
                            </p>
                            <div className="space-y-1">
                              {strategy.criticalMilestones.map((milestone, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-xs text-white/85">
                                  <CheckCircle2 className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: institution.color }} />
                                  <span>{milestone}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            ) : (
              <div className="rounded-lg p-4 bg-white/5 border border-white/10 text-center">
                <p className="text-sm text-white/60">준비 전략 준비 중입니다.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'career' && (
          <div className="space-y-3">
            <div className="rounded-lg p-3 bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Rocket className="w-4 h-4" style={{ color: institution.color }} />
                <h4 className="text-sm font-bold text-white">진로 경로</h4>
              </div>
              <div className="space-y-1.5">
                {institution.careerPath.map((path, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 text-xs text-white/80 p-2 rounded-lg"
                    style={{ background: institution.bgColor }}
                  >
                    <span style={{ color: institution.color }}>→</span>
                    <span>{path}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg p-3 bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4" style={{ color: institution.color }} />
                <h4 className="text-sm font-bold text-white">지원 대상</h4>
              </div>
              <div className="space-y-1.5">
                {institution.targetStudents.map((target, index) => (
                  <div key={index} className="flex items-start gap-2 text-xs text-white/80">
                    <span style={{ color: institution.color }}>✓</span>
                    <span>{target}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="rounded-lg p-3 bg-green-500/10 border border-green-500/30">
                <h4 className="text-xs font-bold text-green-400 mb-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  장점
                </h4>
                <div className="space-y-1">
                  {institution.pros.map((pro, index) => (
                    <p key={index} className="text-xs text-white/80">
                      ✓ {pro}
                    </p>
                  ))}
                </div>
              </div>
              <div className="rounded-lg p-3 bg-red-500/10 border border-red-500/30">
                <h4 className="text-xs font-bold text-red-400 mb-2 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  단점
                </h4>
                <div className="space-y-1">
                  {institution.cons.map((con, index) => (
                    <p key={index} className="text-xs text-white/80">
                      • {con}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
