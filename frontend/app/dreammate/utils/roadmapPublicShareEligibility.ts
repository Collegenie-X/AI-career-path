import { REQUIRE_RESULT_ASSET_FOR_PUBLIC_SHARE } from '../config';
import type { SharedRoadmap } from '../types';

/** 중간·최종 결과물에 URL/이미지가 있는지 (구버전 ‘전체 공유’ 게이트용) */
export function roadmapHasShareableResultAsset(roadmap: SharedRoadmap): boolean {
  const hasFinalResultAsset = Boolean(roadmap.finalResultUrl?.trim() || roadmap.finalResultImageUrl?.trim());
  const hasMilestoneAsset = (roadmap.milestoneResults ?? []).some(result =>
    Boolean(result.resultUrl?.trim() || result.imageUrl?.trim()),
  );
  return hasFinalResultAsset || hasMilestoneAsset;
}

/**
 * 공유 설정 다이얼로그에서 ‘전체 공유’ 채널을 선택 가능한지.
 * `requireResultAssetForPublicShare`가 false이면 항상 true.
 */
export function getCanSelectPublicShareForRoadmap(roadmap: SharedRoadmap): boolean {
  if (!REQUIRE_RESULT_ASSET_FOR_PUBLIC_SHARE) return true;
  return roadmapHasShareableResultAsset(roadmap);
}
