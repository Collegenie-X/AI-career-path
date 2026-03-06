import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../config/theme';
import { QUIZ_RESULTS_LABELS } from '../../config/labels';
import type { RecommendedJob } from '../../lib/recommendations';

interface RecommendedJobsCardProps {
  jobs: RecommendedJob[];
  topTypeColor: string;
}

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
          job={item}
          index={index}
          topTypeColor={topTypeColor}
        />
      ))}
    </View>
  );
}

interface RecommendedJobRowProps {
  job: RecommendedJob;
  index: number;
  topTypeColor: string;
}

function RecommendedJobRow({ job, index, topTypeColor }: RecommendedJobRowProps) {
  const isFirst = index === 0;

  return (
    <View style={styles.jobRow}>
      <View
        style={[
          styles.rankBadge,
          {
            backgroundColor: isFirst ? `${topTypeColor}25` : 'rgba(255,255,255,0.05)',
          },
        ]}
      >
        <Text
          style={[
            styles.rankText,
            { color: isFirst ? topTypeColor : 'rgba(255,255,255,0.4)' },
          ]}
        >
          {index + 1}
        </Text>
      </View>
      <View style={styles.jobInfo}>
        <Text style={styles.jobName}>{job.job.name}</Text>
        <Text style={styles.jobStar}>{job.starName}</Text>
      </View>
      <View style={[styles.scoreBadge, { backgroundColor: `${topTypeColor}15` }]}>
        <Text style={[styles.scoreText, { color: topTypeColor }]}>{job.score}%</Text>
      </View>
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
    gap: SPACING.md,
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
    gap: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '900',
  },
  jobInfo: {
    flex: 1,
    minWidth: 0,
  },
  jobName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.white,
  },
  jobStar: {
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255,255,255,0.35)',
    marginTop: 2,
  },
  scoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  scoreText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '800',
  },
});
