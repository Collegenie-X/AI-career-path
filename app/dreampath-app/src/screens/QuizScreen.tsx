import React, { useState, useEffect, useRef } from 'react';
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
import { ModeSelectScreen, QuizMode } from '../components/quiz/ModeSelectScreen';
import { QuizFeedbackPanel } from '../components/quiz/QuizFeedbackPanel';
import { QuizProgressSegments } from '../components/quiz/QuizProgressSegments';
import { StarryBackground } from '../components/jobs/StarryBackground';

import quizQuestionsData from '../data/quiz-questions.json';
import quizConfigData from '../data/quiz-config.json';

interface QuizQuestion {
  id: number;
  zone: string;
  zoneIcon: string;
  situation: string;
  description: string;
  feedbackMap: Record<string, string>;
  choices: QuizChoice[];
}

interface QuizChoice {
  id: string;
  text: string;
  riasecScores: Record<string, number>;
}

interface QuizScreenProps {
  onComplete: (answers: Record<number, number>) => void;
  onBack: () => void;
}

const CHOICE_LETTERS = ['A', 'B', 'C', 'D'];
const XP_PER_QUESTION = 5;


function getZoneColor(zone: string): string {
  const zoneColors = quizConfigData.quiz.zones as Record<string, { color: string; icon: string }>;
  return zoneColors[zone]?.color ?? COLORS.primary;
}

