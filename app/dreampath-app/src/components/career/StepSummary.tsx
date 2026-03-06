import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SPACING, FONT_SIZES, BORDER_RADIUS } from '../../config/theme';
import {
  CAREER_LABELS, CAREER_ITEM_TYPES, CAREER_GRADE_YEARS,
  type CareerYearPlan,
} from '../../config/career-path';

interface PlanPreview {
  starId: string;
  starName?: string;
  starEmoji?: string;
  starColor: string;
  jobId: string;
  jobName?: string;
  jobEmoji?: string;
  years: CareerYearPlan[];
}

interface StepSummaryProps {
  plan: PlanPreview;
  color: string;
}

function StatBadge({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <View style={[styles.statBadge, { borderColor: color + '30' }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function YearSummaryCard({ yearPlan, color }: { yearPlan: CareerYearPlan; color: string }) {
  const gradeInfo = CAREER_GRADE_YEARS.find((g) => g.id === yearPlan.gradeId);
  const totalItems = yearPlan.items.length;
  const typeBreakdown = CAREER_ITEM_TYPES.map((t) => ({
    ...t,
    count: yearPlan.items.filter((it) => it.type === t.value).length,
  })).filter((t) => t.count > 0);

  return (
    <View style={[styles.yearCard, { borderColor: color + '18' }]}>
      <View style={styles.yearCardHeader}>
        <View style={[styles.yearBadge, { backgroundColor: color + '20' }]}>
          <Text style={[styles.yearBadgeText, { color }]}>
            {gradeInfo?.groupEmoji} {gradeInfo?.fullLabel ?? yearPlan.gradeLabel}
          </Text>
        </View>
        <Text style={styles.yearItemCount}>{totalItems}{CAREER_LABELS.detailItems}</Text>
      </View>

      {yearPlan.goals.length > 0 && (
        <View style={styles.goalsList}>
          {yearPlan.goals.map((goal, i) => (
            <View key={i} style={styles.goalRow}>
              <Text style={styles.goalBullet}>🎯</Text>
              <Text style={styles.goalText} numberOfLines={1}>{goal}</Text>
            </View>
          ))}
        </View>
      )}

      {typeBreakdown.length > 0 && (
        <View style={styles.typeBreakdown}>
          {typeBreakdown.map((t) => (
            <View key={t.value} style={[styles.typeChip, { backgroundColor: t.color + '18' }]}>
              <Text style={{ fontSize: 12 }}>{t.emoji}</Text>
              <Text style={[styles.typeChipText, { color: t.color }]}>{t.label} {t.count}</Text>
            </View>
          ))}
        </View>
      )}

      {yearPlan.items.length > 0 && (
        <View style={styles.itemPreviewList}>
          {yearPlan.items.slice(0, 4).map((item) => {
            const tc = CAREER_ITEM_TYPES.find((t) => t.value === item.type);
            return (
              <View key={item.id} style={styles.itemPreviewRow}>
                <Text style={{ fontSize: 12 }}>{tc?.emoji ?? '📌'}</Text>
                <Text style={styles.itemPreviewText} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.itemPreviewMonths}>
                  {item.months.slice(0, 2).map((m) => `${m}월`).join('·')}
                </Text>
              </View>
            );
          })}
          {yearPlan.items.length > 4 && (
            <Text style={styles.moreItemsText}>+{yearPlan.items.length - 4}개 더</Text>
          )}
        </View>
      )}
    </View>
  );
}

export function StepSummary({ plan, color }: StepSummaryProps) {
  const totalItems = plan.years.reduce((sum, y) => sum + y.items.length, 0);
  const totalGoals = plan.years.reduce((sum, y) => sum + y.goals.length, 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={[styles.heroCard, { borderColor: color + '30' }]}>
        <View style={styles.heroTop}>
          <Text style={styles.heroEmoji}>{plan.starEmoji ?? '🌟'}</Text>
          <View style={styles.heroInfo}>
            <Text style={styles.heroStarName}>{plan.starName}</Text>
            <View style={styles.heroJobRow}>
              <Text style={{ fontSize: 18 }}>{plan.jobEmoji}</Text>
              <Text style={[styles.heroJobName, { color }]}>{plan.jobName}</Text>
            </View>
          </View>
        </View>
        <View style={styles.heroStats}>
          <StatBadge label={CAREER_LABELS.summaryTotalYears} value={plan.years.length} color={color} />
          <StatBadge label={CAREER_LABELS.summaryTotalItems} value={totalItems} color={color} />
          <StatBadge label="목표" value={totalGoals} color={color} />
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>📋 {CAREER_LABELS.summaryYearSummary}</Text>
      </View>

      {plan.years.map((yp) => (
        <YearSummaryCard key={yp.gradeId} yearPlan={yp} color={color} />
      ))}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: SPACING.xl, gap: SPACING.lg },
  heroCard: {
    padding: SPACING.xl, borderRadius: BORDER_RADIUS.xl,
    backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1,
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: SPACING.lg, marginBottom: SPACING.lg },
  heroEmoji: { fontSize: 44 },
  heroInfo: { flex: 1, gap: SPACING.xs },
  heroStarName: { fontSize: FONT_SIZES.xs, color: '#9CA3AF', fontWeight: '600' },
  heroJobRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  heroJobName: { fontSize: FONT_SIZES.xl, fontWeight: '900' },
  heroStats: { flexDirection: 'row', gap: SPACING.sm },
  statBadge: {
    flex: 1, alignItems: 'center', gap: SPACING.xs,
    paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1,
  },
  statValue: { fontSize: FONT_SIZES.xxl, fontWeight: '900' },
  statLabel: { fontSize: 9, color: '#6B7280', fontWeight: '600' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center' },
  sectionTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#fff' },
  yearCard: {
    padding: SPACING.lg, borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, gap: SPACING.md,
  },
  yearCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  yearBadge: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: BORDER_RADIUS.sm },
  yearBadgeText: { fontSize: FONT_SIZES.sm, fontWeight: '700' },
  yearItemCount: { fontSize: FONT_SIZES.xs, color: '#6B7280' },
  goalsList: { gap: SPACING.xs },
  goalRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  goalBullet: { fontSize: 10 },
  goalText: { flex: 1, fontSize: FONT_SIZES.xs, color: '#D1D5DB' },
  typeBreakdown: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  typeChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: BORDER_RADIUS.sm },
  typeChipText: { fontSize: 10, fontWeight: '700' },
  itemPreviewList: { gap: SPACING.xs },
  itemPreviewRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  itemPreviewText: { flex: 1, fontSize: 11, color: '#9CA3AF' },
  itemPreviewMonths: { fontSize: 9, color: '#4B5563' },
  moreItemsText: { fontSize: 10, color: '#6B7280', textAlign: 'center', marginTop: SPACING.xs },
});
