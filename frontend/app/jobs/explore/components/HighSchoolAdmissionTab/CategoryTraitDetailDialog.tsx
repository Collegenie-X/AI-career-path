'use client';

import { useState } from 'react';
import { X, CheckCircle, Circle, RotateCcw, Star } from 'lucide-react';
import { CareerPathStyleDialog } from '../CareerPathStyleDialog';
import type { HighSchoolCategory } from '../../types';
import { CATEGORY_TRAIT_DETAIL } from './category-trait-detail-config';
import { TRAIT_ITEMS } from './highSchoolTraitItems';
import { HighSchoolAiEraStrategyContent } from './HighSchoolAiEraStrategyContent';
import { HIGH_SCHOOL_LABELS } from '../../config';

// ── 타입 ──────────────────────────────────────────────────────

type DialogTabId = 'traits' | 'aiEra' | 'quiz' | 'environment';

type QuizAnswerRecord = {
  choiceIndex: number;
  score: number;
  label: string;
  feedback?: string;
};

type QuizPhase =
  | { phase: 'intro' }
  | { phase: 'question'; index: number; answers: QuizAnswerRecord[] }
  | { phase: 'result'; totalScore: number; maxScore: number; answers: QuizAnswerRecord[] };

type CategoryTraitDetailDialogProps = {
  category: HighSchoolCategory;
  onClose: () => void;
};

// ── 탭 설정 ──────────────────────────────────────────────────

const DIALOG_TABS: { id: DialogTabId; label: string; emoji: string }[] = [
  { id: 'traits',      label: '특성 상세',  emoji: '📋' },
  { id: 'aiEra',       label: HIGH_SCHOOL_LABELS.category_ai_era_tab_label, emoji: '🤖' },
  { id: 'quiz',        label: '적성 검사',  emoji: '🎮' },
  { id: 'environment', label: '환경 체크',  emoji: '🛡️' },
];

// ── 결과 메시지 ───────────────────────────────────────────────

const QUIZ_RESULT_MESSAGES: { minRatio: number; emoji: string; title: string; desc: string }[] = [
  { minRatio: 0.85, emoji: '🌟', title: '매우 높은 적합도', desc: '교과·활동·성과 준비도가 높아요. 이 유형에 강하게 도전해볼 만합니다.' },
  { minRatio: 0.7, emoji: '✨', title: '높은 적합도', desc: '핵심 역량이 잘 갖춰졌어요. 부족한 영역만 보완하면 경쟁력이 충분합니다.' },
  { minRatio: 0.55, emoji: '💡', title: '성장 가능 구간', desc: '기본 적성은 보입니다. 방과후 활동과 성과 기록을 더 촘촘히 채워보세요.' },
  { minRatio: 0.4, emoji: '🤔', title: '재점검 필요', desc: '일부 강점은 있지만 준비 편차가 큽니다. 학습/활동 루틴을 먼저 안정화해보세요.' },
  { minRatio: 0, emoji: '🔄', title: '다른 유형도 탐색', desc: '현재 준비도 기준으로는 다른 학교 유형이 더 잘 맞을 수 있어요.' },
];

