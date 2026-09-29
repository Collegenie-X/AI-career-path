import rawConfig from '@/data/career/ai-path/ai-path-generator.json';
import type { AiHorizonId, AiIntensityId, AiOperation, AiStageId, AiStyleId } from './types';

export type AiSeedItem = {
  title: string;
  description?: string;
  months: number[];
  type: string;
  cost?: string;
  organizer?: string;
  difficulty?: number;
  url?: string;
  categoryTags?: string[];
};

export type AiFoundationStage = {
  theme: string;
  themeReason: string;
  goals: { goal: string; items: AiSeedItem[] }[];
};

export type AiIntensityConfig = {
  id: AiIntensityId;
  label: string;
  emoji: string;
  desc: string;
  milestoneItems: number;
  styleGoals: number;
  styleItems: number;
  outlineItems: number;
  outlineStyleGoals: number;
};

export type AiStyleOption = {
  id: AiStyleId;
  label: string;
  emoji: string;
  minStage: AiStageId;
  balanceKey: string;
};

export type AiHorizonOption = { id: AiHorizonId; label: string; emoji: string; endGradeId: string };

export type AiTestPreset = {
  id: string;
  label: string;
  emoji: string;
  currentGradeId: string;
  horizonId: AiHorizonId;
  styleIds: AiStyleId[];
  intensityId: AiIntensityId;
  freeText: string;
};

type AiPathConfig = {
  schemaVersion: number;
  pricing: {
    storageKey: string;
    freeTrialCredits: number;
    costs: Record<AiOperation, number>;
    paidBadge: string;
    freeBadge: string;
    trialNote: string;
    emptyTitle: string;
    emptyDesc: string;
    pricingRoute: string;
    /** 서버 연동 전 시연용 — 실제 결제 연동 시 false로 바꾼다 */
    allowTestReset: boolean;
    testResetLabel: string;
    mockDelayMs: [number, number];
  };
  startModes: { id: 'auto' | 'manual'; emoji: string; title: string; badge: 'paid' | 'free'; desc: string; points: string[] }[];
  questions: {
    currentGrade: { title: string; desc: string; gradeIds: string[] };
    horizon: { title: string; desc: string; options: AiHorizonOption[] };
    styles: { title: string; desc: string; options: AiStyleOption[] };
    intensity: { title: string; desc: string };
    freeText: { title: string; desc: string; placeholder: string; maxLength: number };
  };
  intensities: AiIntensityConfig[];
  detailYears: number;
  stageByGrade: Record<string, AiStageId>;
  stageOrder: AiStageId[];
  styleGoalLevelByStage: Record<AiStageId, number>;
  periodToGrade: Record<string, string>;
  semesterMonths: Record<string, number[][]>;
  typeRules: { type: string; pattern: string }[];
  reasons: Record<string, string>;
  freeTextStopwords: string[];
  freeTextFallbackGoal: { goalTemplate: string; items: AiSeedItem[] };
  balance: {
    minItemsForCheck: number;
    dominantRatio: number;
    categories: { key: string; label: string; emoji: string; styleId: AiStyleId }[];
    messages: Record<'dominant' | 'missing' | 'good' | 'tooFew', string>;
    suggestOrder: string[];
  };
  loadingMessages: string[];
  notice: string;
  testPresets: { title: string; desc: string; items: AiTestPreset[] };
  selectionSummary: { title: string; labels: Record<string, string>; empty: string };
  styleGoals: Record<AiStyleId, Record<string, string[]>>;
  foundation: Record<string, Record<'elemLow' | 'elemHigh' | 'mid', AiFoundationStage>>;
};

export const AI_PATH_CONFIG = rawConfig as unknown as AiPathConfig;

export function fillTemplate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ''));
}

export function getIntensity(id: AiIntensityId): AiIntensityConfig {
  return AI_PATH_CONFIG.intensities.find((i) => i.id === id) ?? AI_PATH_CONFIG.intensities[1];
}

export function getStyleOption(id: AiStyleId): AiStyleOption | undefined {
  return AI_PATH_CONFIG.questions.styles.options.find((s) => s.id === id);
}
