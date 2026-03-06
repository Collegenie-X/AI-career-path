import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../config/theme';
import { JOBS_EXPLORE_LABELS } from '../../config/labels';
import type { StarData } from '../../lib/types';

interface StarCardProps {
  star: StarData;
  onPress: () => void;
}

export function StarCard({ star, onPress }: StarCardProps) {
  const jobCount = star.jobCount ?? star.jobs.length;

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: `${star.color}12`, borderColor: `${star.color}35` }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={[styles.jobCountBadge, { backgroundColor: `${star.color}30` }]}>
          <Text style={[styles.jobCountIcon, { color: star.color }]}>★</Text>
          <Text style={[styles.jobCountText, { color: star.color }]}>
            {jobCount}{JOBS_EXPLORE_LABELS.jobCountSuffix}
          </Text>
        </View>
        <View style={[styles.chevronCircle, { backgroundColor: `${star.color}25` }]}>
          <Text style={[styles.chevronText, { color: star.color }]}>›</Text>
        </View>
      </View>

      <View style={styles.emojiContainer}>
        <View style={[styles.emojiCircle, { backgroundColor: `${star.color}15` }]}>
          <Text style={styles.emoji}>{star.emoji}</Text>
        </View>
      </View>

      <Text style={styles.starName} numberOfLines={1}>{star.name}</Text>
      <Text style={styles.starDescription} numberOfLines={2}>{star.description}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1.5,
    padding: SPACING.md,
    minHeight: 168,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  jobCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  jobCountIcon: {
    fontSize: 11,
    fontWeight: '700',
  },
  jobCountText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '900',
  },
  chevronCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronText: {
    fontSize: 16,
    fontWeight: '700',
  },
  emojiContainer: {
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  emojiCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 28,
  },
  starName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '900',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 3,
  },
  starDescription: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
});
