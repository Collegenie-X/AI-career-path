import { Sparkles, Compass, Briefcase, Map, Trophy, type LucideIcon } from 'lucide-react';

// ─── 색상 팔레트 ───────────────────────────────────────────────
export const COLOR_PALETTE: Record<string, { base: string; light: string }> = {
  purple: { base: '#6C5CE7', light: '#a29bfe' },
  blue:   { base: '#3B82F6', light: '#93c5fd' },
  green:  { base: '#22C55E', light: '#86efac' },
  amber:  { base: '#F59E0B', light: '#fcd34d' },
  pink:   { base: '#EC4899', light: '#f9a8d4' },
};

// ─── 아이콘 매핑 ───────────────────────────────────────────────
export const ICON_MAP: Record<string, LucideIcon> = {
  Sparkles,
  Compass,
  Briefcase,
  Map,
  Trophy,
};

// ─── 텍스트 라벨 (i18n 확장 대비 key → string) ────────────────
export const LABELS: Record<string, string> = {
  // 슬라이드 제목
  slide_discover_title:        '나를 발견하는 여정',
  slide_explore_title:         '8개의 별(직업)을 탐험하세요',
  slide_job_experience_title:  '직업을 생생하게 체험해봐요',
  slide_career_builder_title:  '클릭 한 번으로 커리어 패스 완성',
  slide_success_title:         '꿈의 대학·직장으로 가는 지름길',

  // 슬라이드 서브타이틀
  slide_discover_subtitle:        'RIASEC Personality Discovery',
  slide_explore_subtitle:         'Star Explorer',
  slide_job_experience_subtitle:  'Job Experience Simulator',
  slide_career_builder_subtitle:  'One-Click Career Path',
  slide_success_subtitle:         'Your Success Story Starts Here',

  // 슬라이드 설명
  slide_discover_description:
    '30개 상황형 질문에 답하면\n숨겨진 직업 본능이 깨어납니다',
  slide_explore_description:
    '기술, 과학, 예술, 사회, 경영 등\n직업의 별에서 모험을 시작하세요',
  slide_job_experience_description:
    '주요 일과부터 직무 프로세스까지\n실제 직업인의 하루를 경험하세요',
  slide_career_builder_description:
    '목표 직업 선택만 하면\nAI가 활동·수상·자격증 계획을 자동 생성!',
  slide_success_description:
    '체계적인 커리어 패스로\n입시 생기부·포트폴리오를 완벽하게 준비하세요',

  // 프로세스 스텝 라벨
  step_daily_schedule:    '주요 일과',
  step_work_process:      '직무 프로세스',
  step_career_timeline:   '커리어 타임라인',
  step_goal_job:          '목표 직업 선택',
  step_todo_list:         'TODO 리스트',
  step_one_click_plan:    '원클릭 계획',

  // UI 공통
  btn_next:            '다음',
  btn_start:           '지금 시작하기',
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
