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

/** 커리어 패스 빌더(모달) 시각 설정 — career-config.json */
export type CareerPathBuilderDialogTheme = {
  readonly baseWidthPx: number;
  readonly widthScale: number;
  readonly maxWidthPx: number;
  readonly panelMaxHeightDvh: number;
  readonly panelMaxHeightPx: number;
  readonly backdropBlurPx: number;
  readonly backdropOverlayOpacity: number;
  readonly panelBorderGlow: string;
  readonly skyGradientTop: string;
  readonly skyGradientMid: string;
  readonly skyGradientBottom: string;
  readonly nebulaGlowA: string;
  readonly nebulaGlowB: string;
  readonly nebulaGlowC: string;
  readonly starCount: number;
  readonly chromeTint: string;
};

export const CAREER_PATH_BUILDER_DIALOG = careerConfig.careerPathBuilderDialog as CareerPathBuilderDialogTheme;

/** 목표 템플릿 선택 다이얼로그 시각 설정 */
export type GoalTemplateSelectorDialogTheme = {
  readonly maxWidthPx: number;
  readonly backdropBlurPx: number;
  readonly backdropOverlayOpacity: number;
  readonly panelBorderGlow: string;
  readonly skyGradientTop: string;
  readonly skyGradientBottom: string;
};

export const GOAL_TEMPLATE_SELECTOR_DIALOG = careerConfig.goalTemplateSelectorDialog as GoalTemplateSelectorDialogTheme;

export type CareerPageTabId = 'explore' | 'timeline' | 'community';

export type CareerPageTabItem = {
  readonly id: CareerPageTabId;
  readonly label: string;
  readonly emoji: string;
};

export type CareerHeaderContent = {
  readonly title: string;
  readonly subtitle: string;
};

export type CareerTabHeroContent = {
  readonly eyebrow: string;
  readonly title: string;
  readonly highlightText: string;
  readonly description: string;
  readonly ctaLabel: string;
};

export const CAREER_PAGE_TABS: readonly CareerPageTabItem[] = [
  { id: 'explore', label: String(LABELS.tab_explore ?? '탐색'), emoji: '🔍' },
  { id: 'community', label: String(LABELS.tab_community ?? '커뮤니티'), emoji: '👥' },
  { id: 'timeline', label: String(LABELS.tab_timeline ?? '내 패스'), emoji: '🗺️' },
] as const;

export const CAREER_PAGE_HEADER_CONTENT: CareerHeaderContent = {
  title: String(LABELS.page_title ?? '드림 패스'),
  subtitle: String(LABELS.page_subtitle ?? '나만의 진로 로드맵'),
};

export const CAREER_TAB_HERO_CONTENT: Record<CareerPageTabId, CareerTabHeroContent> = {
  explore: {
    eyebrow: String(LABELS.hero_explore_eyebrow ?? '커리어 패스 탐색'),
    title: String(LABELS.hero_explore_title ?? '나의 진로 로드맵,'),
    highlightText: String(LABELS.hero_explore_highlight ?? '여기서 찾아보세요'),
    description: String(LABELS.hero_explore_description ?? '다양한 직업의 커리어 패스를 참고하거나 나만의 패스를 직접 만들어 보세요.'),
    ctaLabel: String(LABELS.hero_explore_cta ?? '패스 만들기'),
  },
  community: {
    eyebrow: String(LABELS.hero_community_eyebrow ?? '커뮤니티 네트워크'),
    title: String(LABELS.hero_community_title ?? '같은 목표 친구들과'),
    highlightText: String(LABELS.hero_community_highlight ?? '로드맵을 나눠보세요'),
    description: String(LABELS.hero_community_description ?? '공유된 패스를 둘러보고 좋아요와 북마크로 동기부여를 이어가세요.'),
    ctaLabel: String(LABELS.hero_community_cta ?? '패스 만들기'),
  },
  timeline: {
    eyebrow: String(LABELS.hero_timeline_eyebrow ?? '나의 실행 타임라인'),
    title: String(LABELS.hero_timeline_title ?? '내 목표를 학년별로'),
    highlightText: String(LABELS.hero_timeline_highlight ?? '차근차근 완성해요'),
    description: String(LABELS.hero_timeline_description ?? '현재 패스를 점검하고 수정하면서 나만의 진로 계획을 꾸준히 업데이트하세요.'),
    ctaLabel: String(LABELS.hero_timeline_cta ?? '새 패스 추가'),
  },
};
