'use client';

import { useMutation } from '@tanstack/react-query';
import { postExecutionPlanAiGenerate } from '@/lib/dreammate/executionPlanAiApi';
import type { ExecutionPlanAiGenerateRequestBody } from '@/lib/dreammate/executionPlanAiTypes';

export function useExecutionPlanAiGenerate() {
  return useMutation({
    mutationFn: (body: ExecutionPlanAiGenerateRequestBody) => postExecutionPlanAiGenerate(body),
  });
}
