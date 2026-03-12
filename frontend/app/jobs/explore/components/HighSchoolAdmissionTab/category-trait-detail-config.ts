/**
 * 카테고리별 특성 상세 다이얼로그 타입 정의
 * 실제 콘텐츠는 /data/category-trait-detail.json 에서 관리합니다.
 */
import rawData from '@/data/category-trait-detail.json';

export type QuizQuestion = {
  emoji: string;
  question: string;
  focusArea: string;
  choices: QuizQuestionChoice[];
};

export type QuizQuestionChoice = {
  label: string;
  score: number;
  feedback?: string;
};

export type CategoryTraitDetailContent = {
  aptitudeFitCheck: string[];
  eliteEnvironmentFit: string[];
  selfEsteemEmphasis: string;
  additionalGuidance: string[];
  quizQuestions: QuizQuestion[];
};

export const CATEGORY_TRAIT_DETAIL: Record<string, CategoryTraitDetailContent> =
  rawData as Record<string, CategoryTraitDetailContent>;
