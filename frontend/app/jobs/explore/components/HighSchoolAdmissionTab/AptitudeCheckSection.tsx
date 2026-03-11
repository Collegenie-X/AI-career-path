'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Target } from 'lucide-react';
import type { HighSchoolAdmissionV2Data, HighSchoolCategory } from '../../types';

type AptitudeCheckSectionProps = {
  data: HighSchoolAdmissionV2Data['aptitudeCheckList'];
  categories: HighSchoolCategory[];
  onBack: () => void;
  onSelectCategory: (category: HighSchoolCategory) => void;
};

type AptitudeState =
  | { phase: 'intro' }
  | { phase: 'question'; questionIndex: number }
  | { phase: 'result'; categoryId: string | null };

export function AptitudeCheckSection({ data, categories, onBack, onSelectCategory }: AptitudeCheckSectionProps) {
  const [state, setState] = useState<AptitudeState>({ phase: 'intro' });

  const handleStart = () => {
    setState({ phase: 'question', questionIndex: 0 });
  };

  const handleAnswer = (answer: 'yes' | 'no') => {
    if (state.phase !== 'question') return;

    const question = data.questions[state.questionIndex];
    const nextId = answer === 'yes' ? question.yes : question.no;

    if (nextId === null) {
      const nextIndex = state.questionIndex + 1;
      if (nextIndex < data.questions.length) {
        setState({ phase: 'question', questionIndex: nextIndex });
      } else {
        setState({ phase: 'result', categoryId: null });
      }
    } else {
      const categoryExists = categories.some((c) => c.id === nextId);
      if (categoryExists) {
        setState({ phase: 'result', categoryId: nextId });
      } else {
        const nextIndex = state.questionIndex + 1;
        if (nextIndex < data.questions.length) {
          setState({ phase: 'question', questionIndex: nextIndex });
        } else {
          setState({ phase: 'result', categoryId: nextId });
        }
      }
    }
  };

  const handleReset = () => {
    setState({ phase: 'intro' });
  };

  const resultCategory = state.phase === 'result' && state.categoryId
    ? categories.find((c) => c.id === state.categoryId)
    : null;

  return (
    <div className="space-y-3">
      {/* 헤더 */}
      <div className="flex items-center gap-2">
        <button
          onClick={state.phase === 'intro' ? onBack : () => setState({ phase: 'intro' })}
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        >
          <ChevronLeft className="w-4 h-4 text-gray-300" />
        </button>
        <div>
          <h3 className="text-sm font-bold text-white">{data.title}</h3>
          <p className="text-[11px] text-gray-400">{data.description}</p>
        </div>
      </div>

      {/* 인트로 (게임 도전 느낌) */}
      {state.phase === 'intro' && (
        <div className="space-y-3">
          <div
            className="rounded-2xl p-5 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(32,201,151,0.2) 0%, rgba(132,94,247,0.1) 100%)',
              border: '1px solid rgba(32,201,151,0.3)',
            }}
          >
            <div className="text-4xl mb-2">🧠</div>
            <p className="text-sm font-bold text-white mb-1">적성 체크 도전</p>
            <p className="text-[11px] text-gray-300 leading-relaxed mb-4">{data.description}</p>
            <p className="text-[10px] text-gray-400">7문제를 풀면 나에게 맞는 학교 유형을 찾아줘요!</p>
          </div>

          <button
            onClick={handleStart}
            className="w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
              border: '1px solid rgba(16,185,129,0.5)',
              color: 'white',
              boxShadow: '0 4px 14px rgba(16,185,129,0.2)',
            }}
          >
            <Target className="w-4 h-4" />
            도전 시작
          </button>
        </div>
      )}

      {/* 질문 단계 */}
      {state.phase === 'question' && (
        <div className="space-y-3">
          {/* 진행 바 */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${((state.questionIndex + 1) / data.questions.length) * 100}%`,
                  background: 'linear-gradient(90deg, #845ef7, #20c997)',
                }}
              />
            </div>
            <span className="text-[10px] text-gray-400 flex-shrink-0">
              {state.questionIndex + 1} / {data.questions.length}
            </span>
          </div>

          {/* 질문 카드 (게임 느낌) */}
          <div
            className="rounded-2xl p-5 text-center transition-all"
            style={{
              background: 'linear-gradient(135deg, rgba(132,94,247,0.15) 0%, rgba(32,201,151,0.1) 100%)',
              border: '1px solid rgba(132,94,247,0.3)',
              boxShadow: '0 0 20px rgba(132,94,247,0.1)',
            }}
          >
            <div className="text-3xl mb-3 animate-pulse">🤔</div>
            <p className="text-sm font-bold text-white leading-relaxed">
              {data.questions[state.questionIndex].question}
            </p>
          </div>

          {/* 예/아니오 버튼 (게임 선택 느낌) */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleAnswer('yes')}
              className="py-3 rounded-2xl text-sm font-bold transition-all active:scale-[0.96] hover:opacity-90"
              style={{
                background: 'rgba(16,185,129,0.15)',
                border: '1px solid rgba(16,185,129,0.4)',
                color: '#10b981',
              }}
            >
              ✅ 예
            </button>
            <button
              onClick={() => handleAnswer('no')}
              className="py-3 rounded-2xl text-sm font-bold transition-all active:scale-[0.96] hover:opacity-90"
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: '#f87171',
              }}
            >
              ❌ 아니오
            </button>
          </div>
        </div>
      )}

      {/* 결과 단계 */}
      {state.phase === 'result' && (
        <div className="space-y-3">
          {resultCategory ? (
            <>
              <div
                className="rounded-2xl p-4 text-center"
                style={{
                  background: resultCategory.bgColor,
                  border: `1px solid ${resultCategory.color}50`,
                }}
              >
                <div className="text-4xl mb-2">{resultCategory.emoji}</div>
                <p className="text-[11px] text-gray-400 mb-1">추천 학교 유형</p>
                <h3 className="text-base font-bold text-white mb-1">{resultCategory.name}</h3>
                <p className="text-[12px] text-gray-300 leading-relaxed">{resultCategory.description}</p>
              </div>

              {/* 특성 미리보기 */}
              <div
                className="rounded-2xl p-3 space-y-2"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <p className="text-[11px] font-bold text-gray-400">이 유형의 핵심 특성</p>
                <p className="text-[12px] text-gray-200 leading-relaxed">{resultCategory.categoryTraits.aptitude}</p>
                <p className="text-[11px] text-gray-400 leading-relaxed">{resultCategory.categoryTraits.identity}</p>
              </div>

              <button
                onClick={() => onSelectCategory(resultCategory)}
                className="w-full py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                style={{
                  background: resultCategory.bgColor,
                  border: `1px solid ${resultCategory.color}`,
                  color: resultCategory.color,
                }}
              >
                {resultCategory.name} 학교 탐방하기
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div
              className="rounded-2xl p-4 text-center"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div className="text-3xl mb-2">🌟</div>
              <p className="text-sm font-bold text-white mb-1">다양한 유형이 맞을 수 있어요</p>
              <p className="text-[11px] text-gray-400">행성 지도에서 직접 탐방해보세요!</p>
            </div>
          )}

          <button
            onClick={handleReset}
            className="w-full py-2.5 rounded-2xl text-[12px] font-semibold flex items-center justify-center gap-2 transition-all"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#9ca3af' }}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            다시 시작
          </button>
        </div>
      )}
    </div>
  );
}
