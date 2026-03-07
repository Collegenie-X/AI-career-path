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

function ItemRow({
  item, color, onToggle, onDelete, onTitleSave,
}: {
  item: CareerPlanItem; color: string;
  onToggle: () => void; onDelete: () => void; onTitleSave: (title: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.title);
  const tc = CAREER_ITEM_TYPES.find((t) => t.value === item.type);
  const checked = !!item.checked;
  const monthLabel = item.months.length <= 3
    ? item.months.map((m) => `${m}월`).join('·')
    : `${item.months[0]}~${item.months[item.months.length - 1]}월`;

  const commit = () => {
    const t = draft.trim();
    if (t) onTitleSave(t);
    else setDraft(item.title);
    setEditing(false);
  };

  return (
    <View style={[styles.itemRow, {
      backgroundColor: checked ? 'rgba(255,255,255,0.02)' : (tc?.color ?? color) + '0e',
      borderColor: checked ? 'rgba(255,255,255,0.06)' : (tc?.color ?? color) + '28',
      opacity: checked ? 0.55 : 1,
    }]}>
      <TouchableOpacity onPress={onToggle} style={styles.checkButton}>
        <Text style={[styles.checkboxText, { color: checked ? (tc?.color ?? color) : 'rgba(255,255,255,0.25)' }]}>
          {checked ? '☑' : '☐'}
        </Text>
      </TouchableOpacity>
      <View style={[styles.itemIcon, { backgroundColor: (tc?.color ?? color) + '1a', borderColor: (tc?.color ?? color) + '30' }]}>
        <Text style={{ fontSize: 16 }}>{tc?.emoji ?? '📌'}</Text>
      </View>
      <View style={styles.itemContent}>
        {editing ? (
          <TextInput
            value={draft}
            onChangeText={setDraft}
            onBlur={commit}
            onSubmitEditing={commit}
            style={[styles.itemTitleInput, { borderColor: tc?.color ?? color }]}
            placeholderTextColor="#4B5563"
            autoFocus
          />
        ) : (
          <TouchableOpacity onPress={() => { setDraft(item.title); setEditing(true); }} style={styles.itemTitleTouch}>
            <Text style={[styles.itemTitle, checked && styles.itemTitleChecked]} numberOfLines={1}>{item.title}</Text>
          </TouchableOpacity>
        )}
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

function GoalRow({ goal, color, onSave, onDelete }: {
  goal: string; color: string; onSave: (v: string) => void; onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(goal);

  const commit = () => {
    const t = draft.trim();
    if (t) onSave(t);
    else onDelete();
    setEditing(false);
  };

  return (
    <View style={[styles.goalRow, { backgroundColor: color + '10', borderColor: color + '1e' }]}>
      <View style={[styles.goalDot, { backgroundColor: color }]} />
      {editing ? (
        <TextInput
          value={draft}
          onChangeText={setDraft}
          onBlur={commit}
          onSubmitEditing={commit}
          style={styles.goalInput}
          placeholderTextColor="#4B5563"
          autoFocus
        />
      ) : (
        <TouchableOpacity style={styles.goalTextWrap} onPress={() => { setDraft(goal); setEditing(true); }}>
          <Text style={styles.goalText} numberOfLines={1}>{goal}</Text>
        </TouchableOpacity>
      )}
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
  const groupItems = (year.groups ?? []).flatMap((g) => g.items);
  const allItems = [...year.items, ...groupItems];
  const checkedCount = allItems.filter((it) => it.checked).length;
  const totalCount = allItems.length;
  const progress = totalCount > 0 ? checkedCount / totalCount : 0;

  const toggleItemCheck = (itemId: string) => {
    onUpdate({
      ...year,
      items: year.items.map((it) => it.id === itemId ? { ...it, checked: !it.checked } : it),
    });
  };

  const toggleCheckInGroup = (groupId: string, itemId: string) => {
    const groups = (year.groups ?? []).map((g) =>
      g.id === groupId ? { ...g, items: g.items.map((it) => it.id === itemId ? { ...it, checked: !it.checked } : it) } : g
    );
    onUpdate({ ...year, groups });
  };

  const deleteItem = (itemId: string) => {
    onUpdate({ ...year, items: year.items.filter((it) => it.id !== itemId) });
  };

  const deleteItemFromGroup = (groupId: string, itemId: string) => {
    const groups = (year.groups ?? []).map((g) =>
      g.id === groupId ? { ...g, items: g.items.filter((it) => it.id !== itemId) } : g
    );
    onUpdate({ ...year, groups });
  };

  const saveItemTitle = (itemId: string, title: string) => {
    onUpdate({ ...year, items: year.items.map((it) => it.id === itemId ? { ...it, title } : it) });
  };

  const saveItemTitleInGroup = (groupId: string, itemId: string, title: string) => {
    const groups = (year.groups ?? []).map((g) =>
      g.id === groupId ? { ...g, items: g.items.map((it) => it.id === itemId ? { ...it, title } : it) } : g
    );
    onUpdate({ ...year, groups });
  };

  const saveGoal = (idx: number, value: string) => {
    const goals = [...year.goals];
    goals[idx] = value;
    onUpdate({ ...year, goals });
  };

  const deleteGoal = (idx: number) => {
    onUpdate({ ...year, goals: year.goals.filter((_, i) => i !== idx) });
  };

  return (
    <View style={styles.yearNode}>
      <View style={styles.timelineTrack}>
        <View style={[styles.gradeBadge, { backgroundColor: color, shadowColor: color }]}>
          <Text style={styles.gradeBadgeText}>{year.gradeLabel}</Text>
        </View>
        {!isLast && <View style={[styles.timelineLine, { backgroundColor: color + '25' }]} />}
      </View>

      <View style={styles.yearContent}>
        <TouchableOpacity onPress={() => setExpanded(!expanded)} style={styles.yearHeader} activeOpacity={0.7}>
          <View style={styles.yearHeaderLeft}>
            <Text style={styles.yearFullLabel}>{grade?.fullLabel ?? year.gradeLabel}</Text>
            <Text style={styles.yearItemCount}>{totalCount}개 항목</Text>
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
                <Text style={styles.sectionLabel}>⊙ {CAREER_LABELS.goalTitle}</Text>
                {year.goals.map((goal, i) => (
                  <GoalRow
                    key={i}
                    goal={goal}
                    color={color}
                    onSave={(v) => saveGoal(i, v)}
                    onDelete={() => deleteGoal(i)}
                  />
                ))}
              </View>
            )}

            {(year.groups ?? []).map((group) => (
              <View key={group.id} style={styles.groupSection}>
                <Text style={[styles.groupLabel, { color }]}>{group.label}</Text>
                {group.items.map((item) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    color={color}
                    onToggle={() => toggleCheckInGroup(group.id, item.id)}
                    onDelete={() => deleteItemFromGroup(group.id, item.id)}
                    onTitleSave={(title) => saveItemTitleInGroup(group.id, item.id, title)}
                  />
                ))}
              </View>
            ))}

            {year.items.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                color={color}
                onToggle={() => toggleItemCheck(item.id)}
                onDelete={() => deleteItem(item.id)}
                onTitleSave={(title) => saveItemTitle(item.id, title)}
              />
            ))}

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
  const totalItems = plan.years.reduce(
    (s, y) => s + y.items.length + (y.groups ?? []).reduce((sg, g) => sg + g.items.length, 0),
    0,
  );
  const checkedItems = plan.years.reduce(
    (s, y) =>
      s +
      y.items.filter((it) => it.checked).length +
      (y.groups ?? []).reduce((sg, g) => sg + g.items.filter((it) => it.checked).length, 0),
    0,
  );

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

  yearNode: { flexDirection: 'row' },
  timelineTrack: { width: 38, alignItems: 'center' },
  gradeBadge: {
    width: 38, height: 38, borderRadius: 19,
    justifyContent: 'center', alignItems: 'center',
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10,
    elevation: 6, zIndex: 1,
  },
  gradeBadgeText: { fontSize: 11, fontWeight: '900', color: '#fff' },
  timelineLine: { width: 2, flex: 1, marginTop: 4 },
  yearContent: { flex: 1, gap: SPACING.sm, paddingLeft: SPACING.md, paddingBottom: SPACING.xxl, paddingTop: 2 },

  yearHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  yearHeaderLeft: { flex: 1 },
  yearFullLabel: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: '#fff' },
  yearItemCount: { fontSize: 11, color: '#6B7280', marginTop: 1 },
  yearHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  yearProgress: { fontSize: 10, color: '#6B7280' },

  progressBarContainer: { height: 3, borderRadius: 1.5, backgroundColor: 'rgba(255,255,255,0.06)' },
  progressBar: { height: 3, borderRadius: 1.5 },

  yearBody: { gap: SPACING.md, marginTop: SPACING.xs },
  goalsSection: { gap: SPACING.sm },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#6B7280', letterSpacing: 0.5 },
  itemsSection: { gap: SPACING.sm },
  groupSection: { gap: SPACING.sm },
  groupLabel: { fontSize: 11, fontWeight: '700', marginBottom: SPACING.xs },
  goalInput: { flex: 1, fontSize: FONT_SIZES.sm, color: '#fff', paddingVertical: 4 },
  goalTextWrap: { flex: 1 },

  goalRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.lg, borderWidth: 1 },
  goalDot: { width: 6, height: 6, borderRadius: 3 },
  goalText: { flex: 1, fontSize: FONT_SIZES.sm, color: '#fff' },

  itemRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, padding: SPACING.md, borderRadius: BORDER_RADIUS.lg, borderWidth: 1 },
  checkButton: { marginTop: 2 },
  checkboxText: { fontSize: 14 },
  itemIcon: { width: 36, height: 36, borderRadius: BORDER_RADIUS.lg, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  itemContent: { flex: 1 },
  itemTitleTouch: { minHeight: 22 },
  itemTitle: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#fff' },
  itemTitleInput: { fontSize: FONT_SIZES.sm, color: '#fff', paddingVertical: 4, borderBottomWidth: 1 },
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
