import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../config/theme';
import { JOBS_EXPLORE_LABELS } from '../../../config/labels';
import type { StarJob, WorkPhase } from '../../../lib/types';

interface ProcessTabProps {
  job: StarJob;
  starColor: string;
}

export function ProcessTab({ job, starColor }: ProcessTabProps) {
  const workProcess = job.workProcess;
  const [expandedIndex, setExpandedIndex] = useState<number>(0);

  const handleToggle = useCallback((index: number) => {
    setExpandedIndex((prev) => (prev === index ? -1 : index));
  }, []);

  if (!workProcess) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>직무 프로세스 정보가 준비 중입니다</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.processDescription}>{workProcess.description}</Text>
      {workProcess.phases.map((phase, index) => (
        <PhaseStepItem
          key={phase.id}
          phase={phase}
          index={index}
          starColor={starColor}
          isLast={index === workProcess.phases.length - 1}
          isExpanded={expandedIndex === index}
          onToggle={() => handleToggle(index)}
        />
      ))}
    </View>
  );
}

function PhaseStepItem({
  phase,
  index,
  starColor,
  isLast,
  isExpanded,
  onToggle,
}: {
  phase: WorkPhase;
  index: number;
  starColor: string;
  isLast: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={styles.stepWrapper}>
      <View style={styles.stepRow}>
        <View style={styles.stepLineColumn}>
          <View style={[
            styles.stepNumberCircle,
            {
              backgroundColor: isExpanded ? `${starColor}30` : `${starColor}15`,
              borderColor: isExpanded ? starColor : `${starColor}40`,
            },
          ]}>
            <Text style={[styles.stepNumber, { color: isExpanded ? starColor : `${starColor}90` }]}>
              {index + 1}
            </Text>
          </View>
          {!isLast && (
            <View style={[
              styles.stepVerticalLine,
              isExpanded && { backgroundColor: `${starColor}25` },
            ]} />
          )}
        </View>

        <View style={styles.stepCardWrapper}>
          <TouchableOpacity
            style={[
              styles.stepCardHeader,
              isExpanded && { backgroundColor: 'rgba(255,255,255,0.05)' },
            ]}
            onPress={onToggle}
            activeOpacity={0.75}
          >
            <View style={[
              styles.stepIconBox,
              { backgroundColor: isExpanded ? `${starColor}20` : 'rgba(255,255,255,0.06)' },
            ]}>
              <Text style={styles.stepIcon}>{phase.icon}</Text>
            </View>
            <View style={styles.stepTitleBlock}>
              <Text style={styles.stepStepLabel}>
                {JOBS_EXPLORE_LABELS.processStepPrefix} {index + 1}
              </Text>
              <Text style={[styles.stepTitle, isExpanded && { color: COLORS.white }]}>
                {phase.title}
              </Text>
            </View>
            <View style={[styles.durationPill, { backgroundColor: `${starColor}18` }]}>
              <Text style={[styles.durationPillText, { color: starColor }]}>{phase.duration}</Text>
            </View>
          </TouchableOpacity>

          {isExpanded && (
            <View style={styles.stepExpandedContent}>
              <Text style={styles.stepDescription}>{phase.description}</Text>

              {phase.example && (
                <View style={[styles.exampleCard, { borderLeftColor: starColor }]}>
                  <View style={styles.exampleHeader}>
                    <Text style={styles.exampleIcon}>💡</Text>
                    <Text style={[styles.exampleLabel, { color: starColor }]}>
                      {JOBS_EXPLORE_LABELS.exampleLabel}
                    </Text>
                  </View>
                  <Text style={styles.exampleText}>{phase.example}</Text>
                </View>
              )}

              {phase.tools.length > 0 && (
                <View style={styles.chipSection}>
                  <View style={styles.chipSectionHeader}>
                    <Text style={styles.chipSectionIcon}>🏛️</Text>
                    <Text style={styles.chipSectionLabel}>{JOBS_EXPLORE_LABELS.toolsLabel}</Text>
                  </View>
                  <View style={styles.chipRow}>
                    {phase.tools.map((tool) => (
                      <View key={tool} style={styles.chip}>
                        <Text style={styles.chipText}>{tool}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {phase.skills.length > 0 && (
                <View style={styles.chipSection}>
                  <View style={styles.chipSectionHeader}>
                    <Text style={styles.chipSectionIcon}>⚡</Text>
                    <Text style={styles.chipSectionLabel}>{JOBS_EXPLORE_LABELS.skillsLabel}</Text>
                  </View>
                  <View style={styles.chipRow}>
                    {phase.skills.map((skill) => (
                      <View key={skill} style={[styles.chip, styles.skillChip]}>
                        <Text style={[styles.chipText, styles.skillChipText]}>⚡ {skill}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 0,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
  },
  emptyText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  processDescription: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  stepWrapper: {
    marginBottom: 0,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepLineColumn: {
    width: 36,
    alignItems: 'center',
  },
  stepNumberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  stepNumber: {
    fontSize: 11,
    fontWeight: '900',
  },
  stepVerticalLine: {
    flex: 1,
    width: 1.5,
    backgroundColor: 'rgba(255,255,255,0.08)',
    minHeight: 16,
  },
  stepCardWrapper: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    marginLeft: SPACING.sm,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
  },
  stepCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
  },
  stepIconBox: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIcon: {
    fontSize: 18,
  },
  stepTitleBlock: {
    flex: 1,
  },
  stepStepLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 1,
  },
  stepTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  durationPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
  },
  durationPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  stepExpandedContent: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  stepDescription: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  exampleCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: BORDER_RADIUS.sm,
    borderLeftWidth: 3,
    padding: SPACING.md,
  },
  exampleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  exampleIcon: {
    fontSize: 12,
  },
  exampleLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '800',
  },
  exampleText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  chipSection: {
    gap: 6,
  },
  chipSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipSectionIcon: {
    fontSize: 12,
  },
  chipSectionLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  chipText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  skillChip: {
    backgroundColor: 'rgba(108,92,231,0.12)',
  },
  skillChipText: {
    color: '#A29BFE',
  },
});
