'use client';

import { useState, useMemo } from 'react';
import { Briefcase, ChevronDown, Users, Lightbulb, Zap, X, Bot } from 'lucide-react';
import { StarInfoBanner } from './StarInfoBanner';
import { JobCard } from './JobCard';
import { CTABanner } from './CTABanner';
import { AiKingdomOccupationChangeGamePanel } from './AiKingdomOccupationChangeGamePanel';
import { LABELS } from '../config';
import { STAR_PANEL_AI_ERA_INTRO } from '../config/aiEraTransformationLabels';
import { normalizeStarProfile } from '@/data/stars/normalizeProfile';
import { GlossaryText } from '@/components/shared/GlossaryText';
import type { StarData, Job } from '../types';

interface StarDetailPanelProps {
  star: StarData;
  onClose: () => void;
  onOpenJob: (job: Job) => void;
}

/**
 * 아코디언 섹션 컴포넌트 (게임스러운 애니메이션 포함)
 */
function AccordionSection({
  title,
  icon: Icon,
  color,
  children,
  defaultOpen = false,
  hintBadge,
  pulse = false,
}: {
  title: string;
  icon: React.ElementType;
  color: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  /** 닫혀 있을 때 옆에 노출할 미니 안내 뱃지 (예: '탭해서 열기') */
  hintBadge?: string;
  /** 닫혀 있을 때 살짝 깜빡이는 글로우 효과 (호기심 유도) */
  pulse?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className="relative rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        border: `1px solid ${isOpen ? `${color}55` : `${color}22`}`,
        background: isOpen
          ? `linear-gradient(180deg, ${color}10, rgba(255,255,255,0.04))`
          : 'rgba(255,255,255,0.03)',
        boxShadow: isOpen
          ? `0 4px 20px ${color}25`
          : pulse
            ? `0 0 0 1px ${color}33, 0 0 18px ${color}25`
            : 'none',
        animation: !isOpen && pulse ? 'pulse-glow 2.4s ease-in-out infinite' : undefined,
      }}
    >
      <button
        className="w-full flex items-center gap-2.5 px-4 py-3.5 transition-all hover:bg-white/5"
        onClick={() => setIsOpen(prev => !prev)}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-300"
          style={{
            backgroundColor: `${color}25`,
            transform: isOpen ? 'rotate(360deg)' : 'rotate(0deg)',
          }}
        >
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <span className="flex-1 text-left text-base md:text-lg font-bold text-white">{title}</span>
        {!isOpen && hintBadge && (
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full mr-1"
            style={{
              backgroundColor: `${color}20`,
              color,
              border: `1px solid ${color}40`,
            }}
          >
            {hintBadge}
          </span>
        )}
        <div
          className="transition-transform duration-300"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <ChevronDown className="w-4 h-4" style={{ color: isOpen ? color : 'rgba(156,163,175,1)' }} />
        </div>
      </button>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{
          maxHeight: isOpen ? '2000px' : '0px',
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div className="px-4 pb-4 pt-2 border-t border-white/5">
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * 별 트레일 — 섹션을 한 여정처럼 잇는 좌측 점선/별 마커
 */
function JourneyTrail({
  color,
  children,
}: {
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative pl-5">
      {/* 좌측 트레일 라인 (그라데이션) */}
      <div
        className="absolute left-1.5 top-1 bottom-1 w-px"
        aria-hidden
        style={{
          background: `linear-gradient(180deg, ${color}66, ${color}22 60%, transparent)`,
        }}
      />
      <div className="relative space-y-2.5">
        {children}
      </div>
    </div>
  );
}

/**
 * 웹 2-컬럼 레이아웃용 우측 상세 패널
 * career 페이지의 CareerPathDetailPanel 과 동일한 역할
 */
export function StarDetailPanel({
  star,
  onClose,
  onOpenJob,
}: StarDetailPanelProps) {
  const rawProfile = star.starProfile;
  const profile = useMemo(
    () => (rawProfile ? normalizeStarProfile(rawProfile as Parameters<typeof normalizeStarProfile>[0]) : null),
    [rawProfile]
  );

  const displayedJobCount = star.jobs?.length ?? star.jobCount;

  const coreTraitsSection = profile?.sections.find((s) => s.id === 'coreTraits');
  const fitSection = profile?.sections.find((s) => s.id === 'fitPersonality');
  const whySection = profile?.sections.find((s) => s.id === 'whyThisGroup');
  const coreTraits = coreTraitsSection?.type === 'traitGrid' ? coreTraitsSection.items : [];
  const fitItems = fitSection?.type === 'fitList' ? fitSection.fitItems : [];
  const notFitItems = fitSection?.type === 'fitList' ? fitSection.notFitItems : [];
  const commonDNA = whySection?.type === 'reasonWithTags' ? whySection.commonDNA : [];

  const kingdomAiChangePanelData = useMemo(() => {
    if (!star.jobs.some((job) => job.aiTransformation)) return null;
    const jobsWithAI = star.jobs.filter((job) => job.aiTransformation);
    const lowRisk = jobsWithAI.filter((job) => job.aiTransformation?.replacementRisk === 'low').length;
    const mediumRisk = jobsWithAI.filter((job) => job.aiTransformation?.replacementRisk === 'medium').length;
    const highRisk = jobsWithAI.filter((job) => job.aiTransformation?.replacementRisk === 'high').length;
    const allAiTools = Array.from(
      new Set(jobsWithAI.flatMap((job) => job.aiTransformation?.aiTools || []).filter(Boolean))
    ).slice(0, 12);
    const allSurvivalStrategies = Array.from(
      new Set(
        jobsWithAI.flatMap((job) => job.aiTransformation?.survivalStrategy || []).filter(Boolean)
      )
    ).slice(0, 8);
    return {
      lowRiskCount: lowRisk,
      mediumRiskCount: mediumRisk,
      highRiskCount: highRisk,
      allAiTools,
      allSurvivalStrategies,
    };
  }, [star.jobs]);

  return (
    <div
      className="flex flex-col h-full"
      style={{ animation: 'panel-slide-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both' }}
    >
      {/* 패널 헤더 */}
      <div
        className="flex items-center gap-3 px-5 py-4 border-b flex-shrink-0 relative overflow-hidden"
        style={{
          borderColor: `${star.color}30`,
          background: `linear-gradient(135deg, ${star.color}18, rgba(13,13,36,0.6))`,
        }}
      >
        {/* 배경 글로우 */}
        <div
          className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-20 pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${star.color}, transparent)`,
            animation: 'nebula-drift 8s ease-in-out infinite',
          }}
        />
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 relative z-10"
          style={{
            backgroundColor: `${star.color}30`,
            border: `2px solid ${star.color}55`,
            boxShadow: `0 0 16px ${star.color}30`,
            animation: 'icon-float 3s ease-in-out infinite',
          }}
        >
          {star.emoji}
        </div>
        <div className="flex-1 min-w-0 relative z-10">
          <h2 className="text-lg font-bold text-white leading-tight">{star.name}</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {displayedJobCount}{LABELS.star_selected_subtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={LABELS.star_detail_panel_close_aria}
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 relative z-10 transition-colors hover:bg-white/15 active:scale-95 md:hidden"
          style={{
            backgroundColor: 'rgba(255,255,255,0.1)',
            border: `1px solid ${star.color}44`,
            boxShadow: `0 0 14px ${star.color}28`,
          }}
        >
          <X className="w-5 h-5 text-gray-200" strokeWidth={2.25} />
        </button>
      </div>

      {/* 스크롤 본문 */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-5 pt-4 pb-2">
        {/* 기본 정보 */}
        <div
          className="rounded-2xl p-4 mb-4 relative overflow-hidden"
          style={{
            backgroundColor: `${star.color}08`,
            border: `1.5px solid ${star.color}25`,
          }}
        >
          <div className="absolute -right-4 -top-4 text-7xl opacity-10 select-none">{star.emoji}</div>
          <p className="text-sm md:text-base text-gray-300 leading-relaxed relative z-10">
            <GlossaryText>{star.description}</GlossaryText>
          </p>
        </div>

        {/* 별 여정 트레일 — 섹션이 한 여정으로 이어지는 느낌 */}
        {profile && (coreTraits.length > 0 || fitItems.length > 0 || commonDNA.length > 0 || kingdomAiChangePanelData) && (
          <JourneyTrail color={star.color}>
            {/* 핵심 특성 (기본 열림) */}
            {coreTraits.length > 0 && (
              <AccordionSection
                title={LABELS.star_core_traits_title}
                icon={Zap}
                color={star.color}
                defaultOpen
              >
                <div className="grid grid-cols-1 gap-2.5 mt-2">
                  {coreTraits.map((trait, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl p-3.5 flex items-center gap-3.5 transition-all hover:scale-[1.02]"
                      style={{
                        background: `${star.color}10`,
                        border: `1px solid ${star.color}20`,
                      }}
                    >
                      <div
                        className="text-3xl flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${star.color}18` }}
                      >
                        {trait.icon}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="text-sm md:text-base font-bold text-white mb-1">{trait.label}</div>
                        <div className="text-xs md:text-sm text-gray-400 leading-relaxed">{trait.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionSection>
            )}

            {/* 이런 사람에게 딱 (기본 열림) */}
            {fitItems.length > 0 && (
              <AccordionSection
                title={LABELS.star_fit_title}
                icon={Users}
                color={star.color}
                defaultOpen
              >
                <div className="space-y-2 mt-2">
                  {fitItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 text-sm md:text-base text-gray-200 leading-relaxed p-2 rounded-lg transition-all hover:bg-white/5"
                    >
                      <span className="flex-shrink-0">✨</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                {notFitItems.length > 0 && (
                  <>
                    <div className="h-px bg-white/10 my-3" />
                    <div className="text-xs md:text-sm font-bold text-gray-400 mb-2">
                      {LABELS.star_fit_not_recommend_title}
                    </div>
                    <div className="space-y-2">
                      {notFitItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 text-sm md:text-base text-gray-300 leading-relaxed p-2 rounded-lg"
                          style={{ backgroundColor: 'rgba(255,100,100,0.08)' }}
                        >
                          <span className="flex-shrink-0">⚠️</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </AccordionSection>
            )}

            {/* 공통 DNA (기본 닫힘 — 호기심 유도) */}
            {commonDNA.length > 0 && (
              <AccordionSection
                title={LABELS.star_common_dna_label}
                icon={Lightbulb}
                color={star.color}
                defaultOpen={false}
                hintBadge="탭해서 보기"
              >
                <div className="flex flex-wrap gap-2 mt-2">
                  {commonDNA.map((dna, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:scale-105"
                      style={{
                        backgroundColor: `${star.color}20`,
                        color: star.color,
                        border: `1px solid ${star.color}30`,
                      }}
                    >
                      {dna}
                    </div>
                  ))}
                </div>
              </AccordionSection>
            )}

            {/* 🤖 AI가 오면? (기본 닫힘 — 깜빡이는 글로우 + 안내 뱃지로 호기심 유도) */}
            {kingdomAiChangePanelData && (
              <AccordionSection
                title="🤖 AI가 오면 어떻게 될까?"
                icon={Bot}
                color={star.color}
                defaultOpen={false}
                hintBadge="열어보기"
                pulse
              >
                <div className="mt-2 space-y-3">
                  <AiKingdomOccupationChangeGamePanel
                    starName={star.name}
                    starColor={star.color}
                    lowRiskCount={kingdomAiChangePanelData.lowRiskCount}
                    mediumRiskCount={kingdomAiChangePanelData.mediumRiskCount}
                    highRiskCount={kingdomAiChangePanelData.highRiskCount}
                    allAiTools={kingdomAiChangePanelData.allAiTools}
                    allSurvivalStrategies={kingdomAiChangePanelData.allSurvivalStrategies}
                    footerIntroText={STAR_PANEL_AI_ERA_INTRO}
                  />
                </div>
              </AccordionSection>
            )}
          </JourneyTrail>
        )}

        {/* 직업 목록 */}
        <div className="mt-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5" />
            {displayedJobCount}{LABELS.jobs_title}
          </h3>
          <div className="space-y-2 pb-4">
            {star.jobs.map((job, idx) => (
              <div
                key={job.id}
                style={{
                  animation: `slide-up 0.4s ease-out ${idx * 0.08}s both`,
                }}
              >
                <JobCard
                  job={job}
                  color={star.color}
                  onClick={() => onOpenJob(job)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 하단 고정 CTA */}
      <div
        className="flex-shrink-0 px-5 py-3 border-t"
        style={{
          borderColor: 'rgba(255,255,255,0.08)',
          backgroundColor: 'rgba(13,13,36,0.8)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <CTABanner star={star} />
      </div>
    </div>
  );
}
