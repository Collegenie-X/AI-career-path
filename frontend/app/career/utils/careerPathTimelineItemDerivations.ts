import type { PlanItem } from '../components/CareerPathBuilder';

type LinkCarrier = {
  readonly url?: string;
  readonly links?: ReadonlyArray<{ readonly url?: string; readonly title?: string }>;
};

/** PlanItem·템플릿 JSON 공통 — 월 배열로 표시 문자열 생성 */
export function buildTimelineMonthLabelFromMonths(months: number[]): string {
  if (months.length === 0) return '월 미정';
  if (months.length === 1) return `${months[0]}월`;
  if (months.length <= 3) return months.map((m) => `${m}월`).join('·');
  return `${months[0]}~${months[months.length - 1]}월`;
}

/** 템플릿 항목: months 또는 단일 month → 배열 */
export function normalizeTimelineItemMonths(item: {
  readonly months?: number[];
  readonly month?: number;
}): number[] {
  if (Array.isArray(item.months) && item.months.length > 0) return [...item.months];
  if (typeof item.month === 'number') return [item.month];
  return [];
}

/** 링크 URL·표시 라벨 (내 패스·탐색 템플릿 공통) */
export function deriveTimelineItemLinkFields(item: LinkCarrier): {
  readonly linkHref: string | undefined;
  readonly linkLabel: string;
} {
  const raw = item.url?.trim() || item.links?.[0]?.url;
  const linkHref = raw ? raw : undefined;
  const linkLabel = item.links?.[0]?.title?.trim() || linkHref || '';
  return { linkHref, linkLabel };
}

/**
 * 내 패스 타임라인 — 제목 행 쉐브론·펼침 영역 표시 여부
 * (설명 / 하위 / 주최(개인 제외) / 링크 중 하나라도 있으면 펼침 가능)
 */
export function deriveMyPathTimelineExpandableState(
  item: Pick<PlanItem, 'description' | 'organizer' | 'url' | 'links'>,
  subItemsLength: number,
): {
  readonly descTrim: string;
  readonly organizerTrim: string;
  readonly linkHref: string | undefined;
  readonly linkLabel: string;
  readonly hasExpandableDetails: boolean;
} {
  const descTrim = item.description?.trim() ?? '';
  const organizerTrim = item.organizer?.trim() ?? '';
  const { linkHref, linkLabel } = deriveTimelineItemLinkFields(item);
  const hasExpandableDetails =
    !!descTrim ||
    subItemsLength > 0 ||
    (!!organizerTrim && organizerTrim !== '개인') ||
    !!linkHref;
  return { descTrim, organizerTrim, linkHref, linkLabel, hasExpandableDetails };
}

/** 탐색 템플릿 — 본문(주최·설명·링크) 아코디언 필요 여부 */
export function deriveTemplateTimelineExpandableBody(
  item: {
    readonly description?: string;
    readonly organizer?: string;
    readonly url?: string;
    readonly links?: ReadonlyArray<{ readonly url?: string; readonly title?: string }>;
  },
): { readonly descTrim: string; readonly hasExpandableBody: boolean } {
  const { linkHref } = deriveTimelineItemLinkFields(item);
  const descTrim = item.description?.trim() ?? '';
  const hasExpandableBody = !!(descTrim || linkHref || item.organizer);
  return { descTrim, hasExpandableBody };
}
