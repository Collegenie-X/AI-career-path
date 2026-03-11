'use client';

import { useState, useCallback } from 'react';
import { ChevronLeft, Sparkles, ChevronRight } from 'lucide-react';
import type { HighSchoolCategory, IdentityChallengeData, IdentityChallengeChoice } from '../../types';
import { QuizProgressBar, QuizChoiceButton, QuizFeedbackSheet } from '../shared';

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
            <p className="text-[11px] text-gray-400">{data.meta.subtitle}</p>
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
          <p className="text-[11px] text-gray-300 leading-relaxed mb-3">{data.meta.description}</p>
          <div className="grid grid-cols-3 gap-1.5">
            {data.questions.map((q) => (
              <span
                key={q.id}
                className="text-[9px] py-1 px-1.5 rounded-md text-center"
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
            <p className="text-[11px] text-gray-400">{data.resultMessages.multiple}</p>
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
                  <p className="text-[10px] text-gray-400">
                    {rank === 0 ? '🥇 1순위 추천' : rank === 1 ? '🥈 2순위 추천' : '🥉 3순위 추천'}
                  </p>
                  <p className="text-sm font-bold text-white">{cat.name}</p>
                </div>
              </div>
              <p className="text-[11px] text-gray-300 leading-relaxed mb-3">{cat.description}</p>
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
                  className="text-[9px] font-bold flex-shrink-0 mt-0.5 px-1.5 py-0.5 rounded"
                  style={{
                    background: `${getThemeColor(item.theme)}18`,
                    color: getThemeColor(item.theme),
                    minWidth: '52px',
                    textAlign: 'center',
                  }}
                >
                  {item.theme}
                </span>
                <p className="text-[10px] text-gray-400 leading-relaxed">{item.feedback}</p>
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

        {/* 배경·당위성 */}
        <div
          className="rounded-xl p-3"
          style={{
            background: `${accentColor}10`,
            border: `1px solid ${accentColor}25`,
          }}
        >
          <p className="text-[11px] leading-relaxed" style={{ color: `${accentColor}cc` }}>
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
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: accentColor }}>
              {currentQuestion.theme}
            </span>
          </div>
          <p className="relative z-10 text-[15px] font-bold leading-relaxed text-white">
            {currentQuestion.question}
          </p>
        </div>

        {/* 선택지 */}
        <div className="flex flex-col gap-2.5">
          {currentQuestion.choices.map((choice, idx) => (
            <QuizChoiceButton
              key={idx}
              index={idx}
              text={choice.text}
              hint={choice.hint}
              selected={selectedIdx === idx}
              disabled={pendingFeedback !== null}
              accentColor={accentColor}
              onSelect={() => handleChoiceSelect(choice, idx)}
            />
          ))}
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
