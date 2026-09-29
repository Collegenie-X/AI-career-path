'use client';

import { createContext, useContext } from 'react';
import type { AiOperation } from '../../utils/aiPathGenerator';

export type AiDraftContextValue = {
  /** AI 초안이 있어서 재추천 도구를 쓸 수 있는 상태 */
  enabled: boolean;
  /** 진행 중인 작업 대상 — 'all' 또는 gradeId */
  busyTarget: string | null;
  credits: number;
  costOf: (operation: AiOperation) => number;
  regenerateYear: (gradeId: string) => void;
  expandYear: (gradeId: string) => void;
};

const noop = () => {};

const AiDraftContext = createContext<AiDraftContextValue>({
  enabled: false,
  busyTarget: null,
  credits: 0,
  costOf: () => 0,
  regenerateYear: noop,
  expandYear: noop,
});

export const AiDraftProvider = AiDraftContext.Provider;
export const useAiDraft = () => useContext(AiDraftContext);

export const AI_ACCENT = '#a855f7';
export const AI_ACCENT_SOFT = '#c4b5fd';
