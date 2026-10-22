'use client';

import { ExploreGuideBanner } from './ExploreGuideBanner';
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

/** 고입/대입 탐색 탭용 가이드 띠 — 직업 탐색과 동일 레이아웃 (설명은 "자세히"로 펼친다) */
export function AdmissionExploreHeroBanner({ variant }: AdmissionExploreHeroBannerProps) {
  const copy = ADMISSION_HERO_CONFIG[variant];
  const isHighSchool = variant === 'highSchool';
  return (
    <ExploreGuideBanner
      emoji={isHighSchool ? '🏫' : '🎓'}
      eyebrow={copy.eyebrow}
      title={copy.title}
      highlight={copy.highlight}
      description={copy.description}
      stats={[
        { emoji: isHighSchool ? '🗂️' : '🪐', value: copy.stat1Value, label: copy.stat1Label },
        { emoji: isHighSchool ? '🚩' : '🧭', value: copy.stat2Value, label: copy.stat2Label },
      ]}
      accent={isHighSchool ? '#a78bfa' : '#818cf8'}
      background={
        isHighSchool
          ? 'linear-gradient(135deg, rgba(139,92,246,0.28) 0%, rgba(34,197,94,0.18) 50%, rgba(59,130,246,0.12) 100%)'
          : 'linear-gradient(135deg, rgba(99,102,241,0.28) 0%, rgba(20,184,166,0.18) 50%, rgba(59,130,246,0.12) 100%)'
      }
    />
  );
}
