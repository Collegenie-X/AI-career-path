'use client';

import { useState, useMemo, useCallback } from 'react';
import { Briefcase, Zap, Target, Sparkles, RotateCcw } from 'lucide-react';
import { LABELS } from '../../config';
import type { WorkPhase } from '../../types';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type QuizQuestionType = 'tool' | 'skill' | 'purpose';

interface ProcessQuizGameProps {
  phases: WorkPhase[];
  starColor: string;
  jobName: string;
  onViewFull?: () => void;
}

function generateOptions(
  phase: WorkPhase,
  allPhases: WorkPhase[],
  type: QuizQuestionType
): { value: string; isCorrect: boolean }[] {
  if (type === 'tool') {
    const correct = phase.tools?.[0] ?? '';
    const others = allPhases
      .filter((p) => p.id !== phase.id)
      .flatMap((p) => p.tools ?? [])
      .filter((t) => t !== correct);
    const unique = Array.from(new Set(others));
    const distractors = shuffle(unique).slice(0, 3);
    return shuffle([{ value: correct, isCorrect: true }, ...distractors.map((d) => ({ value: d, isCorrect: false }))]);
  }
  if (type === 'skill') {
    const correct = phase.skills?.[0] ?? '';
    const others = allPhases.flatMap((p) => p.skills ?? []).filter((s) => s !== correct);
    const unique = Array.from(new Set(others));
    const distractors = shuffle(unique).slice(0, 3);
    return shuffle([{ value: correct, isCorrect: true }, ...distractors.map((d) => ({ value: d, isCorrect: false }))]);
  }
  // purpose: correct = phase.description, distractors from other phases
  const correct = phase.description;
  const others = allPhases.filter((p) => p.id !== phase.id).map((p) => p.description);
  const distractors = shuffle(others).slice(0, 3);
  return shuffle([{ value: correct, isCorrect: true }, ...distractors.map((d) => ({ value: d, isCorrect: false }))]);
}

function getQuestionLabel(type: QuizQuestionType): string {
  if (type === 'tool') return LABELS.process_quiz_question_tool;
  if (type === 'skill') return LABELS.process_quiz_question_skill;
  return LABELS.process_quiz_question_purpose;
}

function getQuestionIcon(type: QuizQuestionType) {
  if (type === 'tool') return <Briefcase className="w-5 h-5" />;
  if (type === 'skill') return <Zap className="w-5 h-5" />;
  return <Target className="w-5 h-5" />;
}

