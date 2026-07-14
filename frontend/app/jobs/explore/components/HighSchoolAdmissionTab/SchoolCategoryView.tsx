'use client';

import { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  ChevronDown,
  CheckCircle,
  Circle,
  RotateCcw,
  Zap,
  Users,
  Lightbulb,
  Star,
  X,
  Check,
  ArrowRight,
} from 'lucide-react';
import type { HighSchoolCategory, HighSchoolDetail } from '../../types';
import { HIGH_SCHOOL_LABELS } from '../../config';
import { CATEGORY_TRAIT_DETAIL, type QuizQuestion } from './category-trait-detail-config';
import { CategoryTraitDetailDialog } from './CategoryTraitDetailDialog';
import { TRAIT_ITEMS } from './highSchoolTraitItems';
import { GlossaryText } from '@/components/shared/GlossaryText';

/**
 * ==text== 형광펜 + 입시 약자 말풍선 툴팁을 함께 렌더링.
 * GlossaryText가 ==highlight== 마크업과 등록된 용어(R&E·학종·세특·KMO 등) 호버/탭 툴팁을 모두 처리.
 */
function HL({ text }: { text: string }) {
  return <GlossaryText>{text}</GlossaryText>;
}

type SchoolCategoryViewProps = {
  category: HighSchoolCategory;
  onBack: () => void;
  onSelectSchool: (school: HighSchoolDetail) => void;
  /** 'leftList'(기본): 왼쪽 패널에서 사용 (← 뒤로가기 버튼 표시).
   *  'rightDetail': 오른쪽 패널에서 사용 (X 닫기 버튼 표시) */
  variant?: 'leftList' | 'rightDetail';
};

type QuizPhase =
  | { phase: 'intro' }
  | { phase: 'question'; index: number; answers: { choiceIndex: number; score: number; label: string; feedback?: string }[] }
  | { phase: 'feedback'; index: number; answers: { choiceIndex: number; score: number; label: string; feedback?: string }[]; selectedChoiceIndex: number }
  | { phase: 'result'; totalScore: number; maxScore: number; answers: { choiceIndex: number; score: number; label: string; feedback?: string }[] };

