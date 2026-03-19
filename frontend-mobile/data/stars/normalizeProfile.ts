/**
 * StarProfile 정규화 유틸리티
 *
 * 레거시(flat) 구조와 트리 구조를 통일된 트리 형식으로 변환합니다.
 * - careerKeyword 문자열 → careerKeywords 배열
 * - flat 객체 → sections[] 트리
 */

import type { StarProfileTree, StarProfileLegacy, StarProfileSection } from './schema';

export function normalizeStarProfile(profile: StarProfileLegacy | StarProfileTree): StarProfileTree {
  if ('sections' in profile && Array.isArray(profile.sections)) {
    return profile as StarProfileTree;
  }

  const legacy = profile as StarProfileLegacy;
  const sections: StarProfileSection[] = [];

  if (legacy.coreTraits && legacy.coreTraits.length > 0) {
    sections.push({
      id: 'coreTraits',
      type: 'traitGrid',
      titleKey: 'star_core_traits_title',
      items: legacy.coreTraits,
    });
  }

  if (legacy.fitPersonality) {
    sections.push({
      id: 'fitPersonality',
      type: 'fitList',
      titleKey: legacy.fitPersonality.titleKey ?? 'star_fit_title',
      fitItems: legacy.fitPersonality.traits ?? [],
      notFitItems: legacy.fitPersonality.notFit ?? [],
    });
  }

  if (legacy.whyThisGroup) {
    sections.push({
      id: 'whyThisGroup',
      type: 'reasonWithTags',
      titleKey: legacy.whyThisGroup.titleKey ?? 'star_why_grouped_title',
      reason: legacy.whyThisGroup.reason,
      commonDNA: legacy.whyThisGroup.commonDNA ?? [],
    });
  }

  const careerKeywords: string[] =
    legacy.careerKeywords && legacy.careerKeywords.length > 0
      ? legacy.careerKeywords
      : legacy.careerKeyword
        ? legacy.careerKeyword
            .split(/\s+/)
            .filter((t) => t.startsWith('#'))
            .map((t) => t.replace(/^#/, ''))
        : [];

  return {
    tagline: legacy.tagline ?? '',
    careerKeywords,
    sections,
    meta: {
      difficultyLevel: legacy.difficultyLevel ?? 0,
      avgPreparationYears: legacy.avgPreparationYears ?? 0,
      hollandCode: legacy.hollandCode ?? '',
      keySubjects: legacy.keySubjects ?? [],
    },
  };
}
