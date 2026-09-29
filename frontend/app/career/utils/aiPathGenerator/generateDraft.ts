import goalRecommendedItems from '@/data/goal-recommended-items.json';
import { loadAllKingdomJobs } from '@/lib/data/loadAllKingdomJobs';
import { buildStructuredCareerItem } from '@/data/path-templates/career-item-structure';
import type { GoalActivityGroup, ItemType, PlanItem, YearPlan } from '../../components/CareerPathBuilder';
import { GRADE_YEARS } from '../../config';
import {
  AI_PATH_CONFIG as C,
  fillTemplate,
  getIntensity,
  getStyleOption,
  type AiHorizonOption,
  type AiSeedItem,
} from './config';
import type {
  AiAlternativeItem,
  AiDetailLevel,
  AiItemSource,
  AiPathDraftRequest,
  AiStageId,
  AiStyleId,
} from './types';

type Milestone = {
  period: string;
  semester?: string;
  title: string;
  activities?: string[];
  achievement?: string;
  cost?: string;
  setak?: string | string[];
  awards?: string[];
};

type RecommendedGoal = {
  tagline?: string;
  keywords?: string[];
  category?: string;
  groups: Record<string, { label?: string; items: AiSeedItem[] }>;
};

const RECOMMENDED_GOALS = (goalRecommendedItems as unknown as { goals: Record<string, RecommendedGoal> }).goals;
const GRADE_ORDER: Record<string, number> = Object.fromEntries(GRADE_YEARS.map((g) => [g.id, g.order]));
const MAX_ALTERNATIVES = 3;

const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
const gradeLabel = (gradeId: string) => GRADE_YEARS.find((g) => g.id === gradeId)?.label ?? gradeId;
const stageOf = (gradeId: string): AiStageId => C.stageByGrade[gradeId] ?? 'high';
const stageIndex = (stage: AiStageId) => C.stageOrder.indexOf(stage);

/* ─── 학년 범위 ─── */

export function getAvailableHorizons(currentGradeId: string): AiHorizonOption[] {
  const current = GRADE_ORDER[currentGradeId] ?? 0;
  return C.questions.horizon.options.filter((o) => (GRADE_ORDER[o.endGradeId] ?? 0) >= current);
}

export function resolveGradeRange(currentGradeId: string, horizonId: string): string[] {
  const start = GRADE_ORDER[currentGradeId];
  if (!start) return [];
  const horizon = C.questions.horizon.options.find((o) => o.id === horizonId);
  const end = Math.max(start, GRADE_ORDER[horizon?.endGradeId ?? currentGradeId] ?? start);
  return GRADE_YEARS.filter((g) => g.id !== 'general' && g.order >= start && g.order <= end).map((g) => g.id);
}

/* ─── 직업 로드맵 ─── */

function getJobMilestones(jobId: string): Milestone[] {
  const job = loadAllKingdomJobs().find((j) => j.id === jobId) as
    | { careerTimeline?: { milestones?: Milestone[] } }
    | undefined;
  return job?.careerTimeline?.milestones ?? [];
}

function groupMilestonesByGrade(milestones: Milestone[]): Record<string, Milestone[]> {
  const byGrade: Record<string, Milestone[]> = {};
  milestones.forEach((m) => {
    const gradeId = C.periodToGrade[m.period];
    if (!gradeId) return;
    (byGrade[gradeId] ??= []).push(m);
  });
  return byGrade;
}

/** 해당 학년 뒤에 오는 첫 마일스톤 — 역산 이유 문구에 사용 */
function findNextMilestone(milestones: Milestone[], gradeId: string, after?: Milestone): Milestone | undefined {
  if (after) {
    const idx = milestones.indexOf(after);
    return idx >= 0 ? milestones[idx + 1] : undefined;
  }
  const order = GRADE_ORDER[gradeId] ?? 0;
  return milestones.find((m) => (GRADE_ORDER[C.periodToGrade[m.period]] ?? 0) > order);
}

/* ─── 아이템 변환 ─── */

