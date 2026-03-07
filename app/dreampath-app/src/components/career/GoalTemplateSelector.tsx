import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView,
} from 'react-native';
import { SPACING, FONT_SIZES, BORDER_RADIUS } from '../../config/theme';
import { CAREER_LABELS } from '../../config/career-path';
import goalTemplatesData from '../../data/goal-templates.json';

type CategoryKey = keyof typeof goalTemplatesData;

interface GoalTemplateSelectorProps {
  onSelect: (goal: string) => void;
  onClose: () => void;
  color: string;
}

export function GoalTemplateSelector({ onSelect, onClose, color }: GoalTemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | null>(null);

  const categories = Object.entries(goalTemplatesData).map(([key, data]) => ({
    key: key as CategoryKey,
    label: (data as { label: string }).label,
    emoji: (data as { emoji: string }).emoji,
    color: (data as { color: string }).color,
    templates: (data as { templates: string[] }).templates,
  }));

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
                {currentCategory?.templates.map((template, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => handleSelectGoal(template)}
                    style={styles.templateRow}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.templateDot, { backgroundColor: color }]} />
                    <Text style={styles.templateText}>{template}</Text>
                    <View style={[styles.selectBadge, { backgroundColor: color + '25' }]}>
                      <Text style={[styles.selectBadgeText, { color }]}>선택</Text>
                    </View>
                  </TouchableOpacity>
                ))}
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
  templateDot: { width: 8, height: 8, borderRadius: 4 },
  templateText: { flex: 1, fontSize: FONT_SIZES.sm, fontWeight: '500', color: '#fff' },
  selectBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: BORDER_RADIUS.full },
  selectBadgeText: { fontSize: FONT_SIZES.xs, fontWeight: '700' },
});
