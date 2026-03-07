import React, { useMemo, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../config/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SplashOnboardingBackgroundProps {
  particleCount?: number;
  showGlowOrbs?: boolean;
}

export function SplashOnboardingBackground({
  particleCount = 40,
  showGlowOrbs = true,
}: SplashOnboardingBackgroundProps) {
  const stars = useMemo(
    () =>
      Array.from({ length: particleCount }, (_, i) => {
        const seed = (i * 137.5 + 97.3) % 100;
        const size = (seed % 3) + 1;
        return {
          id: i,
          left: ((i * 17.3 + 11) % 98),
          top: ((i * 23.7 + 7) % 98),
          size,
          opacity: 0.15 + (seed % 25) / 100,
          twinkleDelay: (i % 5) * 500,
        };
      }),
    [particleCount],
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* 베이스 - 어두운 우주 그라데이션 */}
      <LinearGradient
        colors={['#030712', '#0a0a1a', '#050510', '#020408'] as [string, string, ...string[]]}
        locations={[0, 0.3, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* 부드러운 별 - 자연스러운 그라디언트 느낌 */}
      {stars.map((s) => (
        <StarDot key={s.id} {...s} />
      ))}

      {/* 글로우 - 하단만 (상단 밝은 효과 제거) */}
      {showGlowOrbs && (
        <LinearGradient
          colors={[`${COLORS.secondary}08`, `${COLORS.secondary}02`, 'transparent'] as [string, string, ...string[]]}
          locations={[0, 0.5, 1]}
          style={[styles.glowOrb, styles.glowOrbBottom]}
        />
      )}
    </View>
  );
}

function StarDot({
  left,
  top,
  size,
  opacity,
  twinkleDelay,
}: {
  left: number;
  top: number;
  size: number;
  opacity: number;
  twinkleDelay: number;
}) {
  const anim = useRef(new Animated.Value(opacity)).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      const a = Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: Math.min(0.5, opacity * 1.5),
            duration: 2500 + twinkleDelay,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: opacity * 0.6,
            duration: 2500 + twinkleDelay,
            useNativeDriver: true,
          }),
        ]),
      );
      a.start();
      return () => a.stop();
    }, twinkleDelay);
    return () => clearTimeout(timeout);
  }, [anim, opacity, twinkleDelay]);

  return (
    <Animated.View
      style={[
        styles.star,
        {
          left: `${left}%`,
          top: `${top}%`,
          width: size,
          height: size,
          backgroundColor: 'rgba(255,255,255,0.9)',
          opacity: anim,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  star: {
    position: 'absolute',
    borderRadius: 999,
  },
  glowOrb: {
    position: 'absolute',
    borderRadius: 999,
  },
  glowOrbBottom: {
    bottom: 0,
    left: '50%',
    marginLeft: -100,
    width: 200,
    height: 180,
  },
});
