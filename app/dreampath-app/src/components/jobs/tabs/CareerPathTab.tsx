import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../config/theme';
import { JOBS_EXPLORE_LABELS } from '../../../config/labels';
import type {
  StarJob,
  CareerGradeGroup,
  CareerItem,
  CareerItemType,
  CareerMilestone,
} from '../../../lib/types';

interface CareerPathTabProps {
  job: StarJob;
  starColor: string;
}

const GRADE_CODE_COLORS: Record<string, string> = {
  '초': '#22C55E',
  '중': '#3B82F6',
  '중1': '#3B82F6',
  '중2': '#6366F1',
  '중3': '#8B5CF6',
  '고1': '#A855F7',
  '고2': '#F59E0B',
  '고3': '#EF4444',
};

const ITEM_TYPE_CONFIG: Record<CareerItemType, { label: string; color: string; bg: string; iconBg: string }> = {
  activity: { label: '활동', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)', iconBg: 'rgba(59,130,246,0.20)' },
  award: { label: '수상·대회', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', iconBg: 'rgba(245,158,11,0.20)' },
  certification: { label: '자격증', color: '#22C55E', bg: 'rgba(34,197,94,0.12)', iconBg: 'rgba(34,197,94,0.20)' },
};

export function CareerPathTab({ job, starColor }: CareerPathTabProps) {
  const timeline = job.careerTimeline;
  const [expandedGroupIndex, setExpandedGroupIndex] = useState<number>(0);

  const handleGroupToggle = useCallback((index: number) => {
    setExpandedGroupIndex((prev) => (prev === index ? -1 : index));
  }, []);

  if (!timeline) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>커리어 패스 정보가 준비 중입니다</Text>
      </View>
    );
  }

  const hasGradeGroups = timeline.gradeGroups && timeline.gradeGroups.length > 0;

  return (
    <View style={styles.container}>
      <CareerPathHeader
        title={timeline.title}
        totalYears={timeline.totalYears}
        totalCost={timeline.totalCost}
        starColor={starColor}
      />

      {hasGradeGroups
        ? timeline.gradeGroups!.map((group, index) => (
            <GradeGroupSection
              key={`${group.gradeCode}-${index}`}
              group={group}
              starColor={starColor}
              isExpanded={expandedGroupIndex === index}
              onToggle={() => handleGroupToggle(index)}
            />
          ))
        : timeline.milestones.map((milestone, index) => (
            <TimelineStepRow
              key={`${milestone.period}-${milestone.semester}-${index}`}
              milestone={milestone}
              isLast={index === timeline.milestones.length - 1}
              starColor={starColor}
            />
          ))}

      <KeySuccessSection keySuccess={timeline.keySuccess} totalCost={timeline.totalCost} />
    </View>
  );
}

function CareerPathHeader({
  title,
  totalYears,
  totalCost,
  starColor,
}: {
  title: string;
  totalYears: string;
  totalCost: string;
  starColor: string;
}) {
  return (
    <View style={[styles.headerCard, { borderColor: `${starColor}25` }]}>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.headerMetaRow}>
        <View style={[styles.headerMetaChip, { backgroundColor: `${starColor}15` }]}>
          <Text style={styles.headerMetaIcon}>📅</Text>
          <Text style={[styles.headerMetaText, { color: starColor }]}>{totalYears}</Text>
        </View>
        <View style={[styles.headerMetaChip, { backgroundColor: `${starColor}15` }]}>
          <Text style={styles.headerMetaIcon}>💰</Text>
          <Text style={[styles.headerMetaText, { color: starColor }]}>총 {totalCost}</Text>
        </View>
      </View>
    </View>
  );
}

