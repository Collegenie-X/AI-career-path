'use client';

import { ListChecks, Share2, Users } from 'lucide-react';
import type { MyExecutionDashboardFilterState } from '../utils/filterMyRoadmapsByExecutionDashboardFilters';

export interface DreamMateMyExecutionDashboardFilterBarProps {
  readonly totalMyRoadmaps: number;
  readonly totalSharedRoadmaps: number;
  readonly totalRoadmapsLinkedToSpace: number;
  readonly totalJoinedSpaces: number;
  readonly filters: MyExecutionDashboardFilterState;
  readonly onChangeFilters: (next: MyExecutionDashboardFilterState) => void;
  /** 라벨은 config(LABELS)에서 주입 */
  readonly labelAll: string;
  readonly labelShared: string;
  readonly labelSpace: string;
  readonly joinedSpacesNote: string;
  readonly helperApplyHint: string;
}

const CARD_BASE =
  'flex flex-col gap-2 rounded-xl border-0 px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 sm:px-3.5';

export function DreamMateMyExecutionDashboardFilterBar({
  totalMyRoadmaps,
  totalSharedRoadmaps,
  totalRoadmapsLinkedToSpace,
  totalJoinedSpaces,
  filters,
  onChangeFilters,
  labelAll,
  labelShared,
  labelSpace,
  joinedSpacesNote,
  helperApplyHint,
}: DreamMateMyExecutionDashboardFilterBarProps) {
  const { filterSharedOnly, filterSpaceLinkedOnly } = filters;
  const showAllActive = !filterSharedOnly && !filterSpaceLinkedOnly;

  const setAll = () => {
    onChangeFilters({ filterSharedOnly: false, filterSpaceLinkedOnly: false });
  };

  const toggleShared = () => {
    onChangeFilters({
      ...filters,
      filterSharedOnly: !filterSharedOnly,
    });
  };

  const toggleSpace = () => {
    onChangeFilters({
      ...filters,
      filterSpaceLinkedOnly: !filterSpaceLinkedOnly,
    });
  };

  return (
    <div className="space-y-2">
      <p className="text-[12px] text-gray-500">{helperApplyHint}</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <button
          type="button"
          aria-pressed={showAllActive}
          aria-label={labelAll}
          className={`${CARD_BASE} w-full cursor-pointer`}
          style={{
            backgroundColor: showAllActive ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.03)',
            border: showAllActive ? '1px solid rgba(59,130,246,0.35)' : '1px solid rgba(255,255,255,0.08)',
            boxShadow: showAllActive ? 'inset 0 1px 0 rgba(255,255,255,0.06)' : undefined,
          }}
          onClick={() => {
            setAll();
          }}
        >
          <div className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center"
              style={{ backgroundColor: 'rgba(59,130,246,0.2)', borderRadius: 2 }}
              aria-hidden
            >
              <ListChecks className="h-4 w-4" style={{ color: '#93c5fd' }} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-lg font-black text-white">{totalMyRoadmaps}</div>
              <div className="-mt-0.5 text-[13px] text-gray-400">{labelAll}</div>
            </div>
          </div>
        </button>

        <button
          type="button"
          aria-pressed={filterSharedOnly}
          aria-label={labelShared}
          className={`${CARD_BASE} w-full cursor-pointer`}
          style={{
            backgroundColor: filterSharedOnly ? 'rgba(108,92,231,0.14)' : 'rgba(255,255,255,0.03)',
            border: filterSharedOnly ? '1px solid rgba(139,92,246,0.4)' : '1px solid rgba(255,255,255,0.08)',
            boxShadow: filterSharedOnly ? 'inset 0 1px 0 rgba(255,255,255,0.06)' : undefined,
          }}
          onClick={() => {
            toggleShared();
          }}
        >
          <div className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center"
              style={{ backgroundColor: 'rgba(108,92,231,0.25)', borderRadius: 2 }}
              aria-hidden
            >
              <Share2 className="h-4 w-4" style={{ color: '#c4b5fd' }} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-lg font-black text-white">{totalSharedRoadmaps}</div>
              <div className="-mt-0.5 text-[13px] text-gray-400">{labelShared}</div>
            </div>
          </div>
        </button>

        <button
          type="button"
          aria-pressed={filterSpaceLinkedOnly}
          aria-label={`${labelSpace} (${joinedSpacesNote} ${totalJoinedSpaces})`}
          className={`${CARD_BASE} w-full cursor-pointer`}
          style={{
            backgroundColor: filterSpaceLinkedOnly ? 'rgba(20,184,166,0.14)' : 'rgba(255,255,255,0.03)',
            border: filterSpaceLinkedOnly ? '1px solid rgba(45,212,191,0.35)' : '1px solid rgba(255,255,255,0.08)',
            boxShadow: filterSpaceLinkedOnly ? 'inset 0 1px 0 rgba(255,255,255,0.06)' : undefined,
          }}
          onClick={() => {
            toggleSpace();
          }}
        >
          <div className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center"
              style={{ backgroundColor: 'rgba(20,184,166,0.2)', borderRadius: 2 }}
              aria-hidden
            >
              <Users className="h-4 w-4" style={{ color: '#5eead4' }} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-lg font-black text-white">{totalRoadmapsLinkedToSpace}</div>
              <div className="-mt-0.5 text-[13px] text-gray-400">{labelSpace}</div>
              <div className="mt-0.5 text-[11px] text-gray-500">
                {joinedSpacesNote}
                :
                {' '}
                {totalJoinedSpaces}
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
