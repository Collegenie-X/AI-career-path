'use client';

import { useState } from 'react';
import { ArrowRight, RotateCcw } from 'lucide-react';
import type { DecisionFlowQuestion, HighSchoolType } from '../../types';
import { HIGH_SCHOOL_LABELS } from '../../config';

type DecisionFlowCardProps = {
  questions: DecisionFlowQuestion[];
  schoolTypes: HighSchoolType[];
  onSelectSchool: (schoolId: string) => void;
};

export function DecisionFlowCard({ questions, schoolTypes, onSelectSchool }: DecisionFlowCardProps) {
  const [currentQuestionId, setCurrentQuestionId] = useState<string>('q1');
  const [resultSchoolId, setResultSchoolId] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  const currentQuestion = questions.find((q) => q.id === currentQuestionId);

  const handleAnswer = (answer: 'yes' | 'no') => {
    if (!currentQuestion) return;
    const next = answer === 'yes' ? currentQuestion.yes : currentQuestion.no;

    setHistory((prev) => [...prev, currentQuestionId]);

    if (next.startsWith('q')) {
      setCurrentQuestionId(next);
    } else {
      setResultSchoolId(next);
    }
  };

  const handleReset = () => {
    setCurrentQuestionId('q1');
    setResultSchoolId(null);
    setHistory([]);
  };

  const resultSchool = resultSchoolId
    ? schoolTypes.find((s) => s.id === resultSchoolId)
    : null;

  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white">{HIGH_SCHOOL_LABELS.decision_flow_title}</h3>
        {(history.length > 0 || resultSchoolId) && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-[12px] text-gray-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            {HIGH_SCHOOL_LABELS.decision_flow_reset}
          </button>
        )}
      </div>

      {/* Progress dots */}
      <div className="flex gap-1 mb-3">
        {questions.map((q, i) => (
          <div
            key={q.id}
            className="h-1 rounded-full flex-1 transition-all duration-300"
            style={{
              background: history.includes(q.id) || q.id === currentQuestionId
                ? '#845ef7'
                : 'rgba(255,255,255,0.1)',
            }}
          />
        ))}
      </div>

      {!resultSchoolId && currentQuestion ? (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-white text-center py-2">
            {currentQuestion.question}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleAnswer('yes')}
              className="py-2.5 rounded-xl text-sm font-bold text-white transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg, #20c997, #12b886)' }}
            >
              ✅ {HIGH_SCHOOL_LABELS.decision_flow_yes}
            </button>
            <button
              onClick={() => handleAnswer('no')}
              className="py-2.5 rounded-xl text-sm font-bold text-white transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg, #f03e3e, #c92a2a)' }}
            >
              ❌ {HIGH_SCHOOL_LABELS.decision_flow_no}
            </button>
          </div>
        </div>
      ) : resultSchool ? (
        <div className="space-y-3">
          <div
            className="p-3 rounded-xl text-center"
            style={{ background: resultSchool.bgColor, border: `1px solid ${resultSchool.color}40` }}
          >
            <div className="text-3xl mb-1">{resultSchool.emoji}</div>
            <p className="text-xs text-gray-400 mb-0.5">{HIGH_SCHOOL_LABELS.decision_flow_result}</p>
            <p className="text-base font-bold" style={{ color: resultSchool.color }}>
              {resultSchool.name}
            </p>
            <p className="text-[12px] text-gray-300 mt-1">{resultSchool.admissionTip}</p>
          </div>
          <button
            onClick={() => onSelectSchool(resultSchool.id)}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-95"
            style={{ background: `linear-gradient(135deg, ${resultSchool.color}, ${resultSchool.color}cc)` }}
          >
            {HIGH_SCHOOL_LABELS.decision_flow_view_detail}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
