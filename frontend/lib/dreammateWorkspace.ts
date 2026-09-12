import type {
  DreamResource,
  DreamResourceComment,
  DreamResourceReportRecord,
  DreamSpace,
  RoadmapReportRecord,
  SharedRoadmap,
} from '@/app/dreammate/types';

const WORKSPACE_STORAGE_KEY = 'dreammate_workspace_v1';

/**
 * 시드에서 제거한 로드맵 id. 이미 사용자 브라우저(localStorage)에 저장된 경우
 * 시드를 비워도 병합 시 남으므로, 로드 시점에 강제로 걸러낸다.
 */
const REMOVED_SEED_ROADMAP_IDS = new Set<string>(['rm-001', 'rm-002', 'rm-003']);

export interface DreamMateWorkspaceState {
  roadmaps: SharedRoadmap[];
  resources: DreamResource[];
  resourceComments: DreamResourceComment[];
  resourceReports: DreamResourceReportRecord[];
  spaces: DreamSpace[];
  roadmapReports: RoadmapReportRecord[];
}

function mergeRoadmapsWithFallback(
  storedRoadmaps: SharedRoadmap[],
  fallbackRoadmaps: SharedRoadmap[],
): SharedRoadmap[] {
  const roadmapById = new Map<string, SharedRoadmap>();

  // 저장된 로드맵을 먼저 등록 (사용자가 직접 만든 private 로드맵 등)
  // 단, 시드에서 삭제된 로드맵 id는 캐시에 남아 있어도 제거한다.
  storedRoadmaps.forEach(roadmap => {
    if (REMOVED_SEED_ROADMAP_IDS.has(roadmap.id)) return;
    roadmapById.set(roadmap.id, roadmap);
  });

  // 시드의 공개 로드맵은 항상 최신 시드 데이터로 덮어씀
  // (milestoneResults, finalResult 등 시드 업데이트가 반영되도록)
  fallbackRoadmaps.forEach(roadmap => {
    const isPublic = roadmap.shareChannels?.includes('public') ?? (roadmap.shareScope ?? 'private') === 'public';
    if (!isPublic) return;
    roadmapById.set(roadmap.id, roadmap);
  });

  return Array.from(roadmapById.values());
}

function cloneState(state: DreamMateWorkspaceState): DreamMateWorkspaceState {
  return {
    roadmaps: structuredClone(state.roadmaps),
    resources: structuredClone(state.resources),
    resourceComments: structuredClone(state.resourceComments),
    resourceReports: structuredClone(state.resourceReports),
    spaces: structuredClone(state.spaces),
    roadmapReports: structuredClone(state.roadmapReports),
  };
}

function mergeResourcesWithFallback(
  storedResources: DreamResource[],
  fallbackResources: DreamResource[],
): DreamResource[] {
  const resourceById = new Map<string, DreamResource>();
  storedResources.forEach(resource => {
    resourceById.set(resource.id, resource);
  });
  fallbackResources.forEach(resource => {
    if (!resourceById.has(resource.id)) {
      resourceById.set(resource.id, resource);
    }
  });
  return Array.from(resourceById.values());
}

export function loadDreamMateWorkspaceState(
  fallbackState: DreamMateWorkspaceState,
): DreamMateWorkspaceState {
  try {
    const raw = localStorage.getItem(WORKSPACE_STORAGE_KEY);
    if (!raw) {
      return cloneState(fallbackState);
    }
    const parsed = JSON.parse(raw) as Partial<DreamMateWorkspaceState>;
    if (!Array.isArray(parsed.roadmaps) || !Array.isArray(parsed.spaces)) {
      return cloneState(fallbackState);
    }
    return {
      roadmaps: mergeRoadmapsWithFallback(
        parsed.roadmaps as SharedRoadmap[],
        fallbackState.roadmaps,
      ),
      resources: Array.isArray(parsed.resources)
        ? mergeResourcesWithFallback(parsed.resources as DreamResource[], fallbackState.resources)
        : fallbackState.resources,
      resourceComments: Array.isArray(parsed.resourceComments)
        ? (parsed.resourceComments as DreamResourceComment[])
        : fallbackState.resourceComments,
      resourceReports: Array.isArray(parsed.resourceReports)
        ? (parsed.resourceReports as DreamResourceReportRecord[])
        : fallbackState.resourceReports,
      spaces: parsed.spaces as DreamSpace[],
      roadmapReports: Array.isArray(parsed.roadmapReports)
        ? (parsed.roadmapReports as RoadmapReportRecord[])
        : fallbackState.roadmapReports,
    };
  } catch {
    return cloneState(fallbackState);
  }
}

export function saveDreamMateWorkspaceState(state: DreamMateWorkspaceState): void {
  try {
    localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore persistence failures
  }
}

