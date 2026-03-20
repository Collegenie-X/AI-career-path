'use client';

import type { ComponentType, CSSProperties } from 'react';
import {
  Users,
  Sparkles,
  BookOpen,
  Target,
  Plus,
  Share2,
  Bookmark,
  ListChecks,
  FileText,
  Calendar,
  ClipboardList,
} from 'lucide-react';
import { HERO_CONFIG } from '../config';
import type { DreamTabId } from '../types';

type DreamMateHeroBannerProps = {
  readonly activeTab: DreamTabId;
  readonly onCreateRoadmap: () => void;
  readonly onCreateSpace?: () => void;
  readonly onUploadResource?: () => void;
  readonly totalRoadmaps: number;
  readonly totalMyRoadmaps: number;
  readonly totalMySharedRoadmaps: number;
  readonly totalBookmarkedRoadmaps: number;
  readonly totalSpaces: number;
  readonly totalJoinedSpaces: number;
  readonly totalResources: number;
};

type HeroStatItem = {
  readonly icon: ComponentType<{ className?: string; style?: CSSProperties }>;
  readonly value: string;
  readonly label: string;
  readonly iconBackground: string;
  readonly iconColor: string;
};

const HEADLINE_ICON_MAP: Record<string, ComponentType<{ className?: string; style?: CSSProperties }>> = {
  Calendar,
  ClipboardList,
  Users,
  BookOpen,
  Sparkles,
};

const STAT_ICON_MAP: Record<string, ComponentType<{ className?: string; style?: CSSProperties }>> = {
  Share2,
  Bookmark,
  Target,
  ListChecks,
  Users,
  FileText,
  BookOpen,
};

function getHeroStatItems({
  activeTab,
  totalRoadmaps,
  totalMyRoadmaps,
  totalMySharedRoadmaps,
  totalBookmarkedRoadmaps,
  totalSpaces,
  totalJoinedSpaces,
  totalResources,
}: Omit<DreamMateHeroBannerProps, 'onCreateRoadmap' | 'onCreateSpace' | 'onUploadResource'>): readonly HeroStatItem[] {
  const statConfig = HERO_CONFIG.statIcons[activeTab] ?? [];

  const valueMap: Record<string, number> = {
    totalRoadmaps,
    totalMyRoadmaps,
    totalMySharedRoadmaps,
    totalBookmarkedRoadmaps,
    totalSpaces,
    totalJoinedSpaces,
    totalResources,
  };

  return statConfig.map((stat) => ({
    icon: STAT_ICON_MAP[stat.icon] ?? Target,
    value: stat.valueKey ? valueMap[stat.valueKey]?.toLocaleString() ?? '0' : (stat.value ?? '0'),
    label: stat.label,
    iconBackground: stat.iconBackground,
    iconColor: stat.iconColor,
  }));
}

export function DreamMateHeroBanner({
  activeTab,
  onCreateRoadmap,
  onCreateSpace,
  onUploadResource,
  totalRoadmaps,
  totalMyRoadmaps,
  totalMySharedRoadmaps,
  totalBookmarkedRoadmaps,
  totalSpaces,
  totalJoinedSpaces,
  totalResources,
}: DreamMateHeroBannerProps) {
  const copy = HERO_CONFIG.copyByTab[activeTab];
  const visualStyle = HERO_CONFIG.visualStyles[activeTab];
  const radii = HERO_CONFIG.borderRadius;

  const heroStats = getHeroStatItems({
    activeTab,
    totalRoadmaps,
    totalMyRoadmaps,
    totalMySharedRoadmaps,
    totalBookmarkedRoadmaps,
    totalSpaces,
    totalJoinedSpaces,
    totalResources,
  });

  const handleCtaClick = () => {
    if (activeTab === 'space' && onCreateSpace) {
      onCreateSpace();
    } else if (activeTab === 'library' && onUploadResource) {
      onUploadResource();
    } else {
      onCreateRoadmap();
    }
  };

  if (!visualStyle || !copy) return null;

  const HeadlineIcon = HEADLINE_ICON_MAP[copy.headlineIcon] ?? Sparkles;

  return (
    <div
      className="relative overflow-hidden px-4 py-5 md:px-5 md:py-6 mb-4 md:mb-5"
      style={{
        background: visualStyle.background,
        border: visualStyle.border,
        borderRadius: radii.container,
      }}
    >
      <div
        className="absolute -top-8 -right-8 w-40 h-40 opacity-20 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${visualStyle.glowTopColor}, transparent)`,
          borderRadius: radii.glowBlob,
        }}
      />
      <div
        className="absolute -bottom-6 -left-6 w-28 h-28 opacity-15 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${visualStyle.glowBottomColor}, transparent)`,
          borderRadius: radii.glowBlob,
        }}
      />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-1 min-w-0 gap-4">
          <div
            className="flex h-14 w-14 flex-shrink-0 items-center justify-center md:h-16 md:w-16"
            style={{
              background: 'rgba(0,0,0,0.25)',
              border: `1px solid ${visualStyle.accentColor}55`,
              borderRadius: radii.headlineIcon,
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

        <div className="flex flex-col gap-4 lg:items-end lg:flex-shrink-0">
          <button
            type="button"
            onClick={handleCtaClick}
            className="inline-flex w-full items-center justify-center gap-2 px-4 py-2.5 text-[13px] font-bold text-white transition-all active:scale-[0.99] sm:w-auto lg:justify-end"
            style={{
              background: 'linear-gradient(135deg, #6C5CE7, #a855f7)',
              boxShadow: '0 4px 16px rgba(108,92,231,0.45)',
              borderRadius: radii.ctaButton,
            }}
          >
            <Plus className="h-4 w-4" />
            {copy.cta}
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
                        borderRadius: radii.statIcon,
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
