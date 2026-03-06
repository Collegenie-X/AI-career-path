import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../config/theme';
import { CAREER_LABELS, type CareerPlan } from '../../config/career-path';
import { PlanSelector } from './PlanSelector';

interface BuilderTabProps {
  plans: CareerPlan[];
  selectedPlanId: string | null;
  onSelectPlan: (planId: string) => void;
  onNew: () => void;
  onEdit: (plan: CareerPlan) => void;
  onDelete: (planId: string) => void;
  onViewTimeline: () => void;
}

function StepGuide() {
  return (
    <View style={styles.guideCard}>
      <Text style={styles.guideTitle}>💡 {CAREER_LABELS.builderGuideTitle}</Text>
      {CAREER_LABELS.builderSteps.map((item, idx) => (
        <View key={idx} style={styles.guideStep}>
          <View style={styles.guideStepNumber}>
            <Text style={styles.guideStepNumberText}>{idx + 1}</Text>
          </View>
          <View style={styles.guideStepContent}>
            <Text style={styles.guideStepTitle}>{item.emoji} {item.title}</Text>
            <Text style={styles.guideStepDesc}>{item.desc}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

export function BuilderTab({
  plans, selectedPlanId, onSelectPlan, onNew, onEdit, onDelete, onViewTimeline,
}: BuilderTabProps) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <View style={styles.heroCard}>
        <Text style={styles.heroEmoji}>🛠️</Text>
        <Text style={styles.heroTitle}>{CAREER_LABELS.builderHeroTitle}</Text>
        <Text style={styles.heroDescription}>{CAREER_LABELS.builderHeroDescription}</Text>
      </View>

      <PlanSelector
        plans={plans}
        selectedPlanId={selectedPlanId}
        onSelectPlan={onSelectPlan}
        onNewPlan={onNew}
        onEditPlan={onEdit}
        onDeletePlan={onDelete}
      />

      <StepGuide />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { gap: SPACING.lg, padding: SPACING.lg, paddingBottom: 24 },
  heroCard: {
    borderRadius: BORDER_RADIUS.xxl, padding: SPACING.xxl, alignItems: 'center',
    backgroundColor: 'rgba(108,92,231,0.12)',
    borderWidth: 1.5, borderColor: 'rgba(108,92,231,0.28)',
  },
  heroEmoji: { fontSize: 48, marginBottom: SPACING.lg },
  heroTitle: { fontSize: FONT_SIZES.xl, fontWeight: '900', color: '#fff', textAlign: 'center', marginBottom: SPACING.sm },
  heroDescription: { fontSize: FONT_SIZES.sm, color: '#9CA3AF', textAlign: 'center', lineHeight: 22 },
  guideCard: {
    borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, gap: SPACING.lg,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  guideTitle: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: '#D1D5DB' },
  guideStep: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md },
  guideStepNumber: {
    width: 28, height: 28, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  guideStepNumberText: { fontSize: FONT_SIZES.xs, fontWeight: '900', color: '#fff' },
  guideStepContent: { flex: 1 },
  guideStepTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#fff' },
  guideStepDesc: { fontSize: FONT_SIZES.xs, color: '#6B7280', marginTop: 2 },
});
