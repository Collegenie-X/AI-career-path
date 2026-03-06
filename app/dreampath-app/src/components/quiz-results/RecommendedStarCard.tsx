import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../config/theme';
import { QUIZ_RESULTS_LABELS } from '../../config/labels';
import type { StarData } from '../../lib/types';

interface RecommendedStarCardProps {
  star: StarData;
}

export function RecommendedStarCard({ star }: RecommendedStarCardProps) {
  return (
    <View style={[styles.card, { borderColor: `${star.color}30` }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.headerIcon, { color: star.color }]}>☆</Text>
        <Text style={[styles.headerText, { color: star.color }]}>
          {QUIZ_RESULTS_LABELS.recommendedStar}
        </Text>
      </View>
      <View style={styles.contentRow}>
        <View style={[styles.starIcon, { backgroundColor: star.color }]}>
          <Text style={styles.starEmoji}>{star.emoji}</Text>
        </View>
        <View style={styles.starInfo}>
          <Text style={styles.starName}>{star.name}</Text>
          <Text style={styles.starDescription}>{star.description}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    padding: SPACING.xl,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  headerIcon: {
    fontSize: 16,
  },
  headerText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '800',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  starIcon: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  starEmoji: {
    fontSize: 28,
  },
  starInfo: {
    flex: 1,
  },
  starName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.white,
  },
  starDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 20,
  },
});
