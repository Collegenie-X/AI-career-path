'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  GitBranch,
  ChevronDown,
  Info,
  Maximize2,
  Rocket,
  Target,
  Trophy,
  X,
  XCircle,
} from 'lucide-react';

import { HighlightText } from './HighlightText';

/** 뱃지 색상 톤 — gov(정부사업) / money(재정·등록금) / ai(AI 트랙) / job(취업·계약학과) / startup(창업) / new(신설·개편) */
export type BadgeTone = 'gov' | 'money' | 'ai' | 'job' | 'startup' | 'new';

const BADGE_TONE_STYLE: Record<BadgeTone, { bg: string; border: string; color: string }> = {
  gov: { bg: 'rgba(59,130,246,0.18)', border: 'rgba(96,165,250,0.55)', color: '#93C5FD' },
  money: { bg: 'rgba(16,185,129,0.18)', border: 'rgba(52,211,153,0.55)', color: '#6EE7B7' },
  ai: { bg: 'rgba(167,139,250,0.20)', border: 'rgba(167,139,250,0.6)', color: '#C4B5FD' },
  job: { bg: 'rgba(249,115,22,0.18)', border: 'rgba(251,146,60,0.55)', color: '#FDBA74' },
  startup: { bg: 'rgba(236,72,153,0.18)', border: 'rgba(244,114,182,0.55)', color: '#F9A8D4' },
  new: { bg: 'rgba(234,179,8,0.18)', border: 'rgba(250,204,21,0.55)', color: '#FDE68A' },
};

/** 학교 강조 뱃지 — 목록 카드와 상세 헤더에서 같은 모양으로 쓴다 */
export function InstitutionBadges({
  badges,
  size = 'md',
}: {
  readonly badges?: ReadonlyArray<{ label: string; tone?: BadgeTone }>;
  readonly size?: 'sm' | 'md';
}) {
  if (!badges || badges.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {badges.map((b) => {
        const tone = BADGE_TONE_STYLE[b.tone ?? 'gov'];
        return (
          <span
            key={b.label}
            className={`rounded-md font-bold leading-none whitespace-nowrap ${
              size === 'sm' ? 'text-[10px] px-1.5 py-[3px]' : 'text-[11px] px-2 py-1'
            }`}
            style={{ background: tone.bg, border: `1px solid ${tone.border}`, color: tone.color }}
          >
            {b.label}
          </span>
        );
      })}
    </div>
  );
}

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
  /** 학교 강조 뱃지 — 정부사업 선정·계약학과·창업거점 등 한눈에 보여줄 핵심 이력 */
  badges?: Array<{ label: string; tone?: BadgeTone }>;
  /** 소재지 — 대학은 4년을 실제로 다녀야 하므로 위치·캠퍼스 분리 여부가 중요하다 */
  location?: {
    sido: string;
    city: string;
    commuteNote: string;
    /** false면 캠퍼스가 2곳 이상이라 학과별 소재지 확인이 필요하다 */
    singleCampus: boolean;
  };
  pros: string[];
  cons: string[];
  successExamples?: Array<{
    profile: string;
    timeline: string;
    keyFactors: string[];
  }>;
  /** 생애주기 커리어 트리 — AI 시대의 학교생활 전략을 단계별로 예측 가능하게 편다 */
  lifecyclePath?: {
    headline: string;
    summary: string;
    stages: Array<{
      id: string;
      period: string;
      age: string;
      title: string;
      focus: string;
      actions: string[];
      aiRole: string;
      output: string;
      checkpoint: string;
      branches?: Array<{ label: string; result: string }>;
    }>;
  };
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
  readonly variant?: 'inline' | 'dialog';
  readonly onOpenDetailDialog?: () => void;
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

