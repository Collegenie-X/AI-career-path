import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../config/theme';
import { RIASEC_META, HOME_LABELS } from '../../config/labels';
import type { RIASECResult } from '../../lib/types';

interface AptitudeSectionProps {
  riasec: RIASECResult | null;
  onTest: () => void;
  onViewReport: () => void;
}

function EmptyAptitude({ onTest }: { onTest: () => void }) {
  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionIcon}>🧠</Text>
        <Text style={styles.sectionTitle}>{HOME_LABELS.aptitude}</Text>
      </View>
      <TouchableOpacity style={styles.quizCard} onPress={onTest} activeOpacity={0.8}>
        <View style={styles.quizCardContent}>
          <View style={styles.quizIconContainer}>
            <Text style={styles.quizEmoji}>🧩</Text>
          </View>
          <View style={styles.quizTextContainer}>
            <Text style={styles.quizTitle}>{HOME_LABELS.aptitudeQuiz.title}</Text>
            <Text style={styles.quizDescription}>{HOME_LABELS.aptitudeQuiz.description}</Text>
          </View>
        </View>
        <View style={styles.quizProgressTrack}>
          <View style={styles.quizProgressEmpty} />
        </View>
        <Text style={styles.quizXpReward}>⚡ {HOME_LABELS.aptitudeQuiz.xpReward}</Text>
      </TouchableOpacity>
    </View>
  );
}

function FilledAptitude({
  riasec,
  onTest,
  onViewReport,
}: {
  riasec: RIASECResult;
  onTest: () => void;
  onViewReport: () => void;
}) {
  const topType = riasec.topTypes[0];
  const secondType = riasec.topTypes[1];
  const topMeta = RIASEC_META[topType];
  const secondMeta = RIASEC_META[secondType];

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionIcon}>🧠</Text>
          <Text style={styles.sectionTitle}>{HOME_LABELS.aptitude}</Text>
        </View>
        <TouchableOpacity onPress={onViewReport} activeOpacity={0.7}>
          <Text style={styles.reportLink}>{HOME_LABELS.aptitudeReport} ›</Text>
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.resultCard,
          {
            backgroundColor: `${topMeta.color}18`,
            borderColor: `${topMeta.color}40`,
          },
        ]}
      >
        <View style={styles.typesRow}>
          <View style={styles.typeIcons}>
            <View style={[styles.typeIcon, { backgroundColor: `${topMeta.color}30`, borderColor: `${topMeta.color}50` }]}>
              <Text style={styles.typeEmoji}>{topMeta.emoji}</Text>
              <View style={[styles.rankBadge, { backgroundColor: COLORS.yellow }]}>
                <Text style={styles.rankText}>1</Text>
              </View>
            </View>
            <View style={[styles.typeIcon, { backgroundColor: `${secondMeta.color}30`, borderColor: `${secondMeta.color}50` }]}>
              <Text style={styles.typeEmoji}>{secondMeta.emoji}</Text>
              <View style={[styles.rankBadge, { backgroundColor: COLORS.textSecondary }]}>
                <Text style={styles.rankText}>2</Text>
              </View>
            </View>
          </View>
          <View style={styles.typeInfo}>
            <View style={styles.typeLabels}>
              <Text style={[styles.typeLabel, { color: topMeta.color }]}>{topMeta.label}</Text>
              <Text style={styles.typePlus}>+</Text>
              <Text style={[styles.typeLabel, { color: secondMeta.color }]}>{secondMeta.label}</Text>
            </View>
            <Text style={styles.typeDesc}>{topMeta.desc}</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: 'rgba(168,85,247,0.3)', borderColor: 'rgba(168,85,247,0.4)' }]}
            onPress={onTest}
            activeOpacity={0.7}
          >
            <Text style={styles.actionButtonText}>📋 {HOME_LABELS.retakeTest}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.reportButton}
            onPress={onViewReport}
            activeOpacity={0.7}
          >
            <Text style={styles.reportButtonText}>🧠 {HOME_LABELS.viewReport}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export function AptitudeSection({ riasec, onTest, onViewReport }: AptitudeSectionProps) {
  if (!riasec) {
    return <EmptyAptitude onTest={onTest} />;
  }
  return <FilledAptitude riasec={riasec} onTest={onTest} onViewReport={onViewReport} />;
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  sectionIcon: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '900',
    color: COLORS.white,
  },
  reportLink: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: '#a78bfa',
  },
  quizCard: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    backgroundColor: 'rgba(168,85,247,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.4)',
  },
  quizCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  quizIconContainer: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(168,85,247,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quizEmoji: {
    fontSize: 28,
  },
  quizTextContainer: {
    flex: 1,
  },
  quizTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.white,
  },
  quizDescription: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  quizProgressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: SPACING.sm,
  },
  quizProgressEmpty: {
    height: '100%',
    width: 0,
    borderRadius: 4,
  },
  quizXpReward: {
    fontSize: 11,
    color: '#C4B5FD',
  },
  resultCard: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    borderWidth: 1.5,
  },
  typesRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  typeIcons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  typeIcon: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    position: 'relative',
  },
  typeEmoji: {
    fontSize: 24,
  },
  rankBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.white,
  },
  typeInfo: {
    flex: 1,
  },
  typeLabels: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: 4,
  },
  typeLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '900',
  },
  typePlus: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textDim,
  },
  typeDesc: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.white,
  },
  reportButton: {
    flex: 1,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  reportButtonText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.white,
  },
});
