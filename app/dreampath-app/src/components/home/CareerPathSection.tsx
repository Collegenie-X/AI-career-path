import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../config/theme';
import { HOME_LABELS } from '../../config/labels';
import type { CareerPlan } from '../../config/career-path';

interface CareerPathSectionProps {
  savedPlans: CareerPlan[];
  onNavigate: () => void;
}

const PROCESS_FLOW_ICONS = ['🎯', '📚', '🏆', '🚀'] as const;

// 각 아이콘마다 다른 float 주기와 진폭으로 자연스러운 둥둥 효과
const FLOAT_CONFIG = [
  { duration: 1800, amplitude: 6, delay: 0 },
  { duration: 2200, amplitude: 8, delay: 300 },
  { duration: 1600, amplitude: 5, delay: 150 },
  { duration: 2000, amplitude: 7, delay: 450 },
] as const;

function FloatingIcon({
  icon,
  enterAnim,
  index,
}: {
  icon: string;
  enterAnim: Animated.Value;
  index: number;
}) {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const cfg = FLOAT_CONFIG[index];

  useEffect(() => {
    const startFloat = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: 1,
            duration: cfg.duration,
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: cfg.duration,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: cfg.duration * 1.5,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: -1,
            duration: cfg.duration * 1.5,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: cfg.duration * 0.5,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    const timeout = setTimeout(startFloat, cfg.delay);
    return () => clearTimeout(timeout);
  }, []);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -cfg.amplitude],
  });

  const rotate = rotateAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-4deg', '0deg', '4deg'],
  });

  const enterScale = enterAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1],
  });

  const enterTranslateY = enterAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [14, 0],
  });

  return (
    <Animated.View
      style={[
        styles.processFlowIcon,
        {
          opacity: enterAnim,
          transform: [
            { scale: enterScale },
            { translateY: Animated.add(enterTranslateY, translateY) },
            { rotate },
          ],
        },
      ]}
    >
      <Text style={styles.processFlowEmoji}>{icon}</Text>
    </Animated.View>
  );
}

