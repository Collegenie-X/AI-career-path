import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../config/theme';
import { RIASEC_META, QUIZ_RESULTS_LABELS } from '../../config/labels';
import type { RIASECScores } from '../../lib/types';

interface RiasecSpectrumCardProps {
  scores: RIASECScores;
  animateIn: boolean;
}

export function RiasecSpectrumCard({ scores, animateIn }: RiasecSpectrumCardProps) {
  const sortedTypes = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .map(([key, value]) => ({ type: key, score: value }));

  const maxScore = Math.max(...sortedTypes.map((s) => s.score), 1);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.headerIcon}>⊙</Text>
        <Text style={styles.headerText}>{QUIZ_RESULTS_LABELS.riasecSpectrum}</Text>
      </View>
      {sortedTypes.map((item, index) => (
        <RiasecScoreRow
          key={item.type}
          type={item.type}
          rawScore={item.score}
          maxScore={maxScore}
          isTop={index === 0}
          index={index}
          animateIn={animateIn}
        />
      ))}
    </View>
  );
}

interface RiasecScoreRowProps {
  type: string;
  rawScore: number;
  maxScore: number;
  isTop: boolean;
  index: number;
  animateIn: boolean;
}

function RiasecScoreRow({ type, rawScore, maxScore, isTop, index, animateIn }: RiasecScoreRowProps) {
  const meta = RIASEC_META[type] || RIASEC_META.R;
  const percentage = maxScore > 0 ? Math.round((rawScore / maxScore) * 100) : 0;
  const displayScore = `${rawScore * 100}%`;
  const barWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animateIn) {
      Animated.timing(barWidth, {
        toValue: percentage,
        duration: 1000,
        delay: index * 150,
        useNativeDriver: false,
      }).start();
    }
  }, [animateIn, percentage, index, barWidth]);

  const animatedWidth = barWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.scoreRow}>
      <View style={styles.scoreHeader}>
        <View style={styles.scoreLeft}>
          <View style={[styles.typeBadge, { backgroundColor: meta.color }]}>
            <Text style={styles.typeBadgeText}>{type}</Text>
          </View>
          <Text style={styles.typeLabel}>{meta.label}</Text>
          {isTop && (
            <View style={[styles.topTag, { backgroundColor: `${meta.color}25` }]}>
              <Text style={[styles.topTagText, { color: meta.color }]}>
                {QUIZ_RESULTS_LABELS.topBadge}
              </Text>
            </View>
          )}
        </View>
        <Text style={[styles.scoreValue, isTop && { color: meta.color }]}>
          {displayScore}
        </Text>
      </View>
      <View style={styles.barContainer}>
        <Animated.View
          style={[
            styles.barFill,
            {
              width: animatedWidth,
              backgroundColor: isTop ? meta.color : `${meta.color}80`,
            },
            isTop && { shadowColor: meta.color, shadowOpacity: 0.5, shadowRadius: 6, elevation: 3 },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  headerIcon: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  headerText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  scoreRow: {
    gap: 6,
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scoreLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  typeBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '900',
    color: COLORS.white,
  },
  typeLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  topTag: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  topTagText: {
    fontSize: 10,
    fontWeight: '800',
  },
  scoreValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
  },
  barContainer: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
});
