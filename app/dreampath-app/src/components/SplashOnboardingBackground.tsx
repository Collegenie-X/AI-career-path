import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../config/theme';

const PARTICLE_COLORS = ['#6C5CE7', '#a29bfe', '#3B82F6', '#22C55E', '#FBBF24'];

interface SplashOnboardingBackgroundProps {
  particleCount?: number;
  showGlowOrbs?: boolean;
}

export function SplashOnboardingBackground({
  particleCount = 20,
  showGlowOrbs = true,
}: SplashOnboardingBackgroundProps) {
  const particles = useMemo(
    () =>
      Array.from({ length: particleCount }, (_, i) => {
        const seed = (i * 137.5 + 97.3) % 100;
        return {
          id: i,
          width: (seed % 4) + 2,
          height: ((seed * 1.3) % 4) + 2,
          left: (i * 17.3) % 100,
          top: (i * 23.7) % 100,
          color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
          opacity: 0.4 + (seed % 30) / 100,
        };
      }),
    [particleCount],
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p) => (
        <View
          key={p.id}
          style={[
            styles.particle,
            {
              width: p.width,
              height: p.height,
              left: `${p.left}%`,
              top: `${p.top}%`,
              backgroundColor: p.color,
              opacity: p.opacity,
            },
          ]}
        />
      ))}
      {showGlowOrbs && (
        <>
          <View style={[styles.glowOrb, styles.glowOrbPrimary]} />
          <View style={[styles.glowOrb, styles.glowOrbSecondary]} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    borderRadius: 999,
  },
  glowOrb: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.08,
  },
  glowOrbPrimary: {
    top: 80,
    right: 32,
    width: 128,
    height: 128,
    backgroundColor: COLORS.primary,
  },
  glowOrbSecondary: {
    top: 240,
    left: 16,
    width: 96,
    height: 96,
    backgroundColor: COLORS.secondary,
  },
});
