import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZES } from '../config/theme';
import { storage } from '../lib/storage';
import { SplashOnboardingBackground } from '../components/SplashOnboardingBackground';
import { OnboardingSlideContent } from '../components/onboarding/OnboardingSlideContent';
import { OnboardingEdgeDots } from '../components/onboarding/OnboardingEdgeDots';

import splashOnboardingData from '../data/splash-onboarding.json';

type OnboardingSlideData = (typeof splashOnboardingData.onboardingSlides)[number];
const SLIDES = splashOnboardingData.onboardingSlides;
const BUTTONS = splashOnboardingData.buttons;
const EDGE_DOTS = splashOnboardingData.edgeDots;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ACCENT_COLOR_MAP: Record<string, string> = {
  primary: COLORS.primary,
  blue: COLORS.blue,
  green: COLORS.green,
  yellow: COLORS.yellow,
  accent: COLORS.accent,
};

interface OnboardingScreenProps {
  onComplete: () => void;
}

function SlideItem({ item }: { item: OnboardingSlideData }) {
  return (
    <View style={[styles.slideWrapper, { width: SCREEN_WIDTH }]}>
      <OnboardingSlideContent item={item} totalSteps={SLIDES.length} />
    </View>
  );
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const isLastSlide = currentSlideIndex === SLIDES.length - 1;
  const currentAccent = ACCENT_COLOR_MAP[SLIDES[currentSlideIndex]?.accentColor ?? 'primary'];

  const handleCompleteAndGoToQuizIntro = async () => {
    await storage.user.set({
      id: `user_${Date.now()}`,
      nickname: '탐험가',
      grade: '',
      createdAt: new Date().toISOString(),
      onboardingCompleted: false,
    });
    onComplete();
  };

  const handleNextSlide = () => {
    if (isLastSlide) {
      handleCompleteAndGoToQuizIntro();
      return;
    }
    const nextIndex = currentSlideIndex + 1;
    flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    setCurrentSlideIndex(nextIndex);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <SplashOnboardingBackground particleCount={30} showGlowOrbs={true} />
      <OnboardingEdgeDots leftColors={EDGE_DOTS.left} rightColors={EDGE_DOTS.right} />

      <TouchableOpacity
        style={[styles.skipButton, { top: insets.top + 12 }]}
        onPress={handleCompleteAndGoToQuizIntro}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Text style={styles.skipButtonText}>{BUTTONS.skip}</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={({ item }) => <SlideItem item={item} />}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
      />

      <View style={styles.footer}>
        <View style={styles.dotsContainer}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentSlideIndex === index ? styles.dotActive : styles.dotInactive,
                currentSlideIndex === index && { backgroundColor: currentAccent },
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNextSlide}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[currentAccent, `${currentAccent}CC`] as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.nextButtonGradient}
          >
            <Text style={styles.nextButtonText}>
              {isLastSlide ? BUTTONS.start : BUTTONS.next}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  slideWrapper: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: 56,
    right: SPACING.xl,
    zIndex: 10,
  },
  skipButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xxxl,
    alignItems: 'center',
    gap: SPACING.lg,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
  },
  dotInactive: {
    width: 8,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  nextButton: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.white,
    textAlign: 'center',
  },
});
