'use client';

/**
 * 커리어 탐색(고입·대입·직업) 탭 로딩 스켈레톤.
 *
 * 탐색 페이지는 고입/직업 데이터(JSON)가 무거워 탭 컨텐츠를 dynamic import 로
 * 분할 로딩한다. 그 사이 화면이 비어 보이지 않도록, 실제 레이아웃과 같은 골격
 * (탭바 · 히어로 · 2컬럼 본문)을 그대로 흉내 낸 스켈레톤을 노출한다.
 */

import { cn } from '@/lib/utils';
import {
  SECTION_SHELL_TAB_NAVIGATION_AREA_CLASS_NAME_FLUSH_RIGHT,
  SECTION_SHELL_TAB_NAVIGATION_AREA_STYLE,
} from '@/components/section-shell/section-shell-layout.constants';
import { EXPLORE_PAGE_LAYOUT_CLASS } from '../config';

/** 어두운 배경용 기본 블록 — ui/skeleton 보다 대비를 낮춰 별 배경과 어울리게 */
export function SkeletonBlock({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      aria-hidden
      className={cn('animate-pulse rounded-md bg-white/[0.07]', className)}
      style={style}
    />
  );
}

/** 히어로 배너 자리 — 아이콘 + 제목 2줄 + 우측 통계 2개 */
export function ExploreHeroSkeleton() {
  return (
    <div
      className="relative mb-4 overflow-hidden border-t-0 px-4 py-5 md:mb-5 md:px-5 md:py-6"
      style={{
        background: 'linear-gradient(135deg, rgba(108,92,231,0.18) 0%, rgba(168,85,247,0.10) 50%, rgba(59,130,246,0.08) 100%)',
        border: '1.5px solid rgba(108,92,231,0.22)',
      }}
    >
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-1 gap-4">
          <SkeletonBlock className="h-14 w-14 flex-shrink-0 rounded-xl md:h-16 md:w-16" />
          <div className="min-w-0 flex-1 space-y-2.5">
            <SkeletonBlock className="h-3 w-28" />
            <SkeletonBlock className="h-6 w-3/5 max-w-sm" />
            <SkeletonBlock className="h-3.5 w-full max-w-2xl" />
            <SkeletonBlock className="h-3.5 w-2/3 max-w-xl" />
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-4 self-end">
          {[0, 1].map((i) => (
            <div key={i} className="space-y-1.5 text-center">
              <SkeletonBlock className="mx-auto h-4 w-8" />
              <SkeletonBlock className="mx-auto h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** 카드 그리드 스켈레톤 (별 카드 · 학교 유형 카드 공용) */
export function ExploreCardGridSkeleton({ count = 8, cardClassName }: { count?: number; cardClassName?: string }) {
  return (
    <div className={EXPLORE_PAGE_LAYOUT_CLASS.starGrid}>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className={cn('flex h-32 flex-col items-center justify-center gap-2 rounded-3xl', cardClassName)}
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <SkeletonBlock className="h-10 w-10 rounded-full" style={{ animationDelay: `${i * 70}ms` }} />
          <SkeletonBlock className="h-3 w-16" style={{ animationDelay: `${i * 70}ms` }} />
          <SkeletonBlock className="h-2.5 w-10" style={{ animationDelay: `${i * 70}ms` }} />
        </div>
      ))}
    </div>
  );
}

/** 상세 패널(우측) 스켈레톤 — 헤더 + 본문 리스트 */
export function ExploreDetailPanelSkeleton() {
  return (
    <div
      className="rounded-none border px-4 py-4 md:px-5 md:py-5"
      style={{ borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgb(var(--background))' }}
    >
      <div className="mb-4 flex items-center gap-3">
        <SkeletonBlock className="h-11 w-11 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <SkeletonBlock className="h-4 w-1/3" />
          <SkeletonBlock className="h-3 w-1/2" />
        </div>
      </div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <SkeletonBlock key={i} className="h-16 w-full rounded-2xl" style={{ animationDelay: `${i * 80}ms` }} />
        ))}
      </div>
    </div>
  );
}

/** 2컬럼(리스트 + 상세) 본문 스켈레톤 — 모든 탐색 탭 공용 */
export function ExploreTabContentSkeleton({ gridCount = 8 }: { gridCount?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,520px)_minmax(0,1fr)]">
      <div
        className={EXPLORE_PAGE_LAYOUT_CLASS.starGridListPanel}
        style={EXPLORE_PAGE_LAYOUT_CLASS.starGridListPanelStyle}
      >
        <div className="mb-4 space-y-2">
          <SkeletonBlock className="h-3.5 w-40" />
          <SkeletonBlock className="h-3 w-full max-w-md" />
        </div>
        <ExploreCardGridSkeleton count={gridCount} />
      </div>
      <ExploreDetailPanelSkeleton />
    </div>
  );
}

/** 탭 컨텐츠 dynamic import 용 — 본문 패딩까지 포함 */
export function ExploreTabBodySkeleton({ gridCount = 8 }: { gridCount?: number }) {
  return (
    <div role="status" aria-label="불러오는 중" aria-live="polite">
      <span className="sr-only">불러오는 중</span>
      <ExploreTabContentSkeleton gridCount={gridCount} />
    </div>
  );
}

/** 페이지 전체 스켈레톤 (Suspense fallback) — 탭바 + 히어로 + 본문 */
export function ExplorePageSkeleton() {
  return (
    <div
      className={EXPLORE_PAGE_LAYOUT_CLASS.pageRoot}
      style={{ backgroundColor: 'rgb(var(--background))' }}
      role="status"
      aria-label="커리어 탐색 불러오는 중"
      aria-live="polite"
    >
      <span className="sr-only">커리어 탐색 불러오는 중</span>
      <div className={EXPLORE_PAGE_LAYOUT_CLASS.contentShell}>
        <div
          className={EXPLORE_PAGE_LAYOUT_CLASS.contentFrame}
          style={EXPLORE_PAGE_LAYOUT_CLASS.contentFrameStyle}
        >
          <div
            className={SECTION_SHELL_TAB_NAVIGATION_AREA_CLASS_NAME_FLUSH_RIGHT}
            style={SECTION_SHELL_TAB_NAVIGATION_AREA_STYLE}
          >
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <SkeletonBlock key={i} className="h-9 w-28 rounded-full" style={{ animationDelay: `${i * 90}ms` }} />
              ))}
            </div>
          </div>
          <ExploreHeroSkeleton />
          <div className={EXPLORE_PAGE_LAYOUT_CLASS.bodyContentArea}>
            <ExploreTabContentSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}
