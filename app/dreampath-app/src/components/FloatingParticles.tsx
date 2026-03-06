import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../config/theme';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
}

export function FloatingParticles({ count = 40 }: { count?: number }) {
  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: (i * 137.5) % 100,
        y: (i * 97.3) % 100,
        size: (i % 4) + 1,
        opacity: 0.25 + (i % 5) * 0.12,
      })),
    [count],
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((particle) => (
        <View
          key={particle.id}
          style={[
            styles.particle,
            {
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
              opacity: particle.opacity,
              shadowColor: COLORS.white,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: particle.size > 2 ? 0.8 : 0.4,
              shadowRadius: particle.size > 2 ? 4 : 2,
            },
          ]}
        />
      ))}
      <View style={[styles.glowOrb, styles.glowOrbPrimary]} />
      <View style={[styles.glowOrb, styles.glowOrbSecondary]} />
    </View>
  );
}

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: COLORS.white,
  },
  glowOrb: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.06,
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