function EmptyCareerPath({ onNavigate }: { onNavigate: () => void }) {
  const cardFadeAnim = useRef(new Animated.Value(0)).current;
  const cardSlideAnim = useRef(new Animated.Value(16)).current;
  const iconEnterAnims = useRef(PROCESS_FLOW_ICONS.map(() => new Animated.Value(0))).current;
  const dotAnims = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;
  const ctaBounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardFadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(cardSlideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(() => {
      Animated.stagger(
        120,
        iconEnterAnims.map((anim) =>
          Animated.spring(anim, { toValue: 1, tension: 80, friction: 8, useNativeDriver: true })
        )
      ).start(() => {
        Animated.stagger(
          100,
          dotAnims.map((anim) =>
            Animated.loop(
              Animated.sequence([
                Animated.timing(anim, { toValue: 1, duration: 500, useNativeDriver: true }),
                Animated.timing(anim, { toValue: 0.3, duration: 500, useNativeDriver: true }),
              ])
            )
          )
        ).start();
      });
    });

    Animated.loop(
      Animated.sequence([
        Animated.timing(ctaBounceAnim, { toValue: 1.02, duration: 1000, useNativeDriver: true }),
        Animated.timing(ctaBounceAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.emptyCard,
        { opacity: cardFadeAnim, transform: [{ translateY: cardSlideAnim }] },
      ]}
    >
      <View style={styles.processFlow}>
        {PROCESS_FLOW_ICONS.map((icon, i) => (
          <View key={i} style={styles.processFlowItem}>
            <FloatingIcon icon={icon} enterAnim={iconEnterAnims[i]} index={i} />
            {i < PROCESS_FLOW_ICONS.length - 1 && (
              <View style={styles.processFlowDots}>
                {dotAnims.map((dotAnim, j) => (
                  <Animated.View
                    key={j}
                    style={[styles.processFlowDot, { opacity: dotAnim }]}
                  />
                ))}
              </View>
            )}
          </View>
        ))}
      </View>

      <Text style={styles.emptyTitle}>{HOME_LABELS.careerPathEmpty.title}</Text>
      <Text style={styles.emptyDescription}>{HOME_LABELS.careerPathEmpty.description}</Text>

      <Animated.View style={{ transform: [{ scale: ctaBounceAnim }] }}>
        <TouchableOpacity style={styles.ctaButton} onPress={onNavigate} activeOpacity={0.8}>
          <LinearGradient
            colors={['#6C5CE7', '#A855F7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaGradient}
          >
            <Text style={styles.ctaText}>
              🚀 {HOME_LABELS.careerPathEmpty.cta} ›
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

function PlanPreview({ savedPlans, onNavigate }: CareerPathSectionProps) {
  const preview = savedPlans.slice(0, 2);
  const cardFadeAnim = useRef(new Animated.Value(0)).current;
  const cardSlideAnim = useRef(new Animated.Value(16)).current;
  const planItemAnims = useRef(preview.map(() => new Animated.Value(0))).current;

  const totalItems = savedPlans.reduce((s, p) => s + p.years.reduce((sy, y) => sy + y.items.length, 0), 0);
  const totalYears = savedPlans.reduce((s, p) => s + p.years.length, 0);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(cardFadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.timing(cardSlideAnim, { toValue: 0, duration: 350, useNativeDriver: true }),
    ]).start(() => {
      Animated.stagger(
        100,
        planItemAnims.map((anim) =>
          Animated.spring(anim, { toValue: 1, tension: 70, friction: 10, useNativeDriver: true })
        )
      ).start();
    });
  }, []);

  return (
    <Animated.View
      style={[
        styles.previewCard,
        { opacity: cardFadeAnim, transform: [{ translateY: cardSlideAnim }] },
      ]}
    >
      <View style={styles.statsRow}>
        {[
          { emoji: '📋', value: savedPlans.length.toString(), label: '패스', color: '#6C5CE7' },
          { emoji: '📅', value: totalYears.toString(), label: '학년', color: '#3B82F6' },
          { emoji: '🎯', value: totalItems.toString(), label: '항목', color: '#22C55E' },
        ].map((stat, idx) => (
          <View
            key={idx}
            style={[styles.statItem, { backgroundColor: `${stat.color}15`, borderColor: `${stat.color}30` }]}
          >
            <Text style={styles.statEmoji}>{stat.emoji}</Text>
            <Text style={[styles.statCount, { color: stat.color }]}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.planList}>
        {preview.map((plan, idx) => (
          <Animated.View
            key={plan.id}
            style={{
              opacity: planItemAnims[idx],
              transform: [
                {
                  translateX: planItemAnims[idx].interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            }}
          >
            <View style={styles.planItem}>
              <Text style={styles.planEmoji}>{plan.starEmoji}</Text>
              <View style={styles.planInfo}>
                <Text style={styles.planTitle} numberOfLines={1}>{plan.title}</Text>
                <Text style={styles.planMeta}>{plan.jobEmoji} {plan.jobName} · {plan.starName}</Text>
              </View>
              <View style={[styles.planMonthBadge, { backgroundColor: `${plan.starColor}20` }]}>
                <Text style={[styles.planMonthText, { color: plan.starColor }]}>
                  {plan.years.length}학년
                </Text>
              </View>
            </View>
          </Animated.View>
        ))}
      </View>

      <TouchableOpacity style={styles.viewAllButton} onPress={onNavigate} activeOpacity={0.8}>
        <LinearGradient
          colors={['#6C5CE7', '#A855F7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.viewAllGradient}
        >
          <Text style={styles.viewAllText}>
            🗺️ {HOME_LABELS.careerPathViewAll} ›
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

export function CareerPathSection({ savedPlans, onNavigate }: CareerPathSectionProps) {
  const hasPlans = savedPlans.length > 0;
  const headerFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerFadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.header, { opacity: headerFadeAnim }]}>
        <View style={styles.headerLeft}>
          <LinearGradient
            colors={['#6C5CE7', '#A855F7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerIcon}
          >
            <Text style={styles.headerIconText}>🚀</Text>
          </LinearGradient>
          <Text style={styles.headerTitle}>{HOME_LABELS.careerPath}</Text>
          {hasPlans && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{savedPlans.length}개</Text>
            </View>
          )}
        </View>
        {hasPlans && (
          <TouchableOpacity onPress={onNavigate} activeOpacity={0.7}>
            <Text style={styles.viewAllLink}>{HOME_LABELS.viewAll} ›</Text>
          </TouchableOpacity>
        )}
      </Animated.View>

      {hasPlans ? (
        <PlanPreview savedPlans={savedPlans} onNavigate={onNavigate} />
      ) : (
        <EmptyCareerPath onNavigate={onNavigate} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerIcon: {
    width: 28,
    height: 28,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconText: {
    fontSize: 14,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '900',
    color: COLORS.white,
  },
  countBadge: {
    backgroundColor: 'rgba(108,92,231,0.3)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  countBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: '#a78bfa',
  },
  viewAllLink: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: '#a78bfa',
  },
  emptyCard: {
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.xl,
    backgroundColor: 'rgba(108,92,231,0.2)',
    borderWidth: 1.5,
    borderColor: 'rgba(108,92,231,0.5)',
    overflow: 'hidden',
  },
  processFlow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  processFlowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  processFlowIcon: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  processFlowEmoji: {
    fontSize: 20,
  },
  processFlowDots: {
    flexDirection: 'row',
    gap: 2,
  },
  processFlowDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(168,85,247,0.8)',
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '900',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  emptyDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  ctaButton: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  ctaGradient: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '900',
    color: COLORS.white,
  },
  previewCard: {
    borderRadius: BORDER_RADIUS.xxl,
    backgroundColor: 'rgba(108,92,231,0.2)',
    borderWidth: 1.5,
    borderColor: 'rgba(108,92,231,0.45)',
    overflow: 'hidden',
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  statItem: {
    flex: 1,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    alignItems: 'center',
    borderWidth: 1,
  },
  statEmoji: {
    fontSize: 18,
    marginBottom: 2,
  },
  statCount: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  planList: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    gap: SPACING.sm,
  },
  planItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  planEmoji: {
    fontSize: 20,
  },
  planInfo: {
    flex: 1,
  },
  planTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.white,
  },
  planMeta: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  planMonthBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  planMonthText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
  },
  viewAllButton: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  viewAllGradient: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAllText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.white,
  },
});
