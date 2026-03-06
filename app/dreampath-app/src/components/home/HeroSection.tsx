import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../config/theme';
import { GREETINGS, HOME_LABELS } from '../../config/labels';
import type { LevelDefinition } from '../../lib/types';

interface HeroSectionProps {
  nickname: string;
  level: LevelDefinition;
  progress: { current: number; max: number; percentage: number };
  currentXP: number;
  onSettings: () => void;
}

export function HeroSection({ nickname, level, progress, onSettings }: HeroSectionProps) {
  const greeting = GREETINGS[level.level % GREETINGS.length];

  const xpBarWidthAnim = useRef(new Animated.Value(0)).current;
  const xpCountAnim = useRef(new Animated.Value(0)).current;
  const levelPulseAnim = useRef(new Animated.Value(1)).current;
  const levelGlowAnim = useRef(new Animated.Value(0)).current;
  const cardSlideAnim = useRef(new Animated.Value(20)).current;
  const cardFadeAnim = useRef(new Animated.Value(0)).current;

  const displayXP = xpCountAnim.interpolate({
    inputRange: [0, progress.current],
    outputRange: [0, progress.current],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(cardFadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(cardSlideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(xpBarWidthAnim, {
          toValue: progress.percentage,
          duration: 900,
          useNativeDriver: false,
        }),
        Animated.timing(xpCountAnim, {
          toValue: progress.current,
          duration: 900,
          useNativeDriver: false,
        }),
      ]),
    ]).start(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(levelGlowAnim, { toValue: 1, duration: 1400, useNativeDriver: true }),
          Animated.timing(levelGlowAnim, { toValue: 0, duration: 1400, useNativeDriver: true }),
        ])
      ).start();
    });

    Animated.loop(
      Animated.sequence([
        Animated.timing(levelPulseAnim, { toValue: 1.06, duration: 900, useNativeDriver: true }),
        Animated.timing(levelPulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const xpBarWidth = xpBarWidthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

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

      <Animated.View
        style={[
          styles.xpCard,
          {
            opacity: cardFadeAnim,
            transform: [{ translateY: cardSlideAnim }],
          },
        ]}
      >
        <View style={styles.xpHeader}>
          <View style={styles.xpLabelRow}>
            <View style={styles.xpIconContainer}>
              <Text style={styles.xpIcon}>⚡</Text>
            </View>
            <Text style={styles.xpLabel}>{HOME_LABELS.xpTitle}</Text>
          </View>
          <View style={styles.xpNumbers}>
            <AnimatedXPCounter animatedValue={xpCountAnim} max={progress.current} />
            <Text style={styles.xpSeparator}>/</Text>
            <Text style={styles.xpMax}>{progress.max} XP</Text>
          </View>
        </View>

        <View style={styles.xpBarTrack}>
          <Animated.View style={[styles.xpBarFillWrapper, { width: xpBarWidth }]}>
            <LinearGradient
              colors={['#6C5CE7', '#A855F7', '#EC4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.xpBarFill}
            >
              <View style={styles.xpBarDot} />
            </LinearGradient>
          </Animated.View>
        </View>

        <View style={styles.xpFooter}>
          <Text style={styles.xpFooterLabel}>{HOME_LABELS.nextLevel}</Text>
          <Text style={styles.xpFooterValue}>
            {progress.max - progress.current} {HOME_LABELS.xpRemaining}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

function AnimatedXPCounter({
  animatedValue,
  max,
}: {
  animatedValue: Animated.Value;
  max: number;
}) {
  const [displayValue, setDisplayValue] = React.useState(0);

  useEffect(() => {
    const listener = animatedValue.addListener(({ value }) => {
      setDisplayValue(Math.round(value));
    });
    return () => animatedValue.removeListener(listener);
  }, [animatedValue]);

  return <Text style={styles.xpCurrent}>{displayValue}</Text>;
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
  xpCard: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    backgroundColor: 'rgba(108,92,231,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(108,92,231,0.4)',
  },
  xpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  xpLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  xpIconContainer: {
    width: 24,
    height: 24,
    borderRadius: SPACING.sm,
    backgroundColor: 'rgba(251,191,36,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  xpIcon: {
    fontSize: 14,
  },
  xpLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.white,
  },
  xpNumbers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  xpCurrent: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '900',
    color: COLORS.yellow,
  },
  xpSeparator: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textDim,
  },
  xpMax: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  xpBarTrack: {
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  xpBarFillWrapper: {
    height: '100%',
    borderRadius: 7,
    overflow: 'hidden',
  },
  xpBarFill: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    minWidth: 14,
  },
  xpBarDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.white,
    marginRight: 1,
  },
  xpFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  xpFooterLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textDim,
  },
  xpFooterValue: {
    fontSize: FONT_SIZES.xs,
    color: '#C4B5FD',
    fontWeight: '700',
  },
});
