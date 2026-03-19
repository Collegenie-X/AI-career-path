import { Sparkles, Zap, Star, Heart, TrendingUp, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ─── 색상 팔레트 ───────────────────────────────────────────────
export const COLORS = {
  primary: '#6C5CE7',
  secondary: '#A78BFA',
  accent: '#F59E0B',
  success: '#10B981',
  danger: '#EF4444',
  info: '#3B82F6',
} as const;

export const GRADIENT_COLORS = {
  purple: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  blue: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  green: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  orange: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
} as const;

// ─── 아이콘 매핑 ───────────────────────────────────────────────
export const ICON_MAP: Record<string, LucideIcon> = {
  Sparkles,
  Zap,
  Star,
  Heart,
  TrendingUp,
  Users,
};

// ─── 텍스트 라벨 ───────────────────────────────────────────────
export const LABELS = {
  // 페이지 헤더
  page_title: '직업 탐색',
  page_subtitle: '나에게 맞는 직업을 찾아보세요',
  
  // 네비게이션
  nav_explore: '탐색하기',
  nav_swipe: '스와이프',
  nav_saved: '저장된 직업',
  
  // 버튼
  btn_start: '시작하기',
  btn_learn_more: '자세히 보기',
  btn_save: '저장',
  btn_saved: '저장됨',
  btn_back: '뒤로',
  
  // 통계 섹션
  stats_title: '직업 세계 통계',
  stats_jobs_count: '개 직업',
  stats_kingdoms: '개 왕국',
  stats_users: '명 탐험 중',
  
  // CTA 섹션
  cta_title: '나만의 커리어를 시작하세요',
  cta_description: '지금 바로 직업 탐색을 시작해보세요',
  cta_primary: '직업 탐색 시작',
  cta_secondary: '더 알아보기',
  
  // 섹션 헤더
  features_section_title: '✨ 주요 기능',

  // 기능 카드
  feature_explore_title: '직업 탐색',
  feature_explore_desc: '8개 왕국의 다양한 직업을 탐색하세요',
  feature_swipe_title: '스와이프 매칭',
  feature_swipe_desc: '재미있는 스와이프로 나에게 맞는 직업 찾기',
  feature_simulation_title: '하루 시뮬레이션',
  feature_simulation_desc: '실제 직업인의 하루를 체험해보세요',
  feature_path_title: '커리어 패스',
  feature_path_desc: '단계별 성장 경로를 확인하세요',
} as const;

// ─── 애니메이션 설정 ──────────────────────────────────────────
export const ANIMATION_CONFIG = {
  cardEnterDelay: 100, // ms
  cardEnterStagger: 80, // ms per item
  fadeInDuration: 300, // ms
  slideInDuration: 400, // ms
} as const;

// ─── 네비게이션 경로 ──────────────────────────────────────────
export const ROUTES = {
  explore: '/jobs/explore',
  swipe: '/jobs/swipe',
  saved: '/jobs/saved',
  detail: (id: string) => `/jobs/${id}`,
  simulation: (id: string) => `/simulation/${id}`,
  home: '/home',
} as const;

// ─── 레이아웃 설정 ────────────────────────────────────────────
export const LAYOUT = {
  maxWidth: '430px',
  padding: '16px',
  cardBorderRadius: '24px',
  buttonBorderRadius: '16px',
} as const;
