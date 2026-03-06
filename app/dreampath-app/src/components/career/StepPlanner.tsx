import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput,
} from 'react-native';
import { SPACING, FONT_SIZES, BORDER_RADIUS } from '../../config/theme';
import {
  CAREER_LABELS, CAREER_ITEM_TYPES, CAREER_GRADE_YEARS,
  type CareerYearPlan, type CareerPlanItem,
} from '../../config/career-path';
import { AddItemModal } from './AddItemModal';

interface StepPlannerProps {
  yearPlans: CareerYearPlan[];
  onUpdateYears: (years: CareerYearPlan[]) => void;
  starId: string;
  color: string;
  jobName: string;
}

function YearPlanCard({
  yearPlan, color, starId, isExpanded, onToggle, onUpdate, onRemove,
}: {
  yearPlan: CareerYearPlan; color: string; starId: string;
  isExpanded: boolean; onToggle: () => void;
  onUpdate: (y: CareerYearPlan) => void; onRemove: () => void;
}) {
  const [showAddItem, setShowAddItem] = useState(false);
  const [goalInput, setGoalInput] = useState('');

  const addGoal = () => {
    if (!goalInput.trim()) return;
    onUpdate({ ...yearPlan, goals: [...yearPlan.goals, goalInput.trim()] });
    setGoalInput('');
  };

  const removeGoal = (idx: number) => {
    onUpdate({ ...yearPlan, goals: yearPlan.goals.filter((_, i) => i !== idx) });
  };

  const addItem = (item: Omit<CareerPlanItem, 'id'>) => {
    const newItem: CareerPlanItem = { ...item, id: `item-${Date.now()}-${Math.random().toString(36).slice(2)}` };
    onUpdate({ ...yearPlan, items: [...yearPlan.items, newItem] });
  };

  const removeItem = (id: string) => {
    onUpdate({ ...yearPlan, items: yearPlan.items.filter((it) => it.id !== id) });
  };

  const totalCount = yearPlan.goals.length + yearPlan.items.length;

  return (
    <>
      <View style={[styles.yearCard, { borderColor: isExpanded ? color : color + '30', backgroundColor: isExpanded ? color + '10' : color + '06' }]}>
        <TouchableOpacity style={styles.yearHeader} onPress={onToggle} activeOpacity={0.7}>
          <View style={[styles.yearBadge, { backgroundColor: color }]}>
            <Text style={styles.yearBadgeText}>{yearPlan.gradeLabel}</Text>
          </View>
          <View style={styles.yearHeaderInfo}>
            <Text style={styles.yearFullLabel}>
              {CAREER_GRADE_YEARS.find((g) => g.id === yearPlan.gradeId)?.fullLabel ?? yearPlan.gradeLabel}
            </Text>
            {totalCount > 0 ? (
              <View style={styles.yearHeaderMeta}>
                {yearPlan.goals.length > 0 && <Text style={styles.yearMetaText}>🎯 {yearPlan.goals.length}개 목표</Text>}
                {yearPlan.items.length > 0 && (
                  <Text style={styles.yearMetaText}>
                    {yearPlan.items.slice(0, 3).map((it) => CAREER_ITEM_TYPES.find((t) => t.value === it.type)?.emoji).join('')}
                    {' '}{yearPlan.items.length}개 항목
                  </Text>
                )}
              </View>
            ) : (
              <Text style={styles.yearMetaEmpty}>탭해서 계획 추가하기</Text>
            )}
          </View>
          <Text style={styles.chevron}>{isExpanded ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {isExpanded && (
          <View style={[styles.yearBody, { borderTopColor: color + '20' }]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>🎯</Text>
              <Text style={styles.sectionTitle}>{CAREER_LABELS.goalTitle}</Text>
              <Text style={styles.sectionHint}>{CAREER_LABELS.goalHint}</Text>
            </View>

            {yearPlan.goals.map((goal, idx) => (
              <View key={idx} style={[styles.goalRow, { backgroundColor: color + '14', borderColor: color + '22' }]}>
                <View style={[styles.goalDot, { backgroundColor: color }]} />
                <Text style={styles.goalText}>{goal}</Text>
                <TouchableOpacity onPress={() => removeGoal(idx)}>
                  <Text style={styles.removeText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}

            {yearPlan.goals.length < 5 && (
              <View style={styles.goalInputRow}>
                <TextInput
                  value={goalInput}
                  onChangeText={setGoalInput}
                  onSubmitEditing={addGoal}
                  placeholder={`${yearPlan.gradeLabel} ${CAREER_LABELS.goalPlaceholder}`}
                  placeholderTextColor="#4B5563"
                  style={styles.goalInput}
                  returnKeyType="done"
                />
                <TouchableOpacity onPress={addGoal} style={[styles.addGoalButton, { backgroundColor: color + '25', borderColor: color + '44' }]}>
                  <Text style={[styles.addGoalButtonText, { color }]}>+</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={[styles.divider, { borderTopColor: 'rgba(255,255,255,0.06)' }]} />

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>✨</Text>
              <Text style={styles.sectionTitle}>{CAREER_LABELS.itemTitle}</Text>
              <TouchableOpacity
                onPress={() => setShowAddItem(true)}
                style={[styles.addItemButton, { backgroundColor: color + '22', borderColor: color + '50' }]}
              >
                <Text style={[styles.addItemButtonText, { color }]}>+ {CAREER_LABELS.itemAdd}</Text>
              </TouchableOpacity>
            </View>

            {yearPlan.items.length === 0 ? (
              <TouchableOpacity
                onPress={() => setShowAddItem(true)}
                style={[styles.emptyItems, { borderColor: color + '30', backgroundColor: color + '06' }]}
              >
                <View style={styles.emptyItemsEmojis}>
                  {CAREER_ITEM_TYPES.map((t) => <Text key={t.value} style={{ fontSize: 18 }}>{t.emoji}</Text>)}
                </View>
                <Text style={styles.emptyItemsText}>{CAREER_LABELS.itemEmptyHint}</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.itemsList}>
                {yearPlan.items.map((item) => {
                  const tc = CAREER_ITEM_TYPES.find((t) => t.value === item.type);
                  const monthLabel = item.months.length === 1
                    ? `${item.months[0]}월`
                    : item.months.length <= 3
                    ? item.months.map((m) => `${m}월`).join('·')
                    : `${item.months[0]}~${item.months[item.months.length - 1]}월`;
                  return (
                    <View key={item.id} style={[styles.itemRow, { backgroundColor: (tc?.color ?? color) + '10', borderColor: (tc?.color ?? color) + '22' }]}>
                      <Text style={styles.itemEmoji}>{tc?.emoji ?? '📌'}</Text>
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                        <View style={styles.itemMeta}>
                          <Text style={[styles.itemType, { color: tc?.color ?? color }]}>{tc?.label}</Text>
                          <Text style={styles.itemMonth}>📅 {monthLabel}</Text>
                        </View>
                      </View>
                      <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.removeItemButton}>
                        <Text style={styles.removeItemText}>🗑</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
                <TouchableOpacity
                  onPress={() => setShowAddItem(true)}
                  style={[styles.addMoreButton, { borderColor: color + '30' }]}
                >
                  <Text style={[styles.addMoreText, { color: color + '80' }]}>+ {CAREER_LABELS.itemAddMore}</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity onPress={onRemove} style={styles.removeYearButton}>
              <Text style={styles.removeYearText}>🗑 {CAREER_LABELS.gradeRemove}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {showAddItem && (
        <AddItemModal
          starId={starId}
          color={color}
          onAdd={addItem}
          onClose={() => setShowAddItem(false)}
        />
      )}
    </>
  );
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

  const totalItems = yearPlans.reduce((s, y) => s + y.items.length, 0);
  const totalGoals = yearPlans.reduce((s, y) => s + y.goals.length, 0);

  const gradeGroups = [
    { label: '초등', emoji: '🏫', grades: CAREER_GRADE_YEARS.filter((g) => g.id.startsWith('elem')) },
    { label: '중학교', emoji: '🎒', grades: CAREER_GRADE_YEARS.filter((g) => g.id.startsWith('mid')) },
    { label: '고등학교', emoji: '🎓', grades: CAREER_GRADE_YEARS.filter((g) => g.id.startsWith('high')) },
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
  yearCard: { borderRadius: BORDER_RADIUS.lg, borderWidth: 1.5, overflow: 'hidden' },
  yearHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingHorizontal: SPACING.lg, paddingVertical: 14 },
  yearBadge: { width: 44, height: 44, borderRadius: BORDER_RADIUS.lg, justifyContent: 'center', alignItems: 'center' },
  yearBadgeText: { fontSize: FONT_SIZES.sm, fontWeight: '900', color: '#fff' },
  yearHeaderInfo: { flex: 1 },
  yearFullLabel: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#fff' },
  yearHeaderMeta: { flexDirection: 'row', gap: SPACING.sm, marginTop: 2 },
  yearMetaText: { fontSize: 10, color: '#9CA3AF' },
  yearMetaEmpty: { fontSize: 10, color: '#4B5563', marginTop: 2 },
  chevron: { fontSize: 10, color: '#9CA3AF' },
  yearBody: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg, gap: SPACING.md, borderTopWidth: 1 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingTop: SPACING.md },
  sectionIcon: { fontSize: 14 },
  sectionTitle: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: '#fff', flex: 1 },
  sectionHint: { fontSize: 10, color: '#6B7280' },
  goalRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg, borderWidth: 1,
  },
  goalDot: { width: 6, height: 6, borderRadius: 3 },
  goalText: { flex: 1, fontSize: FONT_SIZES.sm, color: '#fff' },
  removeText: { fontSize: 12, color: '#6B7280' },
  goalInputRow: { flexDirection: 'row', gap: SPACING.sm },
  goalInput: {
    flex: 1, height: 40, paddingHorizontal: 14, borderRadius: BORDER_RADIUS.lg,
    fontSize: FONT_SIZES.sm, color: '#fff',
    backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  addGoalButton: { width: 40, height: 40, borderRadius: BORDER_RADIUS.lg, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  addGoalButtonText: { fontSize: 18, fontWeight: '700' },
  divider: { borderTopWidth: 1 },
  addItemButton: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.lg, borderWidth: 1 },
  addItemButtonText: { fontSize: FONT_SIZES.xs, fontWeight: '700' },
  emptyItems: {
    borderRadius: BORDER_RADIUS.lg, paddingVertical: SPACING.lg, alignItems: 'center', gap: SPACING.sm,
    borderWidth: 1.5, borderStyle: 'dashed',
  },
  emptyItemsEmojis: { flexDirection: 'row', gap: SPACING.sm },
  emptyItemsText: { fontSize: FONT_SIZES.xs, color: '#6B7280' },
  itemsList: { gap: SPACING.sm },
  itemRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    paddingHorizontal: 14, paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg, borderWidth: 1,
  },
  itemEmoji: { fontSize: 18 },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#fff' },
  itemMeta: { flexDirection: 'row', gap: SPACING.sm, marginTop: 2 },
  itemType: { fontSize: 10, fontWeight: '700' },
  itemMonth: { fontSize: 10, color: '#6B7280' },
  removeItemButton: { width: 28, height: 28, borderRadius: BORDER_RADIUS.sm, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)' },
  removeItemText: { fontSize: 12 },
  addMoreButton: { alignItems: 'center', paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderStyle: 'dashed' },
  addMoreText: { fontSize: FONT_SIZES.xs, fontWeight: '600' },
  removeYearButton: { alignItems: 'center', paddingVertical: SPACING.sm },
  removeYearText: { fontSize: FONT_SIZES.xs, color: '#6B7280' },
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