function inferType(text: string, fallback: string = 'activity'): ItemType {
  const rule = C.typeRules.find((r) => new RegExp(r.pattern, 'i').test(text));
  return (rule?.type ?? fallback) as ItemType;
}

function splitActivityText(text: string): { title: string; description: string } {
  const cleaned = text.replace(/\s*\([^)]*\)/g, '').trim();
  return { title: cleaned.length > 38 ? `${cleaned.slice(0, 37)}…` : cleaned, description: text };
}

function toAlternative(seed: AiSeedItem, reason: string, source: AiItemSource): AiAlternativeItem {
  const structured = buildStructuredCareerItem({
    type: seed.type ?? 'activity',
    title: seed.title,
    description: seed.description,
    url: seed.url,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    categoryTags: seed.categoryTags as any,
  });
  return {
    type: (seed.type ?? 'activity') as ItemType,
    title: seed.title,
    months: seed.months?.length ? seed.months : [3],
    difficulty: seed.difficulty ?? 2,
    cost: seed.cost ?? '무료',
    organizer: seed.organizer ?? '',
    url: structured.url,
    links: structured.links,
    description: seed.description,
    categoryTags: structured.categoryTags,
    activitySubtype: structured.activitySubtype,
    aiReason: reason,
    aiSource: source,
  };
}

function toPlanItem(alt: AiAlternativeItem, alternatives: AiAlternativeItem[]): PlanItem {
  return { ...alt, id: uid('ai-item'), subItems: [], aiAlternatives: alternatives.slice(0, MAX_ALTERNATIVES) };
}

/** 후보 목록에서 count개를 뽑고 나머지는 교체 후보로 돌린다 */
function pickWithAlternatives(
  pool: AiAlternativeItem[],
  count: number,
  variant: number,
  extraAlternatives: AiAlternativeItem[] = [],
): PlanItem[] {
  if (pool.length === 0) return [];
  const offset = pool.length > count ? variant % pool.length : 0;
  const rotated = [...pool.slice(offset), ...pool.slice(0, offset)];
  const chosen = rotated.slice(0, count);
  const chosenTitles = new Set(chosen.map((c) => c.title));
  const rest = [...rotated.slice(count), ...extraAlternatives].filter((a) => !chosenTitles.has(a.title));
  return chosen.map((c, i) => {
    const shifted = [...rest.slice(i % Math.max(rest.length, 1)), ...rest.slice(0, i % Math.max(rest.length, 1))];
    return toPlanItem(c, shifted);
  });
}

/* ─── 목표 그룹 만들기 ─── */

type BuildContext = {
  request: AiPathDraftRequest;
  milestones: Milestone[];
  byGrade: Record<string, Milestone[]>;
  usedStyleGoals: Set<string>;
};

function flattenRecommendedGoal(goalName: string): AiSeedItem[] {
  const goal = RECOMMENDED_GOALS[goalName];
  if (!goal) return [];
  const groups = Object.values(goal.groups).map((g) => g.items ?? []);
  const out: AiSeedItem[] = [];
  const longest = Math.max(0, ...groups.map((g) => g.length));
  // 준비 → 실행 → 결과물이 고르게 섞이도록 그룹을 돌아가며 뽑는다
  for (let i = 0; i < longest; i += 1) groups.forEach((g) => { if (g[i]) out.push(g[i]); });
  return out;
}

function styleGoalCandidates(styleId: AiStyleId, starId: string, stage: AiStageId): string[] {
  const map = C.styleGoals[styleId] ?? {};
  const list = map[starId] ?? map.default ?? [];
  const level = C.styleGoalLevelByStage[stage] ?? 0;
  const ordered: string[] = [];
  for (let l = level; l >= 0; l -= 1) if (list[l] && !ordered.includes(list[l])) ordered.push(list[l]);
  // 같은 방식의 기본 목록도 후보로 추가해 학년이 많아도 겹치지 않게 한다
  const fallback = map.default ?? [];
  for (let l = level; l >= 0; l -= 1) if (fallback[l] && !ordered.includes(fallback[l])) ordered.push(fallback[l]);
  return ordered;
}

