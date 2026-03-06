import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../../config/theme';
import { RIASEC_META, QUIZ_RESULTS_LABELS } from '../../config/labels';
import { SplashOnboardingBackground } from '../SplashOnboardingBackground';

interface AnalyzingPhaseProps {
  topType: string;
}

export function AnalyzingPhase({ topType }: AnalyzingPhaseProps) {
  const meta = RIASEC_META[topType] || RIASEC_META.R;
  const pulseAnim = React.useRef(new Animated.Value(0.4)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <View style={styles.container}>
      <SplashOnboardingBackground particleCount={40} showGlowOrbs />
      <View style={styles.centerContent}>
        <View style={[styles.orbOuter, { shadowColor: meta.color }]}>
          <View style={[styles.orbInner, { backgroundColor: `${meta.color}30` }]}>
            <Animated.Text style={[styles.orbIcon, { opacity: pulseAnim }]}>🔮</Animated.Text>
          </View>
        </View>
        <Animated.Text style={[styles.analyzingText, { opacity: pulseAnim }]}>
          {QUIZ_RESULTS_LABELS.analyzingText}
        </Animated.Text>
        <View style={styles.dotsRow}>
          {[0, 1, 2, 3, 4].map((i) => (
            <View key={i} style={[styles.dot, { backgroundColor: meta.color }]} />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    alignItems: 'center',
    zIndex: 10,
  },
  orbOuter: {
    width: 128,
    height: 128,
    borderRadius: 64,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 10,
  },
  orbInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orbIcon: {
    fontSize: 48,
  },
  analyzingText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: SPACING.xxl,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: SPACING.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
