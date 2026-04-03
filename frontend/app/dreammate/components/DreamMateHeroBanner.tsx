'use client';

import type { ComponentType, CSSProperties } from 'react';
import {
  Users,
  Sparkles,
  BookOpen,
  Target,
  Share2,
  Bookmark,
  ListChecks,
  FileText,
  Calendar,
  ClipboardList,
} from 'lucide-react';
import { HERO_CONFIG, LABELS } from '../config';
import type { DreamTabId } from '../types';
import { DreamSpaceCreateGroupButton } from './DreamSpaceCreateGroupButton';

type DreamMateHeroBannerProps = {
  readonly activeTab: DreamTabId;
  readonly onCreateRoadmap: () => void;
  readonly onCreateSpace?: () => void;
  readonly onUploadResource?: () => void;
  /** 로그인(JWT) 후에만 실행 계획·스페이스·자료 생성 CTA 표시 */
  readonly allowMutations?: boolean;
  /** false면 통계 숫자를 0으로 렌더 — localStorage 등으로 마운트 후 값이 달라져 hydration 불일치 방지 */
  readonly statsReady?: boolean;
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
}: Omit<DreamMateHeroBannerProps, 'onCreateRoadmap' | 'onCreateSpace' | 'onUploadResource' | 'allowMutations'>): readonly HeroStatItem[] {
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
    value: stat.valueKey
      ? (valueMap[stat.valueKey] ?? 0).toLocaleString('ko-KR')
      : (stat.value ?? '0'),
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
  allowMutations = true,
  statsReady = true,
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
    totalRoadmaps: statsReady ? totalRoadmaps : 0,
    totalMyRoadmaps: statsReady ? totalMyRoadmaps : 0,
    totalMySharedRoadmaps: statsReady ? totalMySharedRoadmaps : 0,
    totalBookmarkedRoadmaps: statsReady ? totalBookmarkedRoadmaps : 0,
    totalSpaces: statsReady ? totalSpaces : 0,
    totalJoinedSpaces: statsReady ? totalJoinedSpaces : 0,
    totalResources: statsReady ? totalResources : 0,
  });

  if (!visualStyle || !copy) return null;

  const HeadlineIcon = HEADLINE_ICON_MAP[copy.headlineIcon] ?? Sparkles;

  const showHeroCreateRoadmapButton = allowMutations && (activeTab === 'feed' || activeTab === 'my');
  const showHeroCreateSpaceButton = allowMutations && activeTab === 'space' && typeof onCreateSpace === 'function';

  const showHeroUploadResourceButton = allowMutations && activeTab === 'library';

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

      {/* 버튼은 전체 너비 상단 행이 아니라 오른쪽 열 안에만 두어, 왼쪽 카피와 같은 flex 행에서 상단 정렬(items-start) */}
      <div className="relative z-[1] flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-1 gap-4">
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

        <div className="flex w-full flex-shrink-0 flex-col gap-3 lg:w-auto lg:items-end lg:gap-4">
          {showHeroCreateSpaceButton ? (
            <div className="flex w-full justify-end lg:w-auto">
              <DreamSpaceCreateGroupButton
                variant="heroPill"
                label={copy.cta}
                onClick={() => onCreateSpace?.()}
                ariaLabel={copy.cta}
              />
            </div>
          ) : showHeroCreateRoadmapButton ? (
            <div className="flex w-full justify-end lg:w-auto">
              <button
                type="button"
                onClick={onCreateRoadmap}
                className="inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, rgba(108,92,231,0.9), rgba(99,102,241,0.8))',
                  borderColor: 'rgba(108,92,231,0.5)',
                  color: 'white',
                }}
                aria-label={LABELS.heroCreateExecutionButtonLabel}
              >
                {LABELS.heroCreateExecutionButtonLabel}
              </button>
            </div>
          ) : showHeroUploadResourceButton && onUploadResource ? (
            <div className="flex w-full justify-end lg:w-auto">
              <button
                type="button"
                onClick={onUploadResource}
                className="inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, rgba(108,92,231,0.9), rgba(99,102,241,0.8))',
                  borderColor: 'rgba(108,92,231,0.5)',
                  color: 'white',
                }}
                aria-label={LABELS.uploadResourceButton}
              >
                {LABELS.uploadResourceButton}
              </button>
            </div>
          ) : null}
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
