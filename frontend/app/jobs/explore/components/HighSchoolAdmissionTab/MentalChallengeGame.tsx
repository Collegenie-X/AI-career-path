'use client';

import { useState, useCallback, useEffect } from 'react';
import { ChevronLeft, Zap, Heart, ArrowRight, Sparkles, CheckCircle2, Target, BookOpen, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MentalChallengeData, MentalChallengeChoice, MentalChallengeScenario } from '../../types';
import { QuizProgressBar, QuizChoiceButton } from '../shared';

const ACCENT_COLOR = '#f59e0b';
const MAX_HP = 100;
const MIN_HP = 0;

function scoreToEmoji(score: number): string {
  if (score >= 3) return '🔥';
  if (score === 2) return '😎';
  if (score === 1) return '🙂';
  if (score === 0) return '😐';
  if (score === -1) return '😟';
  if (score === -2) return '😭';
  return '💀';
}

function scoreToBadgeColor(score: number): string {
  if (score >= 2) return '#34d399';
  if (score >= 0) return '#facc15';
  if (score >= -1) return '#fb923c';
  return '#f87171';
}

type MentalChallengeGameProps = {
  data: MentalChallengeData;
  onBack: () => void;
};

type GamePhase = 'intro' | 'playing' | 'result';

type PendingFeedback = {
  feedback: string;
  score: number;
  isLast: boolean;
  gainEffect?: string;
  realAction?: string;
  scenario: MentalChallengeScenario;
};

