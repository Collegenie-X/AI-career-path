import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal, Linking,
} from 'react-native';
import { SPACING, FONT_SIZES, BORDER_RADIUS } from '../../config/theme';
import { CAREER_LABELS, CAREER_ITEM_TYPES, type CareerItemType, type CareerPlanItem } from '../../config/career-path';
import careerMaker from '../../data/career-maker.json';
import portfolioItems from '../../data/portfolio-items.json';

interface SuggestedItem {
  id: string; type: string; title: string; months: number[];
  difficulty: number; cost: string; organizer?: string;
  url?: string; description?: string;
}

interface AddItemModalProps {
  starId: string;
  color: string;
  onAdd: (item: Omit<CareerPlanItem, 'id'>) => void;
  onClose: () => void;
  /** 편집 모드: 기존 항목 수정 시 사용 */
  initialItem?: CareerPlanItem;
  onSave?: (item: CareerPlanItem) => void;
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

export function AddItemModal({ starId, color, onAdd, onClose, initialItem, onSave }: AddItemModalProps) {
  const isEditMode = Boolean(initialItem && onSave);

  const [mode, setMode] = useState<'pick' | 'custom' | 'edit'>('pick');
  const [filterType, setFilterType] = useState('all');
  const [selectedSuggest, setSelectedSuggest] = useState<SuggestedItem | null>(null);
  const [suggestMonths, setSuggestMonths] = useState<number[]>([]);
  // 추천 선택 시 수정 가능한 필드
  const [editTitle, setEditTitle] = useState('');
  const [editOrganizer, setEditOrganizer] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDifficulty, setEditDifficulty] = useState(2);
  const [editCost, setEditCost] = useState('무료');
  const [editType, setEditType] = useState<CareerItemType>('activity');

  const [customType, setCustomType] = useState<CareerItemType>('activity');
  const [customTitle, setCustomTitle] = useState('');
  const [customMonths, setCustomMonths] = useState<number[]>([3]);
  const [customDifficulty, setCustomDifficulty] = useState(2);
  const [customCost, setCustomCost] = useState('무료');
  const [customOrganizer, setCustomOrganizer] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [customDescription, setCustomDescription] = useState('');

  const kingdom = careerMaker.kingdoms.find((k) => k.id === starId);
  const careerItems: SuggestedItem[] = (kingdom?.careerItems ?? []).map((it: any) => ({
    id: it.id, type: it.type, title: it.title, months: it.months,
    difficulty: it.difficulty, cost: it.cost, organizer: it.organizer,
    url: it.url, description: it.description,
  }));
  const portItems: SuggestedItem[] = (
    (portfolioItems.kingdoms as Record<string, { id: string; title: string; months: number[]; difficulty: number; url?: string; tip?: string }[]>)[starId] ?? []
  ).map((it) => ({
    id: it.id, type: 'portfolio', title: it.title, months: it.months,
    difficulty: it.difficulty, cost: '자체 제작', organizer: '개인',
    url: it.url, description: it.tip,
  }));
  const allItems = [...careerItems, ...portItems];
  const filtered = filterType === 'all' ? allItems : allItems.filter((it) => it.type === filterType);

  useEffect(() => {
    if (initialItem) {
      setMode('edit');
      setEditTitle(initialItem.title);
      setEditOrganizer(initialItem.organizer ?? '');
      setEditUrl(initialItem.url ?? '');
      setEditDescription(initialItem.description ?? '');
      setEditDifficulty(initialItem.difficulty ?? 2);
      setEditCost(initialItem.cost ?? '무료');
      setEditType(initialItem.type);
      setSuggestMonths([...initialItem.months].sort((a, b) => a - b));
    }
  }, [initialItem]);

  const handleSaveEdit = () => {
    if (!initialItem || !onSave || !editTitle.trim() || suggestMonths.length === 0) return;
    onSave({
      ...initialItem,
      type: editType,
      title: editTitle.trim(),
      months: suggestMonths,
      difficulty: editDifficulty,
      cost: editCost.trim() || '무료',
      organizer: editOrganizer.trim() || '',
      url: editUrl.trim() || undefined,
      description: editDescription.trim() || undefined,
    });
    onClose();
  };

