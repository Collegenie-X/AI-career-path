import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../config/theme';
import type { StarJob } from '../../lib/types';

interface JobCardProps {
  job: StarJob;
  starColor: string;
  onPress: () => void;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <View style={styles.starRating}>
      {[...Array(5)].map((_, i) => (
        <Text key={i} style={[styles.starIcon, { color: i < rating ? COLORS.yellow : '#2D2D4E' }]}>
          ★
        </Text>
      ))}
    </View>
  );
}

export function JobCard({ job, starColor, onPress }: JobCardProps) {
  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: `${starColor}08`, borderColor: `${starColor}25` }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${starColor}20`, borderColor: `${starColor}40` }]}>
        <Text style={styles.icon}>{job.icon}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.jobName}>{job.name}</Text>
        <Text style={styles.jobDesc} numberOfLines={1}>{job.shortDesc}</Text>
        <View style={styles.metaRow}>
          <View style={[styles.hollandBadge, { backgroundColor: `${starColor}20` }]}>
            <Text style={[styles.hollandText, { color: starColor }]}>{job.holland}</Text>
          </View>
          <StarRating rating={job.futureGrowth} />
        </View>
        <Text style={styles.salary}>💰 {job.salaryRange}</Text>
      </View>

      <TouchableOpacity
        style={[styles.playButton, { backgroundColor: `${starColor}25` }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text style={[styles.playIcon, { color: starColor }]}>▶</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1.5,
    padding: SPACING.lg,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  icon: {
    fontSize: 28,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  jobName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '900',
    color: COLORS.white,
  },
  jobDesc: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: 2,
  },
  hollandBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
  },
  hollandText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '900',
  },
  salary: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  starRating: {
    flexDirection: 'row',
    gap: 1,
  },
  starIcon: {
    fontSize: 11,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    fontSize: 16,
    fontWeight: '700',
  },
});
