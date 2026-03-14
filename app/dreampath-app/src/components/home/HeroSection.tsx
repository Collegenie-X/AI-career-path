import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../config/theme';
import { GREETINGS } from '../../config/labels';
import type { LevelDefinition } from '../../lib/types';

interface HeroSectionProps {
  nickname: string;
  level: LevelDefinition;
  onSettings: () => void;
}

export function HeroSection({ nickname, level, onSettings }: HeroSectionProps) {
  const greeting = GREETINGS[level.level % GREETINGS.length];

  const levelPulseAnim = useRef(new Animated.Value(1)).current;
  const levelGlowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(levelGlowAnim, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(levelGlowAnim, { toValue: 0, duration: 1400, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(levelPulseAnim, { toValue: 1.06, duration: 900, useNativeDriver: true }),
        Animated.timing(levelPulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const levelGlowOpacity = levelGlowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.75],
  });

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.profileRow}>
          <View style={styles.levelBadgeWrapper}>
            <Animated.View
              style={[
                styles.levelGlow,
                { opacity: levelGlowOpacity },
              ]}
            />
            <Animated.View style={{ transform: [{ scale: levelPulseAnim }] }}>
              <LinearGradient
                colors={['#6C5CE7', '#A855F7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.levelBadge}
              >
                <Text style={styles.levelNumber}>{level.level}</Text>
              </LinearGradient>
            </Animated.View>
          </View>
          <View>
            <Text style={styles.greeting}>{greeting}! 👋</Text>
            <Text style={styles.nickname}>{nickname}</Text>
            <View style={styles.levelRow}>
              <Text style={styles.flame}>🔥</Text>
              <Text style={styles.levelText}>Lv.{level.level} {level.name}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.settingsButton} onPress={onSettings} activeOpacity={0.7}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.xl,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  levelBadgeWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelGlow: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#6C5CE7',
  },
  levelBadge: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelNumber: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '900',
    color: COLORS.white,
  },
  greeting: {
    fontSize: FONT_SIZES.xs,
    color: '#C4B5FD',
    fontWeight: '600',
  },
  nickname: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '900',
    color: COLORS.white,
    lineHeight: 24,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  flame: {
    fontSize: 12,
  },
  levelText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.orange,
    fontWeight: '700',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.glassBg,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {
    fontSize: 18,
  },
});
