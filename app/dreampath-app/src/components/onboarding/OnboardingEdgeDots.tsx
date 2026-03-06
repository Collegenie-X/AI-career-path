import React from 'react';
import { View, StyleSheet } from 'react-native';

interface OnboardingEdgeDotsProps {
  leftColors: string[];
  rightColors: string[];
}

export function OnboardingEdgeDots({ leftColors, rightColors }: OnboardingEdgeDotsProps) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={styles.leftColumn}>
        {leftColors.map((color, i) => (
          <View key={i} style={[styles.dot, { backgroundColor: color }]} />
        ))}
      </View>
      <View style={styles.rightColumn}>
        {rightColors.map((color, i) => (
          <View key={i} style={[styles.dot, { backgroundColor: color }]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  leftColumn: {
    position: 'absolute',
    left: 16,
    top: '35%',
    gap: 12,
    alignItems: 'center',
  },
  rightColumn: {
    position: 'absolute',
    right: 16,
    top: '35%',
    gap: 12,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.8,
  },
});
