import type {
  CareerPlan,
  GoalActivityGroup,
  PlanItem,
  SemesterOption,
  SemesterPlan,
  SubItem,
  YearPlan,
} from '@/app/career/components/CareerPathBuilder';
import type { CareerItemLink } from '@/data/career-item-structure';
import { isUuidString } from '@/lib/career-path/isUuidString';

/** Django CareerPlanDetail JSON (snake_case) */
export type ApiSubItem = {
  id: string;
  title: string;
  is_done: boolean;
  url?: string | null;
  description?: string | null;
  sort_order: number;
};

export type ApiItemLink = {
  id: string;
  title: string;
  url: string;
  kind?: string | null;
  sort_order: number;
};

export type ApiPlanItem = {
  id: string;
  type: string;
  title: string;
  months: number[];
  difficulty: number;
  cost?: string | null;
  organizer?: string | null;
  url?: string | null;
  description?: string | null;
  category_tags: string[];
  activity_subtype?: string | null;
  sort_order: number;
  sub_items: ApiSubItem[];
  links: ApiItemLink[];
};

export type ApiGoalGroup = {
  id: string;
  goal: string;
  semester_id: string;
  sort_order: number;
  items: ApiPlanItem[];
};

export type ApiPlanYear = {
  id: string;
  grade_id: string;
  grade_label: string;
  semester: string;
  sort_order: number;
  goal_groups: ApiGoalGroup[];
  items: ApiPlanItem[];
};

export type ApiCareerPlanDetail = {
  id: string;
  title: string;
  description?: string | null;
  job_id: string;
  job_name: string;
  job_emoji: string;
  star_id: string;
  star_name: string;
  star_emoji: string;
  star_color: string;
  is_template: boolean;
  template_category?: string | null;
  years: ApiPlanYear[];
  created_at: string;
  updated_at: string;
};

function mapSubItemFromApi(s: ApiSubItem): SubItem {
  return {
    id: s.id,
    title: s.title,
    done: s.is_done,
    url: s.url ?? undefined,
    description: s.description ?? undefined,
  };
}

function mapPlanItemFromApi(item: ApiPlanItem): PlanItem {
  return {
    id: item.id,
    type: item.type as PlanItem['type'],
    title: item.title,
    months: Array.isArray(item.months) ? item.months : [],
    difficulty: item.difficulty ?? 2,
    cost: item.cost ?? '',
    organizer: item.organizer ?? '',
    url: item.url ?? undefined,
    description: item.description ?? undefined,
    categoryTags: (item.category_tags ?? []) as PlanItem['categoryTags'],
    activitySubtype: (item.activity_subtype ?? undefined) as PlanItem['activitySubtype'],
    subItems: (item.sub_items ?? []).map(mapSubItemFromApi),
    links: (item.links ?? []).map(
      (l): CareerItemLink => ({
        title: l.title,
        url: l.url,
        kind: (l.kind ?? undefined) as CareerItemLink['kind'],
      })
    ),
  };
}

function mapGoalGroupFromApi(gg: ApiGoalGroup): GoalActivityGroup {
  return {
    id: gg.id,
    goal: gg.goal,
    items: (gg.items ?? []).map(mapPlanItemFromApi),
  };
}

function mapYearFromApi(y: ApiPlanYear): YearPlan {
  const semester = (y.semester || 'both') as SemesterOption;
  const goalGroups = (y.goal_groups ?? []).map(mapGoalGroupFromApi);
  const ungrouped = (y.items ?? []).map(mapPlanItemFromApi);
  const goals = goalGroups.map((g) => g.goal);

  if (semester === 'split') {
    const first: GoalActivityGroup[] = [];
    const second: GoalActivityGroup[] = [];
    for (const gg of y.goal_groups ?? []) {
      const mapped = mapGoalGroupFromApi(gg);
      if (gg.semester_id === 'second') second.push(mapped);
      else first.push(mapped);
    }
    const semesterPlans: SemesterPlan[] = [
      {
        semesterId: 'first',
        semesterLabel: '1학기',
        goalGroups: first,
        ungroupedItems: [],
      },
      {
        semesterId: 'second',
        semesterLabel: '2학기',
        goalGroups: second,
        ungroupedItems: [],
      },
    ];
    return {
      yearId: y.id,
      gradeId: y.grade_id,
      gradeLabel: y.grade_label,
      semester: 'split',
      goals,
      items: ungrouped,
      goalGroups,
      semesterPlans,
    };
  }

  return {
    yearId: y.id,
    gradeId: y.grade_id,
    gradeLabel: y.grade_label,
    semester,
    goals,
    items: ungrouped,
    goalGroups,
  };
}

