import type { YearPlan } from '../../components/CareerPathBuilder';
import { AI_PATH_CONFIG as C, fillTemplate, getStyleOption } from './config';
import { buildStyleGoalGroup } from './generateDraft';
import type { AiPathDraftRequest, AiStyleId } from './types';

export type BalanceReport = {
  total: number;
  counts: { key: string; label: string; emoji: string; count: number }[];
  status: 'tooFew' | 'dominant' | 'missing' | 'good';
  message: string;
  suggestion?: { styleId: AiStyleId; label: string };
};

const TAG_TO_KEY: Record<string, string> = {
  project: 'project',
  reading: 'reading',
  paper: 'research',
  award: 'competition',
  volunteer: 'service',
  campaign: 'service',
};

function allItems(years: YearPlan[]) {
  return years.flatMap((y) => [
    ...(y.goalGroups ?? []).flatMap((g) => g.items ?? []),
    ...(y.semesterPlans ?? []).flatMap((sp) => (sp.goalGroups ?? []).flatMap((g) => g.items ?? [])),
  ]);
}

export function computeBalance(years: YearPlan[]): BalanceReport {
  const items = allItems(years);
  const tally: Record<string, number> = {};
  items.forEach((item) => {
    const keys = new Set<string>();
    if (item.type === 'certification') keys.add('certification');
    if (item.type === 'award') keys.add('competition');
    (item.categoryTags ?? []).forEach((tag) => { if (TAG_TO_KEY[tag]) keys.add(TAG_TO_KEY[tag]); });
    keys.forEach((k) => { tally[k] = (tally[k] ?? 0) + 1; });
  });
  const counts = C.balance.categories.map((c) => ({ key: c.key, label: c.label, emoji: c.emoji, count: tally[c.key] ?? 0 }));
  const total = items.length;
  const { messages, minItemsForCheck, dominantRatio, suggestOrder } = C.balance;

  const missingKey = suggestOrder.find((k) => (tally[k] ?? 0) === 0);
  const missing = C.balance.categories.find((c) => c.key === missingKey);
  const suggestion = missing ? { styleId: missing.styleId, label: missing.label } : undefined;

  if (total < minItemsForCheck) {
    return { total, counts, status: 'tooFew', message: fillTemplate(messages.tooFew, { n: minItemsForCheck }) };
  }
  const top = [...counts].sort((a, b) => b.count - a.count)[0];
  if (top && top.count / total > dominantRatio) {
    return {
      total, counts, status: 'dominant', suggestion,
      message: fillTemplate(messages.dominant, { label: top.label, pct: Math.round((top.count / total) * 100) }),
    };
  }
  // 독서·프로젝트·봉사처럼 기본이 되는 유형이 비어 있을 때만 알린다
  const coreMissing = C.balance.categories.find((c) => ['reading', 'project', 'service'].includes(c.key) && (tally[c.key] ?? 0) === 0);
  if (coreMissing) {
    return {
      total, counts, status: 'missing',
      suggestion: { styleId: coreMissing.styleId, label: coreMissing.label },
      message: fillTemplate(messages.missing, { label: coreMissing.label }),
    };
  }
  return { total, counts, status: 'good', message: messages.good };
}

/** 부족한 유형의 목표 1개를 가장 가까운 학년에 추가한다 */
export function addBalanceGoal(
  years: YearPlan[],
  styleId: AiStyleId,
  starId: string,
  request?: AiPathDraftRequest | null,
): { years: YearPlan[]; gradeId: string } | null {
  const minStage = getStyleOption(styleId)?.minStage ?? 'elemLow';
  const used = new Set(years.flatMap((y) => (y.goalGroups ?? []).map((g) => g.goal)));
  const sorted = [...years].filter((y) => y.semester !== 'split');
  for (const year of sorted) {
    const stage = C.stageByGrade[year.gradeId] ?? 'high';
    if (C.stageOrder.indexOf(stage) < C.stageOrder.indexOf(minStage)) continue;
    const group = buildStyleGoalGroup(styleId, year.gradeId, starId, used, 2, request?.variant ?? 0, 'balance');
    if (!group) continue;
    return {
      gradeId: year.gradeId,
      years: years.map((y) =>
        y.gradeId === year.gradeId
          ? { ...y, semester: y.semester || 'both', goalGroups: [...(y.goalGroups ?? []), group], goals: [...(y.goals ?? []), group.goal] }
          : y,
      ),
    };
  }
  return null;
}
