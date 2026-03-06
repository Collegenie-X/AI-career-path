import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../config/theme';
import { JOBS_EXPLORE_LABELS } from '../../../config/labels';
import type {
  StarJob,
  CareerGradeGroup,
  CareerItem,
  CareerItemType,
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

const DIFFICULTY_DISPLAY = (level: number) => {
  const filled = '★'.repeat(level);
  const empty = '☆'.repeat(5 - level);
  return filled + empty;
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
        gradeCount={timeline.gradeGroups?.length}
        itemCount={timeline.gradeGroups?.reduce((sum, g) => sum + g.itemCount, 0)}
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
            <LegacyMilestoneRow
              key={`${milestone.period}-${index}`}
              period={milestone.period}
              semester={milestone.semester}
              icon={milestone.icon}
              title={milestone.title}
              activities={milestone.activities}
              awards={milestone.awards}
              achievement={milestone.achievement}
              cost={milestone.cost}
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
  gradeCount,
  itemCount,
}: {
  title: string;
  totalYears: string;
  totalCost: string;
  starColor: string;
  gradeCount?: number;
  itemCount?: number;
}) {
  return (
    <View style={[styles.headerCard, { borderColor: `${starColor}30` }]}>
      <View style={styles.headerTitleRow}>
        <View style={[styles.headerIconBox, { backgroundColor: `${starColor}20` }]}>
          <Text style={styles.headerIconEmoji}>🎓</Text>
        </View>
        <View style={styles.headerTitleBlock}>
          <Text style={styles.headerTitle}>{title}</Text>
          {gradeCount && itemCount && (
            <Text style={styles.headerSubInfo}>
              🏫 {gradeCount}개 학년 · {itemCount}개 항목 · ✅ 공식
            </Text>
          )}
        </View>
      </View>
      <View style={styles.headerMetaRow}>
        <View style={styles.headerMetaChip}>
          <Text style={styles.headerMetaIcon}>📅</Text>
          <Text style={styles.headerMetaText}>{totalYears}</Text>
        </View>
        <View style={styles.headerMetaChip}>
          <Text style={styles.headerMetaIcon}>💰</Text>
          <Text style={styles.headerMetaText}>총 {totalCost}</Text>
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
    <View style={[styles.gradeSection, isExpanded && { borderColor: `${gradeColor}30` }]}>
      <TouchableOpacity
        style={styles.gradeHeader}
        onPress={onToggle}
        activeOpacity={0.75}
      >
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
            <GoalsSection goals={group.goals} gradeColor={gradeColor} />
          )}

          {group.items && group.items.length > 0 && (
            <ItemsSection items={group.items} gradeColor={gradeColor} />
          )}
        </View>
      )}
    </View>
  );
}

