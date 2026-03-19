import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../config/theme';
import { QUIZ_RESULTS_LABELS } from '../../config/labels';
import type { RecommendedJob } from '../../lib/recommendations';

interface RecommendedJobsCardProps {
  jobs: RecommendedJob[];
  topTypeColor: string;
}

const RANK_COLORS = ['#FBBF24', '#9CA3AF', '#CD7C2F', '#6B7280', '#4B5563'];

export function RecommendedJobsCard({ jobs, topTypeColor }: RecommendedJobsCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.headerIcon}>☆</Text>
        <Text style={styles.headerText}>{QUIZ_RESULTS_LABELS.recommendedJobsTitle}</Text>
      </View>
      {jobs.map((item, index) => (
        <RecommendedJobRow
          key={item.job.id}
          item={item}
          index={index}
          topTypeColor={topTypeColor}
        />
      ))}
    </View>
  );
}

interface RecommendedJobRowProps {
  item: RecommendedJob;
  index: number;
  topTypeColor: string;
}

function RecommendedJobRow({ item, index, topTypeColor }: RecommendedJobRowProps) {
  const { job, starName, starColor, score } = item;
  const isFirst = index === 0;
  const rankColor = RANK_COLORS[index] ?? RANK_COLORS[4];

  return (
    <View
      style={[
        styles.jobRow,
        isFirst && {
          borderColor: `${topTypeColor}30`,
          backgroundColor: `${topTypeColor}08`,
        },
      ]}
    >
      {/* 큰 아이콘 + 상단 오른쪽 순위 뱃지 */}
      <View style={styles.iconWrapper}>
        <View
          style={[
            styles.iconBox,
            {
              backgroundColor: `${starColor}25`,
              borderColor: `${starColor}50`,
            },
          ]}
        >
          <Text style={styles.iconEmoji}>{job.icon}</Text>
        </View>
        <View style={[styles.rankBadge, { backgroundColor: rankColor }]}>
          <Text style={styles.rankText}>{index + 1}</Text>
        </View>
      </View>
      <View style={styles.jobInfo}>
        <Text style={styles.jobName}>{job.name}</Text>
        <Text style={[styles.jobStar, { color: starColor }]}>{starName}</Text>
        {job.shortDesc ? (
          <Text style={styles.jobDesc} numberOfLines={2}>
            {job.shortDesc}
          </Text>
        ) : null}
      </View>
      <Text style={[styles.scoreText, { color: COLORS.textSecondary }]}>{score}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: SPACING.xl,
    gap: SPACING.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  headerIcon: {
    fontSize: 16,
    color: COLORS.yellow,
  },
  headerText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  jobRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  iconWrapper: {
    position: 'relative',
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.xl,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  iconEmoji: {
    fontSize: 28,
  },
  rankBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  rankText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.white,
  },
  jobInfo: {
    flex: 1,
    minWidth: 0,
  },
  jobName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    color: COLORS.white,
  },
  jobStar: {
    fontSize: FONT_SIZES.xs,
    marginTop: 2,
  },
  jobDesc: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 4,
    lineHeight: 16,
  },
  scoreText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
  },
});