/** API 상세 응답 → 빌더/타임라인용 CareerPlan */
export function mapCareerPlanDetailApiToUi(detail: ApiCareerPlanDetail): CareerPlan {
  return {
    id: detail.id,
    starId: detail.star_id,
    starName: detail.star_name,
    starEmoji: detail.star_emoji,
    starColor: detail.star_color,
    jobId: detail.job_id,
    jobName: detail.job_name,
    jobEmoji: detail.job_emoji,
    title: detail.title,
    description: detail.description ?? undefined,
    years: (detail.years ?? []).map(mapYearFromApi),
    createdAt: detail.created_at,
  };
}

function mapSubItemToApi(s: SubItem, index: number): Record<string, unknown> {
  const row: Record<string, unknown> = {
    title: s.title,
    is_done: s.done ?? false,
    url: normalizeOptionalUrl(s.url),
    description: s.description ?? null,
    sort_order: index,
  };
  if (isUuidString(s.id)) row.id = s.id;
  return row;
}

function mapLinkToApi(link: CareerItemLink, index: number): Record<string, unknown> {
  return {
    title: link.title,
    url: link.url,
    kind: link.kind ?? 'reference',
    sort_order: index,
  };
}

function normalizeOptionalUrl(value: string | undefined): string | null {
  if (value === undefined || value === null) return null;
  const t = String(value).trim();
  return t.length > 0 ? t : null;
}

function mapPlanItemToApi(item: PlanItem): Record<string, unknown> {
  const base: Record<string, unknown> = {
    type: item.type,
    title: item.title,
    months: item.months ?? [],
    difficulty: item.difficulty ?? 2,
    cost: item.cost ?? '',
    organizer: item.organizer ?? '',
    url: normalizeOptionalUrl(item.url),
    description: item.description ?? null,
    category_tags: item.categoryTags ?? [],
    activity_subtype: item.activitySubtype ?? null,
    sort_order: 0,
    sub_items: (item.subItems ?? []).map(mapSubItemToApi),
    links: (item.links ?? []).map(mapLinkToApi),
  };
  if (isUuidString(item.id)) base.id = item.id;
  return base;
}

function collectGoalGroupsForApi(y: YearPlan): Array<Record<string, unknown>> {
  const out: Array<Record<string, unknown>> = [];

  if (y.semester === 'split' && y.semesterPlans && y.semesterPlans.length > 0) {
    for (const sp of y.semesterPlans) {
      const semId = sp.semesterId === 'second' ? 'second' : 'first';
      for (const gg of sp.goalGroups ?? []) {
        const row: Record<string, unknown> = {
          goal: gg.goal,
          semester_id: semId,
          sort_order: out.length,
          items: (gg.items ?? []).map(mapPlanItemToApi),
        };
        if (isUuidString(gg.id)) row.id = gg.id;
        out.push(row);
      }
    }
    return out;
  }

  for (const gg of y.goalGroups ?? []) {
    const row: Record<string, unknown> = {
      goal: gg.goal,
      semester_id: '',
      sort_order: out.length,
      items: (gg.items ?? []).map(mapPlanItemToApi),
    };
    if (isUuidString(gg.id)) row.id = gg.id;
    out.push(row);
  }
  return out;
}

/** 서버에서 받은 패스에 기존 UI 전용 공유 필드 병합 */
export function mergeUiShareFields(server: CareerPlan, fallback: CareerPlan): CareerPlan {
  return {
    ...server,
    isPublic: fallback.isPublic,
    shareChannels: fallback.shareChannels,
    shareType: fallback.shareType,
    shareGroupIds: fallback.shareGroupIds,
    sharedAt: fallback.sharedAt,
  };
}

/** 생성/수정 요청 본문 (CareerPlanCreateSerializer) */
export function mapCareerPlanUiToWritePayload(plan: CareerPlan): Record<string, unknown> {
  const years = (plan.years ?? []).map((y, idx) => {
    const row: Record<string, unknown> = {
      grade_id: y.gradeId,
      grade_label: y.gradeLabel,
      semester: y.semester || 'both',
      sort_order: idx,
      goal_groups: collectGoalGroupsForApi(y),
      items: (y.items ?? []).map(mapPlanItemToApi),
    };
    if (isUuidString(y.yearId)) row.id = y.yearId;
    return row;
  });

  return {
    title: plan.title,
    description: plan.description ?? '',
    job_id: plan.jobId,
    job_name: plan.jobName,
    job_emoji: plan.jobEmoji,
    star_id: plan.starId,
    star_name: plan.starName,
    star_emoji: plan.starEmoji,
    star_color: plan.starColor,
    is_template: false,
    template_category: null,
    years,
  };
}
