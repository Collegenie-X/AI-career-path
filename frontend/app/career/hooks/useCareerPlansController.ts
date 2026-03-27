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

const STORAGE_KEY = 'career_plans_v3';
export const CAREER_PLANS_STORAGE_KEY = STORAGE_KEY;

const careerPlansQueryKey = ['careerPlans', 'mine'] as const;

async function fetchPlansForUi(): Promise<CareerPlan[]> {
  const details = await fetchMyCareerPlanDetails();
  return details.map(mapCareerPlanDetailApiToUi);
}

function loadLocalPlans(): CareerPlan[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CareerPlan[];
  } catch {
    return [];
  }
}

function saveLocalPlans(plans: CareerPlan[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  } catch {
    // ignore
  }
}

export type CareerPlansSource = 'api' | 'local';

export function useCareerPlansController() {
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  const [localPlans, setLocalPlans] = useState<CareerPlan[]>([]);

  const useBackend = mounted && hasCareerPathBackendAuth();

  useEffect(() => {
    setMounted(true);
    setLocalPlans(loadLocalPlans());
  }, []);

  const listQuery = useQuery({
    queryKey: careerPlansQueryKey,
    queryFn: fetchPlansForUi,
    enabled: useBackend,
    staleTime: 20_000,
  });

  const plans: CareerPlan[] = useMemo(() => {
    if (useBackend) return listQuery.data ?? [];
    return localPlans;
  }, [useBackend, listQuery.data, localPlans]);

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
      const previous =
        previousSnapshot ??
        plans.find((p) => p.id === plan.id) ??
        null;

      if (useBackend) {
        const saved = await saveMutation.mutateAsync({ plan, previous });
        return saved;
      }

      setLocalPlans((prev) => {
        const existingIndex = prev.findIndex((p) => p.id === plan.id);
        const next =
          existingIndex >= 0
            ? prev.map((p, i) => (i === existingIndex ? plan : p))
            : [...prev, plan];
        saveLocalPlans(next);
        return next;
      });
      return plan;
    },
    [useBackend, plans, saveMutation]
  );

  const deletePlan = useCallback(
    async (planId: string) => {
      if (useBackend) {
        if (isUuidString(planId)) await deleteMutation.mutateAsync(planId);
        return;
      }
      setLocalPlans((prev) => {
        const next = prev.filter((p) => p.id !== planId);
        saveLocalPlans(next);
        return next;
      });
    },
    [useBackend, deleteMutation]
  );

  const updatePlanInline = useCallback(
    async (updatedPlan: CareerPlan) => {
      if (useBackend && isUuidString(updatedPlan.id)) {
        await saveMutation.mutateAsync({
          plan: updatedPlan,
          previous:
            plans.find((p) => p.id === updatedPlan.id) ?? updatedPlan,
        });
        return;
      }
      setLocalPlans((prev) => {
        const next = prev.map((p) => (p.id === updatedPlan.id ? updatedPlan : p));
        saveLocalPlans(next);
        return next;
      });
    },
    [useBackend, plans, saveMutation]
  );

  const useTemplate = useCallback(
    async (templateId: string, customTitle: string) => {
      if (!useBackend) {
        throw new Error('useTemplate requires backend auth');
      }
      const detail = await useTemplateApi(templateId, customTitle);
      const ui = mapCareerPlanDetailApiToUi(detail);
      await queryClient.invalidateQueries({ queryKey: careerPlansQueryKey });
      return ui;
    },
    [useBackend, queryClient]
  );

  return {
    plans,
    source: (useBackend ? 'api' : 'local') as CareerPlansSource,
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