export function MentalChallengeGame({ data, onBack }: MentalChallengeGameProps) {
  const [phase, setPhase] = useState<GamePhase>('intro');
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [totalScore, setTotalScore] = useState(0);
  const [feedbackHistory, setFeedbackHistory] = useState<{ feedback: string; score: number }[]>([]);
  const [pendingFeedback, setPendingFeedback] = useState<PendingFeedback | null>(null);
  const [hp, setHp] = useState(MAX_HP);
  const [scorePop, setScorePop] = useState<{ id: number; value: number } | null>(null);
  const [streak, setStreak] = useState(0);

  const totalScenarios = data.scenarios.length;
  const currentScenario = data.scenarios[scenarioIndex];

  const handleChoiceSelect = useCallback(
    (choice: MentalChallengeChoice, idx: number) => {
      if (pendingFeedback || selectedIdx !== null) return;

      setSelectedIdx(idx);
      setTotalScore((s) => s + choice.mentalScore);
      setHp((current) => Math.max(MIN_HP, Math.min(MAX_HP, current + choice.mentalScore * 8)));
      setStreak((current) => (choice.mentalScore > 0 ? current + 1 : 0));
      setFeedbackHistory((h) => [...h, { feedback: choice.feedback, score: choice.mentalScore }]);
      setScorePop({ id: Date.now(), value: choice.mentalScore });

      const isLast = scenarioIndex === totalScenarios - 1;
      setPendingFeedback({
        feedback: choice.feedback,
        score: choice.mentalScore,
        isLast,
        gainEffect: choice.gainEffect,
        realAction: choice.realAction,
        scenario: currentScenario,
      });
    },
    [pendingFeedback, selectedIdx, scenarioIndex, totalScenarios, currentScenario]
  );

  useEffect(() => {
    if (!scorePop) return;
    const timer = window.setTimeout(() => setScorePop(null), 900);
    return () => window.clearTimeout(timer);
  }, [scorePop]);

  const handleFeedbackNext = useCallback(() => {
    const isLast = pendingFeedback?.isLast;
    setPendingFeedback(null);
    setSelectedIdx(null);

    if (isLast) {
      setPhase('result');
    } else {
      setScenarioIndex((i) => i + 1);
    }
  }, [pendingFeedback]);

  const handleReset = useCallback(() => {
    setPhase('intro');
    setScenarioIndex(0);
    setSelectedIdx(null);
    setTotalScore(0);
    setFeedbackHistory([]);
    setPendingFeedback(null);
    setHp(MAX_HP);
    setStreak(0);
    setScorePop(null);
  }, []);

  const getResultTier = useCallback(() => {
    const sorted = [...data.resultTiers].sort((a, b) => b.minScore - a.minScore);
    return sorted.find((t) => totalScore >= t.minScore) ?? sorted[sorted.length - 1];
  }, [data.resultTiers, totalScore]);

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
            background: 'linear-gradient(135deg, rgba(251,191,36,0.15) 0%, rgba(132,94,247,0.1) 100%)',
            border: '1px solid rgba(251,191,36,0.3)',
          }}
        >
          <div className="text-4xl mb-2">💪</div>
          <p className="text-sm font-bold text-white mb-1">{data.meta.title}</p>
          <p className="text-[12px] text-gray-300 leading-relaxed mb-3">{data.meta.description}</p>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {data.scenarios.map((s) => (
              <span
                key={s.id}
                className="text-[11px] py-1 px-2 rounded-full"
                style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}
              >
                {s.emoji} {s.situation}
              </span>
            ))}
          </div>
        </div>

        <button
          onClick={() => setPhase('playing')}
          className="w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
            border: '1px solid rgba(251,191,36,0.5)',
            color: 'white',
            boxShadow: '0 4px 14px rgba(251,191,36,0.2)',
          }}
        >
          <Zap className="w-4 h-4" />
          도전 시작
        </button>
      </div>
    );
  }

  // ── 결과 ─────────────────────────────────────────────────────
  if (phase === 'result') {
    const resultTier = getResultTier();
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
            <h3 className="text-sm font-bold text-white">멘탈 결과</h3>
          </div>
        </div>

        {(() => {
          const maxScore = totalScenarios * 3;
          const minScore = totalScenarios * -3;
          const range = maxScore - minScore;
          const pct = Math.max(0, Math.min(100, ((totalScore - minScore) / range) * 100));
          const positiveCount = feedbackHistory.filter((h) => h.score > 0).length;
          const negativeCount = feedbackHistory.filter((h) => h.score < 0).length;
          return (
            <>
              <div
                className="rounded-2xl p-5 text-center relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(251,191,36,0.2) 0%, rgba(132,94,247,0.1) 100%)',
                  border: '1px solid rgba(251,191,36,0.4)',
                }}
              >
                <motion.div
                  initial={{ scale: 0.4, rotate: -15 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="text-5xl mb-2 inline-block"
                >
                  {resultTier.emoji}
                </motion.div>
                <p className="text-base font-black text-white mb-1">{resultTier.label}</p>
                {resultTier.tagline ? (
                  <p className="text-[12px] font-semibold text-amber-200 mb-2">{resultTier.tagline}</p>
                ) : null}
                <p className="text-[12px] text-gray-300 leading-relaxed">{resultTier.message}</p>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="rounded-lg p-1.5" style={{ background: 'rgba(0,0,0,0.3)' }}>
                    <p className="text-[10px] text-gray-400">총점</p>
                    <p className="text-[14px] font-black tabular-nums" style={{ color: totalScore >= 0 ? '#fbbf24' : '#f87171' }}>
                      {totalScore >= 0 ? `+${totalScore}` : totalScore}
                    </p>
                  </div>
                  <div className="rounded-lg p-1.5" style={{ background: 'rgba(0,0,0,0.3)' }}>
                    <p className="text-[10px] text-gray-400">긍정</p>
                    <p className="text-[14px] font-black text-emerald-300 tabular-nums">{positiveCount}</p>
                  </div>
                  <div className="rounded-lg p-1.5" style={{ background: 'rgba(0,0,0,0.3)' }}>
                    <p className="text-[10px] text-gray-400">위험</p>
                    <p className="text-[14px] font-black text-rose-300 tabular-nums">{negativeCount}</p>
                  </div>
                </div>

                <div className="mt-3 relative h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.4)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.9, ease: 'easeOut' }}
                    className="absolute inset-y-0 left-0"
                    style={{ background: 'linear-gradient(90deg, #f87171, #fbbf24, #34d399)' }}
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">멘탈 게이지 {Math.round(pct)}%</p>
              </div>
            </>
          );
        })()}

        {resultTier.weeklyHabit ? (
          <div
            className="rounded-2xl p-3 flex items-start gap-2"
            style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)' }}
          >
            <Target className="w-4 h-4 mt-0.5 text-emerald-300 flex-shrink-0" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 mb-0.5">
                이번 주 핵심 습관
              </p>
              <p className="text-[12px] text-emerald-100 leading-relaxed">{resultTier.weeklyHabit}</p>
            </div>
          </div>
        ) : null}

        {resultTier.actionPlan && resultTier.actionPlan.length > 0 ? (
          <div
            className="rounded-2xl p-3 space-y-1.5"
            style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)' }}
          >
            <p className="text-[11px] font-bold text-amber-200">🎯 실전 액션 플랜</p>
            <ul className="space-y-1.5">
              {resultTier.actionPlan.map((action, i) => (
                <li key={i} className="text-[12px] text-gray-200 leading-relaxed flex gap-1.5">
                  <span className="flex-shrink-0 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center bg-amber-400/20 text-amber-200">
                    {i + 1}
                  </span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {resultTier.recommendedResources && resultTier.recommendedResources.length > 0 ? (
          <div
            className="rounded-2xl p-3 space-y-1.5"
            style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)' }}
          >
            <p className="text-[11px] font-bold text-violet-200">📚 추천 자료·도구</p>
            <ul className="space-y-1">
              {resultTier.recommendedResources.map((resource, i) => (
                <li key={i} className="text-[12px] text-gray-200 leading-relaxed flex gap-1.5">
                  <span className="text-violet-300 font-bold">·</span>
                  <span>{resource}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div
          className="rounded-2xl p-3 space-y-2"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <p className="text-[11px] font-bold text-gray-400">📝 선택별 피드백</p>
          {feedbackHistory.map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <span
                className="text-[12px] font-bold flex-shrink-0 mt-0.5 w-6 text-center"
                style={{ color: item.score >= 0 ? '#34d399' : '#f87171' }}
              >
                {item.score >= 0 ? `+${item.score}` : item.score}
              </span>
              <p className="text-[12px] text-gray-300 leading-relaxed">{item.feedback}</p>
            </div>
          ))}
        </div>

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
        <div className="flex items-center gap-2">
          <button
            onClick={() => (scenarioIndex === 0 ? setPhase('intro') : setScenarioIndex((i) => i - 1))}
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            <ChevronLeft className="w-4 h-4 text-gray-300" />
          </button>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-white">{data.meta.title}</h3>
          </div>
        </div>

        <QuizProgressBar
          current={scenarioIndex}
          total={totalScenarios}
          accentColor={ACCENT_COLOR}
        />

        {/* 게임 HUD: HP + 던전 층 + 콤보 */}
        <div
          className="rounded-xl p-2.5 flex items-center gap-3"
          style={{
            background: 'linear-gradient(135deg, rgba(15,23,42,0.85), rgba(30,41,59,0.6))',
            border: '1px solid rgba(251,191,36,0.25)',
          }}
        >
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-base">🏰</span>
            <span className="text-[11px] font-bold text-amber-200">{scenarioIndex + 1}층</span>
          </div>
          <div className="flex-1 flex items-center gap-1.5 min-w-0">
            <Heart
              className="w-3.5 h-3.5 flex-shrink-0"
              style={{ color: hp > 50 ? '#fb7185' : hp > 20 ? '#facc15' : '#f87171' }}
              fill="currentColor"
            />
            <div className="relative flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.5)' }}>
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                animate={{ width: `${hp}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                style={{
                  background: hp > 50
                    ? 'linear-gradient(90deg, #34d399, #10b981)'
                    : hp > 20
                      ? 'linear-gradient(90deg, #facc15, #f59e0b)'
                      : 'linear-gradient(90deg, #f87171, #dc2626)',
                  boxShadow: '0 0 8px rgba(255,255,255,0.2)',
                }}
              />
            </div>
            <span className="text-[10px] font-mono font-bold text-gray-200 tabular-nums w-10 text-right">{hp}/100</span>
          </div>
          {streak >= 2 ? (
            <motion.div
              key={streak}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-0.5 flex-shrink-0 px-1.5 py-0.5 rounded-md"
              style={{ background: 'rgba(244,114,182,0.2)', border: '1px solid rgba(244,114,182,0.4)' }}
            >
              <span className="text-[10px]">🔥</span>
              <span className="text-[10px] font-bold text-pink-200">{streak} 콤보</span>
            </motion.div>
          ) : null}
        </div>

        {/* 시나리오 카드 */}
        <div
          className="relative p-5 rounded-2xl overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${ACCENT_COLOR}12 0%, rgba(255,255,255,0.03) 100%)`,
            border: `1px solid ${ACCENT_COLOR}25`,
          }}
        >
          <div
            className="absolute -top-3 -right-3 w-16 h-16 rounded-full blur-xl pointer-events-none"
            style={{ backgroundColor: `${ACCENT_COLOR}15` }}
          />
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">{currentScenario.emoji}</span>
            <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: ACCENT_COLOR }}>
              {currentScenario.situation}
            </span>
          </div>
          {currentScenario.context && (
            <p className="relative z-10 text-[12px] text-gray-400 leading-relaxed mb-2">
              {currentScenario.context}
            </p>
          )}
          <p className="relative z-10 text-[15px] font-bold leading-relaxed text-white">
            {currentScenario.question}
          </p>
        </div>

        {currentScenario.coachTip ? (
          <div
            className="rounded-xl px-3 py-2 flex items-start gap-2"
            style={{
              background: `${ACCENT_COLOR}10`,
              border: `1px dashed ${ACCENT_COLOR}40`,
            }}
          >
            <span className="text-[11px] font-bold flex-shrink-0 mt-0.5" style={{ color: ACCENT_COLOR }}>
              코치 팁
            </span>
            <p className="text-[12px] text-gray-200 leading-relaxed">{currentScenario.coachTip}</p>
          </div>
        ) : null}

        {/* 선택지 */}
        <div className="flex flex-col gap-2.5 relative">
          {currentScenario.choices.map((choice, idx) => (
            <QuizChoiceButton
              key={idx}
              index={idx}
              text={choice.text}
              selected={selectedIdx === idx}
              disabled={pendingFeedback !== null}
              accentColor={ACCENT_COLOR}
              onSelect={() => handleChoiceSelect(choice, idx)}
              prefixEmoji={scoreToEmoji(choice.mentalScore)}
              trailingBadge={{
                label: choice.mentalScore >= 0 ? `+${choice.mentalScore} HP` : `${choice.mentalScore * 8} HP`,
                color: scoreToBadgeColor(choice.mentalScore),
              }}
            />
          ))}

          <AnimatePresence>
            {scorePop ? (
              <motion.div
                key={scorePop.id}
                initial={{ y: 0, opacity: 0, scale: 0.6 }}
                animate={{ y: -60, opacity: 1, scale: 1.4 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-black"
                style={{
                  color: scoreToBadgeColor(scorePop.value),
                  textShadow: '0 0 16px rgba(0,0,0,0.7)',
                }}
              >
                {scorePop.value >= 0 ? `+${scorePop.value}` : scorePop.value} {scoreToEmoji(scorePop.value)}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      {/* 하단 게임형 피드백 시트 */}
      {pendingFeedback ? (
        <RichMentalFeedbackSheet
          pending={pendingFeedback}
          onNext={handleFeedbackNext}
        />
      ) : null}

      <style jsx global>{`
        @keyframes choice-enter {
          from { transform: translateX(-12px); opacity: 0; }
          to   { transform: translateX(0);     opacity: 1; }
        }
      `}</style>
    </>
  );
}

type RichMentalFeedbackSheetProps = {
  readonly pending: PendingFeedback;
  readonly onNext: () => void;
};

function RichMentalFeedbackSheet({ pending, onNext }: RichMentalFeedbackSheetProps) {
  const accent = scoreToBadgeColor(pending.score);
  const scenarioInsight = pending.scenario.realWorldInsight;
  const immediate = pending.scenario.recoveryStrategy?.immediate;
  const bossInsight = pending.scenario.bossInsight;

  return (
    <div
      data-quiz-feedback-sheet=""
      className="fixed inset-0 flex items-end justify-center p-3"
      style={{
        zIndex: 99999,
        backgroundColor: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(6px)',
      }}
    >
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 22, stiffness: 260 }}
        className="w-full max-w-[440px] rounded-3xl p-5 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, #0f172a 0%, ${accent}22 100%)`,
          border: `1.5px solid ${accent}66`,
          boxShadow: `0 0 40px ${accent}33`,
        }}
      >
        <div
          className="absolute -top-10 -right-10 w-36 h-36 rounded-full blur-3xl pointer-events-none"
          style={{ backgroundColor: `${accent}33` }}
        />

        <div className="relative space-y-3">
          {/* 결과 배너: 이모지 + 점수 */}
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0.5, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
              style={{ background: `${accent}26`, border: `1px solid ${accent}66` }}
            >
              {scoreToEmoji(pending.score)}
            </motion.div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: accent }}>
                {pending.scenario.situation} · 결과 분석
              </p>
              <p className="text-base font-black text-white mt-0.5">
                {pending.score >= 2 ? '훌륭한 선택!' : pending.score >= 0 ? '괜찮은 선택' : '주의가 필요한 선택'}
              </p>
              {pending.gainEffect ? (
                <p className="text-[12px] font-bold mt-0.5" style={{ color: accent }}>
                  {pending.gainEffect}
                </p>
              ) : null}
            </div>
            <CheckCircle2 className="w-5 h-5 self-start" style={{ color: accent }} />
          </div>

          {/* 한 줄 평가 */}
          <div
            className="rounded-xl px-3 py-2.5"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <p className="text-[13px] text-white leading-relaxed">{pending.feedback}</p>
          </div>

          {/* 실전 액션 */}
          {pending.realAction ? (
            <div
              className="rounded-xl px-3 py-2.5 flex items-start gap-2"
              style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)' }}
            >
              <Target className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-300" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 mb-0.5">
                  오늘 바로 할 일
                </p>
                <p className="text-[12px] text-emerald-100 leading-relaxed">{pending.realAction}</p>
              </div>
            </div>
          ) : null}

          {/* 즉시 회복 전략 */}
          {immediate ? (
            <div
              className="rounded-xl px-3 py-2.5 flex items-start gap-2"
              style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)' }}
            >
              <BookOpen className="w-4 h-4 flex-shrink-0 mt-0.5 text-purple-300" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-purple-300 mb-0.5">
                  즉시 회복 전략
                </p>
                <p className="text-[12px] text-purple-100 leading-relaxed">{immediate}</p>
              </div>
            </div>
          ) : null}

          {/* 보스 인사이트 */}
          {bossInsight ? (
            <div
              className="rounded-xl px-3 py-2.5 flex items-start gap-2"
              style={{ background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.3)' }}
            >
              <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-300" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-300 mb-0.5">
                  보스의 한 마디
                </p>
                <p className="text-[12px] text-blue-100 leading-relaxed">{bossInsight}</p>
              </div>
            </div>
          ) : null}

          {/* 데이터 인사이트 */}
          {scenarioInsight ? (
            <p className="text-[11px] text-gray-400 italic px-1">📊 {scenarioInsight}</p>
          ) : null}

          <button
            onClick={onNext}
            className="w-full h-12 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-transform active:scale-95"
            style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
          >
            {pending.isLast ? (
              <>
                결과 보기 🏆
                <Sparkles className="w-4 h-4" />
              </>
            ) : (
              <>
                다음 던전 입장
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
