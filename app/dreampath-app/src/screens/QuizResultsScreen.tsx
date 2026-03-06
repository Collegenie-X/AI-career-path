import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../config/theme';
import { RIASEC_META, QUIZ_RESULTS_LABELS } from '../config/labels';
import { SplashOnboardingBackground } from '../components/SplashOnboardingBackground';
import { storage } from '../lib/storage';
import { getRecommendedJobsFromStars, getMatchingStarForType } from '../lib/recommendations';
import {
  AnalyzingPhase,
  ResultsHeaderBadge,
  MainTypeReveal,
  RiasecSpectrumCard,
  RecommendedStarCard,
  RecommendedJobsCard,
  XpRewardBanner,
} from '../components/quiz-results';
import type { RIASECResult, StarData } from '../lib/types';
import type { RecommendedJob } from '../lib/recommendations';

type Phase = 'analyzing' | 'reveal' | 'done';

interface QuizResultsScreenProps {
  onComplete: () => void;
  onBack?: () => void;
}

export function QuizResultsScreen({ onComplete, onBack }: QuizResultsScreenProps) {
  const insets = useSafeAreaInsets();
  const isReportMode = !!onBack;
  const [riasecResult, setRiasecResult] = useState<RIASECResult | null>(null);
  const [phase, setPhase] = useState<Phase>(isReportMode ? 'done' : 'analyzing');
  const [recommendedJobs, setRecommendedJobs] = useState<RecommendedJob[]>([]);
  const [matchingStar, setMatchingStar] = useState<StarData | undefined>();
  const fadeAnim = React.useRef(new Animated.Value(isReportMode ? 1 : 0)).current;

  useEffect(() => {
    const loadResult = async () => {
      const result = await storage.riasec.get();
      if (!result) return;

      setRiasecResult(result);

      const jobs = getRecommendedJobsFromStars(result.scores, 5);
      setRecommendedJobs(jobs);

      const star = getMatchingStarForType(result.topTypes[0]);
      setMatchingStar(star);

      if (isReportMode) return;

      setTimeout(() => setPhase('reveal'), 2200);
      setTimeout(() => {
        setPhase('done');
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      }, 2800);
    };
    loadResult();
  }, [fadeAnim, isReportMode]);

  const handleStartExploring = async () => {
    await storage.xp.add(100, '적성 검사 완료', 'quiz');
    onComplete();
  };

  if (!riasecResult || phase === 'analyzing') {
    const topType = riasecResult?.topTypes[0] || 'S';
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <AnalyzingPhase topType={topType} />
      </View>
    );
  }

  const topType = riasecResult.topTypes[0];
  const topMeta = RIASEC_META[topType] || RIASEC_META.R;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <SplashOnboardingBackground particleCount={50} showGlowOrbs />

      <View style={[styles.radialGlow, { shadowColor: topMeta.color }]} />

      {isReportMode && (
        <TouchableOpacity
          style={[styles.reportBackBtn, { top: insets.top + 10 }]}
          onPress={onBack}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.reportBackBtnText}>‹</Text>
        </TouchableOpacity>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, gap: SPACING.xxl }}>
          <ResultsHeaderBadge color={topMeta.color} />

          <MainTypeReveal topType={topType} />

          <RiasecSpectrumCard
            scores={riasecResult.scores}
            animateIn={phase === 'done'}
          />

          {matchingStar && <RecommendedStarCard star={matchingStar} />}

          <RecommendedJobsCard
            jobs={recommendedJobs}
            topTypeColor={topMeta.color}
          />

          {!isReportMode && <XpRewardBanner />}
        </Animated.View>
      </ScrollView>

      <Animated.View
        style={[
          styles.footer,
          { opacity: fadeAnim, paddingBottom: insets.bottom + SPACING.lg },
        ]}
      >
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={isReportMode ? onBack : handleStartExploring}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[topMeta.color, COLORS.primary] as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaGradient}
          >
            <Text style={styles.ctaIcon}>{isReportMode ? '🏠' : '🚀'}</Text>
            <Text style={styles.ctaText}>
              {isReportMode ? '홈으로 돌아가기' : QUIZ_RESULTS_LABELS.ctaButton}
            </Text>
            <Text style={styles.ctaArrow}>{isReportMode ? '' : '→'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  reportBackBtn: {
    position: 'absolute',
    left: SPACING.lg,
    zIndex: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportBackBtnText: {
    fontSize: 26,
    color: COLORS.white,
    lineHeight: 30,
    fontWeight: '300',
    marginTop: -2,
  },
  radialGlow: {
    position: 'absolute',
    top: -100,
    alignSelf: 'center',
    width: 500,
    height: 500,
    borderRadius: 250,
    opacity: 0.08,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 150,
    elevation: 0,
  },
  scrollView: {
    flex: 1,
    zIndex: 10,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxxl,
    paddingBottom: 100,
  },
  footer: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    zIndex: 10,
  },
  ctaButton: {
    width: '100%',
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  ctaGradient: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  ctaIcon: {
    fontSize: 18,
  },
  ctaText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.white,
  },
  ctaArrow: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.white,
  },
});
