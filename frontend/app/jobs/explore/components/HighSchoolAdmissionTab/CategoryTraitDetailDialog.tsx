'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, Circle, RotateCcw, Star } from 'lucide-react';
import type { HighSchoolCategory } from '../../types';
import { CATEGORY_TRAIT_DETAIL } from './category-trait-detail-config';
import { TRAIT_ITEMS } from './SchoolCategoryView';

// ── 타입 ──────────────────────────────────────────────────────

type DialogTabId = 'traits' | 'quiz' | 'environment';

type QuizPhase =
  | { phase: 'intro' }
  | { phase: 'question'; index: number; answers: boolean[] }
  | { phase: 'result'; score: number };

type CategoryTraitDetailDialogProps = {
  category: HighSchoolCategory;
  onClose: () => void;
};

// ── 탭 설정 ──────────────────────────────────────────────────

const DIALOG_TABS: { id: DialogTabId; label: string; emoji: string }[] = [
  { id: 'traits',      label: '특성 상세',  emoji: '📋' },
  { id: 'quiz',        label: '적성 검사',  emoji: '🎮' },
  { id: 'environment', label: '환경 체크',  emoji: '🛡️' },
];

// ── 결과 메시지 ───────────────────────────────────────────────

const QUIZ_RESULT_MESSAGES: Record<number, { emoji: string; title: string; desc: string }> = {
  5: { emoji: '🌟', title: '완벽한 적성!',    desc: '이 유형과 매우 잘 맞아요. 자신 있게 도전하세요!' },
  4: { emoji: '✨', title: '높은 적합도!',    desc: '대부분 잘 맞아요. 부족한 부분은 준비하면 됩니다.' },
  3: { emoji: '💡', title: '보통 적합도',     desc: '절반 정도 맞아요. 좀 더 탐색해보는 것을 추천해요.' },
  2: { emoji: '🤔', title: '신중하게 고려',   desc: '맞지 않는 부분이 많아요. 다른 유형도 살펴보세요.' },
  1: { emoji: '⚠️', title: '다른 유형 추천', desc: '이 유형보다 다른 유형이 더 잘 맞을 수 있어요.' },
  0: { emoji: '🔄', title: '다른 유형 탐색', desc: '지금은 이 유형보다 다른 길이 더 맞을 것 같아요.' },
};