function allowedStyles(styleIds: AiStyleId[], stage: AiStageId): AiStyleId[] {
  return styleIds.filter((id) => {
    const opt = getStyleOption(id);
    return opt ? stageIndex(opt.minStage) <= stageIndex(stage) : false;
  });
}

export function buildStyleGoalGroup(
  styleId: AiStyleId,
  gradeId: string,
  starId: string,
  usedGoals: Set<string>,
  itemCount: number,
  variant: number,
  source: AiItemSource = 'style',
): GoalActivityGroup | null {
  const stage = stageOf(gradeId);
  const goalName = styleGoalCandidates(styleId, starId, stage).find((n) => !usedGoals.has(n));
  if (!goalName) return null;
  const styleLabel = getStyleOption(styleId)?.label ?? styleId;
  const reason =
    source === 'balance'
      ? C.reasons.balance
      : fillTemplate(C.reasons.style, { style: styleLabel, grade: gradeLabel(gradeId) });
  const pool = flattenRecommendedGoal(goalName).map((seed) => toAlternative(seed, reason, source));
  const items = pickWithAlternatives(pool, itemCount, variant);
  if (items.length === 0) return null;
  usedGoals.add(goalName);
  return { id: uid('ai-goal'), goal: goalName, items, isExpanded: true, aiSource: source, aiReason: reason };
}

function milestoneToGroup(ctx: BuildContext, gradeId: string, m: Milestone, itemCount: number): GoalActivityGroup {
  const { request } = ctx;
  const next = findNextMilestone(ctx.milestones, gradeId, m);
  const reason = next
    ? fillTemplate(C.reasons.milestoneNext, {
        grade: gradeLabel(gradeId),
        semester: m.semester ?? '',
        achievement: m.achievement ?? m.title,
        nextGrade: next.period,
        nextTitle: next.title,
      })
    : fillTemplate(C.reasons.milestoneLast, { job: request.jobName, achievement: m.achievement ?? m.title });

  const monthSlots = C.semesterMonths[m.semester ?? ''] ?? C.semesterMonths.default;
  const difficulty = Math.min(5, Math.max(1, stageIndex(stageOf(gradeId)) + 2));
  const cost = !m.cost || m.cost.includes('무료') ? '무료' : `학기 합계 ${m.cost}`;
  const setak = Array.isArray(m.setak) ? m.setak : m.setak ? [m.setak] : [];
  const texts = [...(m.activities ?? []), ...setak, ...(m.awards ?? []).map((a) => `도전 목표: ${a}`)]
    .filter((t): t is string => typeof t === 'string' && t.trim().length > 0);
  const pool: AiAlternativeItem[] = texts.map((text, i) => {
    const { title, description } = splitActivityText(text);
    return toAlternative(
      { title, description, months: monthSlots[i % monthSlots.length], type: inferType(text), cost, organizer: '', difficulty },
      reason,
      'milestone',
    );
  });

  // 교체 후보가 모자라면 같은 왕국의 프로젝트 추천에서 채운다
  const extraGoal = styleGoalCandidates('project', request.starId, stageOf(gradeId))[0];
  const extra = flattenRecommendedGoal(extraGoal ?? '').map((seed) =>
    toAlternative(seed, fillTemplate(C.reasons.style, { style: '프로젝트·만들기', grade: gradeLabel(gradeId) }), 'style'),
  );

  return {
    id: uid('ai-goal'),
    goal: m.title,
    items: pickWithAlternatives(pool, itemCount, request.variant, extra),
    isExpanded: true,
    aiSource: 'milestone',
    aiReason: reason,
  };
}

