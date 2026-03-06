import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal,
} from 'react-native';
import { SPACING, FONT_SIZES, BORDER_RADIUS } from '../../config/theme';
import { CAREER_LABELS, CAREER_ITEM_TYPES, type CareerItemType, type CareerPlanItem } from '../../config/career-path';
import careerMaker from '../../data/career-maker.json';
import portfolioItems from '../../data/portfolio-items.json';

interface SuggestedItem {
  id: string; type: string; title: string; months: number[];
  difficulty: number; cost: string; organizer?: string;
}

interface AddItemModalProps {
  starId: string;
  color: string;
  onAdd: (item: Omit<CareerPlanItem, 'id'>) => void;
  onClose: () => void;
}

function MonthGrid({ selected, onChange, color }: { selected: number[]; onChange: (m: number[]) => void; color: string }) {
  const toggle = (m: number) => {
    onChange(selected.includes(m) ? selected.filter((x) => x !== m) : [...selected, m].sort((a, b) => a - b));
  };
  return (
    <View style={styles.monthGrid}>
      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
        const isSelected = selected.includes(m);
        return (
          <TouchableOpacity
            key={m}
            onPress={() => toggle(m)}
            style={[styles.monthCell, isSelected ? { backgroundColor: color } : { backgroundColor: 'rgba(255,255,255,0.05)' }]}
          >
            <Text style={[styles.monthCellText, isSelected && { color: '#fff' }]}>{m}월</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function AddItemModal({ starId, color, onAdd, onClose }: AddItemModalProps) {
  const [mode, setMode] = useState<'pick' | 'custom'>('pick');
  const [filterType, setFilterType] = useState('all');
  const [selectedSuggest, setSelectedSuggest] = useState<SuggestedItem | null>(null);
  const [suggestMonths, setSuggestMonths] = useState<number[]>([]);

  const [customType, setCustomType] = useState<CareerItemType>('activity');
  const [customTitle, setCustomTitle] = useState('');
  const [customMonths, setCustomMonths] = useState<number[]>([3]);
  const [customDifficulty, setCustomDifficulty] = useState(2);
  const [customCost, setCustomCost] = useState('무료');
  const [customOrganizer, setCustomOrganizer] = useState('');

  const kingdom = careerMaker.kingdoms.find((k) => k.id === starId);
  const careerItems: SuggestedItem[] = (kingdom?.careerItems ?? []).map((it) => ({
    id: it.id, type: it.type, title: it.title, months: it.months,
    difficulty: it.difficulty, cost: it.cost, organizer: it.organizer,
  }));
  const portItems: SuggestedItem[] = (
    (portfolioItems.kingdoms as Record<string, { id: string; title: string; months: number[]; difficulty: number }[]>)[starId] ?? []
  ).map((it) => ({
    id: it.id, type: 'portfolio', title: it.title, months: it.months,
    difficulty: it.difficulty, cost: '자체 제작', organizer: '개인',
  }));
  const allItems = [...careerItems, ...portItems];
  const filtered = filterType === 'all' ? allItems : allItems.filter((it) => it.type === filterType);

  const handleSelectSuggest = (item: SuggestedItem) => {
    setSelectedSuggest(item);
    setSuggestMonths([...item.months].sort((a, b) => a - b));
  };

  const handleAddSuggest = () => {
    if (!selectedSuggest || suggestMonths.length === 0) return;
    onAdd({
      type: selectedSuggest.type as CareerItemType,
      title: selectedSuggest.title,
      months: suggestMonths,
      difficulty: selectedSuggest.difficulty,
      cost: selectedSuggest.cost,
      organizer: selectedSuggest.organizer ?? '',
    });
    onClose();
  };

  const handleAddCustom = () => {
    if (!customTitle.trim() || customMonths.length === 0) return;
    onAdd({
      type: customType, title: customTitle.trim(), months: customMonths,
      difficulty: customDifficulty, cost: customCost, organizer: customOrganizer, custom: true,
    });
    onClose();
  };

  return (
    <Modal visible animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>
              {selectedSuggest && mode === 'pick' ? `📅 ${CAREER_LABELS.addItemMonthTitle}` : CAREER_LABELS.addItemTitle}
            </Text>
            <View style={styles.sheetHeaderActions}>
              {selectedSuggest && mode === 'pick' && (
                <TouchableOpacity onPress={() => setSelectedSuggest(null)}>
                  <Text style={styles.backLink}>목록으로</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.modeToggle}>
            {(['pick', 'custom'] as const).map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => { setMode(m); setSelectedSuggest(null); }}
                style={[styles.modeButton, mode === m ? { backgroundColor: color } : { backgroundColor: 'rgba(255,255,255,0.06)' }]}
              >
                <Text style={[styles.modeButtonText, mode === m ? { color: '#fff' } : { color: 'rgba(255,255,255,0.45)' }]}>
                  {m === 'pick' ? `✨ ${CAREER_LABELS.addItemRecommend}` : `✏️ ${CAREER_LABELS.addItemCustom}`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView style={styles.sheetContent} showsVerticalScrollIndicator={false}>
            {mode === 'pick' && !selectedSuggest && (
              <View style={styles.pickContent}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeFilterRow}>
                  {[{ value: 'all', label: CAREER_LABELS.addItemFilterAll, emoji: '✨' }, ...CAREER_ITEM_TYPES.map((t) => ({ value: t.value, label: t.label, emoji: t.emoji }))].map((t) => (
                    <TouchableOpacity
                      key={t.value}
                      onPress={() => setFilterType(t.value)}
                      style={[styles.typeFilterChip, filterType === t.value ? { backgroundColor: color } : { backgroundColor: 'rgba(255,255,255,0.06)' }]}
                    >
                      <Text style={[styles.typeFilterText, filterType === t.value ? { color: '#fff' } : { color: 'rgba(255,255,255,0.5)' }]}>
                        {t.emoji} {t.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                {filtered.length === 0 ? (
                  <Text style={styles.emptyText}>{CAREER_LABELS.addItemEmpty}</Text>
                ) : (
                  filtered.map((item) => {
                    const tc = CAREER_ITEM_TYPES.find((t) => t.value === item.type);
                    return (
                      <TouchableOpacity key={item.id} onPress={() => handleSelectSuggest(item)} style={styles.suggestRow}>
                        <View style={[styles.suggestIcon, { backgroundColor: (tc?.color ?? color) + '18' }]}>
                          <Text style={{ fontSize: 18 }}>{tc?.emoji ?? '📌'}</Text>
                        </View>
                        <View style={styles.suggestInfo}>
                          <Text style={styles.suggestTitle} numberOfLines={1}>{item.title}</Text>
                          <View style={styles.suggestMeta}>
                            <Text style={[styles.suggestType, { color: tc?.color ?? color }]}>{tc?.label}</Text>
                            <Text style={styles.suggestMonths}>
                              {item.months.slice(0, 3).map((m) => `${m}월`).join('·')}{item.months.length > 3 ? ' 외' : ''}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.suggestChevron}>›</Text>
                      </TouchableOpacity>
                    );
                  })
                )}
              </View>
            )}

            {mode === 'pick' && selectedSuggest && (
              <View style={styles.monthPickContent}>
                <View style={[styles.selectedPreview, { backgroundColor: color + '12', borderColor: color + '30' }]}>
                  <Text style={{ fontSize: 22 }}>{CAREER_ITEM_TYPES.find((t) => t.value === selectedSuggest.type)?.emoji ?? '📌'}</Text>
                  <Text style={styles.selectedTitle}>{selectedSuggest.title}</Text>
                </View>
                <Text style={styles.monthPickLabel}>📅 {CAREER_LABELS.addItemMonthLabel} ({CAREER_LABELS.addItemMonthHint})</Text>
                <MonthGrid selected={suggestMonths} onChange={setSuggestMonths} color={color} />
                {suggestMonths.length > 0 && (
                  <Text style={styles.selectedMonthsText}>
                    ✓ {CAREER_LABELS.addItemSelectedMonth} {suggestMonths.map((m) => `${m}월`).join(', ')}
                  </Text>
                )}
                <TouchableOpacity
                  disabled={suggestMonths.length === 0}
                  onPress={handleAddSuggest}
                  style={[styles.submitButton, suggestMonths.length > 0 ? { backgroundColor: color } : { backgroundColor: 'rgba(255,255,255,0.08)' }]}
                >
                  <Text style={[styles.submitButtonText, suggestMonths.length === 0 && { opacity: 0.4 }]}>
                    {suggestMonths.length > 0 ? `${suggestMonths.map((m) => `${m}월`).join(', ')} — ${CAREER_LABELS.addItemSubmit}` : CAREER_LABELS.addItemSelectMonth}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {mode === 'custom' && (
              <View style={styles.customContent}>
                <Text style={styles.fieldLabel}>{CAREER_LABELS.addItemCustomType}</Text>
                <View style={styles.typeGrid}>
                  {CAREER_ITEM_TYPES.map((t) => (
                    <TouchableOpacity
                      key={t.value}
                      onPress={() => setCustomType(t.value)}
                      style={[styles.typeOption, customType === t.value ? { backgroundColor: t.color } : { backgroundColor: 'rgba(255,255,255,0.06)' }]}
                    >
                      <Text style={[styles.typeOptionText, customType === t.value ? { color: '#fff' } : { color: 'rgba(255,255,255,0.5)' }]}>
                        {t.emoji} {t.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.fieldLabel}>{CAREER_LABELS.addItemCustomName}</Text>
                <TextInput
                  value={customTitle}
                  onChangeText={setCustomTitle}
                  placeholder="예: 전국 AI 해커톤 참가"
                  placeholderTextColor="#4B5563"
                  style={styles.textInput}
                />
                <Text style={styles.fieldLabel}>{CAREER_LABELS.addItemCustomMonthLabel} ({CAREER_LABELS.addItemMonthHint})</Text>
                <MonthGrid selected={customMonths} onChange={setCustomMonths} color={color} />
                <Text style={styles.fieldLabel}>{CAREER_LABELS.addItemCustomDifficulty}</Text>
                <View style={styles.difficultyRow}>
                  {[1, 2, 3, 4, 5].map((d) => (
                    <TouchableOpacity
                      key={d}
                      onPress={() => setCustomDifficulty(d)}
                      style={[styles.difficultyButton, customDifficulty === d ? { backgroundColor: color } : { backgroundColor: 'rgba(255,255,255,0.05)' }]}
                    >
                      <Text style={[styles.difficultyText, customDifficulty === d ? { color: '#fff' } : { color: 'rgba(255,255,255,0.3)' }]}>
                        {'★'.repeat(d)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.twoColRow}>
                  <View style={styles.halfCol}>
                    <Text style={styles.fieldLabel}>{CAREER_LABELS.addItemCustomCost}</Text>
                    <TextInput value={customCost} onChangeText={setCustomCost} placeholder={CAREER_LABELS.addItemCustomCostPlaceholder} placeholderTextColor="#4B5563" style={styles.textInput} />
                  </View>
                  <View style={styles.halfCol}>
                    <Text style={styles.fieldLabel}>{CAREER_LABELS.addItemCustomOrganizer}</Text>
                    <TextInput value={customOrganizer} onChangeText={setCustomOrganizer} placeholder={CAREER_LABELS.addItemCustomOrganizerPlaceholder} placeholderTextColor="#4B5563" style={styles.textInput} />
                  </View>
                </View>
                <TouchableOpacity
                  disabled={!customTitle.trim() || customMonths.length === 0}
                  onPress={handleAddCustom}
                  style={[styles.submitButton, customTitle.trim() && customMonths.length > 0 ? { backgroundColor: color } : { backgroundColor: 'rgba(255,255,255,0.08)' }]}
                >
                  <Text style={[styles.submitButtonText, (!customTitle.trim() || customMonths.length === 0) && { opacity: 0.4 }]}>
                    {CAREER_LABELS.addItemSubmit}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#0f0f23', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '88%', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  sheetTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: '#fff' },
  sheetHeaderActions: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  backLink: { fontSize: FONT_SIZES.xs, color: '#6B7280', textDecorationLine: 'underline' },
  closeButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center' },
  closeText: { color: '#9CA3AF', fontSize: 14 },
  modeToggle: { flexDirection: 'row', gap: SPACING.sm, paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.sm },
  modeButton: { flex: 1, paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.lg, alignItems: 'center' },
  modeButtonText: { fontSize: FONT_SIZES.sm, fontWeight: '700' },
  sheetContent: { paddingHorizontal: SPACING.lg },
  pickContent: { gap: SPACING.md, paddingTop: SPACING.xs },
  typeFilterRow: { gap: SPACING.sm, paddingBottom: SPACING.xs },
  typeFilterChip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.lg },
  typeFilterText: { fontSize: FONT_SIZES.xs, fontWeight: '600' },
  emptyText: { textAlign: 'center', paddingVertical: 40, fontSize: FONT_SIZES.md, color: '#6B7280' },
  suggestRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md,
    padding: 14, borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  suggestIcon: { width: 40, height: 40, borderRadius: BORDER_RADIUS.lg, justifyContent: 'center', alignItems: 'center' },
  suggestInfo: { flex: 1 },
  suggestTitle: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#fff' },
  suggestMeta: { flexDirection: 'row', gap: SPACING.sm, marginTop: 4 },
  suggestType: { fontSize: 10, fontWeight: '700' },
  suggestMonths: { fontSize: 10, color: '#6B7280' },
  suggestChevron: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  monthPickContent: { gap: SPACING.lg, paddingTop: SPACING.sm },
  selectedPreview: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: 14, borderRadius: BORDER_RADIUS.lg, borderWidth: 1 },
  selectedTitle: { flex: 1, fontSize: FONT_SIZES.md, fontWeight: '700', color: '#fff' },
  monthPickLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: '#fff' },
  monthGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  monthCell: { width: '15%' as any, height: 40, borderRadius: BORDER_RADIUS.lg, justifyContent: 'center', alignItems: 'center' },
  monthCellText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: 'rgba(255,255,255,0.4)' },
  selectedMonthsText: { fontSize: 10, color: '#9CA3AF' },
  submitButton: { height: 48, borderRadius: BORDER_RADIUS.lg, justifyContent: 'center', alignItems: 'center' },
  submitButtonText: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#fff' },
  customContent: { gap: SPACING.md, paddingTop: SPACING.xs },
  fieldLabel: { fontSize: FONT_SIZES.xs, color: '#9CA3AF', fontWeight: '600' },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  typeOption: { width: '47%' as any, flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingHorizontal: 14, paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.lg },
  typeOptionText: { fontSize: FONT_SIZES.sm, fontWeight: '700' },
  textInput: {
    height: 44, paddingHorizontal: SPACING.lg, borderRadius: BORDER_RADIUS.lg,
    fontSize: FONT_SIZES.sm, color: '#fff',
    backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  difficultyRow: { flexDirection: 'row', gap: SPACING.sm },
  difficultyButton: { flex: 1, paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.lg, alignItems: 'center' },
  difficultyText: { fontSize: FONT_SIZES.xs, fontWeight: '700' },
  twoColRow: { flexDirection: 'row', gap: SPACING.sm },
  halfCol: { flex: 1, gap: SPACING.sm },
});
