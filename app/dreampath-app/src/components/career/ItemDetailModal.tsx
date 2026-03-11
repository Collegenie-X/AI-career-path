import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Linking,
} from 'react-native';
import { SPACING, FONT_SIZES, BORDER_RADIUS } from '../../config/theme';
import { CAREER_LABELS, CAREER_ITEM_TYPES, type CareerPlanItem } from '../../config/career-path';

interface ItemDetailModalProps {
  visible: boolean;
  item: CareerPlanItem | null;
  gradeLabel: string;
  color: string;
  onClose: () => void;
}

const DIFFICULTY_LABELS: Record<number, string> = {
  1: '매우 쉬움',
  2: '쉬움',
  3: '보통',
  4: '어려움',
  5: '매우 어려움',
};

export function ItemDetailModal({ visible, item, gradeLabel, color, onClose }: ItemDetailModalProps) {
  if (!item) return null;

  const tc = CAREER_ITEM_TYPES.find((t) => t.value === item.type);
  const accentColor = tc?.color ?? color;
  const monthLabel =
    item.months.length === 1
      ? `${item.months[0]}월`
      : item.months.length <= 3
      ? item.months.map((m) => `${m}월`).join('·')
      : `${item.months[0]}~${item.months[item.months.length - 1]}월`;

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <View style={[styles.overlay, { zIndex: 99999, elevation: 99999 }]}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.sheet}>
          {/* Header */}
          <View style={[styles.header, { backgroundColor: accentColor + '22', borderBottomColor: accentColor + '33' }]}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <View style={[styles.headerIcon, { backgroundColor: accentColor + '20', borderColor: accentColor + '44' }]}>
                <Text style={{ fontSize: 24 }}>{tc?.emoji ?? '📌'}</Text>
              </View>
              <View style={styles.headerText}>
                <Text style={[styles.headerType, { color: accentColor }]}>
                  {tc?.label} · {gradeLabel}
                </Text>
                <Text style={styles.headerTitle}>{item.title}</Text>
              </View>
            </View>
          </View>

          {/* Content — 2열 그리드로 상하 공간 절약 (모바일 대응) */}
          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.gridContainer}>
              {/* Row 1: 목표 기간 | 난이도 */}
              <View style={styles.gridRow}>
                <View style={styles.detailCard}>
                  <Text style={styles.detailIcon}>📅</Text>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>목표 기간</Text>
                    <Text style={styles.detailValue}>{monthLabel}</Text>
                    {item.months.length > 1 && (
                      <Text style={styles.detailHint}>{item.months.length}개월</Text>
                    )}
                  </View>
                </View>
                {item.difficulty > 0 && (
                  <View style={styles.detailCard}>
                    <Text style={styles.detailIcon}>🔥</Text>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>난이도</Text>
                      <View style={styles.difficultyRow}>
                        <Text style={styles.difficultyStars}>
                          {'★'.repeat(item.difficulty)}
                          {'☆'.repeat(5 - item.difficulty)}
                        </Text>
                        <Text style={styles.detailValue}>
                          {DIFFICULTY_LABELS[item.difficulty] ?? '보통'}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>

              {/* Row 2: 비용 | 주관/출처 */}
              {(item.cost || item.organizer) && (
                <View style={styles.gridRow}>
                  {item.cost && (
                    <View style={styles.detailCard}>
                      <Text style={styles.detailIcon}>💰</Text>
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>비용</Text>
                        <Text style={styles.detailValue}>{item.cost}</Text>
                      </View>
                    </View>
                  )}
                  {item.organizer && (
                    <View style={styles.detailCard}>
                      <Text style={styles.detailIcon}>🏢</Text>
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>주관/출처</Text>
                        <Text style={styles.detailValue} numberOfLines={2}>{item.organizer}</Text>
                      </View>
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* URL — 전체 너비 */}
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>🔗</Text>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>{CAREER_LABELS.itemUrl}</Text>
                {item.url && item.url.trim() ? (
                  <TouchableOpacity onPress={() => Linking.openURL(item.url!)} activeOpacity={0.7}>
                    <Text style={styles.urlLink} numberOfLines={2}>{item.url}</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.emptyHint}>정보 없음</Text>
                )}
              </View>
            </View>

            {/* 설명 — 전체 너비 */}
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>📝</Text>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>{CAREER_LABELS.itemDescription}</Text>
                {item.description && item.description.trim() ? (
                  <Text style={styles.descriptionText}>{item.description}</Text>
                ) : (
                  <Text style={styles.emptyHint}>정보 없음</Text>
                )}
              </View>
            </View>

            <View style={{ height: SPACING.xxl }} />
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: 'rgba(255,255,255,0.06)' }]}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.confirmButton, { backgroundColor: accentColor }]}
              activeOpacity={0.85}
            >
              <Text style={styles.confirmButtonText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  sheet: {
    backgroundColor: '#0f0f23',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '88%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
  },
  closeButton: {
    position: 'absolute',
    top: SPACING.lg,
    right: SPACING.lg,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  closeText: { fontSize: 14, color: '#9CA3AF' },
  headerContent: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  headerText: { flex: 1, minWidth: 0 },
  headerType: { fontSize: FONT_SIZES.xs, fontWeight: '700', marginBottom: 2 },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '900', color: '#fff', lineHeight: 24 },

  scrollContent: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg },
  gridContainer: {
    marginBottom: SPACING.sm,
  },
  gridRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  detailCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  detailIcon: { fontSize: 20, marginTop: 2 },
  detailContent: { flex: 1, minWidth: 0 },
  detailLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: '#9CA3AF', marginBottom: 4 },
  detailValue: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#fff' },
  detailHint: { fontSize: FONT_SIZES.xs, color: '#6B7280', marginTop: 2 },
  difficultyRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  difficultyStars: { fontSize: 14, color: '#F59E0B' },
  urlLink: {
    fontSize: FONT_SIZES.sm,
    color: '#60A5FA',
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  descriptionText: {
    fontSize: FONT_SIZES.sm,
    color: '#D1D5DB',
    lineHeight: 22,
  },
  emptyHint: {
    fontSize: FONT_SIZES.sm,
    color: '#6B7280',
    fontStyle: 'italic',
  },

  footer: {
    padding: SPACING.lg,
    borderTopWidth: 1,
  },
  confirmButton: {
    height: 48,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#fff' },
});