export function ProcessQuizGame({ phases, starColor, jobName, onViewFull }: ProcessQuizGameProps) {
  const [step, setStep] = useState<'welcome' | 'quiz' | 'result' | 'complete'>('welcome');
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);

  const phase = phases[phaseIndex];
  const { options, questionType } = useMemo(() => {
    const preferred: QuizQuestionType = ['tool', 'skill', 'purpose'][phaseIndex % 3] as QuizQuestionType;
    if (!phase) return { options: [], questionType: preferred };
    const types: QuizQuestionType[] = [preferred, 'tool', 'skill', 'purpose'].filter(
      (t, i, arr) => arr.indexOf(t) === i
    ) as QuizQuestionType[];
    for (const t of types) {
      const opts = generateOptions(phase, phases, t);
      if (opts.length >= 2) return { options: opts, questionType: t };
    }
    const opts = generateOptions(phase, phases, preferred);
    return { options: opts, questionType: preferred };
  }, [phase, phases, phaseIndex]);

  const handleStart = useCallback(() => {
    setStep('quiz');
    setPhaseIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowFeedback(false);
  }, []);

  const handleSelect = useCallback(
    (value: string, isCorrect: boolean) => {
      if (showFeedback) return;
      setSelectedAnswer(value);
      setShowFeedback(true);
      if (isCorrect) setScore((s) => s + 10);
    },
    [showFeedback]
  );

  const handleNext = useCallback(() => {
    if (phaseIndex < phases.length - 1) {
      setPhaseIndex((i) => i + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      setStep('complete');
    }
  }, [phaseIndex, phases.length]);

  const handleRetry = useCallback(() => {
    handleStart();
  }, [handleStart]);

  if (step === 'welcome') {
    return (
      <div className="px-4 py-8 text-center">
        <div
          className="w-20 h-20 mx-auto mb-5 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: `${starColor}25` }}
        >
          <Sparkles className="w-10 h-10" style={{ color: starColor }} />
        </div>
        <h3 className="text-lg font-extrabold text-white mb-2">
          {LABELS.process_quiz_welcome_title}
        </h3>
        <p className="text-sm text-gray-400 mb-6">{LABELS.process_quiz_welcome_subtitle}</p>
        <button
          type="button"
          onClick={handleStart}
          className="px-8 py-3 rounded-xl font-bold text-white transition-transform active:scale-95"
          style={{ backgroundColor: starColor }}
        >
          {LABELS.process_quiz_start}
        </button>
      </div>
    );
  }

  if (step === 'complete') {
    return (
      <div className="px-4 py-8 text-center">
        <div
          className="w-20 h-20 mx-auto mb-5 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: `${starColor}25` }}
        >
          <span className="text-4xl">🎉</span>
        </div>
        <h3 className="text-lg font-extrabold text-white mb-2">{LABELS.process_quiz_complete}</h3>
        <p className="text-sm text-gray-400 mb-2">
          {jobName}의 작업 과정 {phases.length}단계를 모두 배웠어요!
        </p>
        <p
          className="text-2xl font-extrabold mb-6"
          style={{ color: starColor }}
        >
          {score} {LABELS.process_quiz_score}
        </p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleRetry}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white border transition-transform active:scale-95"
            style={{ borderColor: starColor, color: starColor }}
          >
            <RotateCcw className="w-4 h-4" />
            {LABELS.process_quiz_retry}
          </button>
          {onViewFull && (
            <button
              type="button"
              onClick={onViewFull}
              className="px-6 py-3 rounded-xl font-bold text-gray-400 hover:text-white transition-colors"
            >
              {LABELS.process_full_mode}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!phase || options.length === 0) {
    return (
      <div className="px-4 py-12 text-center text-gray-500 text-sm">
        퀴즈 데이터를 준비하는 중이에요
      </div>
    );
  }

  const selectedOption = options.find((o) => o.value === selectedAnswer);
  const isCorrect = selectedOption?.isCorrect ?? false;

  return (
    <div className="px-4 pb-6">
      {/* Progress */}
      <div className="flex gap-1 mb-6">
        {phases.map((_, i) => (
          <div
            key={i}
            className="flex-1 h-1.5 rounded-full transition-colors"
            style={{
              backgroundColor: i <= phaseIndex ? starColor : 'rgba(255,255,255,0.12)',
              opacity: i < phaseIndex ? 0.6 : 1,
            }}
          />
        ))}
      </div>

      {/* Phase header */}
      <div
        className="rounded-2xl p-4 mb-5 flex items-center gap-3"
        style={{ backgroundColor: `${starColor}15`, border: `1px solid ${starColor}30` }}
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
          style={{ backgroundColor: `${starColor}25` }}
        >
          {phase.icon}
        </div>
        <div>
          <div className="text-[10px] font-bold text-gray-500">
            {LABELS.process_step_prefix} {phaseIndex + 1} · {phase.phase}
          </div>
          <div className="text-base font-extrabold text-white">{phase.title}</div>
          <div
            className="text-[10px] font-bold mt-0.5"
            style={{ color: starColor }}
          >
            {phase.duration}
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="mb-5">
        <div
          className="flex items-center gap-2 mb-3"
          style={{ color: starColor }}
        >
          {getQuestionIcon(questionType)}
          <span className="text-sm font-bold">{getQuestionLabel(questionType)}</span>
        </div>

        {!showFeedback ? (
          <div className="space-y-2">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value, opt.isCorrect)}
                className="w-full text-left px-4 py-3.5 rounded-xl border font-semibold text-sm transition-all active:scale-[0.98]"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  borderColor: 'rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.9)',
                }}
              >
                {opt.value}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <div
              className={`flex items-center gap-2 px-4 py-3 rounded-xl ${
                isCorrect ? 'border-green-500/50' : 'border-amber-500/50'
              }`}
              style={{
                backgroundColor: isCorrect ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.12)',
                borderWidth: 1,
              }}
            >
              <span className="text-xl">{isCorrect ? '✨' : '💡'}</span>
              <span className={`font-bold text-sm ${isCorrect ? 'text-green-400' : 'text-amber-400'}`}>
                {isCorrect ? LABELS.process_quiz_correct : LABELS.process_quiz_wrong}
              </span>
            </div>

            {/* Reveal phase summary */}
            <div
              className="rounded-xl p-4 border"
              style={{
                backgroundColor: 'rgba(255,255,255,0.04)',
                borderColor: 'rgba(255,255,255,0.08)',
              }}
            >
              <p className="text-sm text-gray-400 leading-relaxed mb-3">{phase.description}</p>
              {phase.example && (
                <div
                  className="rounded-lg p-3 border-l-4 mb-3"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    borderLeftColor: starColor,
                  }}
                >
                  <span className="text-xs font-bold text-gray-500">{LABELS.modal_example}</span>
                  <p className="text-sm text-gray-300 mt-1">{phase.example}</p>
                </div>
              )}
              <div className="flex flex-wrap gap-1.5">
                {(phase.tools ?? []).map((t) => (
                  <span
                    key={t}
                    className="px-2 py-1 rounded-lg text-xs font-semibold"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      color: 'rgba(255,255,255,0.8)',
                    }}
                  >
                    {t}
                  </span>
                ))}
                {(phase.skills ?? []).map((s) => (
                  <span
                    key={s}
                    className="px-2 py-1 rounded-lg text-xs font-bold"
                    style={{
                      backgroundColor: 'rgba(108,92,231,0.15)',
                      color: '#A29BFE',
                    }}
                  >
                    ⚡ {s}
                  </span>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="w-full py-3.5 rounded-xl font-bold text-white transition-transform active:scale-[0.98]"
              style={{ backgroundColor: starColor }}
            >
              {phaseIndex < phases.length - 1 ? LABELS.process_quiz_next : LABELS.process_quiz_complete}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