  const handleSelectSuggest = (item: SuggestedItem) => {
    setSelectedSuggest(item);
    setSuggestMonths([...item.months].sort((a, b) => a - b));
    setEditTitle(item.title);
    setEditOrganizer(item.organizer ?? '');
    setEditUrl(item.url ?? '');
    setEditDescription(item.description ?? '');
    setEditDifficulty(item.difficulty ?? 2);
    setEditCost(item.cost ?? '무료');
  };

  const handleAddSuggest = () => {
    if (!selectedSuggest || suggestMonths.length === 0 || !editTitle.trim()) return;
    onAdd({
      type: selectedSuggest.type as CareerItemType,
      title: editTitle.trim(),
      months: suggestMonths,
      difficulty: editDifficulty,
      cost: editCost.trim() || '무료',
      organizer: editOrganizer.trim() || '',
      url: editUrl.trim() || undefined,
      description: editDescription.trim() || undefined,
    });
    onClose();
  };

  const handleAddCustom = () => {
    if (!customTitle.trim() || customMonths.length === 0) return;
    onAdd({
      type: customType, title: customTitle.trim(), months: customMonths,
      difficulty: customDifficulty, cost: customCost, organizer: customOrganizer,
      url: customUrl.trim() || undefined,
      description: customDescription.trim() || undefined,
      custom: true,
    });
    onClose();
  };

