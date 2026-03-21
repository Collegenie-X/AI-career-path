import roadmapTimelineDisplay from '@/data/dreammate/config/roadmapTimelineDisplay.json';

/** 우측 디테일 타임라인: 피드(뷰만) / 커뮤니티·내기록 패널(상태만) / 전용 페이지 등(상호작용) */
export type RoadmapTimelineDetailMode = 'feed_view_only' | 'status_readonly' | 'interactive';

export const ROADMAP_TIMELINE_DISPLAY = roadmapTimelineDisplay as {
  readonly chrome: {
    readonly planItemFolder: { readonly borderStyle: string; readonly radiusClass: string; readonly paddingClass: string };
    readonly weekSection: { readonly borderStyle: string; readonly radiusClass: string; readonly paddingClass: string };
    readonly goalBlock: { readonly borderStyle: string; readonly radiusClass: string; readonly paddingClass: string };
  };
  readonly treeSpine: {
    readonly lineOpacityHex: string;
    readonly dotSizeClass: string;
    readonly dotRingClass: string;
  };
  readonly labels: {
    readonly weekSectionRegionSuffix: string;
    readonly goalBlockRegionSuffix: string;
  };
};

/** 트리 내 할 일 한 줄: 피드는 텍스트 위주, 커뮤니티·내기록은 완료 아이콘만, 전용 페이지는 체크 가능 */
export type RoadmapTreeTodoRowVisualMode = 'feed_minimal' | 'status_readonly' | 'interactive';

export function getRoadmapTreeTodoRowVisualModeFromDetailMode(
  mode: RoadmapTimelineDetailMode,
): RoadmapTreeTodoRowVisualMode {
  if (mode === 'feed_view_only') return 'feed_minimal';
  if (mode === 'status_readonly') return 'status_readonly';
  return 'interactive';
}

export function getShowTimelineProgressBarsFromDetailMode(mode: RoadmapTimelineDetailMode): boolean {
  return mode !== 'feed_view_only';
}
