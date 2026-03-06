import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../config/theme';
import type { StarJob, DailySchedule } from '../../../lib/types';
import allDailySchedules from '../../../data/daily-schedules.json';

interface DailyScheduleTabProps {
  job: StarJob;
  starColor: string;
}

const SCHEDULE_TYPE_COLORS: Record<string, string> = {
  morning: '#FBBF24',
  meeting: '#3B82F6',
  work: '#22C55E',
  lunch: '#FB923C',
  review: '#A855F7',
  evening: '#EC4899',
  rest: '#6B7280',
  exercise: '#EF4444',
  study: '#06B6D4',
};

const SCHEDULE_TYPE_LABELS: Record<string, string> = {
  morning: '아침',
  meeting: '미팅',
  work: '작업',
  lunch: '점심',
  review: '검토',
  evening: '저녁',
  rest: '휴식',
  exercise: '운동',
  study: '학습',
};

export function DailyScheduleTab({ job, starColor }: DailyScheduleTabProps) {
  const schedule: DailySchedule | undefined =
    job.dailySchedule ?? (allDailySchedules as Record<string, DailySchedule>)[job.id];

  if (!schedule) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>일과 정보가 준비 중입니다</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScheduleHeader title={schedule.title} basis={schedule.basis} starColor={starColor} />
      <View style={styles.timeline}>
        {schedule.schedule.map((item, index) => {
          const typeColor = SCHEDULE_TYPE_COLORS[item.type] ?? COLORS.textMuted;
          const typeLabel = SCHEDULE_TYPE_LABELS[item.type] ?? item.type;
          const isLast = index === schedule.schedule.length - 1;

          return (
            <TimelineItem
              key={`${item.time}-${index}`}
              time={item.time}
              icon={item.icon}
              activity={item.activity}
              detail={item.detail}
              typeColor={typeColor}
              typeLabel={typeLabel}
              isLast={isLast}
            />
          );
        })}
      </View>
    </View>
  );
}

function ScheduleHeader({
  title,
  basis,
  starColor,
}: {
  title: string;
  basis: string;
  starColor: string;
}) {
  return (
    <View style={[styles.headerCard, { borderColor: `${starColor}25` }]}>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.basisRow}>
        <Text style={styles.basisIcon}>🏢</Text>
        <Text style={styles.basisText}>{basis}</Text>
      </View>
    </View>
  );
}

function TimelineItem({
  time,
  icon,
  activity,
  detail,
  typeColor,
  typeLabel,
  isLast,
}: {
  time: string;
  icon: string;
  activity: string;
  detail?: string;
  typeColor: string;
  typeLabel: string;
  isLast: boolean;
}) {
  return (
    <View style={styles.timelineItem}>
      <View style={styles.timeColumn}>
        <Text style={styles.timeText}>{time}</Text>
      </View>

      <View style={styles.lineColumn}>
        <View style={[styles.dotOuter, { borderColor: typeColor }]}>
          <View style={[styles.dotInner, { backgroundColor: typeColor }]} />
        </View>
        {!isLast && <View style={styles.verticalLine} />}
      </View>

      <View style={[styles.contentCard, { borderColor: `${typeColor}18` }]}>
        <View style={styles.contentHeader}>
          <Text style={styles.contentIcon}>{icon}</Text>
          <Text style={styles.contentActivity}>{activity}</Text>
          <View style={[styles.typeBadge, { backgroundColor: `${typeColor}18` }]}>
            <Text style={[styles.typeBadgeText, { color: typeColor }]}>{typeLabel}</Text>
          </View>
        </View>
        {detail && <Text style={styles.contentDetail}>{detail}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.md,
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
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    padding: SPACING.md,
  },
  headerTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '900',
    color: COLORS.white,
    marginBottom: 4,
  },
  basisRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  basisIcon: {
    fontSize: 12,
  },
  basisText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  timeline: {
    gap: 0,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 64,
  },
  timeColumn: {
    width: 44,
    paddingTop: 12,
    alignItems: 'flex-end',
    paddingRight: SPACING.sm,
  },
  timeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  lineColumn: {
    width: 20,
    alignItems: 'center',
  },
  dotOuter: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A0A18',
    marginTop: 10,
    zIndex: 1,
  },
  dotInner: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  verticalLine: {
    flex: 1,
    width: 1.5,
    backgroundColor: 'rgba(255,255,255,0.07)',
    marginTop: -2,
  },
  contentCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    padding: SPACING.sm,
    marginLeft: SPACING.sm,
    marginBottom: 6,
  },
  contentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contentIcon: {
    fontSize: 13,
  },
  contentActivity: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '800',
    color: COLORS.white,
    flex: 1,
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
  contentDetail: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    lineHeight: 16,
    marginTop: 4,
  },
});
