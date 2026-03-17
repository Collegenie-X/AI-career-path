import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { SPACING, FONT_SIZES, BORDER_RADIUS } from '../../config/theme';
import { CAREER_LABELS } from '../../config/career-path';
import type { CareerPathTemplate } from '../../data/career-path-templates-index';

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
  matcher: (item: TemplateItem, normalizedText: string) => boolean;
};

const RICH_CATEGORY_CONFIGS: RichCategoryConfig[] = [
  {
    key: 'project',
    emoji: '🚀',
    label: CAREER_LABELS.detailRichProject,
    matcher: (item, text) =>
      item.type === 'portfolio' ||
      /프로젝트|해커톤|앱|웹|서비스|개발|데모|포트폴리오|github/i.test(text),
  },
  {
    key: 'award',
    emoji: '🏆',
    label: CAREER_LABELS.detailRichAward,
    matcher: (item, text) => item.type === 'award' || /수상|대회|올림피아드|입상|경진/i.test(text),
  },
  {
    key: 'paper',
    emoji: '📄',
    label: CAREER_LABELS.detailRichPaper,
    matcher: (_, text) => /논문|연구|r&e|탐구|리서치|보고서/i.test(text),
  },
  {
    key: 'intern',
    emoji: '💼',
    label: CAREER_LABELS.detailRichIntern,
    matcher: (_, text) => /인턴|intern|현장실습/i.test(text),
  },
  {
    key: 'volunteer',
    emoji: '🤝',
    label: CAREER_LABELS.detailRichVolunteer,
    matcher: (_, text) => /봉사|volunteer|사회공헌/i.test(text),
  },
  {
    key: 'camp',
    emoji: '🏕️',
    label: CAREER_LABELS.detailRichCamp,
    matcher: (_, text) => /캠프|camp|부트캠프|summer program/i.test(text),
  },
  {
    key: 'activity',
    emoji: '🎯',
    label: CAREER_LABELS.detailRichActivity,
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
      const matchedItems = items.filter((item) => {
        const tags = item.categoryTags ?? [];
        if (tags.includes(config.key)) return true;
        if (config.key === 'intern' && item.activitySubtype === 'intern') return true;
        if (config.key === 'volunteer' && item.activitySubtype === 'volunteer') return true;
        if (config.key === 'camp' && item.activitySubtype === 'camp') return true;
        const text = `${item.title ?? ''} ${item.description ?? ''}`.toLowerCase();
        return config.matcher(item, text);
      });
      const examples = Array.from(new Set(matchedItems.map((item) => item.title).filter(Boolean) as string[])).slice(0, 3);
      return {
        key: config.key,
        emoji: config.emoji,
        label: config.label,
        count: matchedItems.length,
        examples,
      };
    })
    .filter((summary) => summary.count > 0)
    .sort((a, b) => b.count - a.count);
}

function collectUniqueLinks(items: TemplateItem[]): Array<{ title: string; url: string }> {
  const urlMap = new Map<string, string>();
  items.forEach((item) => {
    if (Array.isArray(item.links) && item.links.length > 0) {
      item.links.forEach((link) => {
        if (!link?.url) return;
        if (!urlMap.has(link.url)) urlMap.set(link.url, link.title ?? item.title ?? link.url);
      });
      return;
    }
    if (!item.url) return;
    if (!urlMap.has(item.url)) urlMap.set(item.url, item.title ?? item.url);
  });
  return Array.from(urlMap.entries()).map(([url, title]) => ({ title, url }));
}

export function TemplateRichInfoSection({ template }: { template: CareerPathTemplate }) {
  const items = collectTemplateItems(template);
  const summaries = buildRichCategorySummaries(items);
  const links = collectUniqueLinks(items);

  if (summaries.length === 0 && links.length === 0) return null;

  return (
    <View style={[styles.container, { borderColor: template.starColor + '35', backgroundColor: template.starColor + '08' }]}>
      <View style={[styles.header, { backgroundColor: template.starColor + '20' }]}>
        <Text style={[styles.headerTitle, { color: '#fff' }]}>✨ {CAREER_LABELS.detailRichInfoTitle}</Text>
        <Text style={styles.headerSubtitle}>{CAREER_LABELS.detailRichInfoSubtitle}</Text>
      </View>

      {summaries.length > 0 && (
        <View style={styles.summaryGrid}>
          {summaries.map((summary) => (
            <View key={summary.key} style={[styles.summaryCard, { borderColor: template.starColor + '22' }]}>
              <View style={styles.summaryHeaderRow}>
                <Text style={styles.summaryTitle}>{summary.emoji} {summary.label}</Text>
                <Text style={[styles.summaryCount, { color: template.starColor }]}>
                  {summary.count}{CAREER_LABELS.detailRichExamplesSuffix}
                </Text>
              </View>
              {summary.examples.length > 0 && (
                <View style={styles.examplesWrap}>
                  {summary.examples.map((example) => (
                    <View key={example} style={styles.exampleChip}>
                      <Text style={styles.exampleChipText} numberOfLines={1}>{example}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      <View style={styles.linksSection}>
        <Text style={styles.linksTitle}>{CAREER_LABELS.detailRichLinksTitle}</Text>
        {links.length === 0 ? (
          <Text style={styles.linksEmpty}>{CAREER_LABELS.detailRichLinksEmpty}</Text>
        ) : (
          <View style={styles.linksList}>
            {links.slice(0, 6).map((link) => (
              <TouchableOpacity
                key={link.url}
                onPress={() => Linking.openURL(link.url)}
                style={styles.linkRow}
                activeOpacity={0.8}
              >
                <Text style={styles.linkText} numberOfLines={1}>🔗 {link.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  headerTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700' },
  headerSubtitle: { fontSize: 11, color: '#9CA3AF', marginTop: 2, lineHeight: 15 },
  summaryGrid: { gap: SPACING.sm, padding: SPACING.md },
  summaryCard: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: SPACING.sm,
  },
  summaryHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: SPACING.sm },
  summaryTitle: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: '#fff', flex: 1 },
  summaryCount: { fontSize: 11, fontWeight: '700' },
  examplesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  exampleChip: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: 'rgba(255,255,255,0.06)',
    maxWidth: '100%',
  },
  exampleChipText: { fontSize: 10, color: '#D1D5DB' },
  linksSection: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.md },
  linksTitle: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: '#D1D5DB', marginBottom: 6 },
  linksEmpty: { fontSize: 11, color: '#6B7280' },
  linksList: { gap: 6 },
  linkRow: { paddingVertical: 2 },
  linkText: { fontSize: FONT_SIZES.xs, color: '#60A5FA', textDecorationLine: 'underline' },
});
