// ─── Configuration ───────────────────────────────────────────────

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
};