function GoalsSection({ goals, gradeColor }: { goals: string[]; gradeColor: string }) {
  return (
    <View style={styles.goalsSection}>
      <View style={styles.sectionLabelRow}>
        <Text style={styles.sectionLabelIcon}>◎</Text>
        <Text style={styles.sectionLabelText}>목표</Text>
      </View>
      <View style={styles.goalsList}>
        {goals.map((goal) => (
          <View key={goal} style={[styles.goalItem, { borderLeftColor: gradeColor }]}>
            <View style={[styles.goalDot, { backgroundColor: gradeColor }]} />
            <Text style={styles.goalText}>{goal}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function ItemsSection({ items, gradeColor }: { items: CareerItem[]; gradeColor: string }) {
  const certifications = items.filter((i) => i.type === 'certification');
  const awards = items.filter((i) => i.type === 'award');
  const activities = items.filter((i) => i.type === 'activity');

  return (
    <View style={styles.itemsSection}>
      <View style={styles.sectionLabelRow}>
        <Text style={styles.sectionLabelIcon}>⚡</Text>
        <Text style={styles.sectionLabelText}>활동·수상·자격증</Text>
      </View>

      {certifications.length > 0 && (
        <ItemTypeGroup typeLabel="자격증" items={certifications} />
      )}
      {awards.length > 0 && (
        <ItemTypeGroup typeLabel="수상·대회" items={awards} />
      )}
      {activities.length > 0 && (
        <ItemTypeGroup typeLabel="활동" items={activities} />
      )}
    </View>
  );
}

function ItemTypeGroup({ typeLabel, items }: { typeLabel: string; items: CareerItem[] }) {
  return (
    <View style={styles.itemTypeGroup}>
      {items.map((item, index) => (
        <ActivityItemCard key={`${item.name}-${index}`} item={item} />
      ))}
    </View>
  );
}

function ActivityItemCard({ item }: { item: CareerItem }) {
  const typeConfig = ITEM_TYPE_CONFIG[item.type] ?? ITEM_TYPE_CONFIG.activity;

  return (
    <View style={[styles.activityCard, { borderLeftColor: typeConfig.color }]}>
      <View style={styles.activityCardRow}>
        <View style={[styles.activityIconBox, { backgroundColor: typeConfig.iconBg }]}>
          <Text style={styles.activityIcon}>{item.icon}</Text>
        </View>
        <View style={styles.activityCardBody}>
          <Text style={styles.activityName}>{item.name}</Text>
          <View style={styles.activityBadgeRow}>
            <View style={[styles.typeBadge, { backgroundColor: typeConfig.bg }]}>
              <Text style={[styles.typeBadgeText, { color: typeConfig.color }]}>
                {typeConfig.label}
              </Text>
            </View>
            {item.duration && (
              <Text style={styles.metaText}>📅 {item.duration}</Text>
            )}
            {item.cost && (
              <Text style={styles.metaText}>💰 {item.cost}</Text>
            )}
            {item.difficulty !== undefined && (
              <Text style={styles.difficultyText}>{DIFFICULTY_DISPLAY(item.difficulty)}</Text>
            )}
          </View>
          {item.organization && (
            <Text style={styles.activityOrg}>{item.organization}</Text>
          )}
        </View>
      </View>
    </View>
  );
}

function LegacyMilestoneRow({
  period,
  semester,
  icon,
  title,
  activities,
  awards,
  achievement,
  cost,
  isLast,
  starColor,
}: {
  period: string;
  semester: string;
  icon: string;
  title: string;
  activities: string[];
  awards?: string[];
  achievement: string;
  cost?: string;
  isLast: boolean;
  starColor: string;
}) {
  const hasAwards = awards && awards.length > 0;

  return (
    <View style={styles.legacyRow}>
      <View style={styles.legacyTimeline}>
        <View style={[styles.legacyIconCircle, { backgroundColor: `${starColor}20`, borderColor: `${starColor}40` }]}>
          <Text style={styles.legacyIcon}>{icon}</Text>
        </View>
        {!isLast && <View style={styles.legacyLine} />}
      </View>
      <View style={styles.legacyContent}>
        <View style={styles.legacyHeaderRow}>
          <View style={[styles.legacyPeriodBadge, { backgroundColor: `${starColor}18` }]}>
            <Text style={[styles.legacyPeriodText, { color: starColor }]}>{period} {semester}</Text>
          </View>
          {cost && <Text style={styles.legacyCost}>💰 {cost}</Text>}
        </View>
        <Text style={styles.legacyTitle}>{title}</Text>
        {activities.map((a) => (
          <Text key={a} style={styles.legacyActivity}>• {a}</Text>
        ))}
        {hasAwards && awards!.map((award) => (
          <Text key={award} style={styles.legacyAward}>
            {award.includes('합격') ? '✅' : '☆'} {award}
          </Text>
        ))}
        <Text style={styles.legacyAchievement}>✅ {achievement}</Text>
      </View>
    </View>
  );
}

function KeySuccessSection({
  keySuccess,
  totalCost,
}: {
  keySuccess: string[];
  totalCost: string;
}) {
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
    gap: SPACING.sm,
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
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.xs,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  headerIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconEmoji: {
    fontSize: 20,
  },
  headerTitleBlock: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '900',
    color: COLORS.white,
  },
  headerSubInfo: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  headerMetaRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  headerMetaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  headerMetaIcon: {
    fontSize: 11,
  },
  headerMetaText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },

  gradeSection: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    overflow: 'hidden',
  },
  gradeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
  },
  gradeCodeBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeCodeText: {
    fontSize: 11,
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
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  gradeChevron: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  gradeBody: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  gradeDescription: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },

  goalsSection: {
    gap: 6,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  sectionLabelIcon: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  sectionLabelText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  goalsList: {
    gap: 4,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: BORDER_RADIUS.sm,
    borderLeftWidth: 3,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
  },
  goalDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  goalText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    flex: 1,
  },

  itemsSection: {
    gap: SPACING.sm,
  },
  itemTypeGroup: {
    gap: 6,
  },

  activityCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 3,
    padding: SPACING.md,
  },
  activityCardRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  activityIconBox: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityIcon: {
    fontSize: 20,
  },
  activityCardBody: {
    flex: 1,
    gap: 3,
  },
  activityName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '800',
    color: COLORS.white,
  },
  activityBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    alignItems: 'center',
  },
  typeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  metaText: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  difficultyText: {
    fontSize: 10,
    color: '#F59E0B',
    letterSpacing: 0.5,
  },
  activityOrg: {
    fontSize: 10,
    color: COLORS.textMuted,
  },

  legacyRow: {
    flexDirection: 'row',
  },
  legacyTimeline: {
    width: 40,
    alignItems: 'center',
  },
  legacyIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  legacyIcon: {
    fontSize: 14,
  },
  legacyLine: {
    flex: 1,
    width: 1.5,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  legacyContent: {
    flex: 1,
    paddingLeft: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  legacyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: 3,
    marginTop: 4,
  },
  legacyPeriodBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  legacyPeriodText: {
    fontSize: 10,
    fontWeight: '800',
  },
  legacyCost: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  legacyTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '900',
    color: COLORS.white,
    marginBottom: 3,
  },
  legacyActivity: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
  legacyAward: {
    fontSize: FONT_SIZES.xs,
    color: '#FBBF24',
    fontWeight: '700',
  },
  legacyAchievement: {
    fontSize: FONT_SIZES.xs,
    color: '#22C55E',
    fontWeight: '600',
    marginTop: 2,
  },

  keySuccessCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    padding: SPACING.md,
  },
  keySuccessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  keySuccessIcon: {
    fontSize: 14,
  },
  keySuccessTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '900',
    color: COLORS.white,
  },
  keySuccessList: {
    gap: 6,
    marginBottom: SPACING.sm,
  },
  keySuccessItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  keySuccessCheck: {
    fontSize: 11,
  },
  keySuccessText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 17,
  },
  totalCostRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.07)',
    paddingTop: SPACING.sm,
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
