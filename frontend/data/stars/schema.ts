/**
 * 별(Star) 프로필 트리 구조 스키마
 *
 * 섹션 기반 트리로 UI 렌더 순서와 구조를 명확히 정의합니다.
 * - sections[]: 표시 순서가 보장된 섹션 배열
 * - meta: 난이도, 준비기간, Holland 코드 등 메타 정보
 */

export type CoreTraitItem = {
  icon: string;
  label: string;
  desc: string;
};

export type StarProfileSection =
  | {
      id: 'coreTraits';
      type: 'traitGrid';
      titleKey: string;
      items: CoreTraitItem[];
    }
  | {
      id: 'fitPersonality';
      type: 'fitList';
      titleKey: string;
      fitItems: string[];
      notFitItems: string[];
    }
  | {
      id: 'whyThisGroup';
      type: 'reasonWithTags';
      titleKey: string;
      reason: string;
      commonDNA: string[];
    };

export type StarProfileMeta = {
  difficultyLevel: number;
  avgPreparationYears: number;
  hollandCode: string;
  keySubjects: string[];
};

export type StarProfileTree = {
  tagline: string;
  careerKeywords: string[];
  sections: StarProfileSection[];
  meta: StarProfileMeta;
};

/** 레거시 flat 구조 (하위 호환용) */
export type StarProfileLegacy = {
  tagline?: string;
  careerKeyword?: string;
  careerKeywords?: string[];
  coreTraits?: CoreTraitItem[];
  fitPersonality?: {
    title?: string;
    titleKey?: string;
    traits: string[];
    notFit?: string[];
  };
  whyThisGroup?: {
    title?: string;
    titleKey?: string;
    reason: string;
    commonDNA: string[];
  };
  hollandCode?: string;
  keySubjects?: string[];
  difficultyLevel?: number;
  avgPreparationYears?: number;
};
