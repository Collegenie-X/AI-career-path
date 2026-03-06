import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../config/theme';
import { JOBS_EXPLORE_LABELS } from '../../config/labels';

export function IntroBanner() {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Text style={styles.icon}>📖</Text>
      </View>
      <Text style={styles.title}>{JOBS_EXPLORE_LABELS.introBannerDescription}</Text>
      <Text style={styles.subtitle}>{JOBS_EXPLORE_LABELS.introBannerSubDescription}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.lg,
    backgroundColor: 'rgba(108,92,231,0.12)',
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(108,92,231,0.30)',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(108,92,231,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  icon: {
    fontSize: 22,
  },
  title: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '900',
    color: COLORS.white,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    lineHeight: 18,
    textAlign: 'center',
  },
});
