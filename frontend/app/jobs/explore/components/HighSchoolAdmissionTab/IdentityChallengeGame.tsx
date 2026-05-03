'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { ChevronLeft, Sparkles, ChevronRight, Flame, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { HighSchoolCategory, IdentityChallengeData, IdentityChallengeChoice } from '../../types';
import { QuizProgressBar, QuizChoiceButton, QuizFeedbackSheet } from '../shared';

function maxScoreOf(choice: IdentityChallengeChoice): number {
  return Math.max(0, ...Object.values(choice.categoryScores));
}

function weightToEmoji(weight: number): string {
  if (weight >= 3) return '🔥';
  if (weight === 2) return '⭐';
  if (weight === 1) return '✨';
  return '🌱';
}

// 테마별 강조색 — 15개 영역을 시각적으로 구분
const THEME_COLORS: Record<string, string> = {
  '과목 적성':   '#60a5fa',
  '성격 유형':   '#a78bfa',
  '스트레스 내성': '#34d399',
  '성적 전략':   '#fbbf24',
  '자율학습':    '#f472b6',
  '유학·해외 대학': '#38bdf8',
  '정시 vs 수시': '#fb923c',
  'IB·토론 적성': '#c084fc',
  '활동·경험 욕구': '#4ade80',
  '경쟁 강도':   '#f87171',
  '직무 적성':   '#818cf8',
  '재정·비용':   '#facc15',
  '대학 루트':   '#e879f9',
  '정체성':      '#fbbf24',
  '종합 판단':   '#845ef7',
};

function getThemeColor(theme: string): string {
  return THEME_COLORS[theme] ?? '#845ef7';
}

type IdentityChallengeGameProps = {
  data: IdentityChallengeData;
  categories: HighSchoolCategory[];
  onBack: () => void;
  onSelectCategory: (category: HighSchoolCategory) => void;
};

type GamePhase = 'intro' | 'playing' | 'result';

type PendingFeedback = {
  theme: string;
  themeIcon: string;
  feedback: string;
  isLast: boolean;
};

