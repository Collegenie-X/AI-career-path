import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { SPACING, FONT_SIZES, BORDER_RADIUS } from '../../config/theme';
import { CAREER_ITEM_TYPES, CAREER_GRADE_YEARS, CAREER_LABELS } from '../../config/career-path';

const BADGE_SIZE = 38;

interface YearItemData {
  type: string;
  title: string;
  month?: number;
  months?: number[];
  difficulty?: number;
  cost?: string;
  organizer?: string;
  url?: string;
  links?: Array<{ title: string; url: string; kind?: string }>;
  description?: string;
  categoryTags?: string[];
  activitySubtype?: string;
}

interface YearData {
  gradeId: string;
  gradeLabel: string;
  goals: string[];
  items: YearItemData[];
}

interface TemplateYearSectionProps {
  year: YearData;
  accentColor: string;
}

function DifficultyStars({ difficulty }: { difficulty: number }) {
  return (
    <Text style={starS.text}>
      {'★'.repeat(Math.min(difficulty, 5))}
      {'☆'.repeat(Math.max(0, 5 - difficulty))}
    </Text>
  );
}

const starS = StyleSheet.create({
  text: { fontSize: 9, color: '#FBBF24', letterSpacing: 0.5 },
});

function GoalPill({ goal, accentColor }: { goal: string; accentColor: string }) {
  return (
    <View style={[goalS.row, { backgroundColor: accentColor + '12', borderColor: accentColor + '1e' }]}>
      <View style={[goalS.dot, { backgroundColor: accentColor }]} />
      <Text style={goalS.text}>{goal}</Text>
    </View>
  );
}

const goalS = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: BORDER_RADIUS.sm, borderWidth: 1,
  },
  dot: { width: 4, height: 4, borderRadius: 2 },
  text: { flex: 1, fontSize: FONT_SIZES.xs, color: '#E5E7EB' },
});