/** 개발자·혁신 교육기관 상세 — 마스터-디테일 오른쪽 패널용 (모달 + 다이얼로그) */
export function DevEducationInstitutionDetailPanel({
  institution,
  onClose,
  variant = 'inline',
  onOpenDetailDialog,
}: DevEducationInstitutionDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'lifecycle' | 'success' | 'strategy' | 'career'>('info');
  /* 데이터가 없는 탭은 아예 노출하지 않는다 ("준비 중" 빈 화면을 보여주지 않기 위함) */
  const hasSuccess = (institution.successExamples?.length ?? 0) > 0;
  const hasStrategy = Object.keys(institution.gradePreparationStrategy ?? {}).length > 0;
  const hasLifecycle = (institution.lifecyclePath?.stages.length ?? 0) > 0;
  const tabs = [
    { id: 'info' as const, label: '정보', icon: Info },
    ...(hasLifecycle ? [{ id: 'lifecycle' as const, label: '생애설계', icon: GitBranch }] : []),
    ...(hasSuccess ? [{ id: 'success' as const, label: '합격예시', icon: Trophy }] : []),
    ...(hasStrategy ? [{ id: 'strategy' as const, label: '준비전략', icon: Target }] : []),
    { id: 'career' as const, label: '진로', icon: Rocket },
  ];
  const [expandedSuccess, setExpandedSuccess] = useState<number | null>(null);
  const [expandedStrategy, setExpandedStrategy] = useState<string | null>(null);
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (variant !== 'dialog') return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [variant, onClose]);

  useEffect(() => {
    if (
      (activeTab === 'success' && !hasSuccess) ||
      (activeTab === 'strategy' && !hasStrategy) ||
      (activeTab === 'lifecycle' && !hasLifecycle)
    ) {
      setActiveTab('info');
    }
  }, [activeTab, hasSuccess, hasStrategy, hasLifecycle]);

  if (!mounted) return null;

  const panelInner = (
    <div
      className={
        variant === 'dialog'
          ? 'w-full max-w-[34rem] md:max-w-[40rem] h-[94dvh] md:max-h-[92vh] overflow-y-auto overflow-x-hidden rounded-2xl'
          : 'w-full min-w-0 max-w-full max-h-[min(78vh,720px)] md:max-h-none overflow-y-auto overflow-x-hidden rounded-2xl'
      }
      style={{
        background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
        border: `2px solid ${institution.color}40`,
        boxShadow: variant === 'dialog' ? '0 12px 56px rgba(15,23,42,0.45)' : undefined,
      }}
      onClick={(e) => variant === 'dialog' ? e.stopPropagation() : undefined}
    >
      <div
        className="sticky top-0 z-10 p-3 sm:p-4"
        style={{
          background: '#0f172a',
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
            <div className="flex items-start justify-between gap-2 mb-1">
              <h2 className="text-base sm:text-lg font-bold text-white flex-1 min-w-0 break-words">{institution.name}</h2>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {variant === 'inline' && onOpenDetailDialog && (
                  <button
                    type="button"
                    onClick={onOpenDetailDialog}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                    style={{ background: institution.color + '25', border: `1px solid ${institution.color}55` }}
                    title="자세히 보기"
                    aria-label="자세히 보기"
                  >
                    <Maximize2 className="w-3.5 h-3.5" style={{ color: institution.color }} />
                  </button>
                )}
                {variant === 'dialog' && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-white/15 hover:rotate-90"
                    style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
                    aria-label="닫기"
                  >
                    <X className="w-3.5 h-3.5 text-white" />
                  </button>
                )}
              </div>
            </div>
            {institution.fullName && <p className="text-xs text-white/60 mb-1">{institution.fullName}</p>}
            <p className="text-xs text-white/70">{institution.organizer}</p>
          </div>
        </div>

        {institution.badges && institution.badges.length > 0 && (
          <div className="mb-3">
            <InstitutionBadges badges={institution.badges} />
          </div>
        )}

        <div
          className="grid gap-1.5 sm:gap-2"
          style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
        >
          {tabs.map((tab) => {
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
                <span className="text-xs">{tab.label}</span>
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
                {institution.location && (
                  <>
                    <InstitutionInfoRow
                      label="소재지"
                      value={`${institution.location.city}${
                        institution.location.singleCampus ? '' : ' ⚠ 캠퍼스 2곳 이상'
                      }`}
                    />
                    <InstitutionInfoRow label="통학 정보" value={institution.location.commuteNote} />
                  </>
                )}
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
                    <span><HighlightText>{feature}</HighlightText></span>
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
                    <span><HighlightText>{item}</HighlightText></span>
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
                      ✓ <HighlightText>{pro}</HighlightText>
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
                      • <HighlightText>{con}</HighlightText>
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}


        {activeTab === 'lifecycle' && hasLifecycle && institution.lifecyclePath && (
          <div className="space-y-3">
            <div
              className="rounded-lg p-3"
              style={{
                background: 'linear-gradient(135deg, rgba(34,211,238,0.2) 0%, rgba(167,139,250,0.2) 100%)',
                border: '1px solid rgba(34,211,238,0.35)',
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <GitBranch className="w-4 h-4 text-cyan-300" />
                <h4 className="text-sm font-bold text-white">
                  <HighlightText>{institution.lifecyclePath.headline}</HighlightText>
                </h4>
              </div>
              <p className="text-xs text-white/75 leading-relaxed">
                <HighlightText>{institution.lifecyclePath.summary}</HighlightText>
              </p>
            </div>

            {/* 생애주기 트리 — 왼쪽 세로선 + 단계 노드 + 분기 가지 */}
            <div className="relative pl-5">
              <span
                className="absolute left-[7px] top-2 bottom-2 w-px"
                style={{ background: `linear-gradient(180deg, ${institution.color}, ${institution.color}20)` }}
                aria-hidden
              />
              <div className="space-y-3">
                {institution.lifecyclePath.stages.map((stage, index) => {
                  /* 1번째 단계는 기본으로 펼친다 */
                  const isOpen = expandedStage === stage.id || (expandedStage === null && index === 0);
                  return (
                    <div key={stage.id} className="relative">
                      <span
                        className="absolute -left-5 top-3.5 w-[15px] h-[15px] rounded-full flex items-center justify-center text-[9px] font-black text-slate-900"
                        style={{ background: institution.color, boxShadow: `0 0 0 3px ${institution.color}30` }}
                        aria-hidden
                      >
                        {index + 1}
                      </span>
                      <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${institution.color}40` }}>
                        <button
                          type="button"
                          onClick={() => setExpandedStage(isOpen ? '' : stage.id)}
                          className="w-full flex items-center justify-between gap-2 p-3 text-left"
                          style={{ background: institution.bgColor }}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                              <span
                                className="text-[10px] font-bold px-1.5 py-[3px] rounded-md"
                                style={{ background: `${institution.color}30`, color: 'white' }}
                              >
                                {stage.period}
                              </span>
                              <span className="text-[10px] text-white/50">{stage.age}</span>
                            </div>
                            <p className="text-xs font-bold text-white">
                              <HighlightText>{stage.title}</HighlightText>
                            </p>
                            <p className="text-xs text-white/75 mt-0.5">
                              <HighlightText>{stage.focus}</HighlightText>
                            </p>
                          </div>
                          <ChevronDown
                            className={`w-4 h-4 text-white/60 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                          />
                        </button>

                        {isOpen && (
                          <div className="p-3 space-y-2.5" style={{ background: 'rgba(15,23,42,0.5)' }}>
                            <div>
                              <p className="text-xs font-bold mb-1.5" style={{ color: institution.color }}>
                                이 시기에 하는 일
                              </p>
                              <div className="space-y-1">
                                {stage.actions.map((action, idx) => (
                                  <div key={idx} className="flex items-start gap-2 text-xs text-white/85">
                                    <span
                                      className="inline-block w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                                      style={{ background: institution.color }}
                                    />
                                    <span><HighlightText>{action}</HighlightText></span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="rounded-lg p-2.5 bg-violet-500/10 border border-violet-400/30">
                              <p className="text-[11px] font-bold text-violet-300 mb-1">🤖 AI를 이렇게 쓴다</p>
                              <p className="text-xs text-white/85 leading-relaxed">
                                <HighlightText>{stage.aiRole}</HighlightText>
                              </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div className="rounded-lg p-2.5 bg-emerald-500/10 border border-emerald-400/30">
                                <p className="text-[11px] font-bold text-emerald-300 mb-1">📦 남는 결과물</p>
                                <p className="text-xs text-white/85 leading-relaxed">
                                  <HighlightText>{stage.output}</HighlightText>
                                </p>
                              </div>
                              <div className="rounded-lg p-2.5 bg-amber-500/10 border border-amber-400/30">
                                <p className="text-[11px] font-bold text-amber-300 mb-1">🚦 다음 단계 조건</p>
                                <p className="text-xs text-white/85 leading-relaxed">
                                  <HighlightText>{stage.checkpoint}</HighlightText>
                                </p>
                              </div>
                            </div>

                            {stage.branches && stage.branches.length > 0 && (
                              <div>
                                <p className="text-xs font-bold mb-1.5" style={{ color: institution.color }}>
                                  여기서 갈라지는 길
                                </p>
                                <div className="space-y-1.5 pl-2 border-l" style={{ borderColor: `${institution.color}50` }}>
                                  {stage.branches.map((branch, idx) => (
                                    <div key={idx} className="text-xs">
                                      <span className="font-bold text-white">└ {branch.label}</span>
                                      <span className="text-white/70"> — <HighlightText>{branch.result}</HighlightText></span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'success' && hasSuccess && (
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
                            <p className="text-xs text-white/80"><HighlightText>{example.profile}</HighlightText></p>
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
                              className="text-xs font-bold uppercase tracking-wider mb-1"
                              style={{ color: institution.color }}
                            >
                              타임라인
                            </p>
                            <p className="text-xs text-white/85"><HighlightText>{example.timeline}</HighlightText></p>
                          </div>
                          <div>
                            <p
                              className="text-xs font-bold uppercase tracking-wider mb-1.5"
                              style={{ color: institution.color }}
                            >
                              핵심 성공 요인
                            </p>
                            <div className="space-y-1">
                              {example.keyFactors.map((factor, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-xs text-white/85">
                                  <CheckCircle2 className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: institution.color }} />
                                  <span><HighlightText>{factor}</HighlightText></span>
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

        {activeTab === 'strategy' && hasStrategy && (
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
                            <p className="text-xs text-white/80"><HighlightText>{strategy.goal}</HighlightText></p>
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
                              className="text-xs font-bold uppercase tracking-wider mb-1.5"
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
                                  <span><HighlightText>{action}</HighlightText></span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p
                              className="text-xs font-bold uppercase tracking-wider mb-1.5"
                              style={{ color: institution.color }}
                            >
                              핵심 마일스톤
                            </p>
                            <div className="space-y-1">
                              {strategy.criticalMilestones.map((milestone, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-xs text-white/85">
                                  <CheckCircle2 className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: institution.color }} />
                                  <span><HighlightText>{milestone}</HighlightText></span>
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
                    <span><HighlightText>{path}</HighlightText></span>
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
                    <span><HighlightText>{target}</HighlightText></span>
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
                      ✓ <HighlightText>{pro}</HighlightText>
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
                      • <HighlightText>{con}</HighlightText>
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

  if (variant === 'dialog') {
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

  return panelInner;
}