export function IdentityChallengeGame({
  data,
  categories,
  onBack,
  onSelectCategory,
}: IdentityChallengeGameProps) {
  const [phase, setPhase] = useState<GamePhase>('intro');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [feedbackHistory, setFeedbackHistory] = useState<{ theme: string; feedback: string }[]>([]);
  const [pendingFeedback, setPendingFeedback] = useState<PendingFeedback | null>(null);
  const [streak, setStreak] = useState(0);
  const [xpPop, setXpPop] = useState<{ id: number; value: number } | null>(null);

  useEffect(() => {
    if (!xpPop) return;
    const timer = window.setTimeout(() => setXpPop(null), 900);
    return () => window.clearTimeout(timer);
  }, [xpPop]);

  const earnedXp = useMemo(
    () => Object.values(scores).reduce((sum, value) => sum + value, 0),
    [scores]
  );

  const liveTopCategories = useMemo(() => {
    return Object.entries(scores)
      .filter(([, value]) => value > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id, value]) => ({
        id,
        value,
        category: categories.find((c) => c.id === id),
      }))
      .filter((entry): entry is { id: string; value: number; category: HighSchoolCategory } => entry.category != null);
  }, [scores, categories]);

  const totalQuestions = data.questions.length;
  const currentQuestion = data.questions[questionIndex];
  const accentColor = getThemeColor(currentQuestion?.theme ?? '');

  const handleChoiceSelect = useCallback(
    (choice: IdentityChallengeChoice, idx: number) => {
      if (pendingFeedback || selectedIdx !== null) return;

      setSelectedIdx(idx);

      const newScores = { ...scores };
      Object.entries(choice.categoryScores).forEach(([catId, points]) => {
        newScores[catId] = (newScores[catId] ?? 0) + points;
      });
      setScores(newScores);
      const choiceMaxWeight = maxScoreOf(choice);
      setStreak((current) => (choiceMaxWeight >= 2 ? current + 1 : 0));
      setXpPop({ id: Date.now(), value: choiceMaxWeight });
      setFeedbackHistory((h) => [
        ...h,
        { theme: currentQuestion.theme, feedback: choice.feedback },
      ]);

      const isLast = questionIndex === totalQuestions - 1;
      setPendingFeedback({
        theme: currentQuestion.theme,
        themeIcon: currentQuestion.themeIcon,
        feedback: choice.feedback,
        isLast,
      });
    },
    [pendingFeedback, selectedIdx, scores, currentQuestion, questionIndex, totalQuestions]
  );

  const handleFeedbackNext = useCallback(() => {
    const isLast = pendingFeedback?.isLast;
    setPendingFeedback(null);
    setSelectedIdx(null);

    if (isLast) {
      setPhase('result');
    } else {
      setQuestionIndex((i) => i + 1);
    }
  }, [pendingFeedback]);

  const handleReset = useCallback(() => {
    setPhase('intro');
    setQuestionIndex(0);
    setSelectedIdx(null);
    setScores({});
    setFeedbackHistory([]);
    setPendingFeedback(null);
    setStreak(0);
    setXpPop(null);
  }, []);

  const getTopCategories = useCallback((): HighSchoolCategory[] => {
    const ids = Object.keys(scores).filter((id) => scores[id] > 0);
    if (ids.length === 0) return [];
    const sorted = ids.sort((a, b) => (scores[b] ?? 0) - (scores[a] ?? 0));
    const topScore = scores[sorted[0]] ?? 0;
    return sorted
      .filter((id) => (scores[id] ?? 0) >= topScore * 0.6)
      .slice(0, 3)
      .map((id) => categories.find((c) => c.id === id))
      .filter((c): c is HighSchoolCategory => c != null);
  }, [scores, categories]);

  const topCategories = phase === 'result' ? getTopCategories() : [];

  // ── 인트로 ─────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            <ChevronLeft className="w-4 h-4 text-gray-300" />
          </button>
          <div>
            <h3 className="text-sm font-bold text-white">{data.meta.title}</h3>
            <p className="text-[12px] text-gray-400">{data.meta.subtitle}</p>
          </div>
        </div>

        <div
          className="rounded-2xl p-5 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(132,94,247,0.2) 0%, rgba(251,191,36,0.1) 100%)',
            border: '1px solid rgba(132,94,247,0.3)',
          }}
        >
          <div className="text-4xl mb-2">🧭</div>
          <p className="text-sm font-bold text-white mb-2">{data.meta.title}</p>
          <p className="text-[12px] text-gray-300 leading-relaxed mb-3">{data.meta.description}</p>
          <div className="grid grid-cols-3 gap-1.5">
            {data.questions.map((q) => (
              <span
                key={q.id}
                className="text-[11px] py-1 px-1.5 rounded-md text-center"
                style={{ background: `${getThemeColor(q.theme)}18`, color: getThemeColor(q.theme) }}
              >
                {q.themeIcon} {q.theme}
              </span>
            ))}
          </div>
        </div>

        <button
          onClick={() => setPhase('playing')}
          className="w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, #845ef7 0%, #a78bfa 100%)',
            border: '1px solid rgba(132,94,247,0.5)',
            color: 'white',
            boxShadow: '0 4px 14px rgba(132,94,247,0.2)',
          }}
        >
          <Sparkles className="w-4 h-4" />
          도전 시작
        </button>
      </div>
    );
  }

  // ── 결과 ─────────────────────────────────────────────────────
  if (phase === 'result') {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            <ChevronLeft className="w-4 h-4 text-gray-300" />
          </button>
          <div>
            <h3 className="text-sm font-bold text-white">나의 고입 루트 발견!</h3>
            <p className="text-[12px] text-gray-400">{data.resultMessages.multiple}</p>
          </div>
        </div>

        <div
          className="rounded-2xl p-4 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(251,191,36,0.15) 0%, rgba(132,94,247,0.1) 100%)',
            border: '1px solid rgba(251,191,36,0.3)',
          }}
        >
          <div className="text-4xl mb-2">🧭</div>
          <p className="text-sm font-bold text-white mb-1">
            {topCategories.length === 0
              ? data.resultMessages.neutral
              : topCategories.length === 1
                ? data.resultMessages.single
                : data.resultMessages.multiple}
          </p>
        </div>

        {topCategories.length > 0 ? (
          topCategories.map((cat, rank) => (
            <div
              key={cat.id}
              className="rounded-2xl p-4"
              style={{ background: cat.bgColor, border: `1px solid ${cat.color}50` }}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{cat.emoji}</span>
                <div>
                  <p className="text-[12px] text-gray-400">
                    {rank === 0 ? '🥇 1순위 추천' : rank === 1 ? '🥈 2순위 추천' : '🥉 3순위 추천'}
                  </p>
                  <p className="text-sm font-bold text-white">{cat.name}</p>
                </div>
              </div>
              <p className="text-[12px] text-gray-300 leading-relaxed mb-3">{cat.description}</p>
              <button
                onClick={() => onSelectCategory(cat)}
                className="w-full py-2.5 rounded-xl text-[12px] font-medium flex items-center justify-center gap-2"
                style={{ background: cat.bgColor, border: `1px solid ${cat.color}`, color: cat.color }}
              >
                {cat.name} 탐방하기
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        ) : (
          <div
            className="rounded-2xl p-4 text-center"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <p className="text-[12px] text-gray-300">행성 지도에서 직접 탐방해보세요!</p>
          </div>
        )}

        {/* 영역별 피드백 요약 */}
        {feedbackHistory.length > 0 && (
          <div
            className="rounded-2xl p-3 space-y-2"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p className="text-[11px] font-bold text-gray-400">📝 영역별 피드백 요약</p>
            {feedbackHistory.map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span
                  className="text-[11px] font-bold flex-shrink-0 mt-0.5 px-1.5 py-0.5 rounded"
                  style={{
                    background: `${getThemeColor(item.theme)}18`,
                    color: getThemeColor(item.theme),
                    minWidth: '52px',
                    textAlign: 'center',
                  }}
                >
                  {item.theme}
                </span>
                <p className="text-[12px] text-gray-400 leading-relaxed">{item.feedback}</p>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleReset}
          className="w-full py-2.5 rounded-xl text-[12px] font-medium"
          style={{ background: 'rgba(255,255,255,0.06)', color: '#9ca3af' }}
        >
          다시 도전하기
        </button>
      </div>
    );
  }

  // ── 플레이 중 ─────────────────────────────────────────────────
  return (
    <>
      <div className="space-y-3">
        {/* 헤더 */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => (questionIndex === 0 ? setPhase('intro') : setQuestionIndex((i) => i - 1))}
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            <ChevronLeft className="w-4 h-4 text-gray-300" />
          </button>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-white">{data.meta.title}</h3>
          </div>
        </div>

        {/* 진행 바 */}
        <QuizProgressBar
          current={questionIndex}
          total={totalQuestions}
          accentColor={accentColor}
        />

        {/* 게임 HUD: 퀘스트 레벨 · XP · 콤보 */}
        <div
          className="rounded-xl p-2.5 flex items-center gap-2.5"
          style={{
            background: 'linear-gradient(135deg, rgba(15,23,42,0.85), rgba(30,41,59,0.6))',
            border: `1px solid ${accentColor}40`,
          }}
        >
          <div className="flex items-center gap-1 flex-shrink-0">
            <Star className="w-3.5 h-3.5" style={{ color: accentColor }} fill="currentColor" />
            <span className="text-[11px] font-bold" style={{ color: accentColor }}>
              퀘스트 Lv.{questionIndex + 1}
            </span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="text-[10px] text-gray-400">XP</span>
            <motion.span
              key={earnedXp}
              initial={{ scale: 1.4, color: '#fde047' }}
              animate={{ scale: 1, color: '#fcd34d' }}
              className="text-[12px] font-mono font-bold tabular-nums"
            >
              {earnedXp}
            </motion.span>
          </div>
          {streak >= 2 ? (
            <motion.div
              key={streak}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-0.5 flex-shrink-0 px-1.5 py-0.5 rounded-md"
              style={{ background: 'rgba(244,114,182,0.2)', border: '1px solid rgba(244,114,182,0.4)' }}
            >
              <Flame className="w-3 h-3 text-pink-300" />
              <span className="text-[10px] font-bold text-pink-200">{streak} 콤보</span>
            </motion.div>
          ) : null}
          <div className="flex-1 flex items-center justify-end gap-1 min-w-0 overflow-hidden">
            {liveTopCategories.length === 0 ? (
              <span className="text-[10px] text-gray-500">유형 발견 중…</span>
            ) : (
              liveTopCategories.map((entry, rank) => (
                <motion.span
                  key={entry.id}
                  layout
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 truncate"
                  style={{
                    background: `${entry.category.color}22`,
                    color: entry.category.color,
                    border: `1px solid ${entry.category.color}50`,
                  }}
                  title={`${entry.category.name} (${entry.value}점)`}
                >
                  <span>{rank === 0 ? '🥇' : rank === 1 ? '🥈' : '🥉'}</span>
                  <span>{entry.category.emoji}</span>
                  <span className="tabular-nums">{entry.value}</span>
                </motion.span>
              ))
            )}
          </div>
        </div>

        {/* 배경·당위성 */}
        <div
          className="rounded-xl p-3"
          style={{
            background: `${accentColor}10`,
            border: `1px solid ${accentColor}25`,
          }}
        >
          <p className="text-[12px] leading-relaxed" style={{ color: `${accentColor}cc` }}>
            💡 {currentQuestion.context}
          </p>
        </div>

        {/* 질문 카드 */}
        <div
          className="relative p-5 rounded-2xl overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${accentColor}12 0%, rgba(255,255,255,0.03) 100%)`,
            border: `1px solid ${accentColor}25`,
          }}
        >
          <div
            className="absolute -top-3 -right-3 w-16 h-16 rounded-full blur-xl pointer-events-none"
            style={{ backgroundColor: `${accentColor}15` }}
          />
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">{currentQuestion.themeIcon}</span>
            <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: accentColor }}>
              {currentQuestion.theme}
            </span>
          </div>
          <p className="relative z-10 text-[15px] font-bold leading-relaxed text-white">
            {currentQuestion.question}
          </p>
        </div>

        {currentQuestion.expertTip ? (
          <div
            className="rounded-xl px-3 py-2 flex items-start gap-2"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px dashed rgba(255,255,255,0.1)',
            }}
          >
            <span className="text-[11px] font-bold flex-shrink-0 mt-0.5" style={{ color: accentColor }}>
              전문가 팁
            </span>
            <p className="text-[12px] text-gray-300 leading-relaxed">{currentQuestion.expertTip}</p>
          </div>
        ) : null}

        {/* 선택지 */}
        <div className="flex flex-col gap-2.5 relative">
          {currentQuestion.choices.map((choice, idx) => {
            const weight = maxScoreOf(choice);
            return (
              <QuizChoiceButton
                key={idx}
                index={idx}
                text={choice.text}
                hint={choice.hint}
                selected={selectedIdx === idx}
                disabled={pendingFeedback !== null}
                accentColor={accentColor}
                onSelect={() => handleChoiceSelect(choice, idx)}
                prefixEmoji={weightToEmoji(weight)}
                trailingBadge={
                  weight > 0
                    ? { label: `+${weight} XP`, color: accentColor }
                    : undefined
                }
              />
            );
          })}

          <AnimatePresence>
            {xpPop ? (
              <motion.div
                key={xpPop.id}
                initial={{ y: 0, opacity: 0, scale: 0.6 }}
                animate={{ y: -60, opacity: 1, scale: 1.4 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-black"
                style={{
                  color: accentColor,
                  textShadow: '0 0 16px rgba(0,0,0,0.7)',
                }}
              >
                +{xpPop.value} XP {weightToEmoji(xpPop.value)}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      {/* 하단 피드백 시트 (직업 적성 검사와 동일한 방식) */}
      {pendingFeedback && (
        <QuizFeedbackSheet
          theme={pendingFeedback.theme}
          themeIcon={pendingFeedback.themeIcon}
          feedback={pendingFeedback.feedback}
          isLast={pendingFeedback.isLast}
          accentColor={accentColor}
          onNext={handleFeedbackNext}
        />
      )}

      <style jsx global>{`
        @keyframes choice-enter {
          from { transform: translateX(-12px); opacity: 0; }
          to   { transform: translateX(0);     opacity: 1; }
        }
      `}</style>
    </>
  );
}
