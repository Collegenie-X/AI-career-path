// ─── Career Path Feature Configuration ───────────────────────────

export const LABELS = {
  // Page
  page_title: '커리어 패스',
  page_subtitle: '나만의 진로 로드맵을 설계하세요',

  // Tabs
  tab_explore: '탐색',
  tab_builder: '빌더',
  tab_timeline: '타임라인',

  // Explore (List)
  explore_title: '커리어 패스 탐색',
  explore_subtitle: '다른 사람의 커리어 패스를 참고하세요',
  explore_filter_all: '전체',
  explore_uses: '명 사용',
  explore_likes: '좋아요',
  explore_use_template: '이 패스 사용하기',
  explore_official: '공식',
  explore_community: '커뮤니티',
  explore_new: '새 패스 만들기',
  explore_empty: '아직 커리어 패스가 없어요',
  explore_search_placeholder: '직업, 왕국 검색...',

  // Builder - Step 1
  builder_step1_title: '별 · 직업 선택',
  builder_step1_subtitle: '어떤 직업을 목표로 하나요?',
  builder_select_star: '왕국(별) 선택',
  builder_select_job: '목표 직업 선택',
  builder_next: '다음',
  builder_prev: '이전',

  // Builder - Step 2
  builder_step2_title: '커리어 계획 추가',
  builder_step2_subtitle: '학년별로 활동·수상·자격증을 추가하세요',
  builder_add_year: '학년 추가',
  builder_add_item: '항목 추가',
  builder_add_custom: '직접 입력',
  builder_suggested: '추천 항목',
  builder_year_goal: '이 학년의 목표',
  builder_year_goal_hint: '2~3개 추천',
  builder_add_goal: '목표 추가',
  builder_select_goal_template: '목표 템플릿 선택',
  builder_done: '완성',
  builder_save: '저장',

  // Types
  type_activity: '활동',
  type_award: '수상·대회',
  type_portfolio: '작품',
  type_certification: '자격증',
  type_goal: '목표',

  // Timeline
  timeline_title: '내 커리어 타임라인',
  timeline_subtitle: 'WBS — 시간순 로드맵',
  timeline_empty: '아직 커리어 계획이 없어요',
  timeline_empty_cta: '빌더에서 시작하기',
  timeline_edit: '수정',
  timeline_delete: '삭제',
  timeline_share: '공유',
  timeline_export: '내보내기',
  timeline_total_items: '개 계획',
  timeline_months: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],

  // Grades
  grades: ['초등 4학년', '초등 5학년', '초등 6학년', '중학교 1학년', '중학교 2학년', '중학교 3학년', '고등학교 1학년', '고등학교 2학년'],
  grade_short: ['초4', '초5', '초6', '중1', '중2', '중3', '고1', '고2'],

  // Misc
  xp_gained: 'XP 획득',
  new_badge: '새 배지 획득',
  item_added: '계획에 추가되었어요!',
  loading: '불러오는 중...',
} as const;

export const COLORS = {
  primary: '#6C5CE7',
  activity: '#3B82F6',
  award: '#FBBF24',
  certification: '#22C55E',
  portfolio: '#EC4899',
  goal: '#A78BFA',
  background: 'rgba(26,26,46,0.95)',
} as const;

export const ITEM_TYPES = [
  { value: 'activity'      as const, label: '활동',   color: '#3B82F6', emoji: '🎯' },
  { value: 'award'         as const, label: '수상·대회', color: '#FBBF24', emoji: '🏆' },
  { value: 'portfolio'     as const, label: '작품',   color: '#EC4899', emoji: '🖼️' },
  { value: 'certification' as const, label: '자격증', color: '#22C55E', emoji: '📜' },
] as const;

export const GRADE_YEARS = [
  { id: 'elem4', label: '초4', fullLabel: '초등 4학년', order: 1 },
  { id: 'elem5', label: '초5', fullLabel: '초등 5학년', order: 2 },
  { id: 'elem6', label: '초6', fullLabel: '초등 6학년', order: 3 },
  { id: 'mid1', label: '중1', fullLabel: '중학교 1학년', order: 4 },
  { id: 'mid2', label: '중2', fullLabel: '중학교 2학년', order: 5 },
  { id: 'mid3', label: '중3', fullLabel: '중학교 3학년', order: 6 },
  { id: 'high1', label: '고1', fullLabel: '고등학교 1학년', order: 7 },
  { id: 'high2', label: '고2', fullLabel: '고등학교 2학년', order: 8 },
] as const;

export const ROUTES = {
  career: '/career',
  builder: '/career?tab=builder',
  timeline: '/career?tab=timeline',
  explore: '/career?tab=explore',
} as const;
