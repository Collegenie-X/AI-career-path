'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { storage } from '@/lib/storage';
import { quizRiasecResultQueryKey } from '@/lib/queries/quizRiasecQuery';
import { generateRIASECResult } from '@/lib/riasec';
import { fetchQuizQuestions, quizQuestionsQueryKey } from '@/lib/queries/quizQuestionsQuery';
import { submitQuizResultToBackend } from '@/lib/queries/submitQuizResultToBackend';
import {
  ModeSelectScreen,
  FeedbackOverlay,
  QuizHeader,
  QuestionCard,
  ChoicesList,
  XpPopup,
  QuizStatus,
  BackgroundEffects,
} from '../components';
import { getZoneColor, ANIMATION_CONFIG, ROUTES, LABELS } from '../config';
import { QuizResultsAnalyzingView } from '../results/components/QuizResultsAnalyzingView';
import type { QuizMode, FeedbackData } from '../types';

/**
 * 적성 퀘스트 본편: 모드 선택 → 문항 진행.
 * 진입은 /quiz/intro 의 「퀘스트 시작」 또는 재검사 플로우에서만 연결됩니다.
 */
export default function QuizPlayPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<QuizMode | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [xpPopVisible, setXpPopVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [choicesVisible, setChoicesVisible] = useState(true);
  const [pendingFeedback, setPendingFeedback] = useState<FeedbackData | null>(null);
  const [hasSavedRiasecResult, setHasSavedRiasecResult] = useState(false);
  const touchRef = useRef<{ x: number } | null>(null);

  const {
    data: questions = [],
    isPending: isQuestionsPending,
    isError: isQuestionsError,
    refetch: refetchQuestions,
  } = useQuery({
    queryKey: mode ? quizQuestionsQueryKey(mode) : (['quizQuestions', 'idle'] as const),
    queryFn: () => fetchQuizQuestions(mode!),
    enabled: mode !== null,
    staleTime: 10 * 60_000,
    gcTime: 60 * 60_000,
    retry: false,
  });

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
  }, []);

  useEffect(() => {
    if (!mode) return;
    setCurrentIndex(0);
    setAnswers({});
    setPendingFeedback(null);
    setAnimating(false);
    setXpPopVisible(false);
  }, [mode]);

  const finishQuiz = useCallback((finalAnswers: Record<number, number>) => {
    const map: Record<number, string> = {};
    const answersForApi = questions.map((qq, i) => {
      const ci = finalAnswers[i] ?? 0;
      const choiceKey = qq.choices[ci]?.id || qq.choices[0].id;
      map[qq.id] = choiceKey;
      return { question_id: qq.id, choice_key: choiceKey };
    });
    const result = generateRIASECResult(questions, map);
    storage.riasec.set(result);
    queryClient.setQueryData(quizRiasecResultQueryKey, result);
    const existingProfile = storage.user.get();
    storage.user.set({
      id: existingProfile?.id ?? Date.now().toString(),
      nickname: existingProfile?.nickname ?? '탐험가',
      school: existingProfile?.school ?? 'general',
      grade: existingProfile?.grade ?? '',
      onboardingCompleted: true,
      createdAt: existingProfile?.createdAt ?? new Date().toISOString(),
    });
    if (mode) {
      void submitQuizResultToBackend(mode, answersForApi)
        .then((serverId) => {
          if (serverId) storage.quiz.setLastResultId(serverId);
        })
        .catch((err) => {
          console.warn('[quiz] 서버에 결과 저장 실패(로컬 결과는 유지됩니다):', err);
        });
    }
    router.push(ROUTES.quizResults);
  }, [questions, queryClient, router, mode]);

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

  if (isQuestionsPending) {
    return <QuizResultsAnalyzingView accentColor="#6C5CE7" message={LABELS.quiz_questions_loading} />;
  }

  if (isQuestionsError || questions.length === 0) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-6"
        style={{ backgroundColor: '#1A1A2E' }}
      >
        <p className="text-white/80 text-center text-base md:text-lg mb-6 max-w-md">{LABELS.quiz_questions_error}</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            className="px-6 py-3 rounded-2xl font-bold text-white bg-violet-600 hover:bg-violet-500 transition-colors"
            onClick={() => refetchQuestions()}
          >
            {LABELS.quiz_questions_retry}
          </button>
          <button
            type="button"
            className="px-6 py-3 rounded-2xl font-bold text-white/90 border border-white/20 hover:bg-white/10 transition-colors"
            onClick={() => setMode(null)}
          >
            {LABELS.quiz_back_to_mode_select}
          </button>
        </div>
      </div>
    );
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
