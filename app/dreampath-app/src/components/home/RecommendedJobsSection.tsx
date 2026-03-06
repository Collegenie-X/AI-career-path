import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../config/theme';
import { HOME_LABELS } from '../../config/labels';
import type { RIASECResult, StarJob, StarData } from '../../lib/types';
import { ALL_STARS } from '../../data/stars';

const RANK_COLORS = ['#FBBF24', '#9CA3AF', '#CD7C2F'];

interface RecommendedJobsSectionProps {
  riasec: RIASECResult | null;
  onJobClick: (starId: string, jobId?: string) => void;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <View style={styles.starRating}>
      {[...Array(5)].map((_, i) => (
        <Text
          key={i}
          style={[styles.starIcon, { color: i < rating ? COLORS.yellow : '#2D2D4E' }]}
        >
          ★
        </Text>
      ))}
    </View>
  );
}

export function RecommendedJobsSection({ riasec, onJobClick }: RecommendedJobsSectionProps) {
  const recommended = useMemo(() => {
    const allJobs: { job: StarJob; star: StarData }[] = [];
    ALL_STARS.forEach((star) => {
      star.jobs.forEach((job: StarJob) => allJobs.push({ job, star }));
    });

    if (!riasec) return allJobs.slice(0, 3);

    const topTypes = riasec.topTypes;
    const scored = allJobs.map(({ job, star }) => {
      let score = 0;
      job.holland.split('+').forEach((t) => {
        if (topTypes.includes(t as 'R' | 'I' | 'A' | 'S' | 'E' | 'C')) score += 2;
      });
      score += job.futureGrowth;
      return { job, star, score };
    });
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 3).map(({ job, star }) => ({ job, star }));
  }, [riasec]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerIcon}>🎯</Text>
          <Text style={styles.headerTitle}>
            {riasec ? HOME_LABELS.recommendedJobs : HOME_LABELS.recommendedJobsDefault}
          </Text>
        </View>
        <TouchableOpacity onPress={() => onJobClick('')} activeOpacity={0.7}>
          <Text style={styles.viewAllLink}>{HOME_LABELS.viewAll} ›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.jobList}>
        {recommended.map(({ job, star }, index) => (
          <TouchableOpacity
            key={`${star.id}-${job.id}`}
            style={[
              styles.jobCard,
              { backgroundColor: `${star.color}12`, borderColor: `${star.color}30` },
            ]}
            onPress={() => onJobClick(star.id, job.id)}
            activeOpacity={0.8}
          >
            <View style={[styles.jobIcon, { backgroundColor: `${star.color}30`, borderColor: `${star.color}50` }]}>
              <Text style={styles.jobEmoji}>{job.icon}</Text>
              <View style={[styles.jobRank, { backgroundColor: RANK_COLORS[index] }]}>
                <Text style={styles.jobRankText}>{index + 1}</Text>
              </View>
            </View>
            <View style={styles.jobInfo}>
              <Text style={styles.jobName}>{job.name}</Text>
              <Text style={styles.jobDesc} numberOfLines={1}>{job.shortDesc}</Text>
              <View style={styles.jobMeta}>
                <View style={[styles.starBadge, { backgroundColor: `${star.color}22` }]}>
                  <Text style={[styles.starBadgeText, { color: star.color }]}>
                    {star.emoji} {star.name}
                  </Text>
                </View>
                <StarRating rating={job.futureGrowth} />
              </View>
            </View>
            <View style={[styles.chevron, { backgroundColor: `${star.color}25` }]}>
              <Text style={[styles.chevronText, { color: star.color }]}>›</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerIcon: {
    fontSize: 16,
  },
  headerTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '900',
    color: COLORS.white,
  },
  viewAllLink: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: '#a78bfa',
  },
  jobList: {
    gap: SPACING.sm,
  },
  jobCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    padding: 14,
    borderWidth: 1,
  },
  jobIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    position: 'relative',
  },
  jobEmoji: {
    fontSize: 24,
  },
  jobRank: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  jobRankText: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.white,
  },
  jobInfo: {
    flex: 1,
  },
  jobName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '900',
    color: COLORS.white,
    marginBottom: 2,
  },
  jobDesc: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  jobMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  starBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  starBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
  },
  starRating: {
    flexDirection: 'row',
    gap: 1,
  },
  starIcon: {
    fontSize: 10,
  },
  chevron: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronText: {
    fontSize: 18,
    fontWeight: '700',
  },
});