export function QuizScreen({ onComplete, onBack }: QuizScreenProps) {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<QuizMode | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [totalXP, setTotalXP] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const xpScaleAnim = useRef(new Animated.Value(1)).current;
  const questionFadeAnim = useRef(new Animated.Value(1)).current;
  const choiceAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  const selectedGlowAnim = useRef(new Animated.Value(0)).current;

  const allQuestions = quizQuestionsData as unknown as QuizQuestion[];
  const questions = mode
    ? mode === 'quick'
      ? allQuestions.filter((_, i) => i % 3 === 0).slice(0, 10)
      : allQuestions
    : [];

  const currentQuestion = questions[currentIndex];
  const zoneConfig = currentQuestion
    ? quizConfigData.quiz.zones[currentQuestion.zone as keyof typeof quizConfigData.quiz.zones]
    : null;
  const currentColor = zoneConfig?.color ?? COLORS.primary;
  const isLastQuestion = currentIndex === questions.length - 1;
  const progressPercent = questions.length > 0
    ? Math.round((Object.keys(answers).length / questions.length) * 100)
    : 0;

  useEffect(() => {
    if (!currentQuestion) return;
    setSelectedChoiceIndex(null);
    selectedGlowAnim.setValue(0);

    questionFadeAnim.setValue(0);
    Animated.timing(questionFadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    choiceAnims.forEach((anim, i) => {
      anim.setValue(0);
      setTimeout(() => {
        Animated.spring(anim, {
          toValue: 1,
          tension: 65,
          friction: 7,
          useNativeDriver: true,
        }).start();
      }, 80 + i * 80);
    });
  }, [currentIndex, currentQuestion]);

  const triggerXpPop = () => {
    xpScaleAnim.setValue(1);
    Animated.sequence([
      Animated.spring(xpScaleAnim, {
        toValue: 1.35,
        tension: 200,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.spring(xpScaleAnim, {
        toValue: 1,
        tension: 200,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const triggerSelectedGlow = () => {
    selectedGlowAnim.setValue(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(selectedGlowAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(selectedGlowAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
      { iterations: 2 }
    ).start();
  };

  const handleAnswerSelect = (choiceIndex: number) => {
    if (isAnimating || showFeedback) return;
    setIsAnimating(true);
    setSelectedChoiceIndex(choiceIndex);
    triggerSelectedGlow();

    const newAnswers = { ...answers, [currentIndex]: choiceIndex };
    setAnswers(newAnswers);
    setTotalXP((prev) => prev + XP_PER_QUESTION);
    triggerXpPop();

    const feedback =
      currentQuestion.feedbackMap?.[String(choiceIndex)] ?? '좋은 선택이에요! 계속해봐요 🌟';
    setFeedbackText(feedback);

    setTimeout(() => {
      setShowFeedback(true);
      setIsAnimating(false);
    }, 400);
  };

  const handleFeedbackNext = () => {
    setShowFeedback(false);
    setSelectedChoiceIndex(null);
    if (isLastQuestion) {
      onComplete(answers);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const resetQuizState = () => {
    setCurrentIndex(0);
    setAnswers({});
    setTotalXP(0);
    setShowFeedback(false);
    setFeedbackText('');
    setSelectedChoiceIndex(null);
    setIsAnimating(false);
    xpScaleAnim.setValue(1);
    selectedGlowAnim.setValue(0);
    choiceAnims.forEach((anim) => anim.setValue(0));
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      resetQuizState();
      setMode(null);
    }
  };

  const handleModeSelect = (selectedMode: QuizMode) => {
    resetQuizState();
    setMode(selectedMode);
  };

  if (!mode) {
    return <ModeSelectScreen onSelect={handleModeSelect} />;
  }
  if (!currentQuestion) return null;

  const counterSeparator = ' / ';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StarryBackground />

      {/* ── 헤더 ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={handleBack}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.backBtnText}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerLeft}>
          <Text style={styles.headerZoneIcon}>{currentQuestion.zoneIcon}</Text>
          <Text style={styles.headerZoneText}>{currentQuestion.zone}</Text>
          <Text style={styles.headerDot}>·</Text>
          <Text style={styles.headerQuestionNum}>Q{currentIndex + 1}</Text>
        </View>

        <View style={styles.headerRight}>
          <Text style={styles.headerXpIcon}>⚡</Text>
          <Text style={styles.headerCounter}>
            {currentIndex + 1}{counterSeparator}{questions.length}
          </Text>
        </View>
      </View>

      {/* ── 세그먼트 진행률 바 ── */}
      <QuizProgressSegments
        total={questions.length}
        current={currentIndex}
        answered={Object.keys(answers).length}
        color={currentColor}
        segmentColors={questions.map((q) => getZoneColor(q.zone))}
      />

      {/* ── 스크롤 콘텐츠 ── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* 상황 배지 */}
        <View style={[styles.situationBadge, { backgroundColor: `${currentColor}18`, borderColor: `${currentColor}35` }]}>
          <Text style={[styles.situationStar, { color: currentColor }]}>☆</Text>
          <Text style={[styles.situationText, { color: currentColor }]}>{currentQuestion.situation}</Text>
        </View>

        {/* 질문 카드 */}
        <Animated.View
          style={[
            styles.questionCard,
            { borderColor: `${currentColor}20`, opacity: questionFadeAnim },
          ]}
        >
          <Text style={styles.questionText}>{currentQuestion.description}</Text>
        </Animated.View>

        {/* 선택지 */}
        <View style={styles.choicesContainer}>
          {currentQuestion.choices.map((choice, index) => {
            const isSelected = selectedChoiceIndex === index;

            return (
              <Animated.View
                key={choice.id}
                style={{
                  opacity: choiceAnims[index],
                  transform: [
                    {
                      translateY: choiceAnims[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [30, 0],
                      }),
                    },
                    {
                      scale: choiceAnims[index].interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0.95, 1.02, 1],
                      }),
                    },
                  ],
                }}
              >
                <View style={styles.choiceRow}>
                  <TouchableOpacity
                    style={[
                      styles.choiceBtn,
                      isSelected && {
                        borderColor: currentColor,
                        elevation: 6,
                      },
                    ]}
                    onPress={() => handleAnswerSelect(index)}
                    disabled={isAnimating || showFeedback}
                    activeOpacity={0.75}
                  >
                    {isSelected && (
                      <View
                        style={[styles.choiceSelectedBar, { backgroundColor: currentColor }]}
                      />
                    )}

                    <View
                      style={[
                        styles.choiceLetterCircle,
                        isSelected
                          ? { backgroundColor: currentColor, borderColor: currentColor }
                          : { borderColor: `${currentColor}70` },
                      ]}
                    >
                      <Text
                        style={[
                          styles.choiceLetterText,
                          { color: isSelected ? '#fff' : `${currentColor}CC` },
                        ]}
                      >
                        {CHOICE_LETTERS[index]}
                      </Text>
                    </View>
                    <Text style={[styles.choiceText, isSelected && styles.choiceTextSelected]}>
                      {choice.text}
                    </Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>

      {/* ── 하단 상태 바 ── */}
      <View style={[styles.statusBar, { paddingBottom: insets.bottom + SPACING.md }]}>
        <Animated.View
          style={[
            styles.xpBadge,
            { transform: [{ scale: xpScaleAnim }] },
          ]}
        >
          <Text style={[styles.xpBadgeIcon, { color: currentColor }]}>✦</Text>
          <Text style={styles.xpBadgeText}>{totalXP} XP 획득</Text>
        </Animated.View>

        <View style={styles.statusProgressContainer}>
          <View style={styles.statusProgressBg}>
            <LinearGradient
              colors={[currentColor, `${currentColor}CC`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.statusProgressFill, { width: `${progressPercent}%` as any }]}
            />
          </View>
          <Text style={[styles.statusProgressText, { color: currentColor }]}>
            {progressPercent}%
          </Text>
        </View>
      </View>

      {/* ── 피드백 패널 ── */}
      {showFeedback && (
        <QuizFeedbackPanel
          zoneIcon={currentQuestion.zoneIcon}
          zoneName={currentQuestion.zone}
          feedbackText={feedbackText}
          color={currentColor}
          isLast={isLastQuestion}
          onNext={handleFeedbackNext}
          bottomInset={insets.bottom}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E0E1C',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '300',
    color: COLORS.white,
    marginTop: -1,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SPACING.sm,
    gap: SPACING.xs,
  },
  headerZoneIcon: {
    fontSize: 16,
  },
  headerZoneText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '800',
    color: COLORS.white,
  },
  headerDot: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.35)',
    marginHorizontal: 1,
  },
  headerQuestionNum: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.55)',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    minWidth: 48,
    justifyContent: 'flex-end',
  },
  headerXpIcon: {
    fontSize: 12,
    color: COLORS.yellow,
  },
  headerCounter: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xxxl,
  },
  situationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  situationStar: {
    fontSize: 11,
  },
  situationText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
  },
  questionCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
  },
  questionText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    color: COLORS.white,
    lineHeight: 22,
  },
  choicesContainer: {
    gap: SPACING.sm,
  },
  choiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  choiceBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: SPACING.sm,
    overflow: 'hidden',
    position: 'relative',
  },
  choiceSelectedBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderBottomLeftRadius: BORDER_RADIUS.lg,
  },
  choiceLetterCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    backgroundColor: 'transparent',
    flexShrink: 0,
  },
  choiceLetterText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '800',
  },
  choiceText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 18,
  },
  choiceTextSelected: {
    color: COLORS.white,
    fontWeight: '700',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    gap: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  xpBadgeIcon: {
    fontSize: 14,
  },
  xpBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.yellow,
    minWidth: 64,
  },
  statusProgressContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  statusProgressBg: {
    flex: 1,
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  statusProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  statusProgressText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    minWidth: 28,
    textAlign: 'right',
  },
});
