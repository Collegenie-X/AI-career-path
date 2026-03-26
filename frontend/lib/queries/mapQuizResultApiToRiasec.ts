import type { RIASECResult, RIASECScores, RIASECType } from '@/lib/types';

const RIASEC_KEYS: RIASECType[] = ['R', 'I', 'A', 'S', 'E', 'C'];

export type QuizResultApiPayload = {
  id: string;
  riasec_scores: Record<string, number>;
  top_type: string;
  second_type?: string;
  taken_at: string;
};

function normalizeScores(raw: Record<string, number> | undefined): RIASECScores {
  const out: RIASECScores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  if (!raw) return out;
  for (const k of RIASEC_KEYS) {
    out[k] = Number(raw[k] ?? 0);
  }
  return out;
}

export function mapQuizResultApiToRiasec(data: QuizResultApiPayload): RIASECResult {
  const scores = normalizeScores(data.riasec_scores);
  const first = (data.top_type || 'I') as RIASECType;
  const secondRaw = data.second_type?.trim();
  const second = (secondRaw && secondRaw.length > 0 ? secondRaw : first) as RIASECType;
  return {
    scores,
    topTypes: [first, second],
    keywords: [],
    completedAt: data.taken_at,
  };
}