function ActivityItem({ item, accentColor }: { item: YearItemData; accentColor: string }) {
  const [expanded, setExpanded] = useState(false);
  const tc = CAREER_ITEM_TYPES.find((t) => t.value === item.type);
  const c = tc?.color ?? accentColor;

  const monthLabel = typeof item.month === 'number'
    ? `${item.month}월`
    : Array.isArray(item.months) && item.months.length > 0
      ? item.months.length === 1
        ? `${item.months[0]}월`
        : `${item.months[0]}~${item.months[item.months.length - 1]}월`
      : '';

  const primaryLink = item.links?.[0];
  const primaryUrl = item.url ?? primaryLink?.url;
  const primaryLinkLabel = primaryLink?.title ?? primaryUrl;
  const hasDetails = primaryUrl || item.description;

  return (
    <View style={[itemS.wrapper, { backgroundColor: c + '0d', borderColor: c + '25' }]}>
      <TouchableOpacity 
        style={itemS.container}
        onPress={() => hasDetails && setExpanded(!expanded)}
        activeOpacity={hasDetails ? 0.7 : 1}
      >
        <View style={[itemS.icon, { backgroundColor: c + '18', borderColor: c + '28' }]}>
          <Text style={itemS.iconEmoji}>{tc?.emoji ?? '📌'}</Text>
        </View>
        <View style={itemS.content}>
          <Text style={itemS.title} numberOfLines={expanded ? undefined : 1}>{item.title}</Text>
          <View style={itemS.meta}>
            <View style={[itemS.typeBadge, { backgroundColor: c + '22' }]}>
              <Text style={[itemS.typeText, { color: c }]}>{tc?.label}</Text>
            </View>
            {monthLabel ? <Text style={itemS.metaGray}>📅 {monthLabel}</Text> : null}
            {item.cost ? <Text style={itemS.metaGray}>{item.cost}</Text> : null}
            {item.difficulty != null && item.difficulty > 0 && (
              <DifficultyStars difficulty={item.difficulty} />
            )}
          </View>
          {item.organizer ? (
            <Text style={itemS.organizer}>🏢 {item.organizer}</Text>
          ) : null}
        </View>
        {hasDetails && (
          <Text style={[itemS.expandIcon, { color: c }]}>{expanded ? '▲' : '▼'}</Text>
        )}
      </TouchableOpacity>

      {expanded && hasDetails && (
        <View style={[itemS.details, { borderTopColor: c + '20' }]}>
          {primaryUrl && (
            <TouchableOpacity onPress={() => Linking.openURL(primaryUrl)} style={itemS.detailRow}>
              <Text style={itemS.detailLabel}>🔗 {CAREER_LABELS.itemUrl}</Text>
              <Text style={itemS.detailLink} numberOfLines={1}>{primaryLinkLabel}</Text>
            </TouchableOpacity>
          )}
          {item.description && (
            <View style={itemS.detailRow}>
              <Text style={itemS.detailLabel}>📝 {CAREER_LABELS.itemDescription}</Text>
              <Text style={itemS.detailText}>{item.description}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const itemS = StyleSheet.create({
  wrapper: {
    borderRadius: BORDER_RADIUS.md, borderWidth: 1, overflow: 'hidden',
  },
  container: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    padding: 10,
  },
  icon: {
    width: 34, height: 34, borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1,
  },
  iconEmoji: { fontSize: 16 },
  content: { flex: 1 },
  title: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#fff', marginBottom: 3 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  typeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BORDER_RADIUS.full },
  typeText: { fontSize: 9, fontWeight: '800' },
  metaGray: { fontSize: 9, color: '#6B7280' },
  organizer: { fontSize: 9, color: '#6B7280', marginTop: 2 },
  expandIcon: { fontSize: 10, fontWeight: '700', marginTop: 2 },
  details: { paddingHorizontal: 10, paddingVertical: SPACING.sm, borderTopWidth: 1, gap: SPACING.sm },
  detailRow: { gap: 4 },
  detailLabel: { fontSize: 9, fontWeight: '700', color: '#9CA3AF' },
  detailLink: { fontSize: FONT_SIZES.xs, color: '#60A5FA', textDecorationLine: 'underline' },
  detailText: { fontSize: FONT_SIZES.xs, color: '#D1D5DB', lineHeight: 16 },
});

export function TemplateYearSection({ year, accentColor }: TemplateYearSectionProps) {
  const grade = CAREER_GRADE_YEARS.find((g) => g.id === year.gradeId);

  return (
    <View style={styles.wrapper}>
      <View style={[styles.badge, { backgroundColor: accentColor, shadowColor: accentColor }]}>
        <Text style={styles.badgeText}>{year.gradeLabel}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.gradeLabel}>{grade?.fullLabel ?? year.gradeLabel}</Text>
        <Text style={styles.itemCount}>{year.items.length}개 항목</Text>

        {year.goals.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>⊙ 목표</Text>
            <View style={styles.goalList}>
              {year.goals.map((g, i) => (
                <GoalPill key={i} goal={g} accentColor={accentColor} />
              ))}
            </View>
          </View>
        )}

        {year.items.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>⊹ 활동·수상·자격증</Text>
            <View style={styles.itemList}>
              {year.items.map((it, i) => (
                <ActivityItem key={i} item={it} accentColor={accentColor} />
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    paddingLeft: 0,
    paddingBottom: SPACING.xxl,
    paddingTop: 2,
  },
  badge: {
    width: BADGE_SIZE, height: BADGE_SIZE, borderRadius: BADGE_SIZE / 2,
    justifyContent: 'center', alignItems: 'center',
    marginRight: SPACING.md,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10,
    elevation: 6, zIndex: 1,
  },
  badgeText: { fontSize: 11, fontWeight: '900', color: '#fff' },
  content: { flex: 1 },
  gradeLabel: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: '#fff' },
  itemCount: { fontSize: 11, color: '#6B7280', marginTop: 1, marginBottom: SPACING.sm },
  section: { marginTop: SPACING.md },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: '#6B7280',
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6,
  },
  goalList: { gap: 6 },
  itemList: { gap: 6 },
});