function TimelineStepRow({
  milestone,
  isLast,
  starColor,
}: {
  milestone: CareerMilestone;
  isLast: boolean;
  starColor: string;
}) {
  const { period, semester, icon, title, activities, awards, achievement, cost } = milestone;
  const hasAwards = awards && awards.length > 0;

  return (
    <View style={[styles.stepSection, !isLast && styles.stepSectionBorder]}>
      <View style={styles.stepRow}>
        <View style={styles.timelineColumn}>
          <View style={[styles.stepIconCircle, { backgroundColor: `${starColor}25`, borderColor: `${starColor}50` }]}>
            <Text style={styles.stepIcon}>{icon}</Text>
          </View>
          {!isLast && <View style={[styles.timelineLine, { backgroundColor: `${starColor}20` }]} />}
        </View>

        <View style={styles.stepContent}>
          <View style={styles.stepMetaRow}>
            <View style={[styles.periodBadge, { backgroundColor: `${starColor}20` }]}>
              <Text style={[styles.periodText, { color: starColor }]}>{period} {semester}</Text>
            </View>
            <View style={styles.costRow}>
              <Text style={styles.costIcon}>💰</Text>
              <Text style={styles.costText}>{cost ?? '무료'}</Text>
            </View>
          </View>

          <Text style={styles.stepTitle}>{title}</Text>

          <View style={styles.activitiesBlock}>
            {activities.map((a) => (
              <Text key={a} style={styles.activityBullet}>• {a}</Text>
            ))}
          </View>

          <View style={styles.achievementsRow}>
            {hasAwards && awards!.map((award) => (
              <View key={award} style={styles.achievementItem}>
                <Text style={styles.achievementIcon}>{award.includes('합격') ? '✅' : '🏆'}</Text>
                <Text style={award.includes('합격') ? styles.achievementTextGreen : styles.achievementTextGold}>{award}</Text>
              </View>
            ))}
            <View style={styles.achievementItem}>
              <Text style={styles.achievementIcon}>✅</Text>
              <Text style={styles.achievementTextGreen}>{achievement}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

function GradeGroupSection({
  group,
  starColor,
  isExpanded,
  onToggle,
}: {
  group: CareerGradeGroup;
  starColor: string;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const gradeColor = GRADE_CODE_COLORS[group.gradeCode] ?? starColor;

  return (
    <View style={[styles.gradeSection, { borderColor: `${gradeColor}30` }]}>
      <TouchableOpacity style={styles.gradeHeader} onPress={onToggle} activeOpacity={0.75}>
        <View style={[styles.gradeCodeBadge, { backgroundColor: gradeColor }]}>
          <Text style={styles.gradeCodeText}>{group.gradeCode}</Text>
        </View>
        <View style={styles.gradeTitleBlock}>
          <Text style={styles.gradeLabelText}>{group.gradeLabel}</Text>
          <Text style={styles.gradeItemCount}>{group.itemCount}개 항목</Text>
        </View>
        <Text style={styles.gradeChevron}>{isExpanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.gradeBody}>
          {group.description && (
            <Text style={styles.gradeDescription}>{group.description}</Text>
          )}
          {group.goals && group.goals.length > 0 && (
            <View style={styles.goalsRow}>
              <Text style={styles.goalsLabel}>목표</Text>
              <View style={styles.goalsChips}>
                {group.goals.map((g) => (
                  <View key={g} style={[styles.goalChip, { borderColor: gradeColor }]}>
                    <Text style={styles.goalChipText}>{g}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          {group.items && group.items.length > 0 && (
            <View style={styles.itemsGrid}>
              {group.items.map((item, idx) => (
                <GradeItemCard key={`${item.name}-${idx}`} item={item} />
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

function GradeItemCard({ item }: { item: CareerItem }) {
  const typeConfig = ITEM_TYPE_CONFIG[item.type] ?? ITEM_TYPE_CONFIG.activity;

  return (
    <View style={[styles.itemCard, { borderLeftColor: typeConfig.color }]}>
      <View style={styles.itemCardRow}>
        <View style={[styles.itemIconBox, { backgroundColor: typeConfig.iconBg }]}>
          <Text style={styles.itemIcon}>{item.icon}</Text>
        </View>
        <View style={styles.itemCardBody}>
          <Text style={styles.itemName}>{item.name}</Text>
          <View style={styles.itemMetaRow}>
            <View style={[styles.itemTypeBadge, { backgroundColor: typeConfig.bg }]}>
              <Text style={[styles.itemTypeText, { color: typeConfig.color }]}>{typeConfig.label}</Text>
            </View>
            {item.duration && <Text style={styles.itemMeta}>📅 {item.duration}</Text>}
            {item.cost && <Text style={styles.itemMeta}>💰 {item.cost}</Text>}
          </View>
        </View>
      </View>
    </View>
  );
}

function KeySuccessSection({ keySuccess, totalCost }: { keySuccess: string[]; totalCost: string }) {
  return (
    <View style={styles.keySuccessCard}>
      <View style={styles.keySuccessHeader}>
        <Text style={styles.keySuccessIcon}>🏆</Text>
        <Text style={styles.keySuccessTitle}>{JOBS_EXPLORE_LABELS.timelineKeySuccess}</Text>
      </View>
      <View style={styles.keySuccessList}>
        {keySuccess.map((item) => (
          <View key={item} style={styles.keySuccessItem}>
            <Text style={styles.keySuccessCheck}>✅</Text>
            <Text style={styles.keySuccessText}>{item}</Text>
          </View>
        ))}
      </View>
      <View style={styles.totalCostRow}>
        <Text style={styles.totalCostLabel}>{JOBS_EXPLORE_LABELS.timelineTotalCost}</Text>
        <Text style={styles.totalCostValue}>{totalCost}</Text>
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

  headerCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '900',
    color: COLORS.white,
    marginBottom: SPACING.md,
  },
  headerMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  headerMetaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.md,
  },
  headerMetaIcon: {
    fontSize: 14,
  },
  headerMetaText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '800',
  },

  stepSection: {
    marginBottom: SPACING.lg,
  },
  stepSectionBorder: {
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineColumn: {
    width: 44,
    alignItems: 'center',
  },
  stepIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  stepIcon: {
    fontSize: 18,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    minHeight: 24,
    marginTop: 4,
  },
  stepContent: {
    flex: 1,
    paddingLeft: SPACING.md,
  },
  stepMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  periodBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
  },
  periodText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '800',
  },
  costRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  costIcon: {
    fontSize: 12,
  },
  costText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  stepTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '900',
    color: COLORS.white,
    marginBottom: SPACING.sm,
  },
  activitiesBlock: {
    gap: 4,
    marginBottom: SPACING.sm,
  },
  activityBullet: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  achievementsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: SPACING.md,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  achievementIcon: {
    fontSize: 12,
  },
  achievementTextGreen: {
    fontSize: FONT_SIZES.xs,
    color: '#22C55E',
    fontWeight: '600',
  },
  achievementTextGold: {
    fontSize: FONT_SIZES.xs,
    color: '#FBBF24',
    fontWeight: '600',
  },

  gradeSection: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  gradeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.lg,
  },
  gradeCodeBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeCodeText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.white,
  },
  gradeTitleBlock: {
    flex: 1,
  },
  gradeLabelText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '800',
    color: COLORS.white,
  },
  gradeItemCount: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  gradeChevron: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  gradeBody: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    padding: SPACING.lg,
    gap: SPACING.lg,
  },
  gradeDescription: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  goalsRow: {
    gap: SPACING.sm,
  },
  goalsLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  goalsChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  goalChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderLeftWidth: 3,
  },
  goalChipText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  itemsGrid: {
    gap: SPACING.sm,
  },
  itemCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 3,
    padding: SPACING.md,
  },
  itemCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  itemIconBox: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemIcon: {
    fontSize: 18,
  },
  itemCardBody: {
    flex: 1,
  },
  itemName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '800',
    color: COLORS.white,
  },
  itemMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: 4,
  },
  itemTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
  },
  itemTypeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  itemMeta: {
    fontSize: 10,
    color: COLORS.textMuted,
  },

  keySuccessCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: SPACING.lg,
    marginTop: SPACING.sm,
  },
  keySuccessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  keySuccessIcon: {
    fontSize: 16,
  },
  keySuccessTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '900',
    color: COLORS.white,
  },
  keySuccessList: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  keySuccessItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  keySuccessCheck: {
    fontSize: 12,
  },
  keySuccessText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  totalCostRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  totalCostLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  totalCostValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '900',
    color: COLORS.white,
  },
});
