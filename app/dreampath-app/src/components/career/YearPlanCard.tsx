import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Linking,
} from 'react-native';
import { SPACING, FONT_SIZES, BORDER_RADIUS } from '../../config/theme';
import {
  CAREER_LABELS, CAREER_ITEM_TYPES, CAREER_GRADE_YEARS,
  type CareerYearPlan, type CareerPlanItem, type GoalActivityGroup,
} from '../../config/career-path';
import { AddItemModal } from './AddItemModal';
import { GoalTemplateSelector } from './GoalTemplateSelector';

const GOAL_COLOR = '#A78BFA';

interface YearPlanCardProps {
  yearPlan: CareerYearPlan;
  color: string;
  starId: string;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (y: CareerYearPlan) => void;
  onRemove: () => void;
}

export function YearPlanCard({
  yearPlan, color, starId, isExpanded, onToggle, onUpdate, onRemove,
}: YearPlanCardProps) {
  const [showAddItem, setShowAddItem] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [goalInput, setGoalInput] = useState('');
  const [showGoalTemplates, setShowGoalTemplates] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editingGoalText, setEditingGoalText] = useState('');
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<CareerPlanItem | null>(null);
  const [editingItemGoalId, setEditingItemGoalId] = useState<string | null>(null);

  // 목표-활동 그룹 구조로 변환 또는 기존 구조 사용
  const goalGroups: GoalActivityGroup[] = yearPlan.goalGroups ?? 
    (yearPlan.goals || []).map((goal, idx) => ({
      id: `goal-${idx}`,
      goal,
      items: [],
      isExpanded: true,
    }));

  const addGoal = () => {
    if (!goalInput.trim()) return;
    const newGoalGroup: GoalActivityGroup = {
      id: `goal-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      goal: goalInput.trim(),
      items: [],
      isExpanded: true,
    };
    onUpdate({ 
      ...yearPlan, 
      goalGroups: [...goalGroups, newGoalGroup],
      goals: [...(yearPlan.goals || []), goalInput.trim()],
    });
    setGoalInput('');
  };

  const removeGoal = (goalId: string) => {
    const updated = goalGroups.filter((g) => g.id !== goalId);
    onUpdate({ 
      ...yearPlan, 
      goalGroups: updated,
      goals: updated.map(g => g.goal),
    });
  };

  const selectGoalTemplate = (goal: string) => {
    const newGoalGroup: GoalActivityGroup = {
      id: `goal-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      goal,
      items: [],
      isExpanded: true,
    };
    onUpdate({ 
      ...yearPlan, 
      goalGroups: [...goalGroups, newGoalGroup],
      goals: [...(yearPlan.goals || []), goal],
    });
  };

  const saveEditGoal = (goalId: string) => {
    if (!editingGoalText.trim()) {
      removeGoal(goalId);
    } else {
      const updated = goalGroups.map((g) =>
        g.id === goalId ? { ...g, goal: editingGoalText.trim() } : g
      );
      onUpdate({ 
        ...yearPlan, 
        goalGroups: updated,
        goals: updated.map(g => g.goal),
      });
    }
    setEditingGoalId(null);
    setEditingGoalText('');
  };

  const addItemToGoal = (item: Omit<CareerPlanItem, 'id'>, goalId: string) => {
    const newItem: CareerPlanItem = { 
      ...item, 
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2)}` 
    };
    const updated = goalGroups.map((g) =>
      g.id === goalId ? { ...g, items: [...g.items, newItem] } : g
    );
    onUpdate({ ...yearPlan, goalGroups: updated });
    setShowAddItem(false);
    setSelectedGoalId(null);
  };

  const removeItem = (itemId: string, goalId: string) => {
    const updated = goalGroups.map((g) =>
      g.id === goalId ? { ...g, items: g.items.filter((it) => it.id !== itemId) } : g
    );
    onUpdate({ ...yearPlan, goalGroups: updated });
  };

  const updateItem = (itemId: string, goalId: string, updates: Partial<CareerPlanItem>) => {
    const updated = goalGroups.map((g) =>
      g.id === goalId 
        ? { ...g, items: g.items.map((it) => it.id === itemId ? { ...it, ...updates } : it) } 
        : g
    );
    onUpdate({ ...yearPlan, goalGroups: updated });
  };

  const toggleGoalExpand = (goalId: string) => {
    setExpandedGoalId(expandedGoalId === goalId ? null : goalId);
  };

  const totalItems = goalGroups.reduce((sum, g) => sum + g.items.length, 0);
  const totalGoals = goalGroups.length;

  const renderItemRow = (item: CareerPlanItem, goalId: string) => {
    const tc = CAREER_ITEM_TYPES.find((t) => t.value === item.type);
    const monthLabel =
      item.months.length === 1
        ? `${item.months[0]}월`
        : item.months.length <= 3
        ? item.months.map((m) => `${m}월`).join('·')
        : `${item.months[0]}~${item.months[item.months.length - 1]}월`;

    const isExpanded = expandedItemId === item.id;
    const hasDetails = item.url || item.description;

    return (
      <View key={item.id} style={[s.itemContainer, { backgroundColor: (tc?.color ?? color) + '10', borderColor: (tc?.color ?? color) + '22' }]}>
        <View style={s.itemRow}>
          <TouchableOpacity
            style={s.itemContentTouchable}
            onPress={() => { setEditingItem(item); setEditingItemGoalId(goalId); }}
            activeOpacity={0.7}
          >
            <Text style={s.itemEmoji}>{tc?.emoji ?? '📌'}</Text>
            <View style={s.itemInfo}>
              <Text style={s.itemTitle}>{item.title}</Text>
              <View style={s.itemMeta}>
                <Text style={[s.itemType, { color: tc?.color ?? color }]}>{tc?.label}</Text>
                <Text style={s.itemMonth}>📅 {monthLabel}</Text>
                {item.organizer && <Text style={s.itemOrganizer}>🏢 {item.organizer}</Text>}
              </View>
            </View>
          </TouchableOpacity>
          <View style={s.itemActions}>
            {hasDetails && (
              <TouchableOpacity onPress={() => setExpandedItemId(isExpanded ? null : item.id)} style={s.detailToggleBtn}>
                <Text style={[s.detailToggleText, { color: tc?.color ?? color }]}>{isExpanded ? '▲' : '▼'}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => removeItem(item.id, goalId)} style={s.removeItemBtn}>
              <Text style={s.removeItemText}>🗑</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {isExpanded && hasDetails && (
          <View style={[s.itemDetails, { borderTopColor: (tc?.color ?? color) + '20' }]}>
            {item.url && (
              <TouchableOpacity onPress={() => Linking.openURL(item.url!)} style={s.itemDetailRow}>
                <Text style={s.itemDetailLabel}>🔗 {CAREER_LABELS.itemUrl}</Text>
                <Text style={s.itemDetailLink} numberOfLines={1}>{item.url}</Text>
              </TouchableOpacity>
            )}
            {item.description && (
              <View style={s.itemDetailRow}>
                <Text style={s.itemDetailLabel}>📝 {CAREER_LABELS.itemDescription}</Text>
                <Text style={s.itemDetailText}>{item.description}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <>
      <View style={[s.yearCard, { borderColor: isExpanded ? color : color + '30', backgroundColor: isExpanded ? color + '10' : color + '06' }]}>
        <TouchableOpacity style={s.yearHeader} onPress={onToggle} activeOpacity={0.7}>
          <View style={[s.yearBadge, { backgroundColor: color }]}>
            <Text style={s.yearBadgeText}>{yearPlan.gradeLabel}</Text>
          </View>
          <View style={s.yearHeaderInfo}>
            <Text style={s.yearFullLabel}>{CAREER_GRADE_YEARS.find((g) => g.id === yearPlan.gradeId)?.fullLabel ?? yearPlan.gradeLabel}</Text>
            {totalGoals > 0 || totalItems > 0 ? (
              <View style={s.yearHeaderMeta}>
                {totalGoals > 0 && <Text style={s.yearMetaText}>🎯 {totalGoals}개 목표</Text>}
                {totalItems > 0 && <Text style={s.yearMetaText}>✨ {totalItems}개 활동</Text>}
              </View>
            ) : (
              <Text style={s.yearMetaEmpty}>탭해서 목표와 활동 추가하기</Text>
            )}
          </View>
          <Text style={s.chevron}>{isExpanded ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {isExpanded && (
          <View style={[s.yearBody, { borderTopColor: color + '20' }]}>
            {/* 목표 중심 구조 */}
            <View style={s.sectionHeader}>
              <Text style={s.sectionIcon}>🎯</Text>
              <Text style={s.sectionTitle}>목표와 세부 활동</Text>
              <Text style={s.sectionHint}>목표 먼저 추가</Text>
            </View>

            {/* 목표 목록 */}
            {goalGroups.map((goalGroup) => {
              const isGoalExpanded = expandedGoalId === goalGroup.id || goalGroup.isExpanded;
              
              return (
                <View key={goalGroup.id} style={[s.goalCard, { borderColor: GOAL_COLOR + '28', backgroundColor: GOAL_COLOR + '08' }]}>
                  {/* 목표 헤더 - 텍스트 탭 시 수정, chevron 탭 시 펼치기/접기 */}
                  <View style={s.goalHeader}>
                    <View style={s.goalHeaderContent}>
                      <View style={[s.goalDot, { backgroundColor: GOAL_COLOR }]} />
                      {editingGoalId === goalGroup.id ? (
                        <TextInput
                          value={editingGoalText}
                          onChangeText={setEditingGoalText}
                          onBlur={() => saveEditGoal(goalGroup.id)}
                          onSubmitEditing={() => saveEditGoal(goalGroup.id)}
                          style={s.goalInputInline}
                          autoFocus
                        />
                      ) : (
                        <TouchableOpacity
                          style={s.goalTextContainer}
                          onPress={() => { setEditingGoalId(goalGroup.id); setEditingGoalText(goalGroup.goal); }}
                          activeOpacity={0.7}
                        >
                          <Text style={s.goalText}>{goalGroup.goal}</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity onPress={() => toggleGoalExpand(goalGroup.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Text style={s.goalChevron}>{isGoalExpanded ? '▼' : '▶'}</Text>
                      </TouchableOpacity>
                    </View>
                    
                    <View style={s.goalActions}>
                      <TouchableOpacity 
                        onPress={() => { 
                          setEditingGoalId(goalGroup.id); 
                          setEditingGoalText(goalGroup.goal); 
                        }}
                        style={s.goalEditBtn}
                      >
                        <Text style={s.goalEditText}>✏️</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => removeGoal(goalGroup.id)} style={s.goalRemoveBtn}>
                        <Text style={s.goalRemoveText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* 세부 활동 목록 */}
                  {isGoalExpanded && (
                    <View style={s.goalBody}>
                      {goalGroup.items.length === 0 ? (
                        <TouchableOpacity 
                          onPress={() => { setSelectedGoalId(goalGroup.id); setShowAddItem(true); }}
                          style={[s.emptyActivities, { borderColor: color + '30' }]}
                        >
                          <Text style={s.emptyActivitiesText}>{CAREER_LABELS.goalNoActivity}</Text>
                          <Text style={[s.emptyActivitiesHint, { color }]}>+ {CAREER_LABELS.goalAddActivity}</Text>
                        </TouchableOpacity>
                      ) : (
                        <>
                          {goalGroup.items.map((item) => renderItemRow(item, goalGroup.id))}
                          <TouchableOpacity 
                            onPress={() => { setSelectedGoalId(goalGroup.id); setShowAddItem(true); }}
                            style={[s.addMoreButton, { borderColor: color + '30' }]}
                          >
                            <Text style={[s.addMoreText, { color }]}>+ 활동 추가</Text>
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  )}
                </View>
              );
            })}

            {/* 목표 추가 입력 */}
            {goalGroups.length < 5 && (
              <View style={s.goalInputRow}>
                <TextInput
                  value={goalInput}
                  onChangeText={setGoalInput}
                  onSubmitEditing={addGoal}
                  placeholder={`${yearPlan.gradeLabel} ${CAREER_LABELS.goalPlaceholder}`}
                  placeholderTextColor="#4B5563"
                  style={s.goalInput}
                  returnKeyType="done"
                />
                <TouchableOpacity onPress={() => setShowGoalTemplates(true)} style={[s.addGoalButton, { backgroundColor: GOAL_COLOR + '15', borderColor: GOAL_COLOR + '44' }]}>
                  <Text style={[s.addGoalButtonText, { color: GOAL_COLOR }]}>✨</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={addGoal} style={[s.addGoalButton, { backgroundColor: GOAL_COLOR + '25', borderColor: GOAL_COLOR + '44' }]}>
                  <Text style={[s.addGoalButtonText, { color: GOAL_COLOR }]}>+</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity onPress={onRemove} style={s.removeYearButton}>
              <Text style={s.removeYearText}>🗑 {CAREER_LABELS.gradeRemove}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {showGoalTemplates && (
        <GoalTemplateSelector onSelect={selectGoalTemplate} onClose={() => setShowGoalTemplates(false)} color={GOAL_COLOR} />
      )}

      {showAddItem && selectedGoalId && (
        <AddItemModal 
          starId={starId} 
          color={color} 
          onAdd={(item) => addItemToGoal(item, selectedGoalId)} 
          onClose={() => { setShowAddItem(false); setSelectedGoalId(null); }} 
        />
      )}

      {editingItem && editingItemGoalId && (
        <AddItemModal 
          starId={starId} 
          color={color} 
          initialItem={editingItem}
          onSave={(updated) => {
            updateItem(updated.id, editingItemGoalId, updated);
            setEditingItem(null);
            setEditingItemGoalId(null);
          }}
          onAdd={() => {}}
          onClose={() => { setEditingItem(null); setEditingItemGoalId(null); }} 
        />
      )}
    </>
  );
}

const s = StyleSheet.create({
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
  
  goalCard: { borderRadius: BORDER_RADIUS.xl, borderWidth: 1.5, overflow: 'hidden' },
  goalHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.md },
  goalHeaderContent: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  goalDot: { width: 8, height: 8, borderRadius: 4 },
  goalTextContainer: { flex: 1 },
  goalText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: '#fff' },
  goalChevron: { fontSize: 12, color: '#9CA3AF', marginLeft: SPACING.xs },
  goalActions: { flexDirection: 'row', gap: SPACING.xs },
  goalEditBtn: { width: 28, height: 28, borderRadius: BORDER_RADIUS.sm, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center' },
  goalEditText: { fontSize: 12 },
  goalRemoveBtn: { width: 28, height: 28, borderRadius: BORDER_RADIUS.sm, backgroundColor: 'rgba(239,68,68,0.1)', justifyContent: 'center', alignItems: 'center' },
  goalRemoveText: { fontSize: 14, color: '#EF4444' },
  
  goalBody: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.md, gap: SPACING.sm },
  emptyActivities: { paddingVertical: SPACING.lg, alignItems: 'center', gap: SPACING.xs, borderRadius: BORDER_RADIUS.lg, borderWidth: 1.5, borderStyle: 'dashed' },
  emptyActivitiesText: { fontSize: FONT_SIZES.xs, color: '#6B7280' },
  emptyActivitiesHint: { fontSize: FONT_SIZES.xs, fontWeight: '700' },
  
  goalInputRow: { flexDirection: 'row', gap: SPACING.sm },
  goalInput: { flex: 1, height: 40, paddingHorizontal: 12, borderRadius: BORDER_RADIUS.lg, fontSize: FONT_SIZES.sm, color: '#fff', backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  goalInputInline: { flex: 1, fontSize: FONT_SIZES.sm, fontWeight: '700', color: '#fff', paddingVertical: 4 },
  addGoalButton: { width: 40, height: 40, borderRadius: BORDER_RADIUS.lg, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  addGoalButtonText: { fontSize: 16, fontWeight: '700' },
  
  itemContainer: { borderRadius: BORDER_RADIUS.lg, borderWidth: 1, overflow: 'hidden' },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingHorizontal: 14, paddingVertical: SPACING.md },
  itemContentTouchable: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  itemEmoji: { fontSize: 18 },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#fff' },
  itemMeta: { flexDirection: 'row', gap: SPACING.sm, marginTop: 2, flexWrap: 'wrap' },
  itemType: { fontSize: 10, fontWeight: '700' },
  itemMonth: { fontSize: 10, color: '#6B7280' },
  itemOrganizer: { fontSize: 10, color: '#9CA3AF' },
  itemActions: { flexDirection: 'row', gap: SPACING.xs, alignItems: 'center' },
  detailToggleBtn: { width: 28, height: 28, borderRadius: BORDER_RADIUS.sm, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)' },
  detailToggleText: { fontSize: 10, fontWeight: '700' },
  removeItemBtn: { width: 28, height: 28, borderRadius: BORDER_RADIUS.sm, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)' },
  removeItemText: { fontSize: 12 },
  itemDetails: { paddingHorizontal: 14, paddingVertical: SPACING.md, borderTopWidth: 1, gap: SPACING.sm },
  itemDetailRow: { gap: 4 },
  itemDetailLabel: { fontSize: 10, fontWeight: '700', color: '#9CA3AF' },
  itemDetailLink: { fontSize: FONT_SIZES.xs, color: '#60A5FA', textDecorationLine: 'underline' },
  itemDetailText: { fontSize: FONT_SIZES.xs, color: '#D1D5DB', lineHeight: 18 },
  
  addMoreButton: { alignItems: 'center', paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderStyle: 'dashed' },
  addMoreText: { fontSize: FONT_SIZES.xs, fontWeight: '600' },
  removeYearButton: { alignItems: 'center', paddingVertical: SPACING.sm, marginTop: SPACING.md },
  removeYearText: { fontSize: FONT_SIZES.xs, color: '#6B7280' },
});
