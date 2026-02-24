import { Brain, Clock, HelpCircle, Target, Lightbulb, Zap, Shield, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface StatItem {
  icon: LucideIcon;
  label: string;
  desc: string;
  color: string;
}

export interface TipItem {
  icon: LucideIcon;
  text: string;
}

export const STAT_ITEMS: StatItem[] = [
  { icon: HelpCircle, label: '30문항', desc: '상황 기반 선택형', color: '#6C5CE7' },
  { icon: Clock, label: '5~7분', desc: '소요 시간', color: '#3B82F6' },
  { icon: Brain, label: 'RIASEC', desc: '6가지 유형 분석', color: '#22C55E' },
  { icon: Target, label: 'TOP 5', desc: '맞춤 직업 추천', color: '#FBBF24' },
];

export const TIPS: TipItem[] = [
  { icon: Lightbulb, text: '정답이 없어요. 편하게 골라주세요!' },
  { icon: Zap, text: '직감적으로 빠르게 선택하면 더 정확해요' },
  { icon: Shield, text: '솔직할수록 나에게 맞는 결과가 나와요' },
];

export const LABELS: Record<string, string> = {
  title: '적성 검사',
  subtitle: '나의 숨겨진 재능을 깨워보세요',
  reward_title: '검사 완료 보상',
  reward_desc: '+100 XP, RIASEC 유형 카드 획득',
  reward_badge: '+100 XP',
  tips_title: 'Quest Tips',
  cta_button: '퀘스트 시작',
  cta_note: '언제든 중단하고 이어서 할 수 있어요',
};

export const ROUTES = {
  back: '/onboarding',
  quiz: '/quiz',
} as const;

export const ANIMATION_CONFIG = {
  particleCount: 8,
  fadeInDelay: 100,
  staggerDelay: 150,
} as const;
