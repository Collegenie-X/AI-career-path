import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SPACING, FONT_SIZES, BORDER_RADIUS } from '../../config/theme';
import { CAREER_LABELS, CAREER_GRADE_YEARS, type CareerYearPlan } from '../../config/career-path';
import { YearPlanCard } from './YearPlanCard';

interface StepPlannerProps {
  yearPlans: CareerYearPlan[];
  onUpdateYears: (years: CareerYearPlan[]) => void;
  starId: string;
  color: string;
  jobName: string;
}

export function StepPlanner({ yearPlans, onUpdateYears, starId, color, jobName }: StepPlannerProps) {
  const [expandedId, setExpandedId] = useState<string | null>(
    yearPlans.length > 0 ? yearPlans[yearPlans.length - 1].gradeId : null,
  );
  const [showGradePicker, setShowGradePicker] = useState(yearPlans.length === 0);

  const usedIds = yearPlans.map((y) => y.gradeId);

  const addGrade = (gradeId: string) => {
    const grade = CAREER_GRADE_YEARS.find((g) => g.id === gradeId)!;
    const newYear: CareerYearPlan = { gradeId, gradeLabel: grade.label, goals: [], items: [] };
    onUpdateYears([...yearPlans, newYear]);
    setExpandedId(gradeId);
    setShowGradePicker(false);
  };

  const updateYear = (updated: CareerYearPlan) => {
    onUpdateYears(yearPlans.map((y) => (y.gradeId === updated.gradeId ? updated : y)));
  };

  const removeYear = (gradeId: string) => {
    const next = yearPlans.filter((y) => y.gradeId !== gradeId);
    onUpdateYears(next);
    if (expandedId === gradeId) setExpandedId(next.length > 0 ? next[next.length - 1].gradeId : null);
  };

  const totalItems = yearPlans.reduce(
    (s, y) =>
      s +
      y.items.length +
      (y.groups ?? []).reduce((sg, g) => sg + g.items.length, 0) +
      (y.goalGroups ?? []).reduce((sg, g) => sg + g.items.length, 0),
    0,
  );
  const totalGoals = yearPlans.reduce(
    (s, y) => s + ((y.goalGroups ?? []).length > 0 ? (y.goalGroups ?? []).length : y.goals.length),
    0,
  );

  const gradeGroups = [
    { label: '초등학교', emoji: '🏫', grades: CAREER_GRADE_YEARS.filter((g) => g.id.startsWith('elem')) },
    { label: '중학교', emoji: '🎒', grades: CAREER_GRADE_YEARS.filter((g) => g.id.startsWith('mid')) },
    { label: '고등학교', emoji: '🎓', grades: CAREER_GRADE_YEARS.filter((g) => g.id.startsWith('high')) },
    { label: '일반', emoji: '👔', grades: CAREER_GRADE_YEARS.filter((g) => g.id === 'univ' || g.id === 'general') },
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.plannerContainer}>
      <View style={styles.tipBox}>
        <Text style={styles.tipIcon}>💡</Text>
        <Text style={styles.tipText}>{jobName}{CAREER_LABELS.tipPlan}</Text>
      </View>

      {yearPlans.length === 0 && (
        <View style={styles.emptyGrade}>
          <Text style={styles.emptyGradeEmoji}>📅</Text>
          <Text style={styles.emptyGradeTitle}>{CAREER_LABELS.gradeAddFirst}</Text>
          <Text style={styles.emptyGradeDesc}>{CAREER_LABELS.gradeAddFirstDesc}</Text>
        </View>
      )}

      {yearPlans.map((year) => (
        <YearPlanCard
          key={year.gradeId}
          yearPlan={year}
          color={color}
          starId={starId}
          isExpanded={expandedId === year.gradeId}
          onToggle={() => setExpandedId(expandedId === year.gradeId ? null : year.gradeId)}
          onUpdate={updateYear}
          onRemove={() => removeYear(year.gradeId)}
        />
      ))}

      <View style={[styles.gradePickerCard, showGradePicker && { borderColor: color + '40', backgroundColor: color + '08' }]}>
        {!showGradePicker ? (
          <TouchableOpacity
            onPress={() => setShowGradePicker(true)}
            disabled={usedIds.length >= CAREER_GRADE_YEARS.length}
            style={styles.gradePickerButton}
          >
            <View style={[styles.gradePickerIcon, { borderColor: color + '60' }]}>
              <Text style={[styles.gradePickerPlus, { color }]}>+</Text>
            </View>
            <Text style={[styles.gradePickerLabel, { color }]}>
              {usedIds.length === 0 ? CAREER_LABELS.gradeAddSelect : CAREER_LABELS.gradeAddNext}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.gradePickerContent}>
            <View style={styles.gradePickerHeader}>
              <Text style={styles.gradePickerTitle}>📅 {CAREER_LABELS.gradePickerTitle}</Text>
              {yearPlans.length > 0 && (
                <TouchableOpacity onPress={() => setShowGradePicker(false)}>
                  <Text style={styles.gradePickerClose}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
            {gradeGroups.map((group) => {
              const available = group.grades.filter((g) => !usedIds.includes(g.id));
              if (available.length === 0) return null;
              return (
                <View key={group.label}>
                  <Text style={styles.gradeGroupLabel}>{group.emoji} {group.label}</Text>
                  <View style={styles.gradeChipsRow}>
                    {available.map((g) => (
                      <TouchableOpacity
                        key={g.id}
                        onPress={() => addGrade(g.id)}
                        style={[styles.gradeChip, { backgroundColor: color + '22', borderColor: color + '50' }]}
                      >
                        <Text style={[styles.gradeChipText, { color }]}>{g.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {(totalItems > 0 || totalGoals > 0) && (
        <View style={styles.progressBar}>
          <Text style={styles.progressIcon}>🔥</Text>
          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>
              {yearPlans.length}개 학년 · {totalGoals}개 목표 · {totalItems}개 항목
            </Text>
            <Text style={styles.progressHint}>완성 버튼을 눌러 저장하세요!</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  plannerContainer: { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xxl, gap: SPACING.md },
  tipBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md,
    paddingHorizontal: 14, paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(108,92,231,0.12)', borderWidth: 1, borderColor: 'rgba(108,92,231,0.25)',
  },
  tipIcon: { fontSize: 14, marginTop: 1 },
  tipText: { flex: 1, fontSize: FONT_SIZES.xs, color: '#c4b5fd', lineHeight: 18 },
  emptyGrade: {
    borderRadius: BORDER_RADIUS.lg, paddingVertical: 32, alignItems: 'center', gap: SPACING.md,
    borderWidth: 1.5, borderStyle: 'dashed', borderColor: 'rgba(108,92,231,0.35)',
    backgroundColor: 'rgba(108,92,231,0.05)',
  },
  emptyGradeEmoji: { fontSize: 36 },
  emptyGradeTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#fff' },
  emptyGradeDesc: { fontSize: FONT_SIZES.xs, color: '#6B7280' },
  gradePickerCard: { borderRadius: BORDER_RADIUS.lg, borderWidth: 1.5, borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
  gradePickerButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, paddingVertical: SPACING.lg },
  gradePickerIcon: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderStyle: 'dashed' },
  gradePickerPlus: { fontSize: 16, fontWeight: '700' },
  gradePickerLabel: { fontSize: FONT_SIZES.md, fontWeight: '700' },
  gradePickerContent: { padding: SPACING.lg, gap: SPACING.md },
  gradePickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  gradePickerTitle: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: '#fff' },
  gradePickerClose: { fontSize: 14, color: '#6B7280' },
  gradeGroupLabel: { fontSize: 10, color: '#4B5563', fontWeight: '600', marginBottom: SPACING.sm },
  gradeChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.md },
  gradeChip: { paddingHorizontal: 14, paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.lg, borderWidth: 1.5 },
  gradeChipText: { fontSize: FONT_SIZES.md, fontWeight: '900' },
  progressBar: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(34,197,94,0.14)', borderWidth: 1, borderColor: 'rgba(34,197,94,0.22)',
  },
  progressIcon: { fontSize: 16 },
  progressInfo: { flex: 1 },
  progressText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: '#86efac' },
  progressHint: { fontSize: 10, color: '#22C55E', marginTop: 2 },
});
