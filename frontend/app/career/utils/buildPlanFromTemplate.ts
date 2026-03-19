import type { CareerPlan } from '../components/CareerPathBuilder';
import careerPathTemplates from '@/data/career-path-templates-index';
import { buildStructuredCareerItem } from '@/data/career-item-structure';

type Template = typeof careerPathTemplates[0];

export function buildPlanFromTemplate(
  template: Template,
  customTitle: string,
): CareerPlan {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapItem = (item: any, prefix: string, iIdx: number) => buildStructuredCareerItem({
    id: item.id ?? `${prefix}-${iIdx}-${Date.now()}`,
    type: item.type ?? 'activity',
    title: item.title ?? '',
    months: Array.isArray(item.months) ? item.months : (typeof item.month === 'number' ? [item.month] : [3]),
    difficulty: item.difficulty ?? 2,
    cost: item.cost ?? '무료',
    organizer: item.organizer ?? '',
    url: item.url,
    description: item.description,
    links: item.links,
    categoryTags: item.categoryTags,
    activitySubtype: item.activitySubtype,
  });

  return {
    id: `from-template-${Date.now()}`,
    starId: template.starId,
    starName: template.starName,
    starEmoji: template.starEmoji,
    starColor: template.starColor,
    jobId: template.jobId,
    jobName: template.jobName,
    jobEmoji: template.jobEmoji,
    title: customTitle.trim().length > 0 ? customTitle.trim() : template.title,
    createdAt: new Date().toISOString(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    years: (template.years as any[]).map((y: any, yIdx: number) => {
      const goals = y.goals ?? [];
      const rawItems = y.items ?? [];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let goalGroups: { id: string; goal: string; items: any[] }[];
      if (Array.isArray(y.goalGroups) && y.goalGroups.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        goalGroups = y.goalGroups.map((g: any, gi: number) => ({
          id: g.id ?? `tpl-g-${yIdx}-${gi}-${Date.now()}`,
          goal: g.goal ?? '',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          items: (g.items ?? []).map((item: any, iIdx: number) => mapItem(item, `tpl-${y.gradeId}-g${gi}`, iIdx)),
        }));
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const items = rawItems.map((item: any, iIdx: number) => mapItem(item, `tpl-${y.gradeId}`, iIdx));
        const firstGoal = goals.length > 0 ? goals[0] : '활동 목록';
        goalGroups = items.length > 0
          ? [
              { id: `goal-${y.gradeId}-0`, goal: firstGoal, items },
              ...goals.slice(1).map((g: string, idx: number) => ({
                id: `goal-${y.gradeId}-${idx + 1}`,
                goal: g,
                items: [] as ReturnType<typeof mapItem>[],
              })),
            ]
          : goals.map((g: string, idx: number) => ({
              id: `goal-${y.gradeId}-${idx}`,
              goal: g,
              items: [] as ReturnType<typeof mapItem>[],
            }));
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const keyOf = (item: any) => {
        const id = item?.id;
        if (typeof id === 'string' && id.trim()) return `id:${id}`;
        const type = item?.type ?? 'activity';
        const title = item?.title ?? '';
        return `tt:${type}::${String(title).trim()}`;
      };
      const keysInGoalGroups = new Set<string>(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (y.goalGroups ?? []).flatMap((g: any) => (g.items ?? []).map(keyOf))
      );
      const keysInSemesterPlans = new Set<string>(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (y.semesterPlans ?? []).flatMap((sp: any) => (sp.goalGroups ?? []).flatMap((g: any) => (g.items ?? []).map(keyOf)))
      );
      const ungroupedItems =
        Array.isArray(rawItems) && rawItems.length > 0
          ? rawItems
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .filter((it: any) => !keysInGoalGroups.has(keyOf(it)) && !keysInSemesterPlans.has(keyOf(it)))
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .map((item: any, iIdx: number) => mapItem(item, `tpl-${y.gradeId}`, iIdx))
          : [];

      return {
        gradeId: y.gradeId,
        gradeLabel: y.gradeLabel,
        semester: y.semester ?? 'both',
        goals,
        items: ungroupedItems,
        goalGroups,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        semesterPlans: (y.semesterPlans ?? []).map((sp: any) => ({
          ...sp,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          goalGroups: (sp.goalGroups ?? []).map((g: any, gi: number) => ({
            ...g,
            id: g.id ?? `tpl-sp-${yIdx}-${gi}`,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            items: (g.items ?? []).map((item: any, iIdx: number) => mapItem(item, `tpl-sp-${y.gradeId}`, iIdx)),
          })),
        })),
      };
    }),
  };
}
