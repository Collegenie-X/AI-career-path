import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../config/theme';
import type { CareerPlan } from '../../config/career-path';

interface PlanSelectorProps {
  plans: CareerPlan[];
  selectedPlanId: string | null;
  onSelectPlan: (planId: string) => void;
  onNewPlan: () => void;
  onEditPlan: (plan: CareerPlan) => void;
  onDeletePlan: (planId: string) => void;
}

export function PlanSelector({
  plans, selectedPlanId, onSelectPlan, onNewPlan, onEditPlan, onDeletePlan,
}: PlanSelectorProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (plans.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyEmoji}>📋</Text>
        <Text style={styles.emptyTitle}>아직 커리어 패스가 없어요</Text>
        <Text style={styles.emptyDesc}>새로 만들기를 눌러 시작하세요</Text>
        <TouchableOpacity style={styles.newButton} onPress={onNewPlan} activeOpacity={0.85}>
          <Text style={styles.newButtonText}>+ 새로 만들기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>내 커리어 패스 ({plans.length})</Text>
        <TouchableOpacity style={styles.newSmallButton} onPress={onNewPlan}>
          <Text style={styles.newSmallButtonText}>+ 새로 만들기</Text>
        </TouchableOpacity>
      </View>

      {plans.map((plan) => {
        const isSelected = plan.id === selectedPlanId;
        const isDeleting = plan.id === deletingId;
        const totalItems = plan.years.reduce(
          (s, y) => s + y.items.length + (y.groups ?? []).reduce((gs, g) => gs + g.items.length, 0),
          0,
        );

        return (
          <TouchableOpacity
            key={plan.id}
            style={[
              styles.planCard,
              isSelected && { borderColor: plan.starColor + '55', backgroundColor: plan.starColor + '10' },
            ]}
            onPress={() => onSelectPlan(plan.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.planEmoji, { backgroundColor: plan.starColor + '28', borderColor: plan.starColor + '30' }]}>
              <Text style={{ fontSize: 22 }}>{plan.jobEmoji}</Text>
            </View>
            <View style={styles.planInfo}>
              <Text style={styles.planTitle} numberOfLines={1}>{plan.title}</Text>
              <View style={styles.planMeta}>
                <Text style={[styles.planMetaText, { color: plan.starColor + 'cc' }]}>{plan.starEmoji} {plan.starName}</Text>
                <Text style={styles.planMetaDot}>·</Text>
                <Text style={styles.planMetaText}>{plan.years.length}학년</Text>
                <Text style={styles.planMetaDot}>·</Text>
                <Text style={styles.planMetaText}>{totalItems}개 항목</Text>
              </View>
            </View>

            {isSelected && !isDeleting && (
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: plan.starColor + '22', borderColor: plan.starColor + '44' }]}
                  onPress={() => onEditPlan(plan)}
                >
                  <Text style={[styles.actionButtonText, { color: plan.starColor }]}>수정</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: 'rgba(239,68,68,0.12)', borderColor: 'rgba(239,68,68,0.28)' }]}
                  onPress={() => setDeletingId(plan.id)}
                >
                  <Text style={[styles.actionButtonText, { color: '#ef4444' }]}>삭제</Text>
                </TouchableOpacity>
              </View>
            )}

            {isDeleting && (
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: 'rgba(255,255,255,0.07)' }]}
                  onPress={() => setDeletingId(null)}
                >
                  <Text style={[styles.actionButtonText, { color: 'rgba(255,255,255,0.5)' }]}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#ef4444' }]}
                  onPress={() => { onDeletePlan(plan.id); setDeletingId(null); }}
                >
                  <Text style={[styles.actionButtonText, { color: '#fff' }]}>삭제 확인</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: SPACING.sm },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xs },
  headerTitle: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1 },
  newSmallButton: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.lg, backgroundColor: COLORS.primary },
  newSmallButtonText: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: '#fff' },
  emptyCard: {
    borderRadius: BORDER_RADIUS.xl, padding: SPACING.xxl, alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  emptyEmoji: { fontSize: 40, marginBottom: SPACING.md },
  emptyTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: '#fff', marginBottom: SPACING.xs },
  emptyDesc: { fontSize: FONT_SIZES.sm, color: '#6B7280', marginBottom: SPACING.lg },
  newButton: {
    paddingHorizontal: SPACING.xxl, paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg, backgroundColor: COLORS.primary,
  },
  newButtonText: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#fff' },
  planCard: {
    borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, gap: SPACING.md,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  planEmoji: { width: 44, height: 44, borderRadius: BORDER_RADIUS.lg, justifyContent: 'center', alignItems: 'center', borderWidth: 1, alignSelf: 'flex-start' },
  planInfo: { flex: 1 },
  planTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#fff' },
  planMeta: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: 2 },
  planMetaText: { fontSize: 10, color: '#9CA3AF' },
  planMetaDot: { fontSize: 10, color: '#4B5563' },
  actionRow: { flexDirection: 'row', gap: SPACING.sm },
  actionButton: { flex: 1, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.lg, alignItems: 'center', borderWidth: 1, borderColor: 'transparent' },
  actionButtonText: { fontSize: FONT_SIZES.xs, fontWeight: '700' },
});