function foundationToGroups(ctx: BuildContext, gradeId: string, itemCount: number) {
  const { request } = ctx;
  const stage = stageOf(gradeId) === 'high' ? 'mid' : (stageOf(gradeId) as 'elemLow' | 'elemHigh' | 'mid');
  const set = (C.foundation[request.starId] ?? C.foundation.explore)[stage];
  // 같은 단계의 두 학년(초3·초4 등)이 같은 내용을 받지 않도록 번갈아 배정한다
  const sameStageGrades = GRADE_YEARS.filter((g) => C.stageByGrade[g.id] === stageOf(gradeId)).map((g) => g.id);
  const goalIdx = Math.max(0, sameStageGrades.indexOf(gradeId)) % set.goals.length === 0 ? 0 : 1;
  const primary = set.goals[goalIdx] ?? set.goals[0];
  const other = set.goals[goalIdx === 0 ? 1 : 0];
  const reason = fillTemplate(C.reasons.foundation, { job: request.jobName, grade: gradeLabel(gradeId) });
  const pool = primary.items.map((seed) => toAlternative(seed, reason, 'foundation'));
  const extra = (other?.items ?? []).map((seed) => toAlternative(seed, reason, 'foundation'));
  const group: GoalActivityGroup = {
    id: uid('ai-goal'),
    goal: primary.goal,
    items: pickWithAlternatives(pool, Math.min(itemCount, 3), request.variant, extra),
    isExpanded: true,
    aiSource: 'foundation',
    aiReason: reason,
  };
  return { group, theme: set.theme, themeReason: set.themeReason };
}

/* ─── 자유 입력 반영 (2단계 개인화 더미) ─── */

