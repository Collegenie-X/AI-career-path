import type { RIASECScores, RIASECType, RIASECResult, Job, QuizQuestion } from './types';

// ============================
// RIASEC Type Labels (Korean)
// ============================
export const RIASEC_LABELS: Record<RIASECType, { name: string; description: string; icon: string; color: string }> = {
  R: { name: '실행형', description: '손으로 직접 만들고 기계를 다루는 걸 좋아해요', icon: 'Wrench', color: '#E74C3C' },
  I: { name: '탐구형', description: '궁금한 것을 분석하고 연구하는 걸 좋아해요', icon: 'Microscope', color: '#4A90D9' },
  A: { name: '예술형', description: '상상하고 창작하는 걸 좋아해요', icon: 'Palette', color: '#E91E63' },
  S: { name: '사회형', description: '사람들을 돕고 가르치는 걸 좋아해요', icon: 'Heart', color: '#F5A623' },
  E: { name: '진취형', description: '리더십을 발휘하고 도전하는 걸 좋아해요', icon: 'Rocket', color: '#FF6B35' },
  C: { name: '관습형', description: '체계적으로 정리하고 관리하는 걸 좋아해요', icon: 'ClipboardList', color: '#8E44AD' },
};

// ============================
// Score Calculation
// ============================
export function calculateRIASECScores(
  questions: QuizQuestion[],
  answers: Record<number, string>
): RIASECScores {
  const scores: RIASECScores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };

  for (const question of questions) {
    const selectedChoiceId = answers[question.id];
    if (!selectedChoiceId) continue;

    const choice = question.choices.find((c) => c.id === selectedChoiceId);
    if (!choice) continue;

    for (const [type, value] of Object.entries(choice.riasecScores)) {
      scores[type as RIASECType] += value;
    }
  }

  return scores;
}

// ============================
// Get Top Types
// ============================
export function getTopTypes(scores: RIASECScores): [RIASECType, RIASECType] {
  const sorted = (Object.entries(scores) as [RIASECType, number][])
    .sort((a, b) => b[1] - a[1]);
  return [sorted[0][0], sorted[1][0]];
}

// ============================
// Generate Keywords
// ============================
export function generateKeywords(topTypes: [RIASECType, RIASECType]): string[] {
  const keywordMap: Record<RIASECType, string[]> = {
    R: ['실용적', '활동적', '만들기 좋아하는', '도구를 잘 다루는'],
    I: ['분석적', '호기심 많은', '논리적', '탐구하는'],
    A: ['창의적', '감성적', '상상력 풍부한', '표현력 있는'],
    S: ['따뜻한', '배려심 있는', '소통 잘하는', '공감하는'],
    E: ['도전적', '리더십 있는', '설득력 있는', '추진력 있는'],
    C: ['꼼꼼한', '체계적인', '정확한', '계획적인'],
  };

  return [
    keywordMap[topTypes[0]][0],
    keywordMap[topTypes[0]][1],
    keywordMap[topTypes[1]][0],
    keywordMap[topTypes[1]][1],
  ];
}

// ============================
// Generate Full Result
// ============================
export function generateRIASECResult(
  questions: QuizQuestion[],
  answers: Record<number, string>
): RIASECResult {
  const scores = calculateRIASECScores(questions, answers);
  const topTypes = getTopTypes(scores);
  const keywords = generateKeywords(topTypes);

  return {
    scores,
    topTypes,
    keywords,
    completedAt: new Date().toISOString(),
  };
}

// ============================
// Cosine Similarity
// ============================
export function cosineSimilarity(a: RIASECScores, b: RIASECScores): number {
  const keys: RIASECType[] = ['R', 'I', 'A', 'S', 'E', 'C'];
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (const key of keys) {
    dotProduct += a[key] * b[key];
    magnitudeA += a[key] * a[key];
    magnitudeB += b[key] * b[key];
  }

  const magnitude = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);
  if (magnitude === 0) return 0;

  return dotProduct / magnitude;
}

// ============================
// Match Jobs
// ============================
export function matchJobs(
  userScores: RIASECScores,
  jobs: Job[]
): { job: Job; matchPercentage: number }[] {
  return jobs
    .map((job) => ({
      job,
      matchPercentage: Math.round(cosineSimilarity(userScores, job.riasecProfile) * 100),
    }))
    .sort((a, b) => b.matchPercentage - a.matchPercentage);
}

// ============================
// Normalize Scores (0~100)
// ============================
export function normalizeScores(scores: RIASECScores): RIASECScores {
  const maxPossible = 15; // rough max per type from 20 questions
  const normalized: RIASECScores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };

  for (const key of Object.keys(scores) as RIASECType[]) {
    normalized[key] = Math.min(100, Math.round((scores[key] / maxPossible) * 100));
  }

  return normalized;
}
