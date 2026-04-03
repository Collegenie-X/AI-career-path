'use client';

import type { ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

type CareerPathTimelineListChromeRootProps = {
  readonly accentColor: string;
  readonly children: ReactNode;
};

/** 탐색·내 패스 공통 — 왼쪽 세로 레일 + 학년 블록 나열 */
export function CareerPathTimelineListChromeRoot({ accentColor, children }: CareerPathTimelineListChromeRootProps) {
  return (
    <div className="relative">
      <div
        className="absolute top-0 bottom-0 w-0.5 pointer-events-none"
        style={{ left: 19, backgroundColor: `${accentColor}25` }}
      />
      <div className="space-y-0">{children}</div>
    </div>
  );
}

type CareerPathTimelineGradeSectionChromeProps = {
  readonly accentColor: string;
  readonly gradeShortLabel: string;
  readonly gradeFullLabel: string;
  readonly isGradeExpanded: boolean;
  readonly onToggleGrade: () => void;
  /** true: 내 패스 — 학년 행에 완료 수·프로그래스바 */
  readonly showGradeProgressBar: boolean;
  readonly gradeCheckedCount: number;
  readonly gradeTotalCount: number;
  readonly completedSuffixLabel: string;
  readonly children: ReactNode;
};

/**
 * 학년 원형 뱃지 + 학년 제목(아코디언) + (선택) 진행률
 * 탐색·내 패스 동일 레이아웃; 진행률은 showGradeProgressBar 일 때만
 */
export function CareerPathTimelineGradeSectionChrome({
  accentColor,
  gradeShortLabel,
  gradeFullLabel,
  isGradeExpanded,
  onToggleGrade,
  showGradeProgressBar,
  gradeCheckedCount,
  gradeTotalCount,
  completedSuffixLabel,
  children,
}: CareerPathTimelineGradeSectionChromeProps) {
  return (
    <div className="relative pl-12 pb-6">
      <div
        className="absolute top-0 flex items-center justify-center rounded-full text-xs font-black z-10 select-none"
        style={{
          left: 0,
          width: 38,
          height: 38,
          backgroundColor: accentColor,
          color: '#fff',
          boxShadow: `0 0 0 3px #0d0d24, 0 0 10px ${accentColor}55`,
          fontSize: 12,
        }}
      >
        {gradeShortLabel}
      </div>

      <div className="space-y-3 pt-1">
        <button
          type="button"
          onClick={onToggleGrade}
          className="w-full flex flex-wrap items-start justify-between gap-2 text-left rounded-lg px-1 py-0.5 -mx-1 transition-colors hover:bg-white/[0.03]"
        >
          <span className="text-[14px] font-bold text-white leading-snug">{gradeFullLabel}</span>
          <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
            {showGradeProgressBar && gradeTotalCount > 0 ? (
              <CareerPathTimelineProgressCountBarInline
                accentColor={accentColor}
                checkedCount={gradeCheckedCount}
                totalCount={gradeTotalCount}
                completedSuffixLabel={completedSuffixLabel}
              />
            ) : null}
            <GradeChevron isExpanded={isGradeExpanded} />
          </div>
        </button>

        {isGradeExpanded ? children : null}
      </div>
    </div>
  );
}

function GradeChevron({ isExpanded }: { readonly isExpanded: boolean }) {
  return isExpanded ? (
    <ChevronUp className="w-4 h-4 text-gray-500 flex-shrink-0" aria-hidden />
  ) : (
    <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" aria-hidden />
  );
}

/** 학년 행 우측에 붙는 인라인 진행(텍스트 + 막대) */
function CareerPathTimelineProgressCountBarInline({
  accentColor,
  checkedCount,
  totalCount,
  completedSuffixLabel,
}: {
  readonly accentColor: string;
  readonly checkedCount: number;
  readonly totalCount: number;
  readonly completedSuffixLabel: string;
}) {
  if (totalCount <= 0) return null;
  const ratio = checkedCount / totalCount;
  return (
    <div className="flex flex-col items-end gap-0.5 min-w-[96px] flex-1 max-w-[min(200px,50%)]">
      <span className="text-[11px] font-bold text-gray-500 tabular-nums">
        {checkedCount}/{totalCount} {completedSuffixLabel}
      </span>
      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${ratio * 100}%`, backgroundColor: accentColor }}
        />
      </div>
    </div>
  );
}
