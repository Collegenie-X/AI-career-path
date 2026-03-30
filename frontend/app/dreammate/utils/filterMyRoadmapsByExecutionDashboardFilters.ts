import type { SharedRoadmap } from '../types';

export interface MyExecutionDashboardFilterState {
  /** true면 공개(채널 있음)인 로드맵만 */
  readonly filterSharedOnly: boolean;
  /** true면 실행팀(groupIds)에 연결된 로드맵만 */
  readonly filterSpaceLinkedOnly: boolean;
}

/**
 * 내 실행 대시보드 체크 필터 적용.
 * 두 필터가 모두 꺼지면 전체 목록(적용 없음).
 * 둘 다 켜지면 AND(공개이면서 팀 연결).
 */
export function filterMyRoadmapsByExecutionDashboardFilters(
  roadmaps: readonly SharedRoadmap[],
  filters: MyExecutionDashboardFilterState,
): SharedRoadmap[] {
  const { filterSharedOnly, filterSpaceLinkedOnly } = filters;
  if (!filterSharedOnly && !filterSpaceLinkedOnly) {
    return [...roadmaps];
  }
  return roadmaps.filter(roadmap => {
    const isShared = (roadmap.shareChannels ?? []).length > 0;
    const hasSpace = (roadmap.groupIds ?? []).length > 0;
    if (filterSharedOnly && !isShared) return false;
    if (filterSpaceLinkedOnly && !hasSpace) return false;
    return true;
  });
}

export function countMyRoadmapsShared(roadmaps: readonly SharedRoadmap[]): number {
  return roadmaps.filter(r => (r.shareChannels ?? []).length > 0).length;
}

export function countMyRoadmapsWithSpaceLink(roadmaps: readonly SharedRoadmap[]): number {
  return roadmaps.filter(r => (r.groupIds ?? []).length > 0).length;
}
