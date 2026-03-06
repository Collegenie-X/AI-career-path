import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../../config/theme';
import { RIASEC_META, QUIZ_RESULTS_LABELS } from '../../config/labels';

interface MainTypeRevealProps {
  topType: string;
}

export function MainTypeReveal({ topType }: MainTypeRevealProps) {
  const meta = RIASEC_META[topType] || RIASEC_META.R;

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>{QUIZ_RESULTS_LABELS.yourTypeIs}</Text>
      <View style={[styles.typeCircle, { backgroundColor: `${meta.color}20` }]}>
        <Text style={[styles.typeCode, { color: meta.color }]}>{topType}</Text>
      </View>
      <Text style={styles.typeLabel}>{meta.label}</Text>
      <Text style={styles.typeDesc}>{meta.desc} {QUIZ_RESULTS_LABELS.typeUnit}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  typeCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: SPACING.sm,
  },
  typeCode: {
    fontSize: 40,
    fontWeight: '900',
  },
  typeLabel: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '900',
    color: COLORS.white,
  },
  typeDesc: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
});
