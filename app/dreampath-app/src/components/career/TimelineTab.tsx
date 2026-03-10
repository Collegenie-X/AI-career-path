import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../config/theme';
import {
  CAREER_LABELS, CAREER_ITEM_TYPES, CAREER_GRADE_YEARS,
  type CareerPlan, type CareerYearPlan, type CareerPlanItem,
} from '../../config/career-path';
import { AddItemModal } from './AddItemModal';
import { ItemDetailModal } from './ItemDetailModal';

interface TimelineTabProps {
  plans: CareerPlan[];
  onUpdatePlan: (plan: CareerPlan) => void;
  onDeletePlan: (planId: string) => void;
  onEditPlan: (plan: CareerPlan) => void;
  onNewPlan: () => void;
}

// ─── ItemRow ────────────────────────────────────────────────────────────────

interface ItemRowProps {
  item: CareerPlanItem;
  color: string;
  isEditMode: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onTitleSave: (title: string) => void;
  onItemDetailPress?: () => void;
}

function ItemRow({ item, color, isEditMode, onToggle, onDelete, onTitleSave, onItemDetailPress }: ItemRowProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.title);
  const tc = CAREER_ITEM_TYPES.find((t) => t.value === item.type);
  const checked = !!item.checked;
  const monthLabel =
    item.months.length <= 3
      ? item.months.map((m) => `${m}월`).join('·')
      : `${item.months[0]}~${item.months[item.months.length - 1]}월`;

  const commitTitleEdit = () => {
    const trimmed = draft.trim();
    if (trimmed) onTitleSave(trimmed);
    else setDraft(item.title);
    setEditing(false);
  };

  const handleTitlePress = () => {
    if (isEditMode) {
      setDraft(item.title);
      setEditing(true);
    } else {
      onItemDetailPress?.();
    }
  };

  return (
    <View
      style={[
        styles.itemRow,
        {
          backgroundColor: checked ? 'rgba(255,255,255,0.02)' : (tc?.color ?? color) + '0e',
          borderColor: checked ? 'rgba(255,255,255,0.06)' : (tc?.color ?? color) + '28',
          opacity: checked ? 0.55 : 1,
        },
      ]}
    >
      <TouchableOpacity onPress={onToggle} style={styles.checkButton}>
        <Text style={[styles.checkboxText, { color: checked ? (tc?.color ?? color) : 'rgba(255,255,255,0.25)' }]}>
          {checked ? '☑' : '☐'}
        </Text>
      </TouchableOpacity>

      <View style={styles.itemContent}>
        {editing ? (
          <TextInput
            value={draft}
            onChangeText={setDraft}
            onBlur={commitTitleEdit}
            onSubmitEditing={commitTitleEdit}
            style={[styles.itemTitleInput, { borderColor: tc?.color ?? color }]}
            placeholderTextColor="#4B5563"
            autoFocus
          />
        ) : (
          <TouchableOpacity onPress={handleTitlePress} style={styles.itemTitleTouch}>
            <Text style={[styles.itemTitle, checked && styles.itemTitleChecked]} numberOfLines={1}>
              {item.title}
            </Text>
          </TouchableOpacity>
        )}
        <View style={styles.itemMeta}>
          <View style={[styles.itemTypeBadge, { backgroundColor: (tc?.color ?? color) + '22' }]}>
            <Text style={[styles.itemTypeText, { color: tc?.color ?? color }]}>{tc?.label}</Text>
          </View>
          <Text style={styles.itemMonthText}>📅 {monthLabel}</Text>
        </View>
      </View>

      {isEditMode && (
        <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
          <Text style={{ fontSize: 12, color: '#EF4444' }}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── GoalRow ─────────────────────────────────────────────────────────────────

interface GoalRowProps {
  goal: string;
  color: string;
  isEditMode: boolean;
  onSave: (value: string) => void;
  onDelete: () => void;
}

function GoalRow({ goal, color, isEditMode, onSave, onDelete }: GoalRowProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(goal);

  const commitGoalEdit = () => {
    const trimmed = draft.trim();
    if (trimmed) onSave(trimmed);
    else onDelete();
    setEditing(false);
  };

  const handleGoalPress = () => {
    if (!isEditMode) return;
    setDraft(goal);
    setEditing(true);
  };

  return (
    <View style={[styles.goalRow, { backgroundColor: color + '10', borderColor: color + '1e' }]}>
      <View style={[styles.goalDot, { backgroundColor: color }]} />
      {editing ? (
        <TextInput
          value={draft}
          onChangeText={setDraft}
          onBlur={commitGoalEdit}
          onSubmitEditing={commitGoalEdit}
          style={styles.goalInput}
          placeholderTextColor="#4B5563"
          autoFocus
        />
      ) : (
        <TouchableOpacity style={styles.goalTextWrap} onPress={handleGoalPress} disabled={!isEditMode}>
          <Text style={styles.goalText} numberOfLines={1}>{goal}</Text>
        </TouchableOpacity>
      )}
      {isEditMode && (
        <TouchableOpacity onPress={onDelete}>
          <Text style={{ fontSize: 10, color: '#EF4444' }}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── YearNode ─────────────────────────────────────────────────────────────────

interface YearNodeProps {
  year: CareerYearPlan;
  color: string;
  isLast: boolean;
  isEditMode: boolean;
  onUpdate: (y: CareerYearPlan) => void;
  onAddItem: () => void;
  onItemDetailPress?: (item: CareerPlanItem) => void;
}

function YearNode({ year, color, isLast, isEditMode, onUpdate, onAddItem, onItemDetailPress }: YearNodeProps) {
  const [expanded, setExpanded] = useState(true);
  const [expandedGoalIds, setExpandedGoalIds] = useState<Set<string>>(() =>
    new Set((year.goalGroups ?? []).map((g) => g.id)),
  );
  const grade = CAREER_GRADE_YEARS.find((g) => g.id === year.gradeId);

  const toggleGoalExpand = (goalId: string) => {
    setExpandedGoalIds((prev) => {
      const next = new Set(prev);
      if (next.has(goalId)) next.delete(goalId);
      else next.add(goalId);
      return next;
    });
  };

  const goalGroupIdList = (year.goalGroups ?? []).map((g) => g.id).join(',');
  useEffect(() => {
    const groups = year.goalGroups ?? [];
    setExpandedGoalIds((prev) => {
      const next = new Set(prev);
      groups.forEach((g) => next.add(g.id));
      return next;
    });
  }, [year.gradeId, goalGroupIdList]);

  const groupItems = (year.groups ?? []).flatMap((g) => g.items);
  const goalGroups = year.goalGroups ?? [];
  const goalGroupItems = goalGroups.flatMap((g) => g.items);
  const allItems = year.items.length > 0 || groupItems.length > 0
    ? [...year.items, ...groupItems]
    : goalGroupItems;
  const checkedCount = allItems.filter((it) => it.checked).length;
  const totalCount = allItems.length;
  const progress = totalCount > 0 ? checkedCount / totalCount : 0;

  const toggleItemCheck = (itemId: string) => {
    if (year.items.some((it) => it.id === itemId)) {
      onUpdate({
        ...year,
        items: year.items.map((it) => (it.id === itemId ? { ...it, checked: !it.checked } : it)),
      });
    } else {
      const goalGroups = (year.goalGroups ?? []).map((g) =>
        g.items.some((it) => it.id === itemId)
          ? { ...g, items: g.items.map((it) => (it.id === itemId ? { ...it, checked: !it.checked } : it)) }
          : g,
      );
      onUpdate({ ...year, goalGroups });
    }
  };

  const toggleCheckInGroup = (groupId: string, itemId: string) => {
    const groups = (year.groups ?? []).map((g) =>
      g.id === groupId
        ? { ...g, items: g.items.map((it) => (it.id === itemId ? { ...it, checked: !it.checked } : it)) }
        : g,
    );
    onUpdate({ ...year, groups });
  };

  const deleteItem = (itemId: string) => {
    if (year.items.some((it) => it.id === itemId)) {
      onUpdate({ ...year, items: year.items.filter((it) => it.id !== itemId) });
    } else {
      const goalGroups = (year.goalGroups ?? []).map((g) =>
        ({ ...g, items: g.items.filter((it) => it.id !== itemId) }),
      );
      onUpdate({ ...year, goalGroups });
    }
  };

  const deleteItemFromGroup = (groupId: string, itemId: string) => {
    const groups = (year.groups ?? []).map((g) =>
      g.id === groupId ? { ...g, items: g.items.filter((it) => it.id !== itemId) } : g,
    );
    onUpdate({ ...year, groups });
  };

  const saveItemTitle = (itemId: string, title: string) => {
    if (year.items.some((it) => it.id === itemId)) {
      onUpdate({ ...year, items: year.items.map((it) => (it.id === itemId ? { ...it, title } : it)) });
    } else {
      const goalGroups = (year.goalGroups ?? []).map((g) =>
        g.items.some((it) => it.id === itemId)
          ? { ...g, items: g.items.map((it) => (it.id === itemId ? { ...it, title } : it)) }
          : g,
      );
      onUpdate({ ...year, goalGroups });
    }
  };

  const saveItemTitleInGroup = (groupId: string, itemId: string, title: string) => {
    const groups = (year.groups ?? []).map((g) =>
      g.id === groupId
        ? { ...g, items: g.items.map((it) => (it.id === itemId ? { ...it, title } : it)) }
        : g,
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
            <Text style={styles.yearItemCount}>
              {goalGroups.length > 0
                ? `${goalGroups.length}개 목표 · ${totalCount}개 활동`
                : `${totalCount}개 항목`}
            </Text>
          </View>
          <View style={styles.yearHeaderRight}>
            {totalCount > 0 && <Text style={styles.yearProgress}>{checkedCount}/{totalCount}</Text>}
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
            {/* 목표-활동 그룹 구조: 목표만 있어도 항상 표시 */}
            {goalGroups.length > 0 ? (
              <View style={styles.goalGroupsSection}>
                <Text style={styles.sectionLabel}>⊙ {CAREER_LABELS.goalTitle}</Text>
                {goalGroups.map((group) => {
                  const isGoalExpanded = expandedGoalIds.has(group.id);
                  return (
                  <View key={group.id} style={[styles.goalGroupCard, { borderColor: color + '28', backgroundColor: color + '08' }]}>
                    <TouchableOpacity
                      style={[styles.goalGroupHeader, { borderBottomColor: group.items.length > 0 ? color + '18' : 'transparent' }]}
                      onPress={() => toggleGoalExpand(group.id)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.goalDot, { backgroundColor: color }]} />
                      <Text style={[styles.goalGroupTitle, { color }]}>{group.goal}</Text>
                      <Text style={styles.goalGroupChevron}>{isGoalExpanded ? '▾' : '▸'}</Text>
                    </TouchableOpacity>
                    {isGoalExpanded && group.items.length > 0 ? (
                      <View style={styles.goalGroupItems}>
                        {group.items.map((item) => (
                          <ItemRow
                            key={item.id}
                            item={item}
                            color={color}
                            isEditMode={isEditMode}
                            onToggle={() => toggleItemCheck(item.id)}
                            onDelete={() => deleteItem(item.id)}
                            onTitleSave={(title) => saveItemTitle(item.id, title)}
                            onItemDetailPress={onItemDetailPress ? () => onItemDetailPress(item) : undefined}
                          />
                        ))}
                      </View>
                    ) : isGoalExpanded ? (
                      <View style={[styles.goalGroupEmpty, { borderColor: color + '20' }]}>
                        <Text style={styles.goalGroupEmptyText}>{CAREER_LABELS.goalNoActivity}</Text>
                      </View>
                    ) : null}
                  </View>
                  );
                })}
              </View>
            ) : (
              <>
                {/* 레거시: goals만 있는 구조 */}
                {year.goals.length > 0 && (
                  <View style={styles.goalsSection}>
                    <Text style={styles.sectionLabel}>⊙ {CAREER_LABELS.goalTitle}</Text>
                    {year.goals.map((goal, i) => (
                      <GoalRow
                        key={i}
                        goal={goal}
                        color={color}
                        isEditMode={isEditMode}
                        onSave={(v) => saveGoal(i, v)}
                        onDelete={() => deleteGoal(i)}
                      />
                    ))}
                  </View>
                )}

                {(year.items.length > 0 || (year.groups ?? []).length > 0) && (
                  <>
                    {(year.groups ?? []).map((group) => (
                      <View key={group.id} style={styles.groupSection}>
                        <Text style={[styles.groupLabel, { color }]}>{group.label}</Text>
                        {group.items.map((item) => (
                          <ItemRow
                            key={item.id}
                            item={item}
                            color={color}
                            isEditMode={isEditMode}
                            onToggle={() => toggleCheckInGroup(group.id, item.id)}
                            onDelete={() => deleteItemFromGroup(group.id, item.id)}
                            onTitleSave={(title) => saveItemTitleInGroup(group.id, item.id, title)}
                            onItemDetailPress={onItemDetailPress ? () => onItemDetailPress(item) : undefined}
                          />
                        ))}
                      </View>
                    ))}
                    {year.items.map((item) => (
                      <ItemRow
                        key={item.id}
                        item={item}
                        color={color}
                        isEditMode={isEditMode}
                        onToggle={() => toggleItemCheck(item.id)}
                        onDelete={() => deleteItem(item.id)}
                        onTitleSave={(title) => saveItemTitle(item.id, title)}
                        onItemDetailPress={onItemDetailPress ? () => onItemDetailPress(item) : undefined}
                      />
                    ))}
                  </>
                )}
              </>
            )}

            {isEditMode && (
              <TouchableOpacity onPress={onAddItem} style={[styles.addItemButton, { borderColor: color + '35' }]}>
                <Text style={[styles.addItemText, { color: color + '99' }]}>+ {CAREER_LABELS.timelineAddItem}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

// ─── PlanTitleEditor ──────────────────────────────────────────────────────────

interface PlanTitleEditorProps {
  title: string;
  color: string;
  onSave: (title: string) => void;
}

function PlanTitleEditor({ title, color, onSave }: PlanTitleEditorProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);

  const commitTitleEdit = () => {
    const trimmed = draft.trim();
    if (trimmed) onSave(trimmed);
    else setDraft(title);
    setEditing(false);
  };

  if (editing) {
    return (
      <TextInput
        value={draft}
        onChangeText={setDraft}
        onBlur={commitTitleEdit}
        onSubmitEditing={commitTitleEdit}
        style={[styles.planTitleInput, { borderColor: color }]}
        placeholderTextColor="#4B5563"
        placeholder={CAREER_LABELS.timelinePlanTitlePlaceholder}
        autoFocus
      />
    );
  }

  return (
    <TouchableOpacity onPress={() => { setDraft(title); setEditing(true); }} style={styles.planTitleTouch}>
      <Text style={styles.planTitle} numberOfLines={1}>{title}</Text>
      <Text style={[styles.planTitleEditHint, { color: color + '80' }]}>✏️</Text>
    </TouchableOpacity>
  );
}

// ─── PlanAccordion ────────────────────────────────────────────────────────────

interface PlanAccordionProps {
  plan: CareerPlan;
  onUpdate: (p: CareerPlan) => void;
  onDelete: () => void;
  onEdit: () => void;
  onAddItemForYear: (gradeId: string) => void;
  onItemDetailPress?: (item: CareerPlanItem, gradeLabel: string) => void;
}

function PlanAccordion({ plan, onUpdate, onDelete, onEdit, onAddItemForYear, onItemDetailPress }: PlanAccordionProps) {
  const [expanded, setExpanded] = useState(true);
  const color = plan.starColor || COLORS.primary;

  const totalItems = plan.years.reduce(
    (s, y) =>
      s +
      y.items.length +
      (y.groups ?? []).reduce((sg, g) => sg + g.items.length, 0) +
      (y.goalGroups ?? []).reduce((sg, g) => sg + g.items.length, 0),
    0,
  );
  const checkedItems = plan.years.reduce(
    (s, y) =>
      s +
      y.items.filter((it) => it.checked).length +
      (y.groups ?? []).reduce((sg, g) => sg + g.items.filter((it) => it.checked).length, 0) +
      (y.goalGroups ?? []).reduce((sg, g) => sg + g.items.filter((it) => it.checked).length, 0),
    0,
  );

  const handleUpdateYear = (updatedYear: CareerYearPlan) => {
    onUpdate({
      ...plan,
      years: plan.years.map((y) => (y.gradeId === updatedYear.gradeId ? updatedYear : y)),
    });
  };

  const handleTitleSave = (title: string) => {
    onUpdate({ ...plan, title });
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
      {/* 플랜 헤더 */}
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        style={styles.planHeader}
        activeOpacity={0.7}
      >
        <View style={styles.planHeaderLeft}>
          <Text style={{ fontSize: 28 }}>{plan.starEmoji}</Text>
          <View style={styles.planHeaderInfo}>
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
          {/* 제목 (항상 인라인 수정 가능) */}
          <PlanTitleEditor title={plan.title} color={color} onSave={handleTitleSave} />

          {/* 액션 버튼 영역 */}
          <View style={styles.planActions}>
            <TouchableOpacity
              onPress={onEdit}
              style={[styles.actionButton, { backgroundColor: color + '18', flex: 1 }]}
            >
              <Text style={[styles.actionButtonText, { color }]}>✏️ 수정하기</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDeleteConfirm}
              style={[styles.actionButton, { backgroundColor: 'rgba(239,68,68,0.1)' }]}
            >
              <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>🗑</Text>
            </TouchableOpacity>
          </View>

          {/* 연도별 타임라인 */}
          {plan.years.map((year, idx) => (
            <YearNode
              key={year.gradeId}
              year={year}
              color={color}
              isLast={idx === plan.years.length - 1}
              isEditMode={false}
              onUpdate={handleUpdateYear}
              onAddItem={() => onAddItemForYear(year.gradeId)}
              onItemDetailPress={onItemDetailPress ? (item) => onItemDetailPress(item, year.gradeLabel) : undefined}
            />
          ))}
        </View>
      )}
    </View>
  );
}

// ─── TimelineTab (메인) ───────────────────────────────────────────────────────

export function TimelineTab({ plans, onUpdatePlan, onDeletePlan, onEditPlan, onNewPlan }: TimelineTabProps) {
  const [addItemTarget, setAddItemTarget] = useState<{ planId: string; gradeId: string } | null>(null);
  const [detailItem, setDetailItem] = useState<{ item: CareerPlanItem; gradeLabel: string; color: string } | null>(null);

  const targetPlan = addItemTarget ? plans.find((p) => p.id === addItemTarget.planId) : null;

  const handleAddItem = (item: Omit<CareerPlanItem, 'id'>) => {
    if (!addItemTarget || !targetPlan) return;
    const newItem: CareerPlanItem = {
      ...item,
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    };
    const updatedPlan: CareerPlan = {
      ...targetPlan,
      years: targetPlan.years.map((y) =>
        y.gradeId === addItemTarget.gradeId ? { ...y, items: [...y.items, newItem] } : y,
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
            onItemDetailPress={(item, gradeLabel) =>
              setDetailItem({ item, gradeLabel, color: plan.starColor || COLORS.primary })
            }
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

      {detailItem && (
        <ItemDetailModal
          visible={true}
          item={detailItem.item}
          gradeLabel={detailItem.gradeLabel}
          color={detailItem.color}
          onClose={() => setDetailItem(null)}
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: SPACING.lg, gap: SPACING.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: '#fff' },
  headerCount: { fontSize: FONT_SIZES.xs, color: '#6B7280' },

  planCard: {
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    overflow: 'hidden',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.lg,
  },
  planHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, flex: 1 },
  planHeaderInfo: { flex: 1, gap: 2 },
  planMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  planMetaText: { fontSize: 10, color: '#9CA3AF' },
  planMetaDivider: { fontSize: 10, color: '#4B5563' },
  chevron: { fontSize: 14, color: '#6B7280' },

  planBody: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg, gap: SPACING.md },

  planTitleTouch: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  planTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#fff', flex: 1 },
  planTitleEditHint: { fontSize: 12 },
  planTitleInput: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: '#fff',
    borderBottomWidth: 1.5,
    paddingVertical: 4,
  },

  planActions: { flexDirection: 'row', gap: SPACING.sm },
  actionButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
  },
  actionButtonText: { fontSize: FONT_SIZES.xs, fontWeight: '700' },

  yearNode: { flexDirection: 'row' },
  timelineTrack: { width: 38, alignItems: 'center' },
  gradeBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
    zIndex: 1,
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
  goalGroupsSection: { gap: SPACING.md },
  goalGroupCard: {
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  goalGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
  },
  goalGroupTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', flex: 1 },
  goalGroupChevron: { fontSize: 14, color: '#6B7280' },
  goalGroupItems: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, gap: SPACING.sm },
  goalGroupEmpty: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderTopWidth: 1,
    borderStyle: 'dashed',
  },
  goalGroupEmptyText: { fontSize: FONT_SIZES.xs, color: '#6B7280', textAlign: 'center' },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#6B7280', letterSpacing: 0.5 },
  groupSection: { gap: SPACING.sm },
  groupLabel: { fontSize: 11, fontWeight: '700', marginBottom: SPACING.xs },

  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
  },
  goalDot: { width: 6, height: 6, borderRadius: 3 },
  goalText: { flex: 1, fontSize: FONT_SIZES.sm, color: '#fff' },
  goalTextWrap: { flex: 1 },
  goalInput: { flex: 1, fontSize: FONT_SIZES.sm, color: '#fff', paddingVertical: 4 },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
  },
  checkButton: { marginTop: 2 },
  checkboxText: { fontSize: 14 },
  itemContent: { flex: 1 },
  itemTitleTouch: { minHeight: 22 },
  itemTitle: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#fff' },
  itemTitleInput: { fontSize: FONT_SIZES.sm, color: '#fff', paddingVertical: 4, borderBottomWidth: 1 },
  itemTitleChecked: { textDecorationLine: 'line-through', color: '#6B7280' },
  itemMeta: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: 4 },
  itemTypeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BORDER_RADIUS.full },
  itemTypeText: { fontSize: 9, fontWeight: '700' },
  itemMonthText: { fontSize: 9, color: '#6B7280' },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: 'rgba(239,68,68,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  addItemButton: {
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  addItemText: { fontSize: FONT_SIZES.xs, fontWeight: '700' },

  newPlanButton: {
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(108,92,231,0.3)',
    backgroundColor: 'rgba(108,92,231,0.06)',
    alignItems: 'center',
  },
  newPlanButtonText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: 'rgba(108,92,231,0.7)' },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxxl,
    gap: SPACING.md,
  },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: '#fff' },
  emptyDesc: { fontSize: FONT_SIZES.sm, color: '#6B7280', textAlign: 'center' },
  emptyButton: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.primary,
  },
  emptyButtonText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: '#fff' },
});