function buildFreeTextGroup(ctx: BuildContext, gradeId: string, itemCount: number): GoalActivityGroup | null {
  const text = ctx.request.freeText.trim();
  if (!text) return null;
  const tokens = Array.from(new Set(text.split(/[\s,.!?·/()'"“”~]+/).map((t) => t.replace(/(을|를|이|가|은|는|에|의|도|로|과|와|만)$/u, '')).filter((t) => t.length >= 2 && !C.freeTextStopwords.includes(t))));
  const level = C.styleGoalLevelByStage[stageOf(gradeId)] ?? 0;
  let best: { name: string; score: number; keyword: string } | null = null;
  Object.entries(RECOMMENDED_GOALS).forEach(([name, goal]) => {
    if (ctx.usedStyleGoals.has(name)) return;
    // 초등 단계에는 논문·자격증 같은 무거운 목표를 붙이지 않는다
    if (level === 0 && ['research', 'certification', 'competition'].includes(goal.category ?? '')) return;
    const keywords = (goal.keywords ?? []).map((k) => k.toLowerCase());
    const goalName = name.toLowerCase();
    let score = 0;
    let keyword = '';
    tokens.forEach((t) => {
      const token = t.toLowerCase();
      const byKeyword = keywords.some((k) => k.includes(token) || (k.length >= 2 && token.includes(k)));
      const byName = goalName.includes(token);
      if (byKeyword || byName) {
        score += byKeyword ? 2 : 1;
        keyword = keyword || t;
      }
    });
    if (score > 0 && (!best || score > best.score)) best = { name, score, keyword };
  });

  const matched = best as { name: string; score: number; keyword: string } | null;
  if (matched) {
    const reason = fillTemplate(C.reasons.freeTextMatch, { keyword: matched.keyword });
    const pool = flattenRecommendedGoal(matched.name).map((seed) => toAlternative(seed, reason, 'freeText'));
    ctx.usedStyleGoals.add(matched.name);
    return { id: uid('ai-goal'), goal: matched.name, items: pickWithAlternatives(pool, itemCount, ctx.request.variant), isExpanded: true, aiSource: 'freeText', aiReason: reason };
  }
  const topic = tokens[0] ?? text;
  const short = topic.length > 18 ? `${topic.slice(0, 17)}…` : topic;
  const reason = C.reasons.freeTextFallback;
  const pool = C.freeTextFallbackGoal.items.map((seed) => toAlternative(seed, reason, 'freeText'));
  return {
    id: uid('ai-goal'),
    goal: fillTemplate(C.freeTextFallbackGoal.goalTemplate, { text: short }),
    items: pickWithAlternatives(pool, Math.min(itemCount, pool.length), 0),
    isExpanded: true,
    aiSource: 'freeText',
    aiReason: reason,
  };
}

/* ─── 학년 1개 만들기 ─── */

function buildYear(ctx: BuildContext, gradeId: string, yearIndex: number, detail: AiDetailLevel): YearPlan {
  const { request } = ctx;
  const intensity = getIntensity(request.intensityId);
  const isOutline = detail === 'outline';
  const milestoneItemCount = isOutline ? intensity.outlineItems : intensity.milestoneItems;
  const styleGoalCount = isOutline ? intensity.outlineStyleGoals : intensity.styleGoals;
  const styleItemCount = isOutline ? Math.max(1, intensity.outlineItems) : intensity.styleItems;

  const goalGroups: GoalActivityGroup[] = [];
  let theme = '';
  let themeReason = '';

  const gradeMilestones = ctx.byGrade[gradeId] ?? [];
  if (gradeMilestones.length > 0) {
    gradeMilestones.forEach((m) => goalGroups.push(milestoneToGroup(ctx, gradeId, m, milestoneItemCount)));
    theme = gradeMilestones.map((m) => m.title).join(' · ');
    const next = findNextMilestone(ctx.milestones, gradeId);
    themeReason = next
      ? fillTemplate(C.reasons.yearThemeNext, { nextGrade: next.period, nextTitle: next.title })
      : fillTemplate(C.reasons.yearThemeLast, { job: request.jobName });
  } else {
    const foundation = foundationToGroups(ctx, gradeId, milestoneItemCount);
    goalGroups.push(foundation.group);
    theme = foundation.theme;
    themeReason = foundation.themeReason;
  }

  if (yearIndex === 0) {
    const freeTextGroup = buildFreeTextGroup(ctx, gradeId, styleItemCount);
    if (freeTextGroup) goalGroups.push(freeTextGroup);
  }

  const styles = allowedStyles(request.styleIds, stageOf(gradeId));
  for (let k = 0; k < styleGoalCount && styles.length > 0; k += 1) {
    // 고른 방식이 학년마다 번갈아 들어가도록 순환시키고, 겹치면 다음 방식으로 넘긴다
    for (let attempt = 0; attempt < styles.length; attempt += 1) {
      const styleId = styles[(yearIndex + k + request.variant + attempt) % styles.length];
      const group = buildStyleGoalGroup(styleId, gradeId, request.starId, ctx.usedStyleGoals, styleItemCount, request.variant);
      if (group) {
        goalGroups.push(group);
        break;
      }
    }
  }

  return {
    gradeId,
    gradeLabel: gradeLabel(gradeId),
    semester: 'both',
    goals: goalGroups.map((g) => g.goal),
    items: [],
    goalGroups,
    semesterPlans: [],
    aiTheme: theme,
    aiThemeReason: isOutline ? `${themeReason} ${C.reasons.outlineNote}` : themeReason,
    aiDetail: detail,
  };
}

/* ─── 고정 항목 유지 ─── */

export function mergeLockedItems(previous: YearPlan | undefined, next: YearPlan): YearPlan {
  if (!previous) return next;
  const groups = [...(next.goalGroups ?? [])];
  (previous.goalGroups ?? []).forEach((oldGroup) => {
    const locked = oldGroup.items.filter((it) => it.locked);
    if (locked.length === 0) return;
    const lockedTitles = new Set(locked.map((l) => l.title));
    const idx = groups.findIndex((g) => g.goal === oldGroup.goal);
    if (idx >= 0) {
      const rest = groups[idx].items.filter((it) => !lockedTitles.has(it.title));
      const keep = Math.max(0, groups[idx].items.length - locked.length);
      groups[idx] = { ...groups[idx], items: [...locked, ...rest.slice(0, keep)] };
    } else {
      groups.unshift({ ...oldGroup, items: locked });
    }
  });
  return { ...next, goalGroups: groups, goals: groups.map((g) => g.goal) };
}

/* ─── 공개 API ─── */

function createContext(request: AiPathDraftRequest, usedGoals: string[] = []): BuildContext {
  const milestones = getJobMilestones(request.jobId);
  return { request, milestones, byGrade: groupMilestonesByGrade(milestones), usedStyleGoals: new Set(usedGoals) };
}

const detailFor = (yearIndex: number): AiDetailLevel => (yearIndex < C.detailYears ? 'detail' : 'outline');

export function generateDraftYears(request: AiPathDraftRequest, previous: YearPlan[] = []): YearPlan[] {
  const ctx = createContext(request);
  return resolveGradeRange(request.currentGradeId, request.horizonId).map((gradeId, idx) => {
    const old = previous.find((y) => y.gradeId === gradeId);
    // 사용자가 이미 자세히 펼친 학년은 다시 만들 때도 자세히 유지한다
    const detail = old?.aiDetail === 'detail' ? 'detail' : detailFor(idx);
    return mergeLockedItems(old, buildYear(ctx, gradeId, idx, detail));
  });
}

export function regenerateSingleYear(
  request: AiPathDraftRequest,
  years: YearPlan[],
  gradeId: string,
  forceDetail = false,
): YearPlan[] {
  const range = resolveGradeRange(request.currentGradeId, request.horizonId);
  const yearIndex = Math.max(0, range.indexOf(gradeId));
  const usedElsewhere = years.filter((y) => y.gradeId !== gradeId).flatMap((y) => (y.goalGroups ?? []).map((g) => g.goal));
  const ctx = createContext(request, usedElsewhere);
  return years.map((y) => {
    if (y.gradeId !== gradeId) return y;
    const detail: AiDetailLevel = forceDetail || y.aiDetail === 'detail' ? 'detail' : detailFor(yearIndex);
    return mergeLockedItems(y, buildYear(ctx, gradeId, yearIndex, detail));
  });
}

/** 목표 1개 안의 활동만 교체 후보로 돌려 다시 추천한다 (고정 항목 제외) */
export function rotateGoalItems(group: GoalActivityGroup): GoalActivityGroup {
  const taken = new Set(group.items.map((it) => it.title));
  const items = group.items.map((it) => {
    if (it.locked) return it;
    const alt = (it.aiAlternatives ?? []).find((a) => !taken.has(a.title));
    if (!alt) return it;
    taken.add(alt.title);
    return swapItemWithAlternative(it, alt);
  });
  return { ...group, items };
}

export function swapItemWithAlternative(item: PlanItem, alternative: AiAlternativeItem): PlanItem {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, subItems, aiAlternatives, locked, checked, custom, ...current } = item;
  const nextAlternatives = [
    ...(aiAlternatives ?? []).filter((a) => a.title !== alternative.title),
    current as AiAlternativeItem,
  ].slice(-MAX_ALTERNATIVES);
  return { ...alternative, id, subItems: [], aiAlternatives: nextAlternatives };
}

export function hasAiContent(years: YearPlan[]): boolean {
  return years.some((y) => !!y.aiTheme || (y.goalGroups ?? []).some((g) => !!g.aiSource));
}

export function summarizeDraft(request: AiPathDraftRequest, years: YearPlan[]) {
  const goals = years.reduce((s, y) => s + (y.goalGroups ?? []).length, 0);
  const items = years.reduce((s, y) => s + (y.goalGroups ?? []).reduce((gs, g) => gs + g.items.length, 0), 0);
  const first = years[0]?.gradeLabel ?? '';
  const last = years[years.length - 1]?.gradeLabel ?? '';
  const hasRoadmap = getJobMilestones(request.jobId).length > 0;
  return {
    summary: `${request.jobName} · ${first}${first !== last ? `→${last}` : ''} · 학년 ${years.length} · 목표 ${goals} · 활동 ${items}`,
    assumptions: [
      hasRoadmap ? '직업별 준비 경로 데이터를 학년 목표로 사용했어요.' : '직업 로드맵이 없어 왕국 공통 기초 세트를 사용했어요.',
      `가까운 ${C.detailYears}개 학년은 자세히, 이후 학년은 큰 목표만 담았어요.`,
      '대회·프로그램 일정은 해마다 달라지니 공식 페이지에서 확인하세요.',
    ],
    goals,
    items,
  };
}
