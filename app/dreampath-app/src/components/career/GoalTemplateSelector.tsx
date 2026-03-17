import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView,
} from 'react-native';
import { SPACING, FONT_SIZES, BORDER_RADIUS } from '../../config/theme';
import { CAREER_LABELS } from '../../config/career-path';
import goalTemplatesData from '../../data/goal-templates.json';

type CategoryKey = keyof typeof goalTemplatesData;

/** 템플릿 항목: 문자열 또는 { label, icon?, description? } */
type TemplateItem = string | { label: string; icon?: string; description?: string };

function normalizeTemplate(t: TemplateItem): { label: string; icon: string; description: string } {
  if (typeof t === 'string') {
    return { label: t, icon: '•', description: '' };
  }
  return {
    label: t.label,
    icon: t.icon ?? '•',
    description: t.description ?? '',
  };
}

interface GoalTemplateSelectorProps {
  onSelect: (goal: string) => void;
  onClose: () => void;
  color: string;
  /** 이미 선택된 목표 목록 (상단에 우선 표시) */
  previouslySelected?: string[];
}

export function GoalTemplateSelector({
  onSelect,
  onClose,
  color,
  previouslySelected = [],
}: GoalTemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | null>(null);

  const categories = Object.entries(goalTemplatesData).map(([key, data]) => ({
    key: key as CategoryKey,
    label: (data as { label: string }).label,
    emoji: (data as { emoji: string }).emoji,
    color: (data as { color: string }).color,
    templates: (data as { templates: TemplateItem[] }).templates,
  }));

  /** 현재 카테고리에서 이전 선택된 항목만 필터 */
  const prevInCategory = useMemo(() => {
    if (!selectedCategory || previouslySelected.length === 0) return [];
    const cat = goalTemplatesData[selectedCategory];
    const labels = new Set(
      (cat.templates as TemplateItem[]).map((t) => normalizeTemplate(t).label)
    );
    return previouslySelected.filter((g) => labels.has(g));
  }, [selectedCategory, previouslySelected]);

  const handleSelectGoal = (goal: string) => {
    onSelect(goal);
    onClose();
  };

  const currentCategory = selectedCategory ? categories.find((c) => c.key === selectedCategory) : null;

  return (
    <Modal visible animationType="slide" transparent>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
          <View style={[styles.header, { borderBottomColor: 'rgba(255,255,255,0.1)' }]}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerIcon}>✨</Text>
              <Text style={styles.headerTitle}>
                {currentCategory ? currentCategory.label : CAREER_LABELS.goalTemplateButton}
              </Text>
            </View>
            <TouchableOpacity
              onPress={selectedCategory ? () => setSelectedCategory(null) : onClose}
              style={styles.closeButton}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {!selectedCategory ? (
              <View style={styles.categoryList}>
                {/* 이전 선택된 목표 */}
                {previouslySelected.length > 0 && (
                  <View style={styles.prevSection}>
                    <Text style={[styles.prevLabel, { color }]}>✓ 이미 선택한 목표</Text>
                    <View style={styles.prevChips}>
                      {previouslySelected.map((goal) => (
                        <TouchableOpacity
                          key={goal}
                          onPress={() => handleSelectGoal(goal)}
                          style={[styles.prevChip, { backgroundColor: color + '18', borderColor: color + '40' }]}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.prevChipText}>{goal}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.key}
                    onPress={() => setSelectedCategory(cat.key)}
                    style={[styles.categoryCard, { backgroundColor: cat.color + '15', borderColor: cat.color + '30' }]}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.categoryIcon, { backgroundColor: cat.color + '25', borderColor: cat.color + '40' }]}>
                      <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                    </View>
                    <View style={styles.categoryInfo}>
                      <Text style={styles.categoryLabel}>{cat.label}</Text>
                      <Text style={styles.categoryCount}>{cat.templates.length}개 템플릿</Text>
                    </View>
                    <Text style={styles.chevron}>›</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.templateList}>
                {/* 이전 선택 — 카테고리 내 */}
                {prevInCategory.length > 0 && (
                  <View style={styles.prevSection}>
                    <Text style={[styles.prevLabel, { color }]}>✓ 이미 선택한 목표</Text>
                    <View style={styles.prevChips}>
                      {prevInCategory.map((goal) => (
                        <TouchableOpacity
                          key={goal}
                          onPress={() => handleSelectGoal(goal)}
                          style={[styles.prevChip, { backgroundColor: color + '18', borderColor: color + '40' }]}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.prevChipText}>{goal}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {/* 템플릿 목록 — 아이콘 + 제목 + 설명 */}
                {currentCategory?.templates.map((t, idx) => {
                  const { label, icon, description } = normalizeTemplate(t);
                  return (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => handleSelectGoal(label)}
                      style={styles.templateRow}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.templateIconBox, { backgroundColor: color + '18', borderColor: color + '30' }]}>
                        <Text style={styles.templateIcon}>{icon}</Text>
                      </View>
                      <View style={styles.templateContent}>
                        <Text style={styles.templateText}>{label}</Text>
                        {description ? (
                          <Text style={styles.templateDesc} numberOfLines={2}>{description}</Text>
                        ) : null}
                      </View>
                      <View style={[styles.selectBadge, { backgroundColor: color + '25' }]}>
                        <Text style={[styles.selectBadgeText, { color }]}>선택</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  headerIcon: { fontSize: 18 },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: '#fff' },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: { color: '#fff', fontSize: 14 },

  content: { maxHeight: 400 },
  categoryList: { padding: SPACING.lg, gap: SPACING.sm },
  prevSection: { marginBottom: SPACING.md },
  prevLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', marginBottom: SPACING.sm },
  prevChips: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  prevChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
  },
  prevChipText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#fff' },

  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1.5,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  categoryEmoji: { fontSize: 24 },
  categoryInfo: { flex: 1, marginLeft: SPACING.md },
  categoryLabel: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#fff' },
  categoryCount: { fontSize: FONT_SIZES.xs, color: '#9CA3AF', marginTop: 2 },
  chevron: { fontSize: 18, color: '#6B7280' },

  templateList: { padding: SPACING.lg, gap: SPACING.sm },
  templateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  templateIconBox: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  templateIcon: { fontSize: 20 },
  templateContent: { flex: 1 },
  templateText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#fff' },
  templateDesc: { fontSize: FONT_SIZES.xs, color: '#9CA3AF', marginTop: 2 },
  selectBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: BORDER_RADIUS.full },
  selectBadgeText: { fontSize: FONT_SIZES.xs, fontWeight: '700' },
});
