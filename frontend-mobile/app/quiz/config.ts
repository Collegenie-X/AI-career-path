import { Sparkles, Zap, Star, CheckCircle2, ArrowRight, ChevronLeft } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ─── 색상 팔레트 ───────────────────────────────────────────────
export const ZONE_COLORS: Record<string, string> = {
  '성격': '#6C5CE7',
  '흥미': '#E74C3C',
  '강점': '#27AE60',
  '가치관': '#F39C12',
  '학습': '#3498DB',
};

export function getZoneColor(zone: string): string {
  return ZONE_COLORS[zone] ?? '#6C5CE7';
}

// ─── 아이콘 매핑 ───────────────────────────────────────────────
export const ICON_MAP: Record<string, LucideIcon> = {
  Sparkles,
  Zap,
  Star,
  CheckCircle2,
  ArrowRight,
  ChevronLeft,
};

// ─── 텍스트 라벨 ───────────────────────────────────────────────
export const LABELS: Record<string, string> = {
  // 모드 선택 화면
  mode_select_title: '직업 적성 검사',
  mode_select_subtitle: '나에게 맞는 직업 유형을 발견해보세요',
  mode_quick_title: '빠른 검사',
  mode_quick_badge: '10문항',
  mode_quick_desc: '약 3~5분 • 핵심 5개 유형 탐색',
  mode_detailed_title: '정밀 검사',
  mode_detailed_badge: '30문항',
  mode_detailed_desc: '약 10~15분 • 상세 강점 리포트 제공',
  mode_recommended: '추천',
  mode_tip: '정답이 없어요! 솔직하게 답하면 더 정확해요 ✨',

  // 퀴즈 진행 화면
  quiz_analyzing: '우주 적성 데이터 분석 중...',
  quiz_xp_earned: 'XP 획득',
  quiz_progress: '진행률',

  // 피드백 오버레이
  feedback_zone_complete: '분석 완료',
  feedback_next: '다음 문제로',
  feedback_view_result: '결과 보기 🏆',

  // 선택지 라벨
  choice_letter_a: 'A',
  choice_letter_b: 'B',
  choice_letter_c: 'C',
  choice_letter_d: 'D',
};

// ─── 퀴즈 설정 ───────────────────────────────────────────────
export const QUIZ_CONFIG = {
  xpPerQuestion: 5,
  quickModeQuestions: 10,
  detailedModeQuestions: 30,
  quickModeFilter: (index: number) => index % 3 === 0, // 매 3번째 문제만
} as const;

// ─── 애니메이션 설정 ──────────────────────────────────────────
export const ANIMATION_CONFIG = {
  choiceEnterDelay: 70, // ms
  choiceEnterStagger: 70, // ms per item
  feedbackDelay: 400, // ms
  xpPopDuration: 900, // ms
} as const;

// ─── 모드 선택 아이콘 ──────────────────────────────────────────
export const MODE_ICONS = {
  quick: '⚡',
  detailed: '🔭',
  zoneIcons: ['🧠', '❤️', '💪', '🌈', '📚'],
} as const;

// ─── 네비게이션 경로 ──────────────────────────────────────────
export const ROUTES = {
  quizResults: '/quiz/results',
  home: '/home',
} as const;
