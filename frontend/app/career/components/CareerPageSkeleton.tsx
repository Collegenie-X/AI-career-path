'use client';

/**
 * 커리어 패스 페이지(/career) 최초 진입 스켈레톤.
 *
 * jobs/explore 페이지(ExploreSkeletons.tsx)와 동일한 원칙: Suspense fallback으로
 * 빈 화면 대신 실제 레이아웃(탭바 · 히어로 · 2컬럼 리스트+상세)과 같은 골격을 보여준다.
 */

import { cn } from '@/lib/utils';
import {
  SECTION_SHELL_FRAME_STYLE,
  SECTION_SHELL_TAB_NAVIGATION_AREA_CLASS_NAME_FLUSH_RIGHT,
  SECTION_SHELL_TAB_NAVIGATION_AREA_STYLE,
} from '@/components/section-shell/section-shell-layout.constants';

function SkeletonBlock({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      aria-hidden
      className={cn('animate-pulse rounded-md bg-white/[0.07]', className)}
      style={style}
    />
  );
}

function CareerPageHeroSkeleton() {
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
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-4 self-end">
          {[0, 1, 2].map((i) => (
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

/** 왼쪽 리스트 패널 — 항상 1번째 항목이 선택된 상태로 표시되는 실제 UI를 흉내 */
export function CareerPageListSkeleton() {
  return (
    <div
      className="rounded-none border px-4 py-4 md:px-5 md:py-5"
      style={{
        borderColor: 'rgba(255,255,255,0.12)',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
      }}
    >
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-2xl px-3 py-3"
            style={{
              background: i === 0 ? 'rgba(108,92,231,0.14)' : 'rgba(255,255,255,0.02)',
              border: i === 0 ? '1px solid rgba(108,92,231,0.35)' : '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <SkeletonBlock className="h-9 w-9 flex-shrink-0 rounded-xl" style={{ animationDelay: `${i * 70}ms` }} />
            <div className="min-w-0 flex-1 space-y-1.5">
              <SkeletonBlock className="h-3.5 w-2/3" style={{ animationDelay: `${i * 70}ms` }} />
              <SkeletonBlock className="h-2.5 w-1/3" style={{ animationDelay: `${i * 70}ms` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** 오른쪽 상세 패널 — 1번째 항목의 상세가 항상 즉시 표시되는 것을 전제로 한 골격 */
export function CareerPageDetailSkeleton() {
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
        {[...Array(4)].map((_, i) => (
          <SkeletonBlock key={i} className="h-16 w-full rounded-2xl" style={{ animationDelay: `${i * 80}ms` }} />
        ))}
      </div>
    </div>
  );
}

/** 페이지 전체 스켈레톤 (Suspense fallback) — 탭바 + 히어로 + 2컬럼 본문 */
export function CareerPageSkeleton() {
  return (
    <div
      className="min-h-screen pb-12 relative"
      style={{ backgroundColor: 'rgb(var(--background))' }}
      role="status"
      aria-label="커리어 패스 불러오는 중"
      aria-live="polite"
    >
      <span className="sr-only">커리어 패스 불러오는 중</span>
      <div className="web-container relative z-10 py-4 md:py-6 rounded-3xl">
        <div
          className="rounded-none border border-t-0 border-x border-b overflow-hidden"
          style={SECTION_SHELL_FRAME_STYLE}
        >
          <div
            className={SECTION_SHELL_TAB_NAVIGATION_AREA_CLASS_NAME_FLUSH_RIGHT}
            style={SECTION_SHELL_TAB_NAVIGATION_AREA_STYLE}
          >
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <SkeletonBlock key={i} className="h-9 w-24 rounded-full" style={{ animationDelay: `${i * 90}ms` }} />
              ))}
            </div>
          </div>
          <CareerPageHeroSkeleton />
          <div className="px-4 pb-4 md:px-5 md:pb-5">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
              <CareerPageListSkeleton />
              <CareerPageDetailSkeleton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
