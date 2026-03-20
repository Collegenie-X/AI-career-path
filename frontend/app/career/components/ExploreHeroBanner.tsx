'use client';

import type { ComponentType, CSSProperties } from 'react';
import { Users, Sparkles, BookOpen, Star, Plus, Compass, ListChecks, Share2 } from 'lucide-react';
import { CAREER_TAB_HERO_CONTENT, HERO_CONFIG, type CareerPageTabId } from '../config';

type ExploreHeroBannerProps = {
  readonly activeTab: CareerPageTabId;
  readonly onNewPath: () => void;
  readonly totalTemplateCount: number;
  readonly totalUses: number;
  readonly totalCommunitySharedPlans: number;
  readonly totalCommunityGroups: number;
  readonly totalMyPlans: number;
  readonly totalMyPublicPlans: number;
  /**
   * true: 커리어 셸(탭+콘텐츠) 안에 붙임 — 상단 테두리·둥근 모서리 제거로 탭 영역과 한 줄로 이어짐
   */
  readonly embeddedInCareerShell?: boolean;
};

type HeroStatItem = {
  readonly icon: ComponentType<{ className?: string; style?: CSSProperties }>;
  readonly value: string;
  readonly label: string;
  readonly iconBackground: string;
  readonly iconColor: string;
};

const ICON_MAP: Record<string, ComponentType<{ className?: string; style?: CSSProperties }>> = {
  BookOpen,
  Compass,
  Users,
  Share2,
  Star,
  ListChecks,
  Sparkles,
};

const HEADLINE_ICON_MAP: Record<string, ComponentType<{ className?: string; style?: CSSProperties }>> = {
  BookOpen,
  Users,
  ListChecks,
  Sparkles,
  Compass,
  Share2,
  Star,
};

function getHeroStatItems({
  activeTab,
  totalTemplateCount,
  totalUses,
  totalCommunitySharedPlans,
  totalCommunityGroups,
  totalMyPlans,
  totalMyPublicPlans,
}: Omit<ExploreHeroBannerProps, 'onNewPath' | 'embeddedInCareerShell'>): readonly HeroStatItem[] {
  const statConfig = HERO_CONFIG.statIcons[activeTab] ?? [];

  const valueMap: Record<string, number> = {
    totalTemplateCount,
    totalUses,
    totalCommunitySharedPlans,
    totalCommunityGroups,
    totalMyPlans,
    totalMyPublicPlans,
  };

  return statConfig.map((stat) => ({
    icon: ICON_MAP[stat.icon] ?? BookOpen,
    value: stat.valueKey ? valueMap[stat.valueKey]?.toLocaleString() ?? '0' : (stat.value ?? '0'),
    label: stat.label,
    iconBackground: stat.iconBackground,
    iconColor: stat.iconColor,
  }));
}

export function ExploreHeroBanner({
  activeTab,
  onNewPath,
  totalTemplateCount,
  totalUses,
  totalCommunitySharedPlans,
  totalCommunityGroups,
  totalMyPlans,
  totalMyPublicPlans,
  embeddedInCareerShell = false,
}: ExploreHeroBannerProps) {
  const heroContent = CAREER_TAB_HERO_CONTENT[activeTab];
  const visualStyle = HERO_CONFIG.visualStyles[activeTab];
  const heroStats = getHeroStatItems({
    activeTab,
    totalTemplateCount,
    totalUses,
    totalCommunitySharedPlans,
    totalCommunityGroups,
    totalMyPlans,
    totalMyPublicPlans,
  });

  if (!visualStyle) return null;

  const headlineIconName = HERO_CONFIG.headlineIcons[activeTab] ?? 'Sparkles';
  const HeadlineIcon = HEADLINE_ICON_MAP[headlineIconName] ?? Sparkles;

  const heroSurfaceClassName = embeddedInCareerShell
    ? 'relative overflow-hidden px-4 py-5 md:px-5 md:py-6 mb-4 md:mb-5'
    : 'relative overflow-hidden px-6 py-6 mb-5';

  const heroSurfaceStyle = embeddedInCareerShell
    ? {
        background: visualStyle.background,
        borderRadius: HERO_CONFIG.borderRadius.container,
        border: visualStyle.border,
      }
    : {
        background: visualStyle.background,
        border: visualStyle.border,
        borderRadius: HERO_CONFIG.borderRadius.container,
      };

  return (
    <div className={heroSurfaceClassName} style={heroSurfaceStyle}>
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 opacity-20"
        style={{
          background: `radial-gradient(circle, ${visualStyle.glowTopColor}, transparent)`,
          borderRadius: HERO_CONFIG.borderRadius.glowCircle,
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-6 -left-6 h-28 w-28 opacity-15"
        style={{
          background: `radial-gradient(circle, ${visualStyle.glowBottomColor}, transparent)`,
          borderRadius: HERO_CONFIG.borderRadius.glowCircle,
        }}
      />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-1 gap-4">
          <div
            className="flex h-14 w-14 flex-shrink-0 items-center justify-center md:h-16 md:w-16"
            style={{
              background: 'rgba(0,0,0,0.25)',
              border: `1px solid ${visualStyle.accentColor}55`,
              borderRadius: '0.75rem',
            }}
            aria-hidden
          >
            <HeadlineIcon className="h-7 w-7 md:h-8 md:w-8" style={{ color: visualStyle.accentColor }} />
          </div>
          <div className="min-w-0 flex-1">
            <p
              className="mb-1.5 text-[13px] font-bold uppercase tracking-wider"
              style={{ color: visualStyle.accentColor }}
            >
              {heroContent.eyebrow}
            </p>
            <h2 className="mb-2 text-xl font-black leading-tight text-white md:text-2xl">
              {heroContent.title}{' '}
              <span className="bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
                {heroContent.highlightText}
              </span>
            </h2>
            <p className="max-w-2xl text-[13px] leading-relaxed text-gray-300">{heroContent.description}</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:flex-shrink-0 lg:items-end">
          <button
            type="button"
            onClick={onNewPath}
            className="inline-flex w-full items-center justify-center gap-2 px-4 py-2.5 text-[13px] font-bold text-white transition-all active:scale-[0.99] sm:w-auto lg:justify-end"
            style={{
              background: 'linear-gradient(135deg, #6C5CE7, #a855f7)',
              boxShadow: '0 4px 16px rgba(108,92,231,0.55)',
              borderRadius: HERO_CONFIG.borderRadius.ctaButton,
            }}
          >
            <Plus className="h-4 w-4" />
            {heroContent.ctaLabel}
          </button>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 lg:justify-end">
            {heroStats.map((heroStat, heroStatIndex) => {
              const IconComponent = heroStat.icon;
              const isLast = heroStatIndex === heroStats.length - 1;

              return (
                <div key={`${heroStat.label}-${heroStatIndex}`} className="flex items-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="flex h-8 w-8 items-center justify-center"
                      style={{
                        backgroundColor: heroStat.iconBackground,
                        borderRadius: HERO_CONFIG.borderRadius.statIcon,
                      }}
                    >
                      <IconComponent className="h-4 w-4" style={{ color: heroStat.iconColor }} />
                    </div>
                    <div>
                      <div className="text-[15px] font-black text-white">{heroStat.value}</div>
                      <div className="-mt-0.5 text-[13px] text-gray-500">{heroStat.label}</div>
                    </div>
                  </div>
                  {!isLast ? <div className="hidden h-7 w-px bg-white/10 sm:block" /> : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