  return (
    <Modal visible animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>
              {isEditMode ? CAREER_LABELS.addItemEditTitle : selectedSuggest && mode === 'pick' ? `📅 ${CAREER_LABELS.addItemMonthTitle}` : CAREER_LABELS.addItemTitle}
            </Text>
            <View style={styles.sheetHeaderActions}>
              {selectedSuggest && mode === 'pick' && !isEditMode && (
                <TouchableOpacity onPress={() => setSelectedSuggest(null)}>
                  <Text style={styles.backLink}>목록으로</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          {!isEditMode && (
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
          )}

          <ScrollView style={styles.sheetContent} showsVerticalScrollIndicator={false}>
            {isEditMode && (
              <View style={styles.monthPickContent}>
                <Text style={styles.fieldLabel}>{CAREER_LABELS.addItemCustomType}</Text>
                <View style={styles.typeGrid}>
                  {CAREER_ITEM_TYPES.map((t) => (
                    <TouchableOpacity
                      key={t.value}
                      onPress={() => setEditType(t.value)}
                      style={[styles.typeOption, editType === t.value ? { backgroundColor: t.color } : { backgroundColor: 'rgba(255,255,255,0.06)' }]}
                    >
                      <Text style={[styles.typeOptionText, editType === t.value ? { color: '#fff' } : { color: 'rgba(255,255,255,0.5)' }]}>
                        {t.emoji} {t.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={[styles.infoCard, { backgroundColor: color + '12', borderColor: color + '30' }]}>
                  <Text style={styles.infoLabel}>🎯 {CAREER_LABELS.addItemCustomName}</Text>
                  <TextInput value={editTitle} onChangeText={setEditTitle} placeholder="항목명" placeholderTextColor="#4B5563" style={styles.textInput} />
                  <Text style={styles.infoLabel}>🏢 {CAREER_LABELS.addItemCustomOrganizer}</Text>
                  <TextInput value={editOrganizer} onChangeText={setEditOrganizer} placeholder="주관/출처" placeholderTextColor="#4B5563" style={styles.textInput} />
                  <Text style={styles.infoLabel}>💰 {CAREER_LABELS.addItemCustomCost}</Text>
                  <TextInput value={editCost} onChangeText={setEditCost} placeholder="비용" placeholderTextColor="#4B5563" style={styles.textInput} />
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>🔥 난이도</Text>
                  <View style={styles.difficultyRow}>
                    {[1, 2, 3, 4, 5].map((d) => (
                      <TouchableOpacity
                        key={d}
                        onPress={() => setEditDifficulty(d)}
                        style={[styles.difficultyButton, editDifficulty === d ? { backgroundColor: color } : { backgroundColor: 'rgba(255,255,255,0.05)' }]}
                      >
                        <Text style={[styles.difficultyText, editDifficulty === d ? { color: '#fff' } : { color: 'rgba(255,255,255,0.3)' }]}>
                          {'★'.repeat(d)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <View style={[styles.infoCard, styles.urlCard]}>
                  <Text style={styles.infoLabel}>🔗 {CAREER_LABELS.itemUrl}</Text>
                  <TextInput value={editUrl} onChangeText={setEditUrl} placeholder="https://example.com" placeholderTextColor="#4B5563" style={styles.textInput} keyboardType="url" autoCapitalize="none" />
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>📝 {CAREER_LABELS.itemDescription}</Text>
                  <TextInput value={editDescription} onChangeText={setEditDescription} placeholder="상세 설명 (선택)" placeholderTextColor="#4B5563" style={[styles.textInput, styles.textArea]} multiline numberOfLines={3} textAlignVertical="top" />
                </View>
                <Text style={styles.monthPickLabel}>📅 {CAREER_LABELS.addItemMonthLabel} ({CAREER_LABELS.addItemMonthHint})</Text>
                <MonthGrid selected={suggestMonths} onChange={setSuggestMonths} color={color} />
                <TouchableOpacity
                  disabled={suggestMonths.length === 0 || !editTitle.trim()}
                  onPress={handleSaveEdit}
                  style={[styles.submitButton, (suggestMonths.length > 0 && editTitle.trim()) ? { backgroundColor: color } : { backgroundColor: 'rgba(255,255,255,0.08)' }]}
                >
                  <Text style={[styles.submitButtonText, (suggestMonths.length === 0 || !editTitle.trim()) && { opacity: 0.4 }]}>
                    {CAREER_LABELS.addItemSaveEdit}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {!isEditMode && mode === 'pick' && !selectedSuggest && (
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

            {!isEditMode && mode === 'pick' && selectedSuggest && (
              <View style={styles.monthPickContent}>
                {/* 제목·주관·비용 - 수정 가능 */}
                <View style={[styles.infoCard, { backgroundColor: color + '12', borderColor: color + '30' }]}>
                  <Text style={styles.infoLabel}>🎯 {CAREER_LABELS.addItemCustomName}</Text>
                  <TextInput
                    value={editTitle}
                    onChangeText={setEditTitle}
                    placeholder="항목명"
                    placeholderTextColor="#4B5563"
                    style={styles.textInput}
                  />
                  <Text style={styles.infoLabel}>🏢 {CAREER_LABELS.addItemCustomOrganizer}</Text>
                  <TextInput
                    value={editOrganizer}
                    onChangeText={setEditOrganizer}
                    placeholder="주관/출처"
                    placeholderTextColor="#4B5563"
                    style={styles.textInput}
                  />
                  <Text style={styles.infoLabel}>💰 {CAREER_LABELS.addItemCustomCost}</Text>
                  <TextInput
                    value={editCost}
                    onChangeText={setEditCost}
                    placeholder="비용"
                    placeholderTextColor="#4B5563"
                    style={styles.textInput}
                  />
                </View>

                {/* 난이도 - 수정 가능 */}
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>🔥 난이도</Text>
                  <View style={styles.difficultyRow}>
                    {[1, 2, 3, 4, 5].map((d) => (
                      <TouchableOpacity
                        key={d}
                        onPress={() => setEditDifficulty(d)}
                        style={[styles.difficultyButton, editDifficulty === d ? { backgroundColor: color } : { backgroundColor: 'rgba(255,255,255,0.05)' }]}
                      >
                        <Text style={[styles.difficultyText, editDifficulty === d ? { color: '#fff' } : { color: 'rgba(255,255,255,0.3)' }]}>
                          {'★'.repeat(d)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text style={[styles.difficultyLabel, { marginLeft: 0, marginTop: 4 }]}>
                    {editDifficulty === 1 && '매우 쉬움'}
                    {editDifficulty === 2 && '쉬움'}
                    {editDifficulty === 3 && '보통'}
                    {editDifficulty === 4 && '어려움'}
                    {editDifficulty === 5 && '매우 어려움'}
                  </Text>
                </View>

                {/* URL - 수정 가능 */}
                <View style={[styles.infoCard, styles.urlCard]}>
                  <Text style={styles.infoLabel}>🔗 {CAREER_LABELS.itemUrl}</Text>
                  <TextInput
                    value={editUrl}
                    onChangeText={setEditUrl}
                    placeholder="https://example.com"
                    placeholderTextColor="#4B5563"
                    style={styles.textInput}
                    keyboardType="url"
                    autoCapitalize="none"
                  />
                  {editUrl.trim() ? (
                    <TouchableOpacity onPress={() => Linking.openURL(editUrl.trim())}>
                      <Text style={styles.urlHint}>탭하면 브라우저에서 열기</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>

                {/* 설명 - 수정 가능 */}
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>📝 {CAREER_LABELS.itemDescription}</Text>
                  <TextInput
                    value={editDescription}
                    onChangeText={setEditDescription}
                    placeholder="상세 설명 (선택)"
                    placeholderTextColor="#4B5563"
                    style={[styles.textInput, styles.textArea]}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>

                <Text style={styles.monthPickLabel}>📅 {CAREER_LABELS.addItemMonthLabel} ({CAREER_LABELS.addItemMonthHint})</Text>
                <MonthGrid selected={suggestMonths} onChange={setSuggestMonths} color={color} />
                {suggestMonths.length > 0 && (
                  <Text style={styles.selectedMonthsText}>
                    ✓ {CAREER_LABELS.addItemSelectedMonth} {suggestMonths.map((m) => `${m}월`).join(', ')}
                  </Text>
                )}
                <TouchableOpacity
                  disabled={suggestMonths.length === 0 || !editTitle.trim()}
                  onPress={handleAddSuggest}
                  style={[styles.submitButton, (suggestMonths.length > 0 && editTitle.trim()) ? { backgroundColor: color } : { backgroundColor: 'rgba(255,255,255,0.08)' }]}
                >
                  <Text style={[styles.submitButtonText, (suggestMonths.length === 0 || !editTitle.trim()) && { opacity: 0.4 }]}>
                    {suggestMonths.length > 0 && editTitle.trim()
                      ? `${suggestMonths.map((m) => `${m}월`).join(', ')} — ${CAREER_LABELS.addItemSubmit}`
                      : !editTitle.trim()
                        ? '제목을 입력하세요'
                        : CAREER_LABELS.addItemSelectMonth}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {!isEditMode && mode === 'custom' && (
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

                {/* 선택 사항 구분선 */}
                <View style={styles.optionalSection}>
                  <View style={styles.optionalHeader}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.optionalLabel}>추가 정보 (선택)</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  <Text style={styles.fieldLabel}>🔗 {CAREER_LABELS.itemUrl}</Text>
                  <TextInput
                    value={customUrl}
                    onChangeText={setCustomUrl}
                    placeholder="https://example.com"
                    placeholderTextColor="#4B5563"
                    style={styles.textInput}
                    keyboardType="url"
                    autoCapitalize="none"
                  />
                  
                  <Text style={styles.fieldLabel}>📝 {CAREER_LABELS.itemDescription}</Text>
                  <TextInput
                    value={customDescription}
                    onChangeText={setCustomDescription}
                    placeholder="대회 소개, 참가 방법, 준비 사항 등"
                    placeholderTextColor="#4B5563"
                    style={[styles.textInput, styles.textArea]}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
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
  selectedTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#fff' },
  selectedOrganizer: { fontSize: FONT_SIZES.xs, color: '#9CA3AF', marginTop: 4 },
  infoCard: { 
    padding: SPACING.md, 
    borderRadius: BORDER_RADIUS.lg, 
    backgroundColor: 'rgba(255,255,255,0.04)', 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.08)',
    gap: SPACING.sm,
  },
  infoLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: '#9CA3AF' },
  difficultyDisplay: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  star: { fontSize: 16 },
  difficultyLabel: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#fff', marginLeft: 4 },
  infoUrl: { fontSize: FONT_SIZES.xs, color: '#60A5FA', textDecorationLine: 'underline' },
  urlCard: { borderColor: '#60A5FA30' },
  urlHint: { fontSize: 9, color: '#6B7280', marginTop: 2 },
  infoDescription: { fontSize: FONT_SIZES.sm, color: '#D1D5DB', lineHeight: 20 },
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
  textArea: {
    height: 80, paddingTop: SPACING.md, paddingBottom: SPACING.md, textAlignVertical: 'top',
  },
  optionalSection: {
    gap: SPACING.md,
    paddingTop: SPACING.sm,
  },
  optionalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.xs,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  optionalLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: '#6B7280',
  },
  difficultyRow: { flexDirection: 'row', gap: SPACING.sm },
  difficultyButton: { flex: 1, paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.lg, alignItems: 'center' },
  difficultyText: { fontSize: FONT_SIZES.xs, fontWeight: '700' },
  twoColRow: { flexDirection: 'row', gap: SPACING.sm },
  halfCol: { flex: 1, gap: SPACING.sm },
});
