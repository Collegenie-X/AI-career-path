import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView,
} from 'react-native';
import { SPACING, FONT_SIZES, BORDER_RADIUS } from '../../config/theme';
import {
  CAREER_LABELS, CAREER_ITEM_TYPES, CAREER_GRADE_YEARS,
  type CareerYearPlan, type CareerPlanItem, type CareerPlanGroup,
} from '../../config/career-path';
import { AddItemModal } from './AddItemModal';
import { GoalTemplateSelector } from './GoalTemplateSelector';

const SEMESTER_PRESETS = ['1학기', '2학기', '여름방학', '겨울방학'];

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
  const [addItemGroupId, setAddItemGroupId] = useState<string | undefined>(undefined);
  const [goalInput, setGoalInput] = useState('');
  const [showGoalTemplates, setShowGoalTemplates] = useState(false);
  const [editingGoalIdx, setEditingGoalIdx] = useState<number | null>(null);
  const [editingGoalText, setEditingGoalText] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingItemTitle, setEditingItemTitle] = useState('');
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [groupInput, setGroupInput] = useState('');
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupLabel, setEditingGroupLabel] = useState('');

  const addGoal = () => {
    if (!goalInput.trim()) return;
    onUpdate({ ...yearPlan, goals: [...yearPlan.goals, goalInput.trim()] });
    setGoalInput('');
  };

  const removeGoal = (idx: number) => {
    onUpdate({ ...yearPlan, goals: yearPlan.goals.filter((_, i) => i !== idx) });
  };

  const selectGoalTemplate = (goal: string) => {
    onUpdate({ ...yearPlan, goals: [...yearPlan.goals, goal] });
  };

  const saveEditGoal = () => {
    if (editingGoalIdx === null) return;
    if (!editingGoalText.trim()) removeGoal(editingGoalIdx);
    else {
      const g = [...yearPlan.goals];
      g[editingGoalIdx] = editingGoalText.trim();
      onUpdate({ ...yearPlan, goals: g });
    }
    setEditingGoalIdx(null);
    setEditingGoalText('');
  };

  const addItem = (item: Omit<CareerPlanItem, 'id'>) => {
    const newItem: CareerPlanItem = { ...item, id: `item-${Date.now()}-${Math.random().toString(36).slice(2)}` };
    if (addItemGroupId) {
      const groups = (yearPlan.groups ?? []).map((g) =>
        g.id === addItemGroupId ? { ...g, items: [...g.items, newItem] } : g
      );
      onUpdate({ ...yearPlan, groups });
    } else {
      onUpdate({ ...yearPlan, items: [...yearPlan.items, newItem] });
    }
    setShowAddItem(false);
    setAddItemGroupId(undefined);
  };

  const removeItem = (id: string, groupId?: string) => {
    if (groupId) {
      const groups = (yearPlan.groups ?? []).map((g) =>
        g.id === groupId ? { ...g, items: g.items.filter((it) => it.id !== id) } : g
      );
      onUpdate({ ...yearPlan, groups });
    } else {
      onUpdate({ ...yearPlan, items: yearPlan.items.filter((it) => it.id !== id) });
    }
  };

  const saveEditItem = (itemId: string, groupId?: string) => {
    if (!editingItemTitle.trim()) {
      removeItem(itemId, groupId);
    } else if (groupId) {
      const groups = (yearPlan.groups ?? []).map((g) =>
        g.id === groupId ? { ...g, items: g.items.map((it) => it.id === itemId ? { ...it, title: editingItemTitle.trim() } : it) } : g
      );
      onUpdate({ ...yearPlan, groups });
    } else {
      onUpdate({
        ...yearPlan,
        items: yearPlan.items.map((it) => (it.id === itemId ? { ...it, title: editingItemTitle.trim() } : it)),
      });
    }
    setEditingItemId(null);
    setEditingItemTitle('');
  };

  const addGroup = (label: string) => {
    const newGroup: CareerPlanGroup = {
      id: `group-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      label,
      items: [],
    };
    onUpdate({ ...yearPlan, groups: [...(yearPlan.groups ?? []), newGroup] });
    setGroupInput('');
    setShowAddGroup(false);
  };

  const removeGroup = (groupId: string) => {
    onUpdate({ ...yearPlan, groups: (yearPlan.groups ?? []).filter((g) => g.id !== groupId) });
  };

  const renameGroup = (groupId: string, label: string) => {
    const groups = (yearPlan.groups ?? []).map((g) => (g.id === groupId ? { ...g, label } : g));
    onUpdate({ ...yearPlan, groups });
    setEditingGroupId(null);
  };

  const allGroupItems = (yearPlan.groups ?? []).flatMap((g) => g.items);
  const totalCount = yearPlan.goals.length + yearPlan.items.length + allGroupItems.length;

  const renderItemRow = (item: CareerPlanItem, groupId?: string) => {
    const tc = CAREER_ITEM_TYPES.find((t) => t.value === item.type);
    const monthLabel =
      item.months.length === 1
        ? `${item.months[0]}월`
        : item.months.length <= 3
        ? item.months.map((m) => `${m}월`).join('·')
        : `${item.months[0]}~${item.months[item.months.length - 1]}월`;

    if (editingItemId === item.id) {
      return (
        <View key={item.id} style={[s.itemRow, { backgroundColor: (tc?.color ?? color) + '10', borderColor: (tc?.color ?? color) + '22' }]}>
          <TextInput
            value={editingItemTitle}
            onChangeText={setEditingItemTitle}
            onBlur={() => saveEditItem(item.id, groupId)}
            onSubmitEditing={() => saveEditItem(item.id, groupId)}
            style={s.itemInput}
            placeholderTextColor="#4B5563"
            autoFocus
          />
          <TouchableOpacity onPress={() => saveEditItem(item.id, groupId)} style={[s.itemSaveBtn, { backgroundColor: color }]}>
            <Text style={s.itemSaveText}>✓</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View key={item.id} style={[s.itemRow, { backgroundColor: (tc?.color ?? color) + '10', borderColor: (tc?.color ?? color) + '22' }]}>
        <Text style={s.itemEmoji}>{tc?.emoji ?? '📌'}</Text>
        <TouchableOpacity style={s.itemInfo} onPress={() => { setEditingItemId(item.id); setEditingItemTitle(item.title); }}>
          <Text style={s.itemTitle} numberOfLines={1}>{item.title}</Text>
          <View style={s.itemMeta}>
            <Text style={[s.itemType, { color: tc?.color ?? color }]}>{tc?.label}</Text>
            <Text style={s.itemMonth}>📅 {monthLabel}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => removeItem(item.id, groupId)} style={s.removeItemBtn}>
          <Text style={s.removeItemText}>🗑</Text>
        </TouchableOpacity>
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
            {totalCount > 0 ? (
              <View style={s.yearHeaderMeta}>
                {yearPlan.goals.length > 0 && <Text style={s.yearMetaText}>🎯 {yearPlan.goals.length}개 목표</Text>}
                {(yearPlan.items.length + allGroupItems.length) > 0 && (
                  <Text style={s.yearMetaText}>
                    {[...yearPlan.items, ...allGroupItems].slice(0, 3).map((it) => CAREER_ITEM_TYPES.find((t) => t.value === it.type)?.emoji).join('')}
                    {' '}{yearPlan.items.length + allGroupItems.length}개 항목
                  </Text>
                )}
              </View>
            ) : (
              <Text style={s.yearMetaEmpty}>탭해서 계획 추가하기</Text>
            )}
          </View>
          <Text style={s.chevron}>{isExpanded ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {isExpanded && (
          <View style={[s.yearBody, { borderTopColor: color + '20' }]}>
            {/* Goals */}
            <View style={s.sectionHeader}>
              <Text style={s.sectionIcon}>🎯</Text>
              <Text style={s.sectionTitle}>{CAREER_LABELS.goalTitle}</Text>
              <Text style={s.sectionHint}>{CAREER_LABELS.goalHint}</Text>
            </View>

            {yearPlan.goals.map((goal, idx) => (
              <View key={idx} style={[s.goalRow, { backgroundColor: color + '14', borderColor: color + '22' }]}>
                <View style={[s.goalDot, { backgroundColor: color }]} />
                {editingGoalIdx === idx ? (
                  <TextInput
                    value={editingGoalText}
                    onChangeText={setEditingGoalText}
                    onBlur={saveEditGoal}
                    onSubmitEditing={saveEditGoal}
                    style={s.goalInput}
                    autoFocus
                  />
                ) : (
                  <TouchableOpacity style={s.goalTextWrap} onPress={() => { setEditingGoalIdx(idx); setEditingGoalText(goal); }}>
                    <Text style={s.goalText}>{goal}</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => removeGoal(idx)}>
                  <Text style={s.removeText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}

            {yearPlan.goals.length < 5 && (
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
                <TouchableOpacity onPress={() => setShowGoalTemplates(true)} style={[s.addGoalButton, { backgroundColor: color + '15', borderColor: color + '44' }]}>
                  <Text style={[s.addGoalButtonText, { color }]}>✨</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={addGoal} style={[s.addGoalButton, { backgroundColor: color + '25', borderColor: color + '44' }]}>
                  <Text style={[s.addGoalButtonText, { color }]}>+</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={[s.divider, { borderTopColor: 'rgba(255,255,255,0.06)' }]} />

            {/* Items + Groups */}
            <View style={s.sectionHeader}>
              <Text style={s.sectionIcon}>✨</Text>
              <Text style={s.sectionTitle}>{CAREER_LABELS.itemTitle}</Text>
              <View style={s.sectionActions}>
                <TouchableOpacity onPress={() => { setAddItemGroupId(undefined); setShowAddItem(true); }} style={[s.addItemBtn, { backgroundColor: color + '22', borderColor: color + '50' }]}>
                  <Text style={[s.addItemBtnText, { color }]}>+ {CAREER_LABELS.itemAdd}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowAddGroup(true)} style={[s.addItemBtn, { backgroundColor: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.12)' }]}>
                  <Text style={[s.addItemBtnText, { color: 'rgba(255,255,255,0.6)' }]}>+ {CAREER_LABELS.itemGroupAdd}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {showAddGroup && (
              <View style={s.addGroupRow}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.semesterPresets}>
                  {SEMESTER_PRESETS.map((preset) => (
                    <TouchableOpacity key={preset} onPress={() => addGroup(preset)} style={[s.presetChip, { borderColor: color + '44' }]}>
                      <Text style={[s.presetChipText, { color }]}>{preset}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <View style={s.addGroupInputRow}>
                  <TextInput
                    value={groupInput}
                    onChangeText={setGroupInput}
                    placeholder={CAREER_LABELS.itemGroupPlaceholder}
                    placeholderTextColor="#4B5563"
                    style={s.groupInput}
                  />
                  <TouchableOpacity onPress={() => groupInput.trim() && addGroup(groupInput.trim())} style={[s.groupAddBtn, { backgroundColor: color }]} disabled={!groupInput.trim()}>
                    <Text style={s.groupAddBtnText}>✓</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { setGroupInput(''); setShowAddGroup(false); }} style={s.groupCancelBtn}>
                    <Text style={s.groupCancelText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {(yearPlan.groups ?? []).map((group) => (
              <View key={group.id} style={[s.groupCard, { borderColor: color + '28', backgroundColor: color + '06' }]}>
                <View style={[s.groupHeader, group.items.length > 0 && { borderBottomColor: color + '18' }]}>
                  {editingGroupId === group.id ? (
                    <TextInput
                      value={editingGroupLabel}
                      onChangeText={setEditingGroupLabel}
                      onBlur={() => { if (editingGroupLabel.trim()) renameGroup(group.id, editingGroupLabel.trim()); }}
                      onSubmitEditing={() => { if (editingGroupLabel.trim()) renameGroup(group.id, editingGroupLabel.trim()); }}
                      style={s.groupLabelInput}
                      autoFocus
                    />
                  ) : (
                    <TouchableOpacity style={s.groupLabelWrap} onPress={() => { setEditingGroupId(group.id); setEditingGroupLabel(group.label); }}>
                      <View style={[s.groupDot, { backgroundColor: color }]} />
                      <Text style={[s.groupLabel, { color }]}>{group.label}</Text>
                    </TouchableOpacity>
                  )}
                  <Text style={s.groupCount}>{group.items.length}개</Text>
                  <TouchableOpacity onPress={() => { setAddItemGroupId(group.id); setShowAddItem(true); }} style={[s.groupAddItemBtn, { backgroundColor: color + '18' }]}>
                    <Text style={[s.groupAddItemText, { color }]}>+ 추가</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => removeGroup(group.id)} style={s.groupRemoveBtn}>
                    <Text style={s.groupRemoveText}>🗑</Text>
                  </TouchableOpacity>
                </View>
                {group.items.length > 0 && (
                  <View style={s.groupItems}>
                    {group.items.map((item) => renderItemRow(item, group.id))}
                  </View>
                )}
              </View>
            ))}

            {yearPlan.items.length === 0 && (yearPlan.groups ?? []).length === 0 ? (
              <TouchableOpacity onPress={() => setShowAddItem(true)} style={[s.emptyItems, { borderColor: color + '30', backgroundColor: color + '06' }]}>
                <View style={s.emptyItemsEmojis}>
                  {CAREER_ITEM_TYPES.map((t) => <Text key={t.value} style={{ fontSize: 18 }}>{t.emoji}</Text>)}
                </View>
                <Text style={s.emptyItemsText}>{CAREER_LABELS.itemEmptyHint}</Text>
              </TouchableOpacity>
            ) : (
              <View style={s.itemsList}>
                {yearPlan.items.map((item) => renderItemRow(item))}
                <TouchableOpacity onPress={() => setShowAddItem(true)} style={[s.addMoreButton, { borderColor: color + '30' }]}>
                  <Text style={[s.addMoreText, { color: color + '80' }]}>+ {CAREER_LABELS.itemAddMore}</Text>
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
        <GoalTemplateSelector onSelect={selectGoalTemplate} onClose={() => setShowGoalTemplates(false)} color={color} />
      )}

      {showAddItem && (
        <AddItemModal starId={starId} color={color} onAdd={addItem} onClose={() => { setShowAddItem(false); setAddItemGroupId(undefined); }} />
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
  sectionActions: { flexDirection: 'row', gap: SPACING.sm },
  goalRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.lg, borderWidth: 1 },
  goalDot: { width: 6, height: 6, borderRadius: 3 },
  goalTextWrap: { flex: 1 },
  goalText: { fontSize: FONT_SIZES.sm, color: '#fff' },
  goalInput: { flex: 1, height: 36, paddingHorizontal: 12, borderRadius: BORDER_RADIUS.lg, fontSize: FONT_SIZES.sm, color: '#fff', backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  removeText: { fontSize: 12, color: '#6B7280' },
  goalInputRow: { flexDirection: 'row', gap: SPACING.sm },
  addGoalButton: { width: 40, height: 40, borderRadius: BORDER_RADIUS.lg, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  addGoalButtonText: { fontSize: 16, fontWeight: '700' },
  divider: { borderTopWidth: 1 },
  addItemBtn: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.lg, borderWidth: 1 },
  addItemBtnText: { fontSize: FONT_SIZES.xs, fontWeight: '700' },
  addGroupRow: { gap: SPACING.sm },
  semesterPresets: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.xs },
  presetChip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.lg, borderWidth: 1 },
  presetChipText: { fontSize: FONT_SIZES.xs, fontWeight: '700' },
  addGroupInputRow: { flexDirection: 'row', gap: SPACING.sm },
  groupInput: { flex: 1, height: 36, paddingHorizontal: 12, borderRadius: BORDER_RADIUS.lg, fontSize: FONT_SIZES.sm, color: '#fff', backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  groupAddBtn: { width: 36, height: 36, borderRadius: BORDER_RADIUS.lg, justifyContent: 'center', alignItems: 'center' },
  groupAddBtnText: { fontSize: 16, color: '#fff', fontWeight: '700' },
  groupCancelBtn: { width: 36, height: 36, borderRadius: BORDER_RADIUS.lg, backgroundColor: 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center' },
  groupCancelText: { fontSize: 14, color: '#6B7280' },
  groupCard: { borderRadius: BORDER_RADIUS.xl, borderWidth: 1, overflow: 'hidden' },
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingHorizontal: SPACING.md, paddingVertical: 10 },
  groupLabelWrap: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  groupDot: { width: 6, height: 6, borderRadius: 3, marginRight: SPACING.sm },
  groupLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700' },
  groupLabelInput: { flex: 1, fontSize: FONT_SIZES.xs, fontWeight: '700', color: '#fff', paddingVertical: 4 },
  groupCount: { fontSize: 10, color: '#6B7280' },
  groupAddItemBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: BORDER_RADIUS.md },
  groupAddItemText: { fontSize: 10, fontWeight: '700' },
  groupRemoveBtn: { width: 28, height: 28, borderRadius: BORDER_RADIUS.sm, backgroundColor: 'rgba(239,68,68,0.1)', justifyContent: 'center', alignItems: 'center' },
  groupRemoveText: { fontSize: 12 },
  groupItems: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, gap: SPACING.sm },
  itemsList: { gap: SPACING.sm },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingHorizontal: 14, paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.lg, borderWidth: 1 },
  itemEmoji: { fontSize: 18 },
  itemInfo: { flex: 1 },
  itemInput: { flex: 1, fontSize: FONT_SIZES.sm, color: '#fff', paddingVertical: SPACING.sm },
  itemTitle: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#fff' },
  itemMeta: { flexDirection: 'row', gap: SPACING.sm, marginTop: 2 },
  itemType: { fontSize: 10, fontWeight: '700' },
  itemMonth: { fontSize: 10, color: '#6B7280' },
  itemSaveBtn: { width: 36, height: 36, borderRadius: BORDER_RADIUS.lg, justifyContent: 'center', alignItems: 'center' },
  itemSaveText: { fontSize: 16, color: '#fff', fontWeight: '700' },
  removeItemBtn: { width: 28, height: 28, borderRadius: BORDER_RADIUS.sm, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)' },
  removeItemText: { fontSize: 12 },
  emptyItems: { borderRadius: BORDER_RADIUS.lg, paddingVertical: SPACING.lg, alignItems: 'center', gap: SPACING.sm, borderWidth: 1.5, borderStyle: 'dashed' },
  emptyItemsEmojis: { flexDirection: 'row', gap: SPACING.sm },
  emptyItemsText: { fontSize: FONT_SIZES.xs, color: '#6B7280' },
  addMoreButton: { alignItems: 'center', paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.lg, borderWidth: 1, borderStyle: 'dashed' },
  addMoreText: { fontSize: FONT_SIZES.xs, fontWeight: '600' },
  removeYearButton: { alignItems: 'center', paddingVertical: SPACING.sm },
  removeYearText: { fontSize: FONT_SIZES.xs, color: '#6B7280' },
});
