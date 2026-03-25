import { storage } from '@/lib/storage';
import type { RIASECResult } from '@/lib/types';

export const quizRiasecResultQueryKey = ['quiz', 'riasec-result'] as const;

/** localStorage에 저장된 최신 RIASEC 결과 (없으면 null) */
export function readStoredRiasecResult(): RIASECResult | null {
  return storage.riasec.get();
}