export function SchoolCategoryView({ category, onBack, onSelectSchool, variant = 'leftList' }: SchoolCategoryViewProps) {
  const [categoryTraitDialogOpen, setCategoryTraitDialogOpen] = useState(false);
  const [showAptitudeQuiz, setShowAptitudeQuiz] = useState(false);
  const [quizPhase, setQuizPhase] = useState<QuizPhase>({ phase: 'intro' });

  const content = CATEGORY_TRAIT_DETAIL[category.id] ?? {
    aptitudeFitCheck: [],
    eliteEnvironmentFit: [],
    selfEsteemEmphasis: '',
    additionalGuidance: [],
    quizQuestions: [],
  };

  const handleQuizAnswer = (choiceIndex: number, score: number, label: string, feedback?: string) => {
    if (quizPhase.phase !== 'question') return;
    const { index, answers } = quizPhase;
    const newAnswers = [...answers, { choiceIndex, score, label, feedback }];
    setQuizPhase({ phase: 'feedback', index, answers: newAnswers, selectedChoiceIndex: choiceIndex });
  };

  const handleNextQuestion = () => {
    if (quizPhase.phase !== 'feedback') return;
    const { index, answers } = quizPhase;
    const nextIndex = index + 1;
    if (nextIndex >= content.quizQuestions.length) {
      const totalScore = answers.reduce((sum, answer) => sum + answer.score, 0);
      const maxScore = content.quizQuestions.reduce((sum, question) => {
        const questionMaxScore = Math.max(...question.choices.map((choice) => choice.score));
        return sum + questionMaxScore;
      }, 0);
      setQuizPhase({ phase: 'result', totalScore, maxScore, answers });
    } else {
      setQuizPhase({ phase: 'question', index: nextIndex, answers });
    }
  };

  useEffect(() => {
    setQuizPhase({ phase: 'intro' });
    setShowAptitudeQuiz(false);
  }, [category.id]);

  /** 카테고리가 바뀔 때마다 stagger 애니메이션 새로 트리거 */
  const animationKey = `school-category-${category.id}`;

  return (
    <>
    <div className={variant === 'rightDetail' ? 'space-y-4 panel-pop-stagger' : 'space-y-4'} key={animationKey}>
      {/* ── 상단: 헤더 + 특성 카드 (강조) ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {variant === 'leftList' && (
            <button
              onClick={onBack}
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-95"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)' }}
              aria-label="뒤로 가기"
            >
              <ChevronLeft className="w-4 h-4 text-gray-300" />
            </button>
          )}
          <div
            className="flex-1 flex items-center gap-3 px-4 py-3.5 rounded-2xl min-h-[72px]"
            style={{
              background: `linear-gradient(135deg, ${category.bgColor} 0%, ${category.color}18 50%, rgba(0,0,0,0.15) 100%)`,
              border: `2px solid ${category.color}55`,
              boxShadow: `0 4px 20px ${category.color}25`,
            }}
          >
            <span className="text-3xl flex-shrink-0">{category.emoji}</span>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-bold text-white leading-tight">{category.name}</p>
              <p className="text-sm mt-1.5 leading-relaxed text-gray-100"><HL text={category.description} /></p>
            </div>
            {variant === 'rightDetail' && (
              <button
                onClick={onBack}
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all hover:bg-white/15 hover:rotate-90"
                style={{ background: 'rgba(255,255,255,0.1)', border: `1px solid ${category.color}55` }}
                aria-label="닫기"
              >
                <X className="w-3.5 h-3.5 text-white" />
              </button>
            )}
          </div>
        </div>

        {/* 분류 특성 카드 — 상단 강조 */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: `1.5px solid ${category.color}35`,
            boxShadow: `0 2px 12px ${category.color}15`,
          }}
        >
          <div className="px-4 pt-4 pb-3">
            <p className="text-sm font-bold uppercase tracking-wider mb-3" style={{ color: category.color }}>
              {HIGH_SCHOOL_LABELS.school_trait_detail_title}
            </p>
          <div className="space-y-3">
            {TRAIT_ITEMS.slice(0, 3).map((item) => (
              <TraitRow
                key={item.key}
                emoji={item.emoji}
                label={item.label}
                value={category.categoryTraits[item.key]}
                color={category.color}
              />
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setCategoryTraitDialogOpen(true)}
          className="w-full py-3.5 flex items-center justify-center gap-2 text-sm font-bold transition-all active:scale-[0.99]"
          style={{
            background: `${category.color}18`,
            borderTop: `1.5px solid ${category.color}30`,
            color: category.color,
          }}
        >
          {HIGH_SCHOOL_LABELS.school_trait_detail_button}
          <ChevronRight className="w-4 h-4 flex-shrink-0 opacity-90" aria-hidden />
        </button>
        </div>
      </div>

      {/* 아코디언: 적성 검사 */}
      {content.quizQuestions.length > 0 && (
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: `1.5px solid ${category.color}30`,
          }}
        >
          <button
            onClick={() => {
              setShowAptitudeQuiz(prev => !prev);
              if (!showAptitudeQuiz) setQuizPhase({ phase: 'intro' });
            }}
            className="w-full py-3.5 flex items-center justify-center gap-2 text-sm font-bold transition-all active:scale-[0.99]"
            style={{
              background: `${category.color}18`,
              color: category.color,
            }}
          >
            🎮 적성 검사 시작하기
            <ChevronDown
              className="w-4 h-4 transition-transform duration-300"
              style={{ transform: showAptitudeQuiz ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </button>
          {showAptitudeQuiz && (
            <div
              style={{
                animation: 'slide-up 0.3s ease-out both',
                background: 'rgba(0,0,0,0.25)',
                borderTop: `1px solid ${category.color}30`,
              }}
            >
              <AptitudeQuizContent
                categoryColor={category.color}
                categoryBgColor={category.bgColor}
                quizPhase={quizPhase}
                questions={content.quizQuestions}
                onAnswer={handleQuizAnswer}
                onNext={handleNextQuestion}
                onReset={() => setQuizPhase({ phase: 'intro' })}
                onStart={() => setQuizPhase({ phase: 'question', index: 0, answers: [] })}
              />
            </div>
          )}
        </div>
      )}

      {/* ── 2028 입시 방향성 + AI 방향성 (카테고리 단위) ── */}
      <CategoryDirectionPanel category={category} />

      {/* ── 학교 목록 (단순화) ── */}
      <div>
        <p className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-2">
          {category.schools.length}{HIGH_SCHOOL_LABELS.school_list_section_title} · {HIGH_SCHOOL_LABELS.school_list_click_hint}
        </p>
        <div className={variant === 'rightDetail' ? 'space-y-2 panel-pop-stagger-fast' : 'space-y-2'}>
          {category.schools.map((school) => (
            <SchoolListCard
              key={school.id}
              school={school}
              categoryColor={category.color}
              categoryBgColor={category.bgColor}
              onClick={() => onSelectSchool(school)}
            />
          ))}
        </div>
      </div>
    </div>

    {categoryTraitDialogOpen && (
      <CategoryTraitDetailDialog
        category={category}
        onClose={() => setCategoryTraitDialogOpen(false)}
      />
    )}
    </>
  );
}

function TraitRow({
  emoji,
  label,
  value,
  color,
}: {
  emoji: string;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <div
        className="flex items-center gap-1 flex-shrink-0 mt-0.5 px-2 py-1 rounded-lg"
        style={{ background: `${color}20` }}
      >
        <span className="text-sm">{emoji}</span>
        <span className="text-sm font-bold whitespace-nowrap" style={{ color }}>{label.replace(/^[^ ]+ /, '')}</span>
      </div>
      <p className="text-sm text-gray-100 leading-relaxed"><HL text={value} /></p>
    </div>
  );
}

function DifficultyDots({ level, color }: { level: number; color: string }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: i < level ? color : 'rgba(255,255,255,0.2)' }}
        />
      ))}
    </div>
  );
}

