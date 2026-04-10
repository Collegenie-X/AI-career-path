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
  /** /quiz 진입 시 잠깐 보이는 분기 화면 */
  quiz_entry_redirecting: '불러오는 중...',

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
  saved_result_banner: '이 기기에 저장된 적성 검사 결과가 있어요',
  view_saved_result: '저장된 결과 보기',
  retake_quiz_hint: '다시 검사하면 이전 결과는 이력에 쌓입니다',

  // 퀴즈 진행 화면
  quiz_analyzing: '우주 적성 데이터 분석 중...',
  quiz_questions_loading: '문항을 불러오는 중...',
  quiz_questions_error: '문항을 불러오지 못했어요. 네트워크를 확인한 뒤 다시 시도해 주세요.',
  quiz_questions_retry: '다시 시도',
  quiz_back_to_mode_select: '모드 선택으로',
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
  /** 적성 검사 단일 진입점 — 저장 결과 있으면 results, 없으면 intro */
  quiz: '/quiz',
  quizIntro: '/quiz/intro',
  /** 모드 선택·문항 본편 */
  quizPlay: '/quiz/play',
  quizResults: '/quiz/results',
  home: '/',
  /** 결과 화면 CTA — 상단 탭「커리어 탐색」과 동일 */
  careerExplore: '/jobs/explore',
} as const;

/** 결과 화면 인트로 애니메이션 · 세션 단축 · 타이머 상한(Strict Mode 대비) */
export const QUIZ_RESULTS_INTRO_CONFIG = {
  revealMs: 2200,
  doneMs: 3000,
  failSafeMaxMs: 5500,
  sessionStorageKey: 'dreampath_quiz_results_intro_done',
} as const;
