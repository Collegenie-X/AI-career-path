'use client';

import { useState, useCallback } from 'react';
import { ChevronLeft, Zap } from 'lucide-react';
import type { MentalChallengeData } from '../../types';

type MentalChallengeGameProps = {
  data: MentalChallengeData;
  onBack: () => void;
};

type GamePhase = 'intro' | 'scenario' | 'result';

export function MentalChallengeGame({ data, onBack }: MentalChallengeGameProps) {
  const [phase, setPhase] = useState<GamePhase>('intro');
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [feedbackHistory, setFeedbackHistory] = useState<{ feedback: string; score: number }[]>([]);

  const currentScenario = data.scenarios[scenarioIndex];
  const totalScenarios = data.scenarios.length;

  const handleChoiceSelect = useCallback(
    (choice: MentalChallengeData['scenarios'][0]['choices'][0]) => {
      setTotalScore((s) => s + choice.mentalScore);
      setFeedbackHistory((h) => [...h, { feedback: choice.feedback, score: choice.mentalScore }]);

      if (scenarioIndex + 1 < totalScenarios) {
        setScenarioIndex((i) => i + 1);
      } else {
        setPhase('result');
      }
    },
    [scenarioIndex, totalScenarios]
  );

  const handleReset = useCallback(() => {
    setPhase('intro');
    setScenarioIndex(0);
    setTotalScore(0);
    setFeedbackHistory([]);
  }, []);

  const getResultTier = useCallback(() => {
    const sorted = [...data.resultTiers].sort((a, b) => b.minScore - a.minScore);
    return sorted.find((t) => totalScore >= t.minScore) ?? sorted[sorted.length - 1];
  }, [data.resultTiers, totalScore]);

  const resultTier = phase === 'result' ? getResultTier() : null;

  return (
    <div className="space-y-3">
      {/* 헤더 */}
      <div className="flex items-center gap-2">
        <button
          onClick={
            phase === 'intro' ? onBack : phase === 'scenario' ? () => setPhase('intro') : handleReset
          }
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

      {/* 인트로 */}
      {phase === 'intro' && (
        <div className="space-y-3">
          <div
            className="rounded-2xl p-5 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(251,191,36,0.15) 0%, rgba(132,94,247,0.1) 100%)',
              border: '1px solid rgba(251,191,36,0.3)',
            }}
          >
            <div className="text-4xl mb-2">💪</div>
            <p className="text-sm font-bold text-white mb-1">멘탈 도전</p>
            <p className="text-[11px] text-gray-300 leading-relaxed mb-4">{data.meta.description}</p>
            <p className="text-[10px] text-gray-400">5가지 시나리오로 멘탈 강도를 체험해보세요!</p>
          </div>

          <button
            onClick={() => setPhase('scenario')}
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
      )}

      {/* 시나리오 */}
      {phase === 'scenario' && currentScenario && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${((scenarioIndex + 1) / totalScenarios) * 100}%`,
                  background: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                }}
              />
            </div>
            <span className="text-[10px] text-gray-400 flex-shrink-0">
              {scenarioIndex + 1} / {totalScenarios}
            </span>
          </div>

          <div
            className="rounded-2xl p-4"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(251,191,36,0.3)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{currentScenario.emoji}</span>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                {currentScenario.situation}
              </span>
            </div>
            <p className="text-sm font-bold text-white leading-relaxed">{currentScenario.question}</p>
          </div>

          <div className="space-y-2">
            {currentScenario.choices.map((choice, idx) => (
              <button
                key={idx}
                onClick={() => handleChoiceSelect(choice)}
                className="w-full py-3 px-4 rounded-xl text-left text-[13px] font-medium transition-all active:scale-[0.98]"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#e5e7eb',
                }}
              >
                {choice.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 결과 */}
      {phase === 'result' && resultTier && (
        <div className="space-y-3">
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
            <p className="text-[11px] font-bold text-gray-400">선택별 피드백</p>
            {feedbackHistory.map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <span
                  className="text-[10px] flex-shrink-0 mt-0.5"
                  style={{ color: item.score >= 0 ? '#34d399' : '#f87171' }}
                >
                  {item.score >= 0 ? '+' : ''}{item.score}
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
      )}
    </div>
  );
}
