import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../config/theme';
import { QUIZ_RESULTS_LABELS } from '../../config/labels';

export function XpRewardBanner() {
  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>✨</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{QUIZ_RESULTS_LABELS.xpRewardTitle}</Text>
        <Text style={styles.subtitle}>{QUIZ_RESULTS_LABELS.xpRewardSubtitle}</Text>
      </View>
      <Text style={styles.xpAmount}>{QUIZ_RESULTS_LABELS.xpRewardAmount}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    backgroundColor: 'rgba(108,92,231,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(108,92,231,0.25)',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(108,92,231,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '800',
    color: COLORS.white,
  },
  subtitle: {
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 2,
  },
  xpAmount: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '900',
    color: COLORS.primary,
  },
});
