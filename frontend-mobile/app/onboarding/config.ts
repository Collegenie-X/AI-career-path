import { Sparkles, Compass, Briefcase, Map, Trophy, Shield, type LucideIcon } from 'lucide-react';

// ─── 색상 팔레트 ───────────────────────────────────────────────
export const COLOR_PALETTE: Record<string, { base: string; light: string }> = {
  purple: { base: '#6C5CE7', light: '#a29bfe' },
  blue:   { base: '#3B82F6', light: '#93c5fd' },
  green:  { base: '#22C55E', light: '#86efac' },
  amber:  { base: '#F59E0B', light: '#fcd34d' },
  teal:   { base: '#14B8A6', light: '#5eead4' },
  pink:   { base: '#EC4899', light: '#f9a8d4' },
};

// ─── 아이콘 매핑 ───────────────────────────────────────────────
export const ICON_MAP: Record<string, LucideIcon> = {
  Sparkles,
  Compass,
  Briefcase,
  Map,
  Trophy,
  Shield,
};

// ─── 텍스트 라벨 (i18n 확장 대비 key → string) ────────────────
export const LABELS: Record<string, string> = {
  // 슬라이드 제목
  slide_discover_title:        '나를 발견하는 여정',
  slide_explore_title:         '8개의 별(직업)을 탐험하세요',
  slide_job_experience_title:  '직업을 생생하게 체험해봐요',
  slide_career_builder_title:  '클릭 한 번으로 커리어 패스 완성',
  slide_school_benefits_title: '학교 안에서만, 안전하게',
  slide_success_title:         '꿈의 대학·직장으로 가는 지름길',

  // 슬라이드 서브타이틀
  slide_discover_subtitle:        'RIASEC Personality Discovery',
  slide_explore_subtitle:         'Star Explorer',
  slide_job_experience_subtitle:  'Job Experience Simulator',
  slide_career_builder_subtitle:  'One-Click Career Path',
  slide_school_benefits_subtitle: 'School-Scoped Privacy & Benefits',
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
  slide_school_benefits_description:
    '학교 내 제한된 공간에서 프라이버시를 지키며\n커리어 패스·런치패드를 함께 써요',
  slide_success_description:
    '체계적인 커리어 패스로\n입시 생기부·포트폴리오를 완벽하게 준비하세요',

  // 프로세스 스텝 라벨
  step_daily_schedule:    '주요 일과',
  step_work_process:      '직무 프로세스',
  step_career_timeline:   '커리어 타임라인',
  step_goal_job:          '목표 직업 선택',
  step_todo_list:         'TODO 리스트',
  step_one_click_plan:    '원클릭 계획',
  benefit_school_only:    '같은 학교만',
  benefit_privacy:        '프라이버시',
  benefit_teacher_guide:  '선생님·상담 지원',
  benefit_share_path:     '학생 공유',

  // UI 공통
  btn_next:            '다음',
  btn_start:           '지금 시작하기',
  btn_skip:            '건너뛰기',
  step_indicator:      'Step',
  step_separator:      '/',

  // 프로필 입력 슬라이드
  profile_title:             '나는 누구?  자기소개 GO! 🙋',
  profile_subtitle:          'Profile Setup',
  profile_nickname_label:    '나만의 닉네임을 정해봐!',
  profile_nickname_placeholder: '예) 우주탐험가, 코딩왕, 미래의사',
  profile_nickname_hint:     '2~10자로 입력해줘 (특수문자 제외)',
  profile_school_label:      '지금 어느 학교 다니고 있어?',
  profile_grade_label:       '몇 학년이야?',
  profile_btn_complete:      '프로필 완성! 🚀',
  profile_btn_complete_disabled: '닉네임이랑 학년을 선택해줘!',

  // 학교급 라벨
  school_elementary: '초등학교',
  school_middle:     '중학교',
  school_high:       '고등학교',

  // 학년 라벨 (초등 4~6, 중등 1~3, 고등 1~3)
  grade_elem_4: '4학년',
  grade_elem_5: '5학년',
  grade_elem_6: '6학년',
  grade_mid_1:  '중 1',
  grade_mid_2:  '중 2',
  grade_mid_3:  '중 3',
  grade_high_1: '고 1',
  grade_high_2: '고 2',
  grade_high_3: '고 3',
};

// ─── 학교급 / 학년 선택 데이터 ────────────────────────────────
export type SchoolLevel = 'elementary' | 'middle' | 'high';

export const SCHOOL_LEVELS: Array<{
  id: SchoolLevel;
  labelKey: string;
  emoji: string;
  color: string;
}> = [
  { id: 'elementary', labelKey: 'school_elementary', emoji: '🏫', color: '#22C55E' },
  { id: 'middle',     labelKey: 'school_middle',     emoji: '📚', color: '#3B82F6' },
  { id: 'high',       labelKey: 'school_high',       emoji: '🎓', color: '#A855F7' },
];

export const GRADE_OPTIONS: Record<SchoolLevel, Array<{ id: string; labelKey: string }>> = {
  elementary: [
    { id: 'elem_4', labelKey: 'grade_elem_4' },
    { id: 'elem_5', labelKey: 'grade_elem_5' },
    { id: 'elem_6', labelKey: 'grade_elem_6' },
  ],
  middle: [
    { id: 'mid_1', labelKey: 'grade_mid_1' },
    { id: 'mid_2', labelKey: 'grade_mid_2' },
    { id: 'mid_3', labelKey: 'grade_mid_3' },
  ],
  high: [
    { id: 'high_1', labelKey: 'grade_high_1' },
    { id: 'high_2', labelKey: 'grade_high_2' },
    { id: 'high_3', labelKey: 'grade_high_3' },
  ],
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