function getResultMessage(ratio: number) {
  return QUIZ_RESULT_MESSAGES.find((message) => ratio >= message.minRatio) ?? QUIZ_RESULT_MESSAGES[QUIZ_RESULT_MESSAGES.length - 1];
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────

export function CategoryTraitDetailDialog({ category, onClose }: CategoryTraitDetailDialogProps) {
  const [activeTab, setActiveTab] = useState<DialogTabId>('traits');
  const [quizPhase, setQuizPhase] = useState<QuizPhase>({ phase: 'intro' });
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  const content = CATEGORY_TRAIT_DETAIL[category.id] ?? getDefaultContent();
  const { color: categoryColor, bgColor: categoryBgColor } = category;

  const handleQuizAnswer = (choiceIndex: number, score: number, label: string, feedback?: string) => {
    if (quizPhase.phase !== 'question') return;
    const { index, answers } = quizPhase;
    const newAnswers = [...answers, { choiceIndex, score, label, feedback }];
    const nextIndex = index + 1;

    if (nextIndex >= content.quizQuestions.length) {
      const totalScore = newAnswers.reduce((sum, answer) => sum + answer.score, 0);
      const maxScore = content.quizQuestions.reduce((sum, question) => {
        const questionMaxScore = Math.max(...question.choices.map((choice) => choice.score));
        return sum + questionMaxScore;
      }, 0);
      setQuizPhase({ phase: 'result', totalScore, maxScore, answers: newAnswers });
    } else {
      setQuizPhase({ phase: 'question', index: nextIndex, answers: newAnswers });
    }
  };

  const toggleCheckItem = (index: number) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  };

  return (
    <CareerPathStyleDialog onClose={onClose}>
      <div className="flex flex-col" style={{ maxHeight: 'calc(100vh - 56px)' }}>
        {/* ── 헤더 ── */}
        <div
          className="flex-shrink-0 px-5 py-4"
          style={{
            background: `linear-gradient(135deg, ${categoryColor}28, ${categoryColor}0a)`,
            borderBottom: `1px solid ${categoryColor}30`,
          }}
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${categoryColor}40, ${categoryColor}18)`,
                  border: `1.5px solid ${categoryColor}44`,
                }}
              >
                {category.emoji}
              </div>
              <div>
                <h2 className="text-base font-bold text-white">{category.name}</h2>
                <p className="text-[12px] text-gray-500 mt-0.5">{category.description}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.1)' }}
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* 탭 바 */}
          <div
            className="flex gap-1 rounded-xl p-1"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            {DIALOG_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 py-2.5 rounded-lg font-semibold transition-all flex flex-col items-center gap-0.5"
                style={{
                  background: activeTab === tab.id ? `${categoryColor}40` : 'transparent',
                  color: activeTab === tab.id ? categoryColor : '#6b7280',
                  boxShadow: activeTab === tab.id ? `0 2px 8px ${categoryColor}30` : 'none',
                }}
              >
                <span className="text-base">{tab.emoji}</span>
                <span className="text-[12px] leading-tight">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── 콘텐츠 ── */}
        <div
          className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 min-w-0"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {activeTab === 'traits' && (
            <TraitsTab
              category={category}
              categoryColor={categoryColor}
              categoryBgColor={categoryBgColor}
              selfEsteemEmphasis={content.selfEsteemEmphasis}
            />
          )}
          {activeTab === 'aiEra' && (
            <HighSchoolAiEraStrategyContent
              aiStrategy={category.aiEraStrategy}
              categoryColor={categoryColor}
              categoryBgColor={categoryBgColor}
              contentPaddingClassName="px-4 py-4"
            />
          )}
          {activeTab === 'quiz' && (
            <QuizTab
              categoryColor={categoryColor}
              categoryBgColor={categoryBgColor}
              quizPhase={quizPhase}
              questions={content.quizQuestions}
              onAnswer={handleQuizAnswer}
              onReset={() => setQuizPhase({ phase: 'intro' })}
              onStart={() => setQuizPhase({ phase: 'question', index: 0, answers: [] })}
            />
          )}
          {activeTab === 'environment' && (
            <EnvironmentTab
              categoryColor={categoryColor}
              eliteEnvironmentFit={content.eliteEnvironmentFit}
              additionalGuidance={content.additionalGuidance}
              checkedItems={checkedItems}
              onToggle={toggleCheckItem}
            />
          )}
        </div>
      </div>
    </CareerPathStyleDialog>
  );
}

// ── 탭 1: 특성 상세 ───────────────────────────────────────────

function TraitsTab({
  category,
  categoryColor,
  categoryBgColor,
  selfEsteemEmphasis,
}: {
  category: HighSchoolCategory;
  categoryColor: string;
  categoryBgColor: string;
  selfEsteemEmphasis: string;
}) {
  return (
    <div className="px-4 py-4 space-y-4">
      {/* 6개 특성 2열 그리드 */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: categoryColor }}>
          📋 이 유형의 6가지 특성
        </p>
        <div className="grid grid-cols-2 gap-2">
          {TRAIT_ITEMS.map((item) => (
            <div
              key={item.key}
              className="rounded-2xl p-3 flex flex-col gap-1.5"
              style={{
                background: `linear-gradient(135deg, ${categoryBgColor} 0%, rgba(0,0,0,0.2) 100%)`,
                border: `1px solid ${categoryColor}30`,
              }}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-xl">{item.emoji}</span>
                <span className="text-[12px] font-bold" style={{ color: categoryColor }}>
                  {item.label.replace(/^[^ ]+ /, '')}
                </span>
              </div>
              <p className="text-[12px] text-gray-300 leading-relaxed">
                {category.categoryTraits[item.key]}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 자존감 경고 카드 */}
      <div
        className="rounded-2xl p-4"
        style={{
          background: 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(185,28,28,0.08) 100%)',
          border: '1px solid rgba(239,68,68,0.4)',
        }}
      >
        <p className="text-[12px] font-bold text-red-400 mb-2 flex items-center gap-1.5">
          ❤️‍🔥 자존감이 낮으면 위험해요
        </p>
        <p className="text-[12px] text-gray-200 leading-relaxed">{selfEsteemEmphasis}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {['성적 하락', '자신감 상실', '악순환 주의'].map((tag) => (
            <span
              key={tag}
              className="text-[11px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171' }}
            >
              ⚠️ {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── 탭 2: 적성 검사 (게임 UI) ─────────────────────────────────

type QuizTabProps = {
  categoryColor: string;
  categoryBgColor: string;
  quizPhase: QuizPhase;
  questions: {
    emoji: string;
    focusArea: string;
    question: string;
    choices: { label: string; score: number; feedback?: string }[];
  }[];
  onAnswer: (choiceIndex: number, score: number, label: string, feedback?: string) => void;
  onReset: () => void;
  onStart: () => void;
};

function QuizTab({ categoryColor, categoryBgColor, quizPhase, questions, onAnswer, onReset, onStart }: QuizTabProps) {
  if (quizPhase.phase === 'intro') {
    return (
      <div className="px-4 py-6 flex flex-col items-center gap-5">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl"
          style={{
            background: `linear-gradient(135deg, ${categoryBgColor} 0%, rgba(0,0,0,0.3) 100%)`,
            border: `2px solid ${categoryColor}50`,
            boxShadow: `0 0 30px ${categoryColor}30`,
          }}
        >
          🎮
        </div>
        <div className="text-center">
          <h3 className="text-lg font-bold text-white mb-2">간단 적성 검사</h3>
          <p className="text-[12px] text-gray-400 leading-relaxed">
            각 문항은 4지선다로 구성되어 있어요.<br />
            교과·방과후·수상·실습(코딩 포함) 준비도를 점검해보세요.
          </p>
        </div>
        <div className="w-full space-y-2">
          {questions.map((q, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              <span className="text-lg flex-shrink-0">{q.emoji}</span>
              <div className="min-w-0">
                <p className="text-[12px] font-bold mb-0.5" style={{ color: categoryColor }}>
                  {q.focusArea}
                </p>
                <p className="text-[12px] text-gray-400 leading-relaxed">{q.question}</p>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={onStart}
          className="w-full py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-95"
          style={{
            background: `linear-gradient(135deg, ${categoryColor} 0%, ${categoryColor}99 100%)`,
            color: '#fff',
            boxShadow: `0 4px 20px ${categoryColor}50`,
          }}
        >
          🚀 검사 시작하기
        </button>
      </div>
    );
  }

  if (quizPhase.phase === 'question') {
    const { index, answers } = quizPhase;
    const current = questions[index];
    const progress = (answers.length / questions.length) * 100;

    return (
      <div className="px-4 py-4 flex flex-col gap-4">
        {/* 진행 바 */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-gray-400">
              {index + 1} / {questions.length}
            </span>
            <span className="text-[12px] text-gray-500">
              {Math.round(progress)}% 완료
            </span>
          </div>
          <div className="w-full h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div
              className="h-2 rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${categoryColor} 0%, ${categoryColor}99 100%)`,
                boxShadow: `0 0 8px ${categoryColor}60`,
              }}
            />
          </div>
          {/* 이전 답변 미니 표시 */}
          <div className="flex gap-1 mt-1.5">
            {questions.map((_, i) => (
              <div
                key={i}
                className="flex-1 h-1 rounded-full"
                style={{
                  background: i < answers.length
                    ? answers[i].score >= 2
                      ? '#22c55e'
                      : answers[i].score === 1
                      ? '#f59e0b'
                      : '#ef4444'
                    : i === index
                    ? categoryColor
                    : 'rgba(255,255,255,0.1)',
                }}
              />
            ))}
          </div>
        </div>

        {/* 질문 카드 */}
        <div
          className="rounded-3xl p-6 flex flex-col items-center gap-4 text-center"
          style={{
            background: `linear-gradient(135deg, ${categoryBgColor} 0%, rgba(0,0,0,0.4) 100%)`,
            border: `1px solid ${categoryColor}40`,
            minHeight: 200,
          }}
        >
          <span className="text-5xl">{current.emoji}</span>
          <span
            className="text-[11px] font-bold px-2 py-1 rounded-full"
            style={{ background: `${categoryColor}28`, color: categoryColor }}
          >
            {current.focusArea}
          </span>
          <p className="text-[15px] font-semibold text-white leading-relaxed">{current.question}</p>
          <p className="text-[12px] text-gray-500">솔직하게 답해보세요</p>
        </div>

        {/* 4지선다 버튼 */}
        <div className="space-y-2.5">
          {current.choices.map((choice, choiceIndex) => {
            const choiceColor = choice.score >= 2 ? '#22c55e' : choice.score === 1 ? '#f59e0b' : '#ef4444';

            return (
              <button
                key={`${current.question}-${choiceIndex}`}
                onClick={() => onAnswer(choiceIndex, choice.score, choice.label, choice.feedback)}
                className="w-full px-3 py-3 rounded-2xl text-left transition-all active:scale-[0.98]"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${choiceColor}55`,
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[12px] font-semibold leading-relaxed text-gray-100">{choice.label}</p>
                  <span
                    className="text-[11px] px-2 py-0.5 rounded-full font-bold flex-shrink-0"
                    style={{ color: choiceColor, background: `${choiceColor}22` }}
                  >
                    {choice.score}점
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // 결과 화면
  const { totalScore, maxScore, answers } = quizPhase;
  const normalizedMaxScore = Math.max(maxScore, 1);
  const ratio = totalScore / normalizedMaxScore;
  const result = getResultMessage(ratio);
  const starScore = Math.max(1, Math.round(ratio * 5));

  return (
    <div className="px-4 py-4 flex flex-col gap-4">
      {/* 결과 카드 */}
      <div
        className="rounded-3xl p-6 flex flex-col items-center gap-3 text-center"
        style={{
          background: `linear-gradient(135deg, ${categoryBgColor} 0%, rgba(0,0,0,0.4) 100%)`,
          border: `1px solid ${categoryColor}40`,
        }}
      >
        <span className="text-5xl">{result.emoji}</span>
        <div>
          <p className="text-lg font-bold text-white mb-1">{result.title}</p>
          <p className="text-[12px] text-gray-300 leading-relaxed">{result.desc}</p>
        </div>

        {/* 별점 */}
        <div className="flex items-center gap-1 mt-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className="w-6 h-6 transition-all"
              style={{
                fill: i < starScore ? categoryColor : 'transparent',
                color: i < starScore ? categoryColor : 'rgba(255,255,255,0.2)',
                filter: i < starScore ? `drop-shadow(0 0 4px ${categoryColor})` : 'none',
              }}
            />
          ))}
        </div>
        <p className="text-[12px] font-bold" style={{ color: categoryColor }}>
          {totalScore} / {normalizedMaxScore}점 ({Math.round(ratio * 100)}%)
        </p>
      </div>

      {/* 문항별 결과 요약 */}
      <div
        className="rounded-2xl p-3 space-y-2"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <p className="text-[11px] font-bold text-gray-400 mb-2">📊 문항별 결과</p>
        {questions.map((q, i) => {
          const answer = answers[i];
          if (!answer) return null;
          return (
            <div key={i} className="rounded-xl p-2.5" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-base flex-shrink-0">{q.emoji}</span>
                <p className="text-[12px] text-gray-300 flex-1 leading-relaxed">{q.question}</p>
              </div>
              <p className="text-[12px] font-semibold text-gray-100">
                선택: {answer.label} ({answer.score}점)
              </p>
              {answer.feedback ? (
                <p className="text-[12px] text-gray-400 mt-0.5 leading-relaxed">{answer.feedback}</p>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* 다시 하기 */}
      <button
        onClick={onReset}
        className="w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          color: '#9ca3af',
        }}
      >
        <RotateCcw className="w-4 h-4" />
        다시 검사하기
      </button>
    </div>
  );
}

// ── 탭 3: 환경 체크 ───────────────────────────────────────────

function EnvironmentTab({
  categoryColor,
  eliteEnvironmentFit,
  additionalGuidance,
  checkedItems,
  onToggle,
}: {
  categoryColor: string;
  eliteEnvironmentFit: string[];
  additionalGuidance: string[];
  checkedItems: Set<number>;
  onToggle: (index: number) => void;
}) {
  const checkedCount = checkedItems.size;
  const total = eliteEnvironmentFit.length;

  return (
    <div className="px-4 py-4 space-y-4">
      {/* 엘리트 환경 체크리스트 */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: `1px solid ${categoryColor}25` }}
      >
        <div
          className="px-3 py-2.5 flex items-center justify-between"
          style={{ background: `${categoryColor}15` }}
        >
          <p className="text-[12px] font-bold" style={{ color: categoryColor }}>
            👥 엘리트 환경 적응 체크리스트
          </p>
          <span
            className="text-[11px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: `${categoryColor}30`, color: categoryColor }}
          >
            {checkedCount} / {total}
          </span>
        </div>

        {/* 진행 바 */}
        <div className="px-3 py-2" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div
              className="h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${(checkedCount / total) * 100}%`,
                background: `linear-gradient(90deg, ${categoryColor} 0%, ${categoryColor}99 100%)`,
              }}
            />
          </div>
        </div>

        <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          {eliteEnvironmentFit.map((q, i) => (
            <button
              key={i}
              onClick={() => onToggle(i)}
              className="w-full flex items-start gap-3 px-3 py-3 text-left transition-all"
              style={{ background: checkedItems.has(i) ? `${categoryColor}08` : 'transparent' }}
            >
              {checkedItems.has(i) ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: categoryColor }} />
              ) : (
                <Circle className="w-5 h-5 flex-shrink-0 mt-0.5 text-gray-600" />
              )}
              <p
                className="text-[12px] leading-relaxed"
                style={{ color: checkedItems.has(i) ? '#e5e7eb' : '#9ca3af' }}
              >
                {q}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* 체크 결과 메시지 */}
      {checkedCount > 0 && (
        <div
          className="rounded-2xl p-3"
          style={{
            background: checkedCount === total
              ? `${categoryColor}15`
              : 'rgba(255,255,255,0.04)',
            border: `1px solid ${checkedCount === total ? categoryColor + '40' : 'rgba(255,255,255,0.08)'}`,
          }}
        >
          <p className="text-[12px] font-semibold" style={{ color: checkedCount === total ? categoryColor : '#9ca3af' }}>
            {checkedCount === total
              ? `🎉 ${total}개 모두 체크! 이 환경에 잘 어울릴 수 있어요.`
              : `${checkedCount}개 체크됨 — 나머지 항목도 한 번 더 고민해보세요.`}
          </p>
        </div>
      )}

      {/* 추가 안내 */}
      <div
        className="rounded-2xl p-3 space-y-2.5"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <p className="text-[11px] font-bold text-gray-400">💡 추가로 알아두면 좋아요</p>
        {additionalGuidance.map((g, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-[12px] flex-shrink-0 mt-0.5" style={{ color: categoryColor }}>▸</span>
            <p className="text-[12px] text-gray-300 leading-relaxed">{g}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 공통 유틸 ─────────────────────────────────────────────────

function getDefaultContent() {
  return {
    aptitudeFitCheck: ['이 유형에 맞는 적성이 있는지 스스로 점검해보세요.'],
    eliteEnvironmentFit: ['특수한 환경에서 잘 어울릴 수 있는지 고민해보세요.'],
    selfEsteemEmphasis: '자존감이 낮으면 낮은 성적에 연쇄적으로 자신감이 떨어져 나락갈 수 있습니다. 성적과 무관한 자기만의 가치를 갖는 것이 중요해요.',
    additionalGuidance: ['학교별 특색과 입시 전략을 미리 확인하세요.'],
    quizQuestions: [
      {
        emoji: '🎯',
        focusArea: '기본 점검',
        question: '이 유형의 학교에 도전하기 위한 준비를 실제로 하고 있나요?',
        choices: [
          { label: '교과·활동·성과를 함께 준비 중이다', score: 3 },
          { label: '2개 영역 이상 꾸준히 준비 중이다', score: 2 },
          { label: '한 영역만 간헐적으로 준비 중이다', score: 1 },
          { label: '아직 준비하지 못했다', score: 0 }
        ]
      },
    ],
  };
}