// ── 적성 검사 컨텐츠 ──

const QUIZ_RESULT_MESSAGES: { minRatio: number; emoji: string; title: string; desc: string }[] = [
  { minRatio: 0.85, emoji: '🌟', title: '매우 높은 적합도', desc: '교과·활동·성과 준비도가 높아요. 이 유형에 강하게 도전해볼 만합니다.' },
  { minRatio: 0.7, emoji: '✨', title: '높은 적합도', desc: '핵심 역량이 잘 갖춰졌어요. 부족한 영역만 보완하면 경쟁력이 충분합니다.' },
  { minRatio: 0.55, emoji: '💡', title: '성장 가능 구간', desc: '기본 적성은 보입니다. 방과후 활동과 성과 기록을 더 촘촘히 채워보세요.' },
  { minRatio: 0.4, emoji: '🤔', title: '재점검 필요', desc: '일부 강점은 있지만 준비 편차가 큽니다. 학습/활동 루틴을 먼저 안정화해보세요.' },
  { minRatio: 0, emoji: '🔄', title: '다른 유형도 탐색', desc: '현재 준비도 기준으로는 다른 학교 유형이 더 잘 맞을 수 있어요.' },
];

function getResultMessage(ratio: number) {
  return QUIZ_RESULT_MESSAGES.find((m) => ratio >= m.minRatio) ?? QUIZ_RESULT_MESSAGES[QUIZ_RESULT_MESSAGES.length - 1];
}

const CHOICE_LETTERS = ['A', 'B', 'C', 'D'];
const CHOICE_ICONS = ['🎲', '🎵', '💬', '🤝'];

