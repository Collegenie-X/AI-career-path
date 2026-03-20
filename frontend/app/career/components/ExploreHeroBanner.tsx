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

  const heroSurfaceClassName = embeddedInCareerShell
    ? 'relative overflow-hidden px-4 py-5 md:px-5 md:py-6 mb-4 md:mb-5'
    : 'relative overflow-hidden px-6 py-6 mb-5';

  const heroSurfaceStyle = embeddedInCareerShell
    ? { 
        background: visualStyle.background,
        borderRadius: HERO_CONFIG.borderRadius.container,
      }
    : {
        background: visualStyle.background,
        border: visualStyle.border,
        borderRadius: HERO_CONFIG.borderRadius.container,
      };

  return (
    <div className={heroSurfaceClassName} style={heroSurfaceStyle}>
      <div
        className="absolute -top-8 -right-8 w-40 h-40 opacity-20 pointer-events-none"
        style={{ 
          background: `radial-gradient(circle, ${visualStyle.glowTopColor}, transparent)`,
          borderRadius: HERO_CONFIG.borderRadius.glowCircle,
        }}
      />
      <div
        className="absolute -bottom-6 -left-6 w-28 h-28 opacity-15 pointer-events-none"
        style={{ 
          background: `radial-gradient(circle, ${visualStyle.glowBottomColor}, transparent)`,
          borderRadius: HERO_CONFIG.borderRadius.glowCircle,
        }}
      />

      <div className="relative flex items-center justify-between gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 flex-shrink-0" style={{ color: visualStyle.accentColor }} />
            <span className="text-[13px] font-bold" style={{ color: visualStyle.accentColor }}>
              {heroContent.eyebrow}
            </span>
          </div>
          <h2 className="text-2xl font-black text-white leading-tight mb-1.5">
            {heroContent.title}{' '}
            <span className="bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
              {heroContent.highlightText}
            </span>
          </h2>
          <p className="text-[13px] text-gray-400 leading-relaxed">
            {heroContent.description}
          </p>
        </div>

        <div className="flex flex-col items-end gap-4 flex-shrink-0">
          <button
            onClick={onNewPath}
            className="flex items-center gap-2 px-4 py-2.5 font-bold text-[13px] text-white transition-all active:scale-95 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #6C5CE7, #a855f7)',
              boxShadow: '0 4px 16px rgba(108,92,231,0.55)',
              borderRadius: HERO_CONFIG.borderRadius.ctaButton,
            }}
          >
            <Plus className="w-4 h-4" />
            {heroContent.ctaLabel}
          </button>

          <div className="flex items-center gap-4">
            {heroStats.map((heroStat, heroStatIndex) => {
              const IconComponent = heroStat.icon;
              const isLast = heroStatIndex === heroStats.length - 1;

              return (
                <div key={`${heroStat.label}-${heroStatIndex}`} className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-8 h-8 flex items-center justify-center"
                      style={{ 
                        backgroundColor: heroStat.iconBackground,
                        borderRadius: HERO_CONFIG.borderRadius.statIcon,
                      }}
                    >
                      <IconComponent className="w-4 h-4" style={{ color: heroStat.iconColor }} />
                    </div>
                    <div>
                      <div className="text-[15px] font-black text-white">{heroStat.value}</div>
                      <div className="text-[12px] text-gray-500 -mt-0.5">{heroStat.label}</div>
                    </div>
                  </div>
                  {!isLast ? <div className="w-px h-7 bg-white/10" /> : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
