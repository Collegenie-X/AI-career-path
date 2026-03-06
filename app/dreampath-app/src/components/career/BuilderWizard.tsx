import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../config/theme';
import {
  CAREER_LABELS, CAREER_GRADE_YEARS, BUILDER_STEPS,
  type CareerPlan, type CareerYearPlan,
} from '../../config/career-path';
import careerMaker from '../../data/career-maker.json';
import { StepKingdom } from './StepKingdom';
import { StepJob } from './StepJob';
import { StepPlanner } from './StepPlanner';
import { StepSummary } from './StepSummary';

interface BuilderWizardProps {
  initialPlan?: CareerPlan | null;
  initialStep?: number;
  onSave: (plan: CareerPlan) => void;
  onClose: () => void;
}

function StepDots({ current, total, color }: { current: number; total: number; color: string }) {
  return (
    <View style={styles.dotsRow}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            { width: i + 1 === current ? 20 : 7, backgroundColor: i + 1 <= current ? color : 'rgba(255,255,255,0.15)' },
          ]}
        />
      ))}
    </View>
  );
}

export function BuilderWizard({ initialPlan, initialStep, onSave, onClose }: BuilderWizardProps) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(initialStep ?? 1);
  const [starId, setStarId] = useState(initialPlan?.starId ?? '');
  const [jobId, setJobId] = useState(initialPlan?.jobId ?? '');
  const [yearPlans, setYearPlans] = useState<CareerYearPlan[]>(initialPlan?.years ?? []);

  const kingdom = careerMaker.kingdoms.find((k) => k.id === starId);
  const job = kingdom?.representativeJobs.find((j) => j.id === jobId);
  const color = kingdom?.color ?? COLORS.primary;

  const canProceed = () => {
    if (step === 1) return !!starId;
    if (step === 2) return !!jobId;
    if (step === 3) return yearPlans.length > 0;
    return true;
  };

  const handleSave = () => {
    if (!kingdom || !job) return;
    const gradeOrder = CAREER_GRADE_YEARS.reduce((acc, g, i) => ({ ...acc, [g.id]: i }), {} as Record<string, number>);
    const plan: CareerPlan = {
      id: initialPlan?.id ?? `plan-${Date.now()}`,
      starId: kingdom.id,
      starName: kingdom.name,
      starEmoji: kingdom.emoji,
      starColor: kingdom.color,
      jobId: job.id,
      jobName: job.name,
      jobEmoji: job.icon,
      years: yearPlans.sort((a, b) => (gradeOrder[a.gradeId] ?? 0) - (gradeOrder[b.gradeId] ?? 0)),
      createdAt: initialPlan?.createdAt ?? new Date().toISOString(),
      title: `${job.name} 커리어 패스`,
    };
    onSave(plan);
  };

  const headings: Record<number, { title: string; desc: string }> = {
    1: { title: CAREER_LABELS.headingKingdom, desc: CAREER_LABELS.headingKingdomDesc },
    2: { title: CAREER_LABELS.headingJob, desc: `${kingdom?.name ?? ''}에서 원하는 직업을 골라보세요` },
    3: { title: CAREER_LABELS.headingPlan, desc: CAREER_LABELS.headingPlanDesc },
    4: { title: CAREER_LABELS.headingDone, desc: CAREER_LABELS.headingDoneDesc },
  };

  const stepConf = BUILDER_STEPS[step - 1];

  return (
    <Modal visible animationType="slide">
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={step === 1 ? onClose : () => setStep((s) => s - 1)}
            style={styles.headerButton}
          >
            <Text style={styles.headerButtonText}>‹</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerStepLabel}>{stepConf.emoji} {stepConf.title}</Text>
            <StepDots current={step} total={4} color={color} />
          </View>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Text style={styles.headerButtonClose}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headingSection}>
          <Text style={styles.headingTitle}>{headings[step].title}</Text>
          <Text style={styles.headingDesc}>{headings[step].desc}</Text>
          {step >= 2 && kingdom && (
            <View style={styles.breadcrumbRow}>
              <View style={[styles.breadcrumb, { backgroundColor: color + '20', borderColor: color + '33' }]}>
                <Text style={[styles.breadcrumbText, { color }]}>{kingdom.emoji} {kingdom.name}</Text>
              </View>
              {step >= 3 && job && (
                <>
                  <Text style={styles.breadcrumbArrow}>→</Text>
                  <View style={[styles.breadcrumb, { backgroundColor: color + '20', borderColor: color + '33' }]}>
                    <Text style={[styles.breadcrumbText, { color }]}>{job.icon} {job.name}</Text>
                  </View>
                </>
              )}
            </View>
          )}
        </View>

        <View style={styles.contentArea}>
          {step === 1 && (
            <StepKingdom selectedId={starId} onSelect={(id) => { setStarId(id); setJobId(''); }} />
          )}
          {step === 2 && kingdom && (
            <StepJob kingdom={kingdom} selectedJobId={jobId} onSelect={setJobId} />
          )}
          {step === 3 && (
            <StepPlanner
              yearPlans={yearPlans}
              onUpdateYears={setYearPlans}
              starId={starId}
              color={color}
              jobName={job?.name ?? ''}
            />
          )}
          {step === 4 && (
            <StepSummary
              plan={{
                starId, starName: kingdom?.name, starEmoji: kingdom?.emoji, starColor: color,
                jobId, jobName: job?.name, jobEmoji: job?.icon, years: yearPlans,
              }}
              color={color}
            />
          )}
        </View>

        <View style={[styles.footer, { paddingBottom: Math.max(20, insets.bottom) }]}>
          <TouchableOpacity
            onPress={step === 4 ? handleSave : () => setStep((s) => s + 1)}
            disabled={!canProceed()}
            style={[
              styles.footerButton,
              canProceed()
                ? { backgroundColor: color, shadowColor: color }
                : { backgroundColor: 'rgba(255,255,255,0.08)' },
            ]}
            activeOpacity={0.85}
          >
            <Text style={[styles.footerButtonText, !canProceed() && { opacity: 0.35 }]}>
              {step === 4 ? `✓ ${CAREER_LABELS.saveButton}` : step === 3 ? `${CAREER_LABELS.previewButton} ›` : `${CAREER_LABELS.nextButton} ›`}
            </Text>
          </TouchableOpacity>
          {step === 3 && (
            <Text style={styles.footerHint}>{CAREER_LABELS.gradeMinNotice}</Text>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#08081a' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  headerButton: { width: 36, height: 36, borderRadius: BORDER_RADIUS.lg, backgroundColor: 'rgba(255,255,255,0.07)', justifyContent: 'center', alignItems: 'center' },
  headerButtonText: { fontSize: 22, color: '#D1D5DB', marginTop: -2 },
  headerButtonClose: { fontSize: 14, color: '#9CA3AF' },
  headerCenter: { alignItems: 'center', gap: 6 },
  headerStepLabel: { fontSize: FONT_SIZES.xs, color: '#6B7280', fontWeight: '600' },
  dotsRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { height: 7, borderRadius: 3.5 },
  headingSection: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.xl, paddingBottom: SPACING.lg },
  headingTitle: { fontSize: FONT_SIZES.xl, fontWeight: '900', color: '#fff', lineHeight: 28 },
  headingDesc: { fontSize: FONT_SIZES.sm, color: '#9CA3AF', marginTop: SPACING.xs },
  breadcrumbRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.md, flexWrap: 'wrap' },
  breadcrumb: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: BORDER_RADIUS.sm, borderWidth: 1 },
  breadcrumbText: { fontSize: FONT_SIZES.xs, fontWeight: '700' },
  breadcrumbArrow: { fontSize: FONT_SIZES.xs, color: '#4B5563' },
  contentArea: { flex: 1 },
  footer: {
    paddingHorizontal: SPACING.xl, paddingTop: SPACING.lg, gap: SPACING.sm,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(8,8,26,0.95)',
  },
  footerButton: {
    height: 56, borderRadius: BORDER_RADIUS.lg, justifyContent: 'center', alignItems: 'center',
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.44, shadowRadius: 24, elevation: 10,
  },
  footerButtonText: { fontSize: FONT_SIZES.lg, fontWeight: '900', color: '#fff' },
  footerHint: { fontSize: FONT_SIZES.xs, color: '#4B5563', textAlign: 'center' },
});
