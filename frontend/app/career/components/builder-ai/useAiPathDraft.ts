'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { YearPlan } from '../CareerPathBuilder';
import {
  AI_PATH_CONFIG,
  AiQuotaError,
  addBalanceGoal,
  getOperationCost,
  hasAiContent,
  postAiPathGenerate,
  postAiPathRegenerateYear,
  readAiCredits,
  writeAiCredits,
  summarizeDraft,
  type AiIntensityId,
  type AiPathDraftRequest,
  type AiPathSelection,
  type AiStyleId,
} from '../../utils/aiPathGenerator';
import type { AiDraftContextValue } from './AiDraftContext';

export type BuilderStartMode = 'choose' | 'auto-form' | 'edit';
export type AiDraftError = { kind: 'quota' | 'general'; message: string } | null;

const EMPTY_SELECTION: AiPathSelection = {
  currentGradeId: '',
  horizonId: '',
  styleIds: [],
  intensityId: 'normal',
  freeText: '',
};

const MAX_HISTORY = 10;

type Params = {
  starId: string;
  jobId: string;
  jobName: string;
  yearPlans: YearPlan[];
  setYearPlans: (years: YearPlan[]) => void;
  hasInitialYears: boolean;
};

export function useAiPathDraft({ starId, jobId, jobName, yearPlans, setYearPlans, hasInitialYears }: Params) {
  const [startMode, setStartMode] = useState<BuilderStartMode>(hasInitialYears ? 'edit' : 'choose');
  const [selection, setSelection] = useState<AiPathSelection>(EMPTY_SELECTION);
  const [generatedSelection, setGeneratedSelection] = useState<AiPathSelection | null>(null);
  const [variant, setVariant] = useState(0);
  const [busyTarget, setBusyTarget] = useState<string | null>(null);
  const [error, setError] = useState<AiDraftError>(null);
  const [history, setHistory] = useState<YearPlan[][]>([]);
  const [credits, setCredits] = useState<number>(AI_PATH_CONFIG.pricing.freeTrialCredits);
  const [assumptions, setAssumptions] = useState<string[]>([]);

  useEffect(() => {
    setCredits(readAiCredits());
  }, []);

  const buildRequest = useCallback(
    (sel: AiPathSelection, v: number): AiPathDraftRequest => ({ ...sel, starId, jobId, jobName, variant: v }),
    [starId, jobId, jobName],
  );

  const pushHistory = useCallback(() => {
    setHistory((h) => [...h, yearPlans].slice(-MAX_HISTORY));
  }, [yearPlans]);

  const run = useCallback(
    async (target: string, task: () => Promise<{ years: YearPlan[]; quota_remaining_after: number; assumptions: string[] }>) => {
      if (busyTarget) return false;
      setBusyTarget(target);
      setError(null);
      try {
        const res = await task();
        pushHistory();
        setYearPlans(res.years);
        setCredits(res.quota_remaining_after);
        setAssumptions(res.assumptions);
        return true;
      } catch (e) {
        setError(
          e instanceof AiQuotaError
            ? { kind: 'quota', message: AI_PATH_CONFIG.pricing.emptyDesc }
            : { kind: 'general', message: '초안을 만들지 못했어요. 잠시 후 다시 시도해 주세요.' },
        );
        return false;
      } finally {
        setBusyTarget(null);
      }
    },
    [busyTarget, pushHistory, setYearPlans],
  );

  /** 폼에서 "생성" — 기존 여정이 있으면 고정 항목만 남기고 새로 만든다 */
  const generate = useCallback(async () => {
    const isFirst = !generatedSelection;
    const nextVariant = isFirst ? 0 : variant + 1;
    const ok = await run('all', () =>
      postAiPathGenerate(buildRequest(selection, nextVariant), isFirst ? 'generate' : 'regenerateAll', yearPlans),
    );
    if (ok) {
      setVariant(nextVariant);
      setGeneratedSelection(selection);
      setStartMode('edit');
    }
  }, [buildRequest, generatedSelection, run, selection, variant, yearPlans]);

  const regenerateAll = useCallback(async () => {
    if (!generatedSelection) return;
    const nextVariant = variant + 1;
    const ok = await run('all', () => postAiPathGenerate(buildRequest(generatedSelection, nextVariant), 'regenerateAll', yearPlans));
    if (ok) setVariant(nextVariant);
  }, [buildRequest, generatedSelection, run, variant, yearPlans]);

  const changeIntensity = useCallback(
    async (intensityId: AiIntensityId) => {
      if (!generatedSelection || generatedSelection.intensityId === intensityId) return;
      const next = { ...generatedSelection, intensityId };
      const ok = await run('all', () => postAiPathGenerate(buildRequest(next, variant), 'changeIntensity', yearPlans));
      if (ok) {
        setGeneratedSelection(next);
        setSelection(next);
      }
    },
    [buildRequest, generatedSelection, run, variant, yearPlans],
  );

  const regenerateYear = useCallback(
    async (gradeId: string, expand: boolean) => {
      if (!generatedSelection) return;
      const nextVariant = expand ? variant : variant + 1;
      const ok = await run(gradeId, () =>
        postAiPathRegenerateYear(buildRequest(generatedSelection, nextVariant), yearPlans, gradeId, expand ? 'expandYear' : 'regenerateYear'),
      );
      if (ok) setVariant(nextVariant);
    },
    [buildRequest, generatedSelection, run, variant, yearPlans],
  );

  const addBalance = useCallback(
    (styleId: AiStyleId): string | null => {
      const result = addBalanceGoal(yearPlans, styleId, starId, generatedSelection ? buildRequest(generatedSelection, variant) : null);
      if (!result) return null;
      pushHistory();
      setYearPlans(result.years);
      return result.gradeId;
    },
    [buildRequest, generatedSelection, pushHistory, setYearPlans, starId, variant, yearPlans],
  );

  const undo = useCallback(() => {
    if (history.length === 0) return;
    setYearPlans(history[history.length - 1]);
    setHistory(history.slice(0, -1));
  }, [history, setYearPlans]);

  /** 더미 단계 전용 — 체험 크레딧을 처음 값으로 되돌린다 */
  const resetTestCredits = useCallback(() => {
    writeAiCredits(AI_PATH_CONFIG.pricing.freeTrialCredits);
    setCredits(AI_PATH_CONFIG.pricing.freeTrialCredits);
    setError(null);
  }, []);

  const openAutoForm = useCallback(() => {
    setError(null);
    setStartMode('auto-form');
  }, []);

  const startManual = useCallback(() => {
    setError(null);
    setStartMode('edit');
  }, []);

  const isAiDraft = !!generatedSelection || hasAiContent(yearPlans);

  const summary = useMemo(
    () => (generatedSelection ? summarizeDraft(buildRequest(generatedSelection, variant), yearPlans).summary : ''),
    [buildRequest, generatedSelection, variant, yearPlans],
  );

  const contextValue: AiDraftContextValue = useMemo(
    () => ({
      enabled: !!generatedSelection,
      busyTarget,
      credits,
      costOf: getOperationCost,
      regenerateYear: (gradeId: string) => void regenerateYear(gradeId, false),
      expandYear: (gradeId: string) => void regenerateYear(gradeId, true),
    }),
    [busyTarget, credits, generatedSelection, regenerateYear],
  );

  return {
    startMode, setStartMode, openAutoForm, startManual,
    selection, setSelection, generatedSelection,
    busyTarget, error, clearError: () => setError(null),
    credits, assumptions, summary, isAiDraft,
    canUndo: history.length > 0,
    resetTestCredits,
    generate, regenerateAll, changeIntensity, addBalance, undo,
    contextValue,
  };
}

export type AiPathDraftController = ReturnType<typeof useAiPathDraft>;
