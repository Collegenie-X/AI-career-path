'use client';

import { useState, useMemo } from 'react';
import { Briefcase, X, ChevronDown, ChevronUp, Star as StarIcon, Users, Lightbulb, Zap } from 'lucide-react';
import { StarInfoBanner } from './StarInfoBanner';
import { JobCard } from './JobCard';
import { CTABanner } from './CTABanner';
import { LABELS } from '../config';
import { normalizeStarProfile } from '@/data/stars/normalizeProfile';
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
}: {
  title: string;
  icon: React.ElementType;
  color: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        border: `1px solid ${color}22`,
        background: isOpen ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)',
        boxShadow: isOpen ? `0 4px 20px ${color}20` : 'none',
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
        <span className="flex-1 text-left text-sm font-bold text-white">{title}</span>
        <div
          className="transition-transform duration-300"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <ChevronDown className="w-4 h-4 text-gray-500" />
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

  const coreTraitsSection = profile?.sections.find((s) => s.id === 'coreTraits');
  const fitSection = profile?.sections.find((s) => s.id === 'fitPersonality');
  const whySection = profile?.sections.find((s) => s.id === 'whyThisGroup');
  const coreTraits = coreTraitsSection?.type === 'traitGrid' ? coreTraitsSection.items : [];
  const fitItems = fitSection?.type === 'fitList' ? fitSection.fitItems : [];
  const notFitItems = fitSection?.type === 'fitList' ? fitSection.notFitItems : [];
  const commonDNA = whySection?.type === 'reasonWithTags' ? whySection.commonDNA : [];
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
            {star.jobCount}{LABELS.star_selected_subtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all hover:bg-white/15 hover:rotate-90 active:bg-white/25 relative z-10"
          style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
          aria-label="닫기"
        >
          <X className="w-4 h-4 text-white/70" />
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
          <p className="text-xs text-gray-400 leading-relaxed relative z-10">
            {star.description}
          </p>
        </div>

        {/* 아코디언: 핵심 특성 */}
        {profile && coreTraits.length > 0 && (
          <div className="mb-3">
            <AccordionSection
              title={LABELS.star_core_traits_title}
              icon={Zap}
              color={star.color}
              defaultOpen={false}
            >
              <div className="grid grid-cols-2 gap-2 mt-2">
                {coreTraits.map((trait, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl p-3 text-center transition-all hover:scale-105"
                    style={{
                      background: `${star.color}10`,
                      border: `1px solid ${star.color}20`,
                    }}
                  >
                    <div className="text-2xl mb-1">{trait.icon}</div>
                    <div className="text-xs font-bold text-white mb-0.5">{trait.label}</div>
                    <div className="text-[10px] text-gray-500 leading-snug">{trait.desc}</div>
                  </div>
                ))}
              </div>
            </AccordionSection>
          </div>
        )}

        {/* 아코디언: 이런 사람에게 딱 */}
        {profile && fitItems.length > 0 && (
          <div className="mb-3">
            <AccordionSection
              title={LABELS.star_fit_title}
              icon={Users}
              color={star.color}
              defaultOpen={false}
            >
              <div className="space-y-2 mt-2">
                {fitItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 text-xs text-gray-300 leading-relaxed p-2 rounded-lg transition-all hover:bg-white/5"
                  >
                    <span className="flex-shrink-0">✨</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              {notFitItems.length > 0 && (
                <>
                  <div className="h-px bg-white/10 my-3" />
                  <div className="text-[11px] font-bold text-gray-500 mb-2">
                    {LABELS.star_fit_not_recommend_title}
                  </div>
                  <div className="space-y-2">
                    {notFitItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 text-xs text-gray-400 leading-relaxed p-2 rounded-lg"
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
          </div>
        )}

        {/* 아코디언: 공통 DNA */}
        {profile && commonDNA.length > 0 && (
          <div className="mb-3">
            <AccordionSection
              title={LABELS.star_common_dna_label}
              icon={Lightbulb}
              color={star.color}
              defaultOpen={false}
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
          </div>
        )}

        {/* 직업 목록 */}
        <div className="mt-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5" />
            {star.jobCount}{LABELS.jobs_title}
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