function getResultMessage(score: number) {
  return QUIZ_RESULT_MESSAGES[score] ?? QUIZ_RESULT_MESSAGES[0];
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────

export function CategoryTraitDetailDialog({ category, onClose }: CategoryTraitDetailDialogProps) {
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [activeTab, setActiveTab] = useState<DialogTabId>('traits');
  const [quizPhase, setQuizPhase] = useState<QuizPhase>({ phase: 'intro' });
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  const content = CATEGORY_TRAIT_DETAIL[category.id] ?? getDefaultContent();
  const { color: categoryColor, bgColor: categoryBgColor } = category;

  useEffect(() => {
    setPortalTarget(document.body);
  }, []);

  const handleQuizAnswer = (answer: boolean) => {
    if (quizPhase.phase !== 'question') return;
    const { index, answers } = quizPhase;
    const newAnswers = [...answers, answer];
    const nextIndex = index + 1;

    if (nextIndex >= content.quizQuestions.length) {
      const score = newAnswers.filter((a, i) => {
        const q = content.quizQuestions[i];
        return q.isPositive ? a : !a;
      }).length;
      setQuizPhase({ phase: 'result', score });
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

  const dialogContent = (
    <div
      className="fixed top-0 left-0 w-screen z-[9999] flex flex-col overflow-x-hidden"
      style={{
        background: 'rgba(5,5,20,0.98)',
        backdropFilter: 'blur(16px)',
        height: '100dvh',
      }}
    >
      <div
        className="flex flex-col min-w-0 max-w-[480px] w-full mx-auto"
        style={{ height: '100%', paddingTop: 20, paddingBottom: 20 }}
      >
        {/* ── 헤더 ── */}
        <div
          className="flex-shrink-0 px-4 pb-0"
          style={{
            background: `linear-gradient(180deg, ${categoryBgColor} 0%, rgba(0,0,0,0) 100%)`,
            borderBottom: `1px solid ${categoryColor}25`,
          }}
        >
          {/* 학교 유형 정보 */}
          <div className="flex items-center justify-between pt-3 mb-3">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${categoryBgColor} 0%, rgba(0,0,0,0.3) 100%)`,
                  border: `2px solid ${categoryColor}60`,
                  boxShadow: `0 0 16px ${categoryColor}30`,
                }}
              >
                {category.emoji}
              </div>
              <div>
                <h2 className="text-base font-bold text-white">{category.name}</h2>
                <p className="text-[10px]" style={{ color: categoryColor }}>{category.description}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.1)' }}
            >
              <X className="w-4 h-4 text-gray-300" />
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
                <span className="text-[10px] leading-tight">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── 콘텐츠 ── */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden min-w-0" style={{ paddingBottom: 24 }}>
          {activeTab === 'traits' && (
            <TraitsTab
              category={category}
              categoryColor={categoryColor}
              categoryBgColor={categoryBgColor}
              selfEsteemEmphasis={content.selfEsteemEmphasis}
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
    </div>
  );

  if (!portalTarget) return null;
  return createPortal(dialogContent, portalTarget);
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
                <span className="text-[10px] font-bold" style={{ color: categoryColor }}>
                  {item.label.replace(/^[^ ]+ /, '')}
                </span>
              </div>
              <p className="text-[11px] text-gray-300 leading-relaxed">
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
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
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
  questions: { emoji: string; question: string; isPositive: boolean }[];
  onAnswer: (answer: boolean) => void;
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
            5가지 질문에 솔직하게 답해보세요.<br />
            이 유형이 나에게 얼마나 맞는지 확인할 수 있어요.
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
              <p className="text-[11px] text-gray-400 leading-relaxed">{q.question}</p>
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
    const progress = ((index) / questions.length) * 100;

    return (
      <div className="px-4 py-4 flex flex-col gap-4">
        {/* 진행 바 */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-gray-400">
              {index + 1} / {questions.length}
            </span>
            <span className="text-[10px] text-gray-500">
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
                    ? (answers[i] ? '#22c55e' : '#ef4444')
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
          <p className="text-[15px] font-semibold text-white leading-relaxed">{current.question}</p>
          <p className="text-[10px] text-gray-500">솔직하게 답해보세요</p>
        </div>

        {/* O / X 버튼 */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onAnswer(false)}
            className="py-4 rounded-2xl font-bold text-lg transition-all active:scale-95 flex flex-col items-center gap-1"
            style={{
              background: 'rgba(239,68,68,0.15)',
              border: '2px solid rgba(239,68,68,0.4)',
              color: '#f87171',
            }}
          >
            <span className="text-3xl">✗</span>
            <span className="text-[11px]">아니오</span>
          </button>
          <button
            onClick={() => onAnswer(true)}
            className="py-4 rounded-2xl font-bold text-lg transition-all active:scale-95 flex flex-col items-center gap-1"
            style={{
              background: 'rgba(34,197,94,0.15)',
              border: '2px solid rgba(34,197,94,0.4)',
              color: '#4ade80',
            }}
          >
            <span className="text-3xl">○</span>
            <span className="text-[11px]">예</span>
          </button>
        </div>
      </div>
    );
  }

  // 결과 화면
  const { score } = quizPhase;
  const result = getResultMessage(score);

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
                fill: i < score ? categoryColor : 'transparent',
                color: i < score ? categoryColor : 'rgba(255,255,255,0.2)',
                filter: i < score ? `drop-shadow(0 0 4px ${categoryColor})` : 'none',
              }}
            />
          ))}
        </div>
        <p className="text-[11px] font-bold" style={{ color: categoryColor }}>
          {score} / 5 매칭
        </p>
      </div>

      {/* 문항별 결과 요약 */}
      <div
        className="rounded-2xl p-3 space-y-2"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <p className="text-[11px] font-bold text-gray-400 mb-2">📊 문항별 결과</p>
        {questions.map((q, i) => {
          const answered = quizPhase.phase === 'result';
          if (!answered) return null;
          // 결과 단계에서는 answers를 재구성해야 하므로 score 기반으로 표시
          return (
            <div key={i} className="flex items-center gap-2">
              <span className="text-base flex-shrink-0">{q.emoji}</span>
              <p className="text-[11px] text-gray-300 flex-1 leading-relaxed">{q.question}</p>
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
          <p className="text-[11px] font-bold" style={{ color: categoryColor }}>
            👥 엘리트 환경 적응 체크리스트
          </p>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
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
            <span className="text-[11px] flex-shrink-0 mt-0.5" style={{ color: categoryColor }}>▸</span>
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
      { emoji: '🎯', question: '이 유형의 학교에 진심으로 가고 싶다', isPositive: true },
    ],
  };
}
