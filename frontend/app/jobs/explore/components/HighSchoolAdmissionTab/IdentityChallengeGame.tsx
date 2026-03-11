'use client';

import { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import type { HighSchoolCategory } from '../../types';
import type { IdentityChallengeData } from '../../types';

type IdentityChallengeGameProps = {
  data: IdentityChallengeData;
  categories: HighSchoolCategory[];
  onBack: () => void;
  onSelectCategory: (category: HighSchoolCategory) => void;
};

type GamePhase = 'intro' | 'question' | 'result';

export function IdentityChallengeGame({
  data,
  categories,
  onBack,
  onSelectCategory,
}: IdentityChallengeGameProps) {
  const [phase, setPhase] = useState<GamePhase>('intro');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});

  const currentQuestion = data.questions[questionIndex];
  const totalQuestions = data.questions.length;

  const handleChoiceSelect = useCallback(
    (choice: IdentityChallengeData['questions'][0]['choices'][0]) => {
      const newScores = { ...scores };
      Object.entries(choice.categoryScores).forEach(([catId, points]) => {
        newScores[catId] = (newScores[catId] ?? 0) + points;
      });
      setScores(newScores);

      if (questionIndex + 1 < totalQuestions) {
        setQuestionIndex((i) => i + 1);
      } else {
        setPhase('result');
      }
    },
    [questionIndex, scores, totalQuestions]
  );

  const handleReset = useCallback(() => {
    setPhase('intro');
    setQuestionIndex(0);
    setScores({});
  }, []);

  const getTopCategories = useCallback((): HighSchoolCategory[] => {
    const categoryIds = Object.keys(scores).filter((id) => scores[id] > 0);
    if (categoryIds.length === 0) return [];

    const sorted = categoryIds.sort((a, b) => (scores[b] ?? 0) - (scores[a] ?? 0));
    const topScore = scores[sorted[0]] ?? 0;
    const threshold = Math.max(1, topScore - 2);

    return sorted
      .filter((id) => (scores[id] ?? 0) >= threshold)
      .slice(0, 2)
      .map((id) => categories.find((c) => c.id === id))
      .filter((c): c is HighSchoolCategory => c != null);
  }, [scores, categories]);

  const topCategories = phase === 'result' ? getTopCategories() : [];

  return (
    <div className="space-y-3">
      {/* 헤더 */}
      <div className="flex items-center gap-2">
        <button
          onClick={phase === 'intro' ? onBack : phase === 'question' ? () => setPhase('intro') : handleReset}
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
              background: 'linear-gradient(135deg, rgba(132,94,247,0.2) 0%, rgba(251,191,36,0.1) 100%)',
              border: '1px solid rgba(132,94,247,0.3)',
            }}
          >
            <div className="text-4xl mb-2">🌟</div>
            <p className="text-sm font-bold text-white mb-1">{data.meta.title}</p>
            <p className="text-[11px] text-gray-300 leading-relaxed mb-4">{data.meta.description}</p>
            <p className="text-[10px] text-gray-400">{data.meta.totalQuestions}문제 완료 시 나에게 맞는 학교 유형·대학 루트를 찾아줘요!</p>
          </div>

          <button
            onClick={() => setPhase('question')}
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
      )}

      {/* 질문 */}
      {phase === 'question' && currentQuestion && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${((questionIndex + 1) / totalQuestions) * 100}%`,
                  background: 'linear-gradient(90deg, #845ef7, #fbbf24)',
                }}
              />
            </div>
            <span className="text-[10px] text-gray-400 flex-shrink-0">
              {questionIndex + 1} / {totalQuestions}
            </span>
          </div>

          {/* 당위성·배경 (왜 이 질문이 필요한지) */}
          {currentQuestion.context && (
            <div
              className="rounded-xl p-3"
              style={{
                background: 'rgba(132,94,247,0.08)',
                border: '1px solid rgba(132,94,247,0.2)',
              }}
            >
              <p className="text-[11px] text-purple-200 leading-relaxed">💡 {currentQuestion.context}</p>
            </div>
          )}

          <div
            className="rounded-2xl p-4"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(132,94,247,0.3)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{currentQuestion.themeIcon}</span>
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                {currentQuestion.theme}
              </span>
            </div>
            <p className="text-sm font-bold text-white leading-relaxed">{currentQuestion.question}</p>
          </div>

          <div className="space-y-2">
            {currentQuestion.choices.map((choice, idx) => (
              <button
                key={idx}
                onClick={() => handleChoiceSelect(choice)}
                className="w-full py-3 px-4 rounded-xl text-left transition-all active:scale-[0.98]"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#e5e7eb',
                }}
              >
                <p className="text-[13px] font-medium">{choice.text}</p>
                {choice.hint && (
                  <p className="text-[10px] text-gray-500 mt-1">{choice.hint}</p>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 결과 */}
      {phase === 'result' && (
        <div className="space-y-3">
          <div
            className="rounded-2xl p-4 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(251,191,36,0.15) 0%, rgba(132,94,247,0.1) 100%)',
              border: '1px solid rgba(251,191,36,0.3)',
            }}
          >
            <div className="text-4xl mb-2">✨</div>
            <p className="text-sm font-bold text-white mb-1">적성 발견!</p>
            <p className="text-[11px] text-gray-300">
              {topCategories.length === 0
                ? data.resultMessages.neutral
                : topCategories.length === 1
                  ? data.resultMessages.single
                  : data.resultMessages.multiple}
            </p>
          </div>

          {topCategories.length > 0 ? (
            topCategories.map((cat) => (
              <div
                key={cat.id}
                className="rounded-2xl p-4"
                style={{
                  background: cat.bgColor,
                  border: `1px solid ${cat.color}50`,
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{cat.emoji}</span>
                  <div>
                    <p className="text-[11px] text-gray-400">추천 학교 유형</p>
                    <p className="text-sm font-bold text-white">{cat.name}</p>
                  </div>
                </div>
                <p className="text-[11px] text-gray-300 leading-relaxed mb-3">{cat.description}</p>
                <button
                  onClick={() => onSelectCategory(cat)}
                  className="w-full py-2.5 rounded-xl text-[12px] font-medium flex items-center justify-center gap-2"
                  style={{
                    background: cat.bgColor,
                    border: `1px solid ${cat.color}`,
                    color: cat.color,
                  }}
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
