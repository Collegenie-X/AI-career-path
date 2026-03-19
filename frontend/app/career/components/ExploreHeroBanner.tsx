'use client';

import type { ComponentType, CSSProperties } from 'react';
import { Users, Sparkles, BookOpen, Star, Plus, Compass, ListChecks, Share2 } from 'lucide-react';
import { CAREER_TAB_HERO_CONTENT, type CareerPageTabId } from '../config';

type ExploreHeroBannerProps = {
  readonly activeTab: CareerPageTabId;
  readonly onNewPath: () => void;
  readonly totalTemplateCount: number;
  readonly totalUses: number;
  readonly totalCommunitySharedPlans: number;
  readonly totalCommunityGroups: number;
  readonly totalMyPlans: number;
  readonly totalMyPublicPlans: number;
};

type HeroVisualStyle = {
  readonly background: string;
  readonly border: string;
  readonly glowTopColor: string;
  readonly glowBottomColor: string;
  readonly accentColor: string;
};

type HeroStatItem = {
  readonly icon: ComponentType<{ className?: string; style?: CSSProperties }>;
  readonly value: string;
  readonly label: string;
  readonly iconBackground: string;
  readonly iconColor: string;
};

const HERO_VISUAL_STYLES: Record<CareerPageTabId, HeroVisualStyle> = {
  explore: {
    background: 'linear-gradient(135deg, rgba(108,92,231,0.28) 0%, rgba(168,85,247,0.18) 50%, rgba(59,130,246,0.12) 100%)',
    border: '1.5px solid rgba(108,92,231,0.35)',
    glowTopColor: '#a855f7',
    glowBottomColor: '#3b82f6',
    accentColor: '#a78bfa',
  },
  community: {
    background: 'linear-gradient(135deg, rgba(34,197,94,0.20) 0%, rgba(20,184,166,0.16) 55%, rgba(59,130,246,0.12) 100%)',
    border: '1.5px solid rgba(45,212,191,0.35)',
    glowTopColor: '#14b8a6',
    glowBottomColor: '#22c55e',
    accentColor: '#5eead4',
  },
  timeline: {
    background: 'linear-gradient(135deg, rgba(59,130,246,0.22) 0%, rgba(14,165,233,0.16) 50%, rgba(108,92,231,0.15) 100%)',
    border: '1.5px solid rgba(59,130,246,0.35)',
    glowTopColor: '#0ea5e9',
    glowBottomColor: '#6c5ce7',
    accentColor: '#7dd3fc',
  },
};

function getHeroStatItems({
  activeTab,
  totalTemplateCount,
  totalUses,
  totalCommunitySharedPlans,
  totalCommunityGroups,
  totalMyPlans,
  totalMyPublicPlans,
}: Omit<ExploreHeroBannerProps, 'onNewPath'>): readonly HeroStatItem[] {
  if (activeTab === 'community') {
    return [
      {
        icon: Share2,
        value: totalCommunitySharedPlans.toLocaleString(),
        label: '공유 패스',
        iconBackground: 'rgba(20,184,166,0.2)',
        iconColor: '#5eead4',
      },
      {
        icon: Users,
        value: totalCommunityGroups.toLocaleString(),
        label: '그룹',
        iconBackground: 'rgba(34,197,94,0.2)',
        iconColor: '#86efac',
      },
      {
        icon: Star,
        value: totalMyPublicPlans.toLocaleString(),
        label: '내 공개',
        iconBackground: 'rgba(59,130,246,0.2)',
        iconColor: '#93c5fd',
      },
    ] as const;
  }

  if (activeTab === 'timeline') {
    return [
      {
        icon: ListChecks,
        value: totalMyPlans.toLocaleString(),
        label: '내 패스',
        iconBackground: 'rgba(59,130,246,0.2)',
        iconColor: '#93c5fd',
      },
      {
        icon: Share2,
        value: totalMyPublicPlans.toLocaleString(),
        label: '공개중',
        iconBackground: 'rgba(108,92,231,0.25)',
        iconColor: '#c4b5fd',
      },
      {
        icon: BookOpen,
        value: totalTemplateCount.toLocaleString(),
        label: '참고 템플릿',
        iconBackground: 'rgba(14,165,233,0.2)',
        iconColor: '#7dd3fc',
      },
    ] as const;
  }

  return [
    {
      icon: BookOpen,
      value: totalTemplateCount.toLocaleString(),
      label: '커리어 패스',
      iconBackground: 'rgba(108,92,231,0.25)',
      iconColor: '#a78bfa',
    },
    {
      icon: Compass,
      value: '8',
      label: '왕국',
      iconBackground: 'rgba(59,130,246,0.2)',
      iconColor: '#60a5fa',
    },
    {
      icon: Users,
      value: totalUses.toLocaleString(),
      label: '총 사용',
      iconBackground: 'rgba(34,197,94,0.18)',
      iconColor: '#4ade80',
    },
  ] as const;
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
}: ExploreHeroBannerProps) {
  const heroContent = CAREER_TAB_HERO_CONTENT[activeTab];
  const visualStyle = HERO_VISUAL_STYLES[activeTab];
  const heroStats = getHeroStatItems({
    activeTab,
    totalTemplateCount,
    totalUses,
    totalCommunitySharedPlans,
    totalCommunityGroups,
    totalMyPlans,
    totalMyPublicPlans,
  });

  return (
    <div
      className="relative rounded-3xl overflow-hidden px-6 py-6 mb-5"
      style={{
        background: visualStyle.background,
        border: visualStyle.border,
      }}
    >
      <div
        className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-20 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${visualStyle.glowTopColor}, transparent)` }}
      />
      <div
        className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full opacity-15 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${visualStyle.glowBottomColor}, transparent)` }}
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
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-[13px] text-white transition-all active:scale-95 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #6C5CE7, #a855f7)',
              boxShadow: '0 4px 16px rgba(108,92,231,0.55)',
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
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: heroStat.iconBackground }}
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
