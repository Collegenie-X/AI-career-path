import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FONT_SIZES, SPACING, BORDER_RADIUS } from '../../config/theme';
import { QUIZ_RESULTS_LABELS } from '../../config/labels';

interface ResultsHeaderBadgeProps {
  color: string;
}

export function ResultsHeaderBadge({ color }: ResultsHeaderBadgeProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.badge, { backgroundColor: `${color}20`, borderColor: `${color}30` }]}>
        <Text style={styles.badgeIcon}>☆</Text>
        <Text style={[styles.badgeText, { color }]}>{QUIZ_RESULTS_LABELS.headerBadge}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
  },
  badgeIcon: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  badgeText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '800',
  },
});
