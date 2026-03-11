'use client';

import { useState, useCallback } from 'react';
import { ChevronLeft, Zap } from 'lucide-react';
import type { MentalChallengeData, MentalChallengeChoice } from '../../types';
import { QuizProgressBar, QuizChoiceButton, QuizFeedbackSheet } from '../shared';

const ACCENT_COLOR = '#f59e0b';

type MentalChallengeGameProps = {
  data: MentalChallengeData;
  onBack: () => void;
};

type GamePhase = 'intro' | 'playing' | 'result';

type PendingFeedback = {
  feedback: string;
  score: number;
  isLast: boolean;
};

export function MentalChallengeGame({ data, onBack }: MentalChallengeGameProps) {
  const [phase, setPhase] = useState<GamePhase>('intro');
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [totalScore, setTotalScore] = useState(0);
  const [feedbackHistory, setFeedbackHistory] = useState<{ feedback: string; score: number }[]>([]);
  const [pendingFeedback, setPendingFeedback] = useState<PendingFeedback | null>(null);

  const totalScenarios = data.scenarios.length;
  const currentScenario = data.scenarios[scenarioIndex];

  const handleChoiceSelect = useCallback(
    (choice: MentalChallengeChoice, idx: number) => {
      if (pendingFeedback || selectedIdx !== null) return;

      setSelectedIdx(idx);
      setTotalScore((s) => s + choice.mentalScore);
      setFeedbackHistory((h) => [...h, { feedback: choice.feedback, score: choice.mentalScore }]);

      const isLast = scenarioIndex === totalScenarios - 1;
      setPendingFeedback({ feedback: choice.feedback, score: choice.mentalScore, isLast });
    },
    [pendingFeedback, selectedIdx, scenarioIndex, totalScenarios]
  );

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
            <p className="text-[11px] text-gray-400">{data.meta.subtitle}</p>
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
          <p className="text-[11px] text-gray-300 leading-relaxed mb-3">{data.meta.description}</p>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {data.scenarios.map((s) => (
              <span
                key={s.id}
                className="text-[9px] py-1 px-2 rounded-full"
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

        <div
          className="rounded-2xl p-5 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(251,191,36,0.2) 0%, rgba(132,94,247,0.1) 100%)',
            border: '1px solid rgba(251,191,36,0.4)',
          }}
        >
          <div className="text-4xl mb-2">{resultTier.emoji}</div>
          <p className="text-sm font-bold text-white mb-1">{resultTier.label}</p>
          <p className="text-[11px] text-gray-300 leading-relaxed">{resultTier.message}</p>
        </div>

        <div
          className="rounded-2xl p-3 space-y-2"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <p className="text-[11px] font-bold text-gray-400">📝 선택별 피드백</p>
          {feedbackHistory.map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <span
                className="text-[10px] font-bold flex-shrink-0 mt-0.5 w-6 text-center"
                style={{ color: item.score >= 0 ? '#34d399' : '#f87171' }}
              >
                {item.score >= 0 ? `+${item.score}` : item.score}
              </span>
              <p className="text-[11px] text-gray-300 leading-relaxed">{item.feedback}</p>
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
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: ACCENT_COLOR }}>
              {currentScenario.situation}
            </span>
          </div>
          {currentScenario.context && (
            <p className="relative z-10 text-[11px] text-gray-400 leading-relaxed mb-2">
              {currentScenario.context}
            </p>
          )}
          <p className="relative z-10 text-[15px] font-bold leading-relaxed text-white">
            {currentScenario.question}
          </p>
        </div>

        {/* 선택지 */}
        <div className="flex flex-col gap-2.5">
          {currentScenario.choices.map((choice, idx) => (
            <QuizChoiceButton
              key={idx}
              index={idx}
              text={choice.text}
              selected={selectedIdx === idx}
              disabled={pendingFeedback !== null}
              accentColor={ACCENT_COLOR}
              onSelect={() => handleChoiceSelect(choice, idx)}
            />
          ))}
        </div>
      </div>

      {/* 하단 피드백 시트 */}
      {pendingFeedback && (
        <QuizFeedbackSheet
          theme={currentScenario.situation}
          themeIcon={currentScenario.emoji}
          feedback={pendingFeedback.feedback}
          isLast={pendingFeedback.isLast}
          accentColor={ACCENT_COLOR}
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
