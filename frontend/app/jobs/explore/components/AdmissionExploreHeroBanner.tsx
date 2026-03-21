'use client';

import { GraduationCap, School } from 'lucide-react';
import admissionHeroConfig from '@/data/jobs-explore/admission-hero.json';

type AdmissionHeroVariant = 'highSchool' | 'university';

const ADMISSION_HERO_CONFIG = admissionHeroConfig as {
  highSchool: {
    eyebrow: string;
    title: string;
    highlight: string;
    description: string;
    stat1Value: string;
    stat1Label: string;
    stat2Value: string;
    stat2Label: string;
  };
  university: {
    eyebrow: string;
    title: string;
    highlight: string;
    description: string;
    stat1Value: string;
    stat1Label: string;
    stat2Value: string;
    stat2Label: string;
  };
};

type AdmissionExploreHeroBannerProps = {
  readonly variant: AdmissionHeroVariant;
};

/** 고입/대입 탐색 탭용 히어로 배너 — 직업 탐색과 동일 레이아웃 */
export function AdmissionExploreHeroBanner({ variant }: AdmissionExploreHeroBannerProps) {
  const copy = ADMISSION_HERO_CONFIG[variant];
  const accent = variant === 'highSchool' ? '#a78bfa' : '#818cf8';
  const glowTop = variant === 'highSchool' ? '#a855f7' : '#6366f1';
  const glowBottom = variant === 'highSchool' ? '#22c55e' : '#14b8a6';
  const HeadlineIcon = variant === 'highSchool' ? GraduationCap : School;

  return (
    <div
      className="relative mb-4 overflow-hidden border-t-0 px-4 py-5 md:mb-5 md:px-5 md:py-6"
      style={{
        background:
          variant === 'highSchool'
            ? 'linear-gradient(135deg, rgba(139,92,246,0.28) 0%, rgba(34,197,94,0.18) 50%, rgba(59,130,246,0.12) 100%)'
            : 'linear-gradient(135deg, rgba(99,102,241,0.28) 0%, rgba(20,184,166,0.18) 50%, rgba(59,130,246,0.12) 100%)',
        border: '1.5px solid rgba(108,92,231,0.35)',
      }}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 opacity-20"
        style={{ background: `radial-gradient(circle, ${glowTop}, transparent)` }}
      />
      <div
        className="pointer-events-none absolute -bottom-6 -left-6 h-28 w-28 opacity-15"
        style={{ background: `radial-gradient(circle, ${glowBottom}, transparent)` }}
      />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-1 gap-4">
          <div
            className="flex h-14 w-14 flex-shrink-0 items-center justify-center md:h-16 md:w-16"
            style={{
              background: 'rgba(0,0,0,0.25)',
              border: `1px solid ${accent}55`,
              borderRadius: '0.75rem',
            }}
            aria-hidden
          >
            <HeadlineIcon className="h-7 w-7 md:h-8 md:w-8" style={{ color: accent }} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="mb-1.5 text-[13px] font-bold uppercase tracking-wider" style={{ color: accent }}>
              {copy.eyebrow}
            </p>
            <h2 className="mb-2 text-xl font-black leading-tight text-white md:text-2xl">
              {copy.title}{' '}
              <span className="bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
                {copy.highlight}
              </span>
            </h2>
            <p className="max-w-2xl text-[13px] leading-relaxed text-gray-300">{copy.description}</p>
          </div>
        </div>
        <div className="flex flex-shrink-0 flex-wrap items-center gap-3 self-end sm:gap-4 lg:justify-end">
          <div className="text-center">
            <div className="text-[15px] font-black text-white">{copy.stat1Value}</div>
            <div className="-mt-0.5 text-[13px] text-gray-500">{copy.stat1Label}</div>
          </div>
          <div className="hidden h-7 w-px bg-white/10 sm:block" />
          <div className="text-center">
            <div className="text-[15px] font-black text-white">{copy.stat2Value}</div>
            <div className="-mt-0.5 text-[13px] text-gray-500">{copy.stat2Label}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
