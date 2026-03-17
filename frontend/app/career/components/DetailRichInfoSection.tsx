import { Link as LinkIcon, Sparkles } from 'lucide-react';
import { LABELS } from '../config';
import type { CareerPathTemplate } from '@/data/career-path-templates-index';

type TemplateItem = {
  type?: string;
  title?: string;
  description?: string;
  url?: string;
  links?: Array<{ title: string; url: string; kind?: string }>;
  categoryTags?: string[];
  activitySubtype?: string;
};

type RichCategoryKey =
  | 'project'
  | 'award'
  | 'paper'
  | 'intern'
  | 'volunteer'
  | 'camp'
  | 'activity';

type RichCategoryConfig = {
  key: RichCategoryKey;
  emoji: string;
  label: string;
  matcher: (item: TemplateItem, text: string) => boolean;
};

const RICH_CATEGORY_CONFIGS: RichCategoryConfig[] = [
  {
    key: 'project',
    emoji: '🚀',
    label: (LABELS.detail_rich_project as string) ?? '프로젝트',
    matcher: (item, text) =>
      item.type === 'portfolio' ||
      /프로젝트|해커톤|앱|웹|서비스|개발|데모|포트폴리오|github/i.test(text),
  },
  {
    key: 'award',
    emoji: '🏆',
    label: (LABELS.detail_rich_award as string) ?? '수상',
    matcher: (item, text) => item.type === 'award' || /수상|대회|올림피아드|입상|경진/i.test(text),
  },
  {
    key: 'paper',
    emoji: '📄',
    label: (LABELS.detail_rich_paper as string) ?? '논문·연구',
    matcher: (_, text) => /논문|연구|r&e|탐구|리서치|보고서/i.test(text),
  },
  {
    key: 'intern',
    emoji: '💼',
    label: (LABELS.detail_rich_intern as string) ?? '인턴',
    matcher: (_, text) => /인턴|intern|현장실습/i.test(text),
  },
  {
    key: 'volunteer',
    emoji: '🤝',
    label: (LABELS.detail_rich_volunteer as string) ?? '봉사활동',
    matcher: (_, text) => /봉사|volunteer|사회공헌/i.test(text),
  },
  {
    key: 'camp',
    emoji: '🏕️',
    label: (LABELS.detail_rich_camp as string) ?? '캠프',
    matcher: (_, text) => /캠프|camp|부트캠프|summer program/i.test(text),
  },
  {
    key: 'activity',
    emoji: '🎯',
    label: (LABELS.detail_rich_activity as string) ?? '활동',
    matcher: (item) => item.type === 'activity',
  },
];

type RichCategorySummary = {
  key: RichCategoryKey;
  emoji: string;
  label: string;
  count: number;
  examples: string[];
};

function collectTemplateItems(template: CareerPathTemplate): TemplateItem[] {
  const years = Array.isArray(template.years) ? template.years : [];
  return years.flatMap((year) => (Array.isArray(year.items) ? year.items : []));
}

function buildRichCategorySummaries(items: TemplateItem[]): RichCategorySummary[] {
  return RICH_CATEGORY_CONFIGS
    .map((config) => {
      const matched = items.filter((item) => {
        const tags = item.categoryTags ?? [];
        if (tags.includes(config.key)) return true;
        if (config.key === 'intern' && item.activitySubtype === 'intern') return true;
        if (config.key === 'volunteer' && item.activitySubtype === 'volunteer') return true;
        if (config.key === 'camp' && item.activitySubtype === 'camp') return true;
        const text = `${item.title ?? ''} ${item.description ?? ''}`.toLowerCase();
        return config.matcher(item, text);
      });
      const exampleTitles = Array.from(new Set(matched.map((item) => item.title).filter(Boolean) as string[])).slice(0, 3);
      return {
        key: config.key,
        emoji: config.emoji,
        label: config.label,
        count: matched.length,
        examples: exampleTitles,
      };
    })
    .filter((summary) => summary.count > 0)
    .sort((a, b) => b.count - a.count);
}

function collectUniqueLinks(items: TemplateItem[]): Array<{ title: string; url: string }> {
  const uniqueMap = new Map<string, string>();
  items.forEach((item) => {
    if (Array.isArray(item.links) && item.links.length > 0) {
      item.links.forEach((link) => {
        if (!link?.url) return;
        if (!uniqueMap.has(link.url)) uniqueMap.set(link.url, link.title ?? item.title ?? link.url);
      });
      return;
    }
    if (!item.url) return;
    if (!uniqueMap.has(item.url)) uniqueMap.set(item.url, item.title ?? item.url);
  });
  return Array.from(uniqueMap.entries()).map(([url, title]) => ({ title, url }));
}

export function DetailRichInfoSection({ template }: { template: CareerPathTemplate }) {
  const items = collectTemplateItems(template);
  const summaries = buildRichCategorySummaries(items);
  const links = collectUniqueLinks(items);

  if (summaries.length === 0 && links.length === 0) return null;

  return (
    <div
      className="rounded-2xl overflow-hidden border"
      style={{ borderColor: `${template.starColor}35`, backgroundColor: `${template.starColor}08` }}
    >
      <div className="px-4 py-2.5 flex items-center gap-2" style={{ backgroundColor: `${template.starColor}20` }}>
        <Sparkles style={{ width: 14, height: 14, color: template.starColor }} />
        <div className="min-w-0">
          <div className="text-sm font-bold text-white">
            {(LABELS.detail_rich_info_title as string) ?? '합격 준비 상세 가이드'}
          </div>
          <div className="text-[11px] text-gray-400">
            {(LABELS.detail_rich_info_subtitle as string) ?? '프로젝트·수상·논문·인턴·봉사·캠프를 학년 전체에서 요약했어요.'}
          </div>
        </div>
      </div>

      {summaries.length > 0 && (
        <div className="px-4 py-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {summaries.map((summary) => (
            <div
              key={summary.key}
              className="rounded-xl p-2.5 border"
              style={{ borderColor: `${template.starColor}22`, backgroundColor: 'rgba(255,255,255,0.02)' }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-white">
                  {summary.emoji} {summary.label}
                </span>
                <span className="text-[11px] font-semibold" style={{ color: template.starColor }}>
                  {summary.count}
                  {(LABELS.detail_rich_examples_suffix as string) ?? '개 예시'}
                </span>
              </div>
              {summary.examples.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {summary.examples.map((example) => (
                    <span
                      key={example}
                      className="text-[11px] px-1.5 py-0.5 rounded-md text-gray-300"
                      style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                    >
                      {example}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="px-4 pb-4">
        <div className="text-xs font-bold text-gray-300 mb-2">
          {(LABELS.detail_rich_links_title as string) ?? '참고 URL · 공식 링크'}
        </div>
        {links.length === 0 ? (
          <div className="text-xs text-gray-500">
            {(LABELS.detail_rich_links_empty as string) ?? '등록된 참고 URL이 아직 없어요'}
          </div>
        ) : (
          <div className="space-y-1.5">
            {links.slice(0, 6).map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[12px] text-blue-300 hover:underline truncate"
              >
                <LinkIcon style={{ width: 11, height: 11, flexShrink: 0 }} />
                <span className="truncate">{link.title}</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
