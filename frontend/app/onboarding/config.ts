import { Sparkles, Compass, GitBranch, Map, type LucideIcon } from 'lucide-react';

// ─── 색상 팔레트 ───────────────────────────────────────────────
export const COLOR_PALETTE: Record<string, { base: string; light: string }> = {
  purple: { base: '#6C5CE7', light: '#a29bfe' },
  blue:   { base: '#3B82F6', light: '#93c5fd' },
  green:  { base: '#22C55E', light: '#86efac' },
  amber:  { base: '#F59E0B', light: '#fcd34d' },
};

// ─── 아이콘 매핑 ───────────────────────────────────────────────
export const ICON_MAP: Record<string, LucideIcon> = {
  Sparkles,
  Compass,
  GitBranch,
  Map,
};

// ─── 텍스트 라벨 (i18n 확장 대비 key → string) ────────────────
export const LABELS: Record<string, string> = {
  // 슬라이드 제목
  slide_discover_title:        '나를 발견하는 여정',
  slide_explore_title:         '8개의 별(직업)을 탐험하세요',
  slide_career_process_title:  '직업 프로세스와 커리어 패스',
  slide_career_builder_title:  '나만의 커리어 패스 제작',

  // 슬라이드 서브타이틀
  slide_discover_subtitle:        'RIASEC Personality Discovery',
  slide_explore_subtitle:         'Star Explorer',
  slide_career_process_subtitle:  'Career Process & Path',
  slide_career_builder_subtitle:  'My Career Path Builder',

  // 슬라이드 설명
  slide_discover_description:
    '30개 상황형 질문에 답하면\n숨겨진 직업 본능이 깨어납니다',
  slide_explore_description:
    '기술, 과학, 예술, 사회, 경영 등\n직업의 별에서 모험을 시작하세요',
  slide_career_process_description:
    '직업인의 직무 프로세스를 이해하고\n 그동안 걸어온 커리어 경로를 확인하세요',
  slide_career_builder_description:
    '활동·수상·자격증을 직접 선택해\n나만의 커리어 로드맵을 완성하세요',

  // 프로세스 스텝 라벨
  step_job_search:        '직업 분야',
  step_day_experience:    '직업 프로세스',
  step_career_path_check: '커리어 경로',
  step_activity_select:   '다양한 활동 ',
  step_award_cert:        '수상·자격증',
  step_roadmap_complete:  '로드맵 완성',

  // UI 공통
  btn_next:            '다음',
  btn_start:           '적성 검사로 시작하기',
  btn_skip:            '건너뛰기',
  step_indicator:      'Step',
  step_separator:      '/',
};

// ─── 네비게이션 경로 ──────────────────────────────────────────
export const ROUTES = {
  afterOnboarding: '/quiz/intro',
} as const;

// ─── 파티클 설정 ──────────────────────────────────────────────
export const PARTICLE_CONFIG = {
  count: 12,
  minSize: 3,
  maxSize: 6,
  minOpacity: 0.2,
  maxOpacity: 0.4,
  minDuration: 3,
  maxDuration: 7,
} as const;
