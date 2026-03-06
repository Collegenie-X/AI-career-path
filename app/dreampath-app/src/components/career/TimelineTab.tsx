import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../config/theme';
import {
  CAREER_LABELS, CAREER_ITEM_TYPES, CAREER_GRADE_YEARS,
  type CareerPlan, type CareerYearPlan, type CareerPlanItem,
} from '../../config/career-path';
import { AddItemModal } from './AddItemModal';

interface TimelineTabProps {
  plans: CareerPlan[];
  onUpdatePlan: (plan: CareerPlan) => void;
  onDeletePlan: (planId: string) => void;
  onEditPlan: (plan: CareerPlan) => void;
  onNewPlan: () => void;
}

function ItemRow({ item, color, onToggle, onDelete }: {
  item: CareerPlanItem; color: string; onToggle: () => void; onDelete: () => void;
}) {
  const tc = CAREER_ITEM_TYPES.find((t) => t.value === item.type);
  const checked = !!item.checked;
  const monthLabel = item.months.length <= 3
    ? item.months.map((m) => `${m}월`).join('·')
    : `${item.months[0]}~${item.months[item.months.length - 1]}월`;

  return (
    <View style={[styles.itemRow, {
      backgroundColor: checked ? 'rgba(255,255,255,0.02)' : (tc?.color ?? color) + '0e',
      borderColor: checked ? 'rgba(255,255,255,0.06)' : (tc?.color ?? color) + '28',
      opacity: checked ? 0.55 : 1,
    }]}>
      <TouchableOpacity onPress={onToggle} style={styles.checkButton}>
        <Text style={{ fontSize: 16, color: checked ? (tc?.color ?? color) : 'rgba(255,255,255,0.2)' }}>
          {checked ? '✅' : '⭕'}
        </Text>
      </TouchableOpacity>
      <View style={[styles.itemIcon, { backgroundColor: (tc?.color ?? color) + '1a', borderColor: (tc?.color ?? color) + '30' }]}>
        <Text style={{ fontSize: 16 }}>{tc?.emoji ?? '📌'}</Text>
      </View>
      <View style={styles.itemContent}>
        <Text style={[styles.itemTitle, checked && styles.itemTitleChecked]} numberOfLines={1}>{item.title}</Text>
        <View style={styles.itemMeta}>
          <View style={[styles.itemTypeBadge, { backgroundColor: (tc?.color ?? color) + '22' }]}>
            <Text style={[styles.itemTypeText, { color: tc?.color ?? color }]}>{tc?.label}</Text>
          </View>
          <Text style={styles.itemMonthText}>📅 {monthLabel}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
        <Text style={{ fontSize: 12, color: '#EF4444' }}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

function GoalRow({ goal, color, onDelete }: { goal: string; color: string; onDelete: () => void }) {
  return (
    <View style={[styles.goalRow, { backgroundColor: color + '10', borderColor: color + '1e' }]}>
      <View style={[styles.goalDot, { backgroundColor: color }]} />
      <Text style={styles.goalText} numberOfLines={1}>{goal}</Text>
      <TouchableOpacity onPress={onDelete}>
        <Text style={{ fontSize: 10, color: '#EF4444' }}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

function YearNode({ year, color, isLast, onUpdate, onAddItem }: {
  year: CareerYearPlan; color: string; isLast: boolean;
  onUpdate: (y: CareerYearPlan) => void; onAddItem: () => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const grade = CAREER_GRADE_YEARS.find((g) => g.id === year.gradeId);
  const checkedCount = year.items.filter((it) => it.checked).length;
  const totalCount = year.items.length;
  const progress = totalCount > 0 ? checkedCount / totalCount : 0;

  const toggleItemCheck = (itemId: string) => {
    onUpdate({
      ...year,
      items: year.items.map((it) => it.id === itemId ? { ...it, checked: !it.checked } : it),
    });
  };

  const deleteItem = (itemId: string) => {
    onUpdate({ ...year, items: year.items.filter((it) => it.id !== itemId) });
  };

  const deleteGoal = (idx: number) => {
    onUpdate({ ...year, goals: year.goals.filter((_, i) => i !== idx) });
  };

  return (
    <View style={styles.yearNode}>
      <View style={styles.timelineTrack}>
        <View style={[styles.timelineDot, { backgroundColor: color, borderColor: color + '44' }]} />
        {!isLast && <View style={[styles.timelineLine, { backgroundColor: color + '22' }]} />}
      </View>

      <View style={styles.yearContent}>
        <TouchableOpacity onPress={() => setExpanded(!expanded)} style={styles.yearHeader} activeOpacity={0.7}>
          <View style={[styles.yearBadge, { backgroundColor: color + '20' }]}>
            <Text style={[styles.yearBadgeText, { color }]}>{grade?.groupEmoji} {grade?.fullLabel ?? year.gradeLabel}</Text>
          </View>
          <View style={styles.yearHeaderRight}>
            {totalCount > 0 && (
              <Text style={styles.yearProgress}>{checkedCount}/{totalCount}</Text>
            )}
            <Text style={styles.chevron}>{expanded ? '▾' : '▸'}</Text>
          </View>
        </TouchableOpacity>

        {totalCount > 0 && (
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progress * 100}%` as any, backgroundColor: color }]} />
          </View>
        )}

        {expanded && (
          <View style={styles.yearBody}>
            {year.goals.length > 0 && (
              <View style={styles.goalsSection}>
                <Text style={styles.sectionLabel}>🎯 {CAREER_LABELS.goalTitle}</Text>
                {year.goals.map((goal, i) => (
                  <GoalRow key={i} goal={goal} color={color} onDelete={() => deleteGoal(i)} />
                ))}
              </View>
            )}

            {year.items.length > 0 && (
              <View style={styles.itemsSection}>
                <Text style={styles.sectionLabel}>📋 {CAREER_LABELS.itemTitle}</Text>
                {year.items.map((item) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    color={color}
                    onToggle={() => toggleItemCheck(item.id)}
                    onDelete={() => deleteItem(item.id)}
                  />
                ))}
              </View>
            )}

            <TouchableOpacity onPress={onAddItem} style={[styles.addItemButton, { borderColor: color + '35' }]}>
              <Text style={[styles.addItemText, { color: color + '99' }]}>+ {CAREER_LABELS.timelineAddItem}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

function PlanAccordion({ plan, onUpdate, onDelete, onEdit, onAddItemForYear }: {
  plan: CareerPlan;
  onUpdate: (p: CareerPlan) => void;
  onDelete: () => void;
  onEdit: () => void;
  onAddItemForYear: (gradeId: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const color = plan.starColor || COLORS.primary;
  const totalItems = plan.years.reduce((s, y) => s + y.items.length, 0);
  const checkedItems = plan.years.reduce((s, y) => s + y.items.filter((it) => it.checked).length, 0);

  const handleUpdateYear = (updatedYear: CareerYearPlan) => {
    onUpdate({
      ...plan,
      years: plan.years.map((y) => y.gradeId === updatedYear.gradeId ? updatedYear : y),
    });
  };

  const handleDeleteConfirm = () => {
    Alert.alert(
      CAREER_LABELS.timelineDeleteConfirm,
      `"${plan.title}"을(를) 삭제할까요?`,
      [
        { text: CAREER_LABELS.timelineDeleteCancel, style: 'cancel' },
        { text: CAREER_LABELS.timelineDelete, style: 'destructive', onPress: onDelete },
      ],
    );
  };

  return (
    <View style={[styles.planCard, { borderColor: color + '20' }]}>
      <TouchableOpacity onPress={() => setExpanded(!expanded)} style={styles.planHeader} activeOpacity={0.7}>
        <View style={styles.planHeaderLeft}>
          <Text style={{ fontSize: 28 }}>{plan.starEmoji}</Text>
          <View style={styles.planHeaderInfo}>
            <Text style={styles.planTitle} numberOfLines={1}>{plan.title}</Text>
            <View style={styles.planMeta}>
              <Text style={[styles.planMetaText, { color }]}>{plan.jobEmoji} {plan.jobName}</Text>
              <Text style={styles.planMetaDivider}>·</Text>
              <Text style={styles.planMetaText}>{plan.years.length}{CAREER_LABELS.detailYears}</Text>
              <Text style={styles.planMetaDivider}>·</Text>
              <Text style={styles.planMetaText}>{checkedItems}/{totalItems}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.chevron}>{expanded ? '▾' : '▸'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.planBody}>
          <View style={styles.planActions}>
            <TouchableOpacity onPress={onEdit} style={[styles.actionButton, { backgroundColor: color + '18' }]}>
              <Text style={[styles.actionButtonText, { color }]}>✏️ {CAREER_LABELS.timelineEdit}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDeleteConfirm} style={[styles.actionButton, { backgroundColor: 'rgba(239,68,68,0.1)' }]}>
              <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>🗑 {CAREER_LABELS.timelineDelete}</Text>
            </TouchableOpacity>
          </View>

          {plan.years.map((year, idx) => (
            <YearNode
              key={year.gradeId}
              year={year}
              color={color}
              isLast={idx === plan.years.length - 1}
              onUpdate={handleUpdateYear}
              onAddItem={() => onAddItemForYear(year.gradeId)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

export function TimelineTab({ plans, onUpdatePlan, onDeletePlan, onEditPlan, onNewPlan }: TimelineTabProps) {
  const [addItemTarget, setAddItemTarget] = useState<{ planId: string; gradeId: string } | null>(null);

  const targetPlan = addItemTarget ? plans.find((p) => p.id === addItemTarget.planId) : null;

  const handleAddItem = (item: Omit<CareerPlanItem, 'id'>) => {
    if (!addItemTarget || !targetPlan) return;
    const newItem: CareerPlanItem = { ...item, id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` };
    const updatedPlan: CareerPlan = {
      ...targetPlan,
      years: targetPlan.years.map((y) =>
        y.gradeId === addItemTarget.gradeId ? { ...y, items: [...y.items, newItem] } : y
      ),
    };
    onUpdatePlan(updatedPlan);
    setAddItemTarget(null);
  };

  if (plans.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🗺️</Text>
        <Text style={styles.emptyTitle}>{CAREER_LABELS.timelineEmpty}</Text>
        <Text style={styles.emptyDesc}>{CAREER_LABELS.timelineEmptyDescription}</Text>
        <TouchableOpacity onPress={onNewPlan} style={styles.emptyButton}>
          <Text style={styles.emptyButtonText}>+ {CAREER_LABELS.timelineCreateButton}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>📋 {CAREER_LABELS.timelineHeader}</Text>
          <Text style={styles.headerCount}>{plans.length}개</Text>
        </View>

        {plans.map((plan) => (
          <PlanAccordion
            key={plan.id}
            plan={plan}
            onUpdate={onUpdatePlan}
            onDelete={() => onDeletePlan(plan.id)}
            onEdit={() => onEditPlan(plan)}
            onAddItemForYear={(gradeId) => setAddItemTarget({ planId: plan.id, gradeId })}
          />
        ))}

        <TouchableOpacity onPress={onNewPlan} style={styles.newPlanButton}>
          <Text style={styles.newPlanButtonText}>+ 새 커리어 패스 만들기</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {addItemTarget && targetPlan && (
        <AddItemModal
          starId={targetPlan.starId}
          color={targetPlan.starColor || COLORS.primary}
          onAdd={handleAddItem}
          onClose={() => setAddItemTarget(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: SPACING.lg, gap: SPACING.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: '#fff' },
  headerCount: { fontSize: FONT_SIZES.xs, color: '#6B7280' },

  planCard: { borderRadius: BORDER_RADIUS.xl, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, overflow: 'hidden' },
  planHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.lg },
  planHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, flex: 1 },
  planHeaderInfo: { flex: 1, gap: 2 },
  planTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#fff' },
  planMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  planMetaText: { fontSize: 10, color: '#9CA3AF' },
  planMetaDivider: { fontSize: 10, color: '#4B5563' },
  chevron: { fontSize: 14, color: '#6B7280' },

  planBody: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg, gap: SPACING.md },
  planActions: { flexDirection: 'row', gap: SPACING.sm },
  actionButton: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.sm },
  actionButtonText: { fontSize: FONT_SIZES.xs, fontWeight: '700' },

  yearNode: { flexDirection: 'row', gap: SPACING.md },
  timelineTrack: { width: 20, alignItems: 'center' },
  timelineDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 3, marginTop: 4 },
  timelineLine: { width: 2, flex: 1, marginTop: 4 },
  yearContent: { flex: 1, gap: SPACING.sm, paddingBottom: SPACING.lg },

  yearHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  yearBadge: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: BORDER_RADIUS.sm },
  yearBadgeText: { fontSize: FONT_SIZES.sm, fontWeight: '700' },
  yearHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  yearProgress: { fontSize: 10, color: '#6B7280' },

  progressBarContainer: { height: 3, borderRadius: 1.5, backgroundColor: 'rgba(255,255,255,0.06)' },
  progressBar: { height: 3, borderRadius: 1.5 },

  yearBody: { gap: SPACING.md, marginTop: SPACING.xs },
  goalsSection: { gap: SPACING.sm },
  sectionLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: '#9CA3AF' },
  itemsSection: { gap: SPACING.sm },

  goalRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.lg, borderWidth: 1 },
  goalDot: { width: 6, height: 6, borderRadius: 3 },
  goalText: { flex: 1, fontSize: FONT_SIZES.sm, color: '#fff' },

  itemRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, padding: SPACING.md, borderRadius: BORDER_RADIUS.lg, borderWidth: 1 },
  checkButton: { marginTop: 2 },
  itemIcon: { width: 36, height: 36, borderRadius: BORDER_RADIUS.lg, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  itemContent: { flex: 1 },
  itemTitle: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#fff' },
  itemTitleChecked: { textDecorationLine: 'line-through', color: '#6B7280' },
  itemMeta: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: 4 },
  itemTypeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BORDER_RADIUS.full },
  itemTypeText: { fontSize: 9, fontWeight: '700' },
  itemMonthText: { fontSize: 9, color: '#6B7280' },
  deleteButton: { width: 28, height: 28, borderRadius: BORDER_RADIUS.sm, backgroundColor: 'rgba(239,68,68,0.1)', justifyContent: 'center', alignItems: 'center' },

  addItemButton: { paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderStyle: 'dashed', alignItems: 'center' },
  addItemText: { fontSize: FONT_SIZES.xs, fontWeight: '700' },

  newPlanButton: {
    paddingVertical: SPACING.lg, borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(108,92,231,0.3)',
    backgroundColor: 'rgba(108,92,231,0.06)', alignItems: 'center',
  },
  newPlanButtonText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: 'rgba(108,92,231,0.7)' },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xxxl, gap: SPACING.md },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: '#fff' },
  emptyDesc: { fontSize: FONT_SIZES.sm, color: '#6B7280', textAlign: 'center' },
  emptyButton: {
    marginTop: SPACING.md, paddingHorizontal: SPACING.xxl, paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg, backgroundColor: COLORS.primary,
  },
  emptyButtonText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: '#fff' },
});