function AptitudeQuizContent({
  categoryColor,
  categoryBgColor,
  quizPhase,
  questions,
  onAnswer,
  onNext,
  onReset,
  onStart,
}: {
  categoryColor: string;
  categoryBgColor: string;
  quizPhase: QuizPhase;
  questions: QuizQuestion[];
  onAnswer: (choiceIndex: number, score: number, label: string, feedback?: string) => void;
  onNext: () => void;
  onReset: () => void;
  onStart: () => void;
}) {
  if (quizPhase.phase === 'intro') {
    return (
      <div className="px-4 py-5 flex flex-col items-center gap-4">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
          style={{
            background: `linear-gradient(135deg, ${categoryBgColor} 0%, rgba(0,0,0,0.3) 100%)`,
            border: `2px solid ${categoryColor}50`,
            boxShadow: `0 0 30px ${categoryColor}30`,
          }}
        >
          🎮
        </div>
        <div className="text-center">
          <h3 className="text-sm font-bold text-white mb-1.5">간단 적성 검사</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            교과·방과후·수상·실습 준비도를 점검해보세요
          </p>
        </div>
        <button
          onClick={onStart}
          className="w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
          style={{
            background: `linear-gradient(135deg, ${categoryColor} 0%, ${categoryColor}99 100%)`,
            color: '#fff',
            boxShadow: `0 4px 20px ${categoryColor}50`,
          }}
        >
          🚀 검사 시작
        </button>
      </div>
    );
  }

  const isFeedback = quizPhase.phase === 'feedback';
  const isQuestion = quizPhase.phase === 'question';

  if (isQuestion || isFeedback) {
    const { index, answers } = quizPhase;
    const selectedIdx = isFeedback ? quizPhase.selectedChoiceIndex : -1;
    const current = questions[index];
    const answeredCount = answers.length;
    const progress = Math.round((answeredCount / questions.length) * 100);
    const lastAnswer = isFeedback ? answers[answers.length - 1] : null;

    return (
      <div className="px-4 py-4 flex flex-col gap-3">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{current.emoji}</span>
            <span className="text-xs font-bold text-white">
              {current.focusArea} · Q{index + 1}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3" style={{ color: categoryColor }} />
            <span className="text-xs font-bold text-gray-300">
              {index + 1} / {questions.length}
            </span>
          </div>
        </div>

        {/* 세그먼트 진행 바 */}
        <div className="flex gap-0.5">
          {questions.map((_, i) => (
            <div
              key={i}
              className="flex-1 h-1 rounded-full transition-all duration-300"
              style={{
                background: i < answeredCount
                  ? categoryColor
                  : i === index
                  ? `${categoryColor}60`
                  : 'rgba(255,255,255,0.08)',
              }}
            />
          ))}
        </div>

        {/* 포커스 영역 뱃지 */}
        <div>
          <span
            className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: `${categoryColor}20`, color: categoryColor }}
          >
            {current.emoji} {current.focusArea}
          </span>
        </div>

        {/* 질문 카드 */}
        <div
          className="rounded-2xl p-4 flex flex-col gap-2"
          style={{
            background: `linear-gradient(135deg, ${categoryBgColor} 0%, rgba(0,0,0,0.4) 100%)`,
            border: `1px solid ${categoryColor}30`,
          }}
        >
          <span className="text-3xl">{current.emoji}</span>
          <p className="text-[10px] font-medium" style={{ color: categoryColor }}>{current.focusArea}</p>
          <p className="text-[13px] font-bold text-white leading-relaxed">{current.question}</p>
        </div>

        {/* 4지선다 */}
        <div className="space-y-2">
          {current.choices.map((choice, choiceIndex) => {
            const isSelected = isFeedback && choiceIndex === selectedIdx;
            return (
              <button
                key={choiceIndex}
                onClick={() => !isFeedback && onAnswer(choiceIndex, choice.score, choice.label, choice.feedback)}
                disabled={isFeedback}
                className="w-full px-3 py-3 rounded-xl text-left transition-all flex items-center gap-2.5"
                style={{
                  background: isSelected
                    ? `${categoryColor}15`
                    : 'rgba(255,255,255,0.04)',
                  border: isSelected
                    ? `2px solid ${categoryColor}`
                    : '1px solid rgba(255,255,255,0.10)',
                  opacity: isFeedback && !isSelected ? 0.45 : 1,
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 relative"
                  style={{
                    background: isSelected
                      ? `${categoryColor}30`
                      : 'rgba(255,255,255,0.06)',
                  }}
                >
                  <span className="text-base">{CHOICE_ICONS[choiceIndex] ?? '🔹'}</span>
                  <span
                    className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full text-[8px] font-black flex items-center justify-center"
                    style={{
                      background: isSelected ? categoryColor : 'rgba(255,255,255,0.15)',
                      color: isSelected ? '#fff' : 'rgba(255,255,255,0.6)',
                    }}
                  >
                    {CHOICE_LETTERS[choiceIndex]}
                  </span>
                </div>
                <p className="text-xs font-semibold leading-relaxed text-gray-100 flex-1">
                  {choice.label}
                </p>
                {isSelected && (
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: categoryColor }}
                  >
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* 피드백 카드 (선택 후) */}
        {isFeedback && lastAnswer && (
          <div className="flex flex-col gap-2.5">
            <div
              className="rounded-xl p-3"
              style={{
                background: `linear-gradient(135deg, ${categoryColor}15 0%, ${categoryColor}08 100%)`,
                border: `1px solid ${categoryColor}30`,
              }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{current.emoji}</span>
                  <span className="text-[10px] font-bold" style={{ color: categoryColor }}>
                    {current.focusArea} 분석 완료
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-3.5 h-3.5 rounded-full flex items-center justify-center"
                    style={{ background: categoryColor }}
                  >
                    <Check className="w-2 h-2 text-white" />
                  </div>
                  <span className="text-[10px] text-gray-500">{progress}%</span>
                </div>
              </div>
              {lastAnswer.feedback && (
                <p className="text-xs text-gray-200 leading-relaxed">
                  {lastAnswer.feedback}
                </p>
              )}
            </div>

            <button
              onClick={onNext}
              className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${categoryColor} 0%, ${categoryColor}cc 100%)`,
                color: '#fff',
                boxShadow: `0 4px 20px ${categoryColor}40`,
              }}
            >
              {index + 1 < questions.length ? '다음 문제로' : '결과 보기'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
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
    <div className="px-4 py-4 flex flex-col gap-3">
      {/* 결과 카드 */}
      <div
        className="rounded-2xl p-5 flex flex-col items-center gap-2.5 text-center"
        style={{
          background: `linear-gradient(135deg, ${categoryBgColor} 0%, rgba(0,0,0,0.4) 100%)`,
          border: `1px solid ${categoryColor}40`,
        }}
      >
        <span className="text-4xl">{result.emoji}</span>
        <div>
          <p className="text-base font-bold text-white mb-1">{result.title}</p>
          <p className="text-xs text-gray-300 leading-relaxed">{result.desc}</p>
        </div>
        <div className="flex items-center gap-1 mt-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className="w-5 h-5 transition-all"
              style={{
                fill: i < starScore ? categoryColor : 'transparent',
                color: i < starScore ? categoryColor : 'rgba(255,255,255,0.2)',
                filter: i < starScore ? `drop-shadow(0 0 4px ${categoryColor})` : 'none',
              }}
            />
          ))}
        </div>
        <p className="text-xs font-bold" style={{ color: categoryColor }}>
          {totalScore} / {normalizedMaxScore}점 ({Math.round(ratio * 100)}%)
        </p>
      </div>

      {/* 다시 하기 */}
      <button
        onClick={onReset}
        className="w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          color: '#9ca3af',
        }}
      >
        <RotateCcw className="w-3.5 h-3.5" />
        다시 검사하기
      </button>
    </div>
  );
}

function SchoolListCard({
  school,
  categoryColor,
  categoryBgColor,
  onClick,
}: {
  school: HighSchoolDetail;
  categoryColor: string;
  categoryBgColor: string;
  onClick: () => void;
}) {
  const difficultyText = HIGH_SCHOOL_LABELS.school_difficulty_levels[String(school.difficulty)] ?? '';
  const shortDesc = (school.teachingMethod ?? '').split(',')[0].trim();

  return (
    <button
      className="w-full text-left rounded-2xl overflow-hidden transition-all active:scale-[0.98] group"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      onClick={onClick}
    >
      <div className="px-3 py-3 flex items-center gap-3">
        {/* 좌측: 학교 아이콘 */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-105 transition-transform"
          style={{
            background: `linear-gradient(135deg, ${categoryBgColor} 0%, ${categoryColor}15 100%)`,
            border: `1.5px solid ${categoryColor}40`,
          }}
        >
          {school.emoji}
        </div>

        {/* 중앙: 학교 정보 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-sm font-bold text-white truncate">{school.name}</span>
            {school.ibCertified && (
              <span className="text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981' }}>
                IB
              </span>
            )}
            {school.dormitory && (
              <span className="text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(251,191,36,0.2)', color: '#fbbf24' }}>
                🏠
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 line-clamp-1 mb-1"><HL text={shortDesc} /></p>
          
          {/* 하단: 지역·난이도·정원 */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 flex-shrink-0 text-gray-500" />
              <span className="text-xs text-gray-500">{school.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <DifficultyDots level={school.difficulty} color={categoryColor} />
              <span className="text-xs text-gray-500">{difficultyText}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500">👥 {school.annualAdmission}명</span>
            </div>
          </div>
        </div>

        {/* 우측: 화살표 버튼 */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-all"
          style={{
            background: `linear-gradient(135deg, ${categoryColor}30, ${categoryColor}15)`,
            border: `1.5px solid ${categoryColor}50`,
          }}
        >
          <ChevronRight className="w-5 h-5" style={{ color: categoryColor }} />
        </div>
      </div>

      {/* 하단: 대표 프로그램 미리보기 (3개) */}
      {school.famousPrograms && school.famousPrograms.length > 0 && (
        <div
          className="px-3 pb-2.5 flex flex-wrap gap-1.5"
          style={{ background: 'rgba(255,255,255,0.02)' }}
        >
          {school.famousPrograms.slice(0, 3).map((prog, idx) => (
            <span
              key={idx}
              className="text-xs px-2 py-0.5 rounded-full text-gray-300"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              <HL text={prog} />
            </span>
          ))}
        </div>
      )}
    </button>
  );
}

/**
 * 2028 입시 방향성 + AI 방향성을 카테고리 단위로 보여주는 아코디언 패널.
 * 두 개의 탭으로 구성: 📋 2028 입시 / 🤖 AI 시대
 */
function CategoryDirectionPanel({ category }: { category: HighSchoolCategory }) {
  const [activeTab, setActiveTab] = useState<'admission2028' | 'aiEra'>('admission2028');
  const [expanded, setExpanded] = useState(false);

  const has2028 = !!(category.policyContext2028 || category.admissionStrategy2028);
  const hasAi = !!(category.aiEraContext || category.aiEraStrategy);
  if (!has2028 && !hasAi) return null;

  const TAB_META = [
    { id: 'admission2028' as const, label: '2028 입시 방향성', emoji: '📋', show: has2028 },
    { id: 'aiEra' as const, label: 'AI 시대 방향성', emoji: '🤖', show: hasAi },
  ].filter((t) => t.show);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(139,92,246,0.10) 100%)',
        border: `1.5px solid ${category.color}50`,
        boxShadow: `0 4px 20px ${category.color}20`,
      }}
    >
      {/* 헤더 (펼침 토글) */}
      <button
        type="button"
        onClick={() => setExpanded((s) => !s)}
        className="w-full px-4 py-3 flex items-center justify-between gap-2 transition-colors hover:bg-white/5"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">🎯</span>
          <p className="text-[13px] font-bold text-white text-left">
            2028 입시 + AI 방향성
          </p>
          <span
            className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
            style={{ background: `${category.color}25`, color: category.color, border: `1px solid ${category.color}40` }}
          >
            카테고리
          </span>
        </div>
        <ChevronDown
          className="w-4 h-4 transition-transform duration-300 flex-shrink-0"
          style={{
            color: category.color,
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-1 space-y-3" style={{ animation: 'slide-up 0.3s ease-out both' }}>
          {/* 탭 바 */}
          <div className="flex gap-1 rounded-xl p-1" style={{ background: 'rgba(255,255,255,0.06)' }}>
            {TAB_META.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                style={{
                  background: activeTab === tab.id ? `${category.color}40` : 'transparent',
                  color: activeTab === tab.id ? category.color : 'rgba(255,255,255,0.6)',
                  boxShadow: activeTab === tab.id ? `0 2px 8px ${category.color}30` : 'none',
                }}
              >
                <span>{tab.emoji}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* 컨텐츠: 2028 입시 */}
          {activeTab === 'admission2028' && (
            <div className="space-y-2.5">
              {category.policyContext2028 && (
                <div
                  className="rounded-xl p-3"
                  style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${category.color}30` }}
                >
                  <p className="text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: category.color }}>
                    📌 정책 컨텍스트
                  </p>
                  <p className="text-xs text-gray-200 leading-relaxed">
                    <HL text={category.policyContext2028} />
                  </p>
                </div>
              )}
              {category.admissionStrategy2028 && (
                <div
                  className="rounded-xl p-3"
                  style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${category.color}30` }}
                >
                  <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: category.color }}>
                    🎯 {category.admissionStrategy2028.title}
                  </p>
                  <p className="text-xs text-gray-300 leading-relaxed mb-2">
                    <HL text={category.admissionStrategy2028.summary} />
                  </p>
                  <ul className="space-y-1.5">
                    {category.admissionStrategy2028.points.map((point, i) => {
                      const isObj = typeof point === 'object' && point !== null;
                      const text = isObj ? `${point.label} — ${point.detail}` : point;
                      return (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-xs text-gray-200 leading-relaxed"
                        >
                          <span className="flex-shrink-0 mt-0.5" style={{ color: category.color }}>▸</span>
                          <span><HL text={text} /></span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
              {category.admissionStrategy2028?.tracks && (
                <div
                  className="rounded-xl p-3"
                  style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${category.color}30` }}
                >
                  <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: category.color }}>
                    🎓 전형별 전략 (수시·정시·면접)
                  </p>
                  <div className="space-y-2">
                    {([
                      ['수시', category.admissionStrategy2028.tracks.susi],
                      ['정시', category.admissionStrategy2028.tracks.jeongsi],
                      ['면접', category.admissionStrategy2028.tracks.interview],
                    ] as const).map(([label, track]) =>
                      track ? (
                        <div key={label} className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                          <p className="text-xs font-bold mb-0.5" style={{ color: category.color }}>{label}</p>
                          <p className="text-xs text-gray-200 leading-relaxed">
                            <span className="font-semibold text-gray-100">유리한 점 · </span>
                            <HL text={track.advantage} />
                          </p>
                          <p className="text-xs text-gray-300 leading-relaxed mt-0.5">
                            <span className="font-semibold text-gray-100">전략 · </span>
                            <HL text={track.strategy} />
                          </p>
                        </div>
                      ) : null,
                    )}
                  </div>
                </div>
              )}
              {category.admissionStrategy2028?.byGrade && (
                <div
                  className="rounded-xl p-3"
                  style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${category.color}30` }}
                >
                  <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: category.color }}>
                    📊 내신 성적대별 전략
                  </p>
                  <div className="space-y-2">
                    {category.admissionStrategy2028.byGrade.top && (
                      <div
                        className="p-2 rounded-lg"
                        style={{ background: 'rgba(52,211,153,0.10)', border: '1px solid rgba(52,211,153,0.30)' }}
                      >
                        <p className="text-xs font-bold text-emerald-300 mb-0.5">내신 상위권</p>
                        <p className="text-xs text-gray-200 leading-relaxed">
                          <HL text={category.admissionStrategy2028.byGrade.top} />
                        </p>
                      </div>
                    )}
                    {category.admissionStrategy2028.byGrade.mid && (
                      <div
                        className="p-2 rounded-lg"
                        style={{ background: 'rgba(96,165,250,0.10)', border: '1px solid rgba(96,165,250,0.30)' }}
                      >
                        <p className="text-xs font-bold text-blue-300 mb-0.5">내신 중위권</p>
                        <p className="text-xs text-gray-200 leading-relaxed">
                          <HL text={category.admissionStrategy2028.byGrade.mid} />
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {category.admissionStrategy2028?.perks && category.admissionStrategy2028.perks.length > 0 && (
                <div
                  className="rounded-xl p-3"
                  style={{ background: 'rgba(251,191,36,0.10)', border: '1px solid rgba(251,191,36,0.35)' }}
                >
                  <p className="text-xs font-bold uppercase tracking-wider mb-2 text-yellow-300">
                    🎁 이 유형만의 특혜·혜택
                  </p>
                  <ul className="space-y-1.5">
                    {category.admissionStrategy2028.perks.map((perk, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-200 leading-relaxed">
                        <span className="flex-shrink-0 mt-0.5 text-yellow-300">✓</span>
                        <span><HL text={perk} /></span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* 컨텐츠: AI 시대 */}
          {activeTab === 'aiEra' && (
            <div className="space-y-2.5">
              {category.aiEraContext && (
                <div
                  className="rounded-xl p-3"
                  style={{ background: 'rgba(168,85,247,0.10)', border: '1px solid rgba(168,85,247,0.35)' }}
                >
                  <p className="text-xs font-bold uppercase tracking-wider mb-1.5 text-purple-300">
                    🤖 AI 시대 컨텍스트
                  </p>
                  <p className="text-xs text-gray-200 leading-relaxed">
                    <HL text={category.aiEraContext} />
                  </p>
                </div>
              )}
              {category.aiEraStrategy && (
                <div
                  className="rounded-xl p-3"
                  style={{ background: 'rgba(168,85,247,0.10)', border: '1px solid rgba(168,85,247,0.35)' }}
                >
                  <p className="text-xs font-bold uppercase tracking-wider mb-1 text-purple-300">
                    ⚡ {category.aiEraStrategy.title}
                  </p>
                  <p className="text-xs text-gray-300 leading-relaxed mb-2">
                    <HL text={category.aiEraStrategy.summary} />
                  </p>
                  {category.aiEraStrategy.practicalTips && category.aiEraStrategy.practicalTips.length > 0 && (
                    <div className="space-y-1.5 mt-2">
                      {category.aiEraStrategy.practicalTips.slice(0, 4).map((tip, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 text-xs text-gray-200 leading-relaxed p-2 rounded-lg"
                          style={{ background: 'rgba(255,255,255,0.04)' }}
                        >
                          <span className="text-base flex-shrink-0">{tip.emoji}</span>
                          <div className="min-w-0">
                            <p className="font-bold text-purple-200"><HL text={tip.tip} /></p>
                            <p className="text-xs text-gray-300 leading-relaxed"><HL text={tip.detail} /></p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {category.aiEraStrategy.futureCareerInsight && (
                    <div
                      className="mt-2.5 p-2.5 rounded-lg"
                      style={{ background: 'rgba(251,191,36,0.10)', border: '1px solid rgba(251,191,36,0.35)' }}
                    >
                      <p className="text-xs font-bold text-yellow-300 mb-0.5">
                        💡 {category.aiEraStrategy.futureCareerInsight.title}
                      </p>
                      <p className="text-xs text-gray-200 leading-relaxed">
                        <HL text={category.aiEraStrategy.futureCareerInsight.reality} />
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
