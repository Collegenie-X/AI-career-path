import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../config/theme';
import { storage } from '../lib/storage';
import { SplashOnboardingBackground } from '../components/SplashOnboardingBackground';
import { OnboardingSlideContent } from '../components/onboarding/OnboardingSlideContent';
import { OnboardingEdgeDots } from '../components/onboarding/OnboardingEdgeDots';

import splashOnboardingData from '../data/splash-onboarding.json';

type OnboardingSlideData = (typeof splashOnboardingData.onboardingSlides)[number];
const SLIDES = splashOnboardingData.onboardingSlides;
const PROFILE_SETUP = splashOnboardingData.profileSetup;
const GRADE_OPTIONS = splashOnboardingData.gradeOptions;
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
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [nickname, setNickname] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');

  const isLastSlide = currentSlideIndex === SLIDES.length - 1;
  const currentAccent = ACCENT_COLOR_MAP[SLIDES[currentSlideIndex]?.accentColor ?? 'primary'];

  const handleNextSlide = () => {
    if (isLastSlide) {
      setShowProfileSetup(true);
      return;
    }
    const nextIndex = currentSlideIndex + 1;
    flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    setCurrentSlideIndex(nextIndex);
  };

  const handleComplete = async () => {
    if (!nickname.trim() || !selectedGrade) return;

    await storage.user.set({
      id: `user_${Date.now()}`,
      nickname: nickname.trim(),
      grade: selectedGrade,
      createdAt: new Date().toISOString(),
      onboardingCompleted: false,
    });
    onComplete();
  };

  if (showProfileSetup) {
    return (
      <KeyboardAvoidingView
        style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <SplashOnboardingBackground particleCount={30} showGlowOrbs={true} />
        <View style={styles.profileSetup}>
          <Text style={styles.profileEmoji}>{PROFILE_SETUP.emoji}</Text>
          <Text style={styles.profileTitle}>{PROFILE_SETUP.title}</Text>
          <Text style={styles.profileSubtitle}>{PROFILE_SETUP.subtitle}</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>닉네임</Text>
            <TextInput
              style={styles.textInput}
              placeholder={PROFILE_SETUP.nicknamePlaceholder}
              placeholderTextColor={COLORS.textMuted}
              value={nickname}
              onChangeText={setNickname}
              maxLength={10}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{PROFILE_SETUP.gradeLabel}</Text>
            <View style={styles.gradeGrid}>
              {GRADE_OPTIONS.map((grade) => (
                <TouchableOpacity
                  key={grade}
                  style={[
                    styles.gradeChip,
                    selectedGrade === grade && styles.gradeChipActive,
                  ]}
                  onPress={() => setSelectedGrade(grade)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.gradeChipText,
                      selectedGrade === grade && styles.gradeChipTextActive,
                    ]}
                  >
                    {grade}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.startButton,
              (!nickname.trim() || !selectedGrade) && styles.startButtonDisabled,
            ]}
            onPress={handleComplete}
            disabled={!nickname.trim() || !selectedGrade}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary] as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.startButtonGradient}
            >
              <Text style={styles.startButtonText}>{PROFILE_SETUP.startButtonText}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <SplashOnboardingBackground particleCount={30} showGlowOrbs={true} />
      <OnboardingEdgeDots leftColors={EDGE_DOTS.left} rightColors={EDGE_DOTS.right} />

      <TouchableOpacity
        style={[styles.skipButton, { top: insets.top + 12 }]}
        onPress={() => setShowProfileSetup(true)}
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
    gap: SPACING.xl,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: SPACING.xs,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 32,
  },
  dotInactive: {
    width: 6,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  nextButton: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.white,
  },
  profileSetup: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileEmoji: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  profileTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '900',
    color: COLORS.white,
    marginBottom: SPACING.sm,
  },
  profileSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xxxl,
  },
  inputGroup: {
    width: '100%',
    marginBottom: SPACING.xxl,
  },
  inputLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  textInput: {
    height: 48,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: SPACING.lg,
    fontSize: FONT_SIZES.lg,
    color: COLORS.white,
  },
  gradeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  gradeChip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  gradeChipActive: {
    backgroundColor: `${COLORS.primary}30`,
    borderColor: `${COLORS.primary}80`,
  },
  gradeChipText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  gradeChipTextActive: {
    color: COLORS.primaryLight,
  },
  startButton: {
    width: '100%',
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    marginTop: SPACING.lg,
  },
  startButtonDisabled: {
    opacity: 0.5,
  },
  startButtonGradient: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.white,
  },
});
