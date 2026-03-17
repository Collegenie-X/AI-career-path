export type CareerItemCategoryTag =
  | 'project'
  | 'award'
  | 'paper'
  | 'intern'
  | 'volunteer'
  | 'camp'
  | 'activity';

export type CareerActivitySubtype =
  | 'project'
  | 'intern'
  | 'volunteer'
  | 'camp'
  | 'research'
  | 'paper'
  | 'general';

export type CareerItemLinkKind =
  | 'official'
  | 'application'
  | 'reference'
  | 'portfolio'
  | 'result';

export interface CareerItemLink {
  title: string;
  url: string;
  kind?: CareerItemLinkKind;
}

type BaseCareerItemLike = {
  type?: string;
  title?: string;
  description?: string;
  url?: string;
  links?: CareerItemLink[];
  categoryTags?: CareerItemCategoryTag[];
  activitySubtype?: CareerActivitySubtype;
};

function hasKeyword(text: string, pattern: RegExp): boolean {
  return pattern.test(text);
}

function inferCategoryTags(item: BaseCareerItemLike): CareerItemCategoryTag[] {
  const text = `${item.title ?? ''} ${item.description ?? ''}`.toLowerCase();
  const tags = new Set<CareerItemCategoryTag>();

  if (item.type === 'portfolio' || hasKeyword(text, /프로젝트|해커톤|앱|웹|서비스|개발|데모|포트폴리오|github/i)) tags.add('project');
  if (item.type === 'award' || hasKeyword(text, /수상|대회|올림피아드|입상|경진/i)) tags.add('award');
  if (hasKeyword(text, /논문|연구|r&e|탐구|리서치|보고서/i)) tags.add('paper');
  if (hasKeyword(text, /인턴|intern|현장실습/i)) tags.add('intern');
  if (hasKeyword(text, /봉사|volunteer|사회공헌/i)) tags.add('volunteer');
  if (hasKeyword(text, /캠프|camp|부트캠프|summer program/i)) tags.add('camp');
  if (item.type === 'activity') tags.add('activity');

  return Array.from(tags);
}

function inferActivitySubtype(item: BaseCareerItemLike, tags: CareerItemCategoryTag[]): CareerActivitySubtype | undefined {
  if (item.type !== 'activity') return undefined;
  if (tags.includes('intern')) return 'intern';
  if (tags.includes('volunteer')) return 'volunteer';
  if (tags.includes('camp')) return 'camp';
  if (tags.includes('paper')) return 'research';
  if (tags.includes('project')) return 'project';
  return 'general';
}

function normalizeLinks(item: BaseCareerItemLike): CareerItemLink[] | undefined {
  const links = Array.isArray(item.links) ? item.links.filter((link) => link?.url) : [];
  if (links.length > 0) return links;
  if (!item.url) return undefined;
  return [{ title: item.title ?? '공식 링크', url: item.url, kind: 'official' }];
}

export function buildStructuredCareerItem<T extends BaseCareerItemLike>(
  item: T
): T & {
  categoryTags: CareerItemCategoryTag[];
  activitySubtype?: CareerActivitySubtype;
  links?: CareerItemLink[];
} {
  const inferredTags = item.categoryTags?.length ? item.categoryTags : inferCategoryTags(item);
  const links = normalizeLinks(item);
  const activitySubtype = item.activitySubtype ?? inferActivitySubtype(item, inferredTags);

  return {
    ...item,
    categoryTags: inferredTags,
    activitySubtype,
    links,
    url: item.url ?? links?.[0]?.url,
  };
}

type TemplateLike = {
  years?: Array<{
    items?: BaseCareerItemLike[];
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
};

export function normalizeCareerPathTemplates<T extends TemplateLike>(templates: T[]): T[] {
  return templates.map((template) => ({
    ...template,
    years: (template.years ?? []).map((year) => ({
      ...year,
      items: (year.items ?? []).map((item) => buildStructuredCareerItem(item)),
    })),
  })) as T[];
}
