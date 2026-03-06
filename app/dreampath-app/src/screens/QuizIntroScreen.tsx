import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../config/theme';
import { SplashOnboardingBackground } from '../components/SplashOnboardingBackground';
import { OnboardingEdgeDots } from '../components/onboarding/OnboardingEdgeDots';

import quizIntroData from '../data/quiz-intro.json';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - SPACING.xl * 2 - SPACING.md) / 2;

interface QuizIntroScreenProps {
  onStart: () => void;
  onBack: () => void;
}

export function QuizIntroScreen({ onStart, onBack }: QuizIntroScreenProps) {
  const insets = useSafeAreaInsets();

  const heroAnim = useRef(new Animated.Value(0)).current;
  const statsAnim = useRef(new Animated.Value(0)).current;
  const rewardAnim = useRef(new Animated.Value(0)).current;
  const tipsAnim = useRef(new Animated.Value(0)).current;
  const btnAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(heroAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.timing(statsAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.timing(rewardAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(tipsAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(btnAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  const makeSlide = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        }),
      },
    ],
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <SplashOnboardingBackground particleCount={30} showGlowOrbs />
      <OnboardingEdgeDots
        leftColors={['#6C5CE7', '#22C55E', '#3B82F6']}
        rightColors={['#EF4444', '#FBBF24', '#EC4899']}
      />

      {/* 뒤로가기 */}
      <TouchableOpacity
        style={[styles.backBtn, { top: insets.top + 10 }]}
        onPress={onBack}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Text style={styles.backBtnText}>‹</Text>
      </TouchableOpacity>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 히어로 */}
        <Animated.View style={[styles.heroSection, makeSlide(heroAnim)]}>
          <View style={styles.heroBrainContainer}>
            <LinearGradient
              colors={['#6C5CE7', '#a29bfe'] as [string, string]}
              style={styles.heroBrainGradient}
            >
              <Text style={styles.heroBrainEmoji}>🧠</Text>
            </LinearGradient>
          </View>
          <Text style={styles.heroTitle}>{quizIntroData.title}</Text>
          <Text style={styles.heroSubtitle}>{quizIntroData.subtitle}</Text>
        </Animated.View>

        {/* 통계 그리드 */}
        <Animated.View style={[styles.statsGrid, makeSlide(statsAnim)]}>
          {quizIntroData.stats.map((stat, index) => (
            <View
              key={index}
              style={[
                styles.statCard,
                { borderColor: `${stat.color}35`, backgroundColor: `${stat.color}12` },
              ]}
            >
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={[styles.statLabel, { color: stat.color }]}>{stat.label}</Text>
              <Text style={styles.statDesc}>{stat.description}</Text>
            </View>
          ))}
        </Animated.View>

        {/* 보상 카드 */}
        <Animated.View style={makeSlide(rewardAnim)}>
          <View style={styles.rewardCard}>
            <View style={styles.rewardLeft}>
              <View style={styles.rewardIconCircle}>
                <Text style={styles.rewardIcon}>{quizIntroData.reward.emoji}</Text>
              </View>
              <View>
                <Text style={styles.rewardTitle}>{quizIntroData.reward.title}</Text>
                <Text style={styles.rewardDesc}>{quizIntroData.reward.description}</Text>
              </View>
            </View>
            <View style={styles.rewardBadge}>
              <Text style={styles.rewardBadgeText}>{quizIntroData.reward.badge}</Text>
            </View>
          </View>
        </Animated.View>

        {/* 팁 */}
        <Animated.View style={makeSlide(tipsAnim)}>
          <Text style={styles.tipsLabel}>{quizIntroData.tipsTitle}</Text>
          {quizIntroData.tips.map((tip, index) => (
            <View key={index} style={styles.tipRow}>
              <Text style={styles.tipIcon}>{tip.icon}</Text>
              <Text style={styles.tipText}>{tip.text}</Text>
            </View>
          ))}
        </Animated.View>
      </ScrollView>

      {/* 하단 고정 버튼 */}
      <Animated.View
        style={[
          styles.footer,
          { paddingBottom: insets.bottom + SPACING.lg },
          makeSlide(btnAnim),
        ]}
      >
        <TouchableOpacity
          style={styles.startBtn}
          onPress={onStart}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#6C5CE7', '#a29bfe'] as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.startBtnGradient}
          >
            <Text style={styles.startBtnText}>{quizIntroData.ctaButton}</Text>
            <Text style={styles.startBtnIcon}> ⚡</Text>
          </LinearGradient>
        </TouchableOpacity>
        <Text style={styles.ctaNote}>{quizIntroData.ctaNote}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E0E1C',
  },
  backBtn: {
    position: 'absolute',
    left: SPACING.lg,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    fontSize: 26,
    color: COLORS.white,
    lineHeight: 30,
    fontWeight: '300',
    marginTop: -2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxxl + SPACING.xl,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  heroBrainContainer: {
    marginBottom: SPACING.lg,
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 12,
  },
  heroBrainGradient: {
    width: 88,
    height: 88,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBrainEmoji: {
    fontSize: 44,
  },
  heroTitle: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '900',
    color: COLORS.white,
    marginBottom: SPACING.xs,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  statCard: {
    width: CARD_WIDTH,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statIcon: {
    fontSize: 28,
  },
  statLabel: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '900',
  },
  statDesc: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  rewardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  rewardIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${COLORS.yellow}25`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardIcon: {
    fontSize: 22,
  },
  rewardTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 2,
  },
  rewardDesc: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  rewardBadge: {
    backgroundColor: `${COLORS.yellow}30`,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: `${COLORS.yellow}50`,
  },
  rewardBadgeText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '900',
    color: COLORS.yellow,
  },
  tipsLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: SPACING.md,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  tipIcon: {
    fontSize: 18,
  },
  tipText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    backgroundColor: 'rgba(26,26,46,0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  startBtn: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 8,
    marginBottom: SPACING.sm,
  },
  startBtnGradient: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtnText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '900',
    color: COLORS.white,
  },
  startBtnIcon: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.white,
  },
  ctaNote: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
