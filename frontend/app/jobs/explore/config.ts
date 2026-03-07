// ─── Configuration ───────────────────────────────────────────────

import type { DailyScheduleItem } from './types';

// ─── 일과 타입 색상 ────────────────────────────────────────────
export const SCHEDULE_TYPE_COLORS: Record<DailyScheduleItem['type'], string> = {
  morning: '#F59E0B',
  meeting: '#8B5CF6',
  work: '#10B981',
  lunch: '#F97316',
  review: '#3B82F6',
  admin: '#6B7280',
  evening: '#EC4899',
  field: '#06B6D4',
};

// ─── 일과 타입 라벨 ────────────────────────────────────────────
export const SCHEDULE_TYPE_LABELS: Record<DailyScheduleItem['type'], string> = {
  morning: '아침',
  meeting: '미팅',
  work: '작업',
  lunch: '점심',
  review: '검토',
  admin: '행정',
  evening: '저녁',
  field: '현장',
};

// ─── 홀랜드 코드 라벨 ─────────────────────────────────────────
export const HOLLAND_CODE_LABELS: Record<string, string> = {
  R: '현실형',
  I: '탐구형',
  A: '예술형',
  S: '사회형',
  E: '기업형',
  C: '관습형',
};

export const PHASE_BG_COLORS: Record<number, string> = {
  1: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  2: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  3: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  4: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  5: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
};

export const STAR_FIELD_CONFIG = {
  starCount: 40,
  xMultiplier: 137.5,
  yMultiplier: 97.3,
  sizeVariation: 3,
  delayMultiplier: 0.4,
  delayMod: 4,
  durationBase: 2,
  durationVariation: 3,
};

export const LABELS = {
  page_title: 'Job 간접 경험',
  page_subtitle: '8개 별의 직업 세계를 탐험하세요',
  star_selected_subtitle: '개 직업 프로세스 & 커리어 패스',
  intro_banner_title: '직업 세계 탐험',
  intro_banner_subtitle: '별을 선택하고 직업을 체험하세요',
  intro_banner_description: '실제 직무 프로세스와 커리어 패스를 게임처럼 경험해보세요!',
  star_grid_title: '8개 별 선택',
  jobs_title: '개 직업 체험',
  cta_title: '커리어 패스 만들기',
  cta_description: '이 별 직업의 활동·수상 계획 세우기',
  cta_button: '시작',
  coming_soon: '준비 중',
  
  // Modal
  modal_process_tab: '직무 프로세스',
  modal_daily_tab: '주요 일과',
  modal_timeline_tab: '커리어 패스',
  modal_duration: '소요 시간',
  modal_example: '실제 예시',
  modal_tools: '사용 도구',
  modal_skills: '필요 스킬',
  modal_summary: '직업 종합 정보',
  modal_salary: '연봉',
  modal_ai_risk: 'AI 대체 위험',
  modal_future_growth: '미래 성장성',
  modal_prev: '이전',
  modal_next: '다음 단계',
  modal_view_timeline: '커리어 패스 보기',
  modal_total_cost: '총 예상 비용',
  modal_key_success: '핵심 성공 지표',
  modal_step: 'STEP',

  // Hero banner
  hero_job_intro: '직업 소개',
  hero_suitable_personality: '유리한 성향',

  // Daily schedule tab
  daily_coming_soon: '이 직업의 일과 데이터를 준비 중입니다.',
  daily_note: '실제 일과는 직장 유형·상황에 따라 다를 수 있습니다. 위 일과는 대표적인 하루의 흐름을 보여줍니다.',

  // Process tab
  process_step_counter: '단계',
  process_step_label: 'STEP',

  // Timeline tab
  timeline_setak_label: '세특 포인트',
  timeline_cost_prefix: '💰 총',
  timeline_cost_inline: '💰',

  // Page header
  features_section_title: '✨ 주요 기능',

  // StarInfoBanner
  star_core_traits_title: '핵심 특성',
  star_view_more_traits: '가지 특성 보기',
  star_not_fit_title: '이런 사람은 신중하게 고려하세요',
  star_difficulty_label: '난이도',
  star_difficulty_levels: {
    '1': '매우 쉬움',
    '2': '쉬움',
    '3': '보통',
    '4': '어려움',
    '5': '매우 어려움',
  } as Record<string, string>,
  star_preparation_label: '준비 기간',
  star_preparation_unit: '년',
  star_preparation_sub_label: '평균 준비 기간',
  star_holland_code_label: 'Holland 코드',
  star_key_subjects_label: '핵심 과목',

  process_phase_badge: '단계 프로세스',
  process_step_prefix: 'STEP',

  timeline_key_success: '핵심 성공 지표',
  timeline_total_cost: '총 예상 비용',
};
