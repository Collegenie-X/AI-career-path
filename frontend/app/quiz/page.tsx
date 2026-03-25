'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';
import { generateRIASECResult } from '@/lib/riasec';
import allQuestionsData from '@/data/quiz-questions.json';
import {
  ModeSelectScreen,
  FeedbackOverlay,
  QuizHeader,
  QuestionCard,
  ChoicesList,
  XpPopup,
  QuizStatus,
  BackgroundEffects,
} from './components';
import { getZoneColor, QUIZ_CONFIG, ANIMATION_CONFIG, ROUTES } from './config';
import type { QuizMode, QuizQuestion, FeedbackData } from './types';

const allQuestions = allQuestionsData as unknown as QuizQuestion[];

export default function QuizPage() {
  const router = useRouter();
  const [mode, setMode] = useState<QuizMode | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [xpPopVisible, setXpPopVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [choicesVisible, setChoicesVisible] = useState(true);
  const [pendingFeedback, setPendingFeedback] = useState<FeedbackData | null>(null);
  const [hasSavedRiasecResult, setHasSavedRiasecResult] = useState(false);
  const touchRef = useRef<{ x: number } | null>(null);

  const questions = mode
    ? mode === '10'
      ? allQuestions.filter((_, i) => QUIZ_CONFIG.quickModeFilter(i)).slice(0, QUIZ_CONFIG.quickModeQuestions)
      : allQuestions
    : [];

  const q = questions[currentIndex];
  const color = q ? getZoneColor(q.zone) : '#6C5CE7';
  const answeredCount = Object.keys(answers).length;

  useEffect(() => {
    setChoicesVisible(false);
    const t = setTimeout(() => setChoicesVisible(true), ANIMATION_CONFIG.choiceEnterDelay);
    return () => clearTimeout(t);
  }, [currentIndex]);

  useEffect(() => {
    const savedRiasec = storage.riasec.get();
    setHasSavedRiasecResult(savedRiasec !== null);
    if (savedRiasec && !mode) {
      router.replace('/quiz/results');
    }
  }, [mode, router]);

  const finishQuiz = useCallback((finalAnswers: Record<number, number>) => {
    const map: Record<number, string> = {};
    questions.forEach((qq, i) => {
      const ci = finalAnswers[i] ?? 0;
      map[qq.id] = qq.choices[ci]?.id || qq.choices[0].id;
    });
    const result = generateRIASECResult(questions, map);
    storage.riasec.set(result);
    const existingProfile = storage.user.get();
    storage.user.set({
      id: existingProfile?.id ?? Date.now().toString(),
      nickname: existingProfile?.nickname ?? '탐험가',
      school: existingProfile?.school ?? 'general',
      grade: existingProfile?.grade ?? '',
      onboardingCompleted: true,
      createdAt: existingProfile?.createdAt ?? new Date().toISOString(),
    });
    router.push(ROUTES.quizResults);
  }, [questions, router]);

  const pickAnswer = (choiceId: string, choiceIdx: number) => {
    if (animating || pendingFeedback) return;
    setAnimating(true);

    const next = { ...answers, [currentIndex]: choiceIdx };
    setAnswers(next);

    setXpPopVisible(true);
    setTimeout(() => setXpPopVisible(false), ANIMATION_CONFIG.xpPopDuration);

    const feedbackText = q.feedbackMap?.[String(choiceIdx)] ?? '좋은 선택이에요! 계속해봐요 🌟';
    const isLast = currentIndex === questions.length - 1;

    setTimeout(() => {
      setPendingFeedback({
        text: feedbackText,
        zone: q.zone,
        zoneIcon: q.zoneIcon,
        isLast,
      });
      setAnimating(false);
    }, ANIMATION_CONFIG.feedbackDelay);
  };

  const handleFeedbackNext = () => {
    const isLast = pendingFeedback?.isLast;
    setPendingFeedback(null);

    if (isLast) {
      finishQuiz(answers);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const goBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setMode(null);
    }
  };

  if (!mode) {
    return <ModeSelectScreen onSelect={setMode} hasSavedRiasecResult={hasSavedRiasecResult} />;
  }
  if (!q) return null;

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ backgroundColor: '#1A1A2E' }}
      onTouchStart={(e) => { touchRef.current = { x: e.touches[0].clientX }; }}
      onTouchEnd={(e) => {
        if (!touchRef.current) return;
        const dx = e.changedTouches[0].clientX - touchRef.current.x;
        if (dx > 80 && currentIndex > 0 && !pendingFeedback) goBack();
        touchRef.current = null;
      }}
    >
      <BackgroundEffects color={color} />

      {/* 웹 스타일 컨테이너 */}
      <div className="web-container relative z-10 flex-1 flex flex-col py-6 md:py-8">
        <div className="max-w-5xl mx-auto w-full flex flex-col flex-1">
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] px-4 py-4 md:px-8 md:py-6">
          <QuizHeader
            question={q}
            currentIndex={currentIndex}
            totalQuestions={questions.length}
            questions={questions}
            answers={answers}
            onBack={goBack}
          />

          <div className="flex-1 flex flex-col justify-center">
            <QuestionCard question={q} />

            <XpPopup visible={xpPopVisible} />

            <ChoicesList
              question={q}
              currentIndex={currentIndex}
              answers={answers}
              choicesVisible={choicesVisible}
              animating={animating}
              pendingFeedback={!!pendingFeedback}
              onPickAnswer={pickAnswer}
            />
          </div>

          <QuizStatus
            answeredCount={answeredCount}
            totalQuestions={questions.length}
            currentZoneColor={color}
          />
          </section>
        </div>
      </div>

      {pendingFeedback && (
        <FeedbackOverlay
          feedback={pendingFeedback.text}
          zone={pendingFeedback.zone}
          zoneIcon={pendingFeedback.zoneIcon}
          onNext={handleFeedbackNext}
          isLast={pendingFeedback.isLast}
        />
      )}
    </div>
  );
}
