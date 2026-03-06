import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../config/theme';
import { CAREER_LABELS, CAREER_ITEM_TYPES, CAREER_GRADE_YEARS } from '../../config/career-path';
import templates from '../../data/career-path-templates.json';

type Template = (typeof templates)[0];

interface TemplateDetailModalProps {
  template: Template;
  onClose: () => void;
  onUseTemplate: () => void;
}

export function TemplateDetailModal({ template, onClose, onUseTemplate }: TemplateDetailModalProps) {
  const totalItems = template.totalItems;
  const color = template.starColor;

  return (
    <Modal visible animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>커리어 패스 상세</Text>
            <View style={{ width: 36 }} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            <View style={[styles.heroCard, { backgroundColor: color + '18', borderColor: color + '33' }]}>
              <Text style={styles.heroEmoji}>{template.jobEmoji}</Text>
              <Text style={styles.heroTitle}>{template.title}</Text>
              <Text style={styles.heroDescription}>{template.description}</Text>
              <View style={styles.heroMeta}>
                <Text style={[styles.heroMetaItem, { color }]}>{template.starEmoji} {template.starName}</Text>
                <Text style={styles.heroMetaDot}>·</Text>
                <Text style={styles.heroMetaItem}>❤️ {template.likes}</Text>
                <Text style={styles.heroMetaDot}>·</Text>
                <Text style={styles.heroMetaItem}>👥 {template.uses}{CAREER_LABELS.detailUses}</Text>
              </View>
            </View>

            <View style={styles.tagsRow}>
              {template.tags.map((tag) => (
                <View key={tag} style={[styles.tag, { backgroundColor: color + '18', borderColor: color + '30' }]}>
                  <Text style={[styles.tagText, { color }]}>#{tag}</Text>
                </View>
              ))}
            </View>

            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: color + '15', borderColor: color + '22' }]}>
                <Text style={[styles.statCardValue, { color }]}>{totalItems}</Text>
                <Text style={styles.statCardLabel}>총 항목</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: 'rgba(167,139,250,0.15)', borderColor: 'rgba(167,139,250,0.22)' }]}>
                <Text style={[styles.statCardValue, { color: '#c4b5fd' }]}>{template.years.length}</Text>
                <Text style={styles.statCardLabel}>학년</Text>
              </View>
            </View>

            {template.years.map((year) => {
              const grade = CAREER_GRADE_YEARS.find((g) => g.id === year.gradeId);
              return (
                <View key={year.gradeId} style={[styles.yearCard, { borderColor: color + '22' }]}>
                  <View style={styles.yearHeader}>
                    <View style={[styles.yearBadge, { backgroundColor: color }]}>
                      <Text style={styles.yearBadgeText}>{year.gradeLabel}</Text>
                    </View>
                    <View style={styles.yearHeaderInfo}>
                      <Text style={styles.yearFullLabel}>{grade?.fullLabel ?? year.gradeLabel}</Text>
                      {year.goals.length > 0 && (
                        <Text style={styles.yearGoalPreview} numberOfLines={1}>
                          🎯 {year.goals[0]}{year.goals.length > 1 ? ` 외 ${year.goals.length - 1}개` : ''}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.yearItems}>
                    {year.items.map((item, idx) => {
                      const typeConf = CAREER_ITEM_TYPES.find((t) => t.value === item.type);
                      return (
                        <View key={idx} style={[styles.itemRow, { backgroundColor: (typeConf?.color ?? color) + '10', borderColor: (typeConf?.color ?? color) + '22' }]}>
                          <Text style={styles.itemEmoji}>{typeConf?.emoji ?? '📌'}</Text>
                          <View style={styles.itemInfo}>
                            <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                            <View style={styles.itemMeta}>
                              <Text style={[styles.itemType, { color: typeConf?.color ?? color }]}>{typeConf?.label}</Text>
                              <Text style={styles.itemMonth}>{'month' in item ? `${(item as { month: number }).month}월` : ''}</Text>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })}

            <View style={{ height: 100 }} />
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.useButton, { backgroundColor: color }]}
              onPress={onUseTemplate}
              activeOpacity={0.85}
            >
              <Text style={styles.useButtonText}>{CAREER_LABELS.exploreUseTemplate}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  container: { flex: 1, backgroundColor: '#0f0f23', marginTop: 60, borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  closeButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center' },
  closeText: { color: '#9CA3AF', fontSize: 16 },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: '#fff' },
  content: { padding: SPACING.xl },
  heroCard: { borderRadius: BORDER_RADIUS.xl, padding: SPACING.xl, borderWidth: 1, alignItems: 'center', marginBottom: SPACING.lg },
  heroEmoji: { fontSize: 48, marginBottom: SPACING.md },
  heroTitle: { fontSize: FONT_SIZES.xl, fontWeight: '900', color: '#fff', textAlign: 'center', marginBottom: SPACING.sm },
  heroDescription: { fontSize: FONT_SIZES.xs, color: '#9CA3AF', textAlign: 'center', lineHeight: 18 },
  heroMeta: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.md },
  heroMetaItem: { fontSize: 11, color: '#9CA3AF' },
  heroMetaDot: { fontSize: 11, color: '#4B5563' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.lg },
  tag: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: 99, borderWidth: 1 },
  tagText: { fontSize: 11, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.xl },
  statCard: { flex: 1, borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, borderWidth: 1 },
  statCardValue: { fontSize: 28, fontWeight: '900' },
  statCardLabel: { fontSize: FONT_SIZES.xs, color: '#9CA3AF', marginTop: 2 },
  yearCard: { borderRadius: BORDER_RADIUS.lg, borderWidth: 1, marginBottom: SPACING.md, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.02)' },
  yearHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  yearBadge: { width: 36, height: 36, borderRadius: BORDER_RADIUS.lg, justifyContent: 'center', alignItems: 'center' },
  yearBadgeText: { fontSize: FONT_SIZES.xs, fontWeight: '900', color: '#fff' },
  yearHeaderInfo: { flex: 1 },
  yearFullLabel: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#fff' },
  yearGoalPreview: { fontSize: 10, color: '#9CA3AF', marginTop: 2 },
  yearItems: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.md, gap: SPACING.sm },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.lg, borderWidth: 1 },
  itemEmoji: { fontSize: 16 },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#fff' },
  itemMeta: { flexDirection: 'row', gap: SPACING.sm, marginTop: 2 },
  itemType: { fontSize: 10, fontWeight: '700' },
  itemMonth: { fontSize: 10, color: '#6B7280' },
  footer: {
    paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(15,15,35,0.95)',
  },
  useButton: { height: 56, borderRadius: BORDER_RADIUS.lg, justifyContent: 'center', alignItems: 'center' },
  useButtonText: { fontSize: FONT_SIZES.lg, fontWeight: '900', color: '#fff' },
});
