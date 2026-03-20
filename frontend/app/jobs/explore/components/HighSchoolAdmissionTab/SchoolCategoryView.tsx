'use client';

import { useState } from 'react';
import {
  ChevronLeft, ChevronRight, MapPin, BookOpen, Brain, Dumbbell, Star, Target, Clock,
  ChevronDown, CheckCircle, Circle, RotateCcw, Zap, Users, Lightbulb,
} from 'lucide-react';
import type { HighSchoolCategory, HighSchoolDetail } from '../../types';
import { HIGH_SCHOOL_LABELS } from '../../config';
import { CATEGORY_TRAIT_DETAIL, type QuizQuestion } from './category-trait-detail-config';

type SchoolCategoryViewProps = {
  category: HighSchoolCategory;
  onBack: () => void;
  onSelectSchool: (school: HighSchoolDetail) => void;
};

export const TRAIT_ITEMS = [
  { key: 'aptitude' as const, icon: <Brain className="w-3.5 h-3.5" />, label: '🧠 적성', emoji: '🧠' },
  { key: 'studyStyle' as const, icon: <BookOpen className="w-3.5 h-3.5" />, label: '📖 공부 스타일', emoji: '📖' },
  { key: 'mentalStrength' as const, icon: <Dumbbell className="w-3.5 h-3.5" />, label: '💪 멘탈 강도', emoji: '💪' },
  { key: 'gradeRequirement' as const, icon: <Star className="w-3.5 h-3.5" />, label: '📊 내신 기준', emoji: '📊' },
  { key: 'aptitudeTest' as const, icon: <Target className="w-3.5 h-3.5" />, label: '🎯 적성 검사', emoji: '🎯' },
  { key: 'internalGradeStrategy' as const, icon: <Clock className="w-3.5 h-3.5" />, label: '📅 내신 전략', emoji: '📅' },
];

type QuizPhase =
  | { phase: 'intro' }
  | { phase: 'question'; index: number; answers: { choiceIndex: number; score: number; label: string; feedback?: string }[] }
  | { phase: 'result'; totalScore: number; maxScore: number; answers: { choiceIndex: number; score: number; label: string; feedback?: string }[] };

export function SchoolCategoryView({ category, onBack, onSelectSchool }: SchoolCategoryViewProps) {
  const [showTraitDetail, setShowTraitDetail] = useState(false);
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

  return (
    <div className="space-y-4">
      {/* ── 상단: 헤더 + 특성 카드 (강조) ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-95"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            <ChevronLeft className="w-4 h-4 text-gray-300" />
          </button>
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
              <p className="text-base font-bold text-white leading-tight">{category.name}</p>
              <p className="text-xs mt-1 leading-snug" style={{ color: category.color }}>{category.description}</p>
            </div>
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
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: category.color }}>
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
          onClick={() => setShowTraitDetail(prev => !prev)}
          className="w-full py-3 flex items-center justify-center gap-2 text-xs font-bold transition-all active:scale-[0.99]"
          style={{
            background: `${category.color}18`,
            borderTop: `1.5px solid ${category.color}30`,
            color: category.color,
          }}
        >
          {HIGH_SCHOOL_LABELS.school_trait_detail_button}
          <ChevronDown
            className="w-4 h-4 transition-transform duration-300"
            style={{ transform: showTraitDetail ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        </button>
        </div>
      </div>

      {/* 아코디언: 특성 상세 */}
      {showTraitDetail && (
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: `1.5px solid ${category.color}30`,
            animation: 'slide-up 0.3s ease-out both',
          }}
        >
          <div className="px-4 py-4 space-y-3">
            {/* 6개 특성 그리드 */}
            <div className="grid grid-cols-2 gap-2">
              {TRAIT_ITEMS.map((item, idx) => (
                <div
                  key={item.key}
                  className="rounded-xl p-3 flex flex-col gap-1.5 transition-all hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg, ${category.bgColor} 0%, rgba(0,0,0,0.2) 100%)`,
                    border: `1px solid ${category.color}30`,
                    animation: `slide-up 0.3s ease-out ${idx * 0.05}s both`,
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg">{item.emoji}</span>
                    <span className="text-[11px] font-bold" style={{ color: category.color }}>
                      {item.label.replace(/^[^ ]+ /, '')}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-300 leading-relaxed">
                    {category.categoryTraits[item.key]}
                  </p>
                </div>
              ))}
            </div>

            {/* 자존감 경고 */}
            {content.selfEsteemEmphasis && (
              <div
                className="rounded-xl p-3"
                style={{
                  background: 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(185,28,28,0.08) 100%)',
                  border: '1px solid rgba(239,68,68,0.4)',
                }}
              >
                <p className="text-[11px] font-bold text-red-400 mb-1.5 flex items-center gap-1.5">
                  ❤️‍🔥 자존감이 낮으면 위험해요
                </p>
                <p className="text-[11px] text-gray-200 leading-relaxed">{content.selfEsteemEmphasis}</p>
              </div>
            )}
          </div>
        </div>
      )}

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
            className="w-full py-3 flex items-center justify-center gap-2 text-xs font-bold transition-all active:scale-[0.99]"
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
              style={{ animation: 'slide-up 0.3s ease-out both' }}
            >
              <AptitudeQuizContent
                categoryColor={category.color}
                categoryBgColor={category.bgColor}
                quizPhase={quizPhase}
                questions={content.quizQuestions}
                onAnswer={handleQuizAnswer}
                onReset={() => setQuizPhase({ phase: 'intro' })}
                onStart={() => setQuizPhase({ phase: 'question', index: 0, answers: [] })}
              />
            </div>
          )}
        </div>
      )}

      {/* ── 학교 목록 (단순화) ── */}
      <div>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
          {category.schools.length}{HIGH_SCHOOL_LABELS.school_list_section_title} · {HIGH_SCHOOL_LABELS.school_list_click_hint}
        </p>
        <div className="space-y-2">
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
        className="flex items-center gap-1 flex-shrink-0 mt-0.5 px-1.5 py-0.5 rounded-lg"
        style={{ background: `${color}15` }}
      >
        <span className="text-[12px]">{emoji}</span>
        <span className="text-[12px] font-bold whitespace-nowrap" style={{ color }}>{label.replace(/^[^ ]+ /, '')}</span>
      </div>
      <p className="text-[12px] text-gray-300 leading-relaxed">{value}</p>
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

