'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CareerPlan } from '@/app/career/components/CareerPathBuilder';
import {
  mapCareerPlanDetailApiToUi,
  mapCareerPlanUiToWritePayload,
  mergeUiShareFields,
} from '@/lib/career-path/mapCareerPlanApi';
import { isUuidString } from '@/lib/career-path/isUuidString';
import {
  createCareerPlanApi,
  deleteCareerPlanApi,
  fetchMyCareerPlanDetails,
  hasCareerPathBackendAuth,
  updateCareerPlanApi,
} from '@/lib/career-path/careerPathApi';
import { useTemplateApi } from '@/lib/career-path/templateApi';

/** 레거시 키 — 마이그레이션 후 제거 가능 */
export const CAREER_PLANS_STORAGE_KEY = 'career_plans_v3';

/** JWT 없이 탐색·템플릿 적용 시 로컬에만 보관 (로그인 후에는 API 목록만 사용) */
const GUEST_CAREER_PLANS_KEY = 'career_plans_guest_v1';

const careerPlansQueryKey = ['careerPlans', 'mine'] as const;

function loadGuestPlansFromStorage(): CareerPlan[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(GUEST_CAREER_PLANS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as CareerPlan[]) : [];
  } catch {
    return [];
  }
}

function persistGuestPlansToStorage(plans: CareerPlan[]): void {
  try {
    localStorage.setItem(GUEST_CAREER_PLANS_KEY, JSON.stringify(plans));
  } catch {
    // ignore quota / private mode
  }
}

async function fetchPlansForUi(): Promise<CareerPlan[]> {
  const details = await fetchMyCareerPlanDetails();
  return details.map(mapCareerPlanDetailApiToUi);
}

export type CareerPlansSource = 'api' | 'local' | 'none';

export function useCareerPlansController() {
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  const [guestPlans, setGuestPlans] = useState<CareerPlan[]>([]);

  const useBackend = mounted && hasCareerPathBackendAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || useBackend) return;
    setGuestPlans(loadGuestPlansFromStorage());
  }, [mounted, useBackend]);

  const listQuery = useQuery({
    queryKey: careerPlansQueryKey,
    queryFn: fetchPlansForUi,
    enabled: useBackend,
    staleTime: 20_000,
  });

  const plans: CareerPlan[] = useMemo(() => {
    if (useBackend) return listQuery.data ?? [];
    return guestPlans;
  }, [useBackend, listQuery.data, guestPlans]);

  const saveToBackend = useCallback(
    async (plan: CareerPlan, previous: CareerPlan | null): Promise<CareerPlan> => {
      const payload = mapCareerPlanUiToWritePayload(plan);
      const detail = isUuidString(plan.id)
        ? await updateCareerPlanApi(plan.id, payload)
        : await createCareerPlanApi(payload);
      const ui = mapCareerPlanDetailApiToUi(detail);
      return mergeUiShareFields(ui, previous ?? plan);
    },
    []
  );

  const saveMutation = useMutation({
    mutationFn: ({ plan, previous }: { plan: CareerPlan; previous: CareerPlan | null }) =>
      saveToBackend(plan, previous),
    onSuccess: () => {
      if (useBackend) queryClient.invalidateQueries({ queryKey: careerPlansQueryKey });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (planId: string) => {
      if (isUuidString(planId)) await deleteCareerPlanApi(planId);
    },
    onSuccess: () => {
      if (useBackend) queryClient.invalidateQueries({ queryKey: careerPlansQueryKey });
    },
  });

  const savePlan = useCallback(
    async (plan: CareerPlan, previousSnapshot?: CareerPlan | null) => {
      if (!useBackend) {
        let mergedResult: CareerPlan = plan;
        setGuestPlans((prev) => {
          const previous =
            previousSnapshot ?? prev.find((p) => p.id === plan.id) ?? null;
          const merged = mergeUiShareFields(plan, previous ?? plan);
          mergedResult = merged;
          const idx = prev.findIndex((p) => p.id === plan.id);
          const next =
            idx >= 0
              ? prev.map((p, i) => (i === idx ? merged : p))
              : [...prev, merged];
          persistGuestPlansToStorage(next);
          return next;
        });
        return mergedResult;
      }
      const previous =
        previousSnapshot ??
        plans.find((p) => p.id === plan.id) ??
        null;
      return saveMutation.mutateAsync({ plan, previous });
    },
    [useBackend, plans, saveMutation]
  );

  const deletePlan = useCallback(
    async (planId: string) => {
      if (!useBackend) {
        setGuestPlans((prev) => {
          const next = prev.filter((p) => p.id !== planId);
          persistGuestPlansToStorage(next);
          return next;
        });
        return;
      }
      if (isUuidString(planId)) await deleteMutation.mutateAsync(planId);
    },
    [useBackend, deleteMutation]
  );

  const updatePlanInline = useCallback(
    async (updatedPlan: CareerPlan) => {
      if (!useBackend) {
        setGuestPlans((prev) => {
          const idx = prev.findIndex((p) => p.id === updatedPlan.id);
          if (idx < 0) return prev;
          const next = [...prev];
          next[idx] = updatedPlan;
          persistGuestPlansToStorage(next);
          return next;
        });
        return;
      }
      if (!isUuidString(updatedPlan.id)) return;
      await saveMutation.mutateAsync({
        plan: updatedPlan,
        previous: plans.find((p) => p.id === updatedPlan.id) ?? updatedPlan,
      });
    },
    [useBackend, plans, saveMutation]
  );

  const useTemplate = useCallback(
    async (templateId: string, customTitle: string) => {
      if (!useBackend) {
        throw new Error('템플릿 적용(서버 복사)은 로그인이 필요합니다.');
      }
      const detail = await useTemplateApi(templateId, customTitle);
      const ui = mapCareerPlanDetailApiToUi(detail);
      await queryClient.invalidateQueries({ queryKey: careerPlansQueryKey });
      return ui;
    },
    [useBackend, queryClient]
  );

  const source: CareerPlansSource = useMemo(() => {
    if (useBackend) return 'api';
    if (guestPlans.length > 0) return 'local';
    return 'none';
  }, [useBackend, guestPlans.length]);

  return {
    plans,
    source,
    isLoading: useBackend && listQuery.isLoading,
    isError: useBackend && listQuery.isError,
    queryError: listQuery.error,
    savePlan,
    deletePlan,
    updatePlanInline,
    useTemplate,
    isSaving: saveMutation.isPending,
    refetch: listQuery.refetch,
  };
}
