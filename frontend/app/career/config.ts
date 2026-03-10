// ─── Career Path Feature Configuration ───────────────────────────
// UI 라벨·설정은 JSON 파일에서 로드합니다.
// - career-content.json: UI 텍스트, 메시지
// - career-config.json: 색상, 항목 타입, 학년, 라우트

import careerContent from '@/data/career-content.json';
import careerConfig from '@/data/career-config.json';

export type PlanItemType = 'activity' | 'award' | 'portfolio' | 'certification';

/** UI 라벨 (career-content.json) */
export const LABELS = careerContent as {
  readonly [key: string]: string | readonly string[];
};

/** 테마 색상 (career-config.json) */
export const COLORS = careerConfig.colors as {
  readonly primary: string;
  readonly activity: string;
  readonly award: string;
  readonly certification: string;
  readonly portfolio: string;
  readonly goal: string;
  readonly background: string;
};

/** 커리어 항목 타입 (활동/수상/작품/자격증) */
export const ITEM_TYPES = careerConfig.itemTypes as readonly {
  value: PlanItemType;
  label: string;
  color: string;
  emoji: string;
}[];

/** 학년 목록 (초4 ~ 고2) */
export const GRADE_YEARS = careerConfig.gradeYears as readonly {
  id: string;
  label: string;
  fullLabel: string;
  order: number;
}[];

/** 왕국(별) 필터 옵션 */
export const STAR_FILTERS = careerConfig.starFilters as readonly {
  id: string;
  label: string;
  emoji: string;
}[];

/** 학기 선택 옵션 */
export const SEMESTER_OPTIONS = careerConfig.semesterOptions as readonly {
  id: string;
  label: string;
  emoji: string;
  description: string;
}[];

/** 라우트 경로 */
export const ROUTES = careerConfig.routes as {
  readonly career: string;
  readonly builder: string;
  readonly timeline: string;
  readonly explore: string;
  readonly community: string;
};