function AptitudeQuizContent({
  categoryColor,
  categoryBgColor,
  quizPhase,
  questions,
  onAnswer,
  onReset,
  onStart,
}: {
  categoryColor: string;
  categoryBgColor: string;
  quizPhase: QuizPhase;
  questions: QuizQuestion[];
  onAnswer: (choiceIndex: number, score: number, label: string, feedback?: string) => void;
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
          <p className="text-[11px] text-gray-400 leading-relaxed">
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

  if (quizPhase.phase === 'question') {
    const { index, answers } = quizPhase;
    const current = questions[index];
    const progress = (answers.length / questions.length) * 100;

    return (
      <div className="px-4 py-4 flex flex-col gap-3">
        {/* 진행 바 */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-gray-400">
              {index + 1} / {questions.length}
            </span>
            <span className="text-[11px] text-gray-500">
              {Math.round(progress)}% 완료
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div
              className="h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${categoryColor} 0%, ${categoryColor}99 100%)`,
                boxShadow: `0 0 8px ${categoryColor}60`,
              }}
            />
          </div>
        </div>

        {/* 질문 카드 */}
        <div
          className="rounded-2xl p-4 flex flex-col items-center gap-3 text-center"
          style={{
            background: `linear-gradient(135deg, ${categoryBgColor} 0%, rgba(0,0,0,0.4) 100%)`,
            border: `1px solid ${categoryColor}40`,
          }}
        >
          <span className="text-4xl">{current.emoji}</span>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: `${categoryColor}28`, color: categoryColor }}
          >
            {current.focusArea}
          </span>
          <p className="text-[13px] font-semibold text-white leading-relaxed">{current.question}</p>
        </div>

        {/* 4지선다 */}
        <div className="space-y-2">
          {current.choices.map((choice, choiceIndex) => {
            const choiceColor = choice.score >= 2 ? '#22c55e' : choice.score === 1 ? '#f59e0b' : '#ef4444';
            return (
              <button
                key={choiceIndex}
                onClick={() => onAnswer(choiceIndex, choice.score, choice.label, choice.feedback)}
                className="w-full px-3 py-2.5 rounded-xl text-left transition-all active:scale-[0.98] hover:scale-[1.01]"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${choiceColor}55`,
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[11px] font-semibold leading-relaxed text-gray-100">{choice.label}</p>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0"
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
          <p className="text-[11px] text-gray-300 leading-relaxed">{result.desc}</p>
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
        <p className="text-[11px] font-bold" style={{ color: categoryColor }}>
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
  const shortDesc = school.teachingMethod.split(',')[0].trim();

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
              <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981' }}>
                IB
              </span>
            )}
            {school.dormitory && (
              <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(251,191,36,0.2)', color: '#fbbf24' }}>
                🏠
              </span>
            )}
          </div>
          <p className="text-[12px] text-gray-400 line-clamp-1 mb-1">{shortDesc}</p>
          
          {/* 하단: 지역·난이도·정원 */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 flex-shrink-0 text-gray-500" />
              <span className="text-[12px] text-gray-500">{school.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <DifficultyDots level={school.difficulty} color={categoryColor} />
              <span className="text-[12px] text-gray-500">{difficultyText}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[12px] text-gray-500">👥 {school.annualAdmission}명</span>
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
              className="text-[11px] px-2 py-0.5 rounded-full text-gray-300"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              {prog}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}
